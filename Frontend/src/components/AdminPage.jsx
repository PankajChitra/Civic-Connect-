import React, { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../App.css";

export default function AdminPage({ issues, onStatusChange }) {
  const [selectedIssue, setSelectedIssue] = useState(null);

  const handleCloseMap = () => {
    setSelectedIssue(null);
  };

  return (
    <div className="page-container">
      <h2 className="form-title">👨‍💼 Admin Dashboard</h2>
      <button
  onClick={() => {
    if (window.confirm("Are you sure you want to clear all issues?")) {
      localStorage.removeItem("issues");
      window.location.reload();
    }
  }}
  style={{
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "6px 10px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "10px",
  }}
>
  🧹 Clear All Issues
</button>

      {issues.length === 0 ? (
        <p className="empty-text">No reported issues yet.</p>
      ) : (
        <div className="issue-list">
          {issues.map((issue) => (
            <div key={issue.id} className="issue-card">
              <h3>{issue.title}</h3>
              <p>{issue.description}</p>

              <p className="issue-meta">
                <strong>Category:</strong> {issue.category}
              </p>

              <p className="issue-meta">
                <strong>Location:</strong>{" "}
                {issue.locationText ? issue.locationText : "Not specified"}
              </p>

              {issue.locationCoords && (
                <>
                  <p className="issue-meta">
                    <strong>Coordinates:</strong>{" "}
                    {issue.locationCoords.lat.toFixed(4)},{" "}
                    {issue.locationCoords.lng.toFixed(4)}
                  </p>
                  <button
                    className="map-view-btn"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    🌍 View on Map
                  </button>
                </>
              )}

              <div className="admin-status">
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

                <select
                  className="status-select"
                  value={issue.status}
                  onChange={(e) => onStatusChange(issue.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {issue.media && issue.media.length > 0 && (
                <div className="media-preview">
                  {issue.media.map((m, i) => (
                    <div key={i} className="media-item">
                      {m.type === "image" ? (
                        <img src={m.preview} alt="uploaded" />
                      ) : (
                        <video src={m.preview} controls />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedIssue && (
        <MapModal issue={selectedIssue} onClose={handleCloseMap} />
      )}
    </div>
  );
}

function MapModal({ issue, onClose }) {
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    if (!mapRef.current) return;
    if (mapRef.current._leaflet_id) mapRef.current._leaflet_id = null;

    const map = L.map(mapRef.current).setView(
      [issue.locationCoords.lat, issue.locationCoords.lng],
      14
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    L.marker([issue.locationCoords.lat, issue.locationCoords.lng]).addTo(map);

    return () => map.remove();
  }, [issue]);

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{issue.title}</h3>
        <div ref={mapRef} className="map-popup"></div>
        <button className="close-btn" onClick={onClose}>
          ✖ Close
        </button>
      </div>
    </div>
  );
}
