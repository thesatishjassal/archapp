"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://api.panvic.in/api";

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

const avatarColor = (name = "") => {
  const colors = ["#6366f1","#0891b2","#059669","#d97706","#dc2626","#7c3aed","#db2777","#0284c7"];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
};

function Avatar({ name, size = 40 }) {
  const color = avatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: color + "18", border: `1.5px solid ${color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color, flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}

function Badge({ approved }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: approved ? "#f0fdf4" : "#fffbeb",
      color: approved ? "#16a34a" : "#d97706",
      border: `1px solid ${approved ? "#bbf7d0" : "#fde68a"}`,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: approved ? "#16a34a" : "#f59e0b", display: "inline-block",
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

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/arch-register/`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed to load");
      setUsers((data.data || []).filter((u) => u.role === "architect"));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const approveUser = async (userId, name) => {
    setApproving(userId);
    try {
      const res = await fetch(`${API_BASE}/arch-register/approve/${userId}`, { method: "PUT" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed");
      setUsers((p) => p.map((u) => u.id === userId ? { ...u, is_approved: true } : u));
      if (selected?.id === userId) setSelected((p) => ({ ...p, is_approved: true }));
      showToast("success", `${name} approved successfully`);
    } catch (err) { showToast("error", err.message); }
    finally { setApproving(null); }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = users.filter((u) => {
    const ok = filter === "all" || (filter === "pending" && !u.is_approved) || (filter === "approved" && u.is_approved);
    const q = search.toLowerCase();
    return ok && (!q || [u.full_name, u.email, u.firm_name].some((v) => v?.toLowerCase().includes(q)));
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
            <div style={s.logoBox}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5L1.5 6v10.5h15V6L9 1.5z" stroke="#2563eb" strokeWidth="1.6" strokeLinejoin="round"/>
                <rect x="6" y="10" width="6" height="6.5" rx="1" stroke="#2563eb" strokeWidth="1.4"/>
              </svg>
            </div>
            <div>
              <h1 style={s.headerTitle}>Architect Registry</h1>
              <p style={s.headerSub}>Admin · Approval Dashboard</p>
            </div>
          </div>
          <button style={s.refreshBtn} onClick={fetchUsers}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M11.5 6.5A5 5 0 102 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11.5 3.5v3H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Refresh
          </button>
        </header>

        <div style={s.body}>

          {/* Stats */}
          <div style={s.statsRow}>
            {[
              { label: "Total", value: counts.all, color: "#6366f1", bg: "#eef2ff" },
              { label: "Pending", value: counts.pending, color: "#d97706", bg: "#fffbeb" },
              { label: "Approved", value: counts.approved, color: "#16a34a", bg: "#f0fdf4" },
            ].map((stat) => (
              <div key={stat.label} style={{ ...s.statCard, background: stat.bg, borderColor: stat.color + "25" }}>
                <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={s.controls}>
            <div style={s.tabs}>
              {["all","pending","approved"].map((tab) => (
                <button key={tab} style={{ ...s.tab, ...(filter === tab ? s.tabActive : {}) }}
                  onClick={() => setFilter(tab)}>
                  {tab[0].toUpperCase() + tab.slice(1)}
                  <span style={{ ...s.tabPill, background: filter === tab ? "#dbeafe" : "#f1f5f9", color: filter === tab ? "#2563eb" : "#94a3b8" }}>
                    {counts[tab]}
                  </span>
                </button>
              ))}
            </div>
            <div style={s.searchWrap}>
              <svg style={s.searchIcon} width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                type="text" placeholder="Search name, email, firm…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                style={s.searchInput}
              />
              {search && <button style={s.clearBtn} onClick={() => setSearch("")}>✕</button>}
            </div>
          </div>

          {/* States */}
          {loading && (
            <div style={s.center}>
              <div style={s.spinner} className="spin" />
              <p style={s.stateText}>Loading architects…</p>
            </div>
          )}

          {error && !loading && (
            <div style={s.errorBox}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{flexShrink:0}}>
                <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M7.5 4.5v3.5M7.5 10.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {error}
              <button style={s.retryBtn} onClick={fetchUsers}>Retry</button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={s.center}>
              <div style={{fontSize:40,marginBottom:12}}>🏛️</div>
              <p style={{...s.stateText, fontWeight:600, color:"#374151"}}>No architects found</p>
              <p style={{...s.stateText, fontSize:13}}>
                {search ? "Try a different search term" : "Nothing in this category yet"}
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div style={s.grid}>
              {filtered.map((user, i) => (
                <div key={user.id}
                  style={{...s.card, animationDelay:`${i*0.04}s`}}
                  className="card-in"
                  onClick={() => setSelected(user)}>

                  <div style={s.cardTop}>
                    <Avatar name={user.full_name} size={44} />
                    <div style={s.cardInfo}>
                      <div style={s.cardName}>{user.full_name || "—"}</div>
                      <div style={s.cardFirm}>{user.firm_name || "Independent"}</div>
                    </div>
                    <Badge approved={user.is_approved} />
                  </div>

                  <div style={s.cardMeta}>
                    <span style={s.metaItem}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <rect x="0.5" y="1.5" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                        <path d="M0.5 4l5 3 5-3" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                      </svg>
                      {user.email}
                    </span>
                    {user.mobile_number && (
                      <span style={s.metaItem}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <rect x="2.5" y="0.5" width="6" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
                          <circle cx="5.5" cy="8.5" r="0.5" fill="currentColor"/>
                        </svg>
                        {user.mobile_number}
                      </span>
                    )}
                  </div>

                  <div style={s.cardDivider} />

                  {!user.is_approved ? (
                    <button
                      style={{...s.approveBtn, opacity: approving===user.id ? 0.7:1}}
                      disabled={approving===user.id}
                      onClick={(e) => { e.stopPropagation(); approveUser(user.id, user.full_name); }}>
                      {approving===user.id
                        ? <><span style={s.miniSpin} className="spin"/>Approving…</>
                        : <><Check/>Approve Architect</>}
                    </button>
                  ) : (
                    <div style={s.doneRow}><Check color="#16a34a"/>Account approved & active</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer */}
        {selected && (
          <>
            <div style={s.overlay} className="fade-in" onClick={() => setSelected(null)} />
            <aside style={s.drawer} className="drawer-in">
              <div style={s.drawerHead}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <Avatar name={selected.full_name} size={48} />
                  <div>
                    <div style={s.drawerName}>{selected.full_name}</div>
                    <Badge approved={selected.is_approved} />
                  </div>
                </div>
                <button style={s.closeBtn} onClick={() => setSelected(null)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <div style={s.drawerBody}>
                <Sec title="Personal">
                  <R label="Full Name" v={selected.full_name}/>
                  <R label="Email" v={selected.email}/>
                  <R label="Mobile" v={selected.mobile_number}/>
                  <R label="Date of Birth" v={selected.date_of_birth}/>
                  <R label="Marital Status" v={selected.marital_status}/>
                  <R label="Anniversary" v={selected.anniversary_date}/>
                </Sec>
                <Sec title="Professional">
                  <R label="Firm" v={selected.firm_name}/>
                  <R label="Profession" v={selected.profession}/>
                  <R label="Role" v={selected.role}/>
                  <R label="Account Status" v={selected.is_approved ? "Approved" : "Pending Approval"}/>
                </Sec>
                {(selected.bank_name || selected.account_number) && (
                  <Sec title="Banking">
                    <R label="Account Holder" v={selected.account_holder_name}/>
                    <R label="Bank" v={selected.bank_name}/>
                    <R label="Account No." v={selected.account_number}/>
                    <R label="IFSC" v={selected.ifsc_code}/>
                    <R label="UPI ID" v={selected.upi_id}/>
                  </Sec>
                )}
              </div>

              {!selected.is_approved && (
                <div style={s.drawerFoot}>
                  <button
                    style={{...s.approveBtn, padding:"12px 20px", fontSize:14, opacity:approving===selected.id?0.7:1}}
                    disabled={approving===selected.id}
                    onClick={() => approveUser(selected.id, selected.full_name)}>
                    {approving===selected.id
                      ? <><span style={s.miniSpin} className="spin"/>Approving…</>
                      : <><Check/>Approve This Architect</>}
                  </button>
                </div>
              )}
            </aside>
          </>
        )}

        {/* Toast */}
        {toast && (
          <div style={{...s.toast, ...(toast.type==="error" ? s.toastErr : s.toastOk)}} className="toast-in">
            {toast.type==="success"
              ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 7l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M7 4.5v3M7 10h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}

const Check = ({ color = "currentColor" }) => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M2.5 6.5l3 3 5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Sec = ({ title, children }) => (
  <div style={s.sec}>
    <div style={s.secTitle}>{title}</div>
    {children}
  </div>
);

const R = ({ label, v }) => v ? (
  <div style={s.row}>
    <span style={s.rowL}>{label}</span>
    <span style={s.rowV}>{v}</span>
  </div>
) : null;

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', 'Helvetica Neue', sans-serif; background: #f8fafc; }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: none; }
  }
  .card-in { animation: cardIn 0.3s cubic-bezier(.22,1,.36,1) both; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .fade-in { animation: fadeIn 0.2s ease both; }

  @keyframes drawerIn {
    from { opacity: 0; transform: translateX(30px); }
    to   { opacity: 1; transform: none; }
  }
  .drawer-in { animation: drawerIn 0.28s cubic-bezier(.22,1,.36,1) both; }

  @keyframes toastIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: none; }
  }
  .toast-in { animation: toastIn 0.25s ease both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.65s linear infinite; }

  input:focus { outline: none; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important; }
  input::placeholder { color: #94a3b8; }
  button:active:not(:disabled) { transform: scale(0.98); }
  a { text-decoration: none; }
  button { font-family: inherit; }
`;

const s = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans','Helvetica Neue',sans-serif" },

  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 32px",
    background: "#fff", borderBottom: "1px solid #e2e8f0",
    position: "sticky", top: 0, zIndex: 20,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  logoBox: {
    width: 38, height: 38, borderRadius: 10,
    background: "#eff6ff", border: "1px solid #bfdbfe",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" },
  headerSub: { fontSize: 11.5, color: "#94a3b8", marginTop: 1 },
  refreshBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 13px", borderRadius: 8,
    background: "#f8fafc", border: "1px solid #e2e8f0",
    color: "#64748b", fontSize: 12.5, fontWeight: 600,
  },

  body: { padding: "28px 32px", maxWidth: 1200, margin: "0 auto" },

  statsRow: { display: "flex", gap: 14, marginBottom: 24 },
  statCard: {
    flex: 1, padding: "18px 20px", borderRadius: 12,
    border: "1px solid", display: "flex", flexDirection: "column", gap: 4,
  },
  statValue: { fontSize: 32, fontWeight: 700, letterSpacing: "-1.5px", lineHeight: 1 },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: 500 },

  controls: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  tabs: {
    display: "flex", gap: 2,
    background: "#f1f5f9", borderRadius: 9, padding: 3,
  },
  tab: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "6px 13px", borderRadius: 7,
    background: "none", border: "none",
    color: "#64748b", fontSize: 13, fontWeight: 600,
    transition: "all 0.15s",
  },
  tabActive: { background: "#fff", color: "#0f172a", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  tabPill: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 18, height: 17, borderRadius: 5,
    fontSize: 10, fontWeight: 700, padding: "0 4px",
  },
  searchWrap: { position: "relative", flex: 1, maxWidth: 300 },
  searchIcon: { position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" },
  searchInput: {
    width: "100%", padding: "8px 32px 8px 30px",
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9,
    fontSize: 13, color: "#0f172a",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  clearBtn: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", fontSize: 11, cursor: "pointer" },

  center: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 10 },
  spinner: { width: 28, height: 28, borderRadius: "50%", border: "2.5px solid #e2e8f0", borderTopColor: "#2563eb" },
  stateText: { fontSize: 14, color: "#94a3b8" },
  errorBox: {
    display: "flex", alignItems: "center", gap: 9,
    padding: "13px 16px", borderRadius: 10,
    background: "#fff5f5", border: "1px solid #fecaca",
    color: "#dc2626", fontSize: 13,
  },
  retryBtn: {
    marginLeft: "auto", padding: "4px 10px", borderRadius: 6,
    background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626",
    fontSize: 12, fontWeight: 600,
  },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 14 },

  card: {
    background: "#fff", borderRadius: 14, padding: "18px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    cursor: "pointer",
    transition: "box-shadow 0.2s, border-color 0.2s, transform 0.15s",
  },
  cardTop: { display: "flex", alignItems: "flex-start", gap: 11, marginBottom: 12 },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: { fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cardFirm: { fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cardMeta: { display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 },
  metaItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cardDivider: { height: 1, background: "#f1f5f9", marginBottom: 14 },

  approveBtn: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "9px 16px", borderRadius: 9,
    background: "#2563eb", border: "none", color: "#fff",
    fontSize: 13, fontWeight: 600,
    boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
    transition: "opacity 0.15s, transform 0.1s",
  },
  doneRow: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "8px", borderRadius: 9,
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    color: "#16a34a", fontSize: 12.5, fontWeight: 600,
  },
  miniSpin: { display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" },

  overlay: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", backdropFilter: "blur(2px)", zIndex: 40 },
  drawer: {
    position: "fixed", top: 0, right: 0, bottom: 0, width: 400,
    background: "#fff", borderLeft: "1px solid #e2e8f0",
    zIndex: 50, display: "flex", flexDirection: "column", overflowY: "auto",
    boxShadow: "-8px 0 32px rgba(0,0,0,0.08)",
  },
  drawerHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 22px",
    borderBottom: "1px solid #f1f5f9",
    background: "#fff", position: "sticky", top: 0, zIndex: 1,
  },
  drawerName: { fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 5 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 8,
    background: "#f8fafc", border: "1px solid #e2e8f0",
    color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center",
  },
  drawerBody: { flex: 1, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 22 },
  drawerFoot: { padding: "18px 22px", borderTop: "1px solid #f1f5f9" },

  sec: {},
  secTitle: { fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#2563eb", marginBottom: 10 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "7px 0", borderBottom: "1px solid #f8fafc" },
  rowL: { fontSize: 12, color: "#94a3b8", flexShrink: 0 },
  rowV: { fontSize: 13, color: "#0f172a", fontWeight: 500, textAlign: "right", wordBreak: "break-word" },

  toast: {
    position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
    zIndex: 100, whiteSpace: "nowrap",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
  },
  toastOk: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" },
  toastErr: { background: "#fff5f5", border: "1px solid #fecaca", color: "#dc2626" },
};
