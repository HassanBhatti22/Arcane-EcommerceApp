const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { category, search, sort } = req.query;

        // Build query
        let query = {};

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query
        let products = await Product.find(query).lean();

         //Apply 25% discount to electronics
        products = products.map(product => {
            if (product.category === 'electronics') {
                product.originalPrice = product.price;
                product.price = product.price * 0.75;
            }
            return product;
        }
  );

        // Sort results
        if (sort) {
            switch (sort) {
                case 'price_asc':
                    products = products.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    products = products.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    products = products.sort((a, b) => b.rating - a.rating);
                    break;
                case 'newest':
                    products = products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                default:
                    // relevance - no sorting needed
                    break;
            }
        }

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = await Product.findById(req.params.id).lean();
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Apply 25% discount to electronics
        if (product.category === 'electronics') {
            product.originalPrice = product.price;
            product.price = product.price * 0.75;
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin (Currently Public as per original code)
const createProduct = async (req, res) => {
    try {
        console.log('📦 createProduct req.body:', req.body);
        const { name, price, description, category, brand, stock, rating, images, variants } = req.body;

        // Handle images - can come from file upload OR from request body (URLs)
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            // File upload case
            imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        } else if (images && Array.isArray(images)) {
            // URL array case (from ImageUpload component)
            imagePaths = images;
        }

        const newProduct = new Product({
            name,
            price,
            description,
            images: imagePaths,
            category,
            brand,
            stock,
            rating,
            variants
        });

        await newProduct.save();
        res.status(201).json({ message: "✅ Product successfully saved!", product: newProduct });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const { name, price, description, category, brand, stock, rating, images, variants } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.category = category || product.category;
        product.brand = brand || product.brand;
        product.stock = stock !== undefined ? stock : product.stock;
        product.rating = rating !== undefined ? rating : product.rating;
        if (variants) product.variants = variants;

        // Handle images - accept array of URLs from frontend
        if (images && Array.isArray(images)) {
            product.images = images;
        }

        const updatedProduct = await product.save();
        res.json({ message: '✅ Product updated successfully', product: updatedProduct });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.deleteOne({ _id: req.params.id });
        res.json({ message: '✅ Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id
            };

            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview
};
