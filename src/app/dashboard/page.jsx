"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [architectId, setArchitectId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Architect ID and Projects
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem("arch_user"));
        if (!localUser?.email) return;

        // Get Architect ID
        const userRes = await fetch("https://api.panvic.in/api/arch-register/");
        const userData = await userRes.json();

        const currentUser = userData.data?.find(user => user.email === localUser.email);
        if (!currentUser) return;

        const id = currentUser.id;
        setArchitectId(id);

        // Fetch Projects
        const projRes = await fetch(`https://api.panvic.in/api/projects/${id}`);
        const projData = await projRes.json();

        if (projData.success) {
          setProjects(projData.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get Recent Projects (Latest 3)
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="dash">
      {/* TOP BAR */}
      <header className="dash__top">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your architecture studio</p>
        </div>

        <a href="/profile" className="dash__btn">
          + New Project
        </a>
      </header>

      {/* STATS */}
      <section className="dash__stats">
        <div className="dash__card">
          <h2>{projects.length}</h2>
          <p>Total Projects</p>
        </div>

        <div className="dash__card">
          <h2>32</h2>
          <p>Active Clients</p>
        </div>

        <div className="dash__card">
          <h2>₹24L</h2>
          <p>Total Revenue</p>
        </div>

        <div className="dash__card danger">
          <h2>5</h2>
          <p>Pending Payments</p>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="dash__grid">
        {/* RECENT PROJECTS */}
        <div className="dash__box">
          <h3>Recent Projects</h3>

          {loading ? (
            <p>Loading projects...</p>
          ) : recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <div key={project.id} className="dash__item">
                <div>
                  <strong>{project.title}</strong>
                  <p>{project.description || "No description available"}</p>
                </div>
                <span
                  className={`tag ${
                    project.status === "Completed"
                      ? "gray"
                      : project.status === "In Progress"
                      ? "green"
                      : "blue"
                  }`}
                >
                  {project.status}
                </span>
              </div>
            ))
          ) : (
            <p>No projects yet. Create your first project!</p>
          )}
        </div>

        {/* COMMISSIONS / REWARDS */}
        <div className="dash__box">
          <h3>Latest Reward Points</h3>
          {/* You can make this dynamic later when you have commissions API */}
          <div className="dash__item">
            <div>
              <strong>John Doe</strong>
              <p>₹12,00,000 Project</p>
            </div>
            <span className="tag green">Paid</span>
          </div>

          <div className="dash__item">
            <div>
              <strong>Studio X</strong>
              <p>₹8,50,000 Project</p>
            </div>
            <span className="tag yellow">Pending</span>
          </div>

          <div className="dash__item">
            <div>
              <strong>Nexus Group</strong>
              <p>₹25,00,000 Project</p>
            </div>
            <span className="tag blue">Review</span>
          </div>
        </div>
      </section>
    </div>
  );
}