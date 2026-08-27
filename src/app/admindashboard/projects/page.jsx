"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

const ARCHITECTS_API = "https://api.panvic.in/api/arch-register/";
const PROJECTS_API = "https://api.panvic.in/api/projects/";

/* ─── Financial year helpers (India: Apr 1 – Mar 31) ─── */
function getFinancialYearStart(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = d.getMonth(); // 0 = Jan
  return month >= 3 ? year : year - 1; // Apr(3) onward belongs to that year's FY
}

function formatFY(startYear) {
  if (startYear === null || startYear === undefined) return "—";
  return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [architects, setArchitects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [fromFY, setFromFY] = useState("");
  const [toFY, setToFY] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  // Lock page scroll while the modal is open.
  useEffect(() => {
    document.body.style.overflow = selectedProject ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      setLoading(true);

      // Fetch projects and architects in parallel, each just once.
      const [projectsRes, architectsRes] = await Promise.all([
        fetch(PROJECTS_API),
        fetch(ARCHITECTS_API),
      ]);

      if (!projectsRes.ok) {
        throw new Error("Failed to load projects");
      }

      const projectsData = await projectsRes.json();
      const projectList = Array.isArray(projectsData)
        ? projectsData
        : Array.isArray(projectsData?.data)
        ? projectsData.data
        : [];

      const architectsData = architectsRes.ok
        ? await architectsRes.json()
        : [];
      const architectList = Array.isArray(architectsData)
        ? architectsData
        : Array.isArray(architectsData?.data)
        ? architectsData.data
        : [];

      setArchitects(architectList);

      // Build a lookup so we can attach architect name/company to each
      // project without any per-architect requests.
      const architectById = new Map(
        architectList.map((architect) => [architect.id, architect])
      );

      const enrichedProjects = projectList.map((project) => {
        const architect = architectById.get(project.architect_id) || null;

        return {
          ...project,
          architect_name:
            architect?.full_name || architect?.name || "Unknown",
          architect_company:
            architect?.firm_name || architect?.company || "",
          architect_email: architect?.email || "",
          architect_mobile: architect?.mobile_number || "",
        };
      });

      setProjects(enrichedProjects);
    } catch (error) {
      console.error("Projects loading error:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const statuses = useMemo(() => {
    const values = projects.map((project) => project.status).filter(Boolean);
    return ["All", ...new Set(values)];
  }, [projects]);

  // Financial years present in the data, used to populate the From/To selects.
  const financialYears = useMemo(() => {
    const years = projects
      .map((project) => getFinancialYearStart(project.date))
      .filter((year) => year !== null);
    return Array.from(new Set(years)).sort((a, b) => a - b);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase().trim();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        String(project.title || "").toLowerCase().includes(query) ||
        String(project.location || "").toLowerCase().includes(query) ||
        String(project.client || "").toLowerCase().includes(query) ||
        String(project.architect_name || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  // Same as filteredProjects, further narrowed to the selected FY range —
  // this is what actually gets written into the Excel file.
  const exportProjects = useMemo(() => {
    if (fromFY === "" && toFY === "") return filteredProjects;

    const from = fromFY === "" ? -Infinity : Number(fromFY);
    const to = toFY === "" ? Infinity : Number(toFY);

    return filteredProjects.filter((project) => {
      const fy = getFinancialYearStart(project.date);
      if (fy === null) return false;
      return fy >= from && fy <= to;
    });
  }, [filteredProjects, fromFY, toFY]);

  const handleExportExcel = () => {
    if (!exportProjects.length) {
      window.alert("No projects found for the selected financial year range.");
      return;
    }

    setExporting(true);
    try {
      const workbook = XLSX.utils.book_new();

      // "All Projects" summary sheet
      const allRows = exportProjects.map((project) => ({
        Architect: project.architect_name || "Unknown",
        Firm: project.architect_company || "",
        Project: project.title || "Untitled Project",
        Client: project.client || "",
        Location: project.location || "",
        Date: project.date || "",
        "Financial Year": formatFY(getFinancialYearStart(project.date)),
        "Budget (₹)": project.budget ?? "",
        Status: project.status || "",
      }));
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(allRows),
        "All Projects"
      );

      // One sheet per architect
      const byArchitect = new Map();
      exportProjects.forEach((project) => {
        const key = project.architect_name || "Unknown";
        if (!byArchitect.has(key)) byArchitect.set(key, []);
        byArchitect.get(key).push(project);
      });

      const usedSheetNames = new Set(["All Projects"]);
      byArchitect.forEach((projectsForArchitect, architectName) => {
        const rows = projectsForArchitect.map((project) => ({
          Project: project.title || "Untitled Project",
          Client: project.client || "",
          Location: project.location || "",
          Date: project.date || "",
          "Financial Year": formatFY(getFinancialYearStart(project.date)),
          "Budget (₹)": project.budget ?? "",
          Status: project.status || "",
        }));

        // Excel sheet names: max 31 chars, no \/*?:[]
        let baseName =
          architectName.replace(/[\\/*?:[\]]/g, "").slice(0, 31) || "Architect";
        let sheetName = baseName;
        let suffix = 1;
        while (usedSheetNames.has(sheetName)) {
          suffix += 1;
          sheetName = `${baseName.slice(0, 28)}-${suffix}`;
        }
        usedSheetNames.add(sheetName);

        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.json_to_sheet(rows),
          sheetName
        );
      });

      const fromLabel = fromFY !== "" ? formatFY(Number(fromFY)) : "All";
      const toLabel = toFY !== "" ? formatFY(Number(toFY)) : "All";
      const filename = `Projects_${fromLabel}_to_${toLabel}.xlsx`.replace(
        /\s+/g,
        "_"
      );

      XLSX.writeFile(workbook, filename);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Styles for the new financial-year range picker + export button. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .fy-export-group {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
        }
        .fy-select-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .fy-select-wrap label {
          font-size: 12px;
          font-weight: 600;
          color: #6B7280;
          white-space: nowrap;
        }
        .fy-select {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          background: #F9FAFB;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          padding: 7px 10px;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }
        .fy-select:hover {
          border-color: #D1D5DB;
        }
        .fy-select:focus {
          outline: none;
          border-color: #111827;
        }
        .fy-arrow {
          font-size: 13px;
          color: #9CA3AF;
        }
        .export-excel-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: #0F7B4D;
          border: 1px solid #0F7B4D;
          border-radius: 10px;
          padding: 8px 16px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .export-excel-btn:hover:not(:disabled) {
          background: #0C6740;
        }
        .export-excel-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .export-excel-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        @media (max-width: 900px) {
          .fy-export-group {
            flex-wrap: wrap;
            width: 100%;
          }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">PANVIC</div>

        <nav className="admin-nav">
          <Link href="/admindashboard" className="admin-nav-item">
            <span>▦</span>
            Dashboard
          </Link>

          <Link href="/admindashboard/architects" className="admin-nav-item">
            <span>♙</span>
            Architects
          </Link>

          <Link
            href="/admindashboard/projects"
            className="admin-nav-item active"
          >
            <span>▣</span>
            Projects
          </Link>

          <Link
            href="/admindashboard/sales-persons"
            className="admin-nav-item"
          >
            <span>◉</span>
            Sales Persons
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1>Projects</h1>
            <p>View all projects submitted by architects.</p>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">A</div>
            <div>
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>

        {/* Summary */}
        <section className="project-summary">
          <div className="project-summary-card">
            <span>Total Projects</span>
            <strong>{projects.length}</strong>
          </div>

          <div className="project-summary-card">
            <span>Architects</span>
            <strong>{architects.length}</strong>
          </div>

          <div className="project-summary-card">
            <span>In Progress</span>
            <strong>
              {
                projects.filter(
                  (project) => project.status === "In Progress"
                ).length
              }
            </strong>
          </div>

          <div className="project-summary-card">
            <span>Completed</span>
            <strong>
              {
                projects.filter(
                  (project) => project.status === "Completed"
                ).length
              }
            </strong>
          </div>
        </section>

        {/* Main Table Card */}
        <section className="admin-card projects-card">
          {/* Toolbar */}
          <div className="table-toolbar">
            <div>
              <h2>All Projects</h2>
              <span>{filteredProjects.length} projects</span>
            </div>

            <div className="project-filters">
              <div className="table-search">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Search project, client, architect..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              {/* Financial year range + export */}
              <div className="fy-export-group">
                <div className="fy-select-wrap">
                  <label htmlFor="fy-from">FY</label>
                  <select
                    id="fy-from"
                    className="fy-select"
                    value={fromFY}
                    onChange={(event) => setFromFY(event.target.value)}
                  >
                    <option value="">All</option>
                    {financialYears.map((year) => (
                      <option key={year} value={year}>
                        {formatFY(year)}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="fy-arrow">→</span>

                <div className="fy-select-wrap">
                  <label htmlFor="fy-to">to</label>
                  <select
                    id="fy-to"
                    className="fy-select"
                    value={toFY}
                    onChange={(event) => setToFY(event.target.value)}
                  >
                    <option value="">All</option>
                    {financialYears.map((year) => (
                      <option key={year} value={year}>
                        {formatFY(year)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="export-excel-btn"
                  onClick={handleExportExcel}
                  disabled={exporting}
                >
                  ⬇ {exporting ? "Exporting…" : "Export to Excel"}
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="table-state">
              <div className="loader"></div>
              <p>Loading all projects...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && filteredProjects.length === 0 && (
            <div className="table-state">
              <div className="empty-icon">▣</div>
              <h3>No projects found</h3>
              <p>Try changing your search or filter.</p>
            </div>
          )}

          {/* Table */}
          {!loading && filteredProjects.length > 0 && (
            <div className="table-wrapper">
              <table className="admin-table projects-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Architect</th>
                    <th>Client</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id}>
                      {/* Project */}
                      <td>
                        <div className="project-name-cell">
                          <div className="project-table-icon">▣</div>
                          <div>
                            <strong>
                              {project.title || "Untitled Project"}
                            </strong>
                            <small>ID: {project.id}</small>
                          </div>
                        </div>
                      </td>

                      {/* Architect */}
                      <td>
                        <div className="architect-cell">
                          <strong>{project.architect_name}</strong>
                          {project.architect_company && (
                            <small>{project.architect_company}</small>
                          )}
                        </div>
                      </td>

                      {/* Client */}
                      <td>{project.client || "—"}</td>

                      {/* Location */}
                      <td>{project.location || "—"}</td>

                      {/* Date */}
                      <td>{project.date || "—"}</td>

                      {/* Budget */}
                      <td>
                        {project.budget !== null &&
                        project.budget !== undefined
                          ? `₹ ${Number(project.budget).toLocaleString(
                              "en-IN"
                            )}`
                          : "—"}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            project.status
                          )}`}
                        >
                          {project.status || "Unknown"}
                        </span>
                      </td>

                      {/* Action */}
                      <td>
                        <button
                          type="button"
                          className="view-button"
                          onClick={() => setSelectedProject(project)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* View Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

function ProjectModal({ project, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="project-icon">▣</div>
            <div>
              <h2>{project.title || "Untitled Project"}</h2>
              <p>ID: {project.id}</p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <span className={`status-badge ${getStatusClass(project.status)}`}>
            {project.status || "Unknown"}
          </span>

          <div className="modal-info-grid">
            <div className="info-box">
              <label>Client</label>
              <p>{project.client || "—"}</p>
            </div>

            <div className="info-box">
              <label>Location</label>
              <p>{project.location || "—"}</p>
            </div>

            <div className="info-box">
              <label>Date</label>
              <p>{project.date || "—"}</p>
            </div>

            <div className="info-box">
              <label>Budget</label>
              <p>
                {project.budget !== null && project.budget !== undefined
                  ? `₹ ${Number(project.budget).toLocaleString("en-IN")}`
                  : "—"}
              </p>
            </div>
          </div>

          {project.description && (
            <div className="modal-section">
              <label>Description</label>
              <p className="project-description">{project.description}</p>
            </div>
          )}

          <div className="modal-section">
            <label>Architect</label>
            <div className="related-person">
              <div className="related-person-info">
                <strong>{project.architect_name}</strong>
                <span>
                  {[project.architect_company, project.architect_email]
                    .filter(Boolean)
                    .join(" · ") || "No additional details"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusClass(status) {
  if (!status) return "";

  const value = status.toLowerCase();

  if (value.includes("complete")) {
    return "status-completed";
  }

  if (value.includes("progress")) {
    return "status-progress";
  }

  if (value.includes("pending")) {
    return "status-pending";
  }

  return "";
}
