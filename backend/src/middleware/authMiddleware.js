const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // 🔥 TOKEN GET FROM HEADER
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    // 🔥 VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 USER DATA SAVE
    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

module.exports = authMiddleware;