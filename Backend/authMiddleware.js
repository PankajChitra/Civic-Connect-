const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Verify JWT & attach user to req ──────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorised, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user (without password) to every protected request
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};

// ── Admin-only guard (must be used AFTER protect) ─────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ success: false, message: "Admin access required" });
};

module.exports = { protect, adminOnly };
