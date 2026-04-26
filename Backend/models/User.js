const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

// ─────────────────────────────────────────────────────────────────────────────
//  Admin level hierarchy
//    1 = Ward Admin     — handles issues in their ward
//    2 = District Admin — handles escalated issues across wards in district
//    3 = City Admin     — handles escalated issues across all districts
//  role:"user" always has adminLevel: 0
// ─────────────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // ── Role & hierarchy ──────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    adminLevel: {
      // 0 = regular user, 1 = ward, 2 = district, 3 = city
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
    },

    // ── Jurisdiction (relevant for level-1 and level-2 admins) ────────────
    ward:     { type: String, trim: true, default: "" },
    district: { type: String, trim: true, default: "" },
    city:     { type: String, trim: true, default: "" },

    avatar:   { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.virtual("levelLabel").get(function () {
  const labels = { 0: "Citizen", 1: "Ward Admin", 2: "District Admin", 3: "City Admin" };
  return labels[this.adminLevel] || "Citizen";
});

module.exports = mongoose.model("User", userSchema);