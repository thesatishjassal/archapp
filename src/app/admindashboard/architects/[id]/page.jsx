"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ArchitectDetails() {
  const { id } = useParams();

  const [architect, setArchitect] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [architectRes, projectRes] = await Promise.all([
        fetch("https://api.panvic.in/api/arch-register/"),
        fetch(`https://api.panvic.in/api/projects/${id}`),
      ]);

      const architects = await architectRes.json();
      const projectData = await projectRes.json();

      const selected = architects.find((item) => String(item.id) === String(id));

      setArchitect(selected);
      setProjects(Array.isArray(projectData) ? projectData : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loader">Loading...</div>;
  }

  return (
    <div className="admin-main">

      <div className="page-top">
        <Link href="/admin/architects" className="back-btn">
          ← Back
        </Link>

        <h1>Architect Details</h1>
      </div>

      {/* Architect Card */}

      <div className="profile-card">

        <div className="profile-avatar">
          {architect?.name?.charAt(0)}
        </div>

        <div className="profile-info">
          <h2>{architect?.name}</h2>

          <p>{architect?.firm_name || architect?.company}</p>

          <span>{architect?.profession}</span>
        </div>

      </div>

      {/* Information */}

      <div className="info-grid">

        <div className="info-box">
          <label>Phone</label>

          <p>{architect?.phone}</p>
        </div>

        <div className="info-box">
          <label>Email</label>

          <p>{architect?.email}</p>
        </div>

        <div className="info-box">
          <label>City</label>

          <p>{architect?.city}</p>
        </div>

        <div className="info-box">
          <label>Status</label>

          <p>{architect?.status}</p>
        </div>

      </div>

      {/* Project Stats */}

      <div className="mini-stats">

        <div className="mini-card">
          <span>Total Projects</span>

          <h2>{projects.length}</h2>
        </div>

        <div className="mini-card">
          <span>Completed</span>

          <h2>
            {projects.filter((p) => p.status === "Completed").length}
          </h2>
        </div>

        <div className="mini-card">
          <span>In Progress</span>

          <h2>
            {projects.filter((p) => p.status === "In Progress").length}
          </h2>
        </div>

      </div>

      {/* Projects */}

      <div className="admin-card">

        <div className="card-header">
          <h2>Projects</h2>
        </div>

        <table className="admin-table">

          <thead>
            <tr>
              <th>Project</th>
              <th>Location</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Sales Person</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            {projects.map((project) => (
              <tr key={project.id}>

                <td>{project.title}</td>

                <td>{project.location}</td>

                <td>₹ {project.budget}</td>

                <td>
                  <span className="status-badge">
                    {project.status}
                  </span>
                </td>

                <td>{project.sales_person_name || "--"}</td>

                <td>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="view-button"
                  >
                    View
                  </Link>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}