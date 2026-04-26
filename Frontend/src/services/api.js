const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const makeHeaders = (withAuth = false) => {
  const h = { "Content-Type": "application/json" };
  if (withAuth) {
    const token = localStorage.getItem("token");
    if (token) h["Authorization"] = `Bearer ${token}`;
  }
  return h;
};

const unwrap = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name, email, password, ward = "", district = "", city = "") =>
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST", headers: makeHeaders(),
      body: JSON.stringify({ name, email, password, ward, district, city }),
    }).then(unwrap),

  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: "POST", headers: makeHeaders(),
      body: JSON.stringify({ email, password }),
    }).then(unwrap),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, { headers: makeHeaders(true) }).then(unwrap),

  // level 2+ only
  promote: (userId, adminLevel, ward, district, city) =>
    fetch(`${BASE_URL}/auth/promote`, {
      method: "PATCH", headers: makeHeaders(true),
      body: JSON.stringify({ userId, adminLevel, ward, district, city }),
    }).then(unwrap),

  demote: (userId) =>
    fetch(`${BASE_URL}/auth/demote`, {
      method: "PATCH", headers: makeHeaders(true),
      body: JSON.stringify({ userId }),
    }).then(unwrap),

  getAdmins: () =>
    fetch(`${BASE_URL}/auth/admins`, { headers: makeHeaders(true) }).then(unwrap),
};

// ── Issues ────────────────────────────────────────────────────────────────────
export const issueAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return fetch(`${BASE_URL}/issues${qs ? "?" + qs : ""}`, {
      headers: makeHeaders(),
    }).then(unwrap);
  },

  getById: (id) =>
    fetch(`${BASE_URL}/issues/${id}`, { headers: makeHeaders() }).then(unwrap),

  create: (data) =>
    fetch(`${BASE_URL}/issues`, {
      method: "POST", headers: makeHeaders(true),
      body: JSON.stringify(data),
    }).then(unwrap),

  updateStatus: (id, status, comment = "") =>
    fetch(`${BASE_URL}/issues/${id}/status`, {
      method: "PATCH", headers: makeHeaders(true),
      body: JSON.stringify({ status, comment }),
    }).then(unwrap),

  assign: (id, adminId) =>
    fetch(`${BASE_URL}/issues/${id}/assign`, {
      method: "PATCH", headers: makeHeaders(true),
      body: JSON.stringify({ adminId }),
    }).then(unwrap),

  escalate: (id, reason = "") =>
    fetch(`${BASE_URL}/issues/${id}/escalate`, {
      method: "POST", headers: makeHeaders(true),
      body: JSON.stringify({ reason }),
    }).then(unwrap),

  setPriority: (id, priority) =>
    fetch(`${BASE_URL}/issues/${id}/priority`, {
      method: "PATCH", headers: makeHeaders(true),
      body: JSON.stringify({ priority }),
    }).then(unwrap),

  addComment: (id, text) =>
    fetch(`${BASE_URL}/issues/${id}/comment`, {
      method: "POST", headers: makeHeaders(true),
      body: JSON.stringify({ text }),
    }).then(unwrap),

  delete: (id) =>
    fetch(`${BASE_URL}/issues/${id}`, {
      method: "DELETE", headers: makeHeaders(true),
    }).then(unwrap),

  deleteAll: () =>
    fetch(`${BASE_URL}/issues`, {
      method: "DELETE", headers: makeHeaders(true),
    }).then(unwrap),

  upvote: (id) =>
    fetch(`${BASE_URL}/issues/${id}/upvote`, {
      method: "POST", headers: makeHeaders(true),
    }).then(unwrap),
};