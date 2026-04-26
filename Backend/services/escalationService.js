// services/escalationService.js
// ─────────────────────────────────────────────────────────────────────────────
// Runs on a schedule. For each unresolved issue that has been idle beyond the
// threshold for its current level, it auto-escalates to the next level.
//
// Idle thresholds (configurable via .env):
//   Level 1 (Ward)     → escalate after ESCALATE_L1_HOURS  (default 48h)
//   Level 2 (District) → escalate after ESCALATE_L2_HOURS  (default 72h)
//   Level 3 (City)     → no further escalation possible
//
// Priority multiplier — Critical/High issues escalate faster:
//   Critical → 0.5×  High → 0.75×  Medium → 1×  Low → 1.5×
// ─────────────────────────────────────────────────────────────────────────────
const Issue = require("../models/Issue");

const PRIORITY_MULTIPLIER = { Critical: 0.5, High: 0.75, Medium: 1, Low: 1.5 };

const hoursToMs = (h) => h * 60 * 60 * 1000;

const getThresholdMs = (level, priority) => {
  const base = level === 1
    ? hoursToMs(Number(process.env.ESCALATE_L1_HOURS || 48))
    : hoursToMs(Number(process.env.ESCALATE_L2_HOURS || 72));
  return base * (PRIORITY_MULTIPLIER[priority] || 1);
};

const runEscalation = async () => {
  console.log(`[Escalation] Running at ${new Date().toISOString()}`);

  try {
    // Only check issues at level 1 or 2 that are not yet resolved
    const candidates = await Issue.find({
      currentLevel: { $in: [1, 2] },
      status: { $nin: ["Resolved"] },
    });

    let escalated = 0;

    for (const issue of candidates) {
      const threshold = getThresholdMs(issue.currentLevel, issue.priority);
      const idleMs    = Date.now() - new Date(issue.lastActivityAt).getTime();

      if (idleMs >= threshold) {
        const fromLevel = issue.currentLevel;
        const toLevel   = fromLevel + 1;

        issue.escalationHistory.push({
          fromLevel,
          toLevel,
          reason: `Auto-escalated: idle for ${Math.round(idleMs / 3600000)}h (threshold ${Math.round(threshold / 3600000)}h, priority: ${issue.priority})`,
          escalatedBy:  null,
          escalatedAt:  new Date(),
        });

        issue.currentLevel   = toLevel;
        issue.status         = "Escalated";
        issue.assignedTo     = null;
        issue.lastActivityAt = new Date();

        await issue.save();
        escalated++;
        console.log(`[Escalation] Issue "${issue.title}" (${issue._id}) escalated L${fromLevel}→L${toLevel}`);
      }
    }

    console.log(`[Escalation] Done. ${escalated} issue(s) escalated.`);
  } catch (err) {
    console.error("[Escalation] Error:", err.message);
  }
};

// ── Start the cron loop ───────────────────────────────────────────────────────
const startEscalationCron = () => {
  const intervalMinutes = Number(process.env.ESCALATION_CRON_MINUTES || 60);
  console.log(`[Escalation] Cron started — checking every ${intervalMinutes} min`);
  runEscalation();                                   // run immediately on boot
  setInterval(runEscalation, intervalMinutes * 60 * 1000);
};

module.exports = { startEscalationCron, runEscalation };