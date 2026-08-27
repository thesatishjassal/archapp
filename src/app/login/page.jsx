"use client";

import { useState, useEffect, useRef } from "react";

const API_BASE = "https://api.panvic.in";

// FastAPI returns plain {"detail": "..."} for things like 404s, but for
// pydantic validation failures (e.g. a malformed email, or an OTP that
// isn't exactly 6 digits) `detail` is an *array* of {loc, msg, type}
// objects instead of a string. Rendering that array directly in JSX
// throws, so this normalizes both shapes into a single readable string.
function extractApiError(data, fallback) {
  if (!data) return fallback;
  if (Array.isArray(data.detail)) {
    const msgs = data.detail.map((d) => d?.msg).filter(Boolean);
    if (msgs.length) return msgs.join(" ");
  }
  if (typeof data.detail === "string" && data.detail) return data.detail;
  if (typeof data.message === "string" && data.message) return data.message;
  return fallback;
}

// ── cookie helpers (used for the team/salesperson login instead of localStorage) ──
function setCookie(name, value, days = 7) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block",
      width: "15px", height: "15px",
      border: "2px solid rgba(255,255,255,0.25)",
      borderTop: "2px solid #fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

export default function LoginPage() {
  // ── existing-session detection ───────────────────────────────────────────
  // The Header is intentionally hidden on /login, so anyone who lands here
  // while already logged in (architect via localStorage, team via cookies)
  // would otherwise have no way to sign out. This surfaces that option.
  const [existingSession, setExistingSession] = useState(null); // null | { type, user }

  useEffect(() => {
    const archVerified = localStorage.getItem("arch_user_verified");
    if (archVerified === "true") {
      const raw = localStorage.getItem("arch_user");
      let parsed = null;
      try { parsed = raw ? JSON.parse(raw) : null; } catch {}
      setExistingSession({ type: "architect", user: parsed });
      return;
    }

    const teamVerified = getCookie("team_user_verified");
    if (teamVerified === "true") {
      const raw = getCookie("team_user");
      let parsed = null;
      try { parsed = raw ? JSON.parse(raw) : null; } catch {}
      setExistingSession({ type: "team", user: parsed });
    }
  }, []);

  const handleExistingLogout = () => {
    if (existingSession?.type === "architect") {
      localStorage.removeItem("arch_user_verified");
      localStorage.removeItem("arch_user");
    } else if (existingSession?.type === "team") {
      deleteCookie("team_user_verified");
      deleteCookie("team_user");
      deleteCookie("team_logged_in");
    }
    setExistingSession(null);
  };

  // ── which tab is active ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("architect"); // "architect" | "team"

  // ── architect (OTP) flow state ───────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);
  const emailRef = useRef(null);
  const otpRef = useRef(null);

  // ── team (email + OTP only — no password) flow state ─────────────────────
  const [teamStep, setTeamStep] = useState(1); // 1 = email, 2 = OTP
  const [teamEmail, setTeamEmail] = useState("");
  const [teamOtp, setTeamOtp] = useState("");
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [teamSuccess, setTeamSuccess] = useState(false);
  const [teamSeconds, setTeamSeconds] = useState(30);
  const [teamTimerActive, setTeamTimerActive] = useState(false);
  // Holds the salesperson record returned by the verify-otp API, e.g.:
  // { architecture_name: "", name: "Satish Jassal", email: "...", company_name: "Falcoon", id: 1, phone: "..." }
  const [teamUserData, setTeamUserData] = useState(null);
  const teamTimerRef = useRef(null);
  const teamEmailRef = useRef(null);
  const teamOtpRef = useRef(null);

  // ── timer (architect OTP) ────────────────────────────────────────────────

  function startTimer() {
    clearInterval(timerRef.current);
    setSeconds(30);
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { clearInterval(timerRef.current); setTimerActive(false); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    if (activeTab !== "architect") return;
    if (step === 1) emailRef.current?.focus();
    if (step === 2) setTimeout(() => otpRef.current?.focus(), 80);
  }, [step, activeTab]);

  useEffect(() => {
    if (activeTab === "team" && teamStep === 1) setTimeout(() => teamEmailRef.current?.focus(), 80);
    if (activeTab === "team" && teamStep === 2) setTimeout(() => teamOtpRef.current?.focus(), 80);
  }, [activeTab, teamStep]);

  function startTeamTimer() {
    clearInterval(teamTimerRef.current);
    setTeamSeconds(30);
    setTeamTimerActive(true);
    teamTimerRef.current = setInterval(() => {
      setTeamSeconds((s) => {
        if (s <= 1) { clearInterval(teamTimerRef.current); setTeamTimerActive(false); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => () => clearInterval(teamTimerRef.current), []);

  function switchTab(tab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    // clear cross-tab error noise so switching feels clean
    setError("");
    setTeamError("");
    if (tab === "architect") resetTeamFlow();
  }

  function resetTeamFlow() {
    setTeamStep(1);
    setTeamOtp("");
    setTeamError("");
    setTeamUserData(null);
    clearInterval(teamTimerRef.current);
    setTeamTimerActive(false);
  }

  // ── send otp ───────────────────────────────────────────────────────────────

  const sendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return; 
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/arch-auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        const msg =
          data.detail || data.message ||
          (res.status === 404 ? "No account found for this email. Please register first." : null) ||
          (res.status === 429 ? "Too many requests. Please wait before trying again." : null) ||
          "Failed to send OTP. Please try again.";
        throw new Error(msg);
      }
      setStep(2);
      startTimer();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── resend otp ─────────────────────────────────────────────────────────────

  const resendOtp = async () => {
    if (timerActive) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/arch-auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      let data = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) throw new Error(data.detail || data.message || "Failed to resend OTP.");
      startTimer();
      setOtp("");
      otpRef.current?.focus();
    } catch (err) {
      setError(err.message || "Could not resend OTP. Please try again.");
    }
  };

  // ── verify otp ─────────────────────────────────────────────────────────────

  const verifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!otp || otp.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      // 1. verify
      const otpRes = await fetch(`${API_BASE}/api/arch-auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      let otpData = {};
      try { otpData = await otpRes.json(); } catch {}
      if (!otpRes.ok) {
        const msg =
          otpData.detail || otpData.message ||
          (otpRes.status === 400 ? "Invalid OTP. Please check and try again." : null) ||
          (otpRes.status === 410 ? "OTP has expired. Please request a new one." : null) ||
          "Invalid or expired OTP.";
        throw new Error(msg);
      }

      // 2. login
      const loginRes = await fetch(`${API_BASE}/api/arch-register/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      });
      const loginData = await loginRes.json();

      if (!loginData.success) {
        const msg =
          loginData.error === "USER_NOT_FOUND"
            ? "No account found for this email. Please register first."
            : loginData.error === "ACCOUNT_PENDING_APPROVAL"
            ? "Your account is pending admin approval. You'll be notified once reviewed."
            : loginData.message || "Login failed. Please try again.";
        throw new Error(msg);
      }

      // 3. save
      clearInterval(timerRef.current);
      localStorage.setItem("arch_user", JSON.stringify(loginData.data));
      localStorage.setItem("arch_user_verified", "true");
      setSuccess(true);
      setTimeout(() => { window.location.href = "/profile"; }, 1500);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
    if (error) setError("");
  };

  const timerDisplay = `0:${String(seconds).padStart(2, "0")}`;

  // ── team login (salesperson email + OTP only — no password) ─────────────
  // Step 1 / resend -> POST /api/salespersons/send-otp/   (email)
  // Step 2          -> POST /api/salespersons/verify-otp/ (email, otp)
  //
  // verify-otp is expected to return a record shaped like:
  // {
  //   success: true,
  //   data: {
  //     architecture_name: "",
  //     name: "Satish Jassal",
  //     email: "codewithsatish@gmail.com",
  //     company_name: "Falcoon",
  //     id: 1,
  //     phone: "7888467258"
  //   }
  // }
  // We match the entered email against data.email returned by the API as a
  // sanity check, then store + display the matched salesperson record.
  //
  // Storage: the matched record is persisted to COOKIES (not localStorage)
  // as `team_user`, `team_user_verified`, `team_logged_in`, so it can also
  // be read server-side (e.g. in a Next.js middleware / API route) for the
  // /salesdashboard page.

  const teamSendOtp = async (e) => {
    e?.preventDefault();
    setTeamError("");

    if (!teamEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teamEmail)) {
      setTeamError("Please enter a valid email address.");
      return;
    }

    setTeamLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/salespersons/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: teamEmail }),
      });

      let data = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        // 422 here means pydantic rejected the body before it ever reached
        // SalesPersonController.send_otp (e.g. not a valid email format).
        throw new Error(extractApiError(data, "Failed to send OTP. Please try again."));
      }

      // Beyond this point res.ok is true (the controller always returns
      // HTTP 200) — the real success/failure signal is data.success, and
      // the only error code send_otp currently returns is USER_NOT_FOUND.
      if (!data.success) {
        const msg =
          data.error === "USER_NOT_FOUND"
            ? "No team account found for this email."
            : data.error === "ACCOUNT_PENDING_APPROVAL"
            ? "Your account is pending admin approval. You'll be notified once reviewed."
            : data.message || "Failed to send OTP. Please try again.";
        throw new Error(msg);
      }

      setTeamStep(2);
      startTeamTimer();
    } catch (err) {
      setTeamError(err.message || "Something went wrong. Please try again.");
    } finally {
      setTeamLoading(false);
    }
  };

  const teamResendOtp = async () => {
    if (teamTimerActive) return;
    setTeamError("");
    try {
      const res = await fetch(`${API_BASE}/api/salespersons/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: teamEmail }),
      });
      let data = {};
      try { data = await res.json(); } catch {}
      // FIX: was `!datac.success` (typo — `datac` is not defined, this
      // threw a ReferenceError the moment resend was pressed).
      if (!res.ok || !data.success) {
        throw new Error(extractApiError(data, "Failed to resend OTP."));
      }
      startTeamTimer();
      setTeamOtp("");
      teamOtpRef.current?.focus();
    } catch (err) {
      setTeamError(err.message || "Could not resend OTP. Please try again.");
    }
  };

  const teamVerifyOtp = async (e) => {
    e?.preventDefault();
    setTeamError("");

    if (!teamOtp || teamOtp.length < 6) {
      setTeamError("Please enter the complete 6-digit OTP.");
      return;
    }

    setTeamLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/salespersons/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // FIX: was `{ eail: teamEmail, otp: teamOtp }` — the typo'd `eail`
        // key meant the backend never received `email`, so pydantic
        // validation failed with "Field required" (the error you saw).
        body: JSON.stringify({ email: teamEmail, otp: teamOtp }),
      });

      let data = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        throw new Error(extractApiError(data, "Invalid or expired OTP."));
      }

      // SalesPersonController.verify_otp returns exactly one of these four
      // error codes on failure. USER_NOT_FOUND and OTP_NOT_REQUESTED mean
      // re-entering the OTP won't help, so send the user back to step 1
      // instead of leaving them stuck on the OTP field.
      if (!data.success) {
        if (data.error === "USER_NOT_FOUND" || data.error === "OTP_NOT_REQUESTED") {
          resetTeamFlow();
          setTeamError(
            data.error === "USER_NOT_FOUND"
              ? "No team account found for this email."
              : "Your OTP session expired. Please request a new code."
          );
          return;
        }

        const msg =
          data.error === "OTP_EXPIRED"
            ? "Your OTP has expired. Please request a new one."
            : data.error === "INVALID_OTP"
            ? "Incorrect OTP. Please check and try again."
            : data.message || "Invalid or expired OTP.";
        throw new Error(msg);
      }

      const record = data.data || {};

      // Sanity-check: the email on the matched salesperson record should
      // match what was typed in. If the API ever returns a record for a
      // different email, treat it as a mismatch rather than logging in.
      if (
        record.email &&
        record.email.trim().toLowerCase() !== teamEmail.trim().toLowerCase()
      ) {
        throw new Error("Account data did not match the email entered. Please try again.");
      }

      clearInterval(teamTimerRef.current);

      // Store the matched salesperson record in cookies (instead of
      // localStorage) so it's readable outside the browser JS context too.
      setCookie("team_user", JSON.stringify(record));
      setCookie("team_user_verified", "true");
      setCookie("team_logged_in", "true");

      setTeamUserData(record);
      setTeamSuccess(true);

      setTimeout(() => {
          window.location.href = "/salesdashboard";
      }, 1200);
    } catch (err) {
      setTeamError(err.message || "Something went wrong. Please try again.");
    } finally {
      setTeamLoading(false);
    }
  };

  const handleTeamOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setTeamOtp(val);
    if (teamError) setTeamError("");
  };

  const teamTimerDisplay = `0:${String(teamSeconds).padStart(2, "0")}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lg-root {
          min-height: 100vh;
          background: #f5f4f0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: 'DM Sans', sans-serif;
        }

        .lg-card {
          background: #fff;
          width: 100%;
          max-width: 420px;
          border-radius: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 8px 32px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        /* ── HEADER ── */
        .lg-header {
          padding: 2.5rem 2.5rem 0;
          border-bottom: 1px solid #f0ede8;
        }

        .lg-brand {
          font-family: 'DM Serif Display', serif;
          font-size: 1.5rem;
          color: #1a1a1a;
          letter-spacing: -0.02em;
          margin-bottom: 0.3rem;
        }

        .lg-subtitle {
          font-size: 0.8125rem;
          color: #999;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        /* ── EXISTING SESSION BANNER ── */
        .lg-session-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          background: #faf9f7;
          border: 1px solid #ede9e3;
          border-radius: 2px;
          padding: 0.625rem 0.875rem;
          margin-bottom: 1.25rem;
          font-size: 0.8125rem;
          color: #555;
        }

        .lg-session-logout {
          background: none;
          border: none;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: #c0392b;
          text-decoration: underline;
          text-underline-offset: 2px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .lg-session-logout:hover { color: #96281f; }

        /* ── TABS ── */
        .lg-tabs {
          display: flex;
          gap: 0.25rem;
        }

        .lg-tab {
          flex: 1;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #aaa;
          padding: 0 0 0.875rem;
          position: relative;
          transition: color 0.15s;
        }

        .lg-tab:hover { color: #555; }

        .lg-tab.active { color: #1a1a1a; }

        .lg-tab::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 2px;
          background: transparent;
          border-radius: 1px;
          transition: background 0.2s;
        }

        .lg-tab.active::after { background: #1a1a1a; }

        /* ── STEP PIPS ── */
        .lg-pips {
          display: flex;
          gap: 4px;
        }

        .lg-pip {
          height: 2px;
          flex: 1;
          border-radius: 1px;
          background: #e8e5e0;
          transition: background 0.3s;
        }
        .lg-pip.active { background: #1a1a1a; }

        /* ── BODY ── */
        .lg-body {
          padding: 2rem 2.5rem 2.5rem;
        }

        .lg-section-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 1.25rem;
        }

        /* ── ERROR BANNER ── */
        .lg-error {
          background: #fff5f5;
          border: 1px solid #fcc;
          border-radius: 2px;
          padding: 0.75rem 1rem;
          font-size: 0.8125rem;
          color: #c0392b;
          margin-bottom: 1.25rem;
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
          line-height: 1.4;
        }

        .lg-error-icon {
          flex-shrink: 0;
          font-size: 0.9rem;
          margin-top: 1px;
        }

        /* ── SUCCESS BANNER ── */
        .lg-success-banner {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 2px;
          padding: 0.75rem 1rem;
          font-size: 0.8125rem;
          color: #166534;
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          line-height: 1.4;
        }

        .lg-success-top {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .lg-success-meta {
          font-size: 0.75rem;
          color: #2f7a4f;
          padding-left: 1.4rem;
        }

        /* ── FIELD ── */
        .lg-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 1.25rem;
        }

        .lg-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #555;
        }

        .lg-input {
          width: 100%;
          height: 40px;
          padding: 0 0.875rem;
          border: 1.5px solid #e5e2dc;
          border-radius: 2px;
          font-size: 0.875rem;
          color: #1a1a1a;
          background: #faf9f7;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, background 0.15s;
          outline: none;
        }

        .lg-input::placeholder { color: #c0bdb8; }
        .lg-input:focus { border-color: #c0392b; background: #fff8f7; }

        .lg-input-otp {
          height: 52px;
          letter-spacing: 0.5em;
          font-size: 1.375rem;
          font-weight: 500;
          text-align: center;
          padding: 0 1rem;
        }

        /* ── PASSWORD FIELD ── */
        .lg-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .lg-input-wrap .lg-input { padding-right: 2.75rem; }

        .lg-eye-btn {
          position: absolute;
          right: 0.65rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: #999;
          padding: 4px 2px;
        }
        .lg-eye-btn:hover { color: #555; }

        /* ── OTP STATUS ── */
        .lg-otp-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #faf9f7;
          border: 1px solid #ede9e3;
          border-radius: 2px;
          padding: 0.625rem 0.875rem;
          margin-bottom: 1.25rem;
          font-size: 0.8125rem;
        }

        .lg-otp-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #555;
        }

        .lg-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #2ecc71;
          animation: pulse 1.5s ease infinite;
        }

        .lg-timer {
          font-variant-numeric: tabular-nums;
          font-weight: 600;
          color: #1a1a1a;
          font-size: 0.8125rem;
        }
        /* ── EMAIL CHIP ── */
        .lg-email-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f5f4f0;
          border: 1px solid #e5e2dc;
          border-radius: 2px;
          padding: 4px 10px;
          font-size: 0.8125rem;
          color: #333;
          margin-bottom: 1.25rem;
        }

        /* ── BUTTONS ── */
        .lg-btn {
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 2px;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.15s;
          letter-spacing: 0.01em;
        }

        .lg-btn-primary { background: #1a1a1a; color: #fff; }
        .lg-btn-primary:hover:not(:disabled) { background: #333; }
        .lg-btn-primary:disabled { background: #ccc; cursor: not-allowed; }

        .lg-btn-ghost {
          background: transparent;
          color: #666;
          border: 1.5px solid #ddd;
          margin-top: 0.625rem;
        }
        .lg-btn-ghost:hover { border-color: #999; color: #333; }

        /* ── DIVIDER ── */
        .lg-divider {
          height: 1px;
          background: #f0ede8;
          margin: 1.5rem 0;
        }

        /* ── FOOTER ── */
        .lg-footer {
          font-size: 0.8125rem;
          color: #999;
          text-align: center;
        }
        .lg-footer a { color: #1a1a1a; font-weight: 500; text-decoration: none; }
        .lg-footer a:hover { text-decoration: underline; }

        /* ── RESEND ── */
        .lg-resend {
          font-size: 0.8rem;
          color: #aaa;
          text-align: center;
          margin-top: 1rem;
        }

        .lg-resend-btn {
          background: none;
          border: none;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          text-decoration: underline;
          text-underline-offset: 2px;
          cursor: pointer;
          transition: color 0.15s;
        }
        .lg-resend-btn.can { color: #1a1a1a; }
        .lg-resend-btn.wait { color: #ccc; cursor: not-allowed; }

        /* ── VIEW ANIMATION ── */
        .lg-view {
          animation: fadeUp 0.2s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .lg-header, .lg-body { padding-left: 1.5rem; padding-right: 1.5rem; }
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-card">

          {/* HEADER */}
          <div className="lg-header">
            <h1 className="lg-brand">Architecture Portal</h1>
            <p className="lg-subtitle">
              {activeTab === "architect"
                ? "Sign in to your architect Architecture account."
                : "Sign in to your team account with a one-time code."}
            </p>

            {existingSession && (
              <div className="lg-session-banner">
                <span>
                  Signed in as{" "}
                  <strong>
                    {existingSession.type === "team"
                      ? existingSession.user?.name || "team member"
                      : existingSession.user?.full_name || "architect"}
                  </strong>
                  {existingSession.type === "team" ? " (team)" : ""}
                </span>
                <button
                  type="button"
                  className="lg-session-logout"
                  onClick={handleExistingLogout}
                >
                  Log out
                </button>
              </div>
            )}

            <div className="lg-tabs">
              <button
                type="button"
                className={`lg-tab ${activeTab === "architect" ? "active" : ""}`}
                onClick={() => switchTab("architect")}
              >
                Architect Login
              </button>
              <button
                type="button"
                className={`lg-tab ${activeTab === "team" ? "active" : ""}`}
                onClick={() => switchTab("team")}
              >
                Team Login
              </button>
            </div>

            {activeTab === "architect" && (
              <div className="lg-pips">
                <div className={`lg-pip ${step >= 1 ? "active" : ""}`} />
                <div className={`lg-pip ${step >= 2 ? "active" : ""}`} />
              </div>
            )}

            {activeTab === "team" && (
              <div className="lg-pips">
                <div className={`lg-pip ${teamStep >= 1 ? "active" : ""}`} />
                <div className={`lg-pip ${teamStep >= 2 ? "active" : ""}`} />
              </div>
            )}
          </div>

          {/* BODY */}
          <div className="lg-body">

            {/* ══════════════ ARCHITECT TAB (OTP) ══════════════ */}
            {activeTab === "architect" && (
              <>
                {/* ── STEP 1: Email ── */}
                {step === 1 && (
                  <div className="lg-view" key="email-view">
                    <p className="lg-section-label">Step 1 — Your Email</p>

                    {error && (
                      <div className="lg-error">
                        <span className="lg-error-icon">⚠</span>
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={sendOtp} noValidate>
                      <div className="lg-field">
                        <label className="lg-label" htmlFor="lg-email">Email Address</label>
                        <input
                          id="lg-email"
                          ref={emailRef}
                          className={`lg-input ${error ? "err" : ""}`}
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                          autoComplete="email"
                        />
                      </div>

                      <button className="lg-btn lg-btn-primary" type="submit" disabled={loading}>
                        {loading ? <><Spinner /> Sending OTP…</> : "Send OTP →"}
                      </button>
                    </form>

                    <div className="lg-divider" />
                    <div className="lg-footer">
                      Don't have an account? <a href="/register">Register now</a>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: OTP ── */}
                {step === 2 && (
                  <div className="lg-view" key="otp-view">
                    <p className="lg-section-label">Step 2 — Verify OTP</p>

                    <div className="lg-email-chip">✉ {email}</div>

                    {timerActive && (
                      <div className="lg-otp-status">
                        <div className="lg-otp-left">
                          <div className="lg-dot" />
                          OTP sent to your inbox
                        </div>
                        <span className="lg-timer">{timerDisplay}</span>
                      </div>
                    )}

                    {success && (
                      <div className="lg-success-banner">
                        <div className="lg-success-top">✓ &nbsp;Login successful — redirecting to your profile…</div>
                      </div>
                    )}

                    {error && !success && (
                      <div className="lg-error">
                        <span className="lg-error-icon">⚠</span>
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={verifyOtp} noValidate>
                      <div className="lg-field">
                        <label className="lg-label" htmlFor="lg-otp">One-Time Password</label>
                        <input
                          id="lg-otp"
                          ref={otpRef}
                          className={`lg-input lg-input-otp ${error ? "err" : ""}`}
                          type="text"
                          inputMode="numeric"
                          placeholder="······"
                          value={otp}
                          onChange={handleOtpChange}
                          maxLength={6}
                          autoComplete="one-time-code"
                        />
                      </div>

                      <button
                        className="lg-btn lg-btn-primary"
                        type="submit"
                        disabled={loading || success}
                      >
                        {loading ? <><Spinner /> Verifying…</> : "Verify & Sign In"}
                      </button>
                    </form>

                    <button
                      type="button"
                      className="lg-btn lg-btn-ghost"
                      onClick={() => {
                        setStep(1); setError(""); setOtp("");
                        clearInterval(timerRef.current); setTimerActive(false);
                      }}
                    >
                      ← Change email
                    </button>

                    <div className="lg-resend">
                      Didn't receive it?{" "}
                      <button
                        type="button"
                        className={`lg-resend-btn ${timerActive ? "wait" : "can"}`}
                        onClick={resendOtp}
                        disabled={timerActive}
                      >
                        Resend OTP {timerActive ? `(${timerDisplay})` : ""}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ══════════════ TEAM TAB (email + OTP, no password) ══════════════ */}
            {activeTab === "team" && (
              <>
                {/* ── STEP 1: Email ── */}
                {teamStep === 1 && (
                  <div className="lg-view" key="team-email-view">
                    <p className="lg-section-label">Step 1 — Your Email</p>

                    {teamError && (
                      <div className="lg-error">
                        <span className="lg-error-icon">⚠</span>
                        <span>{teamError}</span>
                      </div>
                    )}

                    <form onSubmit={teamSendOtp} noValidate>
                      <div className="lg-field">
                        <label className="lg-label" htmlFor="lg-team-email">Email Address</label>
                        <input
                          id="lg-team-email"
                          ref={teamEmailRef}
                          className={`lg-input ${teamError ? "err" : ""}`}
                          type="email"
                          placeholder="you@example.com"
                          value={teamEmail}
                          onChange={(e) => { setTeamEmail(e.target.value); if (teamError) setTeamError(""); }}
                          autoComplete="email"
                        />
                      </div>

                      <button className="lg-btn lg-btn-primary" type="submit" disabled={teamLoading}>
                        {teamLoading ? <><Spinner /> Sending OTP…</> : "Send OTP →"}
                      </button>
                    </form>

                    <div className="lg-divider" />
                    <div className="lg-footer">
                      Not a team member?{" "}
                      <a href="#" onClick={(e) => { e.preventDefault(); switchTab("architect"); }}>
                        Switch to Architect Login
                      </a>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: OTP ── */}
                {teamStep === 2 && (
                  <div className="lg-view" key="team-otp-view">
                    <p className="lg-section-label">Step 2 — Verify OTP</p>

                    <div className="lg-email-chip">✉ {teamEmail}</div>

                    {teamTimerActive && (
                      <div className="lg-otp-status">
                        <div className="lg-otp-left">
                          <div className="lg-dot" />
                          OTP sent to your inbox
                        </div>
                        <span className="lg-timer">{teamTimerDisplay}</span>
                      </div>
                    )}

                    {teamSuccess && (
                      <div className="lg-success-banner">
                        <div className="lg-success-top">✓ &nbsp;Login successful</div>
                        {teamUserData && (
                        <div className="lg-success-meta">
                            Welcome, {teamUserData.name}
                            <br />
                            {/* {teamUserData.email} */}
                            <br />
                            {/* {teamUserData.company_name} */}
                        </div>
                        )}
                      </div>
                    )}

                    {teamError && !teamSuccess && (
                      <div className="lg-error">
                        <span className="lg-error-icon">⚠</span>
                        <span>{teamError}</span>
                      </div>
                    )}

                    <form onSubmit={teamVerifyOtp} noValidate>
                   <div className="lg-field">
                        <label className="lg-label" htmlFor="lg-team-otp">One-Time Password</label>
                        <input
                          id="lg-team-otp"
                          ref={teamOtpRef}
                          className={`lg-input lg-input-otp ${teamError ? "err" : ""}`}
                          type="text"
                          inputMode="numeric"
                          placeholder="······"
                          value={teamOtp}
                          onChange={handleTeamOtpChange}
                          maxLength={6}
                          autoComplete="one-time-code"
                        />
                      </div>

                      <button
                        className="lg-btn lg-btn-primary"
                        type="submit"
                        disabled={teamLoading || teamSuccess}
                      >
                        {teamLoading ? <><Spinner /> Verifying…</> : "Verify & Sign In"}
                      </button>
                    </form>

                    <button
                      type="button"
                      className="lg-btn lg-btn-ghost"
                      onClick={resetTeamFlow}
                    >
                      ← Back
                    </button>
                    <div className="lg-resend">
                      Didn't receive it?{" "}
                      <button
                        type="button"
                        className={`lg-resend-btn ${teamTimerActive ? "wait" : "can"}`}
                        onClick={teamResendOtp}
                        disabled={teamTimerActive}
                      >
                        Resend OTP {teamTimerActive ? `(${teamTimerDisplay})` : ""}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
