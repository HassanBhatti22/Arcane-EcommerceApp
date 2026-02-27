const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');

// @desc    Create Stripe Checkout Session
// @route   POST /api/checkout
// @access  Public / Private
const createCheckoutSession = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in cart" });
        }

        // Map frontend items to Stripe line_items format
        const line_items = items.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`] : [],
                    metadata: {
                        productId: item.productId // Pass product ID to webhook
                    }
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
        }));

        // Session Config
        const sessionConfig = {
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB'], // Add more as needed
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: { amount: 999, currency: 'usd' }, // $9.99 shipping
                        display_name: 'Standard Shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 5 },
                            maximum: { unit: 'business_day', value: 7 },
                        },
                    },
                },
            ],
            line_items,
            mode: 'payment',
            success_url: `http://localhost:3000/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/cart?canceled=true`,
        };

        // Pass user ID if logged in (omit entirely if guest, otherwise Stripe errors)
        if (req.user && req.user._id) {
            sessionConfig.client_reference_id = req.user._id.toString();
        }

        // Create the Checkout Session
        const session = await stripe.checkout.sessions.create(sessionConfig);

        res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        res.status(500).json({ message: "Failed to create checkout session", error: error.message, stack: error.stack });
    }
};

// @desc    Confirm order after Stripe redirect (no webhook needed)
// @route   POST /api/stripe/confirm-order
// @access  Public
const confirmOrderFromSession = async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required' });
        }

        // Check if order already exists for this session (idempotency)
        const existingOrder = await Order.findOne({ 'paymentResult.id': sessionId });
        if (existingOrder) {
            return res.status(200).json({ message: 'Order already exists', order: existingOrder });
        }

        // Retrieve the Stripe session — shipping_details is included by default, do NOT expand it
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        // Build order items from Stripe session line items
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
            expand: ['data.price.product']
        });

        const orderItems = lineItems.data.map(item => {
            const rawProductId = item.price.product.metadata?.productId;
            // Only use it as a product ref if it's a valid MongoDB ObjectId
            const validProductId = rawProductId && mongoose.Types.ObjectId.isValid(rawProductId)
                ? rawProductId
                : null;
            return {
                name: item.price.product.name,
                qty: item.quantity,
                image: (item.price.product.images && item.price.product.images[0]) || '',
                price: item.price.unit_amount / 100,
                ...(validProductId && { product: validProductId })
            };
        });

        // Build shipping address (Stripe uses shipping_details or customer_details depending on config)
        const addressSource = session.shipping_details?.address || session.customer_details?.address;
        const shippingAddress = addressSource ? {
            address: addressSource.line1 + (addressSource.line2 ? ` ${addressSource.line2}` : ''),
            city: addressSource.city || 'N/A',
            postalCode: addressSource.postal_code || 'N/A',
            country: addressSource.country || 'N/A',
        } : { address: 'N/A', city: 'N/A', postalCode: 'N/A', country: 'N/A' };

        const newOrder = new Order({
            user: session.client_reference_id || null,
            orderItems,
            shippingAddress,
            paymentMethod: 'Stripe',
            itemsPrice: session.amount_subtotal / 100,
            shippingPrice: (session.total_details?.amount_shipping || 0) / 100,
            totalPrice: session.amount_total / 100,
            isPaid: true,
            paidAt: Date.now(),
            paymentResult: {
                id: session.id,
                status: session.payment_status,
                email_address: session.customer_details?.email || ''
            }
        });

        const savedOrder = await newOrder.save();
        console.log(`✅ Order ${savedOrder._id} created from session ${sessionId}`);

        // Extract email (fallback from Stripe customer or shipping)
        const customerEmail = session.customer_details?.email || session.customer_email || null;

        if (customerEmail) {
            // Send order confirmation email
            const emailHtml = `
                <h2>Order Confirmed!</h2>
                <p>Thank you for your purchase from Arcane.</p>
                <p><strong>Order ID:</strong> ${savedOrder._id}</p>
                <p><strong>Total Paid:</strong> $${savedOrder.totalPrice.toFixed(2)}</p>
                <p>We'll notify you when your items are shipped.</p>
            `;
            // Call asynchronously without blocking the response
            sendEmail({
                to: customerEmail,
                subject: 'Arcane - Order Confirmation',
                html: emailHtml
            }).catch(e => console.error("Email error:", e));
        }

        res.status(201).json({ message: 'Order created successfully', order: savedOrder });
    } catch (error) {
        console.error('Confirm order error:', error);
        res.status(500).json({ message: 'Failed to confirm order', error: error.message });
    }
};

// @desc    Stripe Webhook to handle successful payments
// @route   POST /api/webhook
// @access  Public (Called by Stripe)
const webhook = async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];

    // IMPORTANT: Make sure to define STRIPE_WEBHOOK_SECRET in arcane-backend/.env
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        } else {
            // Fallback for local testing without webhook secret
            event = JSON.parse(req.body.toString());
        }
    } catch (err) {
        console.error("Webhook signature verification failed.", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        try {
            // Retrieve line items since they are not fully populated in the session object
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price.product'] });

            // Create Order items from Stripe line items
            const orderItems = lineItems.data.map(item => ({
                name: item.price.product.name,
                qty: item.quantity,
                image: item.price.product.images[0] || '',
                price: item.price.unit_amount / 100,
                product: item.price.product.metadata.productId // Reconstruct product ID
            }));

            const shippingDetails = session.shipping_details;
            const shippingAddress = {
                address: shippingDetails.address.line1 + (shippingDetails.address.line2 ? ` ${shippingDetails.address.line2}` : ''),
                city: shippingDetails.address.city,
                postalCode: shippingDetails.address.postal_code,
                country: shippingDetails.address.country,
            };

            const newOrder = new Order({
                user: session.client_reference_id || null, // Guest checkout if null
                orderItems,
                shippingAddress,
                paymentMethod: 'Stripe',
                itemsPrice: (session.amount_subtotal / 100),
                shippingPrice: session.total_details.amount_shipping / 100,
                totalPrice: (session.amount_total / 100),
                isPaid: true,
                paidAt: Date.now(),
                paymentResult: {
                    id: session.payment_intent,
                    status: session.payment_status,
                    email_address: session.customer_details.email
                }
            });

            const savedOrder = await newOrder.save();
            console.log(`Order ${savedOrder._id} successfully created via Webhook!`);

        } catch (error) {
            console.error("Failed to process webhook order creation:", error);
            // Even if DB fails, return 200 to Stripe so it doesn't infinitely retry unless you want it to
            return res.status(500).end();
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).end();
};

module.exports = {
    createCheckoutSession,
    confirmOrderFromSession,
    webhook
};
