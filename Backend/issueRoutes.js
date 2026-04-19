const express = require("express");
const router = express.Router();
const {
  getIssues,
  getIssueById,
  createIssue,
  updateStatus,
  deleteIssue,
  deleteAllIssues,
  upvoteIssue,
} = require("../controllers/issueController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ── Public ───────────────────────────────────────────────────────────────────
router.get("/",    getIssues);       // GET  /api/issues?category=&status=&page=&limit=
router.get("/:id", getIssueById);    // GET  /api/issues/:id

// ── Public or logged-in (anonymous OK) ───────────────────────────────────────
router.post("/", createIssue);       // POST /api/issues

// ── Logged-in users ───────────────────────────────────────────────────────────
router.post("/:id/upvote", protect, upvoteIssue);   // POST /api/issues/:id/upvote

// ── Admin only ────────────────────────────────────────────────────────────────
router.patch("/:id/status", protect, adminOnly, updateStatus);   // PATCH /api/issues/:id/status
router.delete("/",          protect, adminOnly, deleteAllIssues); // DELETE /api/issues
router.delete("/:id",       protect, adminOnly, deleteIssue);    // DELETE /api/issues/:id

module.exports = router;
