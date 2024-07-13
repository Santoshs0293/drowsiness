const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle_number: { type: String, required: true },
    image: { type: Buffer, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Detection', detectionSchema);
