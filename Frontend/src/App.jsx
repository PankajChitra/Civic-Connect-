// src/App.jsx  — only routing lives here now
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar          from "./components/Navbar";
import ReportPage      from "./pages/ReportPage";
import IssuesPage      from "./pages/IssuesPage";
import MapPage         from "./pages/MapPage";
import AdminLoginPage  from "./pages/AdminLoginPage";
import AdminPage       from "./pages/AdminPage";
import { useAuth }     from "./context/AuthContext";
import "./App.css";

function ProtectedAdmin({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/admin-login" />;
}

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="page">
          <Routes>
            <Route path="/"            element={<ReportPage />} />
            <Route path="/issues"      element={<IssuesPage />} />
            <Route path="/map-view"    element={<MapPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin"       element={
              <ProtectedAdmin><AdminPage /></ProtectedAdmin>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}