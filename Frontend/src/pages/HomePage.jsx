// src/pages/HomePage.jsx — Landing page
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth }   from "../context/AuthContext";
import { useIssues } from "../context/IssueContext";
import { CATEGORY_ICONS, CATEGORIES, STATUS_STYLES } from "../constants";

// ── Tiny animation wrapper ────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, y = 20 }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

// ── Stat box ──────────────────────────────────────────────────────────────────
const StatBox = ({ value, label, icon, color }) => (
  <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem 1.5rem",
    boxShadow: "0 4px 14px rgba(0,0,0,0.07)", textAlign: "center", flex: "1 1 120px" }}>
    <div style={{ fontSize: "2rem" }}>{icon}</div>
    <div style={{ fontSize: "1.8rem", fontWeight: 800, color, lineHeight: 1.2,
      marginTop: "0.25rem" }}>{value}</div>
    <div style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: "0.2rem" }}>{label}</div>
  </div>
);

// ── Feature card ──────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc }) => (
  <div style={{ background: "#fff", borderRadius: 14, padding: "1.5rem",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    borderTop: "3px solid #2563eb" }}>
    <div style={{ fontSize: "2.2rem", marginBottom: "0.6rem" }}>{icon}</div>
    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1f2937",
      marginBottom: "0.4rem" }}>{title}</h3>
    <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6 }}>{desc}</p>
  </div>
);

