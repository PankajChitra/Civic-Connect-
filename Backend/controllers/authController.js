const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const safeUser = (u) => ({
  id: u._id, name: u.name, email: u.email,
  role: u.role, adminLevel: u.adminLevel,
  ward: u.ward, district: u.district, city: u.city,
  levelLabel: u.schema.virtuals.levelLabel?.applyGetters(undefined, u) || "",
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, ward = "", district = "", city = "" } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: "Email already registered" });

    const user = await User.create({ name, email, password, ward, district, city });

    res.status(201).json({
      success: true,
      token: signToken(user._id),
      user: safeUser(user),
    });
  } catch (err) { next(err); }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account deactivated" });

    res.json({ success: true, token: signToken(user._id), user: safeUser(user) });
  } catch (err) { next(err); }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = (req, res) => res.json({ success: true, user: req.user });

// ── PATCH /api/auth/promote  (City Admin only, level 3) ───────────────────────
// Body: { userId, adminLevel, ward, district, city }
const promoteUser = async (req, res, next) => {
  try {
    const { userId, adminLevel, ward, district, city } = req.body;

    if (![1, 2, 3].includes(Number(adminLevel)))
      return res.status(400).json({ success: false, message: "adminLevel must be 1, 2 or 3" });

    // A level-2 admin can only assign level-1; level-3 can assign anything
    if (req.user.adminLevel < 3 && Number(adminLevel) >= req.user.adminLevel)
      return res.status(403).json({ success: false, message: "Cannot promote to your own level or above" });

    const target = await User.findByIdAndUpdate(
      userId,
      { role: "admin", adminLevel: Number(adminLevel), ward: ward || "", district: district || "", city: city || "" },
      { new: true }
    );
    if (!target)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: `${target.name} promoted to level ${adminLevel}`, user: safeUser(target) });
  } catch (err) { next(err); }
};

// ── PATCH /api/auth/demote ────────────────────────────────────────────────────
const demoteUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const target = await User.findByIdAndUpdate(
      userId,
      { role: "user", adminLevel: 0, ward: "", district: "", city: "" },
      { new: true }
    );
    if (!target)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: `${target.name} demoted to citizen`, user: safeUser(target) });
  } catch (err) { next(err); }
};

// ── GET /api/auth/admins ──────────────────────────────────────────────────────
const getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password").sort({ adminLevel: -1 });
    res.json({ success: true, admins });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, promoteUser, demoteUser, getAdmins };