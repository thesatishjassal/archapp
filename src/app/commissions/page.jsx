"use client";

import { useMemo, useState, useEffect } from "react";
import { toast, Toaster } from "sonner";

/* ─── LOADING OVERLAY ─── */
function LoadingOverlay({ message = "Please wait…" }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.45)", display: "flex",
      flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 16,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "2.5px solid rgba(255,255,255,0.2)",
        borderTopColor: "#fff",
        animation: "spin 0.75s linear infinite",
      }} />
      <p style={{ color: "#fff", fontSize: 13, fontWeight: 500, margin: 0 }}>{message}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─── FORMAT BUDGET ─── */
function formatBudget(val) {
  if (!val) return "—";
  const num = Number(val);
  if (isNaN(num)) return val;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString("en-IN")}`;
}

/* ─── REWARD CALCULATION ─── */
function calcReward(amount) {
  const num = Number(amount) || 0;
  const base = num * 0.05;
  let extra = 0;
  let bonusPct = 0;
  if (num >= 100000000)      { extra = base;       bonusPct = 100; }
  else if (num >= 75000000)  { extra = base * 0.5; bonusPct = 50;  }
  else if (num >= 50000000)  { extra = base * 0.3; bonusPct = 30;  }
  else if (num >= 30000000)  { extra = base * 0.2; bonusPct = 20;  }
  return { base, extra, total: base + extra, bonusPct, points: num };
}

const REWARD_PLANS = [
  { label: "3M",   threshold: 30000000,  bonus: 20 },
  { label: "5M",   threshold: 50000000,  bonus: 30 },
  { label: "7.5M", threshold: 75000000,  bonus: 50 },
  { label: "10M",  threshold: 100000000, bonus: 100 },
];

const STATUS_OPTIONS = ["Pending", "Received", "In Review"];

/* ══════════════════════════════════════════════════
   ADD COMMISSION MODAL — outside parent
══════════════════════════════════════════════════ */
function AddCommissionModal({ projects, onClose, onSave }) {
  const [form, setForm] = useState({
    partyName: "", projectId: "", status: "Pending",
  });

  const selectedProject = projects.find((p) => String(p.id) === String(form.projectId));
  const budget = Number(selectedProject?.budget) || 0;
  const reward = calcReward(budget);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.partyName || !form.projectId) {
      toast.error("Please fill in all required fields.");
      return;
    }
    onSave({
      partyName: form.partyName,
      project: selectedProject?.title || "—",
      totalAmount: budget,
      rewardPct: 5 + reward.bonusPct * 0.05,
      rewardAmount: Math.round(reward.total),
      status: form.status,
    });
  };

  return (
    <div className="modal__overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Add Reward Entry</h2>
        <form className="modal__form" onSubmit={handleSubmit}>

          <div className="modal__grid">
            <div className="modal__field" style={{ gridColumn: "1 / -1" }}>
              <label className="modal__label">Party Name *</label>
              <input className="modal__input" name="partyName" value={form.partyName} onChange={handleChange} placeholder="e.g. Sharma Family" required />
            </div>

            <div className="modal__field" style={{ gridColumn: "1 / -1" }}>
              <label className="modal__label">Select Project *</label>
              <select className="modal__input" name="projectId" value={form.projectId} onChange={handleChange} required>
                <option value="">— Choose a project —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}{p.budget ? ` · ${formatBudget(p.budget)}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal__field">
              <label className="modal__label">Status</label>
              <select className="modal__input" name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* LIVE PREVIEW */}
          {selectedProject && (
            <div className="modal__preview">
              <p className="modal__preview-title">Reward Preview</p>
              <div className="modal__preview-grid">
                <div className="modal__preview-item">
                  <span className="modal__label">Project Budget</span>
                  <strong>{formatBudget(budget)}</strong>
                </div>
                <div className="modal__preview-item">
                  <span className="modal__label">Base Reward (5%)</span>
                  <strong>{formatBudget(reward.base)}</strong>
                </div>
                <div className="modal__preview-item">
                  <span className="modal__label">Bonus</span>
                  <strong style={{ color: reward.extra > 0 ? "#1a6b3c" : "#b09070" }}>
                    {reward.extra > 0 ? `+${formatBudget(reward.extra)}` : "—"}
                  </strong>
                </div>
                <div className="modal__preview-item modal__preview-item--total">
                  <span className="modal__label">Total Reward</span>
                  <strong>{formatBudget(reward.total)}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal__btn">Save Reward Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function RewardsPage() {
  const [projects, setProjects]       = useState([]);
  const [architectId, setArchitectId] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [overlay, setOverlay]         = useState({ show: false, message: "" });
  const [modalOpen, setModalOpen]     = useState(false);
  const [entries, setEntries]         = useState([]);
  const [sliderAmount, setSliderAmount] = useState(1000000);
  const [filterStatus, setFilterStatus] = useState("All");

  const showOverlay = (msg) => setOverlay({ show: true, message: msg });
  const hideOverlay = () => setOverlay({ show: false, message: "" });

  /* ─── FETCH USER + PROJECTS ─── */
  useEffect(() => {
    const init = async () => {
      try {
        const localUser = JSON.parse(localStorage.getItem("arch_user"));
        if (!localUser?.email) { setLoading(false); return; }
        const res = await fetch("https://api.panvic.in/api/arch-register/");
        const result = await res.json();
        if (!result.success) { setLoading(false); return; }
        const currentUser = result.data.find((u) => u.email === localUser.email);
        if (!currentUser) { setLoading(false); return; }
        setArchitectId(currentUser.id);

        const pRes = await fetch(`https://api.panvic.in/api/projects/${currentUser.id}`);
        const pResult = await pRes.json();
        if (pResult.success) {
          const mapped = pResult.data.map((item) => ({
            id: item.id, title: item.title,
            budget: item.budget, client: item.client,
            status: item.status, location: item.location,
          }));
          setProjects(mapped);
          // Auto-seed entries from existing projects
          setEntries(mapped.filter((p) => p.budget).map((p, i) => {
            const r = calcReward(p.budget);
            return {
              id: `AUTO-${i + 1}`,
              partyName: p.client || "—",
              project: p.title,
              totalAmount: Number(p.budget),
              rewardPct: 5,
              rewardAmount: Math.round(r.total),
              status: p.status === "Completed" ? "Received" : "Pending",
            };
          }));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  /* ─── TOTALS ─── */
  const totalBudget      = projects.reduce((s, p) => s + (Number(p.budget) || 0), 0);
  const totalRewards     = entries.reduce((s, e) => s + (e.rewardAmount || 0), 0);
  const receivedRewards  = entries.filter((e) => e.status === "Received").reduce((s, e) => s + e.rewardAmount, 0);
  const pendingRewards   = entries.filter((e) => e.status === "Pending").reduce((s, e) => s + e.rewardAmount, 0);

  /* ─── SLIDER CALC ─── */
  const sliderCalc = useMemo(() => calcReward(sliderAmount), [sliderAmount]);

  /* ─── ADD ENTRY ─── */
  const handleSaveEntry = (entry) => {
    showOverlay("Saving entry…");
    setTimeout(() => {
      setEntries((prev) => [{
        ...entry,
        id: `#R${String(prev.length + 1).padStart(4, "0")}`,
      }, ...prev]);
      setModalOpen(false);
      hideOverlay();
      toast.success("Reward entry added!");
    }, 600);
  };

  /* ─── DELETE ENTRY ─── */
  const handleDelete = (id) => {
    if (!window.confirm("Remove this reward entry?")) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Entry removed.");
  };

  /* ─── STATUS CYCLE ─── */
  const cycleStatus = (id) => {
    setEntries((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      const idx = STATUS_OPTIONS.indexOf(e.status);
      return { ...e, status: STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length] };
    }));
  };

  const filteredEntries = filterStatus === "All"
    ? entries
    : entries.filter((e) => e.status === filterStatus);

  /* ──────────────── RENDER ──────────────── */
  return (
    <>
      <Toaster position="top-right" richColors toastOptions={{
        duration: 3000,
        style: { fontFamily: "inherit", fontSize: 13, borderRadius: 10, border: "1px solid #eeebe6", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
      }} />
      {overlay.show && <LoadingOverlay message={overlay.message} />}

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* ── PAGE ── */
        .rp { background: #f7f5f2; min-height: 100vh; font-family: 'DM Sans', sans-serif; }
        .rp__container { max-width: 1166px; margin: 0 auto; padding: 0 24px 48px; }

        /* ── TOP ── */
        .rp__top {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 28px 0 24px; gap: 16px; flex-wrap: wrap;
        }
        .rp__top-left { display: flex; flex-direction: column; gap: 4px; }
        .rp__tag {
          display: inline-block; font-size: 10.5px; font-weight: 600;
          color: #a08060; background: #faf8f5; border: 1px solid #eeebe6;
          border-radius: 20px; padding: 3px 12px; letter-spacing: 0.4px;
          text-transform: uppercase; margin-bottom: 6px;
        }
        .rp__title { font-size: 22px; font-weight: 700; color: #1a1714; margin: 0; line-height: 1.2; }
        .rp__subtitle { font-size: 13px; color: #8a7d72; margin: 0; }
        .rp__add-btn {
          height: 38px; padding: 0 20px; border-radius: 9px;
          background: #1a1714; color: #fff; font-size: 13px; font-weight: 600;
          font-family: inherit; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: background 0.15s; white-space: nowrap; align-self: flex-start; margin-top: 4px;
        }
        .rp__add-btn:hover { background: #2d2a26; }

        /* ── STAT CARDS ROW ── */
        .rp__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .rp__stat {
          background: #fff; border: 1px solid #eeebe6; border-radius: 12px;
          padding: 14px 16px; display: flex; flex-direction: column; gap: 4px;
        }
        .rp__stat-label { font-size: 10.5px; font-weight: 600; color: #b09070; text-transform: uppercase; letter-spacing: 0.5px; }
        .rp__stat-value { font-size: 20px; font-weight: 700; color: #1a1714; line-height: 1; }
        .rp__stat-value--green { color: #1a6b3c; }
        .rp__stat-value--amber { color: #8a6200; }
        .rp__stat-value--brown { color: #a08060; }

        /* ── TWO COL LAYOUT ── */
        .rp__body { display: grid; grid-template-columns: 1fr 340px; gap: 16px; margin-bottom: 24px; align-items: start; }

        /* ── CALCULATOR ── */
        .rp__calc {
          background: #fff; border: 1px solid #eeebe6; border-radius: 16px;
          padding: 22px 22px 20px; display: flex; flex-direction: column; gap: 18px;
        }
        .rp__calc-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .rp__calc-label { font-size: 10.5px; font-weight: 600; color: #b09070; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .rp__calc-amount { font-size: 24px; font-weight: 700; color: #1a1714; }
        .rp__calc-points {
          text-align: right; display: flex; flex-direction: column; gap: 1px;
        }
        .rp__calc-points-val { font-size: 18px; font-weight: 700; color: #a08060; }
        .rp__calc-points-label { font-size: 10.5px; font-weight: 600; color: #b09070; text-transform: uppercase; letter-spacing: 0.5px; }

        /* RANGE SLIDER */
        .rp__range {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 4px; border-radius: 2px;
          background: linear-gradient(
            to right,
            #1a1714 0%,
            #1a1714 calc((var(--val) - 100000) / (99999999 - 100000) * 100%),
            #eeebe6 calc((var(--val) - 100000) / (99999999 - 100000) * 100%),
            #eeebe6 100%
          );
          outline: none; cursor: pointer;
        }
        .rp__range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: #1a1714; border: 3px solid #fff;
          box-shadow: 0 0 0 1.5px #1a1714; cursor: pointer;
          transition: transform 0.15s;
        }
        .rp__range::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .rp__range::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #1a1714; border: 3px solid #fff;
          box-shadow: 0 0 0 1.5px #1a1714; cursor: pointer;
        }

        .rp__calc-cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .rp__calc-card {
          background: #faf8f5; border: 1px solid #f0ede8; border-radius: 10px;
          padding: 10px 12px; display: flex; flex-direction: column; gap: 3px;
        }
        .rp__calc-card--total {
          background: #1a1714; border-color: #1a1714;
        }
        .rp__calc-card--total .rp__calc-card-label { color: rgba(255,255,255,0.6); }
        .rp__calc-card--total .rp__calc-card-val { color: #fff; }
        .rp__calc-card-label { font-size: 9.5px; font-weight: 600; color: #b09070; text-transform: uppercase; letter-spacing: 0.5px; }
        .rp__calc-card-val { font-size: 15px; font-weight: 700; color: #1a1714; }

        /* ── REWARD TIERS ── */
        .rp__tiers {
          background: #fff; border: 1px solid #eeebe6; border-radius: 16px;
          padding: 20px; display: flex; flex-direction: column; gap: 0;
          overflow: hidden;
        }
        .rp__tiers-title {
          font-size: 13px; font-weight: 700; color: #1a1714; margin-bottom: 14px;
        }
        .rp__tier {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 12px; border-radius: 9px; margin-bottom: 6px;
          background: #faf8f5; border: 1px solid #f0ede8;
          transition: all 0.2s;
        }
        .rp__tier:last-child { margin-bottom: 0; }
        .rp__tier--active {
          background: #edf7f0; border-color: #c3e8d3;
        }
        .rp__tier-left { display: flex; flex-direction: column; gap: 2px; }
        .rp__tier-target { font-size: 14px; font-weight: 700; color: #1a1714; }
        .rp__tier-sublabel { font-size: 10px; font-weight: 600; color: #b09070; text-transform: uppercase; letter-spacing: 0.4px; }
        .rp__tier-bonus {
          font-size: 15px; font-weight: 700; color: #a08060;
          background: #fff; border: 1px solid #eeebe6;
          border-radius: 7px; padding: 4px 10px;
        }
        .rp__tier--active .rp__tier-bonus { color: #1e6e44; background: #edf7f0; border-color: #c3e8d3; }
        .rp__tier-check {
          width: 18px; height: 18px; border-radius: 50%;
          border: 1.5px solid #ddd8d0; display: flex; align-items: center;
          justify-content: center; margin-left: 8px; flex-shrink: 0;
        }
        .rp__tier--active .rp__tier-check {
          background: #1e6e44; border-color: #1e6e44;
        }

        /* ── TABLE SECTION ── */
        .rp__section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px; flex-wrap: wrap; gap: 10px;
        }
        .rp__section-title { font-size: 16px; font-weight: 700; color: #1a1714; margin: 0; }
        .rp__filters { display: flex; gap: 6px; }
        .rp__filter {
          height: 30px; padding: 0 13px; border-radius: 20px;
          font-size: 11.5px; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: all 0.15s;
          border: 1px solid #eeebe6; background: #fff; color: #8a7d72;
        }
        .rp__filter:hover { border-color: #c9b99a; color: #1a1714; }
        .rp__filter--active { background: #1a1714; color: #fff; border-color: #1a1714; }

        /* ── TABLE ── */
        .rp__table-wrap {
          background: #fff; border-radius: 16px; border: 1px solid #eeebe6; overflow: hidden;
        }
        .rp__table { width: 100%; border-collapse: collapse; }
        .rp__table thead tr { border-bottom: 1px solid #f0ede8; background: #faf8f5; }
        .rp__table th {
          padding: 11px 16px; font-size: 10.5px; font-weight: 600; color: #b09070;
          text-transform: uppercase; letter-spacing: 0.5px; text-align: left; white-space: nowrap;
        }
        .rp__table tbody tr { border-bottom: 1px solid #f7f5f2; transition: background 0.12s; }
        .rp__table tbody tr:last-child { border-bottom: none; }
        .rp__table tbody tr:hover { background: #faf8f5; }
        .rp__table td { padding: 13px 16px; font-size: 13px; color: #3d3530; vertical-align: middle; }

        /* ── TABLE BADGES ── */
        .rp__status {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.2px;
          cursor: pointer; transition: all 0.15s; border: 1px solid transparent;
          white-space: nowrap;
        }
        .rp__status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: rPulse 2s ease-in-out infinite; }
        @keyframes rPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .rp__status--received { background: #edf7f0; color: #1e6e44; border-color: #c3e8d3; }
        .rp__status--pending  { background: #fef9ec; color: #8a6200;  border-color: #f0dfa0; }
        .rp__status--review   { background: #f0f4ff; color: #2c4aad;  border-color: #c5d0f5; }

        /* ── REWARD AMOUNT ── */
        .rp__reward-val { font-size: 13px; font-weight: 700; color: #1a6b3c; }
        .rp__amount-val { font-size: 13px; font-weight: 600; color: #3d3530; }
        .rp__id { font-size: 12px; font-weight: 600; color: #a08060; font-variant-numeric: tabular-nums; }

        /* ── ACTION BUTTONS ── */
        .rp__btn {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 5px 10px; border-radius: 7px;
          font-size: 11px; font-weight: 600; font-family: inherit;
          cursor: pointer; border: 1px solid transparent; transition: all 0.14s;
        }
        .rp__btn--delete { background: #fff5f5; color: #c0392b; border-color: #f5c5c0; }
        .rp__btn--delete:hover { background: #fee8e8; }

        /* ── EMPTY STATE ── */
        .rp__empty {
          padding: 52px 24px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .rp__empty-icon {
          width: 50px; height: 50px; border-radius: 14px;
          background: #f5f2ed; border: 1px solid #eeebe6;
          display: flex; align-items: center; justify-content: center; color: #c5b49a; margin-bottom: 4px;
        }
        .rp__empty h4 { font-size: 15px; font-weight: 600; color: #3d3530; margin: 0; }
        .rp__empty p { font-size: 13px; color: #8a7d72; margin: 0; }

        /* ── LOADING ── */
        .rp__loading {
          padding: 52px 24px; text-align: center; font-size: 13px; color: #a08060;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .rp__loading-ring {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid #eeebe6; border-top-color: #a08060;
          animation: spin 0.75s linear infinite; flex-shrink: 0;
        }

        /* ── MODAL ── */
        .modal__overlay {
          position: fixed; inset: 0; z-index: 9998;
          background: rgba(0,0,0,0.4); display: flex; align-items: center;
          justify-content: center; padding: 16px; backdrop-filter: blur(2px);
        }
        .modal {
          background: #fff; border-radius: 16px; border: 1px solid #eeebe6;
          width: 100%; max-width: 440px; padding: 24px;
          max-height: 90vh; overflow-y: auto;
        }
        .modal--wide { max-width: 480px !important; }
        .modal__title {
          font-size: 17px; font-weight: 700; color: #1a1714;
          margin: 0 0 18px; padding-bottom: 14px; border-bottom: 1px solid #f0ede8;
        }
        .modal__form { display: flex; flex-direction: column; gap: 12px; }
        .modal__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .modal__field { display: flex; flex-direction: column; gap: 4px; }
        .modal__label { font-size: 10.5px; font-weight: 600; color: #b09070; text-transform: uppercase; letter-spacing: 0.5px; }
        .modal__input {
          width: 100%; height: 38px; background: #faf8f5; border: 1px solid #e8e3dc;
          border-radius: 9px; padding: 0 12px; font-size: 13.5px; color: #1a1714;
          font-family: inherit; outline: none; transition: border-color 0.15s, background 0.15s;
          box-sizing: border-box;
        }
        .modal__input:focus { border-color: #a08060; background: #fff; }
        .modal__actions {
          display: flex; gap: 8px; margin-top: 4px;
          padding-top: 14px; border-top: 1px solid #f0ede8;
        }
        .modal__btn {
          flex: 1; height: 38px; border-radius: 9px; font-size: 13px; font-weight: 600;
          font-family: inherit; cursor: pointer; border: 1px solid transparent;
          transition: all 0.15s; background: #1a1714; color: #fff;
          display: flex; align-items: center; justify-content: center;
        }
        .modal__btn:hover { background: #2d2a26; }
        .modal__btn--ghost { background: #fff; color: #1a1714; border-color: #ddd8d0; }
        .modal__btn--ghost:hover { background: #f7f5f2; }

        /* ── MODAL PREVIEW ── */
        .modal__preview {
          background: #faf8f5; border: 1px solid #f0ede8; border-radius: 10px; padding: 13px 14px;
        }
        .modal__preview-title { font-size: 10.5px; font-weight: 600; color: #b09070; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px; }
        .modal__preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .modal__preview-item { display: flex; flex-direction: column; gap: 2px; }
        .modal__preview-item strong { font-size: 13px; font-weight: 700; color: #1a1714; }
        .modal__preview-item--total { grid-column: 1 / -1; background: #fff; border: 1px solid #eeebe6; border-radius: 8px; padding: 8px 10px; }
        .modal__preview-item--total strong { color: #1a6b3c; font-size: 15px; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .rp__body { grid-template-columns: 1fr; }
          .rp__stats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .rp__stats { grid-template-columns: 1fr 1fr; }
          .rp__calc-cards { grid-template-columns: 1fr 1fr; }
          .rp__calc-card--total { grid-column: 1 / -1; }
          .rp__table th:nth-child(4), .rp__table td:nth-child(4),
          .rp__table th:nth-child(5), .rp__table td:nth-child(5) { display: none; }
        }
        @media (max-width: 480px) {
          .modal__grid { grid-template-columns: 1fr; }
          .rp__top { flex-direction: column; }
          .rp__add-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <section className="rp">
        <div className="rp__container">

          {/* TOP */}
          <div className="rp__top">
            <div className="rp__top-left">
              <span className="rp__tag">Architect Rewards</span>
              <h1 className="rp__title">Reward Points</h1>
              <p className="rp__subtitle">Track all client reward points, payments & status.</p>
            </div>
            <button className="rp__add-btn" onClick={() => setModalOpen(true)}>
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New Entry
            </button>
          </div>

          {/* STATS */}
          <div className="rp__stats">
            <div className="rp__stat">
              <span className="rp__stat-label">Total Projects Value</span>
              <span className="rp__stat-value rp__stat-value--brown">{formatBudget(totalBudget)}</span>
            </div>
            <div className="rp__stat">
              <span className="rp__stat-label">Total Rewards</span>
              <span className="rp__stat-value">{formatBudget(totalRewards)}</span>
            </div>
            <div className="rp__stat">
              <span className="rp__stat-label">Received</span>
              <span className="rp__stat-value rp__stat-value--green">{formatBudget(receivedRewards)}</span>
            </div>
            <div className="rp__stat">
              <span className="rp__stat-label">Pending</span>
              <span className="rp__stat-value rp__stat-value--amber">{formatBudget(pendingRewards)}</span>
            </div>
          </div>

          {/* CALCULATOR + TIERS */}
          <div className="rp__body">

            {/* CALCULATOR */}
            <div className="rp__calc">
              <div className="rp__calc-header">
                <div>
                  <p className="rp__calc-label">Total Order Value</p>
                  <p className="rp__calc-amount">₹{sliderAmount.toLocaleString("en-IN")}</p>
                </div>
                <div className="rp__calc-points">
                  <span className="rp__calc-points-val">{sliderAmount.toLocaleString("en-IN")}</span>
                  <span className="rp__calc-points-label">Reward Points</span>
                </div>
              </div>

              <input
                type="range" min="100000" max="99999999" step="100000"
                value={sliderAmount}
                style={{ "--val": sliderAmount }}
                onChange={(e) => setSliderAmount(Number(e.target.value))}
                className="rp__range"
              />

              <div className="rp__calc-cards">
                <div className="rp__calc-card">
                  <span className="rp__calc-card-label">Base Reward</span>
                  <span className="rp__calc-card-val">{formatBudget(sliderCalc.base)}</span>
                </div>
                <div className="rp__calc-card">
                  <span className="rp__calc-card-label">Extra Bonus</span>
                  <span className="rp__calc-card-val" style={{ color: sliderCalc.extra > 0 ? "#1a6b3c" : "#b09070" }}>
                    {sliderCalc.extra > 0 ? formatBudget(sliderCalc.extra) : "—"}
                  </span>
                </div>
                <div className="rp__calc-card rp__calc-card--total">
                  <span className="rp__calc-card-label">Total Earnings</span>
                  <span className="rp__calc-card-val">{formatBudget(sliderCalc.total)}</span>
                </div>
              </div>
            </div>

            {/* TIERS */}
            <div className="rp__tiers">
              <p className="rp__tiers-title">Bonus Tiers</p>
              {REWARD_PLANS.map((plan) => {
                const active = sliderAmount >= plan.threshold;
                return (
                  <div key={plan.label} className={`rp__tier${active ? " rp__tier--active" : ""}`}>
                    <div className="rp__tier-left">
                      <span className="rp__tier-target">₹{plan.label}</span>
                      <span className="rp__tier-sublabel">Target</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="rp__tier-bonus">+{plan.bonus}%</span>
                      <div className="rp__tier-check">
                        {active && (
                          <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TABLE */}
          <div className="rp__section-header">
            <h3 className="rp__section-title">
              Reward Entries
              <span style={{ marginLeft: 8, fontSize: 12, color: "#a08060", fontWeight: 600, background: "#faf8f5", border: "1px solid #eeebe6", borderRadius: 20, padding: "2px 10px" }}>
                {entries.length}
              </span>
            </h3>
            <div className="rp__filters">
              {["All", "Pending", "Received", "In Review"].map((f) => (
                <button key={f} className={`rp__filter${filterStatus === f ? " rp__filter--active" : ""}`} onClick={() => setFilterStatus(f)}>{f}</button>
              ))}
            </div>
          </div>

          <div className="rp__table-wrap">
            {loading ? (
              <div className="rp__loading">
                <div className="rp__loading-ring" />
                Loading reward entries…
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="rp__empty">
                <div className="rp__empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h4>No Entries Found</h4>
                <p>{filterStatus === "All" ? "Add your first reward entry." : `No entries with "${filterStatus}" status.`}</p>
              </div>
            ) : (
              <table className="rp__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Party Name</th>
                    <th>Project</th>
                    <th>Total Amount</th>
                    <th>Reward %</th>
                    <th>Reward ₹</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => {
                    const statusClass =
                      entry.status === "Received" ? "rp__status--received"
                      : entry.status === "In Review" ? "rp__status--review"
                      : "rp__status--pending";
                    return (
                      <tr key={entry.id}>
                        <td><span className="rp__id">{entry.id}</span></td>
                        <td style={{ fontWeight: 600, color: "#1a1714" }}>{entry.partyName}</td>
                        <td style={{ color: "#7a7068" }}>{entry.project}</td>
                        <td><span className="rp__amount-val">{formatBudget(entry.totalAmount)}</span></td>
                        <td style={{ color: "#a08060", fontWeight: 600 }}>5%</td>
                        <td><span className="rp__reward-val">{formatBudget(entry.rewardAmount)}</span></td>
                        <td>
                          <span
                            className={`rp__status ${statusClass}`}
                            onClick={() => cycleStatus(entry.id)}
                            title="Click to change status"
                          >
                            <span className="rp__status-dot" />
                            {entry.status}
                          </span>
                        </td>
                        <td>
                          <button className="rp__btn rp__btn--delete" onClick={() => handleDelete(entry.id)}>
                            <svg viewBox="0 0 16 16" fill="none" width="11" height="11">
                              <path d="M3 5h10M6 5V3h4v2M6 8v4M10 8v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                              <rect x="3" y="5" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                            </svg>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!loading && filteredEntries.length > 0 && (
            <p style={{ fontSize: 12, color: "#a08060", marginTop: 10, textAlign: "right" }}>
              Showing {filteredEntries.length} of {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </p>
          )}
        </div>

        {/* ADD MODAL */}
        {modalOpen && (
          <AddCommissionModal
            projects={projects}
            onClose={() => setModalOpen(false)}
            onSave={handleSaveEntry}
          />
        )}
      </section>
    </>
  );
}
