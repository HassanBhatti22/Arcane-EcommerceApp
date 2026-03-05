const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const upload = require('../config/cloudinary'); // (Ya jis folder mein aapne file banayi hai)

// .env se credentials lay kar Cloudinary ko connect karna
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage engine set karna (Tasveer kahan aur kaise save hogi)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'arcane_products', // Cloudinary mein is naam ka folder ban jayega
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Sirf yeh formats allow honge
  }
});

const upload = multer({ storage: storage });

module.exports = upload;