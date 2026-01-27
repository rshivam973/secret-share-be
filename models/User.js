const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const messageSchema = new mongoose.Schema({
    content: String,
    timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    Name: String,
    username: { type: String, unique: true }, // Added unique constraint hint
    email: { type: String, unique: true },    // Added unique constraint hint
    password: String,
    // confirmPassword field is generally not saved to DB, handled in controller/validation
    messages: [messageSchema]
});

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
