// src/components/LoadingSpinner.jsx
import React from "react";

export default function LoadingSpinner({ message = "Loading…" }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
      <div style={{
        width: 40, height: 40, border: "4px solid #e5e7eb",
        borderTop: "4px solid #2563eb", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto 1rem",
      }} />
      <p>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
