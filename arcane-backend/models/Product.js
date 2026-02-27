const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  images: {
    type: [String],
    validate: [v => v.length <= 3, "Only 3 images allowed"]
  },
  category: { type: String },
  brand: { type: String },
  stock: { type: Number, required: true, default: 0 },
  variants: {
    sizes: { type: [String], default: [] },
    colors: [{
      name: String,
      hex: String
    }]
  },
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  reviews: [reviewSchema]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);