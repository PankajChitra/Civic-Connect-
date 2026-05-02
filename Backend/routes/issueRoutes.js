const express = require("express");
const router  = express.Router();
const {
  getIssues, getIssueById, createIssue,
  updateStatus, assignIssue, escalateIssue,
  addComment, setPriority,
  deleteIssue, deleteAllIssues, upvoteIssue,
} = require("../controllers/issueController");
const { protect, adminOnly, levelGuard } = require("../middleware/authMiddleware");

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/",    getIssues);
router.get("/:id", getIssueById);

// ── Logged-in citizens only ───────────────────────────────────────────────────
router.post("/",             protect, createIssue);     // must be logged in to report
router.post("/:id/upvote",  protect, upvoteIssue);      // must be logged in to upvote
router.post("/:id/comment", protect, addComment);

// ── Admin (any level >= 1) ────────────────────────────────────────────────────
router.patch("/:id/status",   protect, adminOnly, updateStatus);
router.patch("/:id/assign",   protect, adminOnly, assignIssue);
router.patch("/:id/priority", protect, adminOnly, setPriority);
router.post ("/:id/escalate", protect, adminOnly, escalateIssue);

// ── Admin level >= 2 to delete ────────────────────────────────────────────────
router.delete("/",    protect, levelGuard(2), deleteAllIssues);
router.delete("/:id", protect, levelGuard(2), deleteIssue);

module.exports = router;