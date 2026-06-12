"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://api.panvic.in/api";

/* ─── Helpers ─── */
const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "?";

const AVATAR_PALETTES = [
  { bg: "#FEF3C7", fg: "#92400E" },
  { bg: "#DBEAFE", fg: "#1E40AF" },
  { bg: "#D1FAE5", fg: "#065F46" },
  { bg: "#FCE7F3", fg: "#9D174D" },
  { bg: "#EDE9FE", fg: "#4C1D95" },
  { bg: "#FFEDD5", fg: "#9A3412" },
  { bg: "#CFFAFE", fg: "#164E63" },
];
const getPalette = (name = "") =>
  AVATAR_PALETTES[(name.charCodeAt(0) || 0) % AVATAR_PALETTES.length];

/* ─── Days until next occurrence ─── */
function daysUntilNext(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  let next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next - today) / (1000 * 60 * 60 * 24));
}

/* ─── Sub-components ─── */
function Avatar({ name, size = 44 }) {
  const { bg, fg } = getPalette(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: "-0.5px",
    }}>
      {getInitials(name)}
    </div>
  );
}

function StatusBadge({ approved }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 600,
      background: approved ? "#ECFDF5" : "#FFFBEB",
      color: approved ? "#065F46" : "#92400E",
      border: `1px solid ${approved ? "#A7F3D0" : "#FDE68A"}`,
      letterSpacing: "0.01em",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: approved ? "#10B981" : "#F59E0B",
      }} />
      {approved ? "Active" : "Pending"}
    </span>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%",
      transform: "translateX(-50%)",
      background: toast.type === "success" ? "#064E3B" : "#7F1D1D",
      color: "#fff", padding: "13px 22px",
      borderRadius: 14, fontSize: 14, fontWeight: 500,
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
      zIndex: 999, whiteSpace: "nowrap",
      animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <span style={{ fontSize: 17 }}>{toast.type === "success" ? "✓" : "✕"}</span>
      {toast.message}
    </div>
  );
}

