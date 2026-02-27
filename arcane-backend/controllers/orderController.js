const Order = require('../models/Order');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Validate product IDs
        const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
        const invalidItems = orderItems.filter(item => !isValidObjectId(item.product));

        if (invalidItems.length > 0) {
            console.error("Invalid product IDs found:", invalidItems);
            return res.status(400).json({
                message: 'One or more items in your cart are not valid products for unstable reasons (e.g. mock data). Please clear your cart and try adding real products.',
                invalidItems
            });
        }

        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice
        });

        const createdOrder = await order.save();

        // Send order confirmation email for COD orders
        if (req.user && req.user.email) {
            const emailHtml = `
                <h2> Your Order Has Been Placed! (Cash on Delivery)</h2>
                <p>Thank you for your purchase from Arcane.</p>
                <p><strong>Order ID:</strong> ${createdOrder._id}</p>
                <p><strong>Total to Pay:</strong> $${createdOrder.totalPrice.toFixed(2)}</p>
                <p>Please have the exact amount ready upon delivery ThankYou!</p>
            `;
            sendEmail({
                to: req.user.email,
                subject: 'Arcane - COD Order Confirmation',
                html: emailHtml
            }).catch(e => console.error("Email error:", e));
        }

        res.status(201).json(createdOrder);
    } catch (err) {
        console.error("Order creation failed:", err);
        res.status(500).json({
            message: "Failed to create order",
            error: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address
            };

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { isPaid, isDelivered } = req.body;
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (isPaid !== undefined) {
            order.isPaid = isPaid;
            if (isPaid) {
                order.paidAt = Date.now();
            }
        }

        if (isDelivered !== undefined) {
            order.isDelivered = isDelivered;
            if (isDelivered) {
                order.deliveredAt = Date.now();
            }
        }

        const updatedOrder = await order.save();

        // Send email notification to customer when status changes
        const customerEmail = order.user?.email;
        const customerName = order.user?.name || 'Customer';
        if (customerEmail) {
            let emailSubject = '';
            let emailHtml = '';
            const orderId = updatedOrder._id.toString().slice(-8).toUpperCase();
            const totalPrice = updatedOrder.totalPrice.toFixed(2);

            if (isDelivered === true) {
                emailSubject = 'Arcane - Your Order Has Been Delivered! 📦';
                emailHtml = `
                    <h2>Your order has been delivered, ${customerName}!</h2>
                    <p><strong>Order ID:</strong> #${orderId}</p>
                    <p><strong>Total Paid:</strong> $${totalPrice}</p>
                    <p>We hope you enjoy your purchase! Please leave a review on our website.</p>
                    <p><a href="http://localhost:3000/account/orders" style="background:#000;color:#fff;padding:10px 20px;text-decoration:none;">View Order</a></p>
                `;
            } else if (isPaid === true && !isDelivered) {
                emailSubject = 'Arcane - Your Order Is Now In Transit 🚚';
                emailHtml = `
                    <h2>Great news, ${customerName}! Your order is on its way.</h2>
                    <p><strong>Order ID:</strong> #${orderId}</p>
                    <p><strong>Total:</strong> $${totalPrice}</p>
                    <p>Your order has been confirmed and is now in transit. We'll notify you when it's delivered.</p>
                    <p><a href="http://localhost:3000/account/orders" style="background:#000;color:#fff;padding:10px 20px;text-decoration:none;">Track Order</a></p>
                `;
            }

            if (emailSubject) {
                sendEmail({ to: customerEmail, subject: emailSubject, html: emailHtml })
                    .catch(e => console.error('Status email error:', e));
            }
        }

        res.json({ message: '✅ Order status updated', order: updatedOrder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderToPaid,
    getAllOrders,
    updateOrderStatus
};
