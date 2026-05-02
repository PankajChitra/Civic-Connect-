const mongoose = require("mongoose");

const coordsSchema = new mongoose.Schema(
  { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
  { _id: false }
);

const escalationEntrySchema = new mongoose.Schema(
  {
    fromLevel:   { type: Number, required: true },
    toLevel:     { type: Number, required: true },
    reason:      { type: String, default: "Idle timeout" },
    escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    escalatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String, required: [true, "Title is required"],
      trim: true, maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String, required: [true, "Description is required"],
      trim: true, maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: String, required: true,
      enum: [
        "Garbage & Sanitation", "Street Lighting", "Roads & Potholes",
        "Water Supply", "Sewage & Drainage", "Parks & Public Spaces",
        "Noise Pollution", "Air Pollution", "Stray Animals",
        "Illegal Construction", "Electricity", "Public Transport",
        "Traffic & Signals", "Trees & Encroachment", "Other",
      ],
      default: "Other",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",               // starts Low; upvotes promote it automatically
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Escalated"],
      default: "Pending",
    },

    // ── Hierarchy ─────────────────────────────────────────────────────────────
    currentLevel: { type: Number, enum: [1, 2, 3], default: 1 },
    assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    escalationHistory: { type: [escalationEntrySchema], default: [] },
    lastActivityAt:    { type: Date, default: Date.now },

    // ── Location ──────────────────────────────────────────────────────────────
    locationText:   { type: String, trim: true, default: "" },
    locationCoords: { type: coordsSchema, default: null },
    ward:           { type: String, trim: true, default: "" },
    district:       { type: String, trim: true, default: "" },

    // ── Media ─────────────────────────────────────────────────────────────────
    media: { type: [String], default: [] },

    // ── Upvotes ───────────────────────────────────────────────────────────────
    upvotes:   { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ── People ────────────────────────────────────────────────────────────────
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // ── Comments ──────────────────────────────────────────────────────────────
    comments: [{
      author:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text:      { type: String, trim: true, maxlength: 500 },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ currentLevel: 1, status: 1 });
issueSchema.index({ upvotes: -1 });
issueSchema.index({ lastActivityAt: 1 });
issueSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Issue", issueSchema);