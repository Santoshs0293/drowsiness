// app.js
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./api/routes/authRoutes');
const fileRoutes = require('./api/routes/fileRoutes');
const db = require('./config/db');
const auth = require('./middleware/authMiddleware'); // Corrected path

require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to the database
db.connect();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', auth, fileRoutes); // Applying auth middleware directly

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
