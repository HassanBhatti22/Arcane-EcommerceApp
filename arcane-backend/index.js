const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Config
const connectDB = require('./config/db');

// Routes
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// 1. App Initialize
const app = express();

// 2. Database Connection
connectDB();

// 3. Middleware
app.use(cors());

// Stripe Webhook MUST be placed before express.json() because it needs the raw body to verify signatures.
const stripeController = require('./controllers/stripeController');
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeController.webhook);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

const stripeRoutes = require('./routes/stripeRoutes');
app.use('/api/stripe', stripeRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('ARCANE E-commerce API is running...');
});

// API Root Route - List all endpoints
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the ARCANE API!',
        status: 'running',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/me',
                addToWishlist: 'POST /api/auth/wishlist',
                removeFromWishlist: 'DELETE /api/auth/wishlist/:id',
                addAddress: 'POST /api/auth/address',
                updateAddress: 'PUT /api/auth/address/:id',
                deleteAddress: 'DELETE /api/auth/address/:id',
                getReviews: 'GET /api/auth/reviews',
                forgotPassword: 'POST /api/auth/forgot-password',
                resetPassword: 'POST /api/auth/reset-password'
            },
            products: {
                getAll: 'GET /api/products',
                getById: 'GET /api/products/:id',
                create: 'POST /api/products (Admin)',
                update: 'PUT /api/products/:id (Admin)',
                delete: 'DELETE /api/products/:id (Admin)',
                addReview: 'POST /api/products/:id/reviews'
            },
            orders: {
                create: 'POST /api/orders',
                getMyOrders: 'GET /api/orders/myorders',
                getById: 'GET /api/orders/:id',
                getAll: 'GET /api/orders (Admin)',
                updateToPaid: 'PUT /api/orders/:id/pay',
                updateStatus: 'PUT /api/orders/:id/status (Admin)'
            },
            stripe: {
                checkout: 'POST /api/stripe/checkout',
                confirmOrder: 'POST /api/stripe/confirm-order',
                webhook: 'POST /api/stripe/webhook'
            },
            dashboard: {
                getStats: 'GET /api/dashboard/stats (Admin)'
            },
            upload: {
                uploadImage: 'POST /api/upload (Admin)'
            }
        }
    });
});

// 5. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});