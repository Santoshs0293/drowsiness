// fileController.js
const File = require('../models/fileModel');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

exports.upload = multer({ storage }).fields([{ name: 'image' }, { name: 'video' }]);

exports.uploadFile = async (req, res) => {
    const { userId } = req.body;
    const { image, video } = req.files;
    try {
        const newFile = new File({ userId, imagePath: image[0].path, videoPath: video[0].path });
        await newFile.save();
        res.status(201).json(newFile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFiles = async (req, res) => {
    try {
        const files = await File.find().populate('userId', 'username');
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};