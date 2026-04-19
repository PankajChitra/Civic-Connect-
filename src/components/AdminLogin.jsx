import React, { useState } from "react";
import "../App.css";

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Hardcoded credentials (for now)
    if (username === "admin" && password === "admin123") {
      onLogin();
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">🔐 Admin Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>

        {error && (
          <p style={{ color: "#dc2626", fontWeight: 500, marginTop: "0.5rem" }}>
            {error}
          </p>
        )}

        <button type="submit" className="submit-btn" style={{ marginTop: "1rem" }}>
          Login
        </button>
      </form>

      <p className="issue-meta" style={{ textAlign: "center", marginTop: "1rem" }}>
        Hint: Username <b>admin</b>, Password <b>admin123</b>
      </p>
    </div>
  );
}
