import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import ReportIssueForm from "./components/ReportIssueForm";
import IssueList from "./components/IssueList";
import AdminPage from "./components/AdminPage";
import AdminLogin from "./components/AdminLogin";
import AllIssuesMap from "./components/AllIssuesMap";
import "./App.css";

export default function App() {

  const storedIssues = localStorage.getItem("issues");
  const [issues, setIssues] = useState(
    storedIssues ? JSON.parse(storedIssues) : []
  );

  const [isAdmin, setIsAdmin] = useState(
    sessionStorage.getItem("isAdmin") === "true"
  );


  useEffect(() => {
    localStorage.setItem("issues", JSON.stringify(issues));
  }, [issues]);


  const addIssue = (newIssue) => {
    setIssues((prev) => {
      const updated = [...prev, newIssue];
      localStorage.setItem("issues", JSON.stringify(updated)); // save immediately
      return updated;
    });
  };


  const updateIssueStatus = (id, newStatus) => {
    setIssues((prev) => {
      const updated = prev.map((issue) =>
        issue.id === id ? { ...issue, status: newStatus } : issue
      );
      localStorage.setItem("issues", JSON.stringify(updated)); 
      return updated;
    });
  };

  const handleLogin = () => {
    setIsAdmin(true);
    sessionStorage.setItem("isAdmin", "true");
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem("isAdmin");
  };


  const clearAllIssues = () => {
    if (window.confirm("Are you sure you want to clear all issues?")) {
      setIssues([]);
      localStorage.removeItem("issues");
    }
  };

  return (
    <Router>
      <div className="app-container">
        {/* Navbar */}
        <nav className="navbar">
          <h1>Neighbourhood Issue Tracker</h1>
          <div className="navbar-links">
            <Link to="/">Report</Link>
            <Link to="/issues">View Issues</Link>
            <Link to="/map-view">Map View</Link>
            <Link to="/admin-login">Admin</Link>
            {isAdmin && (
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "#dc2626",
                  cursor: "pointer",
                  fontWeight: 600,
                  marginLeft: "1rem",
                }}
              >
                Logout
              </button>
            )}
          </div>
        </nav>

        {/* Main Routes */}
        <main className="page">
          <Routes>
            <Route
              path="/"
              element={
                <ReportIssueForm onAddIssue={addIssue} count={issues.length} />
              }
            />
            <Route path="/issues" element={<IssueList issues={issues} />} />
            <Route path="/map-view" element={<AllIssuesMap issues={issues} />} />
            <Route
              path="/admin-login"
              element={
                isAdmin ? (
                  <Navigate to="/admin" />
                ) : (
                  <AdminLogin onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/admin"
              element={
                isAdmin ? (
                  <AdminPage
                    issues={issues}
                    onStatusChange={updateIssueStatus}
                    onClearAll={clearAllIssues}
                  />
                ) : (
                  <Navigate to="/admin-login" />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
