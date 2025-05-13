const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({
      message: "No token provided!"
    });
  }
  
  // Remove Bearer prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    if (user.role === "admin") {
      next();
      return;
    }
    
    res.status(403).json({
      message: "Admin role required!"
    });
  });
};

const authJwt = {
  verifyToken,
  isAdmin
};

module.exports = authJwt;
