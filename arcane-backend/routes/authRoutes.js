const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getProfile,
    addToWishlist,
    removeFromWishlist,
    addAddress,
    updateAddress,
    deleteAddress,
    getUserReviews,
    forgotPassword,
    resetPassword,
    verifyEmail
} = require('../controllers/authController');
const { protect } = require('../Middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getProfile);

// Wishlist
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:id', protect, removeFromWishlist);

// Address
router.post('/address', protect, addAddress);
router.put('/address/:id', protect, updateAddress);
router.delete('/address/:id', protect, deleteAddress);

// Reviews
router.get('/reviews', protect, getUserReviews);

// Password Reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Email Verification
router.get('/verify-email', verifyEmail);

module.exports = router;
