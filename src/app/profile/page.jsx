"use client"
import { useState } from 'react';

export default function ProfilePage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [open, setOpen] = useState(false);

  const projects = [
    {
      id: 1,
      title: "Urban Villa Concept",
      status: "In Progress",
      deadline: "Aug 24",
      desc: "Luxury villa architecture focused on minimalism and natural lighting.",
      location: "Hamptons, NY"
    },
    {
      id: 2,
      title: "Skyline Office Tower",
      status: "Completed",
      deadline: "Delivered",
      desc: "Sustainable commercial architecture for modern workspaces.",
      location: "Manhattan, NY"
    },
        {
      id: 3,
      title: "Urban Villa Concept",
      status: "In Progress",
      deadline: "Aug 24",
      desc: "Luxury villa architecture focused on minimalism and natural lighting.",
      location: "Hamptons, NY"
    },
    {
      id: 4,
      title: "Skyline Office Tower",
      status: "Completed",
      deadline: "Delivered",
      desc: "Sustainable commercial architecture for modern workspaces.",
      location: "Manhattan, NY"
    }
  ];

  const openProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  return (
    <section className="profile">

      <div className="profile__container">

        {/* HEADER */}
        <header className="profile__header">
          <h1 className="profile__username">Alex Carter</h1>
          <button className="profile__menu-btn">☰</button>
        </header>

        {/* PROFILE INFO */}
        <div className="profile__info-main">
          <div className="profile__avatar-main">AC</div>

          <div className="profile__stats-row">
            <div className="profile__stat"><strong>128</strong><span>Projects</span></div>
            <div className="profile__stat"><strong>48</strong><span>Clients</span></div>
            <div className="profile__stat"><strong>22</strong><span>Reviews</span></div>
          </div>

          <div className="profile__name-role">
            <h2>Alex Carter</h2>
            <p>Senior Architect & Interior Designer</p>
          </div>

          <p className="profile__bio">
            Passionate architect focused on minimalist design, natural lighting, and sustainable spaces.
          </p>

          <div className="profile__location">📍 New York, USA</div>

          <div className="profile__actions">
            <button className="profile__edit-btn" onClick={() => setShowEditModal(true)}>
              Edit Profile
            </button>
             <button className="profile__share-btn" onClick={() => setOpen(true)}>
        + Add Project
      </button>
          </div>
        </div>

        {/* RECENT PROJECTS */}
        <div className="profile__section">
          <div className="profile__section-header mb-4">
            <h3>Recent Projects</h3>
            {/* <a href="#" className="profile__view-all">View All</a> */}
          </div>

          <div className="profile__projects-grid">
            {projects.map(project => (
              <div 
                key={project.id} 
                className="profile__project-card"
                onClick={() => openProject(project)}
              >
                <div className="profile__project-image">
                  <div className={`profile__badge ${project.status === "Completed" ? "completed" : "in-progress"}`}>
                    {project.status}
                  </div>
                </div>
                <div className="profile__project-info">
                  <h4>{project.title}</h4>
                  <span>{project.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
{open && (
        <div className="modal__overlay" onClick={() => setOpen(false)}>

          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <h2 className="modal__title">Add New Project</h2>

            <form className="modal__form">

              <input className="modal__input" placeholder="Project Name" />
              <input className="modal__input" placeholder="Location" />

              <textarea
                className="modal__input modal__textarea"
                placeholder="Project Description"
              />

              <select className="modal__input">
                <option>In Progress</option>
                <option>Completed</option>
              </select>

              <div className="modal__actions">

                <button
                  type="button"
                  className="modal__btn modal__btn--ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="modal__btn">
                  Save Project
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ==================== EDIT PROFILE MODAL ==================== */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Edit Profile</h3>
            
            <div className="modal-form">
              <label>Name</label>
              <input type="text" defaultValue="Alex Carter" />

              <label>Role</label>
              <input type="text" defaultValue="Senior Architect & Interior Designer" />

              <label>Bio</label>
              <textarea defaultValue="Passionate architect focused on minimalist design, natural lighting, and sustainable spaces." />

              <label>Location</label>
              <input type="text" defaultValue="New York, USA" />

              <div className="modal-buttons">
                <button className="modal-cancel" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button className="modal-save">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PROJECT DETAIL MODAL ==================== */}
      {showProjectModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="modal-content project-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-image">
              <div className={`profile__badge ${selectedProject.status === "Completed" ? "completed" : "in-progress"}`}>
                {selectedProject.status}
              </div>
            </div>

            <div className="modal-body">
              <h2>{selectedProject.title}</h2>
              <p className="modal-location">{selectedProject.location}</p>
              <p className="modal-desc">{selectedProject.desc}</p>

              <div className="modal-info">
                <div><strong>Deadline:</strong> {selectedProject.deadline}</div>
              </div>

              <div className="modal-buttons">
                <button className="modal-cancel" onClick={() => setShowProjectModal(false)}>
                  Close
                </button>
                <button className="modal-save">Open Project</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}