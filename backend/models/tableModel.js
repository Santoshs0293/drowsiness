const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    vehicle_number: String,
    registration_date: Date,
    // other fields...
});

module.exports = mongoose.model('User', userSchema);
