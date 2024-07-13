const express = require('express');
const {
    getAllUsers,
    getAllLogs,
    getAllDetections,
    updateUser,
    deleteUser,
    updateLog,
    deleteLog,
    updateDetection,
    deleteDetection,
} = require('../controllers/tableController');

const router = express.Router();

router.get('/users', getAllUsers);
router.get('/logs', getAllLogs);
router.get('/detections', getAllDetections);

router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.put('/logs/:id', updateLog);
router.delete('/logs/:id', deleteLog);

router.put('/detections/:id', updateDetection);
router.delete('/detections/:id', deleteDetection);

module.exports = router;
