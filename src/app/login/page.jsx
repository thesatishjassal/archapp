"use client";

import { useState, useEffect, useRef } from "react";

const API_BASE = "https://api.panvic.in/api";

// ─── tiny helpers ────────────────────────────────────────────────────────────

function AlertBox({ type, message }) {
  if (!message) return null;

  const map = {
    error: {
      bg: "#FEF2F2",
      border: "#FECACA",
      color: "#991B1B",
      icon: "⚠",
    },
    success: {
      bg: "#F0FDF4",
      border: "#BBF7D0",
      color: "#166534",
      icon: "✓",
    },
    info: {
      bg: "#EEF2FF",
      border: "#C7D2FE",
      color: "#3730A3",
      icon: "ℹ",
    },
  };

  const t = map[type] || map.info;

  return (
    <div
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: "10px",
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        fontSize: "13.5px",
        color: t.color,
        marginBottom: "20px",
        lineHeight: 1.5,
      }}
    >
      <span style={{ flexShrink: 0, fontWeight: 600, fontSize: "14px" }}>
        {t.icon}
      </span>
      <span>{message}</span>
    </div>
  );
}

function Spinner({ color = "#fff" }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "15px",
        height: "15px",
        border: `2px solid ${color}33`,
        borderTop: `2px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function LoginPage() {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // timer
  const [seconds, setSeconds] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  const emailRef = useRef(null);
  const otpRef = useRef(null);

  // ── timer logic ────────────────────────────────────────────────────────────

  function startTimer() {
    clearInterval(timerRef.current);
    setSeconds(30);
    setTimerActive(true);

    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  // focus management
  useEffect(() => {
    if (step === 1) emailRef.current?.focus();
    if (step === 2) setTimeout(() => otpRef.current?.focus(), 80);
  }, [step]);

  // ── send otp ───────────────────────────────────────────────────────────────

  const sendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/arch-auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to send OTP");
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

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to resend OTP");
      }

      startTimer();
      setOtp("");
      otpRef.current?.focus();
    } catch (err) {
      setError(err.message || "Could not resend OTP.");
    }
  };

  // ── verify otp + login ─────────────────────────────────────────────────────

  const verifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      // 1. verify otp
      const otpRes = await fetch(`${API_BASE}/arch-auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const otpData = await otpRes.json().catch(() => ({}));

      if (!otpRes.ok) {
        throw new Error(
          otpData.detail || otpData.message || "Invalid or expired OTP"
        );
      }

      // 2. login
      // FastAPI Body(...) with `email: str` expects a raw JSON string, not an object
      const loginRes = await fetch(`${API_BASE}/arch-register/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      });

      const loginData = await loginRes.json();

      if (!loginData.success) {
        if (loginData.error === "USER_NOT_FOUND") {
          throw new Error(
            "No account found for this email. Please register first."
          );
        }
        if (loginData.error === "ACCOUNT_PENDING_APPROVAL") {
          throw new Error(
            "Your account is pending admin approval. You'll be notified once reviewed."
          );
        }
        throw new Error(loginData.message || "Login failed. Please try again.");
      }

      // 3. save & redirect
      clearInterval(timerRef.current);

      localStorage.setItem("arch_user", JSON.stringify(loginData.data));
      localStorage.setItem("arch_user_verified", "true");

      setSuccess(true);

      setTimeout(() => {
        window.location.href = "/profile";
      }, 1200);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── otp input: digits only ─────────────────────────────────────────────────

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  // ── keyboard shortcuts ─────────────────────────────────────────────────────

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") sendOtp();
  };

  const handleOtpKeyDown = (e) => {
    if (e.key === "Enter") verifyOtp();
  };

  // ── timer display ──────────────────────────────────────────────────────────

  const timerDisplay = `0:${String(seconds).padStart(2, "0")}`;

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display&display=swap');

        .lp-root * { box-sizing: border-box; }

        .lp-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F5F4F2;
          padding: 2rem 1rem;
          font-family: 'DM Sans', sans-serif;
        }

        .lp-card {
          background: #fff;
          border: 1px solid #E8E6E1;
          border-radius: 20px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          position: relative;
          overflow: hidden;
          animation: lp-fade-up 0.3s ease both;
        }

        .lp-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #534AB7, #1D9E75);
        }

        .lp-logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.75rem;
        }

        .lp-logo-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #EEEDFE;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
        }

        .lp-brand {
          font-family: 'DM Serif Display', serif;
          font-size: 18px;
          color: #1a1a1a;
          letter-spacing: -0.01em;
        }

        .lp-pips {
          display: flex;
          gap: 5px;
          margin-bottom: 1.75rem;
        }

        .lp-pip {
          height: 3px;
          flex: 1;
          border-radius: 2px;
          background: #E8E6E1;
          transition: background 0.3s;
        }

        .lp-pip.active { background: #534AB7; }

        .lp-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #1a1a1a;
          line-height: 1.2;
          margin-bottom: 6px;
        }

        .lp-sub {
          font-size: 14px;
          color: #6B6862;
          margin-bottom: 1.75rem;
          line-height: 1.55;
        }

        .lp-sub strong {
          color: #1a1a1a;
          font-weight: 500;
        }

        .lp-email-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #EEEDFE;
          color: #3C3489;
          border-radius: 40px;
          padding: 4px 12px 4px 8px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 1.25rem;
        }

        .lp-field { margin-bottom: 1.25rem; }

        .lp-label {
          display: block;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #6B6862;
          margin-bottom: 8px;
        }

        .lp-input {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          background: #FAFAF8;
          border: 1px solid #E0DDD8;
          border-radius: 10px;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .lp-input:focus {
          border-color: #7F77DD;
          box-shadow: 0 0 0 3px rgba(127, 119, 221, 0.12);
          background: #fff;
        }

        .lp-input-otp {
          letter-spacing: 0.4em;
          font-size: 22px;
          font-weight: 500;
          text-align: center;
        }

        .lp-otp-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #F5F4F2;
          border: 1px solid #E8E6E1;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 1.25rem;
          font-size: 13.5px;
        }

        .lp-otp-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1a1a1a;
        }

        .lp-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #1D9E75;
          animation: lp-pulse 1.5s ease infinite;
        }

        .lp-timer {
          font-variant-numeric: tabular-nums;
          font-weight: 500;
          color: #534AB7;
          font-size: 14px;
        }

        .lp-btn {
          width: 100%;
          height: 46px;
          border-radius: 10px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.15s;
        }

        .lp-btn-primary {
          background: #534AB7;
          color: #fff;
        }

        .lp-btn-primary:hover:not(:disabled) { background: #3C3489; }
        .lp-btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .lp-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .lp-btn-ghost {
          background: transparent;
          color: #6B6862;
          border: 1px solid #E0DDD8;
          margin-top: 10px;
        }

        .lp-btn-ghost:hover { background: #F5F4F2; color: #1a1a1a; }

        .lp-divider {
          height: 1px;
          background: #E8E6E1;
          margin: 1.5rem 0;
        }

        .lp-bottom {
          font-size: 13.5px;
          color: #6B6862;
          text-align: center;
        }

        .lp-bottom a {
          color: #534AB7;
          text-decoration: none;
          font-weight: 500;
        }

        .lp-bottom a:hover { text-decoration: underline; }

        .lp-resend-row {
          font-size: 13px;
          color: #6B6862;
          text-align: center;
          margin-top: 14px;
        }

        .lp-resend-btn {
          background: none;
          border: none;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s, opacity 0.15s;
        }

        .lp-resend-btn.active { color: #534AB7; }
        .lp-resend-btn.inactive { color: #aaa; cursor: not-allowed; }

        .lp-view { animation: lp-fade-up 0.2s ease both; }

        @keyframes lp-fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes lp-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="lp-root">
        <div className="lp-card">
          {/* accent stripe */}
          <div className="lp-accent" />

          {/* logo */}
          <div className="lp-logo-row">
            <div className="lp-logo-circle">🏛</div>
            <span className="lp-brand">Panvic</span>
          </div>

          {/* step pips */}
          <div className="lp-pips">
            <div className={`lp-pip ${step >= 1 ? "active" : ""}`} />
            <div className={`lp-pip ${step >= 2 ? "active" : ""}`} />
          </div>

          {/* ── STEP 1: email ── */}
          {step === 1 && (
            <div className="lp-view" key="email-view">
              <h1 className="lp-heading">Sign in</h1>
              <p className="lp-sub">
                Enter your email and we'll send a one-time password.
              </p>

              <AlertBox type="error" message={error} />

              <form onSubmit={sendOtp}>
                <div className="lp-field">
                  <label className="lp-label" htmlFor="lp-email">
                    Email address
                  </label>
                  <input
                    id="lp-email"
                    ref={emailRef}
                    className="lp-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleEmailKeyDown}
                    autoComplete="email"
                    required
                  />
                </div>

                <button
                  className="lp-btn lp-btn-primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner /> Sending…
                    </>
                  ) : (
                    "Send OTP →"
                  )}
                </button>
              </form>

              <div className="lp-divider" />
              <div className="lp-bottom">
                Don't have an account?{" "}
                <a href="/register">Register now</a>
              </div>
            </div>
          )}

          {/* ── STEP 2: otp ── */}
          {step === 2 && (
            <div className="lp-view" key="otp-view">
              <h1 className="lp-heading">Check your inbox</h1>
              <p className="lp-sub">
                We sent a 6-digit code to{" "}
                <strong>{email}</strong>
              </p>

              <div className="lp-email-chip">
                ✉ {email}
              </div>

              {/* otp sent status + timer */}
              {timerActive && (
                <div className="lp-otp-status">
                  <div className="lp-otp-left">
                    <div className="lp-dot" />
                    OTP sent to your inbox
                  </div>
                  <span className="lp-timer">{timerDisplay}</span>
                </div>
              )}

              {/* success */}
              {success && (
                <AlertBox type="success" message="Login successful — redirecting…" />
              )}

              {/* error */}
              {!success && <AlertBox type="error" message={error} />}

              <form onSubmit={verifyOtp}>
                <div className="lp-field">
                  <label className="lp-label" htmlFor="lp-otp">
                    One-time password
                  </label>
                  <input
                    id="lp-otp"
                    ref={otpRef}
                    className="lp-input lp-input-otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="······"
                    value={otp}
                    onChange={handleOtpChange}
                    onKeyDown={handleOtpKeyDown}
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                  />
                </div>

                <button
                  className="lp-btn lp-btn-primary"
                  type="submit"
                  disabled={loading || success}
                >
                  {loading ? (
                    <>
                      <Spinner /> Verifying…
                    </>
                  ) : (
                    "Verify & Sign in"
                  )}
                </button>
              </form>

              <button
                type="button"
                className="lp-btn lp-btn-ghost"
                onClick={() => {
                  setStep(1);
                  setError("");
                  setOtp("");
                  clearInterval(timerRef.current);
                  setTimerActive(false);
                }}
              >
                ← Change email
              </button>

              <div className="lp-resend-row">
                Didn't receive it?{" "}
                <button
                  type="button"
                  className={`lp-resend-btn ${timerActive ? "inactive" : "active"}`}
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
    </>
  );
}
