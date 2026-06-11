"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Config ────────────────────────────────────────────────
// const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_BASE = "https://api.panvic.in";

// Each salesperson entry needs an id that matches your DB
const SALESPERSONS = [
  { id: 1, name: "Chander" },
  { id: 2, name: "Sanjay" },
  { id: 3, name: "Manav" },
//   { id: 4, name: "Deepak Verma" },
];

// ─── API helpers ───────────────────────────────────────────

/**
 * GET /references/sales/{sales_person_id}
 * Returns all architect references for a given salesperson.
 */
async function fetchReferencesBySales(salesPersonId) {
  const res = await fetch(`${API_BASE}/references/sales/${salesPersonId}`);
  if (!res.ok) throw new Error(`Failed to fetch references: ${res.status}`);
  return res.json();
}

/**
 * GET /references/architect/{architect_id}
 * Returns all salespersons who have referenced a given architect.
 */
async function fetchReferencesByArchitect(architectId) {
  const res = await fetch(`${API_BASE}/references/architect/${architectId}`);
  if (!res.ok) throw new Error(`Failed to fetch architect references: ${res.status}`);
  return res.json();
}

/**
 * POST /references/sales/{sales_person_id}
 * Adds a new architect reference for the given salesperson.
 * @param {number} salesPersonId
 * @param {{ architect: string, architect_email?: string, notes?: string, added_at?: string }} payload
 */
async function createReference(salesPersonId, payload) {
  const res = await fetch(`${API_BASE}/references/sales/${salesPersonId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to create reference: ${res.status}`);
  }
  return res.json();
}

/**
 * PATCH /references/sales/{sales_person_id}/{reference_id}
 * Updates notes (or other editable fields) on an existing reference.
 * @param {number} salesPersonId
 * @param {number} referenceId
 * @param {Partial<{ notes: string, status: string }>} payload
 */
async function updateReference(salesPersonId, referenceId, payload) {
  const res = await fetch(
    `${API_BASE}/references/sales/${salesPersonId}/${referenceId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to update reference: ${res.status}`);
  }
  return res.json();
}

/**
 * DELETE /references/sales/{sales_person_id}/{reference_id}
 * Removes a reference.
 */
async function deleteReference(salesPersonId, referenceId) {
  const res = await fetch(
    `${API_BASE}/references/sales/${salesPersonId}/${referenceId}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to delete reference: ${res.status}`);
  }
  // DELETE may return 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ─── Tiny utilities ────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  { bg: "#E1F5EE", color: "#0F6E56" },
  { bg: "#EEEDFE", color: "#534AB7" },
  { bg: "#FAEEDA", color: "#854F0B" },
  { bg: "#FBEAF0", color: "#993556" },
  { bg: "#E6F1FB", color: "#185FA5" },
  { bg: "#EAF3DE", color: "#3B6D11" },
];

function Avatar({ name, index = 0, size = 32 }) {
  const { bg, color } = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <span
      style={{
        width: size, height: size, borderRadius: "50%",
        background: bg, color,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.35, fontWeight: 600, flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:   { bg: "#E1F5EE", color: "#0F6E56", label: "Active" },
    pending:  { bg: "#FAEEDA", color: "#854F0B", label: "Pending" },
    inactive: { bg: "#F1EFE8", color: "#5F5E5A", label: "Inactive" },
  };
  const s = map[status] || map.inactive;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.3px" }}>
      {s.label}
    </span>
  );
}

function Spinner() {
  return (
    <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
  );
}

