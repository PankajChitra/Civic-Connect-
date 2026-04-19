import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const active = (path) =>
    location.pathname === path ? "text-blue-600 font-semibold" : "text-gray-700";

  return (
    <nav className="flex justify-between items-center px-6 py-3 shadow bg-white sticky top-0 z-50">
      <h1 className="font-bold text-xl text-blue-600">
        Neighbourhood Tracker
      </h1>
      <div className="space-x-6">
        <Link to="/" className={active("/")}>
          Home
        </Link>
        <Link to="/report" className={active("/report")}>
          Report
        </Link>
        <Link to="/issues" className={active("/issues")}>
          Issues
        </Link>
        <Link to="/map-view">Map View</Link>

      </div>
    </nav>
  );
}
