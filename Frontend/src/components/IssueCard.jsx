// src/components/IssueCard.jsx
import React, { useState } from "react";
import StatusBadge from "./StatusBadge";
import { CATEGORY_ICONS, PRIORITY_STYLES, LEVEL_LABELS, UPVOTE_THRESHOLDS } from "../constants";
import { issueAPI } from "../services/api";
import { useAuth }  from "../context/AuthContext";

export default function IssueCard({ issue, onUpvoted }) {
  const { isLoggedIn, user } = useAuth();
  const [upvotes,   setUpvotes]   = useState(issue.upvotes   || 0);
  const [voted,     setVoted]     = useState(
    issue.upvotedBy?.includes?.(user?.id) ?? false
  );
  const [priority,  setPriority]  = useState(issue.priority  || "Low");
  const [upvoting,  setUpvoting]  = useState(false);
  const [upvoteMsg, setUpvoteMsg] = useState("");

  const priStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Low;
  const icon     = CATEGORY_ICONS[issue.category] || "📌";

  // Next threshold to hit
  const nextThreshold = Object.entries(UPVOTE_THRESHOLDS)
    .sort((a, b) => a[1] - b[1])
    .find(([, val]) => val > upvotes);

  const isOwnIssue = user?.id === issue.reportedBy?._id ||
                     user?.id === issue.reportedBy;

  const handleUpvote = async () => {
    if (!isLoggedIn) { setUpvoteMsg("Login to upvote"); return; }
    if (isOwnIssue)  { setUpvoteMsg("Can't upvote your own issue"); return; }
    setUpvoting(true);
    setUpvoteMsg("");
    try {
      const data = await issueAPI.upvote(issue._id);
      setUpvotes(data.upvotes);
      setVoted(data.voted);
      if (data.priorityChanged) {
        setPriority(data.priority);
        setUpvoteMsg(`🔺 Priority upgraded to ${data.priority}!`);
      }
      onUpvoted?.({ ...issue, upvotes: data.upvotes, priority: data.priority });
    } catch (e) {
      setUpvoteMsg(e.message);
    } finally {
      setUpvoting(false);
    }
  };

  return (
    <div className="issue-card">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: "0.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem" }}>{icon} {issue.title}</h3>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap",
          justifyContent: "flex-end", flexShrink: 0 }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700,
            padding: "2px 7px", borderRadius: "999px",
            background: priStyle.bg, color: priStyle.color, whiteSpace: "nowrap" }}>
            {priority}
          </span>
          <StatusBadge status={issue.status} />
        </div>
      </div>

      <p style={{ marginTop: "0.35rem", color: "#374151",
        fontSize: "0.875rem", lineHeight: 1.5 }}>
        {issue.description}
      </p>

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem",
        marginTop: "0.5rem" }}>
        <span className="issue-meta">📂 {issue.category}</span>
        <span className="issue-meta">📍 {issue.locationText || "No location"}</span>
        {issue.ward && <span className="issue-meta">🏘️ {issue.ward}</span>}
        <span className="issue-meta" style={{
          background: issue.currentLevel===3?"#fee2e2":issue.currentLevel===2?"#ede9fe":"#dbeafe",
          color: issue.currentLevel===3?"#dc2626":issue.currentLevel===2?"#7c3aed":"#2563eb",
          borderRadius:"999px", padding:"1px 7px", fontWeight:600, fontSize:"0.75rem",
        }}>
          🎚️ {LEVEL_LABELS[issue.currentLevel]}
        </span>
      </div>

      {/* Upvote bar */}
      <div style={{ marginTop: "0.75rem", display: "flex",
        alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={handleUpvote}
          disabled={upvoting}
          style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            background: voted ? "#dbeafe" : "#f3f4f6",
            color: voted ? "#2563eb" : "#374151",
            border: voted ? "1px solid #93c5fd" : "1px solid #d1d5db",
            borderRadius: "999px", padding: "5px 14px",
            fontWeight: 700, fontSize: "0.88rem", cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          👍 {upvoting ? "…" : upvotes}
          <span style={{ fontWeight: 400, fontSize: "0.8rem" }}>
            {voted ? " (voted)" : " upvote"}
          </span>
        </button>

        {/* Progress to next threshold */}
        {nextThreshold && (
          <div style={{ flex: 1, minWidth: 100 }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              fontSize: "0.72rem", color: "#6b7280", marginBottom: "2px" }}>
              <span>{upvotes} / {nextThreshold[1]} for <strong>{nextThreshold[0]}</strong></span>
            </div>
            <div style={{ background: "#e5e7eb", borderRadius: "999px", height: 5 }}>
              <div style={{
                background: nextThreshold[0] === "Critical" ? "#7c3aed"
                  : nextThreshold[0] === "High" ? "#dc2626" : "#d97706",
                width: `${Math.min((upvotes / nextThreshold[1]) * 100, 100)}%`,
                height: "100%", borderRadius: "999px",
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        )}

        {!nextThreshold && priority === "Critical" && (
          <span style={{ fontSize: "0.78rem", color: "#7c3aed", fontWeight: 700 }}>
            🔴 Critical — highest priority reached
          </span>
        )}
      </div>

      {upvoteMsg && (
        <p style={{ fontSize: "0.8rem", marginTop: "0.3rem",
          color: upvoteMsg.startsWith("🔺") ? "#7c3aed" : "#dc2626",
          fontWeight: 600 }}>
          {upvoteMsg}
        </p>
      )}

      {/* Reporter & date */}
      <div style={{ display: "flex", justifyContent: "space-between",
        marginTop: "0.5rem", flexWrap: "wrap", gap: "0.25rem" }}>
        {issue.reportedBy?.name && (
          <span className="issue-meta">
            👤 {issue.reportedBy.name}
          </span>
        )}
        <span className="issue-meta">
          🕐 {new Date(issue.createdAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </span>
      </div>

      {/* Assigned to */}
      {issue.assignedTo && (
        <p className="issue-meta" style={{ marginTop: "0.2rem" }}>
          🔧 Assigned: {issue.assignedTo.name} ({LEVEL_LABELS[issue.assignedTo.adminLevel]})
        </p>
      )}

      {/* Escalation trail */}
      {issue.escalationHistory?.length > 0 && (
        <details style={{ marginTop: "0.5rem" }}>
          <summary style={{ fontSize: "0.8rem", color: "#7c3aed",
            cursor: "pointer", fontWeight: 600 }}>
            🔺 Escalated {issue.escalationHistory.length}×
          </summary>
          <div style={{ marginTop: "0.3rem", paddingLeft: "0.6rem",
            borderLeft: "2px solid #ede9fe" }}>
            {issue.escalationHistory.map((e, i) => (
              <p key={i} style={{ fontSize: "0.76rem", color: "#6b7280", margin: "3px 0" }}>
                L{e.fromLevel}→L{e.toLevel} · {new Date(e.escalatedAt)
                  .toLocaleDateString("en-IN")} · {e.reason}
              </p>
            ))}
          </div>
        </details>
      )}

      {/* Media */}
      {issue.media?.length > 0 && (
        <div className="issue-media-container" style={{ marginTop: "0.5rem" }}>
          {issue.media.map((src, i) => (
            <div key={i} className="media-box">
              {src.startsWith("data:video")
                ? <video controls width="180" src={src} />
                : <img src={src} alt="issue media" width="180" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}