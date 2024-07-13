// fileRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { upload, uploadFile, getFiles } = require('../controllers/fileController');

router.post('/upload', auth, upload, uploadFile);
router.get('/', auth, getFiles);

module.exports = router; // Corrected export
