const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/upload/product-image
// @desc    Upload a single product image
// @access  Private/Admin
router.post('/product-image', protect, admin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the URL path to access the uploaded image
        const imageUrl = `/uploads/products/${req.file.filename}`;

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
});

// @route   POST /api/upload/product-images
// @desc    Upload multiple product images (up to 3)
// @access  Private/Admin
router.post('/product-images', protect, admin, upload.array('images', 3), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Return array of image URLs
        const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);

        res.status(200).json({
            message: `${req.files.length} images uploaded successfully`,
            imageUrls: imageUrls,
            filenames: req.files.map(f => f.filename)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading images', error: error.message });
    }
});

module.exports = router;
