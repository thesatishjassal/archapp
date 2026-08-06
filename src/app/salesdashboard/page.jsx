"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://api.panvic.in/api";

// Same cookie helper used in Header.jsx — team/salesperson login is stored
// in cookies after OTP verification (see LoginPage.jsx team flow).
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function Spinner() {
  return <span className="mp-spinner" />;
}

function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`mp-chevron${open ? " mp-chevron--open" : ""}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 16V8M8 12l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </svg>
  );
}

// Turn a snake_case / camelCase key into a readable label
function humanizeKey(key) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Maps a project status string to a color scheme for the badge
function statusStyle(status) {
  const s = (status || "").toLowerCase().trim();
  if (["completed", "complete", "done", "delivered"].includes(s)) {
    return { bg: "#e7f7ef", fg: "#0f9d58", dot: "#0f9d58" };
  }
  if (
    ["in progress", "in-progress", "ongoing", "active", "started"].includes(s)
  ) {
    return { bg: "#eaf2ff", fg: "#2563eb", dot: "#2563eb" };
  }
  if (["pending", "on hold", "hold", "not started"].includes(s)) {
    return { bg: "#fff7e6", fg: "#b8860b", dot: "#d4a017" };
  }
  if (["cancelled", "canceled", "rejected"].includes(s)) {
    return { bg: "#fdecec", fg: "#dc2626", dot: "#dc2626" };
  }
  return { bg: "#f0ede8", fg: "#666", dot: "#999" }; // unknown/default
}

function StatusBadge({ status }) {
  if (!status) return null;
  const { bg, fg, dot } = statusStyle(status);
  return (
    <span className="mp-status-badge" style={{ background: bg, color: fg }}>
      <span className="mp-status-badge__dot" style={{ background: dot }} />
      {status}
    </span>
  );
}

// Empty add-project form state
const emptyAddForm = {
  architectId: "",
  title: "",
  location: "",
  description: "",
  status: "In Progress",
  image: "",
  imageFile: null,
  client: "",
  budget: "",
  date: "",
};

export default function ProjectsWithArchitectPage() {
  // ---- Auth / salesperson profile (optional — page works with or without login) ----
  const [salesperson, setSalesperson] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  // ---- Architect list (for the accordion — may be restricted to linked IDs) ----
  const [architects, setArchitects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- Full architect list, always unrestricted — used for the Add Project dropdown ----
  const [allArchitects, setAllArchitects] = useState([]);
  const [loadingAllArchitects, setLoadingAllArchitects] = useState(true);

  // ---- Accordion state: which architect is open, and per-architect project cache ----
  const [openId, setOpenId] = useState(null);
  const [projectsByArch, setProjectsByArch] = useState({});
  const [loadingArch, setLoadingArch] = useState({});
  const [errorArch, setErrorArch] = useState({});

  // ---- Project detail modal ----
  const [modalProject, setModalProject] = useState(null);

  // ---- Add Project (assign to architect) modal ----
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addForm, setAddForm] = useState(emptyAddForm);

  // ---- Manage linked architects modal (PUT /api/salespersons/{id}) ----
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkSaving, setLinkSaving] = useState(false);
  const [selectedArchIds, setSelectedArchIds] = useState([]); // array of string ids

  // Close modals on Escape key
  useEffect(() => {
    if (!modalProject && !showAddModal && !showLinkModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setModalProject(null);
        if (!addSaving) setShowAddModal(false);
        if (!linkSaving) setShowLinkModal(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalProject, showAddModal, showLinkModal, addSaving, linkSaving]);

  // Load the logged-in salesperson from the same cookie Header.jsx reads
  useEffect(() => {
    const teamVerified = getCookie("team_user_verified");
    const teamData = getCookie("team_user");

    if (teamVerified === "true" && teamData) {
      try {
        setSalesperson(JSON.parse(teamData));
      } catch {
        setSalesperson(null);
      }
    }
    setCheckedAuth(true);
  }, []);

  const linkedIds = Array.isArray(salesperson?.architecture_id)
    ? salesperson.architecture_id
    : salesperson?.architecture_id
    ? [salesperson.architecture_id]
    : [];

  // Once we know the auth state, load architects:
  // - salesperson with linked IDs -> only their linked architects
  // - otherwise -> every architect (excluding admin accounts)
  useEffect(() => {
    if (checkedAuth) fetchArchitects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedAuth, salesperson]);

  // Always fetch the complete architect list once, for the Add Project dropdown
  useEffect(() => {
    fetchAllArchitects();
  }, []);

  const fetchAllArchitects = async () => {
    setLoadingAllArchitects(true);
    try {
      const response = await fetch(`${API_BASE}/arch-register/`);
      const result = await response.json();
      const list = (result.data || []).filter((a) => a.role !== "admin");
      setAllArchitects(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load architect list");
    } finally {
      setLoadingAllArchitects(false);
    }
  };

  const fetchArchitects = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/arch-register/`);
      const result = await response.json();
      const list = (result.data || []).filter((a) => a.role !== "admin");

      if (salesperson && linkedIds.length > 0) {
        const idSet = new Set(linkedIds.map(String));
        const matches = list.filter((a) => idSet.has(String(a.id)));

        if (matches.length === 0) {
          setError("No architect records match these IDs.");
        } else {
          // preserve the original linkedIds order
          const ordered = linkedIds
            .map((id) => matches.find((m) => String(m.id) === String(id)))
            .filter(Boolean);
          setArchitects(ordered);
        }
      } else {
        setArchitects(list);
      }
    } catch (err) {
      console.error(err);
      setError("Could not load architect details.");
      toast.error("Failed to load architects");
    } finally {
      setLoading(false);
    }
  };

  // `force` lets callers bypass the cache after adding a new project
  const fetchProjects = async (archId, force = false) => {
    if (!force && projectsByArch[archId]) return; // already cached

    setLoadingArch((prev) => ({ ...prev, [archId]: true }));
    setErrorArch((prev) => ({ ...prev, [archId]: null }));

    try {
      const response = await fetch(`${API_BASE}/projects/${archId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Could not load projects");
      }

      const list = Array.isArray(result) ? result : result.data || [];
      setProjectsByArch((prev) => ({ ...prev, [archId]: list }));
    } catch (err) {
      console.error(err);
      setErrorArch((prev) => ({
        ...prev,
        [archId]: err.message || "Could not load projects",
      }));
      toast.error("Failed to load projects");
    } finally {
      setLoadingArch((prev) => ({ ...prev, [archId]: false }));
    }
  };

  const toggleAccordion = (archId) => {
    const next = openId === archId ? null : archId;
    setOpenId(next);
    if (next) fetchProjects(next);
  };

  const isLinkedMode = !!(salesperson && linkedIds.length > 0);
  const sectionLabel = isLinkedMode
    ? `Linked Architecture${linkedIds.length > 1 ? "s" : ""}`
    : "All Architects";

  // ---- Add Project handlers ----
  const openAddModal = () => {
    setAddForm({
      ...emptyAddForm,
      // Pre-select the architect if the salesperson only has one linked
      architectId:
        isLinkedMode && linkedIds.length === 1 ? String(linkedIds[0]) : "",
    });
    setShowAddModal(true);
  };

  const handleAddFieldChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAddForm((prev) => ({
        ...prev,
        image: URL.createObjectURL(file),
        imageFile: file,
      }));
    }
  };

  const handleAddProjectSubmit = async (e) => {
    e.preventDefault();

    if (!addForm.architectId) {
      toast.error("Please select an architect to assign this project to");
      return;
    }
    if (!addForm.title.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setAddSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", addForm.title);
      fd.append("status", addForm.status);
      // location/description/client are plain optional strings — fine to
      // omit when blank. budget/date are typed (float/date) on the backend,
      // so an empty string would fail FastAPI's Form validation; only send
      // them when the user actually filled them in, so they come through
      // as a true "field not sent" -> None on the server.
      if (addForm.location) fd.append("location", addForm.location);
      if (addForm.description) fd.append("description", addForm.description);
      if (addForm.client) fd.append("client", addForm.client);
      if (addForm.budget !== "" && addForm.budget !== null) {
        fd.append("budget", addForm.budget);
      }
      if (addForm.date) fd.append("date", addForm.date);
      if (addForm.imageFile) fd.append("image", addForm.imageFile);


      const response = await fetch(
        `${API_BASE}/projects/${addForm.architectId}`,
        { method: "POST", body: fd }
      );
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || result.detail || "Failed to add project"
        );
      }

      // Ref
      // 
      // resh that architect's project list and expand their accordion
      // so the salesperson sees the newly assigned project immediately.
      await fetchProjects(addForm.architectId, true);
      setOpenId(addForm.architectId);

      toast.success("Project added and assigned successfully!");
      setShowAddModal(false);
      setAddForm(emptyAddForm);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add project");
    } finally {
      setAddSaving(false);
    }
  };

  // ---- Manage linked architects handlers ----
  const openLinkModal = () => {
    setSelectedArchIds(linkedIds.map(String));
    setShowLinkModal(true);
  };

  const toggleArchSelection = (idStr) => {
    setSelectedArchIds((prev) =>
      prev.includes(idStr) ? prev.filter((x) => x !== idStr) : [...prev, idStr]
    );
  };

  const handleUpdateLinkedArchitects = async (e) => {
    e.preventDefault();
    if (!salesperson?.id) return;

    setLinkSaving(true);
    try {
      const idsAsNumbers = selectedArchIds.map((id) => Number(id));

      const response = await fetch(
        `${API_BASE}/salespersons/${salesperson.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ architecture_id: idsAsNumbers }),
        }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            result.message ||
            "Failed to update linked architects"
        );
      }

      // Keep local state + cookie in sync so the accordion above (which
      // derives linkedIds from salesperson.architecture_id) picks up the
      // new selection immediately, without needing a page reload.
      const updatedSalesperson = {
        ...salesperson,
        architecture_id: idsAsNumbers,
      };
      setSalesperson(updatedSalesperson);
      document.cookie = `team_user=${encodeURIComponent(
        JSON.stringify(updatedSalesperson)
      )}; path=/`;

      toast.success("Linked architects updated successfully!");
      setShowLinkModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update linked architects");
    } finally {
      setLinkSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .mp-page {
          background: #f5f4f0;
          min-height: 100vh;
          padding: 2.5rem 1.5rem;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          justify-content: center;
        }

        .mp-wrap {
          width: 100%;
          max-width: 720px;
        }

        /* ---- Mini profile card (only shown when logged in) ---- */
        .mp-card {
          background: #fff;
          border-radius: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 8px 32px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem 1.75rem;
          margin-bottom: 1.75rem;
          position: relative;
          overflow: hidden;
        }

        .mp-card::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #1a1a1a;
        }

        .mp-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #1a1a1a;
          color: #fff; 1 
          font-family: 'DM Serif Display', serif;
          font-size: 1.35rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mp-info { flex: 1; min-width: 0; }

        .mp-name {
          font-family: 'DM Serif Display', serif;
          font-size: 1.25rem;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .mp-role {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #999;
          margin-top: 2px;
        }

        .mp-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem 1.25rem;
          margin-top: 0.6rem;
          font-size: 0.82rem;
          color: #555;
        }

        .mp-meta span strong {
          color: #1a1a1a;
          font-weight: 500;
        }

        .mp-badge {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          background: #f0ede8;
          color: #1a1a1a;
          white-space: nowrap;
          align-self: flex-start;
        }

        .mp-card__side {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .mp-link-btn {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.72rem;
          font-weight: 600;
          color: #1a1a1a;
          text-decoration: underline;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .mp-link-btn:hover { color: #666; }

        .mp-check-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          max-height: 300px;
          overflow-y: auto;
          border: 1.5px solid #e5e2dc;
          border-radius: 4px;
          padding: 0.5rem;
        }

        .mp-check-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0rem 0rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .mp-check-item:hover { background: #faf9f7; }

        .mp-check-item input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #1a1a1a;
          flex-shrink: 0;
          cursor: pointer;
        }

        .mp-check-item__label {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          min-width: 0;
          font-size: 0.85rem;
          color: #1a1a1a;
          font-weight: 500;
        }

        .mp-check-item__sub {
          font-size: 0.72rem;
          color: #999;
          font-weight: 400;
        }

        .mp-selected-count {
          font-size: 0.75rem;
          color: #666;
        }

        /* ---- Section header ---- */
        .mp-page-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.4rem;
          color: #1a1a1a;
          margin-bottom: 1.5rem;
        }

        .mp-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.6rem;
        }

        .mp-section-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #999;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          min-width: 0;
        }

        .mp-section-label::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e5e2dc;
        }

        .mp-count {
          background: #1a1a1a;
          color: #fff;
          font-size: 0.68rem;
          font-weight: 600;
          padding: 0.1rem 0.5rem;
          border-radius: 999px;
          letter-spacing: normal;
          text-transform: none;
        }

        .mp-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          height: 34px;
          padding: 0 1rem;
          border-radius: 4px;
          background: #1a1a1a;
          color: #fff;
          font-size: 0.78rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .mp-add-btn:hover { background: #333; }
        .mp-add-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .mp-state {
          padding: 2.5rem;
          text-align: center;
          color: #999;
          font-size: 0.88rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          background: #fff;
          border: 1.5px solid #e5e2dc;
          border-radius: 2px;
        }

        .mp-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #e5e2dc;
          border-top: 2px solid #1a1a1a;
          border-radius: 50%;
          animation: mp-rotate 0.7s linear infinite;
        }

        @keyframes mp-rotate { to { transform: rotate(360deg); } }

        .mp-error { color: #ef4444; }

        /* ---- Architect accordion ---- */
        .mp-accordion {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .mp-item {
          background: #fff;
          border: 1.5px solid #e5e2dc;
          border-radius: 2px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .mp-item--open {
          border-color: #1a1a1a;
        }

        .mp-item__head {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }

        .mp-item__head:hover {
          background: #faf9f7;
        }

        .mp-item__meta {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
        }

        .mp-item__name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1a1a1a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mp-item__sub {
          font-size: 0.75rem;
          color: #999;
        }

        .mp-item__right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .mp-item__count {
          font-size: 0.7rem;
          font-weight: 600;
          color: #666;
          background: #f5f4f0;
          border-radius: 20px;
          padding: 0.2rem 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .mp-chevron {
          color: #999;
          transition: transform 0.2s;
          flex-shrink: 0;
        }

        .mp-chevron--open {
          transform: rotate(180deg);
          color: #1a1a1a;
        }

        .mp-item__body {
          border-top: 1px solid #f0ede8;
          padding: 0.5rem 1.25rem 1rem;
        }

        .mp-project {
          padding: 0.75rem 0;
          border-bottom: 1px solid #f5f4f0;
        }

        .mp-project:last-child {
          border-bottom: none;
        }

        .mp-project__name {
          font-size: 0.88rem;
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 0.2rem;
        }

        .mp-project__detail {
          font-size: 0.78rem;
          color: #999;
        }

        .mp-project__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .mp-project__text {
          min-width: 0;
        }

        .mp-project__meta {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
          margin-top: 0.3rem;
        }

        .mp-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          text-transform: capitalize;
          letter-spacing: 0.01em;
        }

        .mp-status-badge__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .mp-eye-btn {
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1.5px solid #e5e2dc;
          background: #fff;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.15s;
        }

        .mp-eye-btn:hover {
          border-color: #1a1a1a;
          color: #1a1a1a;
          background: #faf9f7;
        }

        .mp-state-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 0;
          font-size: 0.82rem;
          color: #999;
        }

        .mp-state-row--error {
          color: #ef4444;
        }

        /* ---- Project detail modal / Add Project modal ---- */
        .mp-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 26, 26, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          z-index: 999999;
          font-family: 'DM Sans', sans-serif;
          animation: mp-fade-in 0.15s ease-out;
        }

        @keyframes mp-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .mp-modal {
          background: #fff;
          border-radius: 2px;
          width: 100%;
          max-width: 400px;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
          animation: mp-modal-in 0.18s ease-out;
        }

        .mp-modal--wide {
          max-width: 540px;
        }

        @keyframes mp-modal-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .mp-modal__head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f0ede8;
        }

        .mp-modal__title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.1rem;
          color: #1a1a1a;
          line-height: 1.3;
        }

        .mp-modal__badge-wrap {
          margin-top: 0.4rem;
        }

        .mp-modal__close {
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          background: #f5f4f0;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.15s;
        }

        .mp-modal__close:hover {
          background: #1a1a1a;
          color: #fff;
        }

        .mp-modal__body {
          overflow-y: auto;
          padding: 0.25rem 0;
        }

        .mp-detail-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .mp-detail-table tr:not(:last-child) td {
          border-bottom: 1px solid #f5f4f0;
        }

        .mp-detail-table td {
          padding: 0.7rem 1.5rem;
          vertical-align: top;
        }

        .mp-detail-key {
          width: 42%;
          color: #999;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .mp-detail-val {
          color: #1a1a1a;
          font-weight: 500;
          word-break: break-word;
        }

        /* ---- Add Project form ---- */
        .mp-form {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          padding: 1.25rem 1.5rem 1.5rem;
          overflow-y: auto;
        }

        .mp-form__upload {
          display: block;
          cursor: pointer;
          border-radius: 4px;
          overflow: hidden;
          border: 1.5px dashed #e5e2dc;
          transition: border-color 0.2s;
        }

        .mp-form__upload:hover { border-color: #1a1a1a; }

        .mp-form__preview {
          width: 100%;
          height: 140px;
          object-fit: cover;
          display: block;
        }

        .mp-form__placeholder {
          height: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          color: #999;
          font-size: 0.8rem;
          background: #faf9f7;
        }

        .mp-form__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .mp-form__field {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .mp-form__field--full {
          grid-column: 1 / 0;
        }

        .mp-form__label {
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #999;
        }

        .mp-form__input,
        .mp-form__select,
        .mp-form__textarea {
          width: 100%;
          height: 38px;
          background: #faf9f7;
          border: 1.5px solid #e5e2dc;
          border-radius: 4px;
          padding: 0 0.75rem;
          font-size: 0.85rem;
          color: #1a1a1a;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.15s;
        }

        .mp-form__input:focus,
        .mp-form__select:focus,
        .mp-form__textarea:focus {
          border-color: #1a1a1a;
        }

        .mp-form__textarea {
          height: 35px;
          padding: 0.6rem 0.75rem;
          resize: none;
        }

        .mp-form__actions {
          display: flex;
          gap: 0.6rem;
          padding-top: 0.9rem;
          border-top: 1px solid #f0ede8;
        }

        .mp-form__btn {
          flex: 1;
          height: 38px;
          border-radius: 4px;
          font-size: 0.82rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .mp-form__btn--primary {
          background: #1a1a1a;
          color: #fff;
        }

        .mp-form__btn--primary:hover { background: #333; }
        .mp-form__btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .mp-form__btn--ghost {
          background: #fff;
          color: #1a1a1a;
          border-color: #e5e2dc;
        }

        .mp-form__btn--ghost:hover { background: #faf9f7; }

        :global(.Toastify__toast-container) {
          padding: 0;
        }

        :global(.Toastify__toast) {
          font-family: 'DM Sans', sans-serif;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 1rem;
        }

        :global(.Toastify__toast--error) {
          background: #ef4444;
        }

        :global(.Toastify__toast-body) {
          color: white;
          font-weight: 500;
        }

        :global(.Toastify__progress-bar) {
          height: 3px;
        }
      `}</style>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="mp-page">
        <div className="mp-wrap">
          {/* Mini profile card — only when a salesperson is logged in */}
          {salesperson && (
            <div className="mp-card">
              <div className="mp-avatar">{initials(salesperson.name)}</div>
              <div className="mp-info">
                <div className="mp-name">{salesperson.name}</div>
                <div className="mp-role">Sales Representative</div>
                <div className="mp-meta">
                  <span><strong>{salesperson.email}</strong></span>
                  <span>{salesperson.phone}</span>
                  <span>{salesperson.company_name}</span>
                </div>
              </div>
              <div className="mp-card__side">
                <div className="mp-badge">ID #{salesperson.id}</div>
                <button
                  type="button"
                  className="mp-link-btn"
                  onClick={openLinkModal}
                >
                  Edit Linked Architects
                </button>
              </div>
            </div>
          )}

          {!salesperson && checkedAuth && (
            <h1 className="mp-page-title">Projects by Architect</h1>
          )}

          {/* Architects — accordion, each expands to its projects */}
          <div className="mp-toolbar">
            <div className="mp-section-label">
              {sectionLabel}
              {!loading && !error && (
                <span className="mp-count">{architects.length}</span>
              )}
            </div>

            {!loadingAllArchitects && allArchitects.length > 0 && (
              <button
                type="button"
                className="mp-add-btn"
                onClick={openAddModal}
              >
                <PlusIcon />
                Add Project
              </button>
            )}
          </div>

          {loading && (
            <div className="mp-state">
              <Spinner />
              Loading architects...
            </div>
          )}

          {!loading && error && (
            <div className="mp-state mp-error">{error}</div>
          )}

          {!loading && !error && architects.length === 0 && (
            <div className="mp-state">No architects found.</div>
          )}

          {!loading && !error && architects.length > 0 && (
            <div className="mp-accordion">
              {architects.map((a) => {
                const isOpen = openId === a.id;
                const isLoadingProjects = !!loadingArch[a.id];
                const projects = projectsByArch[a.id];
                const projError = errorArch[a.id];

                return (
                  <div
                    key={a.id}
                    className={`mp-item${isOpen ? " mp-item--open" : ""}`}
                  >
                    <button
                      type="button"
                      className="mp-item__head"
                      onClick={() => toggleAccordion(a.id)}
                      aria-expanded={isOpen}
                    >
                      <div className="mp-item__meta">
                        <span className="mp-item__name">{a.full_name}</span>
                        <span className="mp-item__sub">
                          {a.email || "—"} · ID #{a.id}
                        </span>
                      </div>
                      <div className="mp-item__right">
                        {projects && (
                          <span className="mp-item__count">
                            {projects.length}{" "}
                            {projects.length === 1 ? "project" : "projects"}
                          </span>
                        )}
                        <ChevronIcon open={isOpen} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="mp-item__body">
                        {isLoadingProjects && (
                          <div className="mp-state-row">
                            <Spinner /> Loading projects…
                          </div>
                        )}

                        {!isLoadingProjects && projError && (
                          <div className="mp-state-row mp-state-row--error">
                            ⚠️ {projError}
                          </div>
                        )}

                        {!isLoadingProjects &&
                          !projError &&
                          projects &&
                          projects.length === 0 && (
                            <div className="mp-state-row">
                              No projects for this architect yet.
                            </div>
                          )}

                        {!isLoadingProjects &&
                          !projError &&
                          projects &&
                          projects.length > 0 &&
                          projects.map((project, idx) => {
                            const projectName =
                              project.name ||
                              project.project_name ||
                              project.title ||
                              project.projectName ||
                              "Untitled Project";
                            return (
                              <div className="mp-project" key={project.id ?? idx}>
                                <div className="mp-project__row">
                                  <div className="mp-project__text">
                                    <div className="mp-project__name">
                                      {projectName}
                                    </div>
                                    <div className="mp-project__meta">
                                      {project.location && (
                                        <span className="mp-project__detail">
                                          {project.location}
                                        </span>
                                      )}
                                      <StatusBadge status={project.status} />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="mp-eye-btn"
                                    onClick={() => setModalProject(project)}
                                    title="View full details"
                                    aria-label="View full details"
                                  >
                                    <EyeIcon />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalProject && (
        <div
          className="mp-modal-overlay"
          onClick={() => setModalProject(null)}
        >
          <div
            className="mp-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mp-modal__head">
              <div>
                <div className="mp-modal__title">
                  {modalProject.name ||
                    modalProject.project_name ||
                    modalProject.title ||
                    "Project Details"}
                </div>
                {modalProject.status && (
                  <div className="mp-modal__badge-wrap">
                    <StatusBadge status={modalProject.status} />
                  </div>
                )}
              </div>
              <button
                type="button"
                className="mp-modal__close"
                onClick={() => setModalProject(null)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mp-modal__body">
              <table className="mp-detail-table">
                <tbody>
                  {Object.entries(modalProject).map(([key, value]) => (
                    <tr key={key}>
                      <td className="mp-detail-key">{humanizeKey(key)}</td>
                      <td className="mp-detail-val">{formatValue(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Project modal — sales rep assigns a new project to an architect */}
      {showAddModal && (
        <div
          className="mp-modal-overlay"
          onClick={() => !addSaving && setShowAddModal(false)}
        >
          <div
            className="mp-modal mp-modal--wide"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mp-modal__head">
              <div className="mp-modal__title">Add Project</div>
              <button
                type="button"
                className="mp-modal__close"
                onClick={() => !addSaving && setShowAddModal(false)}
                aria-label="Close"
                disabled={addSaving}
              >
                <CloseIcon />
              </button>
            </div>

            <form className="mp-form" onSubmit={handleAddProjectSubmit}>
              {/* <label htmlFor="mpProjectImage" className="mp-form__upload">
                {addForm.image ? (
                  <img
                    src={addForm.image}
                    alt="preview"
                    className="mp-form__preview"
                  />
                ) : (
                  <div className="mp-form__placeholder">
                    <UploadIcon />
                    <span>Upload Project Image</span>
                  </div>
                )}
              </label> */}
              <input
                id="mpProjectImage"
                type="file"
                hidden
                accept="image/*"
                onChange={handleAddImageChange}
              />

              <div className="mp-form__grid">
                <div className="mp-form__field mp-form__field--full">
                  <label className="mp-form__label">
                    Assign To Architect *
                  </label>
                  <select
                    className="mp-form__select"
                    name="architectId"
                    value={addForm.architectId}
                    onChange={handleAddFieldChange}
                    required
                    disabled={loadingAllArchitects}
                  >nnznznzn
                    <option value="">
                      {loadingAllArchitects
                        ? "Loading architects…"
                        : "Select architect…"}
                    </option>
                    {allArchitects.map((a) => {
                      const label = [a.full_name, a.firm_name]
                        .filter(Boolean)
                        .join(" — ") || a.email || `Architect #${a.id}`;
                      return (
                        <option key={a.id} value={a.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="mp-form__field mp-form__field--full">
                  <label className="mp-form__label">Project Name *</label>
                  <input
                    className="mp-form__input"
                    type="text"
                    name="title"
                    value={addForm.title}
                    onChange={handleAddFieldChange}
                    placeholder="e.g. Modern Courtyard Villa"
                    required
                  />
                </div>

                <div className="mp-form__field">
                  <label className="mp-form__label">Client Name</label>
                  <input
                    className="mp-form__input"
                    type="text"
                    name="client"
                    value={addForm.client}
                    onChange={handleAddFieldChange}
                    placeholder="e.g. Sharma Family"
                  />
                </div>

                <div className="mp-form__field">
                  <label className="mp-form__label">Location</label>
                  <input
                    className="mp-form__input"
                    type="text"
                    name="location"
                    value={addForm.location}
                    onChange={handleAddFieldChange}
                    placeholder="e.g. Gurgaon, India"
                  />
                </div>

                <div className="mp-form__field">
                  <label className="mp-form__label">Budget (₹)</label>
                  <input
                    className="mp-form__input"
                    type="number"
                    name="budget"
                    value={addForm.budget}
                    onChange={handleAddFieldChange}
                    placeholder="e.g. 2500000"
                  />
                </div>

                <div className="mp-form__field">
                  <label className="mp-form__label">Date</label>
                  <input
                    className="mp-form__input"
                    type="date"
                    name="date"
                    value={addForm.date}
                    onChange={handleAddFieldChange}
                  />
                </div>

                <div className="mp-form__field mp-form__field--full">
                  <label className="mp-form__label">Status</label>
                  <select
                    className="mp-form__select"
                    name="status"
                    value={addForm.status}
                    onChange={handleAddFieldChange}
                  > 
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="mp-form__field mp-form__field--full">
                  <label className="mp-form__label">Description</label>
                  <textarea
                    className="mp-form__textarea"
                    name="description"
                    value={addForm.description}
                    onChange={handleAddFieldChange}
                    placeholder="Brief description of the project…"
                  />
                </div>
              </div>

              <div className="mp-form__actions">
                <button
                  type="button"
                  className="mp-form__btn mp-form__btn--ghost"
                  onClick={() => setShowAddModal(false)}
                  disabled={addSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mp-form__btn mp-form__btn--primary"
                  disabled={addSaving}
                >
                  {addSaving && <Spinner />}
                  {addSaving ? "Saving…" : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Linked Architects modal — updates the salesperson's own
          profile via PUT /api/salespersons/{id} with architecture_id as an array */}
      {showLinkModal && (
        <div
          className="mp-modal-overlay"
          onClick={() => !linkSaving && setShowLinkModal(false)}
        >
          <div
            className="mp-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="mp-modal__head">
              <div className="mp-modal__title">Linked Architects</div>
              <button
                type="button"
                className="mp-modal__close"
                onClick={() => !linkSaving && setShowLinkModal(false)}
                aria-label="Close"
                disabled={linkSaving}
              >
                <CloseIcon />
              </button>
            </div>

            <form className="mp-form" onSubmit={handleUpdateLinkedArchitects}>
              <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>
                Select every architect you want linked to your profile.
                Their projects will show under "Linked Architectures" on
                your dashboard.
              </p>

              {loadingAllArchitects ? (
                <div className="mp-state-row">
                  <Spinner /> Loading architects…
                </div>
              ) : allArchitects.length === 0 ? (
                <div className="mp-state-row">No architects found.</div>
              ) : (
                <div className="mp-check-list">
                  {allArchitects.map((a) => {
                    const idStr = String(a.id);
                    const checked = selectedArchIds.includes(idStr);
                    return (
                      <label key={a.id} className="mp-check-item">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArchSelection(idStr)}
                        />
                        <span className="mp-check-item__label">
                          <span>{a.full_name}</span>
                          <span className="mp-check-item__sub">
                            {a.firm_name || a.email || `ID #${a.id}`}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="mp-selected-count">
                {selectedArchIds.length} architect
                {selectedArchIds.length === 1 ? "" : "s"} selected
              </div>

              <div className="mp-form__actions">
                <button
                  type="button"
                  className="mp-form__btn mp-form__btn--ghost"
                  onClick={() => setShowLinkModal(false)}
                  disabled={linkSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="mp-form__btn mp-form__btn--primary"
                  disabled={linkSaving || loadingAllArchitects}
                >
                  {linkSaving && <Spinner />}
                  {linkSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
