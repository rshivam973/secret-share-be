const { verifyAccessToken } = require('../utils/tokenUtils');

// Middleware to authenticate requests using JWT access token
const authenticate = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access token required' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyAccessToken(token);

        // Attach user ID to request object
        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({ message: error.message || 'Invalid or expired token' });
    }
};

module.exports = { authenticate };
