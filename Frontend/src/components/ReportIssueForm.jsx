import React, { useState } from "react";
import { motion } from "framer-motion";
import MapPicker from "./MapPicker";
import "../App.css";

export default function ReportIssueForm({ onAddIssue, count }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Garbage",
    locationText: "",
    locationCoords: null,
    media: [],
  });

  const categories = ["Garbage", "Street Light", "Roads", "Water", "Other"];

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ⭐ Fully Correct Base64 Media Upload
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result; // permanent Base64 string
        setFormData((prev) => ({
          ...prev,
          media: [...prev.media, base64String],
        }));
      };

      reader.readAsDataURL(file); // convert to Base64
    });
  };

  // Map picker callback
  const handleLocationSelect = (coords) => {
    setFormData({ ...formData, locationCoords: coords });
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const newIssue = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      locationText: formData.locationText,
      locationCoords: formData.locationCoords,
      media: formData.media, // ⭐ Base64 media gets saved
      status: "Pending",
    };

    onAddIssue(newIssue);

    alert("✅ Issue submitted successfully!");

    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "Garbage",
      locationText: "",
      locationCoords: null,
      media: [],
    });
  };

  return (
    <motion.div
      className="form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="form-title">📍 Report an Issue</h2>
      <p className="counter-text">
        You have submitted <span>{count}</span> issues this session.
      </p>

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
            placeholder="e.g., Broken streetlight near park"
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
            placeholder="Describe the issue clearly..."
            rows="4"
            required
          ></textarea>
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-badges">
            {categories.map((cat) => (
              <span
                key={cat}
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`badge ${formData.category === cat ? "active" : ""}`}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Manual Location Input */}
        <div className="form-group">
          <label className="form-label">Enter Location Details (Manual)</label>
          <input
            type="text"
            name="locationText"
            value={formData.locationText}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Near Sector 7, Faridabad"
            required
          />
        </div>

        {/* Map Picker */}
        <div className="form-group">
          <label className="form-label">Pick Location on Map</label>
          <MapPicker onLocationSelect={handleLocationSelect} />

          {formData.locationCoords && (
            <p className="issue-meta" style={{ marginTop: "6px" }}>
              📍 Lat: {formData.locationCoords.lat.toFixed(4)}, Lng:{" "}
              {formData.locationCoords.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Media Upload */}
        <div className="form-group">
          <label className="form-label">Upload Image/Video</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaUpload}
            className="form-input"
          />

          {/* Base64 Preview */}
          <div className="media-preview">
            {formData.media.map((m, idx) => (
              <div key={idx} className="media-item">
                {m.startsWith("data:video") ? (
                  <video src={m} controls />
                ) : (
                  <img src={m} alt="preview" />
                )}
              </div>
            ))}
          </div>
        </div>

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
