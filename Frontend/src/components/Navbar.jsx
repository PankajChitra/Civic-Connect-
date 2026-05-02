// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth }      from "../context/AuthContext";
import { LEVEL_LABELS } from "../constants";

export default function Navbar() {
  const { isAdmin, isLoggedIn, user, adminLevel, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const active = (path) => pathname === path;

  const linkCls = (path) => ({
    fontWeight: active(path) ? 700 : 500,
    color: active(path) ? "#2563eb" : "#374151",
    fontSize: "0.9rem",
    textDecoration: "none",
    paddingBottom: "2px",
    borderBottom: active(path) ? "2px solid #2563eb" : "2px solid transparent",
    transition: "all 0.2s",
  });

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: "none" }}>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#2563eb",
          cursor: "pointer" }}>
          🏘️ CivicConnect
        </h1>
      </Link>

      {/* Desktop links */}
      <div className="navbar-links" style={{ display: "flex",
        alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <Link to="/"         style={linkCls("/")}>Home</Link>
        <Link to="/issues"   style={linkCls("/issues")}>Issues</Link>
        <Link to="/map-view" style={linkCls("/map-view")}>Map</Link>

        {isLoggedIn && (
          <Link to="/report" style={{
            ...linkCls("/report"),
            background: "#2563eb", color: "#fff", borderBottom: "none",
            padding: "5px 14px", borderRadius: "999px", fontWeight: 700,
          }}>
            + Report
          </Link>
        )}

        {isAdmin && (
          <Link to="/admin" style={linkCls("/admin")}>
            Admin{" "}
            <span style={{
              marginLeft: 3, fontSize: "0.68rem", fontWeight: 800,
              background: adminLevel===3?"#dc2626":adminLevel===2?"#7c3aed":"#2563eb",
              color: "#fff", borderRadius: "999px", padding: "1px 6px",
            }}>
              L{adminLevel}
            </span>
          </Link>
        )}

        {!isLoggedIn ? (
          <>
            <Link to="/login"  style={linkCls("/login")}>Login</Link>
            <Link to="/signup" style={{
              ...linkCls("/signup"),
              background: "#eff6ff", border: "1.5px solid #bfdbfe",
              color: "#2563eb", padding: "4px 14px",
              borderRadius: "999px", borderBottom: "none",
            }}>
              Sign Up
            </Link>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.78rem", background: "#f3f4f6",
              borderRadius: "999px", padding: "3px 10px", color: "#374151",
              fontWeight: 600, maxWidth: 160,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              👤 {user?.name}
              {adminLevel > 0 && (
                <span style={{ color: "#7c3aed" }}>
                  {" "}· {LEVEL_LABELS[adminLevel]}
                </span>
              )}
            </span>
            <button onClick={logout} style={{
              background: "none", border: "1px solid #fca5a5",
              color: "#dc2626", borderRadius: "6px", padding: "3px 10px",
              cursor: "pointer", fontWeight: 600, fontSize: "0.8rem",
            }}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}