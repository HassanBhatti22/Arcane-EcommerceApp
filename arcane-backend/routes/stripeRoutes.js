const express = require('express');
const router = express.Router();
const { createCheckoutSession, confirmOrderFromSession, webhook } = require('../controllers/stripeController');
const { optionalAuth } = require('../Middleware/authMiddleware');

// Route to create Stripe session (supports guest checkout)
router.post('/checkout', optionalAuth, createCheckoutSession);

// Route to confirm an order after successful Stripe redirect (no webhook required)
router.post('/confirm-order', optionalAuth, confirmOrderFromSession);

// Note: The webhook route doesn't go here because it needs `express.raw()` body parser.
// It's typically mounted directly in `index.js` BEFORE `express.json()`.

module.exports = router;
