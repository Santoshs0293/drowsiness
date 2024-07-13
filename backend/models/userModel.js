const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    vehicle_number: { type: String, required: true },
    registration_date: { type: Date, default: Date.now }
   // employee_number: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
