const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ── Verify JWT & attach user ──────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer "))
    token = req.headers.authorization.split(" ")[1];

  if (!token)
    return res.status(401).json({ success: false, message: "Not authorised, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user)
      return res.status(401).json({ success: false, message: "User not found" });
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token invalid or expired" });
  }
};

// ── Any admin (level >= 1) ────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin" && req.user?.adminLevel >= 1) return next();
  return res.status(403).json({ success: false, message: "Admin access required" });
};

// ── Minimum level guard — use as levelGuard(2) for district+ only ─────────────
const levelGuard = (minLevel) => (req, res, next) => {
  if (req.user?.role === "admin" && req.user?.adminLevel >= minLevel) return next();
  return res.status(403).json({
    success: false,
    message: `Requires admin level ${minLevel} or above`,
  });
};

// ── Can act on this issue? Admin must match issue's currentLevel or be higher ─
const canActOnIssue = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ success: false, message: "Admin access required" });

  const issue = req.issue; // must be set by a prior middleware that loads the issue
  if (!issue) return next(); // no issue loaded yet — let controller handle it

  if (req.user.adminLevel >= issue.currentLevel) return next();

  return res.status(403).json({
    success: false,
    message: `This issue is at level ${issue.currentLevel}. Your level (${req.user.adminLevel}) is insufficient.`,
  });
};

module.exports = { protect, adminOnly, levelGuard, canActOnIssue };