export const CATEGORIES = ["Garbage", "Street Light", "Roads", "Water", "Other"];

export const STATUSES = ["Pending", "In Progress", "Resolved", "Escalated"];

export const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export const ADMIN_LEVELS = [
  { value: 1, label: "Ward Admin",     color: "#2563eb" },
  { value: 2, label: "District Admin", color: "#7c3aed" },
  { value: 3, label: "City Admin",     color: "#dc2626" },
];

export const LEVEL_LABELS = { 0: "Citizen", 1: "Ward Admin", 2: "District Admin", 3: "City Admin" };

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
  Garbage:        "🗑️",
  "Street Light": "💡",
  Roads:          "🛣️",
  Water:          "💧",
  Other:          "📌",
};