// src/pages/AdminPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge    from "../components/StatusBadge";
import { useIssues }  from "../context/IssueContext";
import { useAuth }    from "../context/AuthContext";
import { authAPI, issueAPI } from "../services/api";
import {
  STATUSES, PRIORITIES, LEVEL_LABELS,
  STATUS_STYLES, PRIORITY_STYLES, CATEGORY_ICONS,
} from "../constants";

// ── Helpers ───────────────────────────────────────────────────────────────────
const StatCard = ({ label, val, color }) => (
  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
    padding: "0.6rem 1.2rem", minWidth: 90, textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
    <div style={{ fontSize: "1.5rem", fontWeight: 700, color }}>{val}</div>
    <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>{label}</div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1f2937",
    borderBottom: "2px solid #e5e7eb", paddingBottom: "0.4rem",
    marginBottom: "0.75rem", marginTop: "1.5rem" }}>
    {children}
  </h3>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { issues, loading, error, fetchIssues,
          updateStatus, escalateIssue, assignIssue,
          setPriority, deleteIssue, deleteAll } = useIssues();
  const { user, adminLevel } = useAuth();

  const [filterStatus,   setFilterStatus]   = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterLevel,    setFilterLevel]    = useState("All");
  const [selectedIssue,  setSelectedIssue]  = useState(null);
  const [admins,         setAdmins]         = useState([]);
  const [activeTab,      setActiveTab]      = useState("issues"); // issues | team

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  // Load admin list for assignment
  useEffect(() => {
    authAPI.getAdmins()
      .then((d) => setAdmins(d.admins))
      .catch(() => {});
  }, []);

  // Filter issues — admins only see issues at their level or below
  const filtered = issues.filter((i) => {
    if (filterStatus   !== "All" && i.status      !== filterStatus)   return false;
    if (filterPriority !== "All" && i.priority     !== filterPriority) return false;
    if (filterLevel    !== "All" && String(i.currentLevel) !== filterLevel) return false;
    // Ward admins (L1) only see L1 issues; district (L2) see L1+L2; city (L3) sees all
    if (i.currentLevel > adminLevel) return false;
    return true;
  });

  const act = async (fn, ...args) => {
    try { await fn(...args); }
    catch (e) { alert("Error: " + e.message); }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Delete ALL issues from the database?")) return;
    act(deleteAll);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const myIssues = issues.filter((i) => i.currentLevel <= adminLevel);
  const stats = [
    { label: "Visible",     val: myIssues.length,                                              color: "#2563eb" },
    { label: "Pending",     val: myIssues.filter(i=>i.status==="Pending").length,               color: "#dc2626" },
    { label: "In Progress", val: myIssues.filter(i=>i.status==="In Progress").length,           color: "#d97706" },
    { label: "Escalated",   val: myIssues.filter(i=>i.status==="Escalated").length,             color: "#7c3aed" },
    { label: "Resolved",    val: myIssues.filter(i=>i.status==="Resolved").length,              color: "#16a34a" },
    { label: "Critical",    val: myIssues.filter(i=>i.priority==="Critical").length,            color: "#7c3aed" },
  ];

  return (
    <div className="page-container">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: "0.75rem",
        marginBottom: "0.75rem" }}>
        <div>
          <h2 className="form-title" style={{ margin: 0 }}>👨‍💼 Admin Dashboard</h2>
          <p className="issue-meta" style={{ marginTop: 2 }}>
            Logged in as <strong>{user?.name}</strong> ·{" "}
            <span style={{
              background: adminLevel === 3 ? "#fee2e2" : adminLevel === 2 ? "#ede9fe" : "#dbeafe",
              color: adminLevel === 3 ? "#dc2626" : adminLevel === 2 ? "#7c3aed" : "#2563eb",
              borderRadius: "999px", padding: "1px 8px", fontSize: "0.78rem", fontWeight: 700,
            }}>
              {LEVEL_LABELS[adminLevel]}
            </span>
            {user?.ward     && <span className="issue-meta"> · {user.ward}</span>}
            {user?.district && <span className="issue-meta"> · {user.district}</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button onClick={() => fetchIssues()} className="map-search-btn">🔄 Refresh</button>
          {adminLevel >= 2 && (
            <button onClick={handleClearAll} style={{
              background: "#dc2626", color: "white", border: "none",
              borderRadius: "8px", padding: "6px 12px", fontWeight: 600, cursor: "pointer",
            }}>🧹 Clear All</button>
          )}
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap",
        marginBottom: "1.25rem" }}>
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem",
        borderBottom: "2px solid #e5e7eb" }}>
        {["issues", adminLevel >= 2 ? "team" : null].filter(Boolean).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: "none", border: "none", padding: "0.5rem 1rem",
            fontWeight: activeTab === tab ? 700 : 500, cursor: "pointer",
            borderBottom: activeTab === tab ? "3px solid #2563eb" : "3px solid transparent",
            color: activeTab === tab ? "#2563eb" : "#6b7280", marginBottom: "-2px",
            fontSize: "0.9rem", textTransform: "capitalize",
          }}>
            {tab === "issues" ? "📋 Issues" : "👥 Team"}
          </button>
        ))}
      </div>

      {/* ── Issues tab ─────────────────────────────────────────────────── */}
      {activeTab === "issues" && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap",
            marginBottom: "1rem" }}>
            {[
              { val: filterStatus,   set: setFilterStatus,   opts: ["All", ...STATUSES],     label: "Status" },
              { val: filterPriority, set: setFilterPriority, opts: ["All", ...PRIORITIES],   label: "Priority" },
              { val: filterLevel,    set: setFilterLevel,    opts: ["All","1","2","3"],       label: "Level" },
            ].map(({ val, set, opts, label }) => (
              <select key={label} value={val} onChange={(e) => set(e.target.value)}
                className="form-input" style={{ width: "auto", fontSize: "0.85rem" }}>
                {opts.map((o) => (
                  <option key={o} value={o}>
                    {label}: {o === "1" ? "Ward" : o === "2" ? "District" : o === "3" ? "City" : o}
                  </option>
                ))}
              </select>
            ))}
            <span className="issue-meta" style={{ alignSelf: "center" }}>
              {filtered.length} issue{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {error   && <p style={{ color: "#dc2626", textAlign: "center" }}>⚠️ {error}</p>}
          {loading && <LoadingSpinner />}
          {!loading && filtered.length === 0 && (
            <p className="empty-text">No issues match the current filters.</p>
          )}

          {!loading && (
            <div className="issue-list">
              {filtered.map((issue) => (
                <IssueAdminCard
                  key={issue._id}
                  issue={issue}
                  adminLevel={adminLevel}
                  admins={admins}
                  onStatusChange={(id, s, c) => act(updateStatus, id, s, c)}
                  onEscalate={(id, r)         => act(escalateIssue, id, r)}
                  onAssign={(id, aid)         => act(assignIssue, id, aid)}
                  onPriority={(id, p)         => act(setPriority, id, p)}
                  onDelete={(id)              => {
                    if (window.confirm("Delete this issue?")) act(deleteIssue, id);
                  }}
                  onMapView={() => setSelectedIssue(issue)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Team tab (level 2+) ─────────────────────────────────────────── */}
      {activeTab === "team" && adminLevel >= 2 && (
        <TeamPanel admins={admins} setAdmins={setAdmins} currentUser={user} currentLevel={adminLevel} />
      )}

      {/* ── Map modal ──────────────────────────────────────────────────── */}
      {selectedIssue && (
        <MapModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      )}
    </div>
  );
}

// ── Per-issue admin card ──────────────────────────────────────────────────────
function IssueAdminCard({
  issue, adminLevel, admins,
  onStatusChange, onEscalate, onAssign, onPriority, onDelete, onMapView,
}) {
  const [comment,       setComment]       = useState("");
  const [showComment,   setShowComment]   = useState(false);
  const [escalateInput, setEscalateInput] = useState("");
  const [showEscalate,  setShowEscalate]  = useState(false);
  const [assignId,      setAssignId]      = useState(issue.assignedTo?._id || "");

  const canAct = adminLevel >= issue.currentLevel;
  const priStyle = PRIORITY_STYLES[issue.priority] || PRIORITY_STYLES.Medium;

  return (
    <div className="issue-card" style={{
      borderLeft: `4px solid ${
        issue.priority === "Critical" ? "#7c3aed"
        : issue.priority === "High"   ? "#dc2626"
        : issue.priority === "Medium" ? "#d97706" : "#9ca3af"}`,
    }}>
      {/* Title row */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: "0.5rem" }}>
        <h3 style={{ margin: 0 }}>
          {CATEGORY_ICONS[issue.category]} {issue.title}
        </h3>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap",
          justifyContent: "flex-end" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px",
            borderRadius: "999px", background: priStyle.bg, color: priStyle.color }}>
            {issue.priority}
          </span>
          <StatusBadge status={issue.status} />
        </div>
      </div>

      <p style={{ marginTop: "0.35rem", fontSize: "0.88rem", color: "#374151" }}>
        {issue.description}
      </p>

      {/* Meta */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem",
        marginTop: "0.4rem" }}>
        <span className="issue-meta">📂 {issue.category}</span>
        <span className="issue-meta">📍 {issue.locationText || "No location"}</span>
        {issue.ward && <span className="issue-meta">🏘️ {issue.ward}</span>}
        <span className="issue-meta">
          🎚️{" "}
          <span style={{
            background: issue.currentLevel===3?"#fee2e2":issue.currentLevel===2?"#ede9fe":"#dbeafe",
            color: issue.currentLevel===3?"#dc2626":issue.currentLevel===2?"#7c3aed":"#2563eb",
            borderRadius:"999px", padding:"1px 7px", fontSize:"0.76rem", fontWeight:700,
          }}>
            {LEVEL_LABELS[issue.currentLevel]}
          </span>
        </span>
        <span className="issue-meta">👍 {issue.upvotes || 0}</span>
        <span className="issue-meta">
          🕐 {new Date(issue.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
        </span>
      </div>

      {issue.reportedBy && (
        <p className="issue-meta" style={{ marginTop: "0.25rem" }}>
          👤 Reporter: {issue.reportedBy.name} ({issue.reportedBy.email})
        </p>
      )}

      {/* Map view btn */}
      {issue.locationCoords && (
        <button className="map-view-btn" onClick={onMapView} style={{ marginTop: "0.4rem" }}>
          🌍 View on Map
        </button>
      )}

      {!canAct && (
        <p style={{ color: "#9ca3af", fontSize: "0.8rem", fontStyle: "italic",
          marginTop: "0.5rem" }}>
          ⚠️ This issue is at {LEVEL_LABELS[issue.currentLevel]} — you cannot act on it.
        </p>
      )}

      {/* ── Controls (only if canAct) ─────────────────────────────────── */}
      {canAct && (
        <div style={{ marginTop: "0.75rem", display: "flex",
          flexDirection: "column", gap: "0.6rem" }}>

          {/* Status + Priority row */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap",
            alignItems: "center" }}>
            <select className="status-select" value={issue.status}
              onChange={(e) => onStatusChange(issue._id, e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>

            <select className="status-select" value={issue.priority}
              onChange={(e) => onPriority(issue._id, e.target.value)}
              style={{ borderColor: priStyle.color }}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>

            {adminLevel >= 2 && (
              <button onClick={() => onDelete(issue._id)} style={{
                background: "#fee2e2", color: "#dc2626", border: "none",
                borderRadius: "6px", padding: "4px 10px",
                fontWeight: 600, cursor: "pointer", fontSize: "0.82rem",
              }}>🗑 Delete</button>
            )}
          </div>

          {/* Assign to admin */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center",
            flexWrap: "wrap" }}>
            <select className="status-select" value={assignId}
              onChange={(e) => setAssignId(e.target.value)}
              style={{ flex: 1, minWidth: 160 }}>
              <option value="">— Unassigned —</option>
              {admins
                .filter((a) => a.adminLevel >= issue.currentLevel)
                .map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({LEVEL_LABELS[a.adminLevel]})
                  </option>
                ))}
            </select>
            <button className="map-view-btn"
              onClick={() => onAssign(issue._id, assignId || null)}>
              Assign
            </button>
          </div>

          {/* Comment toggle */}
          <div>
            <button onClick={() => setShowComment((p) => !p)}
              style={{ background: "none", border: "none", color: "#2563eb",
                cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", padding: 0 }}>
              {showComment ? "▲ Hide comment" : "💬 Add comment / note"}
            </button>
            {showComment && (
              <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.5rem" }}>
                <input type="text" className="form-input" value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Internal note or update for citizens…"
                  style={{ flex: 1 }} />
                <button className="map-search-btn"
                  onClick={() => {
                    onStatusChange(issue._id, issue.status, comment);
                    setComment(""); setShowComment(false);
                  }}>
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Manual escalate */}
          {issue.currentLevel < 3 && (
            <div>
              <button onClick={() => setShowEscalate((p) => !p)}
                style={{ background: "none", border: "none", color: "#7c3aed",
                  cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", padding: 0 }}>
                {showEscalate ? "▲ Cancel" : "🔺 Escalate to next level"}
              </button>
              {showEscalate && (
                <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.5rem" }}>
                  <input type="text" className="form-input" value={escalateInput}
                    onChange={(e) => setEscalateInput(e.target.value)}
                    placeholder="Reason for escalation…" style={{ flex: 1 }} />
                  <button style={{
                    background: "#7c3aed", color: "#fff", border: "none",
                    borderRadius: "8px", padding: "6px 12px",
                    fontWeight: 600, cursor: "pointer",
                  }}
                    onClick={() => {
                      onEscalate(issue._id, escalateInput || "Manually escalated");
                      setEscalateInput(""); setShowEscalate(false);
                    }}>
                    Escalate
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Escalation history */}
      {issue.escalationHistory?.length > 0 && (
        <details style={{ marginTop: "0.6rem" }}>
          <summary style={{ fontSize: "0.82rem", color: "#7c3aed",
            cursor: "pointer", fontWeight: 600 }}>
            🔺 Escalation history ({issue.escalationHistory.length})
          </summary>
          <div style={{ marginTop: "0.3rem", paddingLeft: "0.75rem",
            borderLeft: "2px solid #ede9fe" }}>
            {issue.escalationHistory.map((e, i) => (
              <p key={i} style={{ fontSize: "0.78rem", color: "#6b7280", margin: "3px 0" }}>
                {new Date(e.escalatedAt).toLocaleString("en-IN")} ·
                L{e.fromLevel}→L{e.toLevel} · {e.reason}
                {e.escalatedBy ? ` · by ${e.escalatedBy.name}` : " · auto"}
              </p>
            ))}
          </div>
        </details>
      )}

      {/* Comments */}
      {issue.comments?.length > 0 && (
        <details style={{ marginTop: "0.5rem" }}>
          <summary style={{ fontSize: "0.82rem", color: "#2563eb",
            cursor: "pointer", fontWeight: 600 }}>
            💬 Comments ({issue.comments.length})
          </summary>
          <div style={{ marginTop: "0.3rem", paddingLeft: "0.75rem",
            borderLeft: "2px solid #dbeafe" }}>
            {issue.comments.map((c, i) => (
              <p key={i} style={{ fontSize: "0.82rem", color: "#374151", margin: "4px 0" }}>
                <strong>{c.author?.name || "Admin"}:</strong> {c.text}
                <span style={{ color: "#9ca3af", fontSize: "0.72rem", marginLeft: "6px" }}>
                  {new Date(c.createdAt).toLocaleDateString("en-IN")}
                </span>
              </p>
            ))}
          </div>
        </details>
      )}

      {/* Media */}
      {issue.media?.length > 0 && (
        <div className="media-preview" style={{ marginTop: "0.5rem" }}>
          {issue.media.map((src, i) => (
            <div key={i} className="media-item">
              {src.startsWith("data:video")
                ? <video src={src} controls />
                : <img src={src} alt="uploaded" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Team management panel (level 2+) ─────────────────────────────────────────
function TeamPanel({ admins, setAdmins, currentUser, currentLevel }) {
  const [userId,   setUserId]   = useState("");
  const [level,    setLevel]    = useState(1);
  const [ward,     setWard]     = useState("");
  const [district, setDistrict] = useState("");
  const [city,     setCity]     = useState("");
  const [msg,      setMsg]      = useState("");
  const [err,      setErr]      = useState("");

  const refresh = () =>
    authAPI.getAdmins().then((d) => setAdmins(d.admins)).catch(() => {});

  const handlePromote = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      const data = await authAPI.promote(userId, level, ward, district, city);
      setMsg(data.message);
      setUserId(""); setWard(""); setDistrict(""); setCity("");
      refresh();
    } catch (e2) { setErr(e2.message); }
  };

  const handleDemote = async (id, name) => {
    if (!window.confirm(`Demote ${name} to Citizen?`)) return;
    try {
      await authAPI.demote(id);
      refresh();
    } catch (e2) { alert(e2.message); }
  };

  const maxLevel = currentLevel === 3 ? 3 : currentLevel - 1;

  return (
    <div>
      <SectionTitle>👥 Admin Team</SectionTitle>

      {/* Current admins list */}
      {admins.length === 0 && <p className="empty-text">No admins found.</p>}
      <div style={{ display: "grid", gap: "0.6rem", marginBottom: "1.5rem" }}>
        {admins.map((a) => (
          <div key={a._id} style={{ background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: "10px", padding: "0.7rem 1rem",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <div>
              <strong>{a.name}</strong>
              <span style={{ marginLeft: "0.5rem", fontSize: "0.78rem",
                background: a.adminLevel===3?"#fee2e2":a.adminLevel===2?"#ede9fe":"#dbeafe",
                color: a.adminLevel===3?"#dc2626":a.adminLevel===2?"#7c3aed":"#2563eb",
                borderRadius:"999px", padding:"1px 7px", fontWeight:700 }}>
                {LEVEL_LABELS[a.adminLevel]}
              </span>
              <br />
              <span className="issue-meta">{a.email}</span>
              {a.ward     && <span className="issue-meta"> · {a.ward}</span>}
              {a.district && <span className="issue-meta"> · {a.district}</span>}
            </div>
            {a._id !== currentUser?._id && a.adminLevel < currentLevel && (
              <button onClick={() => handleDemote(a._id, a.name)} style={{
                background: "#fee2e2", color: "#dc2626", border: "none",
                borderRadius: "6px", padding: "4px 10px",
                fontWeight: 600, cursor: "pointer", fontSize: "0.82rem",
              }}>
                Demote
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Promote form */}
      <SectionTitle>➕ Promote a User to Admin</SectionTitle>
      <p className="issue-meta" style={{ marginBottom: "0.75rem" }}>
        Enter the MongoDB <strong>_id</strong> of the user you want to promote.
        You can find it in Atlas or via <code>GET /api/auth/me</code> after they log in.
      </p>
      {msg && <p style={{ color: "#16a34a", fontWeight: 600, marginBottom: "0.5rem" }}>✅ {msg}</p>}
      {err && <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: "0.5rem" }}>❌ {err}</p>}

      <form onSubmit={handlePromote} style={{ display: "grid", gap: "0.6rem",
        maxWidth: 480 }}>
        <input className="form-input" value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User MongoDB _id" required />

        <select className="form-input" value={level}
          onChange={(e) => setLevel(Number(e.target.value))}>
          {[1,2,3].filter((l) => l <= maxLevel).map((l) => (
            <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
          ))}
        </select>

        <input className="form-input" value={ward}
          onChange={(e) => setWard(e.target.value)} placeholder="Ward (for L1)" />
        <input className="form-input" value={district}
          onChange={(e) => setDistrict(e.target.value)} placeholder="District (for L2)" />
        {currentLevel === 3 && (
          <input className="form-input" value={city}
            onChange={(e) => setCity(e.target.value)} placeholder="City (for L3)" />
        )}

        <button type="submit" className="submit-btn" style={{ marginTop: 0 }}>
          Promote User
        </button>
      </form>
    </div>
  );
}

// ── Map modal ─────────────────────────────────────────────────────────────────
function MapModal({ issue, onClose }) {
  const mapRef = React.useRef(null);
  React.useEffect(() => {
    if (!mapRef.current) return;
    if (mapRef.current._leaflet_id) mapRef.current._leaflet_id = null;
    const map = L.map(mapRef.current).setView(
      [issue.locationCoords.lat, issue.locationCoords.lng], 14
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    L.marker([issue.locationCoords.lat, issue.locationCoords.lng])
      .addTo(map)
      .bindPopup(issue.title)
      .openPopup();
    return () => map.remove();
  }, [issue]);

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{issue.title}</h3>
        <div ref={mapRef} className="map-popup" />
        <button className="close-btn" onClick={onClose}>✖ Close</button>
      </div>
    </div>
  );
}