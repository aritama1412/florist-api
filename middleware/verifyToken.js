const jwt = require("jsonwebtoken");

// Middleware untuk verifikasi token JWT
const secretKey = process.env.JWT_SECRET_KEY;
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(403)
      .json({ status: "failed", message: "Token is required" });
  }
  const pureToken = token.replace("Bearer ", "");
  // Verifikasi token
  try {
    const decoded = jwt.verify(pureToken, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: "failed", message: "Invalid token" });
  }
};
