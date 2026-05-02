// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar         from "./components/Navbar";
import HomePage       from "./pages/HomePage";
import ReportPage     from "./pages/ReportPage";
import IssuesPage     from "./pages/IssuesPage";
import MapPage        from "./pages/MapPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPage      from "./pages/AdminPage";
import SignupPage     from "./pages/SignupPage";
import { useAuth }    from "./context/AuthContext";
import "./App.css";

function ProtectedAdmin({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/login" replace />;
}

function RedirectIfLoggedIn({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  if (isLoggedIn) return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  return children;
}

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="page">
          <Routes>
            <Route path="/"       element={<HomePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/map-view" element={<MapPage />} />

            <Route path="/signup" element={
              <RedirectIfLoggedIn><SignupPage /></RedirectIfLoggedIn>
            } />
            <Route path="/login" element={
              <RedirectIfLoggedIn><AdminLoginPage /></RedirectIfLoggedIn>
            } />

            {/* keep old /admin-login working */}
            <Route path="/admin-login" element={<Navigate to="/login" replace />} />

            <Route path="/admin" element={
              <ProtectedAdmin><AdminPage /></ProtectedAdmin>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}