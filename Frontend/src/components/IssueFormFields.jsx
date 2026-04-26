// src/components/IssueFormFields.jsx
// Pure UI — receives everything via props, owns nothing.
import React from "react";
import { motion } from "framer-motion";
import MapPicker from "./MapPicker";
import { CATEGORIES } from "../constants";

export default function IssueFormFields({
  formData,
  submitting,
  error,
  success,
  onSubmit,
  onChange,
  onCategory,
  onLocationSelect,
  onMediaUpload,
  count,
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
        Total issues: <span>{count}</span>
      </p>

      {success && (
        <p style={{ color: "#16a34a", fontWeight: 600,
          textAlign: "center", marginBottom: "0.75rem" }}>
          ✅ Issue submitted successfully!
        </p>
      )}
      {error && (
        <p style={{ color: "#dc2626", fontWeight: 600,
          textAlign: "center", marginBottom: "0.75rem" }}>
          ❌ {error}
        </p>
      )}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text" name="title" value={formData.title}
            onChange={onChange} className="form-input"
            placeholder="e.g., Broken streetlight near park" required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description" value={formData.description}
            onChange={onChange} className="form-textarea"
            placeholder="Describe the issue clearly…" rows="4" required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-badges">
            {CATEGORIES.map((cat) => (
              <span
                key={cat}
                onClick={() => onCategory(cat)}
                className={`badge ${formData.category === cat ? "active" : ""}`}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Location (text)</label>
          <input
            type="text" name="locationText" value={formData.locationText}
            onChange={onChange} className="form-input"
            placeholder="e.g., Near Sector 7, Faridabad" required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Pin on Map (optional)</label>
          <MapPicker onLocationSelect={onLocationSelect} />
          {formData.locationCoords && (
            <p className="issue-meta" style={{ marginTop: 6 }}>
              📍 Lat: {formData.locationCoords.lat.toFixed(4)}, Lng:{" "}
              {formData.locationCoords.lng.toFixed(4)}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Upload Image / Video</label>
          <input
            type="file" accept="image/*,video/*"
            multiple onChange={onMediaUpload} className="form-input"
          />
          <div className="media-preview">
            {formData.media.map((m, i) => (
              <div key={i} className="media-item">
                {m.startsWith("data:video")
                  ? <video src={m} controls />
                  : <img src={m} alt="preview" />}
              </div>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="submit-btn"
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "Submit Issue"}
        </motion.button>
      </form>
    </motion.div>
  );
}
