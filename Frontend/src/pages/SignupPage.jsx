// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    ward: "", district: "", city: "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password,
        form.ward, form.district, form.city);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: 520 }}
    >
      <h2 className="form-title">🏘️ Create Account</h2>
      <p className="issue-meta" style={{ textAlign: "center", marginBottom: "1rem" }}>
        Join CivicConnect to track and report issues in your neighbourhood.
      </p>

      {error && (
        <p style={{ color: "#dc2626", fontWeight: 600, textAlign: "center",
          marginBottom: "0.75rem" }}>
          ❌ {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input name="name" type="text" className="form-input"
            value={form.name} onChange={handleChange}
            placeholder="e.g., Rahul Sharma" required />
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input name="email" type="email" className="form-input"
            value={form.email} onChange={handleChange}
            placeholder="you@example.com" required />
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <input name="password" type="password" className="form-input"
            value={form.password} onChange={handleChange}
            placeholder="Min. 6 characters" required />
        </div>

        {/* Confirm password */}
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input name="confirmPassword" type="password" className="form-input"
            value={form.confirmPassword} onChange={handleChange}
            placeholder="Repeat password" required />
        </div>

        {/* Divider */}
        <div style={{ margin: "1rem 0 0.5rem", borderTop: "1px solid #e5e7eb",
          paddingTop: "0.75rem" }}>
          <p className="form-label" style={{ color: "#6b7280", fontWeight: 500,
            fontSize: "0.82rem", marginBottom: "0.5rem" }}>
            📍 Jurisdiction (optional — helps route your reports correctly)
          </p>
        </div>

        {/* Ward */}
        <div className="form-group">
          <label className="form-label">Ward</label>
          <input name="ward" type="text" className="form-input"
            value={form.ward} onChange={handleChange}
            placeholder="e.g., Ward 12" />
        </div>

        {/* District */}
        <div className="form-group">
          <label className="form-label">District</label>
          <input name="district" type="text" className="form-input"
            value={form.district} onChange={handleChange}
            placeholder="e.g., South District" />
        </div>

        {/* City */}
        <div className="form-group">
          <label className="form-label">City</label>
          <input name="city" type="text" className="form-input"
            value={form.city} onChange={handleChange}
            placeholder="e.g., Faridabad" />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="submit-btn"
          style={{ marginTop: "1rem" }}
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create Account"}
        </motion.button>
      </form>

      <p className="issue-meta" style={{ textAlign: "center", marginTop: "1rem" }}>
        Already have an account?{" "}
        <Link to="/admin-login" style={{ color: "#2563eb", fontWeight: 600 }}>
          Log in
        </Link>
      </p>
    </motion.div>
  );
}