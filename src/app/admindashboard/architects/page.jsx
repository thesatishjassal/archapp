"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "https://api.panvic.in/api/arch-register/";

export default function ArchitectsPage() {
  const [architects, setArchitects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArchitects();
  }, []); // run once on mount only

  const fetchArchitects = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Request failed: ${response.status} ${response.statusText} ${text}`
        );
      }

      const data = await response.json();
      console.log("RAW API RESPONSE:", data); // check this in devtools console

      // Handle every common response shape
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.results)) {
        list = data.results;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.architects)) {
        list = data.architects;
      } else if (Array.isArray(data?.records)) {
        list = data.records;
      } else {
        console.warn(
          "Unrecognized API response shape — got:",
          data,
          "Update the extraction logic in fetchArchitects to match this shape."
        );
      }

      setArchitects(list);
    } catch (err) {
      console.error("Architect API Error:", err);
      setError(err.message || "Failed to fetch architects");
      setArchitects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredArchitects = architects.filter((architect) => {
    const value = search.toLowerCase();

    return (
      String(architect?.name || "")
        .toLowerCase()
        .includes(value) ||
      String(architect?.email || "")
        .toLowerCase()
        .includes(value) ||
      String(architect?.company || "")
        .toLowerCase()
        .includes(value) ||
      String(architect?.firm_name || "")
        .toLowerCase()
        .includes(value)
    );
  });

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">PANVIC</div>

        <nav className="admin-nav">
          <Link href="/admindashboard" className="admin-nav-item">
            <span>▦</span>
            Dashboard
          </Link>

          <Link
            href="/admindashboard/architects"
            className="admin-nav-item active"
          >
            <span>♙</span>
            Architects
          </Link>

          <Link href="/admindashboard/projects" className="admin-nav-item">
            <span>▣</span>
            Projects
          </Link>

          <Link href="/admindashboard/sales-persons" className="admin-nav-item">
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
            <h1>Architects</h1>
            <p>Manage and view registered architects.</p>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">A</div>

            <div>
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>

        {/* Page Card */}
        <section className="admin-card architects-card">
          {/* Toolbar */}
          <div className="table-toolbar">
            <div>
              <h2>All Architects</h2>
              <span>{filteredArchitects.length} architects</span>
            </div>

            <div className="table-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search architect..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Error */}
          {!loading && error && (
            <div className="table-state">
              <div className="empty-icon">⚠</div>
              <h3>Couldn't load architects</h3>
              <p>{error}</p>
              <button onClick={fetchArchitects} className="view-button">
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="table-state">
              <div className="loader"></div>
              <p>Loading architects...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredArchitects.length === 0 && (
            <div className="table-state">
              <div className="empty-icon">♙</div>
              <h3>
                {search ? "No architects found" : "No architects available"}
              </h3>
              <p>
                {search
                  ? "Try another search."
                  : "Architect registrations will appear here."}
              </p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && filteredArchitects.length > 0 && (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Architect</th>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Profession</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredArchitects.map((architect) => (
                    <tr key={architect.id}>
                      <td>
                        <div className="person-cell">
                          <div className="person-avatar">
                            {getInitials(architect?.name)}
                          </div>

                          <div>
                            <strong>{architect?.name || "—"}</strong>
                            <small>ID: {architect?.id || "—"}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {architect?.company || architect?.firm_name || "—"}
                      </td>

                      <td>
                        <div className="contact-cell">
                          <span>{architect?.email || "—"}</span>
                          <small>
                            {architect?.phone || architect?.mobile || ""}
                          </small>
                        </div>
                      </td>

                      <td>{architect?.profession || "Architect"}</td>

                      <td>
                        <span className="status-badge">
                          {architect?.status || "Active"}
                        </span>
                      </td>

                      <td>
                        <Link
                          href={`/admindashboard/architects/${architect.id}`}
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
          )}
        </section>
      </main>
    </div>
  );
}

function getInitials(name) {
  if (!name) return "A";

  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}