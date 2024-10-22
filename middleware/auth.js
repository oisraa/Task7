const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');  // Get the token from the header

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user to the request object
        req.user = await User.findById(decoded.id);
        
        next();  // Move to the next middleware
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware to restrict access to professors
const professorOnly = (req, res, next) => {
    if (req.user.role !== 'professor') {
        return res.status(403).json({ message: 'Access denied: Professors only' });
    }
    next();
};

// Export the middlewares
module.exports = { auth: authMiddleware, professorOnly };

