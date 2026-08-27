"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// 🔧 Update these if the actual endpoints differ
const API_URLS = {
  architects: "https://api.panvic.in/api/arch-register/",
  projects: "https://api.panvic.in/api/projects/",
  salesPersons: "https://api.panvic.in/api/salespersons/",
};

// Extracts an array from common API response shapes
function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.records)) return data.records;
  return [];
}

async function fetchList(url, label) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`${label}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { list: extractList(data), error: null };
  } catch (err) {
    console.error(`${label} fetch error:`, err);
    return { list: [], error: err.message || `Failed to load ${label}` };
  }
}

/* ─── Avatar helpers (initials + consistent color per name) ─── */
const AVATAR_PALETTES = [
  { bg: "#EEF2FF", fg: "#4338CA" },
  { bg: "#FEF3C7", fg: "#92400E" },
  { bg: "#DBEAFE", fg: "#1E40AF" },
  { bg: "#D1FAE5", fg: "#065F46" },
  { bg: "#FCE7F3", fg: "#9D174D" },
  { bg: "#FFEDD5", fg: "#9A3412" },
];
function getInitials(name = "") {
  const n = name.trim();
  if (!n) return "?";
  return n.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
}
function getPalette(name = "") {
  return AVATAR_PALETTES[(name.charCodeAt(0) || 0) % AVATAR_PALETTES.length];
}

/* ─── Celebrations: days until next birthday / anniversary ─── */
function daysUntilNext(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  let next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next - today) / (1000 * 60 * 60 * 24));
}

function celebrationLabel(days) {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

/* ─── Upcoming Celebrations (birthdays / anniversaries within 2 days) ─── */
function CelebrationStrip({ architects }) {
  const items = [];

  architects.forEach((a) => {
    const bd = daysUntilNext(a?.date_of_birth);
    const ad = daysUntilNext(a?.anniversary_date);
    if (bd !== null && bd <= 2) items.push({ user: a, days: bd, type: "birthday" });
    if (ad !== null && ad <= 2) items.push({ user: a, days: ad, type: "anniversary" });
  });

  items.sort((a, b) => a.days - b.days);

  if (!items.length) return null;

  return (
    <section className="admin-card celebration-card">
      <div className="card-header">
        <div>
          <h2>🎉 Upcoming Celebrations</h2>
          <p>Birthdays &amp; anniversaries in the next 2 days</p>
        </div>
      </div>

      <ul className="celebration-list">
        {items.map(({ user, days, type }) => {
          const { bg, fg } = getPalette(user?.full_name || user?.name);
          return (
            <li
              key={`${user.id}-${type}`}
              className={`celebration-item celebration-${days === 0 ? "today" : days === 1 ? "tomorrow" : "soon"}`}
            >
              <div className="celebration-avatar" style={{ background: bg, color: fg }}>
                {getInitials(user?.full_name || user?.name)}
              </div>
              <div className="celebration-info">
                <strong>{user?.full_name || user?.name || "—"}</strong>
                <span>
                  {type === "anniversary" ? "💍 Anniversary" : "🎂 Birthday"} ·{" "}
                  {user?.firm_name || user?.company || "Independent"}
                </span>
              </div>
              <span className="celebration-badge">{celebrationLabel(days)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ─── Status badge (Active / Pending) ─── */
function StatusBadge({ approved }) {
  return (
    <span className={`status-badge ${approved ? "status-approved" : "status-pending"}`}>
      <span className="status-dot" />
      {approved ? "Active" : "Pending"}
    </span>
  );
}

/* ─── Toast ─── */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`admin-toast ${toast.type === "error" ? "admin-toast-error" : "admin-toast-success"}`}>
      <span className="admin-toast-icon">{toast.type === "error" ? "✕" : "✓"}</span>
      {toast.message}
    </div>
  );
}

export default function AdminDashboard() {
  const [architects, setArchitects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);

    const [architectsRes, projectsRes, salesRes] = await Promise.all([
      fetchList(API_URLS.architects, "Architects"),
      fetchList(API_URLS.projects, "Projects"),
      fetchList(API_URLS.salesPersons, "Sales Persons"),
    ]);

    setArchitects(architectsRes.list);
    setProjects(projectsRes.list);
    setSalesPersons(salesRes.list);

    setErrors({
      architects: architectsRes.error,
      projects: projectsRes.error,
      salesPersons: salesRes.error,
    });

    setLoading(false);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const deleteArchitect = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${name || "this architect"}?`);
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${API_URLS.architects}${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Delete failed");

      setArchitects((prev) => prev.filter((a) => a.id !== id));
      showToast("success", `${name || "Architect"} deleted successfully`);
    } catch (err) {
      showToast("error", err.message || "Failed to delete architect");
    } finally {
      setDeletingId(null);
    }
  };

  const approveArchitect = async (id, name) => {
    setApprovingId(id);
    try {
      const res = await fetch(`${API_URLS.architects}approve/${id}`, { method: "PUT" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Approve failed");

      setArchitects((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_approved: true } : a))
      );
      showToast("success", `${name || "Architect"} approved`);
    } catch (err) {
      showToast("error", err.message || "Failed to approve architect");
    } finally {
      setApprovingId(null);
    }
  };

  const activeProjectsCount = projects.filter(
    (p) => String(p?.status || "").toLowerCase() === "active"
  ).length;

  const recentArchitects = [...architects]
    .sort((a, b) => (b?.id || 0) - (a?.id || 0))
    .slice(0, 5);

  const recentProjects = [...projects]
    .sort((a, b) => (b?.id || 0) - (a?.id || 0))
    .slice(0, 5);

  return (
    <div className="admin-layout">
      {/* Styles for the new pieces (celebrations, status badge, approve/delete actions, toast).
         Scoped to their own class names so they don't touch your existing admin-* rules —
         move into your global stylesheet whenever convenient. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        /* ── Celebrations card ── */
        .celebration-card {
          margin-bottom: 1.5rem;
          font-family: 'DM Sans', sans-serif;
        }
        .celebration-card .card-header h2 {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .celebration-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .celebration-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid #EEF0F3;
          background: #FAFBFC;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .celebration-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(17, 24, 39, 0.06);
          border-color: #E5E7EB;
        }
        .celebration-item.celebration-today {
          background: linear-gradient(0deg, #FFFBEB, #FFFBEB);
          border-color: #FDE68A;
        }
        .celebration-item.celebration-tomorrow {
          background: linear-gradient(0deg, #ECFDF5, #ECFDF5);
          border-color: #A7F3D0;
        }
        .celebration-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
          letter-spacing: -0.3px;
        }
        .celebration-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
          gap: 2px;
        }
        .celebration-info strong {
          font-size: 14.5px;
          color: #111827;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .celebration-info span {
          font-size: 12.5px;
          color: #6B7280;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .celebration-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 999px;
          background: #fff;
          color: #374151;
          border: 1px solid #E5E7EB;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.01em;
        }

        /* ── Recent list rows ── */
        .recent-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .recent-list li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 10px;
          border-radius: 12px;
          transition: background 0.15s ease;
        }
        .recent-list li:hover {
          background: #F9FAFB;
        }
        .recent-item-main {
          display: flex;
          flex-direction: column;
          min-width: 0;
          gap: 3px;
        }
        .recent-item-main strong {
          font-size: 14px;
          color: #111827;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .recent-item-main > span {
          font-size: 12.5px;
          color: #9CA3AF;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .recent-item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }

        /* ── Status badge ── */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.01em;
        }
        .status-approved {
          background: #ECFDF5;
          color: #065F46;
          border: 1px solid #A7F3D0;
        }
        .status-pending {
          background: #FFFBEB;
          color: #92400E;
          border: 1px solid #FDE68A;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        /* ── Action buttons ── */
        .recent-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .recent-approve-btn,
        .recent-delete-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          border-radius: 9px;
          padding: 7px 13px;
          cursor: pointer;
          transition: opacity 0.15s ease, transform 0.1s ease;
          border: 1px solid transparent;
        }
        .recent-approve-btn:active,
        .recent-delete-btn:active {
          transform: scale(0.97);
        }
        .recent-approve-btn {
          background: #111827;
          color: #fff;
          border-color: #111827;
        }
        .recent-approve-btn:hover:not(:disabled) {
          background: #1F2937;
        }
        .recent-delete-btn {
          background: #FEF2F2;
          color: #DC2626;
          border-color: #FECACA;
        }
        .recent-delete-btn:hover:not(:disabled) {
          background: #FEE2E2;
        }
        .recent-approve-btn:disabled,
        .recent-delete-btn:disabled {
          opacity: 0.5;
          cursor: default;
          transform: none;
        }

        /* ── Toast ── */
        .admin-toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          color: #fff;
          padding: 13px 22px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.2);
          z-index: 999;
          white-space: nowrap;
          animation: admin-toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .admin-toast-icon {
          font-size: 15px;
          font-weight: 700;
        }
        .admin-toast-success { background: #064E3B; }
        .admin-toast-error { background: #7F1D1D; }
        @keyframes admin-toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">PANVIC</div>

        <nav className="admin-nav">
          <Link href="/admindashboard" className="admin-nav-item active">
            <span>▦</span>
            Dashboard
          </Link>

          <Link href="/admindashboard/architects" className="admin-nav-item">
            <span>♙</span>
            Architects
          </Link>

          <Link href="/admindashboard/projects" className="admin-nav-item">
            <span>▣</span>
            Projects
          </Link>

          <Link href="/admindashboard/sales-persons" className="admin-nav-item">
            <span>◉</span>
            Sales Persons
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of architects, projects and sales persons.</p>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">A</div>

            <div>
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>

        {/* Errors, if any */}
        {(errors.architects || errors.projects || errors.salesPersons) && (
          <div className="table-state" style={{ marginBottom: "1rem" }}>
            <div className="empty-icon">⚠</div>
            <h3>Some data failed to load</h3>
            <p>
              {[errors.architects, errors.projects, errors.salesPersons]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <button onClick={loadDashboard} className="view-button">
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        <section className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">♙</div>
            <div>
              <span>Total Architects</span>
              <strong>{loading ? "…" : architects.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">▣</div>
            <div>
              <span>Total Projects</span>
              <strong>{loading ? "…" : projects.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">◉</div>
            <div>
              <span>Sales Persons</span>
              <strong>{loading ? "…" : salesPersons.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div>
              <span>Active Projects</span>
              <strong>{loading ? "…" : activeProjectsCount}</strong>
            </div>
          </div>
        </section>

        {/* Celebrations */}
        {!loading && <CelebrationStrip architects={architects} />}

        {/* Recent Sections */}
        <section className="admin-grid">
          <div className="admin-card">
            <div className="card-header">
              <div>
                <h2>Recent Architects</h2>
                <p>Latest registered architects</p>
              </div>

              <Link href="/admindashboard/architects">View All</Link>
            </div>

            {loading ? (
              <div className="table-state">
                <div className="loader"></div>
                <p>Loading...</p>
              </div>
            ) : recentArchitects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">♙</div>
                <h3>No architects yet</h3>
                <p>Architect registrations will appear here.</p>
              </div>
            ) : (
              <ul className="recent-list">
                {recentArchitects.map((a) => (
                  <li key={a.id}>
                    <div className="recent-item-main">
                      <strong>{a?.full_name || a?.name || "—"}</strong>
                      <span>{a?.company || a?.firm_name || "—"}</span>
                      {/* <div className="recent-item-meta">
                        <StatusBadge approved={a?.is_approved} />
                      </div> */}
                    </div>
                    <div className="recent-actions">
                      {!a?.is_approved && (
                        <button
                          className="recent-approve-btn"
                          disabled={approvingId === a.id}
                          onClick={() => approveArchitect(a.id, a?.full_name || a?.name)}
                        >
                          {approvingId === a.id ? "Approving…" : "Approve"}
                        </button>
                      )}
                      <button
                        className="recent-delete-btn"
                        disabled={deletingId === a.id}
                        onClick={() => deleteArchitect(a.id, a?.full_name || a?.name)}
                      >
                        {deletingId === a.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="admin-card">
            <div className="card-header">
              <div>
                <h2>Recent Projects</h2>
                <p>Latest architect projects</p>
              </div>

              <Link href="/admindashboard/projects">View All</Link>
            </div>

            {loading ? (
              <div className="table-state">
                <div className="loader"></div>
                <p>Loading...</p>
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">▣</div>
                <h3>No projects yet</h3>
                <p>Projects will appear here.</p>
              </div>
            ) : (
              <ul className="recent-list">
                {recentProjects.map((p) => (
                  <li key={p.id}>
                    <div className="recent-item-main">
                      <strong>{p?.name || p?.title || "—"}</strong>
                      <span>{p?.status || "—"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <Toast toast={toast} />
    </div>
  );
}
