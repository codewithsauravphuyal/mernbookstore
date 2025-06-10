const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log('Authenticating admin with token:', token ? 'Token present' : 'No token'); // Debug log
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log
    if (decoded.role !== 'admin') {
      console.warn(`Access denied: User role is ${decoded.role}`);
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticateAdmin };