"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://api.panvic.in/api";

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

const avatarColor = (name = "") => {
  const colors = ["#6366f1", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed", "#db2777", "#0284c7"];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
};

function Avatar({ name, size = 40 }) {
  const color = avatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "15", border: `2px solid ${color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color, flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}

function Badge({ approved }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600,
      background: approved ? "#f0fdf4" : "#fffbeb",
      color: approved ? "#16a34a" : "#d97706",
      border: `1px solid ${approved ? "#86efac" : "#fde68a"}`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: approved ? "#16a34a" : "#f59e0b",
      }} />
      {approved ? "Approved" : "Pending"}
    </span>
  );
}

export default function AdminArchitectsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [approving, setApproving] = useState(null);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" | "list"

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

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const approveUser = async (userId, name) => {
    setApproving(userId);
    try {
      const res = await fetch(`${API_BASE}/arch-register/approve/${userId}`, { method: "PUT" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed");

      setUsers((p) => p.map((u) => (u.id === userId ? { ...u, is_approved: true } : u)));
      if (selected?.id === userId) setSelected((p) => ({ ...p, is_approved: true }));

      showToast("success", `${name} approved successfully`);
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

  const filtered = users.filter((u) => {
    const statusOk =
      filter === "all" ||
      (filter === "pending" && !u.is_approved) ||
      (filter === "approved" && u.is_approved);

    const q = search.toLowerCase();
    return (
      statusOk &&
      (!q ||
        [u.full_name, u.email, u.firm_name, u.mobile_number]
          .some((v) => v?.toLowerCase().includes(q)))
    );
  });

  const counts = {
    all: users.length,
    pending: users.filter((u) => !u.is_approved).length,
    approved: users.filter((u) => u.is_approved).length,
  };

  return (
    <>
      <style>{css}</style>
      <div style={s.page}>
        {/* Header */}
        <header style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.logoBox}>🏛️</div>
            <div>
              <h1 style={s.headerTitle}>Architect Registry</h1>
              <p style={s.headerSub}>Admin • Approval Dashboard</p>
            </div>
          </div>
          <button style={s.refreshBtn} onClick={fetchUsers}>
            ↻ Refresh
          </button>
        </header>

        <div style={s.body}>
          {/* Stats */}
          <div style={s.statsRow}>
            {[
              { label: "Total", value: counts.all, color: "#6366f1" },
              { label: "Pending", value: counts.pending, color: "#d97706" },
              { label: "Approved", value: counts.approved, color: "#16a34a" },
            ].map((stat) => (
              <div key={stat.label} style={{ ...s.statCard, borderLeft: `4px solid ${stat.color}` }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={s.controls}>
            <div style={s.tabs}>
              {["all", "pending", "approved"].map((tab) => (
                <button
                  key={tab}
                  style={{ ...s.tab, ...(filter === tab ? s.tabActive : {}) }}
                  onClick={() => setFilter(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span style={s.tabPill}>{counts[tab]}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={s.searchWrap}>
                <input
                  type="text"
                  placeholder="Search architects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={s.searchInput}
                />
              </div>

              <div style={s.viewToggle}>
                <button
                  style={{ ...s.viewBtn, ...(viewMode === "table" ? s.viewBtnActive : {}) }}
                  onClick={() => setViewMode("table")}
                >
                  Table
                </button>
                <button
                  style={{ ...s.viewBtn, ...(viewMode === "list" ? s.viewBtnActive : {}) }}
                  onClick={() => setViewMode("list")}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Table View */}
          {viewMode === "table" && !loading && !error && filtered.length > 0 && (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th>Architect</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Firm</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} onClick={() => setSelected(user)}>
                      <td>
                        <div style={s.nameCell}>
                          <Avatar name={user.full_name} size={36} />
                          <div>
                            <div style={s.cellName}>{user.full_name}</div>
                            <div style={s.cellFirm}>{user.profession || "Architect"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={s.tdMeta}>{user.email}</td>
                      <td style={s.tdMeta}>{user.mobile_number}</td>
                      <td style={s.tdMeta}>{user.firm_name || "—"}</td>
                      <td>
                        <Badge approved={user.is_approved} />
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {!user.is_approved ? (
                          <button
                            style={s.approveBtn}
                            disabled={approving === user.id}
                            onClick={() => approveUser(user.id, user.full_name)}
                          >
                            {approving === user.id ? "Approving..." : "Approve"}
                          </button>
                        ) : (
                          <span style={s.doneRow}>✓ Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Minimal List / Card View */}
          {viewMode === "list" && !loading && !error && filtered.length > 0 && (
            <div style={s.listGrid}>
              {filtered.map((user) => (
                <div key={user.id} style={s.card} onClick={() => setSelected(user)}>
                  <div style={s.cardTop}>
                    <Avatar name={user.full_name} size={52} />
                    <div style={s.cardInfo}>
                      <div style={s.cardName}>{user.full_name}</div>
                      <div style={s.cardFirm}>{user.firm_name || "Independent Architect"}</div>
                      <div style={s.cardMeta}>
                        <div>{user.email}</div>
                        <div>{user.mobile_number}</div>
                      </div>
                      <Badge approved={user.is_approved} />
                    </div>
                  </div>

                  {!user.is_approved && (
                    <button
                      style={s.approveBtn}
                      disabled={approving === user.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        approveUser(user.id, user.full_name);
                      }}
                    >
                      {approving === user.id ? "Approving..." : "Approve Architect"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Loading / Empty / Error States */}
          {loading && <div style={s.center}>Loading architects...</div>}
          {error && <div style={s.errorBox}>{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div style={s.center}>No architects found</div>
          )}
        </div>

        {/* Drawer & Toast remain the same (you can keep your existing drawer code) */}
        {/* ... (keep your drawer and toast logic) */}
      </div>
    </>
  );
}

/* ==================== STYLES ==================== */
const s = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" },
  header: { padding: "16px 32px", background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  logoBox: { fontSize: 24 },
  headerTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a" },
  headerSub: { fontSize: 13, color: "#64748b" },

  body: { padding: "32px", maxWidth: 1280, margin: "0 auto" },

  statsRow: { display: "flex", gap: 16, marginBottom: 32 },
  statCard: { flex: 1, background: "#fff", padding: "20px 24px", borderRadius: 12, border: "1px solid #e2e8f0" },
  statLabel: { fontSize: 13, color: "#64748b", marginTop: 4 },

  controls: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 },

  tabs: { display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4 },
  tab: { padding: "8px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, transition: "all 0.2s" },
  tabActive: { background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" },
  tabPill: { marginLeft: 8, background: "#e2e8f0", padding: "2px 8px", borderRadius: 999, fontSize: 12 },

  searchWrap: { position: "relative", width: 320 },
  searchInput: {
    width: "100%", padding: "10px 16px", border: "1px solid #e2e8f0",
    borderRadius: 10, fontSize: 14, background: "#fff"
  },

  viewToggle: { display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 4 },
  viewBtn: { padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600 },
  viewBtnActive: { background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },

  tableWrap: { background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "14px 20px", borderBottom: "1px solid #f1f5f9" },
  tdMeta: { padding: "14px 20px", color: "#475569", fontSize: 14 },

  nameCell: { display: "flex", alignItems: "center", gap: 12 },
  cellName: { fontWeight: 600, color: "#0f172a" },
  cellFirm: { fontSize: 13, color: "#64748b" },

  listGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 },

  card: {
    background: "#fff", borderRadius: 14, padding: 20,
    border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s"
  },
  cardTop: { display: "flex", gap: 16, marginBottom: 16 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: 600 },
  cardFirm: { color: "#64748b", marginBottom: 8 },
  cardMeta: { fontSize: 14, color: "#475569", lineHeight: 1.5 },

  approveBtn: {
    background: "#2563eb", color: "white", border: "none", padding: "10px 20px",
    borderRadius: 10, fontWeight: 600, cursor: "pointer", width: "100%"
  },
  doneRow: { color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 },

  center: { textAlign: "center", padding: "80px 20px", color: "#64748b", fontSize: 16 },
  errorBox: { color: "#dc2626", background: "#fef2f2", padding: 16, borderRadius: 10, border: "1px solid #fecaca" },
};

const css = `
  tr:hover { background: #f8fafc !important; }
  .card:hover { border-color: #3b82f6; box-shadow: 0 10px 25px -5px rgba(59,130,246,0.1); transform: translateY(-2px); }
`;