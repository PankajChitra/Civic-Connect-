const Issue = require("../models/Issue");

// ── @route   GET /api/issues
// ── @access  Public  — supports ?category=&status=&page=&limit=
const getIssues = async (req, res, next) => {
  try {
    const { category, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (status   && status   !== "All") filter.status   = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("reportedBy", "name email"),
      Issue.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      issues,
    });
  } catch (err) {
    next(err);
  }
};

// ── @route   GET /api/issues/:id
// ── @access  Public
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id).populate("reportedBy", "name email");
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });
    res.json({ success: true, issue });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/issues
// ── @access  Public (anonymous reporting allowed)
const createIssue = async (req, res, next) => {
  try {
    const { title, description, category, locationText, locationCoords, media } = req.body;

    const issue = await Issue.create({
      title,
      description,
      category,
      locationText,
      locationCoords: locationCoords || null,
      media: media || [],
      reportedBy: req.user?._id || null,   // attach user if logged in
    });

    res.status(201).json({ success: true, issue });
  } catch (err) {
    next(err);
  }
};

// ── @route   PATCH /api/issues/:id/status
// ── @access  Admin only
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "In Progress", "Resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status, resolvedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });
    res.json({ success: true, issue });
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/issues/:id
// ── @access  Admin only
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });
    res.json({ success: true, message: "Issue deleted" });
  } catch (err) {
    next(err);
  }
};

// ── @route   DELETE /api/issues          (delete ALL)
// ── @access  Admin only
const deleteAllIssues = async (req, res, next) => {
  try {
    await Issue.deleteMany({});
    res.json({ success: true, message: "All issues deleted" });
  } catch (err) {
    next(err);
  }
};

// ── @route   POST /api/issues/:id/upvote
// ── @access  Private (logged-in users)
const upvoteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

    const alreadyVoted = issue.upvotedBy.includes(req.user._id);
    if (alreadyVoted) {
      // toggle off
      issue.upvotedBy.pull(req.user._id);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
    } else {
      issue.upvotedBy.push(req.user._id);
      issue.upvotes += 1;
    }

    await issue.save();
    res.json({ success: true, upvotes: issue.upvotes, voted: !alreadyVoted });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIssues,
  getIssueById,
  createIssue,
  updateStatus,
  deleteIssue,
  deleteAllIssues,
  upvoteIssue,
};