/* ─── Celebration Strip ─── */
function CelebrationStrip({ users }) {
  const items = [];

  users.forEach((u) => {
    const bd = daysUntilNext(u.date_of_birth);
    const ad = daysUntilNext(u.anniversary_date);
    if (bd !== null && bd <= 2) items.push({ user: u, days: bd, type: "birthday" });
    if (ad !== null && ad <= 2) items.push({ user: u, days: ad, type: "anniversary" });
  });

  items.sort((a, b) => a.days - b.days);

  if (!items.length) return null;

  const badge = (days) =>
    days === 0
      ? { text: "Today 🎂", bg: "#FEF3C7", color: "#92400E" }
      : days === 1
      ? { text: "Tomorrow", bg: "#D1FAE5", color: "#065F46" }
      : { text: "In 2 days", bg: "#F3F4F6", color: "#6B7280" };

  return (
    <div style={{ padding: "16px 16px 0", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Section heading */}
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
        color: "#9CA3AF", textTransform: "uppercase", marginBottom: 10,
      }}>
        🎁 Upcoming Celebrations
      </div>

      {items.map(({ user, days, type }) => {
        const b = badge(days);
        const cardBg   = days === 0 ? "#FFFBEB" : days === 1 ? "#ECFDF5" : "#fff";
        const cardBorder = days === 0 ? "#FDE68A" : days === 1 ? "#A7F3D0" : "#F3F4F6";
        return (
          <div
            key={`${user.id}-${type}`}
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 16, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 8,
            }}
          >
            <Avatar name={user.full_name} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                {type === "anniversary" ? "💍 Marriage anniversary" : "🎂 Birthday"}
                {" · "}
                {user.firm_name || "Independent"}
              </div>
              {user.mobile_number && (
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  📱 {user.mobile_number}
                </div>
              )}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "4px 10px",
              borderRadius: 99, background: b.bg, color: b.color,
              flexShrink: 0, whiteSpace: "nowrap",
            }}>
              {b.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Drawer ─── */
function ProfileDrawer({  user,
  onClose,
  onApprove,
  onDelete,
  approving, }) {
  if (!user) return null;
  const { bg, fg } = getPalette(user.full_name);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
          zIndex: 40, backdropFilter: "blur(2px)",
          animation: "fadeIn 0.2s ease",
        }}
      />
      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: "#fff",
        borderRadius: "24px 24px 0 0",
        zIndex: 50,
        maxHeight: "82vh",
        overflowY: "auto",
        animation: "sheetUp 0.32s cubic-bezier(0.34,1.4,0.64,1)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 0" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E5E7EB" }} />
        </div>

        {/* Hero */}
        <div style={{
          padding: "20px 24px 0",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: bg, color: fg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700,
          }}>
            {getInitials(user.full_name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              {user.full_name}
            </div>
            <div style={{ fontSize: 13.5, color: "#6B7280", marginTop: 3 }}>
              {user.profession || "Architect"} · {user.firm_name || "Independent"}
            </div>
            <div style={{ marginTop: 8 }}>
              <StatusBadge approved={user.is_approved} />
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#F3F4F6", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 16, color: "#6B7280",
            alignSelf: "flex-start",
          }}>✕</button>
        </div>

        {/* Detail rows */}
        <div style={{ padding: "24px 24px 0" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            color: "#9CA3AF", textTransform: "uppercase", marginBottom: 12,
          }}>
            Contact Details
          </div>
          {[
            { icon: "✉", label: "Email",       value: user.email },
            { icon: "📱", label: "Mobile",      value: user.mobile_number },
            { icon: "🏢", label: "Firm",        value: user.firm_name },
            { icon: "🪪", label: "License",     value: user.license_number },
            { icon: "📍", label: "City",        value: user.city },
            { icon: "🎂", label: "Birthday",    value: user.date_of_birth },
            { icon: "💍", label: "Anniversary", value: user.anniversary_date },
          ].map(({ icon, label, value }) =>
            value ? (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 0",
                borderBottom: "1px solid #F3F4F6",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "#F9FAFB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.03em" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 14, color: "#111827", marginTop: 1, fontWeight: 500 }}>
                    {value}
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>

        {/* CTA */}
<div style={{ padding: "20px 24px 32px" }}>
  {!user.is_approved ? (
    <button
      disabled={approving === user.id}
      onClick={() => onApprove(user.id, user.full_name)}
    >
      {approving === user.id
        ? "Approving…"
        : "✓ Approve Architect"}
    </button>
  ) : (
    <div>✓ Already Active</div>
  )}

  <button
    onClick={() => onDelete(user.id, user.full_name)}
    style={{
      width: "100%",
      height: 52,
      borderRadius: 14,
      background: "#FEF2F2",
      color: "#DC2626",
      border: "1px solid #FECACA",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      marginTop: 10,
    }}
  >
    🗑 Delete Architect
  </button>
</div>
      </div>
    </>
  );
}

