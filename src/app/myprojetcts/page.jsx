"use client";

import { useState, useEffect } from "react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [architectId, setArchitectId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);

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

  /* ─── FETCH PROJECTS ─── */
  const fetchProjects = async (id) => {
    try {
      const res = await fetch(`https://api.panvic.in/api/projects/${id}`);
      const result = await res.json();
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
      console.error(err);
    }
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
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
    if (file) {
      setProjectForm((prev) => ({
        ...prev,
        image: URL.createObjectURL(file),
        imageFile: file,
      }));
    }
  };

  const resetProjectForm = () =>
    setProjectForm({
      title: "", location: "", description: "",
      status: "In Progress", image: "", imageFile: null,
      client: "", budget: "", date: "",
    });

  /* ─── ADD PROJECT ─── */
  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", projectForm.title);
      formData.append("location", projectForm.location || "");
      formData.append("description", projectForm.description || "");
      formData.append("status", projectForm.status);
      formData.append("client", projectForm.client || "");
      formData.append("budget", projectForm.budget || "");
      formData.append("date", projectForm.date || "");
      if (projectForm.imageFile) formData.append("image", projectForm.imageFile);

      const res = await fetch(
        `https://api.panvic.in/api/projects/${architectId}`,
        { method: "POST", body: formData }
      );
      const result = await res.json();
      if (result.success) {
        await fetchProjects(architectId);
        setOpen(false);
        resetProjectForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ─── EDIT PROJECT ─── */
  const handleEditProject = (project) => {
    setProjectForm({
      title: project.title || "",
      location: project.location || "",
      description: project.description || "",
      status: project.status || "In Progress",
      image: project.image ? `https://api.panvic.in/${project.image}` : "",
      imageFile: null,
      client: project.client || "",
      budget: project.budget || "",
      date: project.date || "",
    });
    setEditingProjectId(project.id);
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
        await fetchProjects(architectId);
        setEditProjectModal(false);
        setEditingProjectId(null);
        resetProjectForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ─── DELETE PROJECT ─── */
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      const res = await fetch(
        `https://api.panvic.in/api/projects/${architectId}/${projectId}`,
        { method: "DELETE" }
      );
      const result = await res.json();
      if (result.success) await fetchProjects(architectId);
    } catch (err) {
      console.error(err);
    }
  };

  /* ─── RENDER ─── */
  return (
    <section className="projectsPage">
      <div className="projectsPage__container">

        {/* HEADER */}
        <div className="projectsPage__top">
          <div>
            <h1 className="projectsPage__title">My Projects</h1>
            <p className="projectsPage__text">
              Manage all architecture and interior projects.
            </p>
          </div>
          <button className="projectsPage__addBtn" onClick={() => setOpen(true)}>
            + Add Project
          </button>
        </div>

        {/* TABLE */}
        {loading ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
            Loading projects…
          </p>
        ) : projects.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#888" }}>
            <h4>No Projects Yet</h4>
            <p>Start by adding your first architecture project.</p>
          </div>
        ) : (
          <div className="projectsTable">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Location</th>
                  <th>Client</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <div className="projectsTable__project">
                        <div className="projectsTable__icon">
                          {project.title.charAt(0)}
                        </div>
                        <div>
                          <h4>{project.title}</h4>
                          <p>Architecture Project</p>
                        </div>
                      </div>
                    </td>
                    <td>{project.location || "—"}</td>
                    <td>{project.client || "—"}</td>
                    <td>{project.budget ? `₹${project.budget}` : "—"}</td>
                    <td>
                      <span
                        className={`projectsTable__badge ${
                          project.status === "Completed"
                            ? "completed"
                            : "progress"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td>{project.date || "—"}</td>
                    <td style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="projectsTable__edit"
                        onClick={() => handleEditProject(project)}
                      >
                        Edit
                      </button>
                      <button
                        className="projectsTable__edit"
                        style={{ color: "red" }}
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── ADD PROJECT MODAL ─── */}
      {open && (
        <div className="modal__overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Add Project</h2>
            <form className="modal__form" onSubmit={handleAddProject}>
              <div className="projectUpload">
                <label htmlFor="projectImage" className="projectUpload__label">
                  {projectForm.image ? (
                    <img src={projectForm.image} alt="Project" className="projectUpload__preview" />
                  ) : (
                    <div className="projectUpload__placeholder">Upload Image</div>
                  )}
                </label>
                <input id="projectImage" type="file" hidden accept="image/*" onChange={handleProjectImage} />
              </div>

              <div className="grid">
                <input className="modal__input" type="text" name="title" value={projectForm.title} onChange={handleProjectChange} placeholder="Project Name" required />
                <input className="modal__input" type="text" name="client" value={projectForm.client} onChange={handleProjectChange} placeholder="Client Name" />
                <input className="modal__input" type="text" name="location" value={projectForm.location} onChange={handleProjectChange} placeholder="Location" />
                <input className="modal__input" type="number" name="budget" value={projectForm.budget} onChange={handleProjectChange} placeholder="Budget (₹)" />
                <input className="modal__input" type="date" name="date" value={projectForm.date} onChange={handleProjectChange} />
                <select className="modal__input" name="status" value={projectForm.status} onChange={handleProjectChange}>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <textarea className="modal__input modal__textarea" name="description" value={projectForm.description} onChange={handleProjectChange} placeholder="Description" />

              <div className="modal__actions">
                <button type="button" className="modal__btn modal__btn--ghost" onClick={() => { setOpen(false); resetProjectForm(); }}>Cancel</button>
                <button type="submit" className="modal__btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT PROJECT MODAL ─── */}
      {editProjectModal && (
        <div className="modal__overlay" onClick={() => { setEditProjectModal(false); setEditingProjectId(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Edit Project</h2>
            <form className="modal__form" onSubmit={handleUpdateProject}>
              <div className="projectUpload">
                <label htmlFor="editProjectImage" className="projectUpload__label">
                  {projectForm.image ? (
                    <img src={projectForm.image} alt="Project" className="projectUpload__preview" />
                  ) : (
                    <div className="projectUpload__placeholder">Upload Image</div>
                  )}
                </label>
                <input id="editProjectImage" type="file" hidden accept="image/*" onChange={handleProjectImage} />
              </div>

              <input className="modal__input" type="text" name="title" value={projectForm.title} onChange={handleProjectChange} placeholder="Project Name" required />
              <input className="modal__input" type="text" name="client" value={projectForm.client} onChange={handleProjectChange} placeholder="Client Name" />
              <input className="modal__input" type="text" name="location" value={projectForm.location} onChange={handleProjectChange} placeholder="Location" />
              <input className="modal__input" type="number" name="budget" value={projectForm.budget} onChange={handleProjectChange} placeholder="Budget (₹)" />
              <input className="modal__input" type="date" name="date" value={projectForm.date} onChange={handleProjectChange} />
              <textarea className="modal__input modal__textarea" name="description" value={projectForm.description} onChange={handleProjectChange} placeholder="Description" />
              <select className="modal__input" name="status" value={projectForm.status} onChange={handleProjectChange}>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <div className="modal__actions">
                <button type="button" className="modal__btn modal__btn--ghost" onClick={() => { setEditProjectModal(false); setEditingProjectId(null); resetProjectForm(); }}>Cancel</button>
                <button type="submit" className="modal__btn">Update Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
