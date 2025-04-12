const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || "my_secret_key"; // Use environment variable for security

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
        req.user = decoded; // Attach decoded user info to request object
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
