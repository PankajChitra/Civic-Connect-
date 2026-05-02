// src/pages/ReportPage.jsx
import React from "react";
import { Navigate, Link } from "react-router-dom";
import IssueFormFields from "../components/IssueFormFields";
import { useIssueForm } from "../hooks/useIssueForm";
import { useIssues }    from "../context/IssueContext";
import { useAuth }      from "../context/AuthContext";

export default function ReportPage() {
  const { isLoggedIn } = useAuth();
  const { addIssue, issues } = useIssues();
  const form = useIssueForm(addIssue);

  // Must be logged in to report
  if (!isLoggedIn) {
    return (
      <div className="form-container" style={{ textAlign: "center", maxWidth: 460 }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h2 className="form-title">Login Required</h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          You must be a registered citizen to report an issue.
          <br />This ensures accountability and prevents spam.
        </p>
        <div style={{ display: "flex", gap: "0.75rem",
          justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/login" className="submit-btn"
            style={{ display: "inline-block", width: "auto",
              padding: "0.65rem 1.5rem", textDecoration: "none" }}>
            Login
          </Link>
          <Link to="/signup"
            style={{ display: "inline-block", padding: "0.65rem 1.5rem",
              border: "2px solid #2563eb", borderRadius: "0.75rem",
              color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <IssueFormFields
      formData={form.formData}
      submitting={form.submitting}
      error={form.error}
      success={form.success}
      count={issues.length}
      onSubmit={form.handleSubmit}
      onChange={form.handleChange}
      onCategory={form.handleCategory}
      onLocationSelect={form.handleLocationSelect}
      onMediaUpload={form.handleMediaUpload}
    />
  );
}