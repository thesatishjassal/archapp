"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  /* ================= MODALS ================= */
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: "", message: "" });
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    profession: "",
    work: "",
    bio: "",
    location: "India",

    profileImage: "",

    email: "",
    mobile: "",
    dob: "",

    firm_name: "",
    marital_status: "",

    bank_name: "",

    account_holder_name: "",
    
    account_number: "",
    
    ifsc_code: "",

    upi_id: "",
  });
  const [activeCategory, setActiveCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  /* ================= PROFILE STATE =================' */
  const [openAccordion, setOpenAccordion] = useState("personal");
  const [architectId, setArchitectId] = useState(null);
  // const [projects, setProjects] = useState([]);
  const toggleAccordion = (section) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };
  
  const fetchProjects = async (id) => {
    // console.log("Fetching projects for architect ID:", id);
    try {
      const res = await fetch(`https://api.panvic.in/api/projects/${id}`);
      
      const result = await res.json();
      console.log("Fetched projects:", result);
      if (result.success) {
        setProjects(
          result.data.map((item) => ({
            id: item.id,
            title: item.title,
            location: item.location,
            description: item.description,
            status: item.status,
            image: item.image_url,
            client: item.client,
            budget: item.budget,
            date: item.date,
          }))
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  //   const currentUser = result.data.find(
    //   (user) => user.email === localUser.email
  // );

  // if (!currentUser) return;

  // setArchitectId(currentUser.id);
  /* ================= FETCH USER ================= */
const openCategoryModal = (category) => {
  setActiveCategory(category);
  setSaveStatus({ type: "", message: "" }); // ← add this
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

        const currentUser = result.data.find(
          (user) => user.email === localUser.email
        );

        // console.log("currentUser:", currentUser.id);
        if (!currentUser) return;

        setArchitectId(currentUser.id);
        
        fetchProjects(currentUser.id);
        
        // setProfileData({
          setProfileData({
          name: currentUser.full_name || "",

          profession: currentUser.profession || "",

          work: currentUser.firm_name || "",

          bio: "Minimal architect focused on elegant and modern living spaces.",

          location: "India",

          profileImage:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",

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
      } catch (err) {
        console.log(err);
      }
    };

    fetchCurrentUser();
  }, [architectId]);

  /* ================= PROJECT FORM ================= */

const [projectForm, setProjectForm] = useState({
  title: "",
  location: "",
  description: "",
  status: "In Progress",
  image: "",
  imageFile: null,
  client: "",
  budget: "",
  date: "",
});

  /* ================= PROFILE INPUT ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= PROFILE IMAGE ================= */

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);

      setProfileData((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));
    }
  };

  /* ================= SAVE PROFILE ================= */

