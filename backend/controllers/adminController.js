const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerAdmin = async (req, res) => {
    const { name, designation, password } = req.body;
    try {
        const admin = new Admin({ name, designation, password });
        await admin.save();
        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.loginAdmin = async (req, res) => {
    const { name, password } = req.body;
    try {
        console.log('Received name:', name); // Debugging log
        console.log('Received password:', password); // Debugging log

        const admin = await Admin.findOne({ name });
        if (admin) {
            console.log('Admin found:', admin); // Debugging log
            const isMatch = await admin.matchPassword(password);
            console.log('Password match:', isMatch); // Debugging log
            if (isMatch) {
                console.log('Login successful'); // Debugging log
                return res.json({ token: generateToken(admin._id) });
            } else {
                console.log('Password does not match'); // Debugging log
            }
        } else {
            console.log('Admin not found'); // Debugging log
        }
        res.status(401).json({ error: 'Invalid credentials' });
    } catch (err) {
        console.log('Error:', err.message); // Debugging log
        res.status(400).json({ error: err.message });
    }
};
