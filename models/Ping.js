const mongoose = require('mongoose');

const pingSchema = new mongoose.Schema({
    message: {
        type: String,
        default: 'Database keep-alive ping'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ping', pingSchema);