const handleSave = async () => {

  // ── DETAILS MODAL (personal / professional / bank) ──
  if (detailsModal) {
    if (!architectId) return;

    setSaving(true);
    setSaveStatus({ type: "", message: "" });

    const CATEGORY_FIELDS = {
      personal: {
        full_name:      profileData.name,
        mobile_number:  profileData.mobile,
        email:          profileData.email,
        date_of_birth:  profileData.dob,
        marital_status: profileData.marital_status,
      },
      professional: {
        profession: profileData.profession,
        firm_name:  profileData.firm_name,
      },
      bank: {
        bank_name:           profileData.bank_name,
        account_holder_name: profileData.account_holder_name,
        account_number:      profileData.account_number,
        ifsc_code:           profileData.ifsc_code,
        upi_id:              profileData.upi_id,
      },
    };

    const payload = CATEGORY_FIELDS[activeCategory];

    try {
      const res = await fetch(
        `https://api.panvic.in/api/arch-register/${architectId}/update?category=${activeCategory}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        setSaveStatus({
          type: "error",
          message: result.detail || result.message || "Update failed.",
        });
        return;
      }

      const d = result.data;
      setProfileData((prev) => ({
        ...prev,
        name:                d.full_name            ?? prev.name,
        mobile:              d.mobile_number         ?? prev.mobile,
        email:               d.email                 ?? prev.email,
        dob:                 d.date_of_birth         ?? prev.dob,
        marital_status:      d.marital_status        ?? prev.marital_status,
        profession:          d.profession            ?? prev.profession,
        firm_name:           d.firm_name             ?? prev.firm_name,
        work:                d.firm_name             ?? prev.work,
        bank_name:           d.bank_name             ?? prev.bank_name,
        account_holder_name: d.account_holder_name   ?? prev.account_holder_name,
        account_number:      d.account_number        ?? prev.account_number,
        ifsc_code:           d.ifsc_code             ?? prev.ifsc_code,
        upi_id:              d.upi_id                ?? prev.upi_id,
      }));

      setSaveStatus({ type: "success", message: result.message || "Saved successfully." });

      setTimeout(() => {
        setDetailsModal(false);
        setSaveStatus({ type: "", message: "" });
      }, 1000);

    } catch (err) {
      setSaveStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }

    return;
  }

  // ── EDIT PROFILE MODAL (name + profession + firm + bio + location) ──
  if (showEditModal) {
    if (!architectId) return;

    setSaving(true);
    setSaveStatus({ type: "", message: "" });

    try {
      // Calls personal + professional in parallel
      const [personalRes, professionalRes] = await Promise.all([
        fetch(
          `https://api.panvic.in/api/arch-register/${architectId}/update?category=personal`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              full_name: profileData.name,
            }),
          }
        ),
        fetch(
          `https://api.panvic.in/api/arch-register/${architectId}/update?category=professional`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              profession: profileData.profession,
              firm_name:  profileData.work,
            }),
          }
        ),
      ]);

      const [personalResult, professionalResult] = await Promise.all([
        personalRes.json(),
        professionalRes.json(),
      ]);

      // Both must succeed
      if (!personalResult.success || !professionalResult.success) {
        setSaveStatus({
          type: "error",
          message:
            personalResult.detail ||
            professionalResult.detail ||
            "Update failed.",
        });
        return;
      }

      // Sync both responses back
      const p = personalResult.data;
      const pr = professionalResult.data;

      setProfileData((prev) => ({
        ...prev,
        name:       p.full_name   ?? prev.name,
        profession: pr.profession ?? prev.profession,
        firm_name:  pr.firm_name  ?? prev.firm_name,
        work:       pr.firm_name  ?? prev.work,
        // bio and location are local-only (no DB column), keep as-is
      }));

      setSaveStatus({ type: "success", message: "Profile updated successfully." });

      setTimeout(() => {
        setShowEditModal(false);
        setSaveStatus({ type: "", message: "" });
      }, 1000);

    } catch (err) {
      setSaveStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }

    return;
  }
};
  /* ================= PROJECT INPUT ================= */

  const handleProjectChange = (e) => {
    const { name, value } = e.target;

    setProjectForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= PROJECT IMAGE ================= */

const handleProjectImage = (e) => {
  const file = e.target.files[0];

  if (file) {
    setProjectForm((prev) => ({
      ...prev,
      image: URL.createObjectURL(file), // preview
      imageFile: file, // actual file for upload
    }));
  }
};

  /* ================= SAVE PROJECT ================= */

  const handleAddProject = async (e) => {
    e.preventDefault();

    try {
      // const payload = {
      //   title: projectForm.title,
      //   location: projectForm.location,
      //   description: projectForm.description,
      //   status: projectForm.status,
      //   image_url: projectForm.image,
      // };
      const formData = new FormData();
      formData.append("title", projectForm.title);
      formData.append("location", projectForm.location || "");
      formData.append("description", projectForm.description || "");
      formData.append("status", projectForm.status);
      formData.append("client", projectForm.client || "");
      formData.append("budget", projectForm.budget || "");
      formData.append("date", projectForm.date || "");
      if (projectForm.imageFile) {
        formData.append("image", projectForm.imageFile);
      }

      const res = await fetch(
        `https://api.panvic.in/api/projects/${architectId}`,
        {
          method: "POST",
          body: formData,
        }
      );
      // const res = await fetch(
      //   `https://api.panvic.in/api/projects/${architectId}`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(payload),
      //   }
      // );

      const result = await res.json();

      if (result.success) {
        fetchProjects(architectId);
        setOpen(false);

        setProjectForm({
          title: "",
          location: "",
          description: "",
          status: "In Progress",
          image: "",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleEditProject = (project) => {
    setProjectForm({
      title: project.title || "",
      location: project.location || "",
      description: project.description || "",
      status: project.status || "In Progress",
      image: project.image || "",
      imageFile: null,
      client: project.client || "",
      budget: project.budget || "",
      date: project.date || "",
    });
    setEditingProjectId(project.id); // ← Must set this
    setEditProjectModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!architectId || !editingProjectId) return;

    const formData = new FormData();
    formData.append("title", projectForm.title);
    formData.append("location", projectForm.location || "");
    formData.append("description", projectForm.description || "");
    formData.append("status", projectForm.status);
    formData.append("client", projectForm.client || "");
    formData.append("budget", projectForm.budget || "");
    formData.append("date", projectForm.date || "");

    if (projectForm.imageFile) formData.append("image", projectForm.imageFile);

    try {
      const res = await fetch(
        `https://api.panvic.in/api/projects/${architectId}/${editingProjectId}`,
        { method: "PUT", body: formData }
      );

      const result = await res.json();
      if (result.success) {
        fetchProjects(architectId);
        setEditProjectModal(false);
        setEditingProjectId(null);
        resetProjectForm();
        alert("Project updated successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm("Delete this project?");

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `https://api.panvic.in/api/projects/${architectId}/${projectId}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();

      if (result.success) {
        fetchProjects(architectId);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <section className="profile">
      <div className="profile__container">
        {/* ================= HEADER ================= */}

        <header className="profile__header">
          <h1 className="profile__username">{profileData.name}</h1>

          <button className="profile__menu-btn">☰</button>
        </header>

        {/* ================= PROFILE ================= */}

        <div className="profile__info-main">
          {/* AVATAR */}

          <div className="profile__avatar-wrapper">
            <label htmlFor="profileUpload" className="profile__avatar-upload">
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt="Profile"
                  className="profile__avatar-img"
                />
              ) : (
                <div className="profile__avatar-placeholder">Upload Photo</div>
              )}
            </label>

            <input
              id="profileUpload"
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* INFO */}

          <div className="profile__name-role">
            <h2>{profileData.name}</h2>

            <p>{profileData.profession}</p>

            {/* <span className="profile__work">{profileData.work}</span> */}
          </div>

          {/* BIO */}

          <p className="profile__bio">{profileData.bio}</p>

          {/* LOCATION */}

          <div className="profile__location">📍 {profileData.location}</div>

          {/* ACTIONS */}

          <div className="profile__actions">
            <button
              className="profile__edit-btn"
              onClick={() => setShowEditModal(true)}
>
              Edit Profile
            </button>

            <button
              className="profile__share-btn"
              onClick={() => setOpen(true)}
            >
              + Add Project
            </button>
          </div>

          {/* DETAILS */}

          {/* ================= CATEGORY DETAILS ================= */}

          <div className="profile__accordions">
            {/* PERSONAL */}

            <div className="profile__accordion">
              <button
                className="profile__accordion-header"
                onClick={() => toggleAccordion("personal")}
              >
                <span>Personal Details</span>

                <span>{openAccordion === "personal" ? "−" : "+"}</span>
              </button>

              <button
                className="profile__tab-edit"
                onClick={() => openCategoryModal("personal")}
              >
                Edit
              </button>
              {openAccordion === "personal" && (
                <div className="profile__accordion-body">
                  <div className="profile__tab-grid">
                    <div className="profile__item">
                      <span>Full Name</span>
                      <h4>{profileData.name}</h4>
                    </div>

                    <div className="profile__item">
                      <span>Mobile</span>
                      <h4>{profileData.mobile}</h4>
                    </div>

                    <div className="profile__item">
                      <span>Email</span>
                      <h4>{profileData.email}</h4>
                    </div>

                    <div className="profile__item">
                      <span>DOB</span>
                      <h4>{profileData.dob}</h4>
                    </div>

                    <div className="profile__item">
                      <span>Marital Status</span>
                      <h4>{profileData.marital_status}</h4>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PROFESSIONAL */}

            <div className="profile__accordion">
              <button
                className="profile__accordion-header"
                onClick={() => toggleAccordion("professional")}
              >
                <span>Professional Details</span>

                <span>{openAccordion === "professional" ? "−" : "+"}</span>
              </button>
              <button
                className="profile__tab-edit"
                onClick={() => openCategoryModal("professional")}
              >
                Edit
              </button>

              {openAccordion === "professional" && (
                <div className="profile__accordion-body">
                  <div className="profile__tab-grid">
                    <div className="profile__item">
                      <span>Profession</span>
                      <h4>{profileData.profession}</h4>
                    </div>

                    <div className="profile__item">
                      <span>Firm Name</span>
                      <h4>{profileData.firm_name}</h4>
                    </div>

                    {/* <div className="profile__item">
                      <span>Work</span>
                      <h4>{profileData.work}</h4>
                    </div> */}

                    <div className="profile__item">
                      <span>Location</span>
                      <h4>{profileData.location}</h4>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BANK */}

            <div className="profile__accordion">
              <button
                className="profile__accordion-header"
                onClick={() => toggleAccordion("bank")}
              >
                <span>Bank Details</span>

                <span>{openAccordion === "bank" ? "−" : "+"}</span>
              </button>

              <button
                className="profile__tab-edit"
                onClick={() => openCategoryModal("bank")}
              >
                Edit
              </button>
              {openAccordion === "bank" && (
                <div className="profile__accordion-body">
                  <div className="profile__tab-grid">
                    <div className="profile__item">
                      <span>Bank Name</span>
                      <h4>{profileData.bank_name}</h4>
                    </div>

                    <div className="profile__item">
                      <span>Account Holder</span>
                      <h4>{profileData.account_holder_name}</h4>
                    </div>

                    <div className="profile__item">
                      <span>Account Number</span>
                      <h4>{profileData.account_number}</h4>
                    </div>

                    <div className="profile__item">
                      <span>IFSC Code</span>
                      <h4>{profileData.ifsc_code}</h4>
                    </div>

                    <div className="profile__item">
                      <span>UPI ID</span>
                      <h4>{profileData.upi_id}</h4>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= PROJECTS ================= */}

        <div className="profile__section">
          <div className="profile__section-header">
            <h3>Projects</h3>
          </div>

          <div className="profile__section">
            {projects.length > 0 ? (
              <div className="profile__projects-grid">
                {projects.map((project) => (
                  <div key={project.id} className="profile__project-card">
                    <div className="profile__project-image">
<img
  src={`https://api.panvic.in/${project.image}`}
  alt={project.title}
  className="profile__project-img"
/>

                      <div
                        className={`profile__badge ${
                          project.status === "Completed"
                            ? "completed"
                            : "in-progress"
                        }`}
                      >
                        {project.status}
                      </div>
                    </div>

                    <div className="profile__project-info">
                      <h4>{project.title}</h4>
                      <p>{project.location}</p>
                      <div className="profile__project-desc">
                        {project.description}
                      </div>{" "}
                      <div className="profile__project-actions">
                        <div className="profile__project-actions">
                          <button
                            className="profile__project-edit"
                            onClick={() => handleEditProject(project)}
                          >
                            Edit
                          </button>

                          <button
                            className="profile__project-edit"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
      </div>

      {/* ================= ADD PROJECT MODAL ================= */}
      {/* ================= CATEGORY DETAILS MODAL ================= */}

      {detailsModal && (
        <div className="modal__overlay" onClick={() => setDetailsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">
              {activeCategory === "personal"
                ? "Edit Personal Details"
                : activeCategory === "professional"
                ? "Edit Professional Details"
                : "Edit Bank Details"}
            </h2>

            <div className="modal__form">
              {/* PERSONAL */}

              {activeCategory === "personal" && (
                <>
                  <input
                    type="text"
                    name="name"
                    className="modal__input"
                    placeholder="Full Name"
                    value={profileData.name}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="mobile"
                    className="modal__input"
                    placeholder="Mobile Number"
                    value={profileData.mobile}
                    onChange={handleChange}
                  />

                  <input
                    type="email"
                    name="email"
                    className="modal__input"
                    placeholder="Email"
                    value={profileData.email}
                    onChange={handleChange}
                  />

                  <input
                    type="date"
                    name="dob"
                    className="modal__input"
                    value={profileData.dob}
                    onChange={handleChange}
                  />
                </>
              )}

              {/* PROFESSIONAL */}

              {activeCategory === "professional" && (
                <>
                  <input
                    type="text"
                    name="profession"
                    className="modal__input"
                    placeholder="Profession"
                    value={profileData.profession}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="firm_name"
                    className="modal__input"
                    placeholder="Firm Name"
                    value={profileData.firm_name}
                    onChange={handleChange}
                  />

                  {/* <input
                    type="text"
                    name="work"
                    className="modal__input"
                    placeholder="Work"
                    value={profileData.work}
                    onChange={handleChange}
                  /> */}

                  <input
                    type="text"
                    name="location"
                    className="modal__input"
                    placeholder="Location"
                    value={profileData.location}
                    onChange={handleChange}
                  />
                </>
              )}

              {/* BANK */}

              {activeCategory === "bank" && (
                <>
                  {/* BANK NAME */}

                  <input
                    type="text"
                    name="bank_name"
                    className="modal__input"
                    placeholder="Bank Name"
                    value={profileData.bank_name}
                    onChange={handleChange}
                  />

                  {/* ACCOUNT HOLDER */}

                  <input
                    type="text"
                    name="account_holder_name"
                    className="modal__input"
                    placeholder="Account Holder Name"
                    value={profileData.account_holder_name}
                    onChange={handleChange}
                  />

                  {/* ACCOUNT NUMBER */}

                  <input
                    type="text"
                    name="account_number"
                    className="modal__input"
                    placeholder="Account Number"
                    value={profileData.account_number}
                    onChange={handleChange}
                  />

                  {/* IFSC */}

                  <input
                    type="text"
                    name="ifsc_code"
                    className="modal__input"
                    placeholder="IFSC Code"
                    value={profileData.ifsc_code}
                    onChange={handleChange}
                  />

                  {/* UPI */}

                  <input
                    type="text"
                    name="upi_id"
                    className="modal__input"
                    placeholder="UPI ID"
                    value={profileData.upi_id}
                    onChange={handleChange}
                  />
                </>
              )}
<div className="modal__actions">

  {/* Status message */}
  {saveStatus.message && (
    <p
      style={{
        fontSize: "13px",
        color: saveStatus.type === "success" ? "green" : "red",
        flex: 1,
        margin: 0,
      }}
    >
      {saveStatus.type === "success" ? "✓ " : "✕ "}
      {saveStatus.message}
    </p>
  )}

  <button
    type="button"
    className="modal__btn modal__btn--ghost"
    onClick={() => {
      setDetailsModal(false);
      setSaveStatus({ type: "", message: "" });
    }}
    disabled={saving}
  >
    Cancel
  </button>

  <button
    type="button"
    className="modal__btn"
    onClick={handleSave}
    disabled={saving}
  >
    {saving ? "Saving…" : "Save Changes"}
  </button>

</div>
            </div>
          </div>
        </div>
      )}
      {/* ================= ADD PROJECT MODAL ================= */}
      {open && (
        <div className="modal__overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Add Project</h2>

            <form className="modal__form" onSubmit={handleAddProject}>
              <div className="projectUpload">
                <label htmlFor="projectImage" className="projectUpload__label">
                  {projectForm.image ? (
                    <img
                      src={projectForm.image}
                      alt="Project"
                      className="projectUpload__preview"
                    />
                  ) : (
                    <div className="projectUpload__placeholder">
                      Upload Image
                    </div>
                  )}
                </label>

                <input
                  id="projectImage"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProjectImage}
                />
              </div>
                  <div className="grid">
              <div className="input">
                {" "}
                <input
                  className="modal__input"
                  type="text"
                  name="title"
                  value={projectForm.title}
                  onChange={handleProjectChange}
                  placeholder="Project Name"
                  required
                />
              </div>

              <div className="input">
                {" "}
                <input
                  className="modal__input"
                  type="text"
                  name="client"
                  value={projectForm.client}
                  onChange={handleProjectChange}
                  placeholder="Client Name"
                />
              </div>

              <div className="input">
                {" "}
                <input
                  className="modal__input"
                  type="text"
                  name="location"
                  value={projectForm.location}
                  onChange={handleProjectChange}
                  placeholder="Location"
                />
              </div>

              <div className="input">
                {" "}
                <input
                  className="modal__input"
                  type="number"
                  name="budget"
                  value={projectForm.budget}
                  onChange={handleProjectChange}
                  placeholder="Budget (₹)"
                />
              </div>
              <div className="input">
                {" "}
                <input
                  className="modal__input"
                  type="date"
                  name="date"
                  value={projectForm.date}
                  onChange={handleProjectChange}
                />
              </div>

 

              <div className="input">
                {" "}
                <select
                  className="modal__input"
                  name="status"
                  value={projectForm.status}
                  onChange={handleProjectChange}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div></div>             <div className="input">
                {" "}
                <textarea
                  className="modal__input modal__textarea"
                  name="description"
                  value={projectForm.description}
                  onChange={handleProjectChange}
                  placeholder="Description"
                />
              </div>

              <div className="modal__actions">
                <button
                  type="button"
                  className="modal__btn modal__btn--ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="modal__btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= EDIT PROFILE MODAL ================= */}

{showEditModal && (
  <div className="modal__overlay" onClick={() => setShowEditModal(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <h2 className="modal__title">Edit Profile</h2>

      <div className="modal__form">
        <input
          type="text"
          name="name"
          className="modal__input"
          placeholder="Full Name"
          value={profileData.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="profession"
          className="modal__input"
          placeholder="Profession"
          value={profileData.profession}
          onChange={handleChange}
        />

        <input
          type="text"
          name="work"
          className="modal__input"
          placeholder="Work / Firm"
          value={profileData.work}
          onChange={handleChange}
        />

        <textarea
          name="bio"
          className="modal__input modal__textarea"
          placeholder="Bio"
          value={profileData.bio}
          onChange={handleChange}
        />

        <input
          type="text"
          name="location"
          className="modal__input"
          placeholder="Location"
          value={profileData.location}
          onChange={handleChange}
        />

        {/* ── STATUS MESSAGE ── */}
        {saveStatus.message && (
          <p
            style={{
              fontSize: "13px",
              color: saveStatus.type === "success" ? "green" : "red",
              margin: "4px 0 0",
            }}
          >
            {saveStatus.type === "success" ? "✓ " : "✕ "}
            {saveStatus.message}
          </p>
        )}

        <div className="modal__actions">
          <button
            type="button"
            className="modal__btn modal__btn--ghost"
            onClick={() => {
              setShowEditModal(false);
              setSaveStatus({ type: "", message: "" });
            }}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="modal__btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {/* ================= EDIT PROJECT MODAL ================= */}
      {/* ================= EDIT PROJECT MODAL ================= */}
      {/* ================= EDIT PROJECT MODAL ================= */}
      {editProjectModal && (
        <div
          className="modal__overlay"
          onClick={() => {
            setEditProjectModal(false);
            setEditingProjectId(null);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Edit Project</h2>

            <form className="modal__form" onSubmit={handleUpdateProject}>
              <div className="projectUpload">
                <label
                  htmlFor="editProjectImage"
                  className="projectUpload__label"
                >
                  {projectForm.image ? (
                    <img
                      src={projectForm.image}
                      alt="Project"
                      className="projectUpload__preview"
                    />
                  ) : (
                    <div className="projectUpload__placeholder">
                      Upload Image
                    </div>
                  )}
                </label>
                <input
                  id="editProjectImage"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProjectImage}
                />
              </div>

              <input
                className="modal__input"
                type="text"
                name="title"
                value={projectForm.title}
                onChange={handleProjectChange}
                placeholder="Project Name"
                required
              />

              <input
                className="modal__input"
                type="text"
                name="client"
                value={projectForm.client}
                onChange={handleProjectChange}
                placeholder="Client Name"
              />

              <input
                className="modal__input"
                type="text"
                name="location"
                value={projectForm.location}
                onChange={handleProjectChange}
                placeholder="Location"
              />

              <input
                className="modal__input"
                type="number"
                name="budget"
                value={projectForm.budget}
                onChange={handleProjectChange}
                placeholder="Budget (₹)"
              />

              <input
                className="modal__input"
                type="date"
                name="date"
                value={projectForm.date}
                onChange={handleProjectChange}
              />

              <textarea
                className="modal__input modal__textarea"
                name="description"
                value={projectForm.description}
                onChange={handleProjectChange}
                placeholder="Description"
              />

              <select
                className="modal__input"
                name="status"
                value={projectForm.status}
                onChange={handleProjectChange}
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <div className="modal__actions">
                <button
                  type="button"
                  className="modal__btn modal__btn--ghost"
                  onClick={() => {
                    setEditProjectModal(false);
                    setEditingProjectId(null);
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="modal__btn">
                  Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
