const mongoose = require("mongoose");

// ── Sub-schema: GPS coordinates ───────────────────────────────────────────────
const coordsSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

// ── Main Issue schema ─────────────────────────────────────────────────────────
const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: true,
      enum: ["Garbage", "Street Light", "Roads", "Water", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },

    // ── Location ────────────────────────────────────────────────────────────
    locationText: {
      type: String,
      trim: true,
      default: "",
    },
    locationCoords: {
      type: coordsSchema,
      default: null,
    },

    // ── Media (stored as base64 data-URIs or cloud URLs) ────────────────────
    media: {
      type: [String],
      default: [],
    },

    // ── Upvotes (future feature) ─────────────────────────────────────────────
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ── Reporter (null = anonymous) ──────────────────────────────────────────
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Admin who last changed status ────────────────────────────────────────
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }   // adds createdAt & updatedAt automatically
);

// ── Index for fast geo / category queries (no full geospatial needed) ─────────
issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Issue", issueSchema);
