const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Validates the JWT token passed in the Authorization header.
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const authenticateToken = (req, res, next) => {
    // Get token from header: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token using the secret key from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add the decoded user payload to the request object
        // This allows subsequent route handlers to access req.user.id
        req.user = decoded;
        next();
    } catch (err) {
        // Handles both expired tokens and malformed/invalid tokens
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

module.exports = authenticateToken;
