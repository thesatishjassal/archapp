"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

const API_URL =
  "https://api.panvic.in/api/salespersons/";

export default function SalesPersonsPage() {
  const [salesPersons, setSalesPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  const [selectedSalesPerson, setSelectedSalesPerson] =
    useState(null);

  /* Filters */
  const [companyFilter, setCompanyFilter] =
    useState("");

  const [architectureFilter, setArchitectureFilter] =
    useState("");

  useEffect(() => {
    fetchSalesPersons();
  }, []);

  /* Lock page scroll when modal is open */
  useEffect(() => {
    document.body.style.overflow =
      selectedSalesPerson ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedSalesPerson]);

  /* =====================================================
     FETCH SALES PERSONS
  ===================================================== */

  const fetchSalesPersons = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const text = await response
          .text()
          .catch(() => "");

        throw new Error(
          `Request failed: ${response.status} ${response.statusText} ${text}`
        );
      }

      const data = await response.json();

      console.log(
        "RAW SALES PERSON API RESPONSE:",
        data
      );

      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.results)) {
        list = data.results;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (
        Array.isArray(data?.salespersons)
      ) {
        list = data.salespersons;
      } else if (
        Array.isArray(data?.sales_persons)
      ) {
        list = data.sales_persons;
      } else if (Array.isArray(data?.records)) {
        list = data.records;
      }

      setSalesPersons(list);
    } catch (err) {
      console.error(
        "Sales Person API Error:",
        err
      );

      setError(
        err?.message ||
          "Failed to fetch sales persons"
      );

      setSalesPersons([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FILTER OPTIONS
  ===================================================== */

  const companyOptions = useMemo(() => {
    return [
      ...new Set(
        salesPersons
          .map(
            (person) =>
              person?.company_name
          )
          .filter(Boolean)
          .map(String)
      ),
    ].sort();
  }, [salesPersons]);

  const architectureOptions = useMemo(() => {
    const ids = [];

    salesPersons.forEach((person) => {
      if (
        Array.isArray(
          person?.architecture_id
        )
      ) {
        person.architecture_id.forEach(
          (id) => {
            if (
              id !== null &&
              id !== undefined &&
              id !== ""
            ) {
              ids.push(String(id));
            }
          }
        );
      }
    });

    return [
      ...new Set(ids),
    ].sort(
      (a, b) =>
        Number(a) - Number(b)
    );
  }, [salesPersons]);

  /* =====================================================
     FILTER DATA
  ===================================================== */

  const filteredSalesPersons = useMemo(() => {
    return salesPersons.filter(
      (person) => {
        const searchValue =
          search
            .trim()
            .toLowerCase();

        const architectureIds =
          Array.isArray(
            person?.architecture_id
          )
            ? person.architecture_id
            : [];

        const architectureText =
          architectureIds.join(" ");

        const searchableText = [
          person?.id,
          person?.name,
          person?.email,
          person?.phone,
          person?.company_name,
          architectureText,
        ]
          .filter(
            (value) =>
              value !== null &&
              value !== undefined
          )
          .join(" ")
          .toLowerCase();

        /* Search */
        const matchesSearch =
          !searchValue ||
          searchableText.includes(
            searchValue
          );

        /* Company */
        const matchesCompany =
          !companyFilter ||
          String(
            person?.company_name || ""
          ).toLowerCase() ===
            companyFilter.toLowerCase();

        /* Architecture */
        const matchesArchitecture =
          !architectureFilter ||
          architectureIds.some(
            (id) =>
              String(id) ===
              String(
                architectureFilter
              )
          );

        return (
          matchesSearch &&
          matchesCompany &&
          matchesArchitecture
        );
      }
    );
  }, [
    salesPersons,
    search,
    companyFilter,
    architectureFilter,
  ]);

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters = () => {
    setSearch("");
    setCompanyFilter("");
    setArchitectureFilter("");
  };

  const hasFilters =
    search ||
    companyFilter ||
    architectureFilter;

  /* =====================================================
     EXCEL DOWNLOAD
  ===================================================== */

  const downloadExcel = () => {
    if (
      filteredSalesPersons.length === 0
    ) {
      alert(
        "No sales persons available for the selected filters."
      );

      return;
    }

    /*
     * IMPORTANT:
     * These are the EXACT API fields.
     */

    const excelData =
      filteredSalesPersons.map(
        (person) => ({
          ID:
            person?.id ?? "",

          Name:
            person?.name ?? "",

          Email:
            person?.email ?? "",

          Phone:
            person?.phone ?? "",

          "Company Name":
            person?.company_name ?? "",

          "Architecture ID":
            Array.isArray(
              person?.architecture_id
            )
              ? person.architecture_id.join(
                  ", "
                )
              : "",

          OTP:
            person?.otp ?? "",

          "OTP Expires At":
            person?.otp_expires_at ?? "",
        })
      );

    /* Create worksheet */
    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );

    /* Column widths */
    worksheet["!cols"] = [
      {
        wch: 10,
      },
      {
        wch: 28,
      },
      {
        wch: 35,
      },
      {
        wch: 22,
      },
      {
        wch: 28,
      },
      {
        wch: 22,
      },
      {
        wch: 15,
      },
      {
        wch: 28,
      },
    ];

    /* Excel filters */
    if (worksheet["!ref"]) {
      worksheet["!autofilter"] = {
        ref: worksheet["!ref"],
      };
    }

    /* Freeze first row */
    worksheet["!freeze"] = {
      xSplit: 0,
      ySplit: 1,
    };

    /* Create workbook */
    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Sales Persons"
    );

    /* File name */
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    XLSX.writeFile(
      workbook,
      `salespersons-${today}.xlsx`
    );
  };

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="admin-layout">

      {/* ================= SIDEBAR ================= */}

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
            className="admin-nav-item"
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
            className="admin-nav-item active"
          >
            <span>◉</span>
            Sales Persons
          </Link>

        </nav>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="admin-main">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <h1>
              Sales Persons
            </h1>

            <p>
              Manage and view registered
              sales persons.
            </p>

          </div>

          <div className="admin-user">

            <div className="admin-avatar">
              A
            </div>

            <div>

              <strong>
                Admin
              </strong>

              <small>
                Administrator
              </small>

            </div>

          </div>

        </header>


        {/* ================= CARD ================= */}

        <section className="admin-card sales-person-card">

          {/* TOOLBAR */}

          <div className="table-toolbar">

            <div>

              <h2>
                All Sales Persons
              </h2>

              <span>
                {
                  filteredSalesPersons.length
                }{" "}
                of{" "}
                {salesPersons.length}{" "}
                sales persons
              </span>

            </div>


            <div className="sales-toolbar-actions">

              {/* SEARCH */}

              <div className="table-search">

                <span>
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search sales person..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

              </div>


              {/* EXCEL */}

              <button
                type="button"
                className="excel-button"
                onClick={
                  downloadExcel
                }
                disabled={
                  filteredSalesPersons.length ===
                  0
                }
              >
                <span>
                  ↓
                </span>

                Download Excel
              </button>


              {/* REFRESH */}

              <button
                type="button"
                className="refresh-button"
                onClick={
                  fetchSalesPersons
                }
                disabled={loading}
              >
                ↻
              </button>

            </div>

          </div>


          {/* ================= FILTERS ================= */}

          <div className="sales-filters">

            {/* COMPANY */}

            <select
              value={
                companyFilter
              }
              onChange={(e) =>
                setCompanyFilter(
                  e.target.value
                )
              }
            >

              <option value="">
                All Companies
              </option>

              {companyOptions.map(
                (company) => (
                  <option
                    key={company}
                    value={company}
                  >
                    {company}
                  </option>
                )
              )}

            </select>


            {/* ARCHITECTURE */}

            <select
              value={
                architectureFilter
              }
              onChange={(e) =>
                setArchitectureFilter(
                  e.target.value
                )
              }
            >

              <option value="">
                All Architectures
              </option>

              {architectureOptions.map(
                (id) => (
                  <option
                    key={id}
                    value={id}
                  >
                    Architecture #{id}
                  </option>
                )
              )}

            </select>


            {/* CLEAR */}

            {hasFilters && (
              <button
                type="button"
                className="clear-filters-button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>
            )}

          </div>


          {/* ================= ERROR ================= */}

          {!loading &&
            error && (
              <div className="table-state">

                <div className="empty-icon">
                  ⚠
                </div>

                <h3>
                  Couldn't load sales persons
                </h3>

                <p>
                  {error}
                </p>

                <button
                  onClick={
                    fetchSalesPersons
                  }
                  className="view-button"
                >
                  Retry
                </button>

              </div>
            )}


          {/* ================= LOADING ================= */}

          {loading && (
            <div className="table-state">

              <div className="loader"></div>

              <p>
                Loading sales persons...
              </p>

            </div>
          )}


          {/* ================= EMPTY ================= */}

          {!loading &&
            !error &&
            filteredSalesPersons.length ===
              0 && (
              <div className="table-state">

                <div className="empty-icon">
                  ◉
                </div>

                <h3>
                  {hasFilters
                    ? "No sales persons found"
                    : "No sales persons available"}
                </h3>

                <p>
                  {hasFilters
                    ? "Try changing or clearing your filters."
                    : "Sales person registrations will appear here."}
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    className="view-button"
                    onClick={
                      clearFilters
                    }
                  >
                    Clear Filters
                  </button>
                )}

              </div>
            )}


          {/* ================= TABLE ================= */}

          {!loading &&
            !error &&
            filteredSalesPersons.length >
              0 && (

              <div className="table-wrapper">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        Sales Person
                      </th>

                      <th>
                        Company
                      </th>

                      <th>
                        Contact
                      </th>

                      <th>
                        Architects
                      </th>

                      <th>
                        OTP
                      </th>

                      <th></th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredSalesPersons.map(
                      (person) => {

                        const name =
                          person?.name ||
                          "Unknown";

                        const architectureIds =
                          Array.isArray(
                            person?.architecture_id
                          )
                            ? person.architecture_id
                            : [];

                        const hasOtp =
                          person?.otp !==
                            null &&
                          person?.otp !==
                            undefined &&
                          String(
                            person.otp
                          ).trim() !== "";

                        return (
                          <tr
                            key={
                              person?.id
                            }
                          >

                            {/* NAME */}

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
                                    {person?.id ??
                                      "—"}
                                  </small>

                                </div>

                              </div>

                            </td>


                            {/* COMPANY */}

                            <td>

                              {person?.company_name ||
                                "—"}

                            </td>


                            {/* CONTACT */}

                            <td>

                              <div className="contact-cell">

                                <span>
                                  {person?.email ||
                                    "—"}
                                </span>

                                <small>
                                  {person?.phone ||
                                    ""}
                                </small>

                              </div>

                            </td>


                            {/* ARCHITECTURES */}

                            <td>

                              {architectureIds.length >
                              0 ? (

                                <div className="architecture-list">

                                  {architectureIds
                                    .slice(
                                      0,
                                      3
                                    )
                                    .map(
                                      (
                                        id
                                      ) => (
                                        <span
                                          className="architecture-badge"
                                          key={
                                            id
                                          }
                                        >
                                          #
                                          {id}
                                        </span>
                                      )
                                    )}

                                  {architectureIds.length >
                                    3 && (
                                    <span className="architecture-more">
                                      +
                                      {architectureIds.length -
                                        3}
                                    </span>
                                  )}

                                </div>

                              ) : (

                                <span className="muted-text">
                                  None
                                </span>

                              )}

                            </td>


                            {/* OTP */}

                            <td>

                              <span
                                className={`status-badge ${
                                  hasOtp
                                    ? "otp-active"
                                    : "otp-none"
                                }`}
                              >
                                {hasOtp
                                  ? "Available"
                                  : "None"}
                              </span>

                            </td>


                            {/* VIEW */}

                            <td>

                              <button
                                type="button"
                                className="view-button"
                                onClick={() =>
                                  setSelectedSalesPerson(
                                    person
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


      {/* ================= MODAL ================= */}

      {selectedSalesPerson && (
        <SalesPersonModal
          salesPerson={
            selectedSalesPerson
          }
          onClose={() =>
            setSelectedSalesPerson(
              null
            )
          }
        />
      )}


      {/* ================= CSS ================= */}

      <style jsx global>{`

        .sales-toolbar-actions {
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
        }

        .excel-button:hover {
          background: #000000;
        }

        .excel-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .refresh-button {
          height: 40px;
          width: 40px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #ffffff;
          color: #374151;
          font-size: 19px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .refresh-button:hover {
          background: #f9fafb;
        }

        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sales-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid #f1f2f4;
          border-bottom: 1px solid #f1f2f4;
          background: #fafafa;
          flex-wrap: wrap;
        }

        .sales-filters select {
          height: 38px;
          min-width: 180px;
          padding: 0 32px 0 11px;
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #ffffff;
          color: #374151;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }

        .sales-filters select:focus {
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

        .status-badge.otp-active {
          background: #ecfdf3;
          color: #0f7b4d;
        }

        .status-badge.otp-none {
          background: #f3f4f6;
          color: #6b7280;
        }

        .architecture-list {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }

        .architecture-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          border-radius: 6px;
          background: #f3f4f6;
          color: #374151;
          font-size: 11px;
          font-weight: 600;
        }

        .architecture-more {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 600;
        }

        .muted-text {
          color: #9ca3af;
          font-size: 13px;
        }

        @media (max-width: 768px) {

          .sales-toolbar-actions {
            width: 100%;
          }

          .table-search {
            flex: 1;
          }

          .excel-button {
            width: 100%;
          }

          .sales-filters {
            align-items: stretch;
          }

          .sales-filters select,
          .clear-filters-button {
            width: 100%;
          }

        }

      `}</style>

    </div>
  );
}


/* =====================================================
   HELPERS
===================================================== */

function getInitials(name) {
  if (!name) {
    return "S";
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


/* =====================================================
   DETAIL MODAL
===================================================== */

function SalesPersonModal({
  salesPerson,
  onClose,
}) {
  const name =
    salesPerson?.name ||
    "Unknown";

  const architectureIds =
    Array.isArray(
      salesPerson?.architecture_id
    )
      ? salesPerson.architecture_id
      : [];

  const hasOtp =
    salesPerson?.otp !== null &&
    salesPerson?.otp !== undefined &&
    String(
      salesPerson.otp
    ).trim() !== "";

  return (
    <div
      className="sp-overlay"
      onClick={onClose}
    >

      <div
        className="sp-panel"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="sp-header">

          <div className="sp-identity">

            <div className="sp-avatar">
              {getInitials(name)}
            </div>

            <div>

              <h2>
                {name}
              </h2>

              <p>
                {salesPerson?.company_name ||
                  "Sales Person"}
              </p>

            </div>

          </div>

          <button
            type="button"
            className="sp-close"
            onClick={onClose}
          >
            ✕
          </button>

        </div>


        <div className="sp-divider" />


        {/* BODY */}

        <div className="sp-body">

          {/* BASIC INFORMATION */}

          <p className="sp-section-label">
            Sales Person Information
          </p>

          <div className="sp-fields">

            <DetailField
              label="ID"
              value={
                salesPerson?.id
              }
            />

            <DetailField
              label="Name"
              value={
                salesPerson?.name
              }
            />

            <DetailField
              label="Email"
              value={
                salesPerson?.email
              }
            />

            <DetailField
              label="Phone"
              value={
                salesPerson?.phone
              }
            />

            <DetailField
              label="Company Name"
              value={
                salesPerson?.company_name
              }
            />

          </div>


          {/* ARCHITECTURES */}

          <p className="sp-section-label">
            Assigned Architects
          </p>

          {architectureIds.length >
          0 ? (

            <div className="sp-architecture-box">

              {architectureIds.map(
                (id) => (
                  <span
                    className="sp-architecture-badge"
                    key={id}
                  >
                    Architecture #{id}
                  </span>
                )
              )}

            </div>

          ) : (

            <p className="sp-empty">
              No architects assigned.
            </p>

          )}


          {/* OTP */}

          <p className="sp-section-label">
            OTP Information
          </p>

          <div className="sp-fields">

            <DetailField
              label="OTP"
              value={
                salesPerson?.otp
              }
            />

            <DetailField
              label="OTP Expires At"
              value={
                salesPerson?.otp_expires_at
              }
            />

            <DetailField
              label="OTP Status"
              value={
                hasOtp
                  ? "Available"
                  : "None"
              }
            />

          </div>


          {/* SUMMARY */}

          <div className="sp-stats">

            <div className="sp-stat">

              <span>
                Architect IDs
              </span>

              <strong>
                {
                  architectureIds.length
                }
              </strong>

            </div>

            <div className="sp-stat">

              <span>
                OTP
              </span>

              <strong>
                {hasOtp
                  ? "Yes"
                  : "No"}
              </strong>

            </div>

            <div className="sp-stat">

              <span>
                ID
              </span>

              <strong>
                {salesPerson?.id ??
                  "—"}
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* MODAL CSS */}

      <style jsx>{`

        .sp-overlay {
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

        .sp-panel {
          width: 100%;
          max-width: 560px;
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

        .sp-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 28px;
        }

        .sp-identity {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .sp-avatar {
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

        .sp-identity h2 {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          color: #111827;
        }

        .sp-identity p {
          margin: 3px 0 0;
          font-size: 13px;
          color: #9ca3af;
        }

        .sp-close {
          border: none;
          background: transparent;
          color: #9ca3af;
          font-size: 15px;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }

        .sp-close:hover {
          color: #111827;
          background: #f3f4f6;
        }

        .sp-divider {
          height: 1px;
          background: #f1f2f4;
          margin: 0 28px;
        }

        .sp-body {
          padding: 24px 28px 28px;
        }

        .sp-section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9ca3af;
          margin: 0 0 12px;
        }

        .sp-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 20px;
          margin-bottom: 28px;
        }

        .sp-field label {
          display: block;
          font-size: 11px;
          color: #9ca3af;
          margin-bottom: 3px;
        }

        .sp-field p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          word-break: break-word;
        }

        .sp-architecture-box {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 28px;
        }

        .sp-architecture-badge {
          padding: 7px 10px;
          background: #f3f4f6;
          border-radius: 7px;
          color: #374151;
          font-size: 12px;
          font-weight: 600;
        }

        .sp-empty {
          font-size: 13px;
          color: #9ca3af;
          margin: 0 0 28px;
        }

        .sp-stats {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 1px;
          background: #f1f2f4;
          border: 1px solid #f1f2f4;
          border-radius: 12px;
          overflow: hidden;
        }

        .sp-stat {
          background: #ffffff;
          padding: 14px 10px;
          text-align: center;
        }

        .sp-stat span {
          display: block;
          font-size: 11px;
          color: #9ca3af;
          margin-bottom: 4px;
        }

        .sp-stat strong {
          font-size: 17px;
          font-weight: 700;
          color: #111827;
        }

        @media (max-width: 520px) {

          .sp-overlay {
            padding: 12px;
          }

          .sp-header {
            padding: 20px;
          }

          .sp-body {
            padding: 20px;
          }

          .sp-divider {
            margin: 0 20px;
          }

          .sp-fields {
            grid-template-columns: 1fr;
          }

        }

      `}</style>

    </div>
  );
}


/* =====================================================
   DETAIL FIELD
===================================================== */

function DetailField({
  label,
  value,
}) {
  return (
    <div className="sp-field">

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