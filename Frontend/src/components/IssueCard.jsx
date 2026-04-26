// src/components/IssueCard.jsx — pure UI, no API calls
import React from "react";
import StatusBadge from "./StatusBadge";
import { CATEGORY_ICONS, PRIORITY_STYLES, LEVEL_LABELS } from "../constants";

export default function IssueCard({ issue }) {
  const icon     = CATEGORY_ICONS[issue.category] || "📌";
  const priStyle = PRIORITY_STYLES[issue.priority] || PRIORITY_STYLES.Medium;

  return (
    <div className="issue-card">
      {/* ── Header row ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: "0.5rem" }}>
        <h3 style={{ margin: 0 }}>{icon} {issue.title}</h3>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap",
          justifyContent: "flex-end" }}>
          {/* Priority pill */}
          <span style={{
            fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px",
            borderRadius: "999px", background: priStyle.bg, color: priStyle.color,
            whiteSpace: "nowrap",
          }}>
            {issue.priority}
          </span>
          <StatusBadge status={issue.status} />
        </div>
      </div>

      <p style={{ marginTop: "0.4rem", color: "#374151", fontSize: "0.9rem" }}>
        {issue.description}
      </p>

      {/* ── Meta ───────────────────────────────────────────────────── */}
      <p className="issue-meta"><strong>Category:</strong> {issue.category}</p>
      <p className="issue-meta">
        <strong>Location:</strong> {issue.locationText || "Not specified"}
        {issue.ward && <span style={{ color: "#9ca3af" }}> · {issue.ward}</span>}
      </p>

      {/* ── Escalation level badge ─────────────────────────────────── */}
      <p className="issue-meta">
        <strong>Level:</strong>{" "}
        <span style={{
          background: issue.currentLevel === 3 ? "#fee2e2"
            : issue.currentLevel === 2 ? "#ede9fe" : "#dbeafe",
          color: issue.currentLevel === 3 ? "#dc2626"
            : issue.currentLevel === 2 ? "#7c3aed" : "#2563eb",
          borderRadius: "999px", padding: "1px 8px", fontSize: "0.78rem",
          fontWeight: 600,
        }}>
          {LEVEL_LABELS[issue.currentLevel] || "Ward"}
        </span>
      </p>

      {/* ── Upvotes + date ─────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginTop: "0.4rem" }}>
        <span className="issue-meta">
          👍 {issue.upvotes || 0} upvote{issue.upvotes !== 1 ? "s" : ""}
        </span>
        <span className="issue-meta">
          🕐 {new Date(issue.createdAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </span>
      </div>

      {/* ── Assigned to ────────────────────────────────────────────── */}
      {issue.assignedTo && (
        <p className="issue-meta" style={{ marginTop: "0.3rem" }}>
          👤 <strong>Assigned to:</strong> {issue.assignedTo.name}
          {" "}({LEVEL_LABELS[issue.assignedTo.adminLevel]})
        </p>
      )}

      {/* ── Escalation trail (collapsed) ──────────────────────────── */}
      {issue.escalationHistory?.length > 0 && (
        <details style={{ marginTop: "0.5rem" }}>
          <summary style={{ fontSize: "0.82rem", color: "#7c3aed", cursor: "pointer",
            fontWeight: 600 }}>
            🔺 Escalated {issue.escalationHistory.length} time(s)
          </summary>
          <div style={{ marginTop: "0.3rem", paddingLeft: "0.5rem",
            borderLeft: "2px solid #ede9fe" }}>
            {issue.escalationHistory.map((e, i) => (
              <p key={i} style={{ fontSize: "0.78rem", color: "#6b7280", margin: "3px 0" }}>
                L{e.fromLevel}→L{e.toLevel} ·{" "}
                {new Date(e.escalatedAt).toLocaleDateString("en-IN")} · {e.reason}
              </p>
            ))}
          </div>
        </details>
      )}

      {/* ── Media ──────────────────────────────────────────────────── */}
      {issue.media?.length > 0 && (
        <div className="issue-media-container" style={{ marginTop: "0.5rem" }}>
          {issue.media.map((src, i) => (
            <div key={i} className="media-box">
              {src.startsWith("data:video")
                ? <video controls width="200" src={src} />
                : <img src={src} alt="issue media" width="200" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}