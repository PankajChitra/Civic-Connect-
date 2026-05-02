const Issue = require("../models/Issue");

// ── Upvote thresholds → priority upgrade (keep in sync with frontend constants)
const UPVOTE_THRESHOLDS = [
  { min: 50, priority: "Critical" },
  { min: 25, priority: "High"     },
  { min: 10, priority: "Medium"   },
];

// Returns the priority that should apply given an upvote count
const calcPriority = (upvotes, current) => {
  for (const t of UPVOTE_THRESHOLDS) {
    if (upvotes >= t.min) return t.priority;
  }
  // Below all thresholds — don't downgrade if admin already set it higher
  const order = ["Low", "Medium", "High", "Critical"];
  return order.indexOf(current) >= 0 ? current : "Low";
};

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
        .sort({ upvotes: -1, createdAt: -1 })   // hot issues first
        .skip(skip).limit(Number(limit))
        .populate("reportedBy", "name")
        .populate("assignedTo", "name email adminLevel ward district"),
      Issue.countDocuments(filter),
    ]);

    res.json({ success: true, total,
      page: Number(page), pages: Math.ceil(total / Number(limit)), issues });
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

// ── POST /api/issues  (login required — enforced in route) ────────────────────
const createIssue = async (req, res, next) => {
  try {
    const { title, description, category, locationText,
            locationCoords, media, ward, district } = req.body;

    const issue = await Issue.create({
      title, description, category, locationText,
      locationCoords: locationCoords || null,
      media: media || [],
      ward:     ward     || req.user?.ward     || "",
      district: district || req.user?.district || "",
      reportedBy:    req.user._id,   // guaranteed logged-in via protect middleware
      lastActivityAt: new Date(),
      priority: "Low",               // always starts Low; upvotes will raise it
    });

    res.status(201).json({ success: true, issue });
  } catch (err) { next(err); }
};

// ── PATCH /api/issues/:id/status ─────────────────────────────────────────────
const updateStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    const allowed = ["Pending", "In Progress", "Resolved", "Escalated"];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status value" });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

    if (req.user.adminLevel < issue.currentLevel)
      return res.status(403).json({
        success: false,
        message: `Issue is at level ${issue.currentLevel}. Your level (${req.user.adminLevel}) cannot act on it.`,
      });

    issue.status         = status;
    issue.lastActivityAt = new Date();
    if (status === "Resolved") issue.resolvedBy = req.user._id;
    if (comment?.trim()) issue.comments.push({ author: req.user._id, text: comment.trim() });

    await issue.save();
    await issue.populate("assignedTo", "name email adminLevel");
    res.json({ success: true, issue });
  } catch (err) { next(err); }
};

// ── PATCH /api/issues/:id/assign ─────────────────────────────────────────────
const assignIssue = async (req, res, next) => {
  try {
    const { adminId } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });
    if (req.user.adminLevel < issue.currentLevel)
      return res.status(403).json({ success: false, message: "Insufficient level to assign" });

    issue.assignedTo     = adminId || null;
    issue.lastActivityAt = new Date();
    await issue.save();
    await issue.populate("assignedTo", "name email adminLevel ward district");
    res.json({ success: true, issue });
  } catch (err) { next(err); }
};

// ── POST /api/issues/:id/escalate ────────────────────────────────────────────
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
      fromLevel, toLevel, reason,
      escalatedBy: req.user?._id || null,
      escalatedAt: new Date(),
    });
    issue.currentLevel   = toLevel;
    issue.status         = "Escalated";
    issue.assignedTo     = null;
    issue.lastActivityAt = new Date();

    await issue.save();
    res.json({ success: true, issue, message: `Issue escalated to level ${toLevel}` });
  } catch (err) { next(err); }
};

// ── POST /api/issues/:id/upvote  (logged-in citizens) ────────────────────────
const upvoteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

    // Cannot upvote your own issue
    if (issue.reportedBy?.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: "You cannot upvote your own issue" });

    const voted = issue.upvotedBy.includes(req.user._id);
    if (voted) {
      issue.upvotedBy.pull(req.user._id);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
    } else {
      issue.upvotedBy.push(req.user._id);
      issue.upvotes += 1;
    }

    // ── Auto-upgrade priority based on upvote count ───────────────────────────
    const newPriority = calcPriority(issue.upvotes, issue.priority);
    const priorityChanged = newPriority !== issue.priority;
    if (priorityChanged) {
      issue.priority = newPriority;
      issue.lastActivityAt = new Date();

      // Log the auto-upgrade as a system comment
      issue.comments.push({
        author:    null,
        text:      `🔺 Priority automatically upgraded to ${newPriority} after reaching ${issue.upvotes} upvotes.`,
        createdAt: new Date(),
      });
    }

    await issue.save();
    res.json({
      success: true,
      upvotes: issue.upvotes,
      voted: !voted,
      priority: issue.priority,
      priorityChanged,
    });
  } catch (err) { next(err); }
};

// ── POST /api/issues/:id/comment ─────────────────────────────────────────────
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

// ── PATCH /api/issues/:id/priority ───────────────────────────────────────────
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

module.exports = {
  getIssues, getIssueById, createIssue,
  updateStatus, assignIssue, escalateIssue,
  addComment, setPriority,
  deleteIssue, deleteAllIssues, upvoteIssue,
};