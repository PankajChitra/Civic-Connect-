// src/pages/IssuesPage.jsx  ← Controller
import React, { useEffect, useState } from "react";
import IssueCard from "../components/IssueCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useIssues } from "../context/IssueContext";
import { CATEGORIES } from "../constants";

export default function IssuesPage() {
  const { issues, loading, error, fetchIssues } = useIssues();
  const [filter, setFilter] = useState("All");

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const filtered = filter === "All"
    ? issues
    : issues.filter((i) => i.category === filter);

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: "0.5rem",
        marginBottom: "1rem" }}>
        <h2 className="form-title" style={{ margin: 0 }}>🧾 Reported Issues</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input" style={{ width: "auto" }}
          >
            {["All", ...CATEGORIES].map((c) => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => fetchIssues()} className="map-search-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <p style={{ color: "#dc2626", textAlign: "center" }}>⚠️ {error}</p>}
      {loading && <LoadingSpinner />}
      {!loading && filtered.length === 0 && (
        <p className="empty-text">No issues found.</p>
      )}
      {!loading && (
        <div className="issue-list">
          {filtered.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
