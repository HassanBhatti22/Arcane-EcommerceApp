const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview } = require('../controllers/productController');
const upload = require('../config/cloudinaryConfig');
const { protect, admin } = require('../Middleware/authMiddleware');
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, upload.single('image'), createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;
