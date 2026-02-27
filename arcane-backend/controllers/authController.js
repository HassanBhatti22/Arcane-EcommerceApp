const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate email verification token
        const crypto = require('crypto');
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(verifyToken).digest('hex');

        // Create user as unverified
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            isVerified: false,
            emailVerificationToken: tokenHash,
            emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        if (user) {
            // Send verification email in the background
            const verifyUrl = `http://localhost:3000/auth/verify-email?token=${verifyToken}&email=${email}`;
            sendEmail({
                to: user.email,
                subject: 'Arcane - Verify Your Email Address',
                html: `
                    <h2>Welcome to Arcane, ${user.name}!</h2>
                    <p>Please verify your email address to complete your registration.</p>
                    <p>This link expires in 24 hours.</p>
                    <p><a href="${verifyUrl}" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;display:inline-block;">Verify My Email</a></p>
                    <p>If you didn't create an account, you can ignore this email.</p>
                `
            }).catch(e => console.error('Verification email error:', e));

            res.status(201).json({
                message: 'Account created! Please check your email to verify your account before logging in.',
                email: user.email,
                requiresVerification: true
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Block login if email not verified
            if (!user.isVerified) {
                return res.status(403).json({
                    message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
                    requiresVerification: true,
                    email: user.email
                });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: generateToken(user._id),
                createdAt: user.createdAt
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { token, email } = req.query;

        if (!token || !email) {
            return res.status(400).json({ message: 'Invalid verification link.' });
        }

        const crypto = require('crypto');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Verification link is invalid or has expired.' });
        }

        if (user.isVerified) {
            return res.json({ message: 'Email is already verified successfully! You can now log in.' });
        }

        if (user.emailVerificationToken !== tokenHash || user.emailVerificationExpire < Date.now()) {
            return res.status(400).json({ message: 'Verification link is invalid or has expired.' });
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        // Now send the welcome email
        sendEmail({
            to: user.email,
            subject: 'Welcome to Arcane! 🛍️',
            html: `
                <h2>You're verified! Welcome to Arcane, ${user.name}!</h2>
                <p>Your email has been confirmed. You can now log in and start shopping.</p>
                <p><a href="http://localhost:3000/auth" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;display:inline-block;">Log In Now</a></p>
            `
        }).catch(e => console.error('Welcome email error:', e));

        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').populate('wishlist');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add to wishlist
// @route   POST /api/auth/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        // Validate that productId is a valid MongoDB ObjectId
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID. Only products from the database can be wishlisted.' });
        }

        const user = await User.findById(req.user._id);

        const alreadyInWishlist = user.wishlist.some(id => id.toString() === productId);
        if (!alreadyInWishlist) {
            user.wishlist.push(productId);
            await user.save();
        }

        const updatedUser = await User.findById(req.user._id).select('-password').populate('wishlist');
        res.json(updatedUser.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove from wishlist
// @route   DELETE /api/auth/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        // Validate that productId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid product ID.' });
        }

        const user = await User.findById(req.user._id);

        user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.id);
        await user.save();

        const updatedUser = await User.findById(req.user._id).select('-password').populate('wishlist');
        res.json(updatedUser.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add address
// @route   POST /api/auth/address
// @access  Private
const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // If this is the first address, make it default
        if (user.addresses.length === 0) {
            req.body.isDefault = true;
        }

        // If new address is set to default, unset others
        if (req.body.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push(req.body);
        await user.save();

        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update address
// @route   PUT /api/auth/address/:id
// @access  Private
const updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const address = user.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // If setting to default, unset others
        if (req.body.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        Object.assign(address, req.body);
        await user.save();

        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete address
// @route   DELETE /api/auth/address/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
        await user.save();

        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user reviews
// @route   GET /api/auth/reviews
// @access  Private
const getUserReviews = async (req, res) => {
    try {
        const products = await Product.find({ 'reviews.user': req.user._id });

        let userReviews = [];
        products.forEach(product => {
            const reviews = product.reviews.filter(review => review.user.toString() === req.user._id.toString());
            reviews.forEach(review => {
                userReviews.push({
                    _id: review._id,
                    id: review._id,
                    productId: product._id,
                    productName: product.name,
                    productImage: product.images[0],
                    rating: review.rating,
                    comment: review.comment,
                    createdAt: review.createdAt,
                    // helpful: 0 // Not implemented yet
                });
            });
        });

        res.json(userReviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot password — send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal whether the email exists
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        // Generate a random token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = tokenHash;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}&email=${email}`;

        await sendEmail({
            to: user.email,
            subject: 'Arcane - Password Reset Request',
            html: `
                <h2>Password Reset Request</h2>
                <p>Hi ${user.name}, we received a request to reset your Arcane account password.</p>
                <p>Click the button below within the next 15 minutes:</p>
                <p><a href="${resetUrl}" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;display:inline-block;">Reset My Password</a></p>
                <p>If you didn't request this, you can safely ignore this email.</p>
            `
        });

        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token, email, password } = req.body;

        const crypto = require('crypto');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            email,
            resetPasswordToken: tokenHash,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        // Hash new password and clear token
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
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
};
