// ── Categories ────────────────────────────────────────────────────────────────
export const CATEGORIES = [
  "Garbage & Sanitation",
  "Street Lighting",
  "Roads & Potholes",
  "Water Supply",
  "Sewage & Drainage",
  "Parks & Public Spaces",
  "Noise Pollution",
  "Air Pollution",
  "Stray Animals",
  "Illegal Construction",
  "Electricity",
  "Public Transport",
  "Traffic & Signals",
  "Trees & Encroachment",
  "Other",
];

// ── Upvote thresholds → auto priority upgrade ─────────────────────────────────
// When an issue crosses these upvote counts its priority is bumped automatically.
// Matching thresholds in issueController.js (keep in sync).
export const UPVOTE_THRESHOLDS = {
  Medium:   10,   //  10+ upvotes  → Medium
  High:     25,   //  25+ upvotes  → High
  Critical: 50,   //  50+ upvotes  → Critical
};

// ── Statuses ──────────────────────────────────────────────────────────────────
export const STATUSES = ["Pending", "In Progress", "Resolved", "Escalated"];

// ── Priorities ────────────────────────────────────────────────────────────────
export const PRIORITIES = ["Low", "Medium", "High", "Critical"];

// ── Admin levels ──────────────────────────────────────────────────────────────
export const ADMIN_LEVELS = [
  { value: 1, label: "Ward Admin",     color: "#2563eb" },
  { value: 2, label: "District Admin", color: "#7c3aed" },
  { value: 3, label: "City Admin",     color: "#dc2626" },
];

export const LEVEL_LABELS = {
  0: "Citizen",
  1: "Ward Admin",
  2: "District Admin",
  3: "City Admin",
};

// ── Style maps ────────────────────────────────────────────────────────────────
export const STATUS_STYLES = {
  Resolved:      { badge: "resolved",  color: "#16a34a" },
  "In Progress": { badge: "progress",  color: "#d97706" },
  Pending:       { badge: "pending",   color: "#dc2626" },
  Escalated:     { badge: "escalated", color: "#7c3aed" },
};

export const PRIORITY_STYLES = {
  Low:      { color: "#6b7280", bg: "#f3f4f6" },
  Medium:   { color: "#d97706", bg: "#fef3c7" },
  High:     { color: "#dc2626", bg: "#fee2e2" },
  Critical: { color: "#ffffff", bg: "#7c3aed" },
};

export const CATEGORY_ICONS = {
  "Garbage & Sanitation":  "🗑️",
  "Street Lighting":       "💡",
  "Roads & Potholes":      "🛣️",
  "Water Supply":          "💧",
  "Sewage & Drainage":     "🚰",
  "Parks & Public Spaces": "🌳",
  "Noise Pollution":       "🔊",
  "Air Pollution":         "🌫️",
  "Stray Animals":         "🐕",
  "Illegal Construction":  "🏗️",
  "Electricity":           "⚡",
  "Public Transport":      "🚌",
  "Traffic & Signals":     "🚦",
  "Trees & Encroachment":  "🌿",
  "Other":                 "📌",
};