const User = require('../models/userModel');
const Log = require('../models/logModel');
const Detection = require('../models/detectionModel');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password field
        res.json(users);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllLogs = async (req, res) => {
    try {
        const logs = await Log.find();
        res.json(logs);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllDetections = async (req, res) => {
    try {
        const detections = await Detection.find();
        // Convert image buffers to base64 strings
        const formattedDetections = detections.map(detection => ({
            ...detection.toObject(),
            image: detection.image.toString('base64')
        }));
        res.json(formattedDetections);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateLog = async (req, res) => {
    try {
        const log = await Log.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(log);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteLog = async (req, res) => {
    try {
        await Log.findByIdAndDelete(req.params.id);
        res.json({ message: 'Log deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateDetection = async (req, res) => {
    try {
        const detection = await Detection.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(detection);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteDetection = async (req, res) => {
    try {
        await Detection.findByIdAndDelete(req.params.id);
        res.json({ message: 'Detection deleted' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
