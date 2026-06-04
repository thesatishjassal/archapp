"use client";

import { useState, useEffect, useRef } from "react";

const API_BASE = "https://api.panvic.in/api";

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

  // ── timer ──────────────────────────────────────────────────────────────────

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
    if (step === 1) emailRef.current?.focus();
    if (step === 2) setTimeout(() => otpRef.current?.focus(), 80);
  }, [step]);

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
      const res = await fetch(`${API_BASE}/arch-auth/send-otp`, {
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
      const res = await fetch(`${API_BASE}/arch-auth/send-otp`, {
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
      const otpRes = await fetch(`${API_BASE}/arch-auth/verify-otp`, {
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
      const loginRes = await fetch(`${API_BASE}/arch-register/login`, {
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
          padding: 2.5rem 2.5rem 1.75rem;
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
        }

        /* ── STEP PIPS ── */
        .lg-pips {
          display: flex;
          gap: 4px;
          margin-top: 1.25rem;
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
          gap: 0.5rem;
          align-items: center;
          line-height: 1.4;
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
        .lg-input:focus { border-color: #1a1a1a; background: #fff; }
        .lg-input.err { border-color: #c0392b; background: #fff8f7; }

        .lg-input-otp {
          height: 52px;
          letter-spacing: 0.5em;
          font-size: 1.375rem;
          font-weight: 500;
          text-align: center;
          padding: 0 1rem;
        }

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
            <p className="lg-subtitle">Sign in to your architect Architecture account.</p>
            <div className="lg-pips">
              <div className={`lg-pip ${step >= 1 ? "active" : ""}`} />
              <div className={`lg-pip ${step >= 2 ? "active" : ""}`} />
            </div>
          </div>

          {/* BODY */}
          <div className="lg-body">

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
                    ✓ &nbsp;Login successful — redirecting to your profile…
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

          </div>
        </div>
      </div>
    </>
  );
}
