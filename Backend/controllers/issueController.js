const Issue = require("../models/Issue");

// ── GET /api/issues ───────────────────────────────────────────────────────────
const getIssues = async (req, res, next) => {
  try {
    const { category, status, priority, level, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (status   && status   !== "All") filter.status   = status;
    if (priority && priority !== "All") filter.priority = priority;
    if (level    && level    !== "All") filter.currentLevel = Number(level);

    const skip = (Number(page) - 1) * Number(limit);
    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip).limit(Number(limit))
        .populate("reportedBy", "name email")
        .populate("assignedTo", "name email adminLevel ward district"),
      Issue.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page),
      pages: Math.ceil(total / Number(limit)), issues });
  } catch (err) { next(err); }
};

// ── GET /api/issues/:id ───────────────────────────────────────────────────────
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email adminLevel ward district")
      .populate("escalationHistory.escalatedBy", "name email adminLevel")
      .populate("comments.author", "name email");
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });
    res.json({ success: true, issue });
  } catch (err) { next(err); }
};

// ── POST /api/issues ──────────────────────────────────────────────────────────
const createIssue = async (req, res, next) => {
  try {
    const { title, description, category, locationText,
            locationCoords, media, ward, district } = req.body;

    const issue = await Issue.create({
      title, description, category, locationText,
      locationCoords: locationCoords || null,
      media: media || [],
      ward: ward || req.user?.ward || "",
      district: district || req.user?.district || "",
      reportedBy: req.user?._id || null,
      lastActivityAt: new Date(),
    });

    res.status(201).json({ success: true, issue });
  } catch (err) { next(err); }
};

// ── PATCH /api/issues/:id/status  (admin, must match or exceed currentLevel) ──
const updateStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    const allowed = ["Pending", "In Progress", "Resolved", "Escalated"];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status value" });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

    // Level check
    if (req.user.adminLevel < issue.currentLevel)
      return res.status(403).json({
        success: false,
        message: `Issue is at level ${issue.currentLevel}. Your level (${req.user.adminLevel}) cannot act on it.`,
      });

    issue.status = status;
    issue.lastActivityAt = new Date();
    if (status === "Resolved") issue.resolvedBy = req.user._id;

    // Attach optional comment
    if (comment?.trim()) {
      issue.comments.push({ author: req.user._id, text: comment.trim() });
    }

    await issue.save();
    await issue.populate("assignedTo", "name email adminLevel");
    res.json({ success: true, issue });
  } catch (err) { next(err); }
};

// ── PATCH /api/issues/:id/assign  (admin) ─────────────────────────────────────
const assignIssue = async (req, res, next) => {
  try {
    const { adminId } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

    if (req.user.adminLevel < issue.currentLevel)
      return res.status(403).json({ success: false, message: "Insufficient level to assign" });

    issue.assignedTo    = adminId || null;
    issue.lastActivityAt = new Date();
    await issue.save();
    await issue.populate("assignedTo", "name email adminLevel ward district");
    res.json({ success: true, issue });
  } catch (err) { next(err); }
};

// ── POST /api/issues/:id/escalate  (admin or auto-cron) ───────────────────────
const escalateIssue = async (req, res, next) => {
  try {
    const { reason = "Manually escalated" } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

    if (issue.currentLevel >= 3)
      return res.status(400).json({ success: false, message: "Already at highest level (City)" });

    if (req.user && req.user.adminLevel < issue.currentLevel)
      return res.status(403).json({ success: false, message: "Insufficient level to escalate" });

    const fromLevel = issue.currentLevel;
    const toLevel   = fromLevel + 1;

    issue.escalationHistory.push({
      fromLevel,
      toLevel,
      reason,
      escalatedBy: req.user?._id || null,
      escalatedAt: new Date(),
    });

    issue.currentLevel    = toLevel;
    issue.status          = "Escalated";
    issue.assignedTo      = null;         // clear assignment — new level picks it up
    issue.lastActivityAt  = new Date();

    await issue.save();
    res.json({ success: true, issue, message: `Issue escalated to level ${toLevel}` });
  } catch (err) { next(err); }
};

// ── POST /api/issues/:id/comment ──────────────────────────────────────────────
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim())
      return res.status(400).json({ success: false, message: "Comment text required" });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

    issue.comments.push({ author: req.user._id, text: text.trim() });
    issue.lastActivityAt = new Date();
    await issue.save();
    await issue.populate("comments.author", "name email");
    res.json({ success: true, comments: issue.comments });
  } catch (err) { next(err); }
};

// ── PATCH /api/issues/:id/priority  (admin) ───────────────────────────────────
const setPriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    if (!["Low", "Medium", "High", "Critical"].includes(priority))
      return res.status(400).json({ success: false, message: "Invalid priority" });

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { priority, lastActivityAt: new Date() },
      { new: true }
    );
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });
    res.json({ success: true, issue });
  } catch (err) { next(err); }
};

// ── DELETE /api/issues/:id ────────────────────────────────────────────────────
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });
    res.json({ success: true, message: "Issue deleted" });
  } catch (err) { next(err); }
};

// ── DELETE /api/issues ────────────────────────────────────────────────────────
const deleteAllIssues = async (req, res, next) => {
  try {
    await Issue.deleteMany({});
    res.json({ success: true, message: "All issues deleted" });
  } catch (err) { next(err); }
};

// ── POST /api/issues/:id/upvote ───────────────────────────────────────────────
const upvoteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

    const voted = issue.upvotedBy.includes(req.user._id);
    if (voted) {
      issue.upvotedBy.pull(req.user._id);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
    } else {
      issue.upvotedBy.push(req.user._id);
      issue.upvotes += 1;
    }
    await issue.save();
    res.json({ success: true, upvotes: issue.upvotes, voted: !voted });
  } catch (err) { next(err); }
};

module.exports = {
  getIssues, getIssueById, createIssue,
  updateStatus, assignIssue, escalateIssue,
  addComment, setPriority,
  deleteIssue, deleteAllIssues, upvoteIssue,
};