"use client";

import { useEffect, useState } from "react";
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

/* ─── PROJECT CARD ─── */
function ProjectCard({ project, onEdit, onDelete }) {
  const isCompleted = project.status === "Completed";
  return (
    <div className="proj-card">
      <div className="proj-card__img-wrap">
        {project.image ? (
          <img
            src={`https://api.panvic.in/${project.image}`}
            alt={project.title}
            className="proj-card__img"
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        <div className="proj-card__img-fallback" style={{ display: project.image ? "none" : "flex" }}>
          <span>{project.title?.charAt(0) ?? "P"}</span>
        </div>
        <div className={`proj-card__status ${isCompleted ? "proj-card__status--done" : "proj-card__status--wip"}`}>
          <span className="proj-card__status-dot" />
          {project.status}
        </div>
      </div>

      <div className="proj-card__body">
        <h3 className="proj-card__title">{project.title}</h3>
        <div className="proj-card__meta-grid">
          <div className="proj-card__meta-item">
            <svg className="proj-card__meta-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <span className="proj-card__meta-label">Client</span>
              <span className="proj-card__meta-value">{project.client || "—"}</span>
            </div>
          </div>
          <div className="proj-card__meta-item">
            <svg className="proj-card__meta-icon" viewBox="0 0 20 20" fill="none">
              <path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <div>
              <span className="proj-card__meta-label">Location</span>
              <span className="proj-card__meta-value">{project.location || "—"}</span>
            </div>
          </div>
          <div className="proj-card__meta-item">
            <svg className="proj-card__meta-icon" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 9h16" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 13h2M12 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <span className="proj-card__meta-label">Budget</span>
              <span className="proj-card__meta-value proj-card__meta-value--budget">{formatBudget(project.budget)}</span>
            </div>
          </div>
          <div className="proj-card__meta-item">
            <svg className="proj-card__meta-icon" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 9h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div>
              <span className="proj-card__meta-label">Date</span>
              <span className="proj-card__meta-value">{formatDate(project.date)}</span>
            </div>
          </div>
        </div>
        {project.description && (
          <p className="proj-card__desc">{project.description}</p>
        )}
        <div className="proj-card__actions">
          <button className="proj-card__btn proj-card__btn--edit" onClick={() => onEdit(project)}>
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
              <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
            Edit
          </button>
          <button className="proj-card__btn proj-card__btn--delete" onClick={() => onDelete(project.id)}>
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
              <path d="M3 5h10M6 5V3h4v2M6 8v4M10 8v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <rect x="3" y="5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      <style>{`
        .proj-card { background: #fff; border-radius: 16px; border: 1px solid #eeebe6; overflow: hidden; display: flex; flex-direction: column; transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s; font-family: 'DM Sans', sans-serif; }
        .proj-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); transform: translateY(-2px); border-color: #ddd8d0; }
        .proj-card__img-wrap { position: relative; height: 180px; background: #f5f2ed; overflow: hidden; }
        .proj-card__img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
        .proj-card:hover .proj-card__img { transform: scale(1.03); }
        .proj-card__img-fallback { width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 48px; font-weight: 600; color: #c5b49a; background: #f5f2ed; }
        .proj-card__status { position: absolute; top: 10px; right: 10px; display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.2px; }
        .proj-card__status--done { background: #edf7f0; color: #1e6e44; border: 1px solid #c3e8d3; }
        .proj-card__status--wip { background: #fef9ec; color: #8a6200; border: 1px solid #f0dfa0; }
        .proj-card__status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .proj-card__body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
        .proj-card__title { font-size: 15px; font-weight: 600; color: #1a1714; margin: 0; line-height: 1.35; }
        .proj-card__meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .proj-card__meta-item { display: flex; align-items: flex-start; gap: 7px; padding: 8px 9px; background: #faf8f5; border-radius: 9px; border: 1px solid #f0ede8; }
        .proj-card__meta-icon { width: 15px; height: 15px; color: #a08060; flex-shrink: 0; margin-top: 1px; }
        .proj-card__meta-item > div { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .proj-card__meta-label { font-size: 9.5px; font-weight: 600; color: #b09070; letter-spacing: 0.5px; text-transform: uppercase; }
        .proj-card__meta-value { font-size: 12px; font-weight: 500; color: #3d3530; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .proj-card__meta-value--budget { color: #1a6b3c; font-weight: 700; font-size: 12.5px; }
        .proj-card__desc { font-size: 12px; color: #7a7068; line-height: 1.6; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; padding: 9px 11px; background: #faf8f5; border-radius: 0 8px 8px 0; border-left: 2px solid #ddd0bc; }
        .proj-card__actions { display: flex; gap: 7px; margin-top: auto; }
        .proj-card__btn { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; font-family: inherit; }
        .proj-card__btn--edit { background: #1a1714; color: #fff; flex: 1; justify-content: center; }
        .proj-card__btn--edit:hover { background: #2d2a26; }
        .proj-card__btn--delete { background: #fff5f5; color: #c0392b; border-color: #f5c5c0; }
        .proj-card__btn--delete:hover { background: #fee8e8; }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PROJECT MODAL FORM — defined OUTSIDE ProfilePage
   so it never gets a new component identity on re-render
══════════════════════════════════════════════════ */
function ProjectModalForm({
  title,
  onSubmit,
  submitLabel,
  projectForm,
  onFieldChange,
  onImageChange,
  onClose,
}) {
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
            <input
              id="projectImageInput"
              type="file"
              hidden
              accept="image/*"
              onChange={onImageChange}
            />
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
            <button type="button" className="modal__btn modal__btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal__btn">{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function ProfilePage() {
  const [overlay, setOverlay] = useState({ show: false, message: "" });
  const showOverlay = (msg) => setOverlay({ show: true, message: msg });
  const hideOverlay = () => setOverlay({ show: false, message: "" });

  const [editProjectModal, setEditProjectModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [open, setOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "", profession: "", work: "", bio: "", location: "India",
    profileImage: "", email: "", mobile: "", dob: "", firm_name: "",
    marital_status: "", bank_name: "", account_holder_name: "",
    account_number: "", ifsc_code: "", upi_id: "",
  });

  const [openAccordion, setOpenAccordion] = useState("personal");
  const [architectId, setArchitectId] = useState(null);
  const toggleAccordion = (s) => setOpenAccordion(openAccordion === s ? null : s);

  const [projects, setProjects] = useState([]);

  const fetchProjects = async (id) => {
    try {
      const res = await fetch(`https://api.panvic.in/api/projects/${id}`);
      const result = await res.json();
      if (result.success) {
        setProjects(result.data.map((item) => ({
          id: item.id,
          title: item.title,
          location: item.location,
          description: item.description,
          status: item.status,
          image: item.image_url,
          client: item.client,
          budget: item.budget,
          date: item.date,
        })));
      }
    } catch (err) { console.error(err); }
  };

  const openCategoryModal = (category) => {
    setActiveCategory(category);
    setDetailsModal(true);
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem("arch_user"));
        if (!localUser?.email) return;
        const res = await fetch("https://api.panvic.in/api/arch-register/");
        const result = await res.json();
        if (!result.success) return;
        const currentUser = result.data.find((u) => u.email === localUser.email);
        if (!currentUser) return;
        setArchitectId(currentUser.id);
        fetchProjects(currentUser.id);
        setProfileData({
          name: currentUser.full_name || "",
          profession: currentUser.profession || "",
          work: currentUser.firm_name || "",
          bio: "Minimal architect focused on elegant and modern living spaces.",
          location: "India",
          profileImage: currentUser.profile_image
            ? `https://api.panvic.in${currentUser.profile_image}`
            : "",
          email: currentUser.email || "",
          mobile: currentUser.mobile_number || "",
          dob: currentUser.date_of_birth || "",
          firm_name: currentUser.firm_name || "",
          marital_status: currentUser.marital_status || "",
          bank_name: currentUser.bank_name || "",
          account_holder_name: currentUser.account_holder_name || "",
          account_number: currentUser.account_number || "",
          ifsc_code: currentUser.ifsc_code || "",
          upi_id: currentUser.upi_id || "",
        });
      } catch (err) { console.error(err); }
    };
    fetchCurrentUser();
  }, [architectId]);

  const [projectForm, setProjectForm] = useState({
    title: "", location: "", description: "", status: "In Progress",
    image: "", imageFile: null, client: "", budget: "", date: "",
  });

  const resetProjectForm = () => setProjectForm({
    title: "", location: "", description: "", status: "In Progress",
    image: "", imageFile: null, client: "", budget: "", date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  /* ── PROFILE IMAGE UPLOAD ── */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !architectId) return;
    setProfileData((prev) => ({ ...prev, profileImage: URL.createObjectURL(file) }));
    showOverlay("Uploading profile photo…");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `https://api.panvic.in/api/arch-register/${architectId}/profile-image`,
        { method: "PATCH", body: formData }
      );
      const result = await res.json();
      if (result.success) {
        setProfileData((prev) => ({
          ...prev,
          profileImage: `https://api.panvic.in${result.data.profile_image}`,
        }));
        toast.success("Profile photo updated!");
      } else {
        toast.error(result.detail || "Failed to upload photo.");
        setProfileData((prev) => ({ ...prev, profileImage: "" }));
      }
    } catch {
      toast.error("Network error. Please try again.");
      setProfileData((prev) => ({ ...prev, profileImage: "" }));
    } finally { hideOverlay(); }
  };

  /* ── SAVE PROFILE ── */
  const handleSave = async () => {
    if (detailsModal) {
      if (!architectId) return;
      setSaving(true);
      const CATEGORY_FIELDS = {
        personal: { full_name: profileData.name, mobile_number: profileData.mobile, email: profileData.email, date_of_birth: profileData.dob, marital_status: profileData.marital_status },
        professional: { profession: profileData.profession, firm_name: profileData.firm_name },
        bank: { bank_name: profileData.bank_name, account_holder_name: profileData.account_holder_name, account_number: profileData.account_number, ifsc_code: profileData.ifsc_code, upi_id: profileData.upi_id },
      };
      try {
        const res = await fetch(
          `https://api.panvic.in/api/arch-register/${architectId}/update?category=${activeCategory}`,
          { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(CATEGORY_FIELDS[activeCategory]) }
        );
        const result = await res.json();
        if (!res.ok || !result.success) { toast.error(result.detail || result.message || "Update failed."); return; }
        const d = result.data;
        setProfileData((prev) => ({
          ...prev,
          name: d.full_name ?? prev.name, mobile: d.mobile_number ?? prev.mobile,
          email: d.email ?? prev.email, dob: d.date_of_birth ?? prev.dob,
          marital_status: d.marital_status ?? prev.marital_status,
          profession: d.profession ?? prev.profession,
          firm_name: d.firm_name ?? prev.firm_name, work: d.firm_name ?? prev.work,
          bank_name: d.bank_name ?? prev.bank_name,
          account_holder_name: d.account_holder_name ?? prev.account_holder_name,
          account_number: d.account_number ?? prev.account_number,
          ifsc_code: d.ifsc_code ?? prev.ifsc_code, upi_id: d.upi_id ?? prev.upi_id,
        }));
        toast.success(result.message || "Saved successfully.");
        setDetailsModal(false);
      } catch { toast.error("Network error. Please try again."); }
      finally { setSaving(false); }
      return;
    }
    if (showEditModal) {
      if (!architectId) return;
      setSaving(true);
      try {
        const [personalRes, professionalRes] = await Promise.all([
          fetch(`https://api.panvic.in/api/arch-register/${architectId}/update?category=personal`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ full_name: profileData.name }),
          }),
          fetch(`https://api.panvic.in/api/arch-register/${architectId}/update?category=professional`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profession: profileData.profession, firm_name: profileData.work }),
          }),
        ]);
        const [pR, prR] = await Promise.all([personalRes.json(), professionalRes.json()]);
        if (!pR.success || !prR.success) { toast.error(pR.detail || prR.detail || "Update failed."); return; }
        setProfileData((prev) => ({
          ...prev,
          name: pR.data.full_name ?? prev.name,
          profession: prR.data.profession ?? prev.profession,
          firm_name: prR.data.firm_name ?? prev.firm_name,
          work: prR.data.firm_name ?? prev.work,
        }));
        toast.success("Profile updated successfully.");
        setShowEditModal(false);
      } catch { toast.error("Network error. Please try again."); }
      finally { setSaving(false); }
    }
  };

  /* ── PROJECT HANDLERS ── */
  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleProjectImage = (e) => {
    const file = e.target.files[0];
    if (file) setProjectForm((prev) => ({ ...prev, image: URL.createObjectURL(file), imageFile: file }));
  };

  const buildProjectFormData = () => {
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

  const handleAddProject = async (e) => {
    e.preventDefault();
    showOverlay("Adding project…");
    try {
      const res = await fetch(`https://api.panvic.in/api/projects/${architectId}`, { method: "POST", body: buildProjectFormData() });
      const result = await res.json();
      if (result.success) {
        await fetchProjects(architectId);
        setOpen(false); resetProjectForm();
        toast.success("Project added successfully!");
      } else { toast.error(result.message || "Failed to add project."); }
    } catch { toast.error("Network error. Please try again."); }
    finally { hideOverlay(); }
  };

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
    try {
      const res = await fetch(
        `https://api.panvic.in/api/projects/${architectId}/${editingProjectId}`,
        { method: "PUT", body: buildProjectFormData() }
      );
      const result = await res.json();
      if (result.success) {
        await fetchProjects(architectId);
        setEditProjectModal(false); setEditingProjectId(null); resetProjectForm();
        toast.success("Project updated successfully!");
      } else { toast.error(result.message || "Failed to update project."); }
    } catch { toast.error("Network error. Please try again."); }
    finally { hideOverlay(); }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project?")) return;
    showOverlay("Deleting project…");
    try {
      const res = await fetch(
        `https://api.panvic.in/api/projects/${architectId}/${projectId}`,
        { method: "DELETE" }
      );
      const result = await res.json();
      if (result.success) { await fetchProjects(architectId); toast.success("Project deleted."); }
      else { toast.error(result.message || "Failed to delete project."); }
    } catch { toast.error("Network error. Please try again."); }
    finally { hideOverlay(); }
  };

  const closeProjectModals = () => {
    setOpen(false);
    setEditProjectModal(false);
    setEditingProjectId(null);
    resetProjectForm();
  };

  /* ──────────────── RENDER ──────────────── */
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "inherit",
            fontSize: 13,
            borderRadius: 10,
            border: "1px solid #eeebe6",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          },
        }}
      />
      {overlay.show && <LoadingOverlay message={overlay.message} />}

      <style>{`
        .profile { background: #f7f5f2; min-height: 100vh; }
        .profile__container { max-width: 1166px; margin: 0 auto; padding: 0 0 48px; }
        .profile__header { background: #fff; border-bottom: 1px solid #eeebe6; display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; position: sticky; top: 0; z-index: 100; }
        .profile__username { font-size: 15px; font-weight: 600; color: #1a1714; margin: 0; }
        .profile__menu-btn { width: 34px; height: 34px; border-radius: 8px; background: #f5f2ed; border: 1px solid #eeebe6; color: #6b6259; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
        .profile__menu-btn:hover { background: #ede9e3; }
        .profile__info-main { background: #fff; border-bottom: 1px solid #eeebe6; padding: 28px 24px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; }
        .profile__avatar-wrapper { position: relative; }
        .profile__avatar-upload { display: block; cursor: pointer; width: 82px; height: 82px; border-radius: 50%; overflow: hidden; border: 2px solid #eeebe6; transition: border-color 0.2s; }
        .profile__avatar-upload:hover { border-color: #c9b99a; }
        .profile__avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .profile__avatar-placeholder { width: 100%; height: 100%; background: #f5f2ed; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #a08060; letter-spacing: 0.3px; }
        .profile__name-role { display: flex; flex-direction: column; gap: 3px; }
        .profile__name-role h2 { font-size: 20px; font-weight: 700; color: #1a1714; margin: 0; line-height: 1.2; }
        .profile__name-role p { font-size: 13px; color: #8a7d72; margin: 0; }
        .profile__bio { font-size: 13px; color: #7a7068; line-height: 1.65; max-width: 420px; margin: 0; }
        .profile__location { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #8a7d72; background: #f7f5f2; border: 1px solid #eeebe6; border-radius: 20px; padding: 4px 12px; }
        .profile__actions { display: flex; gap: 8px; margin-top: 4px; }
        .profile__edit-btn, .profile__share-btn { height: 36px; padding: 0 18px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; font-family: inherit; }
        .profile__edit-btn { background: #fff; color: #1a1714; border-color: #ddd8d0; }
        .profile__edit-btn:hover { background: #f7f5f2; border-color: #c9b99a; }
        .profile__share-btn { background: #1a1714; color: #fff; }
        .profile__share-btn:hover { background: #2d2a26; }
        .profile__accordions { width: 100%; display: flex; flex-direction: column; gap: 0; margin-top: 16px; border-top: 1px solid #f0ede8; }
        .profile__accordion { border-bottom: 1px solid #f0ede8; position: relative; }
        .profile__accordion-header { width: 100%; background: none; border: none; display: flex; align-items: center; justify-content: space-between; padding: 13px 4px; font-size: 13px; font-weight: 600; color: #1a1714; cursor: pointer; text-align: left; transition: color 0.15s; }
        .profile__accordion-header:hover { color: #6b6259; }
        .profile__tab-edit:hover { background: #fff; border-color: #c9b99a; color: #1a1714; }
        .profile__accordion-body { padding: 4px 0 14px; }
        .profile__tab-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
       .profile__item {
    background: #faf8f5;
    border: 1px solid #f0ede8;
    border-radius: 9px;
    padding: 4px 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}
        .profile__item span { font-size: 10px; font-weight: 600; color: #b09070; text-transform: uppercase; letter-spacing: 0.5px; }
        .profile__item h4 { font-size: 13px; font-weight: 500; color: #1a1714; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .profile__section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .profile__section-header h3 { font-size: 16px; font-weight: 700; color: #1a1714; margin: 0; }
        .profile__empty { text-align: center; padding: 48px 24px; background: #fff; border-radius: 14px; border: 1px dashed #ddd8d0; }
        .profile__empty h4 { font-size: 15px; font-weight: 600; color: #3d3530; margin: 0 0 6px; }
        .profile__empty p { font-size: 13px; color: #8a7d72; margin: 0; }
        .modal__overlay { position: fixed; inset: 0; z-index: 9998; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(2px); }
       .modal {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #eeebe6;
    width: 100%;
    /* max-width: 440px; */
    padding: 24px;
    max-height: 80vh;
    overflow-y: auto;
}
        .modal__title { font-size: 17px; font-weight: 700; color: #1a1714; margin: 0 0 18px; padding-bottom: 14px; border-bottom: 1px solid #f0ede8; }
        .modal__form { display: flex; flex-direction: column; gap: 12px; }
        .modal__input { width: 100%; height: 38px; background: #faf8f5; border: 1px solid #e8e3dc; border-radius: 9px; padding: 0 12px; font-size: 13.5px; color: #1a1714; font-family: inherit; outline: none; transition: border-color 0.15s, background 0.15s; box-sizing: border-box; }
        .modal__input:focus { border-color: #a08060; background: #fff; }
        .modal__textarea { height: 88px; padding: 10px 12px; resize: none; }
        .modal__actions { display: flex; gap: 8px; margin-top: 4px; padding-top: 14px; border-top: 1px solid #f0ede8; }
        .modal__btn { flex: 1; height: 38px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; font-family: inherit; background: #1a1714; color: #fff; }
        .modal__btn:hover { background: #2d2a26; }
        .modal__btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .modal__btn--ghost { background: #fff; color: #1a1714; border-color: #ddd8d0; }
        .modal__btn--ghost:hover { background: #f7f5f2; }
        .proj-upload { margin-bottom: 4px; }
        .proj-upload__label { display: block; cursor: pointer; border-radius: 10px; overflow: hidden; border: 1.5px dashed #ddd8d0; transition: border-color 0.2s; }
        .proj-upload__label:hover { border-color: #a08060; }
        .proj-upload__preview { width: 100%; height: 160px; object-fit: cover; display: block; }
        .proj-upload__placeholder { height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #a08060; font-size: 13px; background: #faf8f5; }
        .modal__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .modal__field { display: flex; flex-direction: column; gap: 4px; }
        .modal__label { font-size: 10.5px; font-weight: 600; color: #b09070; text-transform: uppercase; letter-spacing: 0.5px; }
        @media (max-width: 500px) {
          .modal__grid { grid-template-columns: 1fr; }
          .profile__tab-grid { grid-template-columns: 1fr; }
          .profile__actions { flex-direction: column; width: 100%; }
          .profile__edit-btn, .profile__share-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <section className="profile">
        <div className="profile__container">

          {/* PROFILE INFO */}
          <div className="proj-card profile__info-main">
            <div className="profile__avatar-wrapper">
              <label htmlFor="profileUpload" className="profile__avatar-upload">
                {profileData.profileImage
                  ? <img src={profileData.profileImage} alt="Profile" className="profile__avatar-img" />
                  : <div className="profile__avatar-placeholder">Upload Photo</div>}
              </label>
              <input id="profileUpload" type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="profile__name-role">
              <h2>{profileData.name}</h2>
              <p>{profileData.profession}{profileData.firm_name ? ` · ${profileData.firm_name}` : ""}</p>
            </div>

            {profileData.bio && <p className="profile__bio">{profileData.bio}</p>}

            <div className="profile__location">📍 {profileData.location}</div>

            <div className="profile__actions">
              <button className="profile__edit-btn" onClick={() => setShowEditModal(true)}>Edit Profile</button>
              <button className="profile__share-btn" onClick={() => setOpen(true)}>+ Add Project</button>
            </div>

            {/* ACCORDIONS */}
            <div className="profile__accordions">
              {/* PERSONAL */}
              <div className="profile__accordion">
                <button className="profile__accordion-header" onClick={() => toggleAccordion("personal")}>
                  <span>Personal Details</span>
                  <span style={{ fontSize: 18, fontWeight: 400, color: "#a08060", marginRight: 56 }}>
                    {openAccordion === "personal" ? "−" : "+"}
                  </span>
                </button>
                <button className="profile__tab-edit" onClick={() => openCategoryModal("personal")}>Edit</button>
                {openAccordion === "personal" && (
                  <div className="profile__accordion-body">
                    <div className="profile__tab-grid">
                      <div className="profile__item"><span>Full Name</span><h4>{profileData.name || "—"}</h4></div>
                      <div className="profile__item"><span>Mobile</span><h4>{profileData.mobile || "—"}</h4></div>
                      <div className="profile__item"><span>Email</span><h4>{profileData.email || "—"}</h4></div>
                      <div className="profile__item"><span>DOB</span><h4>{profileData.dob || "—"}</h4></div>
                      <div className="profile__item"><span>Marital Status</span><h4>{profileData.marital_status || "—"}</h4></div>
                    </div>
                  </div>
                )}
              </div>

              {/* PROFESSIONAL */}
              <div className="profile__accordion">
                <button className="profile__accordion-header" onClick={() => toggleAccordion("professional")}>
                  <span>Professional Details</span>
                  <span style={{ fontSize: 18, fontWeight: 400, color: "#a08060", marginRight: 56 }}>
                    {openAccordion === "professional" ? "−" : "+"}
                  </span>
                </button>
                <button className="profile__tab-edit" onClick={() => openCategoryModal("professional")}>Edit</button>
                {openAccordion === "professional" && (
                  <div className="profile__accordion-body">
                    <div className="profile__tab-grid">
                      <div className="profile__item"><span>Profession</span><h4>{profileData.profession || "—"}</h4></div>
                      <div className="profile__item"><span>Firm Name</span><h4>{profileData.firm_name || "—"}</h4></div>
                      <div className="profile__item"><span>Location</span><h4>{profileData.location || "—"}</h4></div>
                    </div>
                  </div>
                )}
              </div>

              {/* BANK */}
              <div className="profile__accordion">
                <button className="profile__accordion-header" onClick={() => toggleAccordion("bank")}>
                  <span>Bank Details</span>
                  <span style={{ fontSize: 18, fontWeight: 400, color: "#a08060", marginRight: 56 }}>
                    {openAccordion === "bank" ? "−" : "+"}
                  </span>
                </button>
                <button className="profile__tab-edit" onClick={() => openCategoryModal("bank")}>Edit</button>
                {openAccordion === "bank" && (
                  <div className="profile__accordion-body">
                    <div className="profile__tab-grid">
                      <div className="profile__item"><span>Bank Name</span><h4>{profileData.bank_name || "—"}</h4></div>
                      <div className="profile__item"><span>Account Holder</span><h4>{profileData.account_holder_name || "—"}</h4></div>
                      <div className="profile__item"><span>Account Number</span><h4>{profileData.account_number || "—"}</h4></div>
                      <div className="profile__item"><span>IFSC Code</span><h4>{profileData.ifsc_code || "—"}</h4></div>
                      <div className="profile__item"><span>UPI ID</span><h4>{profileData.upi_id || "—"}</h4></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── PROJECTS SECTION ── */}
          <div className="profile__section">
            <div className="profile__section-header">
              <h3>Projects</h3>
              <span style={{ fontSize: 12, color: "#a08060", fontWeight: 600, background: "#faf8f5", border: "1px solid #eeebe6", borderRadius: 20, padding: "3px 12px" }}>
                {projects.length} {projects.length === 1 ? "project" : "projects"}
              </span>
            </div>

            {projects.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))", gap: 16 }}>
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            ) : (
              <div className="profile__empty">
                <h4>No Projects Yet</h4>
                <p>Start uploading your architecture projects.</p>
              </div>
            )}
          </div>
        </div>

        {/* CATEGORY DETAILS MODAL */}
        {detailsModal && (
          <div className="modal__overlay" onClick={() => setDetailsModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal__title">
                {activeCategory === "personal" ? "Edit Personal Details"
                  : activeCategory === "professional" ? "Edit Professional Details"
                  : "Edit Bank Details"}
              </h2>
              <div className="modal__form">
{activeCategory === "personal" && (
  <>
    <div className="modal__field">
      <label className="modal__label">Full Name</label>
      <input
        type="text"
        name="name"
        className="modal__input"
        placeholder="Full Name"
        value={profileData.name}
        onChange={handleChange}
      />
    </div>

    <div className="modal__field">
      <label className="modal__label">Mobile Number</label>
      <input
        type="text"
        name="mobile"
        className="modal__input"
        placeholder="Mobile Number"
        value={profileData.mobile}
        onChange={handleChange}
      />
    </div>

    <div className="modal__field">
      <label className="modal__label">Email</label>
      <input
        type="email"
        name="email"
        className="modal__input"
        placeholder="Email"
        value={profileData.email}
        onChange={handleChange}
      />
    </div>

    <div className="modal__field">
      <label className="modal__label">Date of Birth</label>
      <input
        type="date"
        name="dob"
        className="modal__input"
        value={profileData.dob}
        onChange={handleChange}
      />
    </div>

    <div className="modal__field">
      <label className="modal__label">Marital Status</label>
      <select
        name="marital_status"
        className="modal__input"
        value={profileData.marital_status || ""}
        onChange={handleChange}
      >
        <option value="">Select Marital Status</option>
        <option value="Single">Single</option>
        <option value="Married">Married</option>
        <option value="Divorced">Divorced</option>
        <option value="Widowed">Widowed</option>
      </select>
    </div>
  </>
)}
                {activeCategory === "professional" && (<>
                  <div className="modal__field"><label className="modal__label">Profession</label><input type="text" name="profession" className="modal__input" placeholder="Profession" value={profileData.profession} onChange={handleChange} /></div>
                  <div className="modal__field"><label className="modal__label">Firm Name</label><input type="text" name="firm_name" className="modal__input" placeholder="Firm Name" value={profileData.firm_name} onChange={handleChange} /></div>
                  <div className="modal__field"><label className="modal__label">Location</label><input type="text" name="location" className="modal__input" placeholder="Location" value={profileData.location} onChange={handleChange} /></div>
                </>)}
                {activeCategory === "bank" && (<>
                  <div className="modal__field"><label className="modal__label">Bank Name</label><input type="text" name="bank_name" className="modal__input" placeholder="Bank Name" value={profileData.bank_name} onChange={handleChange} /></div>
                  <div className="modal__field"><label className="modal__label">Account Holder Name</label><input type="text" name="account_holder_name" className="modal__input" placeholder="Account Holder Name" value={profileData.account_holder_name} onChange={handleChange} /></div>
                  <div className="modal__field"><label className="modal__label">Account Number</label><input type="text" name="account_number" className="modal__input" placeholder="Account Number" value={profileData.account_number} onChange={handleChange} /></div>
                  <div className="modal__field"><label className="modal__label">IFSC Code</label><input type="text" name="ifsc_code" className="modal__input" placeholder="IFSC Code" value={profileData.ifsc_code} onChange={handleChange} /></div>
                  <div className="modal__field"><label className="modal__label">UPI ID</label><input type="text" name="upi_id" className="modal__input" placeholder="UPI ID" value={profileData.upi_id} onChange={handleChange} /></div>
                </>)}
                <div className="modal__actions">
                  <button type="button" className="modal__btn modal__btn--ghost" onClick={() => setDetailsModal(false)} disabled={saving}>Cancel</button>
                  <button type="button" className="modal__btn" onClick={handleSave} disabled={saving}>
                    {saving && <BtnSpinner />}{saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD PROJECT MODAL */}
        {open && (
          <ProjectModalForm
            title="Add Project"
            onSubmit={handleAddProject}
            submitLabel="Save Project"
            projectForm={projectForm}
            onFieldChange={handleProjectChange}
            onImageChange={handleProjectImage}
            onClose={closeProjectModals}
          />
        )}

        {/* EDIT PROFILE MODAL */}
        {showEditModal && (
          <div className="modal__overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal__title">Edit Profile</h2>
              <div className="modal__form">
                <div className="modal__field"><label className="modal__label">Full Name</label><input type="text" name="name" className="modal__input" placeholder="Full Name" value={profileData.name} onChange={handleChange} /></div>
                <div className="modal__field"><label className="modal__label">Profession</label><input type="text" name="profession" className="modal__input" placeholder="Profession" value={profileData.profession} onChange={handleChange} /></div>
                <div className="modal__field"><label className="modal__label">Work / Firm</label><input type="text" name="work" className="modal__input" placeholder="Work / Firm" value={profileData.work} onChange={handleChange} /></div>
                <div className="modal__field"><label className="modal__label">Bio</label><textarea name="bio" className="modal__input modal__textarea" placeholder="Bio" value={profileData.bio} onChange={handleChange} /></div>
                <div className="modal__field"><label className="modal__label">Location</label><input type="text" name="location" className="modal__input" placeholder="Location" value={profileData.location} onChange={handleChange} /></div>
                <div className="modal__actions">
                  <button type="button" className="modal__btn modal__btn--ghost" onClick={() => setShowEditModal(false)} disabled={saving}>Cancel</button>
                  <button type="button" className="modal__btn" onClick={handleSave} disabled={saving}>
                    {saving && <BtnSpinner />}{saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
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
            onClose={closeProjectModals}
          />
        )}
      </section>
    </>
  );
}
