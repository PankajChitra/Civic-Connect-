import React, { useState } from "react";
import { motion } from "framer-motion";
import MapPicker from "./MapPicker";
import "../App.css";

export default function ReportIssueForm({ onAddIssue, count }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Garbage",
    location: null,
    media: [],
  });

  const categories = ["Garbage", "Street Light", "Roads", "Water", "Other"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const media = files.map((file) => ({
      type: file.type.startsWith("video") ? "video" : "image",
      preview: URL.createObjectURL(file),
    }));
    setFormData({ ...formData, media });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newIssue = { id: Date.now(), ...formData };
    onAddIssue(newIssue);

    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "Garbage",
      location: null,
      media: [],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="form-container"
    >
      <p className="counter-text">
        You have submitted <span>{count}</span> issues this session.
      </p>

      <h2 className="form-title">📍 Report an Issue</h2>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. Pothole near school"
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            rows="4"
            placeholder="Describe the issue clearly..."
            required
          ></textarea>
        </div>

        {/* Category Badges */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-badges">
            {categories.map((cat) => (
              <span
                key={cat}
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`badge ${
                  formData.category === cat ? "active" : ""
                }`}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Map Picker */}
        <div className="form-group">
          <label className="form-label">Location</label>
          <MapPicker
            onLocationSelect={(loc) =>
              setFormData({ ...formData, location: loc })
            }
          />
          {formData.location && (
            <p className="issue-meta">
              Selected: Lat {formData.location.lat.toFixed(4)}, Lng{" "}
              {formData.location.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Upload Media */}
        <div className="form-group">
          <label className="form-label">Upload Image/Video</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaUpload}
            className="form-input"
          />
          <div className="media-preview">
            {formData.media.map((m, idx) => (
              <div key={idx} className="media-item">
                {m.type === "image" ? (
                  <img src={m.preview} alt="media" />
                ) : (
                  <video src={m.preview} controls />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <p className="issue-meta" style={{ fontStyle: "italic", marginTop: "8px" }}>
          Tip: Click on the map to place a marker, or press "📍 Use My Location" to pick automatically.
        </p>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="submit-btn"
        >
          Submit Issue
        </motion.button>
      </form>
    </motion.div>
  );
}
