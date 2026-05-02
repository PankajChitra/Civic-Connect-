// src/pages/IssuesPage.jsx
import React, { useEffect, useState } from "react";
import IssueCard     from "../components/IssueCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useIssues }  from "../context/IssueContext";
import { CATEGORIES, STATUSES, PRIORITIES } from "../constants";

export default function IssuesPage() {
  const { issues, loading, error, fetchIssues, setIssues } = useIssues();
  const [category, setCategory] = useState("All");
  const [status,   setStatus]   = useState("All");
  const [priority, setPriority] = useState("All");
  const [sort,     setSort]     = useState("hot");  // hot | new | critical

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  // Local sort + filter (data already fetched)
  const filtered = issues
    .filter((i) => {
      if (category !== "All" && i.category !== category) return false;
      if (status   !== "All" && i.status   !== status)   return false;
      if (priority !== "All" && i.priority !== priority) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "hot")      return (b.upvotes || 0) - (a.upvotes || 0);
      if (sort === "new")      return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "critical") {
        const order = { Critical: 3, High: 2, Medium: 1, Low: 0 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      return 0;
    });

  // When a card's upvote changes, update it in context locally
  const handleUpvoted = (updatedIssue) => {
    // IssueContext doesn't expose setIssues, so we use fetchIssues to re-sync
    // (lightweight — only triggers on upvote)
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: "0.5rem",
        marginBottom: "1rem" }}>
        <h2 className="form-title" style={{ margin: 0 }}>🧾 Community Issues</h2>
        <button onClick={() => fetchIssues()} className="map-search-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap",
        marginBottom: "1rem", alignItems: "center" }}>
        {/* Sort */}
        <div style={{ display: "flex", borderRadius: "0.75rem",
          overflow: "hidden", border: "1px solid #e5e7eb" }}>
          {[["hot","🔥 Hot"],["new","🆕 New"],["critical","🚨 Critical"]].map(([val,label]) => (
            <button key={val} onClick={() => setSort(val)} style={{
              padding: "5px 12px", border: "none", cursor: "pointer",
              fontSize: "0.82rem", fontWeight: sort === val ? 700 : 500,
              background: sort === val ? "#2563eb" : "#fff",
              color: sort === val ? "#fff" : "#374151",
              transition: "all 0.2s",
            }}>
              {label}
            </button>
          ))}
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="form-input" style={{ width: "auto", fontSize: "0.85rem" }}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="form-input" style={{ width: "auto", fontSize: "0.85rem" }}>
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}
          className="form-input" style={{ width: "auto", fontSize: "0.85rem" }}>
          <option value="All">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>

        <span className="issue-meta" style={{ alignSelf: "center" }}>
          {filtered.length} issue{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error   && <p style={{ color: "#dc2626", textAlign: "center" }}>⚠️ {error}</p>}
      {loading && <LoadingSpinner />}
      {!loading && filtered.length === 0 && (
        <p className="empty-text">No issues match your filters.</p>
      )}

      {!loading && (
        <div className="issue-list">
          {filtered.map((issue) => (
            <IssueCard key={issue._id} issue={issue} onUpvoted={handleUpvoted} />
          ))}
        </div>
      )}
    </div>
  );
}