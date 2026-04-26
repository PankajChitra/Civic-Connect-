// src/pages/AdminLoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const user = await login(email, password);
      // Any registered user can log in; admins get redirected to /admin
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: 460 }}>
      <h2 className="form-title">🔐 Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required autoComplete="username" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password" required autoComplete="current-password" />
        </div>

        {error && (
          <p style={{ color: "#dc2626", fontWeight: 500, marginTop: "0.5rem" }}>
            ❌ {error}
          </p>
        )}

        <button type="submit" className="submit-btn"
          style={{ marginTop: "1rem" }} disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>

      <p className="issue-meta" style={{ textAlign: "center", marginTop: "1rem" }}>
        No account?{" "}
        <Link to="/signup" style={{ color: "#2563eb", fontWeight: 600 }}>
          Sign up here
        </Link>
      </p>
    </div>
  );
}