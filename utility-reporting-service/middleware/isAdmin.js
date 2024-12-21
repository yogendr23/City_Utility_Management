// isAdmin.js
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next(); // User is an admin, proceed to the next middleware
    } else {
      return res.status(403).json({ message: 'Access denied, not an admin' });
    }
  };
  
  module.exports = isAdmin;
  