"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const PROJECT_API = "https://api.panvic.in/api/projects";

export default function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [architect, setArchitect] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const [projectResponse, architectResponse] = await Promise.all([
        fetch(`${PROJECT_API}/${id}`),
        fetch("https://api.panvic.in/api/arch-register/"),
      ]);

      const projectData = await projectResponse.json();
      const architectsData = await architectResponse.json();

      const currentProject = Array.isArray(projectData)
        ? projectData.find(
            (item) => String(item.id) === String(id)
          )
        : projectData;

      setProject(currentProject || null);

      if (currentProject?.architect_id) {
        const currentArchitect = architectsData.find(
          (item) =>
            String(item.id) ===
            String(currentProject.architect_id)
        );

        setArchitect(currentArchitect || null);
      }
    } catch (error) {
      console.error("Project error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="admin-main">
        <div className="page-loader">
          Loading project...
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="admin-main">
        <div className="table-state">
          <div className="empty-icon">▣</div>
          <h3>Project not found</h3>
          <p>This project could not be loaded.</p>

          <Link
            href="/admin/architects"
            className="view-button"
          >
            Back to Architects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-main">

      {/* Header */}

      <div className="page-top">
        <Link
          href={
            project.architect_id
              ? `/admin/architects/${project.architect_id}`
              : "/admin/architects"
          }
          className="back-btn"
        >
          ← Back
        </Link>

        <div>
          <h1>Project Details</h1>
          <p>
            View complete project information.
          </p>
        </div>
      </div>

      {/* Project Header */}

      <section className="project-profile-card">

        <div className="project-main-info">

          <div className="project-icon">
            ▣
          </div>

          <div>
            <h2>
              {project.title || "Untitled Project"}
            </h2>

            <p>
              {project.location || "Location not available"}
            </p>
          </div>

        </div>

        <span className="status-badge">
          {project.status || "Active"}
        </span>

      </section>

      {/* Project Information */}

      <section className="admin-card project-section">

        <div className="card-header">
          <div>
            <h2>Project Information</h2>
            <p>Basic project details</p>
          </div>
        </div>

        <div className="project-info-grid">

          <div className="info-box">
            <label>Project Name</label>
            <p>{project.title || "—"}</p>
          </div>

          <div className="info-box">
            <label>Location</label>
            <p>{project.location || "—"}</p>
          </div>

          <div className="info-box">
            <label>Client</label>
            <p>{project.client || "—"}</p>
          </div>

          <div className="info-box">
            <label>Budget</label>
            <p>
              {project.budget
                ? `₹ ${project.budget}`
                : "—"}
            </p>
          </div>

          <div className="info-box">
            <label>Date</label>
            <p>{project.date || "—"}</p>
          </div>

          <div className="info-box">
            <label>Status</label>
            <p>{project.status || "—"}</p>
          </div>

        </div>

      </section>

      {/* Description */}

      <section className="admin-card project-section">

        <div className="card-header">
          <div>
            <h2>Description</h2>
          </div>
        </div>

        <div className="project-description">
          {project.description || "No description available."}
        </div>

      </section>

      {/* Architect */}

      <section className="admin-card project-section">

        <div className="card-header">
          <div>
            <h2>Architect</h2>
            <p>Architect responsible for this project</p>
          </div>
        </div>

        {architect ? (
          <div className="related-person">

            <div className="person-avatar">
              {architect?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="related-person-info">
              <strong>
                {architect.name || "—"}
              </strong>

              <span>
                {architect.firm_name ||
                  architect.company ||
                  "—"}
              </span>
            </div>

            <Link
              href={`/admin/architects/${architect.id}`}
              className="view-button"
            >
              View Architect
            </Link>

          </div>
        ) : (
          <div className="project-empty">
            Architect information unavailable.
          </div>
        )}

      </section>

      {/* Sales Person */}

      <section className="admin-card project-section">

        <div className="card-header">
          <div>
            <h2>Sales Person</h2>
            <p>Sales person connected to this project</p>
          </div>
        </div>

        <div className="project-empty">
          Sales person information will be connected here
          once the project API provides the sales person ID.
        </div>

      </section>

    </main>
  );
}