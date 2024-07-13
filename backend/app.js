const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const tableRoutes = require('./routes/tableRoutes');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/admin', adminRoutes);
app.use('/api/tables', tableRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

module.exports = app;