/* ─── Architect Card ─── */
function ArchCard({
  user,
  onTap,
  onApprove,
  onDelete,
  approving,
}) {
  return (
    <div
      onClick={() => onTap(user)}
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1px solid #F3F4F6",
        padding: "16px 18px",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        fontFamily: "'DM Sans', sans-serif",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <Avatar name={user.full_name} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 700, color: "#111827",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {user.full_name}
          </div>
          <div style={{
            fontSize: 13, color: "#9CA3AF", marginTop: 2,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {user.firm_name || "Independent Architect"}
          </div>
        </div>
        <StatusBadge approved={user.is_approved} />
      </div>

      {/* Meta strip */}
      <div style={{
        marginTop: 13, paddingTop: 13,
        borderTop: "1px solid #F9FAFB",
        display: "flex", gap: 8, flexWrap: "wrap",
      }}>
        {user.email && (
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 12.5, color: "#6B7280",
            background: "#F9FAFB", borderRadius: 8, padding: "5px 10px",
            maxWidth: "100%",
          }}>
            <span style={{ fontSize: 13 }}>✉</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </span>
          </div>
        )}
        {user.mobile_number && (
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 12.5, color: "#6B7280",
            background: "#F9FAFB", borderRadius: 8, padding: "5px 10px",
          }}>
            <span style={{ fontSize: 13 }}>📱</span>
            {user.mobile_number}
          </div>
        )}
      </div>

      {/* Approve CTA */}
      {!user.is_approved && (
        <button
          disabled={approving === user.id}
          onClick={(e) => { e.stopPropagation(); onApprove(user.id, user.full_name); }}
          style={{
            marginTop: 13, width: "100%", height: 44,
            background: approving === user.id ? "#F3F4F6" : "#111827",
            color: approving === user.id ? "#9CA3AF" : "#fff",
            border: "none", borderRadius: 12,
            fontSize: 14, fontWeight: 700,
            cursor: approving === user.id ? "default" : "pointer",
            letterSpacing: "-0.1px",
            fontFamily: "'DM Sans', sans-serif",
            transition: "opacity 0.15s",
          }}
        >
          {approving === user.id ? "Approving…" : "Approve"}
        </button>
      )}<button
  onClick={(e) => {
    e.stopPropagation();
    onDelete(user.id, user.full_name);
  }}
  style={{
    width: "100%",
    height: 52,
    borderRadius: 14,
    background: "#FEF2F2",
    color: "#DC2626",
    border: "1px solid #FECACA",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 10,
  }}
>
  🗑 Delete Architect
