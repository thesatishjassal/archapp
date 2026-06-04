"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

/* ─── LOADING OVERLAY ─── */
function LoadingOverlay({ message = "Please wait…" }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.5)", display: "flex",
      flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 16,
      backdropFilter: "blur(3px)",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.2)",
        borderTopColor: "#fff",
        animation: "spin 0.75s linear infinite",
      }} />
      <p style={{ color: "#fff", fontSize: 14, fontWeight: 500, margin: 0 }}>{message}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─── BUTTON SPINNER ─── */
function BtnSpinner() {
  return (
    <span style={{
      display: "inline-block", width: 14, height: 14,
      borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)",
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
      {/* IMAGE */}
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

      {/* BODY */}
      <div className="proj-card__body">
        <h3 className="proj-card__title">{project.title}</h3>

        <div className="proj-card__meta-grid">
          {/* Client */}
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

          {/* Location */}
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

          {/* Budget */}
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

          {/* Date */}
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

        {/* Description */}
        {project.description && (
          <p className="proj-card__desc">{project.description}</p>
        )}

        {/* Actions */}
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
        .proj-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #f0ede8;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.2s, transform 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .proj-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.10);
          transform: translateY(-2px);
        }
        .proj-card__img-wrap {
          position: relative;
          height: 200px;
          background: #f7f4ef;
          overflow: hidden;
        }
        .proj-card__img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s;
        }
        .proj-card:hover .proj-card__img { transform: scale(1.04); }
        .proj-card__img-fallback {
          width: 100%; height: 100%;
          align-items: center; justify-content: center;
          font-size: 52px; font-weight: 700;
          color: #c9b99a;
          background: linear-gradient(135deg, #f7f4ef 0%, #ede8df 100%);
        }
        .proj-card__status {
          position: absolute; top: 12px; right: 12px;
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
          backdrop-filter: blur(8px);
        }
        .proj-card__status--done {
          background: rgba(16,185,129,0.15);
          color: #065f46;
          border: 1px solid rgba(16,185,129,0.3);
        }
        .proj-card__status--wip {
          background: rgba(245,158,11,0.15);
          color: #92400e;
          border: 1px solid rgba(245,158,11,0.3);
        }
        .proj-card__status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: currentColor;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .proj-card__body {
          padding: 18px 20px 20px;
          display: flex; flex-direction: column; gap: 14px;
          flex: 1;
        }
        .proj-card__title {
          font-size: 16px; font-weight: 700;
          color: #1a1714;
          margin: 0; line-height: 1.3;
          font-family: 'Playfair Display', serif;
        }
        .proj-card__meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .proj-card__meta-item {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 9px 10px;
          background: #faf8f5;
          border-radius: 10px;
          border: 1px solid #f0ede8;
        }
        .proj-card__meta-icon {
          width: 16px; height: 16px;
          color: #a08060;
          flex-shrink: 0; margin-top: 1px;
        }
        .proj-card__meta-item > div {
          display: flex; flex-direction: column; gap: 1px;
          min-width: 0;
        }
        .proj-card__meta-label {
          font-size: 10px; font-weight: 600;
          color: #a08060; letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .proj-card__meta-value {
          font-size: 12px; font-weight: 500;
          color: #3d3530;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .proj-card__meta-value--budget {
          color: #1a6b3c; font-weight: 700; font-size: 13px;
        }
        .proj-card__desc {
          font-size: 12.5px; color: #6b6259;
          line-height: 1.6; margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          padding: 10px 12px;
          background: #faf8f5;
          border-radius: 8px;
          border-left: 2px solid #d4c4b0;
        }
        .proj-card__actions {
          display: flex; gap: 8px; margin-top: auto;
        }
        .proj-card__btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 8px;
          font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1px solid transparent;
          transition: all 0.15s;
          font-family: inherit;
        }
        .proj-card__btn--edit {
          background: #1a1714; color: #fff; flex: 1;
          justify-content: center;
        }
        .proj-card__btn--edit:hover { background: #3d3530; }
        .proj-card__btn--delete {
          background: #fff5f5; color: #c0392b;
          border-color: #fecaca;
        }
        .proj-card__btn--delete:hover { background: #fee2e2; }
      `}</style>
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

  /* ── PROJECT MODAL FORM (shared by Add + Edit) ── */
  const ProjectModalForm = ({ title, onSubmit, submitLabel }) => (
    <div className="modal__overlay" onClick={() => { setOpen(false); setEditProjectModal(false); setEditingProjectId(null); }}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">{title}</h2>
        <form className="modal__form" onSubmit={onSubmit}>
          {/* IMAGE UPLOAD */}
          <div className="proj-upload">
            <label htmlFor={title === "Add Project" ? "projectImage" : "editProjectImage"} className="proj-upload__label">
              {projectForm.image ? (
                <img src={projectForm.image} alt="preview" className="proj-upload__preview" />
              ) : (
                <div className="proj-upload__placeholder">
                  <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5"/></svg>
                  <span>Upload Project Image</span>
                </div>
              )}
            </label>
            <input
              id={title === "Add Project" ? "projectImage" : "editProjectImage"}
              type="file" hidden accept="image/*"
              onChange={handleProjectImage}
            />
          </div>

          {/* FIELDS GRID */}
          <div className="modal__grid">
            <div className="modal__field">
              <label className="modal__label">Project Name *</label>
              <input className="modal__input" type="text" name="title" value={projectForm.title} onChange={handleProjectChange} placeholder="e.g. Modern Courtyard Villa" required />
            </div>
            <div className="modal__field">
              <label className="modal__label">Client Name</label>
              <input className="modal__input" type="text" name="client" value={projectForm.client} onChange={handleProjectChange} placeholder="e.g. Sharma Family" />
            </div>
            <div className="modal__field">
              <label className="modal__label">Location</label>
              <input className="modal__input" type="text" name="location" value={projectForm.location} onChange={handleProjectChange} placeholder="e.g. Gurgaon, India" />
            </div>
            <div className="modal__field">
              <label className="modal__label">Budget (₹)</label>
              <input className="modal__input" type="number" name="budget" value={projectForm.budget} onChange={handleProjectChange} placeholder="e.g. 2500000" />
            </div>
            <div className="modal__field">
              <label className="modal__label">Date</label>
              <input className="modal__input" type="date" name="date" value={projectForm.date} onChange={handleProjectChange} />
            </div>
            <div className="modal__field">
              <label className="modal__label">Status</label>
              <select className="modal__input" name="status" value={projectForm.status} onChange={handleProjectChange}>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="modal__field" style={{ marginTop: 4 }}>
            <label className="modal__label">Description</label>
            <textarea className="modal__input modal__textarea" name="description" value={projectForm.description} onChange={handleProjectChange} placeholder="Brief description of the project…" />
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--ghost"
              onClick={() => { setOpen(false); setEditProjectModal(false); setEditingProjectId(null); resetProjectForm(); }}>
              Cancel
            </button>
            <button type="submit" className="modal__btn">{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );

  /* ──────────────── RENDER ──────────────── */
  return (
    <>
      <Toaster position="top-right" richColors toastOptions={{ duration: 3000, style: { fontFamily: "inherit" } }} />
      {overlay.show && <LoadingOverlay message={overlay.message} />}

      <style>{`
        .proj-upload { margin-bottom: 4px; }
        .proj-upload__label { display: block; cursor: pointer; border-radius: 12px; overflow: hidden; border: 2px dashed #e0d9cf; transition: border-color 0.2s; }
        .proj-upload__label:hover { border-color: #a08060; }
        .proj-upload__preview { width: 100%; height: 180px; object-fit: cover; display: block; }
        .proj-upload__placeholder {
          height: 130px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 8px;
          color: #a08060; font-size: 13px; background: #faf8f5;
        }
        .modal--wide { max-width: 560px !important; }
        .modal__grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .modal__field { display: flex; flex-direction: column; gap: 5px; }
        .modal__label { font-size: 11px; font-weight: 600; color: #a08060; text-transform: uppercase; letter-spacing: 0.5px; }
        @media (max-width: 500px) { .modal__grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="profile">
        <div className="profile__container">

          {/* HEADER */}
          <header className="profile__header">
            <h1 className="profile__username">{profileData.name}</h1>
            <button className="profile__menu-btn">☰</button>
          </header>

          {/* PROFILE INFO */}
          <div className="profile__info-main">
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
              <p>{profileData.profession}</p>
            </div>
            <p className="profile__bio">{profileData.bio}</p>
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
                  <span>Personal Details</span><span>{openAccordion === "personal" ? "−" : "+"}</span>
                </button>
                <button className="profile__tab-edit" onClick={() => openCategoryModal("personal")}>Edit</button>
                {openAccordion === "personal" && (
                  <div className="profile__accordion-body">
                    <div className="profile__tab-grid">
                      <div className="profile__item"><span>Full Name</span><h4>{profileData.name}</h4></div>
                      <div className="profile__item"><span>Mobile</span><h4>{profileData.mobile}</h4></div>
                      <div className="profile__item"><span>Email</span><h4>{profileData.email}</h4></div>
                      <div className="profile__item"><span>DOB</span><h4>{profileData.dob}</h4></div>
                      <div className="profile__item"><span>Marital Status</span><h4>{profileData.marital_status}</h4></div>
                    </div>
                  </div>
                )}
              </div>
              {/* PROFESSIONAL */}
              <div className="profile__accordion">
                <button className="profile__accordion-header" onClick={() => toggleAccordion("professional")}>
                  <span>Professional Details</span><span>{openAccordion === "professional" ? "−" : "+"}</span>
                </button>
                <button className="profile__tab-edit" onClick={() => openCategoryModal("professional")}>Edit</button>
                {openAccordion === "professional" && (
                  <div className="profile__accordion-body">
                    <div className="profile__tab-grid">
                      <div className="profile__item"><span>Profession</span><h4>{profileData.profession}</h4></div>
                      <div className="profile__item"><span>Firm Name</span><h4>{profileData.firm_name}</h4></div>
                      <div className="profile__item"><span>Location</span><h4>{profileData.location}</h4></div>
                    </div>
                  </div>
                )}
              </div>
              {/* BANK */}
              <div className="profile__accordion">
                <button className="profile__accordion-header" onClick={() => toggleAccordion("bank")}>
                  <span>Bank Details</span><span>{openAccordion === "bank" ? "−" : "+"}</span>
                </button>
                <button className="profile__tab-edit" onClick={() => openCategoryModal("bank")}>Edit</button>
                {openAccordion === "bank" && (
                  <div className="profile__accordion-body">
                    <div className="profile__tab-grid">
                      <div className="profile__item"><span>Bank Name</span><h4>{profileData.bank_name}</h4></div>
                      <div className="profile__item"><span>Account Holder</span><h4>{profileData.account_holder_name}</h4></div>
                      <div className="profile__item"><span>Account Number</span><h4>{profileData.account_number}</h4></div>
                      <div className="profile__item"><span>IFSC Code</span><h4>{profileData.ifsc_code}</h4></div>
                      <div className="profile__item"><span>UPI ID</span><h4>{profileData.upi_id}</h4></div>
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
              <span style={{ fontSize: 13, color: "#a08060", fontWeight: 500 }}>
                {projects.length} {projects.length === 1 ? "project" : "projects"}
              </span>
            </div>

            {projects.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 20,
                marginTop: 16,
              }}>
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
                {activeCategory === "personal" && (<>
                  <input type="text" name="name" className="modal__input" placeholder="Full Name" value={profileData.name} onChange={handleChange} />
                  <input type="text" name="mobile" className="modal__input" placeholder="Mobile Number" value={profileData.mobile} onChange={handleChange} />
                  <input type="email" name="email" className="modal__input" placeholder="Email" value={profileData.email} onChange={handleChange} />
                  <input type="date" name="dob" className="modal__input" value={profileData.dob} onChange={handleChange} />
                </>)}
                {activeCategory === "professional" && (<>
                  <input type="text" name="profession" className="modal__input" placeholder="Profession" value={profileData.profession} onChange={handleChange} />
                  <input type="text" name="firm_name" className="modal__input" placeholder="Firm Name" value={profileData.firm_name} onChange={handleChange} />
                  <input type="text" name="location" className="modal__input" placeholder="Location" value={profileData.location} onChange={handleChange} />
                </>)}
                {activeCategory === "bank" && (<>
                  <input type="text" name="bank_name" className="modal__input" placeholder="Bank Name" value={profileData.bank_name} onChange={handleChange} />
                  <input type="text" name="account_holder_name" className="modal__input" placeholder="Account Holder Name" value={profileData.account_holder_name} onChange={handleChange} />
                  <input type="text" name="account_number" className="modal__input" placeholder="Account Number" value={profileData.account_number} onChange={handleChange} />
                  <input type="text" name="ifsc_code" className="modal__input" placeholder="IFSC Code" value={profileData.ifsc_code} onChange={handleChange} />
                  <input type="text" name="upi_id" className="modal__input" placeholder="UPI ID" value={profileData.upi_id} onChange={handleChange} />
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
        {open && <ProjectModalForm title="Add Project" onSubmit={handleAddProject} submitLabel="Save Project" />}

        {/* EDIT PROFILE MODAL */}
        {showEditModal && (
          <div className="modal__overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal__title">Edit Profile</h2>
              <div className="modal__form">
                <input type="text" name="name" className="modal__input" placeholder="Full Name" value={profileData.name} onChange={handleChange} />
                <input type="text" name="profession" className="modal__input" placeholder="Profession" value={profileData.profession} onChange={handleChange} />
                <input type="text" name="work" className="modal__input" placeholder="Work / Firm" value={profileData.work} onChange={handleChange} />
                <textarea name="bio" className="modal__input modal__textarea" placeholder="Bio" value={profileData.bio} onChange={handleChange} />
                <input type="text" name="location" className="modal__input" placeholder="Location" value={profileData.location} onChange={handleChange} />
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
        {editProjectModal && <ProjectModalForm title="Edit Project" onSubmit={handleUpdateProject} submitLabel="Update Project" />}
      </section>
    </>
  );
}