function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Main component ────────────────────────────────────────
export default function ArchReferencePage() {
  // "All references" view: fetch per-salesperson and merge, or load all at once.
  // Adjust ACTIVE_SALES_PERSON_ID to the currently logged-in salesperson.
  // To show ALL references across everyone, map over SALESPERSONS and merge below.
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // reference id being deleted

  const [form, setForm] = useState({
    architect: "", architect_email: "", sales_person_id: "", notes: "", added_at: "",
  });
  const [errors, setErrors] = useState({});

  // ── Load: fetch all salespersons' references and merge ──
  const loadAll = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      // Parallel fetch for every salesperson
      const results = await Promise.all(
        SALESPERSONS.map((sp) =>
          fetchReferencesBySales(sp.id).then((data) =>
            // Normalise: attach salesperson name if API doesn't include it
            (Array.isArray(data) ? data : []).map((ref) => ({
              ...ref,
              _sales_person_id: sp.id,
              sales_person: ref.sales_person ?? sp.name,
            }))
          ).catch(() => []) // gracefully skip a failing salesperson endpoint
        )
      );
      setRows(results.flat());
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Derived ──
  const filtered = rows.filter(
    (r) =>
      (r.architect ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.sales_person ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // ── Form helpers ──
  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.architect.trim()) errs.architect = "Required";
    if (!form.sales_person_id) errs.sales_person_id = "Required";
    return errs;
  }

  // ── POST: add reference ──
  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});
    try {
      const salesPersonId = Number(form.sales_person_id);
      const payload = {
        architect: form.architect.trim(),
        architect_email: form.architect_email.trim() || undefined,
        notes: form.notes.trim() || undefined,
        added_at: form.added_at || undefined,
      };

      const newRef = await createReference(salesPersonId, payload);

      // Attach display name for the table
      const sp = SALESPERSONS.find((s) => s.id === salesPersonId);
      setRows((prev) => [
        { ...newRef, _sales_person_id: salesPersonId, sales_person: newRef.sales_person ?? sp?.name },
        ...prev,
      ]);
      setForm({ architect: "", architect_email: "", sales_person_id: "", notes: "", added_at: "" });
      setOpen(false);
    } catch (err) {
      setErrors({ _api: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  // ── DELETE: remove reference ──
  async function handleDelete(row) {
    if (!window.confirm(`Remove reference for ${row.architect}?`)) return;
    setDeletingId(row.id);
    try {
      await deleteReference(row._sales_person_id, row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  function closeModal() {
    setOpen(false);
    setErrors({});
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* PAGE HEADER */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Architect References</h1>
          <p style={styles.pageSubtitle}>Track architects referred by your sales team</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.btnSecondary} onClick={loadAll} disabled={loading} title="Refresh">
            {loading ? <Spinner /> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            )}
            Refresh
          </button>
          <button style={styles.btnPrimary} onClick={() => setOpen(true)}>
            + Add Reference
          </button>
        </div>
      </div>

      {/* API ERROR BANNER */}
      {apiError && (
        <div style={styles.errorBanner}>
          <strong>Could not load references:</strong> {apiError}
          <button style={styles.retryBtn} onClick={loadAll}>Retry</button>
        </div>
      )}

      {/* STATS */}
      <div style={styles.statsRow}>
        {[
          { label: "Total References", value: rows.length },
          { label: "Active",           value: rows.filter((r) => r.status === "active").length },
          { label: "Pending",          value: rows.filter((r) => r.status === "pending").length },
          { label: "Salespersons",     value: [...new Set(rows.map((r) => r.sales_person))].length },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <span style={styles.statLabel}>{s.label}</span>
            <span style={styles.statValue}>{loading ? "—" : s.value}</span>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>
        <div style={styles.tableTop}>
          <div style={styles.searchWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              style={styles.searchInput}
              placeholder="Search by architect or salesperson…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span style={styles.countBadge}>{filtered.length} records</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={styles.loadingState}>
              <Spinner />
              <span style={{ color: "#9CA3AF", fontSize: 13, marginLeft: 8 }}>Loading references…</span>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  {["ID", "Architect", "Referred By", "Notes", "Date Added", "Status", ""].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={styles.empty}>
                      No references found. Add your first one.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr key={row.id} style={styles.tr}>
                      <td style={{ ...styles.td, color: "#9CA3AF", fontFamily: "monospace", fontSize: 12 }}>
                        #{row.id}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={row.architect} index={i} />
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13, color: "#111827" }}>{row.architect}</div>
                            {row.architect_email && (
                              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{row.architect_email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar name={row.sales_person} index={i + 2} size={26} />
                          <span style={{ fontSize: 13, color: "#374151" }}>{row.sales_person}</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, maxWidth: 200 }}>
                        <span style={{ fontSize: 12, color: "#6B7280", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {row.notes || "—"}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>
                        {formatDate(row.added_at)}
                      </td>
                      <td style={styles.td}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(row)}
                          disabled={deletingId === row.id}
                          title="Remove reference"
                        >
                          {deletingId === row.id ? <Spinner /> : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADD MODAL */}
      {open && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Add Architect Reference</h2>
                <p style={styles.modalSubtitle}>Link a salesperson to an architect they referred</p>
              </div>
              <button style={styles.closeBtn} onClick={closeModal} aria-label="Close">✕</button>
            </div>

            <div style={styles.modalBody}>
              {/* API-level error inside modal */}
              {errors._api && (
                <div style={{ ...styles.errorBanner, marginBottom: 14 }}>{errors._api}</div>
              )}

              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Architect Name <span style={{ color: "#EF4444" }}>*</span></label>
                  <input
                    style={{ ...styles.input, ...(errors.architect ? styles.inputError : {}) }}
                    name="architect"
                    value={form.architect}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Arora"
                  />
                  {errors.architect && <span style={styles.errorMsg}>{errors.architect}</span>}
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Architect Email</label>
                  <input
                    style={styles.input}
                    name="architect_email"
                    type="email"
                    value={form.architect_email}
                    onChange={handleChange}
                    placeholder="architect@email.com"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Referred By (Salesperson) <span style={{ color: "#EF4444" }}>*</span></label>
                  <select
                    style={{ ...styles.input, ...(errors.sales_person_id ? styles.inputError : {}) }}
                    name="sales_person_id"
                    value={form.sales_person_id}
                    onChange={handleChange}
                  >
                    <option value="">Select salesperson</option>
                    {SALESPERSONS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {errors.sales_person_id && <span style={styles.errorMsg}>{errors.sales_person_id}</span>}
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Date of Reference</label>
                  <input
                    style={styles.input}
                    name="added_at"
                    type="date"
                    value={form.added_at}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Notes</label>
                  <textarea
                    style={{ ...styles.input, resize: "vertical", minHeight: 80 }}
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Where did they meet? Any project context…"
                  />
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={closeModal} disabled={submitting}>Cancel</button>
              <button style={{ ...styles.btnPrimary, opacity: submitting ? 0.7 : 1, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={handleSubmit} disabled={submitting}>
                {submitting && <Spinner />}
                {submitting ? "Saving…" : "Save Reference"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#F9FAFB",
    padding: "32px 28px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  pageHeader: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    marginBottom: 24, flexWrap: "wrap", gap: 12,
  },
  pageTitle: { fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 },
  pageSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  btnPrimary: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 18px", fontSize: 13, fontWeight: 600,
    background: "#1D9E75", color: "#fff",
    border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap",
  },
  btnSecondary: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 14px", fontSize: 13, fontWeight: 500,
    background: "#fff", color: "#374151",
    border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer",
  },
  errorBanner: {
    background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C",
    borderRadius: 8, padding: "10px 14px", fontSize: 13,
    marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
  },
  retryBtn: {
    marginLeft: "auto", background: "none", border: "1px solid #FECACA",
    color: "#B91C1C", borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer",
  },
  statsRow: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: 12, marginBottom: 20,
  },
  statCard: {
    background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10,
    padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4,
  },
  statLabel: { fontSize: 11, fontWeight: 500, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px" },
  statValue: { fontSize: 24, fontWeight: 600, color: "#111827", lineHeight: 1.2 },
  tableCard: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" },
  tableTop: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px", borderBottom: "1px solid #F3F4F6", gap: 12, flexWrap: "wrap",
  },
  searchWrap: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8,
    padding: "7px 12px", flex: 1, maxWidth: 320,
  },
  searchInput: { border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#374151", width: "100%" },
  countBadge: { fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" },
  loadingState: { display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#F9FAFB" },
  th: {
    padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600,
    color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px",
    borderBottom: "1px solid #F3F4F6", whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #F9FAFB" },
  td: { padding: "12px 16px", fontSize: 13, color: "#374151", verticalAlign: "middle" },
  empty: { padding: "40px 16px", textAlign: "center", color: "#9CA3AF", fontSize: 13 },
  deleteBtn: {
    background: "none", border: "1px solid #E5E7EB", borderRadius: 6,
    padding: "5px 8px", cursor: "pointer", color: "#9CA3AF",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "color 0.15s, border-color 0.15s",
  },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: 16,
  },
  modal: {
    background: "#fff", borderRadius: 14, width: "100%", maxWidth: 560,
    maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  modalHeader: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    padding: "20px 24px", borderBottom: "1px solid #F3F4F6",
  },
  modalTitle: { fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 },
  modalSubtitle: { fontSize: 12, color: "#9CA3AF", marginTop: 3 },
  closeBtn: { background: "none", border: "none", fontSize: 16, color: "#9CA3AF", cursor: "pointer", padding: 4, lineHeight: 1 },
  modalBody: { padding: "20px 24px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, fontWeight: 500, color: "#374151" },
  input: {
    fontSize: 13, padding: "9px 12px", border: "1px solid #E5E7EB",
    borderRadius: 8, background: "#fff", color: "#111827",
    width: "100%", outline: "none", fontFamily: "inherit", transition: "border-color 0.15s",
    boxSizing: "border-box",
  },
  inputError: { borderColor: "#FCA5A5", background: "#FFF5F5" },
  errorMsg: { fontSize: 11, color: "#EF4444" },
  modalFooter: {
    display: "flex", justifyContent: "flex-end", gap: 8,
    padding: "14px 24px", borderTop: "1px solid #F3F4F6",
  },
  btnCancel: {
    padding: "9px 18px", fontSize: 13, background: "#fff",
    border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", color: "#6B7280",
  },
};
