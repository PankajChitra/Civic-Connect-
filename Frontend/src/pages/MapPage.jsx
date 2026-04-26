// src/pages/MapPage.jsx  ← Controller
import React, { useEffect } from "react";
import AllIssuesMap from "../components/AllIssuesMap";
import { useIssues } from "../context/IssueContext";

export default function MapPage() {
  const { issues, fetchIssues } = useIssues();

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  return <AllIssuesMap issues={issues} />;
}
