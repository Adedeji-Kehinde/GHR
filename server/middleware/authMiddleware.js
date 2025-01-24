const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: 'Invalid token.' });
      }
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Token has expired.' });
      }
      return res.status(500).json({ message: 'Server error during token verification.' });
    }
    req.user = decoded; // Attach decoded user data to the request object
    next();
  });
};

module.exports = authenticateToken;
