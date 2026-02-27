const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            family: 4,
            serverSelectionTimeoutMS: 30000,
        });
        console.log("✅ ARCANE Database Connected");
    } catch (err) {
        console.error("❌ Connection Error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
