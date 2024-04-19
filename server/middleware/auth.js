require('dotenv');
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Auth Error" })
    }
  
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user;
      next();
    } catch (err) {
      res.clearCookie('token');
      res.status(401).json({ message: "Auth Error" })
    }
}

module.exports = { authenticateToken };