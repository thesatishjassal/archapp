"use client";

import { useState } from "react";

export default function ProjectsPage() {

  const [projects] = useState([
    {
      id: 1,
      title: "Modern Courtyard Villa",
      location: "Gurgaon, India",
      client: "Arora Residency",
      budget: "₹2.4 Cr",
      status: "Completed",
      date: "12 May 2026",
    },

    {
      id: 2,
      title: "Skyline Workspace",
      location: "Bangalore, India",
      client: "TechNova Pvt Ltd",
      budget: "₹5.1 Cr",
      status: "In Progress",
      date: "08 May 2026",
    },

    {
      id: 3,
      title: "Luxury Penthouse Interior",
      location: "Mumbai, India",
      client: "Kapoor Group",
      budget: "₹1.8 Cr",
      status: "Completed",
      date: "02 May 2026",
    },

    {
      id: 4,
      title: "Urban Green Residence",
      location: "Noida, India",
      client: "Sharma Family",
      budget: "₹95 Lakh",
      status: "In Progress",
      date: "28 Apr 2026",
    },

    {
      id: 5,
      title: "Nature Inspired Café",
      location: "Chandigarh, India",
      client: "BrewHouse Café",
      budget: "₹42 Lakh",
      status: "Completed",
      date: "16 Apr 2026",
    },
  ]);

  return (

    <section className="projectsPage">

      <div className="projectsPage__container">

        {/* HEADER */}

        <div className="projectsPage__top">

          <div>

            <h1 className="projectsPage__title">
              My Projects
            </h1>

            <p className="projectsPage__text">
              Manage all architecture and interior projects.
            </p>

          </div>

          <button className="projectsPage__addBtn">
            + Add Project
          </button>

        </div>

        {/* TABLE */}

        <div className="projectsTable">

          <table>

            <thead>

              <tr>

                <th>
                  Project
                </th>

                <th>
                  Location
                </th>

                <th>
                  Client
                </th>

                <th>
                  Budget
                </th>

                <th>
                  Status
                </th>

                <th>
                  Date
                </th>

                <th>
                  Action
                </th>

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

                        <h4>
                          {project.title}
                        </h4>

                        <p>
                          Architecture Project
                        </p>

                      </div>

                    </div>

                  </td>

                  <td>
                    {project.location}
                  </td>

                  <td>
                    {project.client}
                  </td>

                  <td>
                    {project.budget}
                  </td>

                  <td>

                    <span
                      className={`projectsTable__badge ${
                        project.status ===
                        "Completed"
                          ? "completed"
                          : "progress"
                      }`}
                    >

                      {project.status}

                    </span>

                  </td>

                  <td>
                    {project.date}
                  </td>

                  <td>

                    <button className="projectsTable__edit">
                      Edit
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </section>

  );

}
