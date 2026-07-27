"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Config ────────────────────────────────────────────────
const API_BASE = "https://api.panvic.in";

// IDs here must match rows in ArchRegister with role = "sales_person"
// ⚠️  Update these IDs to the actual sales_person IDs in your DB
const SALESPERSONS = [
  { id: 1, name: "Chander" },
  { id: 2, name: "Sanjay" },
  { id: 3, name: "Manav" },
];

// ─── API helpers ───────────────────────────────────────────
async function fetchArchitects() {
  const res = await fetch(`${API_BASE}/api/arch-register/`);

  if (!res.ok) return [];

  const json = await res.json();

  return (json.data || []).filter(
    (item) => item.role === "architect"
  );
}
async function fetchReferencesBySales(salesPersonId) {
  const res = await fetch(`${API_BASE}/references/sales/${salesPersonId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `${res.status}`);
  }
  const json = await res.json();
  // Response shape: { success, sales_person_id, count, data: [...] }
  return Array.isArray(json) ? json : (json.data ?? []);
}

/**
 * Search architects by name from your ArchRegister table.
 * Assumes an endpoint like GET /arch/search?q=name or GET /arch?role=architect
 * ── Adjust the URL to whatever your actual "list architects" endpoint is ──
 */
async function searchArchitects(query = "") {
  const res = await fetch(`${API_BASE}/api/arch-register/`);

  if (!res.ok) return [];

  const json = await res.json();

  const architects = (json.data || []).filter(
    (item) =>
      item.role === "architect" &&
      item.full_name?.toLowerCase().includes(query.toLowerCase())
  );

  return architects;
}

/**
 * POST /references/sales/{sales_person_id}
 * Payload the API actually needs: { architect_id: number, notes?: string }
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
  const json = await res.json();
  return json.data ?? json;
}

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
    throw new Error(err?.detail || `Failed to update: ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

async function deleteReference(salesPersonId, referenceId) {
  const res = await fetch(
    `${API_BASE}/references/sales/${salesPersonId}/${referenceId}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to delete: ${res.status}`);
  }
  return null;
}

// ─── Normalise a raw reference row ─────────────────────────
// The API returns nested objects: ref.architect.full_name, ref.sales_person.full_name
function normalise(ref, fallbackSp) {
  const arch = ref.architect ?? {};
  const sp   = ref.sales_person ?? {};
  return {
    id:               ref.id,
    _sales_person_id: ref.sales_person_id ?? fallbackSp.id,
    architect_id:     ref.architect_id ?? arch.id,
    architect:        arch.full_name    ?? "—",
    architect_email:  arch.email        ?? "",
    architect_mobile: arch.mobile_number ?? "",
    architect_firm:   arch.firm_name    ?? "",
    sales_person:     sp.full_name      ?? fallbackSp.name,
    notes:            ref.notes         ?? "",
    added_at:         ref.added_at      ?? "",
    status:           ref.status        ?? "active",
  };
}

// ─── Utilities ─────────────────────────────────────────────
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
    <span style={{ width: size, height: size, borderRadius: "50%", background: bg, color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 600, flexShrink: 0 }}>
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
  const s = map[status] || map.active;
  return <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s.label}</span>;
}
function Spinner({ dark = false }) {
  return <span style={{ display: "inline-block", width: 13, height: 13, border: `2px solid ${dark ? "#ccc" : "#fff"}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite", flexShrink: 0 }} />;
}
function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Architect search-select dropdown ──────────────────────
function ArchitectPicker({ value, onChange, error }) {
  const [query, setQuery]     = useState(value?.full_name ?? "");
  const [results, setResults] = useState([]);
  const [open, setOpen]       = useState(false);
  const [busy, setBusy]       = useState(false);
  const timerRef              = useRef(null);
  const wrapRef               = useRef(null);
const [allArchitects, setAllArchitects] = useState([]);

useEffect(() => {
  fetchArchitects().then(setAllArchitects);
}, []);
  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

function handleInput(e) {
  const q = e.target.value;
  setQuery(q);
  onChange(null);

  if (q.length < 2) {
    setResults([]);
    setOpen(false);
    return;
  }

  const filtered = allArchitects.filter((a) =>
    a.full_name?.toLowerCase().includes(q.toLowerCase())
  );

  setResults(filtered);
  setOpen(true);
}

  function select(arch) {
    setQuery(arch.full_name);
    onChange(arch);
    setOpen(false);
    setResults([]);
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          style={{ ...styles.input, ...(error ? styles.inputError : {}), paddingRight: 32 }}
          placeholder="Type architect name to search…"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length && setOpen(true)}
          autoComplete="off"
        />
        <span style={{ position: "absolute", righ: 10, top: "50%", transform: "translateY(-50%)" }}>
          {busy ? <Spinner dark /> : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          )}
        </span>
      </div>

      {open && results.length > 0 && (
        <div style={styles.dropdown}>
           {results.map((a) => (
             <div key={a.id} style={styles.dropdownItem} onMouseDown={() => select(a)}>
              <Avatar name={a.full_name} index={a.id} size={28} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{a.full_name}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>{a.firm_name || a.email || ""}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && !busy && results.length === 0 && query.length >= 2 && (
        <div style={{ ...styles.dropdown, padding: "12px 14px", fontSize: 12, color: "#9CA3AF" }}>
          No architects found for "{query}"
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────
export default function ArchReferencePage() {
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [apiError,   setApiError]   = useState(null);
  const [open,       setOpen]       = useState(false);
  const [search,     setSearch]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const EMPTY_FORM = { architect: null, sales_person_id: "", notes: "" };
  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // ── Load all salesperson references in parallel ──────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const results = await Promise.all(
        SALESPERSONS.map((sp) =>
          fetchReferencesBySales(sp.id)
            .then((data) => data.map((ref) => normalise(ref, sp)))
            .catch((err) => {
              console.warn(`Skipped sp ${sp.id}:`, err.message);
              return [];
            })
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

  const filtered = rows.filter(
    (r) =>
      r.architect.toLowerCase().includes(search.toLowerCase()) ||
      r.sales_person.toLowerCase().includes(search.toLowerCase())
  );

  // ── Form ─────────────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!form.architect)       errs.architect      = "Select an architect";
    if (!form.sales_person_id) errs.sales_person_id = "Select a salesperson";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});
    try {
      const salesPersonId = Number(form.sales_person_id);
      // ✅ Send architect_id (integer) — exactly what the schema expects
      const payload = {
        architect_id: form.architect.id,
        notes: form.notes.trim() || undefined,
      };
      const newRef = await createReference(salesPersonId, payload);
      const sp = SALESPERSONS.find((s) => s.id === salesPersonId);
      setRows((prev) => [normalise(newRef, sp), ...prev]);
      setForm(EMPTY_FORM);
      setOpen(false);
    } catch (err) {
      setErrors({ _api: err.message });
    } finally {
      setSubmitting(false);
    }
  }

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

  function closeModal() { setOpen(false); setErrors({}); setForm(EMPTY_FORM); }

  // ── Render ───────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} tr:hover td{background:#FAFAFA}`}</style>

      {/* HEADER */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Architect References</h1>
          <p style={styles.pageSubtitle}>Track architects referred by your sales team</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.btnSecondary} onClick={loadAll} disabled={loading}>
            {loading ? <Spinner dark /> : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            )}
            Refresh
          </button>
          <button style={styles.btnPrimary} onClick={() => setOpen(true)}>+ Add Reference</button>
        </div>
      </div>

      {/* SALESPERSON ID WARNING */}
      <div style={styles.warnBanner}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>
          <strong>Before this works:</strong> update the <code>SALESPERSONS</code> array at the top of this file so each <code>id</code> matches a row in <code>ArchRegister</code> with <code>role = "sales_person"</code>. Current IDs 1/2/3 are getting 403 because those users are not salespersons in your DB.
        </span>
      </div>

      {/* API ERROR */}
      {apiError && (
        <div style={styles.errorBanner}>
          <strong>Could not load references:</strong> {apiError}
          <button style={styles.retryBtn} onClick={loadAll}>Retry</button>
        </div>
      )}

      {/* STATS */}
      <div style={styles.statsRow}>
        {[
          { label: "Total", value: rows.length },
          { label: "Active", value: rows.filter((r) => r.status === "active").length },
          { label: "Pending", value: rows.filter((r) => r.status === "pending").length },
          { label: "Salespersons", value: [...new Set(rows.map((r) => r.sales_person))].length },
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input style={styles.searchInput} placeholder="Search architect or salesperson…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span style={styles.countBadge}>{filtered.length} records</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={styles.loadingState}><Spinner dark /><span style={{ color: "#9CA3AF", fontSize: 13, marginLeft: 8 }}>Loading…</span></div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  {["ID", "Architect", "Firm", "Referred By", "Notes", "Date Added", "Status", ""].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={styles.empty}>No references found. Add your first one.</td></tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr key={row.id} style={styles.tr}>
                      <td style={{ ...styles.td, color: "#9CA3AF", fontFamily: "monospace", fontSize: 11 }}>#{row.id}</td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <Avatar name={row.architect} index={i} />
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13, color: "#111827" }}>{row.architect}</div>
                            {row.architect_email && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{row.architect_email}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ ...styles.td, fontSize: 12, color: "#6B7280" }}>{row.architect_firm || "—"}</td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <Avatar name={row.sales_person} index={i + 2} size={26} />
                          <span style={{ fontSize: 13, color: "#374151" }}>{row.sales_person}</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, maxWidth: 180 }}>
                        <span style={{ fontSize: 12, color: "#6B7280", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{row.notes || "—"}</span>
                      </td>
                      <td style={{ ...styles.td, fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>{formatDate(row.added_at)}</td>
                      <td style={styles.td}><StatusBadge status={row.status} /></td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <button style={styles.deleteBtn} onClick={() => handleDelete(row)} disabled={deletingId === row.id} title="Remove reference">
                          {deletingId === row.id ? <Spinner dark /> : (
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

      {/* MODAL */}
      {open && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Add Architect Reference</h2>
                <p style={styles.modalSubtitle}>Link a salesperson to an architect in the system</p>
              </div>
              <button style={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {errors._api && <div style={{ ...styles.errorBanner, marginBottom: 14 }}>{errors._api}</div>}

              <div style={styles.formGrid}>
                {/* Architect search-select */}
                <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Architect <span style={{ color: "#EF4444" }}>*</span></label>
                  <ArchitectPicker
                    value={form.architect}
                    onChange={(arch) => { setForm((f) => ({ ...f, architect: arch })); setErrors((e) => ({ ...e, architect: "" })); }}
                    error={!!errors.architect}
                  />
                  {errors.architect && <span style={styles.errorMsg}>{errors.architect}</span>}
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                    The architect must already be registered in the system (role = architect).
                  </span>
                </div>

                {/* Salesperson */}
                <div style={styles.field}>
                  <label style={styles.label}>Referred By <span style={{ color: "#EF4444" }}>*</span></label>
                  <select
                    style={{ ...styles.input, ...(errors.sales_person_id ? styles.inputError : {}) }}
                    value={form.sales_person_id}
                    onChange={(e) => { setForm((f) => ({ ...f, sales_person_id: e.target.value })); setErrors((er) => ({ ...er, sales_person_id: "" })); }}
                  >
                    <option value="">Select salesperson</option>
                    {SALESPERSONS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {errors.sales_person_id && <span style={styles.errorMsg}>{errors.sales_person_id}</span>}
                </div>

                {/* Notes */}
                <div style={styles.field}>
                  <label style={styles.label}>Notes</label>
                  <textarea
                    style={{ ...styles.input, resize: "vertical", minHeight: 72 }}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="How did they meet? Any project context…"
                  />
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnCancel} onClick={closeModal} disabled={submitting}>Cancel</button>
              <button
                style={{ ...styles.btnPrimary, opacity: submitting ? 0.75 : 1, display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={handleSubmit}
                disabled={submitting}
              >
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
  page: { minHeight: "100vh", background: "#F9FAFB", padding: "32px 28px", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
  pageHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 },
  pageTitle: { fontSize: 22, fontWeight: 600, color: "#111827", margin: 0 },
  pageSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", fontSize: 13, fontWeight: 600, background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap" },
  btnSecondary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", fontSize: 13, fontWeight: 500, background: "#fff", color: "#374151", border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer" },
  warnBanner: { background: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E", borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5 },
  errorBanner: { background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 },
  retryBtn: { marginLeft: "auto", background: "none", border: "1px solid #FECACA", color: "#B91C1C", borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 20 },
  statCard: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 },
  statLabel: { fontSize: 11, fontWeight: 500, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px" },
  statValue: { fontSize: 24, fontWeight: 600, color: "#111827", lineHeight: 1.2 },
  tableCard: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" },
  tableTop: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #F3F4F6", gap: 12, flexWrap: "wrap" },
  searchWrap: { display: "flex", alignItems: "center", gap: 8, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "7px 12px", flex: 1, maxWidth: 320 },
  searchInput: { border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#374151", width: "100%" },
  countBadge: { fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" },
  loadingState: { display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#F9FAFB" },
  th: { padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #F3F4F6", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #F9FAFB" },
  td: { padding: "12px 16px", fontSize: 13, color: "#374151", verticalAlign: "middle" },
  empty: { padding: "40px 16px", textAlign: "center", color: "#9CA3AF", fontSize: 13 },
  deleteBtn: { background: "none", border: "1px solid #E5E7EB", borderRadius: 6, padding: "5px 8px", cursor: "pointer", color: "#9CA3AF", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 },
  modal: { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #F3F4F6" },
  modalTitle: { fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 },
  modalSubtitle: { fontSize: 12, color: "#9CA3AF", marginTop: 3 },
  closeBtn: { background: "none", border: "none", fontSize: 16, color: "#9CA3AF", cursor: "pointer", padding: 4, lineHeight: 1 },
  modalBody: { padding: "20px 24px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, fontWeight: 500, color: "#374151" },
  input: { fontSize: 13, padding: "9px 12px", border: "1px solid #E5E7EB", borderRadius: 8, background: "#fff", color: "#111827", width: "100%", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
  inputError: { borderColor: "#FCA5A5", background: "#FFF5F5" },
  errorMsg: { fontSize: 11, color: "#EF4444" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 8, padding: "14px 24px", borderTop: "1px solid #F3F4F6" },
  btnCancel: { padding: "9px 18px", fontSize: 13, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", color: "#6B7280" },
  dropdown: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50, maxHeight: 220, overflowY: "auto" },
  dropdownItem: { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", cursor: "pointer", fontSize: 13, color: "#111827", transition: "background 0.1s" },
};