</button>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AdminArchitectsPage() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [approving, setApproving] = useState(null);
  const [toast, setToast]       = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/arch-register/`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed to load");
      setUsers((data.data || []).filter((u) => u.role === "architect"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
const deleteUser = async (userId, name) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${name}?`
  );

  if (!confirmDelete) return;

  try {
    const res = await fetch(
      `${API_BASE}/arch-register/${userId}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.detail || "Delete failed");
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));

    if (selected?.id === userId) {
      setSelected(null);
    }

    showToast("success", `${name} deleted successfully`);
  } catch (err) {
    showToast("error", err.message);
  }
};
  const approveUser = async (userId, name) => {
    setApproving(userId);
    try {
      const res = await fetch(`${API_BASE}/arch-register/approve/${userId}`, { method: "PUT" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed");
      setUsers((p) => p.map((u) => u.id === userId ? { ...u, is_approved: true } : u));
      setSelected((p) => p?.id === userId ? { ...p, is_approved: true } : p);
      showToast("success", `${name} approved`);
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setApproving(null);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const counts = {
    all:      users.length,
    pending:  users.filter((u) => !u.is_approved).length,
    approved: users.filter((u) => u.is_approved).length,
  };

  const filtered = users.filter((u) => {
    const statusOk =
      filter === "all" ||
      (filter === "pending"  && !u.is_approved) ||
      (filter === "approved" &&  u.is_approved);
    const q = search.toLowerCase();
    return statusOk && (!q || [u.full_name, u.email, u.firm_name, u.mobile_number]
      .some((v) => v?.toLowerCase().includes(q)));
  });

  const TABS = [
    { key: "all",      label: "All" },
    { key: "pending",  label: "Pending" },
    { key: "approved", label: "Approved" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { background: #F8FAFC; margin: 0; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes sheetUp {
          from { transform: translateX(-50%) translateY(100%); }
          to   { transform: translateX(-50%) translateY(0); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input:focus { outline: none; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: 430,
        margin: "0 auto",
      }}>

        {/* ── Sticky Header ── */}
        <div style={{
          background: "#fff",
          padding: "18px 20px 0",
          position: "sticky", top: 0, zIndex: 20,
          borderBottom: "1px solid #F3F4F6",
        }}>
          {/* Title row */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 14,
          }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>
                Architects
              </div>
              <div style={{ fontSize: 12.5, color: "#9CA3AF", fontWeight: 500, marginTop: 1 }}>
                Approval Dashboard
              </div>
            </div>
            <button
              onClick={fetchUsers}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "#F9FAFB", border: "1px solid #F3F4F6",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 17, color: "#374151",
                transition: "transform 0.4s",
              }}
              title="Refresh"
            >
              ↻
            </button>
          </div>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#F9FAFB", border: "1.5px solid #F3F4F6",
            borderRadius: 14, padding: "0 14px", height: 44, marginBottom: 14,
          }}>
            <span style={{ fontSize: 16, color: "#9CA3AF" }}>🔍</span>
            <input
              type="text"
              placeholder="Search name, email, firm…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, border: "none", background: "none",
                fontSize: 14, color: "#111827",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            {search && (
              <span
                onClick={() => setSearch("")}
                style={{ fontSize: 14, color: "#9CA3AF", cursor: "pointer" }}
              >✕</span>
            )}
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex" }}>
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  flex: 1, padding: "10px 0", border: "none", background: "none",
                  cursor: "pointer", fontSize: 13.5, fontWeight: 600,
                  color: filter === key ? "#111827" : "#9CA3AF",
                  borderBottom: `2.5px solid ${filter === key ? "#111827" : "transparent"}`,
                  transition: "all 0.2s",
                  fontFamily: "'DM Sans', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                {label}
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 99,
                  background: filter === key ? "#111827" : "#F3F4F6",
                  color: filter === key ? "#fff" : "#9CA3AF",
                  transition: "all 0.2s",
                }}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10, padding: "16px 16px 0",
        }}>
          {[
            { label: "Total",    value: counts.all,      accent: "#6366F1", light: "#EEF2FF" },
            { label: "Pending",  value: counts.pending,  accent: "#F59E0B", light: "#FFFBEB" },
            { label: "Approved", value: counts.approved, accent: "#10B981", light: "#ECFDF5" },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{
              background: "#fff", borderRadius: 16,
              border: "1px solid #F3F4F6",
              padding: "14px 12px",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: 26, fontWeight: 800, color: accent,
                letterSpacing: "-1px", lineHeight: 1,
              }}>
                {loading ? "—" : value}
              </div>
              <div style={{
                fontSize: 11, color: "#9CA3AF", fontWeight: 600,
                marginTop: 5, letterSpacing: "0.04em", textTransform: "uppercase",
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Celebration Strip ── */}
        {!loading && <CelebrationStrip users={users} />}

        {/* ── List ── */}
        <div style={{ padding: "14px 16px 80px", display: "flex", flexDirection: "column", gap: 10 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⟳</div>
              <div style={{ fontSize: 15 }}>Loading architects…</div>
            </div>
          )}

          {error && !loading && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderRadius: 14, padding: "16px 18px",
              color: "#991B1B", fontSize: 14,
            }}>
              ⚠ {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏛️</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>No architects found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try changing your filter or search</div>
            </div>
          )}

          {!loading && !error && filtered.map((user, i) => (
            <div key={user.id} style={{ animation: `cardIn 0.35s ease ${i * 45}ms both` }}>
              <ArchCard
                user={user}
                onTap={setSelected}
                onApprove={approveUser}
                approving={approving}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Drawer ── */}
      {selected && (
<ProfileDrawer
  user={selected}
  onClose={() => setSelected(null)}
  onApprove={(id, name) => {
    setSelected(null);
    setTimeout(() => approveUser(id, name), 200);
  }}
  onDelete={(id, name) => {
    setSelected(null);
    setTimeout(() => deleteUser(id, name), 200);
  }}
  approving={approving}
/>
      )}

      {/* ── Toast ── */}
      <Toast toast={toast} />
    </>
  );
}
