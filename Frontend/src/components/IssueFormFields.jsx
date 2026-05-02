// src/components/IssueFormFields.jsx — pure UI, no logic
import React from "react";
import { motion } from "framer-motion";
import MapPicker from "./MapPicker";
import { CATEGORIES, CATEGORY_ICONS } from "../constants";

export default function IssueFormFields({
  formData, submitting, error, success, count,
  onSubmit, onChange, onCategory, onLocationSelect, onMediaUpload,
}) {
  return (
    <motion.div
      className="form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="form-title">📍 Report an Issue</h2>
      <p className="counter-text">
        Total issues reported in your area: <span>{count}</span>
      </p>

      {success && (
        <div style={{ background: "#dcfce7", border: "1px solid #86efac",
          borderRadius: "0.75rem", padding: "0.75rem 1rem",
          color: "#15803d", fontWeight: 600, textAlign: "center",
          marginBottom: "1rem" }}>
          ✅ Issue submitted! Thank you for keeping your neighbourhood safe.
        </div>
      )}
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5",
          borderRadius: "0.75rem", padding: "0.75rem 1rem",
          color: "#dc2626", fontWeight: 600, textAlign: "center",
          marginBottom: "1rem" }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={onSubmit}>
        {/* Title */}
        <div className="form-group">
          <label className="form-label">Title <span style={{ color: "#dc2626" }}>*</span></label>
          <input type="text" name="title" value={formData.title}
            onChange={onChange} className="form-input"
            placeholder="e.g., Overflowing drain near main market" required />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description <span style={{ color: "#dc2626" }}>*</span></label>
          <textarea name="description" value={formData.description}
            onChange={onChange} className="form-textarea"
            placeholder="Describe clearly — when did it start, how severe is it, who is affected…"
            rows="4" required />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category <span style={{ color: "#dc2626" }}>*</span></label>
          <div className="category-badges">
            {CATEGORIES.map((cat) => (
              <span key={cat}
                onClick={() => onCategory(cat)}
                className={`badge ${formData.category === cat ? "active" : ""}`}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Location text */}
        <div className="form-group">
          <label className="form-label">Location (text) <span style={{ color: "#dc2626" }}>*</span></label>
          <input type="text" name="locationText" value={formData.locationText}
            onChange={onChange} className="form-input"
            placeholder="e.g., Near Sector 7, opposite SBI Bank, Faridabad" required />
        </div>

        {/* Map picker */}
        <div className="form-group">
          <label className="form-label">Pin on Map
            <span style={{ color: "#6b7280", fontWeight: 400,
              fontSize: "0.8rem", marginLeft: "0.4rem" }}>(optional but recommended)</span>
          </label>
          <MapPicker onLocationSelect={onLocationSelect} />
          {formData.locationCoords && (
            <p className="issue-meta" style={{ marginTop: 6 }}>
              📍 Lat: {formData.locationCoords.lat.toFixed(4)}, Lng:{" "}
              {formData.locationCoords.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Media */}
        <div className="form-group">
          <label className="form-label">Upload Photo / Video
            <span style={{ color: "#6b7280", fontWeight: 400,
              fontSize: "0.8rem", marginLeft: "0.4rem" }}>(optional — helps authorities act faster)</span>
          </label>
          <input type="file" accept="image/*,video/*" multiple
            onChange={onMediaUpload} className="form-input" />
          {formData.media.length > 0 && (
            <div className="media-preview">
              {formData.media.map((m, i) => (
                <div key={i} className="media-item">
                  {m.startsWith("data:video")
                    ? <video src={m} controls />
                    : <img src={m} alt="preview" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upvote hint */}
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: "0.75rem", padding: "0.65rem 1rem",
          marginBottom: "0.75rem", fontSize: "0.85rem", color: "#1e40af" }}>
          💡 <strong>Tip:</strong> Other citizens can upvote your issue. At 10 upvotes it
          becomes <strong>Medium</strong> priority, 25 → <strong>High</strong>,
          50 → <strong>Critical</strong> — automatically notifying higher authorities.
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit" className="submit-btn" disabled={submitting}
        >
          {submitting ? "Submitting…" : "🚀 Submit Issue"}
        </motion.button>
      </form>
    </motion.div>
  );
}