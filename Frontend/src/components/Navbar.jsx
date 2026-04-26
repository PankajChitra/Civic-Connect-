// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LEVEL_LABELS } from "../constants";

export default function Navbar() {
  const { isAdmin, isLoggedIn, user, adminLevel, logout } = useAuth();
  const { pathname } = useLocation();

  const linkStyle = (path) => ({
    fontWeight: pathname === path ? 700 : 500,
    borderBottom: pathname === path ? "2px solid #2563eb" : "2px solid transparent",
    paddingBottom: "2px",
  });

  return (
    <nav className="navbar">
      <h1 style={{ fontSize: "1.1rem" }}>🏘️ CivicConnect</h1>

      <div className="navbar-links" style={{ display: "flex",
        alignItems: "center", flexWrap: "wrap", gap: "0.25rem" }}>
        <Link to="/"         style={linkStyle("/")}>Report</Link>
        <Link to="/issues"   style={linkStyle("/issues")}>Issues</Link>
        <Link to="/map-view" style={linkStyle("/map-view")}>Map</Link>

        {isAdmin && (
          <Link to="/admin" style={linkStyle("/admin")}>
            Admin
            <span style={{ marginLeft: "4px", fontSize: "0.7rem",
              background: adminLevel === 3 ? "#dc2626" : adminLevel === 2 ? "#7c3aed" : "#2563eb",
              color: "#fff", borderRadius: "999px", padding: "1px 6px", fontWeight: 700 }}>
              L{adminLevel}
            </span>
          </Link>
        )}

        {/* Guest links */}
        {!isLoggedIn && (
          <>
            <Link to="/signup"      style={linkStyle("/signup")}>Sign Up</Link>
            <Link to="/admin-login" style={linkStyle("/admin-login")}>Login</Link>
          </>
        )}

        {/* Logged-in user pill + logout */}
        {isLoggedIn && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem",
            marginLeft: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", background: "#f3f4f6",
              borderRadius: "999px", padding: "3px 10px", color: "#374151",
              fontWeight: 600 }}>
              👤 {user?.name} · {LEVEL_LABELS[adminLevel] || "Citizen"}
            </span>
            <button onClick={logout} style={{
              background: "none", border: "1px solid #dc2626",
              color: "#dc2626", borderRadius: "6px", padding: "3px 10px",
              cursor: "pointer", fontWeight: 600, fontSize: "0.82rem",
            }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}