// src/pages/ReportPage.jsx  ← Controller
import React from "react";
import IssueFormFields from "../components/IssueFormFields";
import { useIssueForm } from "../hooks/useIssueForm";
import { useIssues } from "../context/IssueContext";

export default function ReportPage() {
  const { addIssue, issues } = useIssues();

  const {
    formData, submitting, error, success,
    handleChange, handleCategory, handleLocationSelect,
    handleMediaUpload, handleSubmit,
  } = useIssueForm(addIssue);   // ← success callback updates global context

  return (
    <IssueFormFields
      formData={formData}
      submitting={submitting}
      error={error}
      success={success}
      count={issues.length}
      onSubmit={handleSubmit}
      onChange={handleChange}
      onCategory={handleCategory}
      onLocationSelect={handleLocationSelect}
      onMediaUpload={handleMediaUpload}
    />
  );
}