// ── Step card ─────────────────────────────────────────────────────────────────
const StepCard = ({ num, icon, title, desc }) => (
  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
    <div style={{ width: 42, height: 42, borderRadius: "50%",
      background: "#2563eb", color: "#fff", fontWeight: 800, fontSize: "1.1rem",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {num}
    </div>
    <div>
      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1f2937",
        marginBottom: "0.2rem" }}>
        {icon} {title}
      </h4>
      <p style={{ fontSize: "0.855rem", color: "#6b7280", lineHeight: 1.55 }}>{desc}</p>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const { issues, fetchIssues, loading } = useIssues();
  const navigate = useNavigate();

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const resolved   = issues.filter(i => i.status === "Resolved").length;
  const pending    = issues.filter(i => i.status === "Pending").length;
  const escalated  = issues.filter(i => i.status === "Escalated").length;
  const critical   = issues.filter(i => i.priority === "Critical").length;

  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: "4rem" }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <FadeIn>
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
          borderRadius: 20, padding: "4rem 2.5rem", textAlign: "center",
          marginBottom: "2.5rem", position: "relative", overflow: "hidden",
        }}>
          {/* Background pattern */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.07,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px", pointerEvents: "none" }} />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>🏘️</div>
            <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 900,
              color: "#fff", lineHeight: 1.2, marginBottom: "1rem" }}>
              CivicConnect
            </h1>
            <p style={{ fontSize: "clamp(0.95rem, 2.5vw, 1.2rem)",
              color: "#bfdbfe", maxWidth: 600, margin: "0 auto 2rem",
              lineHeight: 1.65 }}>
              Your neighbourhood's voice. Report civic issues, rally community support,
              and watch authorities take action — all in one place.
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center",
              flexWrap: "wrap" }}>
              {isLoggedIn ? (
                <>
                  <Link to="/report" style={{
                    background: "#fff", color: "#2563eb",
                    padding: "0.8rem 2rem", borderRadius: 999,
                    fontWeight: 800, fontSize: "1rem", textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    transition: "transform 0.2s",
                  }}>
                    📍 Report an Issue
                  </Link>
                  <Link to="/issues" style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "2px solid rgba(255,255,255,0.5)",
                    color: "#fff", padding: "0.8rem 2rem",
                    borderRadius: 999, fontWeight: 700,
                    fontSize: "1rem", textDecoration: "none",
                  }}>
                    🧾 View Issues
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" style={{
                    background: "#fff", color: "#2563eb",
                    padding: "0.8rem 2.25rem", borderRadius: 999,
                    fontWeight: 800, fontSize: "1rem", textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                  }}>
                    🚀 Get Started — Sign Up
                  </Link>
                  <Link to="/login" style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "2px solid rgba(255,255,255,0.5)",
                    color: "#fff", padding: "0.8rem 2rem",
                    borderRadius: 999, fontWeight: 700,
                    fontSize: "1rem", textDecoration: "none",
                  }}>
                    Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </FadeIn>

      {/* ── Live stats ────────────────────────────────────────────────────── */}
      <FadeIn delay={0.1}>
        <h2 style={{ textAlign: "center", fontSize: "1.1rem", fontWeight: 700,
          color: "#6b7280", letterSpacing: "0.05em", textTransform: "uppercase",
          marginBottom: "1rem" }}>
          Live Community Stats
        </h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap",
          marginBottom: "2.5rem", justifyContent: "center" }}>
          <StatBox value={issues.length} label="Total Issues"  icon="📋" color="#2563eb" />
          <StatBox value={resolved}      label="Resolved"      icon="✅" color="#16a34a" />
          <StatBox value={pending}       label="Pending"       icon="⏳" color="#d97706" />
          <StatBox value={escalated}     label="Escalated"     icon="🔺" color="#7c3aed" />
          <StatBox value={critical}      label="Critical"      icon="🚨" color="#dc2626" />
        </div>
      </FadeIn>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <FadeIn delay={0.15}>
        <div style={{ background: "#f0f9ff", borderRadius: 18, padding: "2rem",
          marginBottom: "2.5rem" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 800,
            color: "#1e3a8a", marginBottom: "1.75rem" }}>
            How CivicConnect Works
          </h2>
          <div style={{ display: "grid", gap: "1.5rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <StepCard num="1" icon="✍️" title="Sign Up as a Citizen"
              desc="Create a free account. Provide your ward and district so your reports reach the right local authority automatically." />
            <StepCard num="2" icon="📍" title="Report a Problem"
              desc="Pick a category, describe the issue, drop a pin on the map, and attach photos or videos. Your report goes live instantly." />
            <StepCard num="3" icon="👍" title="Upvote to Boost Priority"
              desc="Other citizens can upvote your issue. At 10 votes → Medium, 25 → High, 50 → Critical. More urgency means faster action." />
            <StepCard num="4" icon="🔺" title="Auto-Escalation"
              desc="If authorities at Ward level don't act within 48 hours, the issue automatically escalates to District, then City level." />
            <StepCard num="5" icon="🔧" title="Authorities Take Action"
              desc="Admins at each level can assign issues, update status, and add comments. You can follow the progress in real time." />
            <StepCard num="6" icon="✅" title="Resolution & Closure"
              desc="Once resolved, the issue is marked closed. The community can see the outcome and the track record of their local authorities." />
          </div>
        </div>
      </FadeIn>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <FadeIn delay={0.2}>
        <h2 style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 800,
          color: "#1f2937", marginBottom: "1.25rem" }}>
          Everything You Need
        </h2>
        <div style={{ display: "grid", gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginBottom: "2.5rem" }}>
          <FeatureCard icon="🗺️" title="Interactive Map"
            desc="See all reported issues pinned on a live map with colour-coded status markers." />
          <FeatureCard icon="🔒" title="Verified Citizens Only"
            desc="Only registered users can report and vote — no spam, no anonymous abuse." />
          <FeatureCard icon="📊" title="Priority Intelligence"
            desc="Community upvotes automatically elevate issue severity, ensuring critical problems get attention first." />
          <FeatureCard icon="🏛️" title="3-Tier Authority"
            desc="Ward → District → City admin hierarchy mirrors real governance. Issues always reach the right desk." />
          <FeatureCard icon="⏱️" title="Idle Auto-Escalation"
            desc="No more forgotten reports. Issues that go unanswered automatically climb to higher authorities." />
          <FeatureCard icon="📷" title="Photo & Video Evidence"
            desc="Attach visual proof to your reports. A picture is worth a thousand words to an authority." />
          <FeatureCard icon="💬" title="Admin Comments"
            desc="Authorities post updates directly on issues so citizens always know what's happening." />
          <FeatureCard icon="🚦" title="15 Issue Categories"
            desc="From potholes to noise pollution — comprehensive categories ensure every civic problem has a home." />
        </div>
      </FadeIn>

      {/* ── Categories showcase ───────────────────────────────────────────── */}
      <FadeIn delay={0.25}>
        <div style={{ background: "#fff", borderRadius: 18, padding: "2rem",
          boxShadow: "0 4px 14px rgba(0,0,0,0.06)", marginBottom: "2.5rem" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 800,
            color: "#1f2937", marginBottom: "0.4rem" }}>
            15 Issue Categories
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.88rem",
            marginBottom: "1.25rem" }}>
            Every civic problem has a category — and an authority responsible for it.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem",
            justifyContent: "center" }}>
            {CATEGORIES.map((cat) => (
              <span key={cat} style={{
                background: "#eff6ff", color: "#1d4ed8",
                border: "1px solid #bfdbfe", borderRadius: "999px",
                padding: "6px 14px", fontSize: "0.85rem", fontWeight: 500,
              }}>
                {CATEGORY_ICONS[cat]} {cat}
              </span>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ── Recent issues ─────────────────────────────────────────────────── */}
      {recentIssues.length > 0 && (
        <FadeIn delay={0.3}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800,
            color: "#1f2937", marginBottom: "1rem" }}>
            🕐 Recently Reported
          </h2>
          <div style={{ display: "grid", gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            marginBottom: "2.5rem" }}>
            {recentIssues.map((issue) => (
              <div key={issue._id} style={{ background: "#fff",
                border: "1px solid #e5e7eb", borderRadius: 12, padding: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700,
                    color: "#1f2937" }}>
                    {CATEGORY_ICONS[issue.category]} {issue.title}
                  </span>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap",
                    padding: "2px 8px", borderRadius: "999px",
                    background: STATUS_STYLES[issue.status]?.badge === "resolved" ? "#dcfce7"
                      : STATUS_STYLES[issue.status]?.badge === "progress" ? "#fef3c7"
                      : STATUS_STYLES[issue.status]?.badge === "escalated" ? "#ede9fe"
                      : "#fee2e2",
                    color: STATUS_STYLES[issue.status]?.color || "#dc2626",
                  }}>
                    {issue.status}
                  </span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: "0.3rem" }}>
                  📍 {issue.locationText || "Location not specified"}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between",
                  marginTop: "0.4rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                    👍 {issue.upvotes || 0} upvotes
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                    {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <Link to="/issues" style={{
              background: "#eff6ff", color: "#2563eb",
              border: "2px solid #bfdbfe", borderRadius: "999px",
              padding: "0.65rem 2rem", fontWeight: 700,
              fontSize: "0.95rem", textDecoration: "none",
            }}>
              View All Issues →
            </Link>
          </div>
        </FadeIn>
      )}

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <FadeIn delay={0.35}>
        <div style={{
          marginTop: "2.5rem",
          background: "linear-gradient(135deg, #1e3a8a, #7c3aed)",
          borderRadius: 20, padding: "3rem 2rem", textAlign: "center",
        }}>
          <h2 style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 900,
            color: "#fff", marginBottom: "0.75rem" }}>
            Ready to make a difference?
          </h2>
          <p style={{ color: "#c4b5fd", fontSize: "1rem", marginBottom: "1.75rem",
            maxWidth: 480, margin: "0 auto 1.75rem" }}>
            Join thousands of citizens already using CivicConnect to
            hold authorities accountable and improve their neighbourhoods.
          </p>
          <Link to={isLoggedIn ? "/report" : "/signup"} style={{
            background: "#fff", color: "#1e3a8a",
            padding: "0.85rem 2.5rem", borderRadius: 999,
            fontWeight: 900, fontSize: "1.05rem", textDecoration: "none",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            display: "inline-block",
          }}>
            {isLoggedIn ? "📍 Report an Issue" : "🚀 Start Here →"}
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}