"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

const API_URL = "https://api.panvic.in/api/arch-register/";
const PROJECTS_API = "https://api.panvic.in/api/projects";

export default function ArchitectsPage() {
  const [architects, setArchitects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [selectedArchitect, setSelectedArchitect] = useState(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [maritalFilter, setMaritalFilter] = useState("");
  const [professionFilter, setProfessionFilter] = useState("");
  const [firmFilter, setFirmFilter] = useState("");

  useEffect(() => {
    fetchArchitects();
  }, []);

  // Lock page scroll while modal is open.
  useEffect(() => {
    document.body.style.overflow = selectedArchitect ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedArchitect]);

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

      console.log("RAW API RESPONSE:", data);

      // Handle common API response shapes
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
          "Unrecognized API response shape:",
          data
        );
      }

      setArchitects(list);
    } catch (err) {
      console.error("Architect API Error:", err);

      setError(
        err?.message || "Failed to fetch architects"
      );

      setArchitects([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Unique filter options
   */
  const roleOptions = useMemo(() => {
    return [...new Set(
      architects
        .map((item) => item?.role)
        .filter(Boolean)
        .map(String)
    )].sort();
  }, [architects]);

  const maritalOptions = useMemo(() => {
    return [...new Set(
      architects
        .map((item) => item?.marital_status)
        .filter(Boolean)
        .map(String)
    )].sort();
  }, [architects]);

  const professionOptions = useMemo(() => {
    return [...new Set(
      architects
        .map((item) => item?.profession)
        .filter(Boolean)
        .map(String)
    )].sort();
  }, [architects]);

  const firmOptions = useMemo(() => {
    return [...new Set(
      architects
        .map(
          (item) =>
            item?.firm_name ||
            item?.company
        )
        .filter(Boolean)
        .map(String)
    )].sort();
  }, [architects]);

  /*
   * Filter architects
   */
  const filteredArchitects = useMemo(() => {
    return architects.filter((architect) => {
      const value = search.trim().toLowerCase();

      const searchableText = [
        architect?.id,
        architect?.full_name,
        architect?.name,
        architect?.email,
        architect?.mobile_number,
        architect?.mobile,
        architect?.phone,
        architect?.company,
        architect?.firm_name,
        architect?.profession,
        architect?.role,
        architect?.marital_status,
        architect?.bank_name,
        architect?.account_holder_name,
        architect?.ifsc_code,
        architect?.upi_id,
      ]
        .filter(
          (item) =>
            item !== null &&
            item !== undefined
        )
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !value ||
        searchableText.includes(value);

      const matchesRole =
        !roleFilter ||
        String(architect?.role || "").toLowerCase() ===
          roleFilter.toLowerCase();

      const matchesApproval =
        !approvalFilter ||
        (approvalFilter === "approved"
          ? architect?.is_approved === true
          : architect?.is_approved === false);

      const matchesMarital =
        !maritalFilter ||
        String(
          architect?.marital_status || ""
        ).toLowerCase() ===
          maritalFilter.toLowerCase();

      const matchesProfession =
        !professionFilter ||
        String(
          architect?.profession || ""
        ).toLowerCase() ===
          professionFilter.toLowerCase();

      const matchesFirm =
        !firmFilter ||
        String(
          architect?.firm_name ||
            architect?.company ||
            ""
        ).toLowerCase() ===
          firmFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesRole &&
        matchesApproval &&
        matchesMarital &&
        matchesProfession &&
        matchesFirm
      );
    });
  }, [
    architects,
    search,
    roleFilter,
    approvalFilter,
    maritalFilter,
    professionFilter,
    firmFilter,
  ]);

  /*
   * Clear all filters
   */
  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setApprovalFilter("");
    setMaritalFilter("");
    setProfessionFilter("");
    setFirmFilter("");
  };

  /*
   * Excel export
   *
   * Exports CURRENTLY FILTERED records.
   */
  const downloadExcel = () => {
    if (!filteredArchitects.length) {
      alert(
        "No architects available for the selected filters."
      );
      return;
    }

    const excelData = filteredArchitects.map(
      (architect) => ({
        "ID": architect?.id ?? "",

        "Full Name":
          architect?.full_name ??
          architect?.name ??
          "",

        "Email":
          architect?.email ?? "",

        "Mobile Number":
          architect?.mobile_number ??
          architect?.mobile ??
          architect?.phone ??
          "",

        "Role":
          architect?.role ?? "",

        "Profession":
          architect?.profession ?? "",

        "Firm Name":
          architect?.firm_name ??
          architect?.company ??
          "",

        "Marital Status":
          architect?.marital_status ?? "",

        "Date of Birth":
          architect?.date_of_birth ?? "",

        "Anniversary Date":
          architect?.anniversary_date ?? "",

        "Account Holder Name":
          architect?.account_holder_name ?? "",

        "Bank Name":
          architect?.bank_name ?? "",

        "Account Number":
          architect?.account_number !== null &&
          architect?.account_number !== undefined
            ? String(architect.account_number)
            : "",

        "IFSC Code":
          architect?.ifsc_code !== null &&
          architect?.ifsc_code !== undefined
            ? String(architect.ifsc_code)
            : "",

        "UPI ID":
          architect?.upi_id ?? "",

        "Profile Image":
          architect?.profile_image ?? "",

        "Approval Status":
          architect?.is_approved === true
            ? "Approved"
            : "Pending",
      })
    );

    // Create worksheet
    const worksheet =
      XLSX.utils.json_to_sheet(excelData);

    /*
     * Column widths
     */
    worksheet["!cols"] = [
      { wch: 8 }, // ID
      { wch: 26 }, // Full Name
      { wch: 32 }, // Email
      { wch: 20 }, // Mobile
      { wch: 15 }, // Role
      { wch: 24 }, // Profession
      { wch: 28 }, // Firm
      { wch: 20 }, // Marital
      { wch: 18 }, // DOB
      { wch: 20 }, // Anniversary
      { wch: 25 }, // Account holder
      { wch: 20 }, // Bank
      { wch: 24 }, // Account
      { wch: 20 }, // IFSC
      { wch: 28 }, // UPI
      { wch: 45 }, // Profile image
      { wch: 20 }, // Approval
    ];

    // Create workbook
    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Architects"
    );

    /*
     * Add a filter to the Excel header row
     */
    if (worksheet["!ref"]) {
      worksheet["!autofilter"] = {
        ref: worksheet["!ref"],
      };
    }

    /*
     * Freeze the header row
     */
    worksheet["!freeze"] = {
      xSplit: 0,
      ySplit: 1,
    };

    /*
     * Filename
     */
    const today = new Date()
      .toISOString()
      .split("T")[0];

    const filename =
      `architects-${today}.xlsx`;

    XLSX.writeFile(
      workbook,
      filename
    );
  };

  const hasFilters =
    search ||
    roleFilter ||
    approvalFilter ||
    maritalFilter ||
    professionFilter ||
    firmFilter;

  return (
    <div className="admin-layout">

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="admin-sidebar">

        <div className="admin-logo">
          PANVIC
        </div>

        <nav className="admin-nav">

          <Link
            href="/admindashboard"
            className="admin-nav-item"
          >
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

          <Link
            href="/admindashboard/projects"
            className="admin-nav-item"
          >
            <span>▣</span>
            Projects
          </Link>

          <Link
            href="/admindashboard/salespersons"
            className="admin-nav-item"
          >
            <span>◉</span>
            Sales Persons
          </Link>

        </nav>

      </aside>

      {/* =========================
          MAIN
      ========================= */}
      <main className="admin-main">

        {/* Header */}
        <header className="admin-header">

          <div>
            <h1>Architects</h1>

            <p>
              Manage and view registered architects.
            </p>
          </div>

          <div className="admin-user">

            <div className="admin-avatar">
              A
            </div>

            <div>
              <strong>Admin</strong>
              <small>
                Administrator
              </small>
            </div>

          </div>

        </header>

        {/* =========================
            CARD
        ========================= */}
        <section className="admin-card architects-card">

          {/* =========================
              TOOLBAR
          ========================= */}
          <div className="table-toolbar">

            <div>
              <h2>
                All Architects
              </h2>

              <span>
                {filteredArchitects.length}
                {" "}
                of
                {" "}
                {architects.length}
                {" "}
                architects
              </span>
            </div>

            <div className="architect-toolbar-actions">

              {/* Search */}
              <div className="table-search">

                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search architect..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* Excel */}
              <button
                type="button"
                className="excel-button"
                onClick={downloadExcel}
                disabled={
                  !filteredArchitects.length
                }
              >
                <span>↓</span>
                Download Excel
              </button>

            </div>

          </div>

          {/* =========================
              FILTERS
          ========================= */}
          <div className="architect-filters">

            {/* Role */}
            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Roles
              </option>

              {roleOptions.map(
                (role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                )
              )}

            </select>

            {/* Approval */}
            <select
              value={approvalFilter}
              onChange={(e) =>
                setApprovalFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Approval Status
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="pending">
                Pending
              </option>

            </select>

            {/* Marital */}
            <select
              value={maritalFilter}
              onChange={(e) =>
                setMaritalFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Marital Status
              </option>

              {maritalOptions.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                )
              )}

            </select>

            {/* Profession */}
            <select
              value={professionFilter}
              onChange={(e) =>
                setProfessionFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Professions
              </option>

              {professionOptions.map(
                (profession) => (
                  <option
                    key={profession}
                    value={profession}
                  >
                    {profession}
                  </option>
                )
              )}

            </select>

            {/* Firm */}
            <select
              value={firmFilter}
              onChange={(e) =>
                setFirmFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Firms
              </option>

              {firmOptions.map(
                (firm) => (
                  <option
                    key={firm}
                    value={firm}
                  >
                    {firm}
                  </option>
                )
              )}

            </select>

            {/* Clear */}
            {hasFilters && (
              <button
                type="button"
                className="clear-filters-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}

          </div>

          {/* =========================
              ERROR
          ========================= */}
          {!loading && error && (
            <div className="table-state">

              <div className="empty-icon">
                ⚠
              </div>

              <h3>
                Couldn't load architects
              </h3>

              <p>
                {error}
              </p>

              <button
                onClick={fetchArchitects}
                className="view-button"
              >
                Retry
              </button>

            </div>
          )}

          {/* =========================
              LOADING
          ========================= */}
          {loading && (
            <div className="table-state">

              <div className="loader"></div>

              <p>
                Loading architects...
              </p>

            </div>
          )}

          {/* =========================
              EMPTY
          ========================= */}
          {!loading &&
            !error &&
            filteredArchitects.length === 0 && (
              <div className="table-state">

                <div className="empty-icon">
                  ♙
                </div>

                <h3>
                  {hasFilters
                    ? "No architects found"
                    : "No architects available"}
                </h3>

                <p>
                  {hasFilters
                    ? "Try changing or clearing your filters."
                    : "Architect registrations will appear here."}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    className="view-button"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}

              </div>
            )}

          {/* =========================
              TABLE
          ========================= */}
          {!loading &&
            !error &&
            filteredArchitects.length > 0 && (

              <div className="table-wrapper">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>
                        Architect
                      </th>

                      <th>
                        Company
                      </th>

                      <th>
                        Contact
                      </th>

                      <th>
                        Profession
                      </th>

                      <th>
                        Status
                      </th>

                      <th></th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredArchitects.map(
                      (architect) => {

                        const name =
                          architect?.full_name ||
                          architect?.name ||
                          "Unknown";

                        const firm =
                          architect?.firm_name ||
                          architect?.company ||
                          "—";

                        const mobile =
                          architect?.mobile_number ||
                          architect?.mobile ||
                          architect?.phone ||
                          "";

                        const approved =
                          architect?.is_approved === true;

                        return (
                          <tr
                            key={
                              architect?.id
                            }
                          >

                            {/* Architect */}
                            <td>

                              <div className="person-cell">

                                <div className="person-avatar">
                                  {getInitials(
                                    name
                                  )}
                                </div>

                                <div>

                                  <strong>
                                    {name}
                                  </strong>

                                  <small>
                                    ID:{" "}
                                    {architect?.id ??
                                      "—"}
                                  </small>

                                </div>

                              </div>

                            </td>

                            {/* Company */}
                            <td>
                              {firm}
                            </td>

                            {/* Contact */}
                            <td>

                              <div className="contact-cell">

                                <span>
                                  {architect?.email ||
                                    "—"}
                                </span>

                                <small>
                                  {mobile}
                                </small>

                              </div>

                            </td>

                            {/* Profession */}
                            <td>
                              {architect?.profession ||
                                "Architect"}
                            </td>

                            {/* Status */}
                            <td>

                              <span
                                className={`status-badge ${
                                  approved
                                    ? "approved"
                                    : "pending"
                                }`}
                              >
                                {approved
                                  ? "Approved"
                                  : "Pending"}
                              </span>

                            </td>

                            {/* View */}
                            <td>

                              <button
                                type="button"
                                className="view-button"
                                onClick={() =>
                                  setSelectedArchitect(
                                    architect
                                  )
                                }
                              >
                                View
                              </button>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

        </section>

      </main>

      {/* =========================
          DETAIL MODAL
      ========================= */}
      {selectedArchitect && (
        <ArchitectModal
          architect={
            selectedArchitect
          }
          onClose={() =>
            setSelectedArchitect(null)
          }
        />
      )}

      {/* =========================
          PAGE STYLES
      ========================= */}
      <style jsx global>{`

        .architect-toolbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .excel-button {
          height: 40px;
          padding: 0 16px;
          border: 1px solid #111827;
          border-radius: 8px;
          background: #111827;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          white-space: nowrap;
          transition:
            background 0.15s ease,
            opacity 0.15s ease;
        }

        .excel-button:hover {
          background: #000000;
        }

        .excel-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .architect-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid #f1f2f4;
          border-bottom: 1px solid #f1f2f4;
          background: #fafafa;
          flex-wrap: wrap;
        }

        .architect-filters select {
          height: 38px;
          min-width: 145px;
          padding: 0 32px 0 11px;
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #ffffff;
          color: #374151;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }

        .architect-filters select:focus {
          border-color: #9ca3af;
        }

        .clear-filters-button {
          height: 38px;
          padding: 0 13px;
          border: none;
          background: transparent;
          color: #6b7280;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .clear-filters-button:hover {
          color: #111827;
        }

        .status-badge.approved {
          background: #ecfdf3;
          color: #0f7b4d;
        }

        .status-badge.pending {
          background: #fff7ed;
          color: #c2410c;
        }

        @media (max-width: 768px) {

          .architect-toolbar-actions {
            width: 100%;
          }

          .table-search {
            flex: 1;
          }

          .excel-button {
            width: 100%;
          }

          .architect-filters {
            align-items: stretch;
          }

          .architect-filters select,
          .clear-filters-button {
            width: 100%;
          }

        }

      `}</style>

    </div>
  );
}


/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {
  if (!name) {
    return "A";
  }

  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (word) =>
        word.charAt(0)
    )
    .join("")
    .toUpperCase();
}


/* =========================================================
   ARCHITECT MODAL
========================================================= */

function ArchitectModal({
  architect,
  onClose,
}) {
  const [projects, setProjects] =
    useState([]);

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  useEffect(() => {
    if (!architect?.id) {
      setLoadingProjects(false);
      return;
    }

    let cancelled = false;

    const loadProjects = async () => {
      try {
        setLoadingProjects(true);

        const res = await fetch(
          `${PROJECTS_API}/${architect.id}`
        );

        const data = res.ok
          ? await res.json()
          : [];

        if (!cancelled) {
          setProjects(
            Array.isArray(data)
              ? data
              : []
          );
        }
      } catch (err) {
        console.error(
          "Architect projects loading error:",
          err
        );

        if (!cancelled) {
          setProjects([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingProjects(false);
        }
      }
    };

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [architect?.id]);

  /*
   * IMPORTANT:
   * Your API uses full_name, not name.
   */
  const name =
    architect?.full_name ||
    architect?.name ||
    "Unknown";

  const firm =
    architect?.firm_name ||
    architect?.company ||
    "";

  const mobile =
    architect?.mobile_number ||
    architect?.mobile ||
    architect?.phone ||
    "";

  const completed =
    projects.filter(
      (p) =>
        String(p?.status || "")
          .toLowerCase() ===
        "completed"
    ).length;

  const inProgress =
    projects.filter(
      (p) =>
        String(p?.status || "")
          .toLowerCase() ===
        "in progress"
    ).length;

  const approved =
    architect?.is_approved === true;

  return (
    <div
      className="am-overlay"
      onClick={onClose}
    >

      <div className="am-panel"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* Header */}
        <div className="am-header">

          <div className="am-identity">

            <div className="am-avatar">
              {getInitials(name)}
            </div>

            <div>

              <h2>
                {name}
              </h2>

              <p>
                {firm ||
                  architect?.profession ||
                  "—"}
              </p>

            </div>

          </div>

          <button
            type="button"
            className="am-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>

        </div>

        <div className="am-divider" />

        {/* Body */}
        <div className="am-body">

          {/* =====================
              BASIC INFORMATION
          ===================== */}
          <p className="am-section-label">
            Basic Information
          </p>

          <div className="am-fields">

            <DetailField
              label="ID"
              value={
                architect?.id
              }
            />

            <DetailField
              label="Full Name"
              value={name}
            />

            <DetailField
              label="Email"
              value={
                architect?.email
              }
            />

            <DetailField
              label="Mobile Number"
              value={mobile}
            />

            <DetailField
              label="Profession"
              value={
                architect?.profession
              }
            />

            <DetailField
              label="Firm Name"
              value={firm}
            />

            <DetailField
              label="Role"
              value={
                architect?.role
              }
            />

            <DetailField
              label="Marital Status"
              value={
                architect?.marital_status
              }
            />

            <DetailField
              label="Date of Birth"
              value={
                architect?.date_of_birth
              }
            />

            <DetailField
              label="Anniversary Date"
              value={
                architect?.anniversary_date
              }
            />

            <DetailField
              label="Approval Status"
              value={
                approved
                  ? "Approved"
                  : "Pending"
              }
            />

          </div>


          {/* =====================
              BANK DETAILS
          ===================== */}
          <p className="am-section-label">
            Bank & Payment
          </p>

          <div className="am-fields">

            <DetailField
              label="Account Holder Name"
              value={
                architect?.account_holder_name
              }
            />

            <DetailField
              label="Bank Name"
              value={
                architect?.bank_name
              }
            />

            <DetailField
              label="Account Number"
              value={
                architect?.account_number
              }
            />

            <DetailField
              label="IFSC Code"
              value={
                architect?.ifsc_code
              }
            />

            <DetailField
              label="UPI ID"
              value={
                architect?.upi_id
              }
            />

          </div>


          {/* =====================
              PROFILE
          ===================== */}
          {architect?.profile_image && (
            <>
              <p className="am-section-label">
                Profile
              </p>

              <div className="am-profile-image">

                <img
                  src={
                    architect.profile_image
                  }
                  alt={name}
                />

              </div>
            </>
          )}


          {/* =====================
              PROJECT STATS
          ===================== */}
          <div className="am-stats">

            <div className="am-stat">

              <span>
                Total
              </span>

              <strong>
                {projects.length}
              </strong>

            </div>

            <div className="am-stat">

              <span>
                Completed
              </span>

              <strong>
                {completed}
              </strong>

            </div>

            <div className="am-stat">

              <span>
                In Progress
              </span>

              <strong>
                {inProgress}
              </strong>

            </div>

          </div>


          {/* =====================
              PROJECTS
          ===================== */}
          <p className="am-section-label">
            Projects
          </p>

          {loadingProjects && (
            <p className="am-empty">
              Loading projects…
            </p>
          )}

          {!loadingProjects &&
            projects.length === 0 && (
              <p className="am-empty">
                No projects yet.
              </p>
            )}

          {!loadingProjects &&
            projects.map(
              (project) => {

                const projectStatus =
                  String(
                    project?.status ||
                    ""
                  );

                const statusLower =
                  projectStatus.toLowerCase();

                return (
                  <div
                    className="am-project-row"
                    key={project?.id}
                  >

                    <div className="am-project-main">

                      <p>
                        {project?.title ||
                          "Untitled Project"}
                      </p>

                      <span>
                        {project?.location ||
                          "—"}
                      </span>

                    </div>

                    <div className="am-project-meta">

                      <span className="am-project-budget">

                        {project?.budget !== null &&
                        project?.budget !== undefined
                          ? `₹ ${Number(
                              project.budget
                            ).toLocaleString(
                              "en-IN"
                            )}`
                          : "—"}

                      </span>

                      <span
                        className={`am-pill ${
                          statusLower ===
                          "completed"
                            ? "completed"
                            : statusLower ===
                              "in progress"
                            ? "progress"
                            : ""
                        }`}
                      >
                        {projectStatus ||
                          "Unknown"}
                      </span>

                    </div>

                  </div>
                );
              }
            )}

        </div>

      </div>

      {/* =========================
          MODAL CSS
      ========================= */}
      <style jsx>{`

        .am-overlay {
          position: fixed;
          inset: 0;
          background: rgba(
            17,
            24,
            39,
            0.4
          );
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 1000;
          font-family:
            "DM Sans",
            sans-serif;
        }

        .am-panel {
          width: 100%;
          max-width: 620px;
          max-height: 88vh;
          overflow-y: auto;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #eef0f2;
          box-shadow:
            0 20px 60px
            rgba(
              17,
              24,
              39,
              0.12
            );
        }

        .am-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 28px;
        }

        .am-identity {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .am-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f3f4f6;
          color: #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }

        .am-identity h2 {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.01em;
        }

        .am-identity p {
          margin: 3px 0 0;
          font-size: 13px;
          color: #9ca3af;
        }

        .am-close {
          border: none;
          background: transparent;
          color: #9ca3af;
          font-size: 15px;
          cursor: pointer;
          line-height: 1;
          padding: 4px;
          border-radius: 6px;
          transition:
            color 0.15s ease,
            background 0.15s ease;
        }

        .am-close:hover {
          color: #111827;
          background: #f3f4f6;
        }

        .am-divider {
          height: 1px;
          background: #f1f2f4;
          margin: 0 28px;
        }

        .am-body {
          padding: 24px 28px 28px;
        }

        .am-section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9ca3af;
          margin: 0 0 12px;
        }

        .am-fields {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 16px 20px;
          margin-bottom: 28px;
        }

        .am-field label {
          display: block;
          font-size: 11px;
          color: #9ca3af;
          margin-bottom: 3px;
        }

        .am-field p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          word-break: break-word;
        }

        .am-profile-image {
          margin-bottom: 28px;
        }

        .am-profile-image img {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border-radius: 12px;
          border: 1px solid #eef0f2;
        }

        .am-stats {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 1px;
          background: #f1f2f4;
          border: 1px solid #f1f2f4;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .am-stat {
          background: #ffffff;
          padding: 14px 12px;
          text-align: center;
        }

        .am-stat span {
          display: block;
          font-size: 11px;
          color: #9ca3af;
          margin-bottom: 4px;
        }

        .am-stat strong {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }

        .am-project-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #f5f5f6;
        }

        .am-project-row:last-child {
          border-bottom: none;
        }

        .am-project-main {
          min-width: 0;
        }

        .am-project-main p {
          margin: 0;
          font-size: 13.5px;
          font-weight: 600;
          color: #111827;
        }

        .am-project-main span {
          font-size: 12px;
          color: #9ca3af;
        }

        .am-project-meta {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        .am-project-budget {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .am-pill {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 999px;
          background: #f3f4f6;
          color: #6b7280;
          white-space: nowrap;
        }

        .am-pill.completed {
          background: #ecfdf3;
          color: #0f7b4d;
        }

        .am-pill.progress {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .am-empty {
          font-size: 13px;
          color: #9ca3af;
          padding: 8px 0;
        }

        @media (max-width: 520px) {

          .am-overlay {
            padding: 12px;
          }

          .am-fields {
            grid-template-columns: 1fr;
          }

          .am-header {
            padding: 20px;
          }

          .am-body {
            padding: 20px;
          }

          .am-divider {
            margin: 0 20px;
          }

          .am-project-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .am-project-meta {
            width: 100%;
            justify-content: space-between;
          }

        }

      `}</style>

    </div>
  );
}


/* =========================================================
   DETAIL FIELD
========================================================= */

function DetailField({
  label,
  value,
}) {
  return (
    <div className="am-field">

      <label>
        {label}
      </label>

      <p>
        {value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
          ? String(value)
          : "—"}
      </p>

    </div>
  );
}