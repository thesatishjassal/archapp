"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import ProtectedRoute from '../componets/ProtectedRoute';

/* ─── LOADING OVERLAY ─── */
function LoadingOverlay({ message = "Please wait…" }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.45)", display: "flex",
      flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 16,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "2.5px solid rgba(255,255,255,0.2)",
        borderTopColor: "#fff",
        animation: "spin 0.75s linear infinite",
      }} />
      <p style={{ color: "#fff", fontSize: 13, fontWeight: 500, margin: 0, letterSpacing: "0.01em" }}>{message}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─── BUTTON SPINNER ─── */
function BtnSpinner() {
  return (
    <span style={{
      display: "inline-block", width: 13, height: 13,
      borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff", animation: "spin 0.65s linear infinite",
      marginRight: 6, verticalAlign: "middle",
    }} />
  );
}

/* ─── FORMAT BUDGET ─── */
function formatBudget(val) {
  if (!val) return "—";
  const num = Number(val);
  if (isNaN(num)) return val;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString("en-IN")}`;
}

/* ─── FORMAT DATE ─── */
function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return d; }
}

/* ══════════════════════════════════════════════════
   PROJECT MODAL FORM — outside parent to prevent remount
══════════════════════════════════════════════════ */
function ProjectModalForm({ title, onSubmit, submitLabel, projectForm, onFieldChange, onImageChange, onClose, saving }) {
  return (
    <div className="modal__overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">{title}</h2>
        <form className="modal__form" onSubmit={onSubmit}>

          {/* IMAGE UPLOAD */}
          <div className="proj-upload">
            <label htmlFor="projectImageInput" className="proj-upload__label">
              {projectForm.image ? (
                <img src={projectForm.image} alt="preview" className="proj-upload__preview" />
              ) : (
                <div className="proj-upload__placeholder">
                  <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
                    <path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <span>Upload Project Image</span>
                </div>
              )}
            </label>
            <input id="projectImageInput" type="file" hidden accept="image/*" onChange={onImageChange} />
          </div>

          {/* FIELDS GRID */}
          <div className="modal__grid">
            <div className="modal__field">
              <label className="modal__label">Project Name *</label>
              <input className="modal__input" type="text" name="title" value={projectForm.title} onChange={onFieldChange} placeholder="e.g. Modern Courtyard Villa" required />
            </div>
            <div className="modal__field">
              <label className="modal__label">Client Name</label>
              <input className="modal__input" type="text" name="client" value={projectForm.client} onChange={onFieldChange} placeholder="e.g. Sharma Family" />
            </div>
            <div className="modal__field">
              <label className="modal__label">Location</label>
              <input className="modal__input" type="text" name="location" value={projectForm.location} onChange={onFieldChange} placeholder="e.g. Gurgaon, India" />
            </div>
            <div className="modal__field">
              <label className="modal__label">Budget (₹)</label>
              <input className="modal__input" type="number" name="budget" value={projectForm.budget} onChange={onFieldChange} placeholder="e.g. 2500000" />
            </div>
            <div className="modal__field">
              <label className="modal__label">Date</label>
              <input className="modal__input" type="date" name="date" value={projectForm.date} onChange={onFieldChange} />
            </div>
            <div className="modal__field">
              <label className="modal__label">Status</label>
              <select className="modal__input" name="status" value={projectForm.status} onChange={onFieldChange}>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="modal__field" style={{ marginTop: 4 }}>
            <label className="modal__label">Description</label>
            <textarea className="modal__input modal__textarea" name="description" value={projectForm.description} onChange={onFieldChange} placeholder="Brief description of the project…" />
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="modal__btn" disabled={saving}>
              {saving && <BtnSpinner />}{saving ? "Saving…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function ProjectsPage() {
  const [projects, setProjects]           = useState([]);
  const [architectId, setArchitectId]     = useState(null);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [overlay, setOverlay]             = useState({ show: false, message: "" });
  const [open, setOpen]                   = useState(false);
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [filter, setFilter]               = useState("All");

  const showOverlay = (msg) => setOverlay({ show: true, message: msg });
  const hideOverlay = () => setOverlay({ show: false, message: "" });

  const [projectForm, setProjectForm] = useState({
    title: "", location: "", description: "",
    status: "In Progress", image: "", imageFile: null,
    client: "", budget: "", date: "",
  });

  /* ─── FETCH PROJECTS ─── */
  const fetchProjects = async (id) => {
    try {
      const res = await fetch(`https://api.panvic.in/api/projects/${id}`);
      const result = await res.json();
      if (result.success) {
        setProjects(result.data.map((item) => ({
          id: item.id, title: item.title, location: item.location,
          description: item.description, status: item.status,
          image: item.image_url, client: item.client,
          budget: item.budget, date: item.date,
        })));
      }
    } catch (err) { console.error(err); }
  };

  /* ─── FETCH CURRENT USER ─── */
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem("arch_user"));
        if (!localUser?.email) { setLoading(false); return; }
        const res = await fetch("https://api.panvic.in/api/arch-register/");
        const result = await res.json();
        if (!result.success) { setLoading(false); return; }
        const currentUser = result.data.find((u) => u.email === localUser.email);
        if (!currentUser) { setLoading(false); return; }
        setArchitectId(currentUser.id);
        await fetchProjects(currentUser.id);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchCurrentUser();
  }, []);

  /* ─── FORM HANDLERS ─── */
  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleProjectImage = (e) => {
    const file = e.target.files[0];
    if (file) setProjectForm((prev) => ({ ...prev, image: URL.createObjectURL(file), imageFile: file }));
  };
  const resetProjectForm = () => setProjectForm({
    title: "", location: "", description: "", status: "In Progress",
    image: "", imageFile: null, client: "", budget: "", date: "",
  });
  const closeModals = () => {
    setOpen(false);
    setEditProjectModal(false);
    setEditingProjectId(null);
    resetProjectForm();
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", projectForm.title);
    fd.append("location", projectForm.location || "");
    fd.append("description", projectForm.description || "");
    fd.append("status", projectForm.status);
    fd.append("client", projectForm.client || "");
    fd.append("budget", projectForm.budget || "");
    fd.append("date", projectForm.date || "");
    if (projectForm.imageFile) fd.append("image", projectForm.imageFile);
    return fd;
  };

  /* ─── ADD PROJECT ─── */
  const handleAddProject = async (e) => {
    e.preventDefault();
    showOverlay("Adding project…");
    setSaving(true);
    try {
      const res = await fetch(`https://api.panvic.in/api/projects/${architectId}`, { method: "POST", body: buildFormData() });
      const result = await res.json();
      if (result.success) {
        await fetchProjects(architectId);
        closeModals();
        toast.success("Project added successfully!");
      } else { toast.error(result.message || "Failed to add project."); }
    } catch { toast.error("Network error. Please try again."); }
    finally { hideOverlay(); setSaving(false); }
  };

  /* ─── EDIT PROJECT ─── */
  const handleEditProject = (project) => {
    setProjectForm({
      title: project.title || "", location: project.location || "",
      description: project.description || "", status: project.status || "In Progress",
      image: project.image ? `https://api.panvic.in/${project.image}` : "",
      imageFile: null, client: project.client || "",
      budget: project.budget || "", date: project.date || "",
    });
    setEditingProjectId(project.id);
    setEditProjectModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!architectId || !editingProjectId) return;
    showOverlay("Updating project…");
    setSaving(true);
    try {
      const res = await fetch(`https://api.panvic.in/api/projects/${architectId}/${editingProjectId}`, { method: "PUT", body: buildFormData() });
      const result = await res.json();
      if (result.success) {
        await fetchProjects(architectId);
        closeModals();
        toast.success("Project updated successfully!");
      } else { toast.error(result.message || "Failed to update project."); }
    } catch { toast.error("Network error. Please try again."); }
    finally { hideOverlay(); setSaving(false); }
  };

  /* ─── DELETE PROJECT ─── */
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project?")) return;
    showOverlay("Deleting project…");
    try {
      const res = await fetch(`https://api.panvic.in/api/projects/${architectId}/${projectId}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) { await fetchProjects(architectId); toast.success("Project deleted."); }
      else { toast.error(result.message || "Failed to delete."); }
    } catch { toast.error("Network error. Please try again."); }
    finally { hideOverlay(); }
  };

  /* ─── FILTERED PROJECTS ─── */
  const filtered = filter === "All" ? projects : projects.filter((p) => p.status === filter);
  const completedCount  = projects.filter((p) => p.status === "Completed").length;
  const inProgressCount = projects.filter((p) => p.status === "In Progress").length;

  /* ──────────────── RENDER ──────────────── */
  return (
    <><ProtectedRoute >
      <Toaster position="top-right" richColors toastOptions={{
        duration: 3000,
        style: { fontFamily: "inherit", fontSize: 13, borderRadius: 10, border: "1px solid #eeebe6", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
      }} />
      {overlay.show && <LoadingOverlay message={overlay.message} />}

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* ── PAGE ── */
        .pp { background: #f7f5f2; min-height: 100vh; font-family: 'DM Sans', sans-serif; }
        .pp__container { max-width: 1166px; margin: 0 auto; padding: 0 24px 48px; }

        /* ── TOP HEADER ── */
        .pp__top {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 28px 0 24px; gap: 16px; flex-wrap: wrap;
        }
        .pp__top-left { display: flex; flex-direction: column; gap: 4px; }
        .pp__title { font-size: 22px; font-weight: 700; color: #1a1714; margin: 0; line-height: 1.2; }
        .pp__subtitle { font-size: 13px; color: #8a7d72; margin: 0; }

        /* ── STATS ROW ── */
        .pp__stats {
          display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;
        }
        .pp__stat {
          background: #fff; border: 1px solid #eeebe6;
          border-radius: 12px; padding: 12px 18px;
          display: flex; flex-direction: column; gap: 2px;
          min-width: 110px;
        }
        .pp__stat-value { font-size: 22px; font-weight: 700; color: #1a1714; line-height: 1; }
        .pp__stat-label { font-size: 10.5px; font-weight: 600; color: #b09070; text-transform: uppercase; letter-spacing: 0.5px; }
        .pp__stat--green .pp__stat-value { color: #1a6b3c; }
        .pp__stat--amber .pp__stat-value { color: #8a6200; }

        /* ── ADD BUTTON ── */
        .pp__add-btn {
          height: 38px; padding: 0 20px; border-radius: 9px;
          background: #1a1714; color: #fff;
          font-size: 13px; font-weight: 600; font-family: inherit;
          border: none; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: background 0.15s; white-space: nowrap;
          align-self: flex-start; margin-top: 4px;
        }
        .pp__add-btn:hover { background: #2d2a26; }

        /* ── FILTER TABS ── */
        .pp__filters {
          display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap;
        }
        .pp__filter {
          height: 32px; padding: 0 14px; border-radius: 20px;
          font-size: 12px; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: all 0.15s;
          border: 1px solid #eeebe6;
          background: #fff; color: #8a7d72;
        }
        .pp__filter:hover { border-color: #c9b99a; color: #1a1714; }
        .pp__filter--active {
          background: #1a1714; color: #fff; border-color: #1a1714;
        }

        /* ── TABLE WRAPPER ── */
        .pp__table-wrap {
          background: #fff; border-radius: 16px;
          border: 1px solid #eeebe6; overflow: hidden;
        }

        /* ── TABLE ── */
        .pp__table { width: 100%; border-collapse: collapse; }
        .pp__table thead tr {
          border-bottom: 1px solid #f0ede8;
          background: #faf8f5;
        }
        .pp__table th {
          padding: 11px 16px;
          font-size: 10.5px; font-weight: 600; color: #b09070;
          text-transform: uppercase; letter-spacing: 0.5px;
          text-align: left; white-space: nowrap;
        }
        .pp__table tbody tr {
          border-bottom: 1px solid #f7f5f2;
          transition: background 0.12s;
        }
        .pp__table tbody tr:last-child { border-bottom: none; }
        .pp__table tbody tr:hover { background: #faf8f5; }
        .pp__table td {
          padding: 13px 16px;
          font-size: 13px; color: #3d3530; vertical-align: middle;
        }

        /* ── PROJECT CELL ── */
        .pp__proj-cell { display: flex; align-items: center; gap: 11px; }
        .pp__proj-avatar {
          width: 38px; height: 38px; border-radius: 10px;
          background: #f5f2ed; border: 1px solid #eeebe6;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 700; color: #a08060;
          flex-shrink: 0; overflow: hidden;
        }
        .pp__proj-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pp__proj-name { font-size: 13.5px; font-weight: 600; color: #1a1714; margin: 0; line-height: 1.3; }
        .pp__proj-sub { font-size: 11px; color: #a08060; margin: 0; }

        /* ── BUDGET CELL ── */
        .pp__budget { font-size: 13px; font-weight: 700; color: #1a6b3c; }

        /* ── STATUS BADGE ── */
        .pp__badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.2px;
          white-space: nowrap;
        }
        .pp__badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: ppPulse 2s ease-in-out infinite; }
        @keyframes ppPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pp__badge--done { background: #edf7f0; color: #1e6e44; border: 1px solid #c3e8d3; }
        .pp__badge--wip  { background: #fef9ec; color: #8a6200;  border: 1px solid #f0dfa0; }

        /* ── ACTION BUTTONS ── */
        .pp__action-btns { display: flex; gap: 6px; }
        .pp__btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: 7px;
          font-size: 11.5px; font-weight: 600; font-family: inherit;
          cursor: pointer; border: 1px solid transparent;
          transition: all 0.14s;
        }
        .pp__btn--edit {
          background: #1a1714; color: #fff; border-color: #1a1714;
        }
        .pp__btn--edit:hover { background: #2d2a26; }
        .pp__btn--delete {
          background: #fff5f5; color: #c0392b; border-color: #f5c5c0;
        }
        .pp__btn--delete:hover { background: #fee8e8; }

        /* ── EMPTY STATE ── */
        .pp__empty {
          padding: 56px 24px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .pp__empty-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: #f5f2ed; border: 1px solid #eeebe6;
          display: flex; align-items: center; justify-content: center;
          color: #c5b49a; margin-bottom: 4px;
        }
        .pp__empty h4 { font-size: 15px; font-weight: 600; color: #3d3530; margin: 0; }
        .pp__empty p { font-size: 13px; color: #8a7d72; margin: 0; }

        /* ── LOADING ROW ── */
        .pp__loading {
          padding: 56px 24px; text-align: center;
          font-size: 13px; color: #a08060;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .pp__loading-ring {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid #eeebe6; border-top-color: #a08060;
          animation: spin 0.75s linear infinite; flex-shrink: 0;
        }

        /* ── MODAL OVERLAY ── */
        .modal__overlay {
          position: fixed; inset: 0; z-index: 9998;
          background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; backdrop-filter: blur(2px);
        }
        .modal {
          background: #fff; border-radius: 16px; border: 1px solid #eeebe6;
          width: 100%; max-width: 440px; padding: 24px;
          max-height: 90vh; overflow-y: auto;
        }
        .modal--wide { max-width: 540px !important; }
        .modal__title {
          font-size: 17px; font-weight: 700; color: #1a1714;
          margin: 0 0 18px; padding-bottom: 14px;
          border-bottom: 1px solid #f0ede8;
        }
        .modal__form { display: flex; flex-direction: column; gap: 12px; }
        .modal__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .modal__field { display: flex; flex-direction: column; gap: 4px; }
        .modal__label {
          font-size: 10.5px; font-weight: 600; color: #b09070;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .modal__input {
          width: 100%; height: 38px;
          background: #faf8f5; border: 1px solid #e8e3dc;
          border-radius: 9px; padding: 0 12px;
          font-size: 13.5px; color: #1a1714; font-family: inherit;
          outline: none; transition: border-color 0.15s, background 0.15s;
          box-sizing: border-box;
        }
        .modal__input:focus { border-color: #a08060; background: #fff; }
        .modal__textarea { height: 88px; padding: 10px 12px; resize: none; }
        .modal__actions {
          display: flex; gap: 8px; margin-top: 4px;
          padding-top: 14px; border-top: 1px solid #f0ede8;
        }
        .modal__btn {
          flex: 1; height: 38px; border-radius: 9px;
          font-size: 13px; font-weight: 600; font-family: inherit;
          cursor: pointer; border: 1px solid transparent;
          transition: all 0.15s; background: #1a1714; color: #fff;
          display: flex; align-items: center; justify-content: center;
        }
        .modal__btn:hover { background: #2d2a26; }
        .modal__btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .modal__btn--ghost { background: #fff; color: #1a1714; border-color: #ddd8d0; }
        .modal__btn--ghost:hover { background: #f7f5f2; }

        /* ── PROJECT UPLOAD ── */
        .proj-upload { margin-bottom: 4px; }
        .proj-upload__label {
          display: block; cursor: pointer; border-radius: 10px;
          overflow: hidden; border: 1.5px dashed #ddd8d0;
          transition: border-color 0.2s;
        }
        .proj-upload__label:hover { border-color: #a08060; }
        .proj-upload__preview { width: 100%; height: 160px; object-fit: cover; display: block; }
        .proj-upload__placeholder {
          height: 110px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 8px;
          color: #a08060; font-size: 13px; background: #faf8f5;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .pp__table th:nth-child(3),
          .pp__table td:nth-child(3),
          .pp__table th:nth-child(4),
          .pp__table td:nth-child(4),
          .pp__table th:nth-child(6),
          .pp__table td:nth-child(6) { display: none; }
        }
        @media (max-width: 500px) {
          .modal__grid { grid-template-columns: 1fr; }
          .pp__top { flex-direction: column; }
          .pp__add-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <section className="pp">
        <div className="pp__container">

          {/* TOP */}
          <div className="pp__top">
            <div className="pp__top-left">
              <h1 className="pp__title">My Projects</h1>
              <p className="pp__subtitle">Manage all architecture and interior projects.</p>
            </div>
            <button className="pp__add-btn" onClick={() => setOpen(true)}>
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Project
            </button>
          </div>

          {/* STATS */}
          <div className="pp__stats">
            <div className="pp__stat">
              <span className="pp__stat-value">{projects.length}</span>
              <span className="pp__stat-label">Total</span>
            </div>
            <div className="pp__stat pp__stat--green">
              <span className="pp__stat-value">{completedCount}</span>
              <span className="pp__stat-label">Completed</span>
            </div>
            <div className="pp__stat pp__stat--amber">
              <span className="pp__stat-value">{inProgressCount}</span>
              <span className="pp__stat-label">In Progress</span>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="pp__filters">
            {["All", "In Progress", "Completed"].map((f) => (
              <button
                key={f}
                className={`pp__filter${filter === f ? " pp__filter--active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* TABLE */}
          <div className="pp__table-wrap">
            {loading ? (
              <div className="pp__loading">
                <div className="pp__loading-ring" />
                Loading projects…
              </div>
            ) : filtered.length === 0 ? (
              <div className="pp__empty">
                <div className="pp__empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
                    <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h4>{filter === "All" ? "No Projects Yet" : `No ${filter} Projects`}</h4>
                <p>{filter === "All" ? "Start by adding your first architecture project." : `You have no projects with "${filter}" status.`}</p>
              </div>
            ) : (
              <table className="pp__table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Location</th>
                    <th>Client</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => (
                    <tr key={project.id}>
                      {/* PROJECT */}
                      <td>
                        <div className="pp__proj-cell">
                          <div className="pp__proj-avatar">
                            {project.image
                              ? <img src={`https://api.panvic.in/${project.image}`} alt={project.title} onError={(e) => { e.target.style.display = "none"; }} />
                              : project.title?.charAt(0) ?? "P"
                            }
                          </div>
                          <div>
                            <p className="pp__proj-name">{project.title}</p>
                            <p className="pp__proj-sub">Architecture Project</p>
                          </div>
                        </div>
                      </td>
                      {/* LOCATION */}
                      <td style={{ color: "#7a7068" }}>{project.location || "—"}</td>
                      {/* CLIENT */}
                      <td style={{ color: "#7a7068" }}>{project.client || "—"}</td>
                      {/* BUDGET */}
                      <td><span className="pp__budget">{formatBudget(project.budget)}</span></td>
                      {/* STATUS */}
                      <td>
                        <span className={`pp__badge ${project.status === "Completed" ? "pp__badge--done" : "pp__badge--wip"}`}>
                          <span className="pp__badge-dot" />
                          {project.status}
                        </span>
                      </td>
                      {/* DATE */}
                      <td style={{ color: "#7a7068", fontSize: 12 }}>{formatDate(project.date)}</td>
                      {/* ACTIONS */}
                      <td>
                        <div className="pp__action-btns">
                          <button className="pp__btn pp__btn--edit" onClick={() => handleEditProject(project)}>
                            <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
                              <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                            </svg>
                            Edit
                          </button>
                          <button className="pp__btn pp__btn--delete" onClick={() => handleDeleteProject(project.id)}>
                            <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
                              <path d="M3 5h10M6 5V3h4v2M6 8v4M10 8v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                              <rect x="3" y="5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ROW COUNT */}
          {!loading && filtered.length > 0 && (
            <p style={{ fontSize: 12, color: "#a08060", marginTop: 10, textAlign: "right" }}>
              Showing {filtered.length} of {projects.length} {projects.length === 1 ? "project" : "projects"}
            </p>
          )}
        </div>

        {/* ADD PROJECT MODAL */}
        {open && (
          <ProjectModalForm
            title="Add Project"
            onSubmit={handleAddProject}
            submitLabel="Save Project"
            projectForm={projectForm}
            onFieldChange={handleProjectChange}
            onImageChange={handleProjectImage}
            onClose={closeModals}
            saving={saving}
          />
        )}

        {/* EDIT PROJECT MODAL */}
        {editProjectModal && (
          <ProjectModalForm
            title="Edit Project"
            onSubmit={handleUpdateProject}
            submitLabel="Update Project"
            projectForm={projectForm}
            onFieldChange={handleProjectChange}
            onImageChange={handleProjectImage}
            onClose={closeModals}
            saving={saving}
          />
        )}
      </section></ProtectedRoute >
    </>
  );
}
