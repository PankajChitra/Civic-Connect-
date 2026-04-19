import React, { useState } from "react";
import MapPicker from "./MapPicker";

export default function IssueForm({ onAddIssue }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Garbage",
    location: null,
    media: [],
  });

  // Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image/video uploads
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const media = files.map((file) => ({
      type: file.type.startsWith("video") ? "video" : "image",
      preview: URL.createObjectURL(file),
    }));
    setFormData({ ...formData, media });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const newIssue = { id: Date.now(), ...formData };
    onAddIssue(newIssue); // Add to parent state
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
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6 mt-8 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">📍 Report an Issue</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Broken streetlight near park"
            required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add details to help authorities"
            rows={4}
            required
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option>Garbage</option>
            <option>Street Light</option>
            <option>Roads</option>
            <option>Water</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Location</label>
          <MapPicker
            onLocationSelect={(loc) => setFormData({ ...formData, location: loc })}
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">Upload Image/Video</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaUpload}
            className="w-full border rounded-lg px-3 py-2 cursor-pointer"
          />
          <div className="flex gap-3 flex-wrap mt-2">
            {formData.media.map((m, idx) =>
              m.type === "image" ? (
                <img
                  key={idx}
                  src={m.preview}
                  alt="upload"
                  className="h-20 w-20 object-cover rounded-lg border"
                />
              ) : (
                <video
                  key={idx}
                  src={m.preview}
                  controls
                  className="h-20 w-20 object-cover rounded-lg border"
                />
              )
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Submit Issue
        </button>
      </form>
    </div>
  );
}
