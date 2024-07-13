const jwt = require('jsonwebtoken');
const user = require('../models/userModel');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token is missing!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = { username: decoded.username };
        next();
    } catch (err) {
        if (err instanceof jwt.ExpiredSignatureError) {
            return res.status(401).json({ error: 'Token has expired!' });
        }
        return res.status(401).json({ error: 'Token is invalid!' });
    }
};

module.exports = auth;
