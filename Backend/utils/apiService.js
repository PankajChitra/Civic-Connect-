// src/services/api.js
// ─── Central Axios-free API layer using fetch ─────────────────────────────────
// Drop this file in Frontend/src/services/api.js
// Usage: import { issueAPI, authAPI } from "./services/api"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Helper: build headers with optional auth token ────────────────────────────
const headers = (auth = false) => {
  const h = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) h["Authorization"] = `Bearer ${token}`;
  }
  return h;
};

// ── Helper: throw on non-OK responses ────────────────────────────────────────
const handleRes = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name, email, password) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ name, email, password }),
    }).then(handleRes),

  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email, password }),
    }).then(handleRes),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, { headers: headers(true) }).then(handleRes),
};

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE API
// ─────────────────────────────────────────────────────────────────────────────
export const issueAPI = {
  // GET /api/issues?category=&status=&page=&limit=
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/issues${qs ? "?" + qs : ""}`, {
      headers: headers(),
    }).then(handleRes);
  },

  // GET /api/issues/:id
  getById: (id) =>
    fetch(`${BASE_URL}/issues/${id}`, { headers: headers() }).then(handleRes),

  // POST /api/issues  (anonymous OK, or with token)
  create: (issueData) =>
    fetch(`${BASE_URL}/issues`, {
      method: "POST",
      headers: headers(true),   // sends token if logged in, ignored if not
      body: JSON.stringify(issueData),
    }).then(handleRes),

  // PATCH /api/issues/:id/status  (admin)
  updateStatus: (id, status) =>
    fetch(`${BASE_URL}/issues/${id}/status`, {
      method: "PATCH",
      headers: headers(true),
      body: JSON.stringify({ status }),
    }).then(handleRes),

  // DELETE /api/issues/:id  (admin)
  delete: (id) =>
    fetch(`${BASE_URL}/issues/${id}`, {
      method: "DELETE",
      headers: headers(true),
    }).then(handleRes),

  // DELETE /api/issues  (admin — clear all)
  deleteAll: () =>
    fetch(`${BASE_URL}/issues`, {
      method: "DELETE",
      headers: headers(true),
    }).then(handleRes),

  // POST /api/issues/:id/upvote  (logged-in users)
  upvote: (id) =>
    fetch(`${BASE_URL}/issues/${id}/upvote`, {
      method: "POST",
      headers: headers(true),
    }).then(handleRes),
};
