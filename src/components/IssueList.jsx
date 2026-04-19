import React from "react";
import "../App.css";

export default function IssueList({ issues }) {
  return (
    <div className="page-container">
      <h2 className="form-title">🧾 Reported Issues</h2>

      {issues.length === 0 ? (
        <p className="empty-text">No issues reported yet.</p>
      ) : (
        <div className="issue-list">
          {issues.map((issue) => (
            <div key={issue.id} className="issue-card">
              <h3>{issue.title}</h3>
              <p>{issue.description}</p>

              <p className="issue-meta">
                <strong>Category:</strong> {issue.category}
              </p>

              {/* Manual Location */}
              <p className="issue-meta">
                <strong>Location:</strong>{" "}
                {issue.locationText ? issue.locationText : "Not specified"}
              </p>

              {/* Map Coordinates */}
              {issue.locationCoords && (
                <p className="issue-meta">
                  <strong>Coordinates:</strong> {issue.locationCoords.lat.toFixed(4)},{" "}
                  {issue.locationCoords.lng.toFixed(4)}
                </p>
              )}

              {/* Status */}
              <span
                className={`status-badge ${
                  issue.status === "Resolved"
                    ? "resolved"
                    : issue.status === "In Progress"
                    ? "progress"
                    : "pending"
                }`}
              >
                {issue.status}
              </span>

              {/* Media Preview */}
              {issue.media && issue.media.length > 0 && (
  <div className="issue-media-container">

    {issue.media.map((file, index) => (
      <div key={index} className="media-box">
        {file.startsWith("data:video") ? (
          <video controls width="200" src={file}></video>
        ) : (
          <img src={file} alt="issue media" width="200" />
        )}
      </div>
    ))}

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
