const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const DB = process.env.DATABASE;
        await mongoose.connect(DB, {
            useNewUrlParser: true,
        });
        console.log("database connected");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
