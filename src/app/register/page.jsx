"use client";

import { useState } from "react";

const INITIAL_FORM = {
  full_name: "",
  firm_name: "",
  mobile_number: "",
  email: "",
  date_of_birth: "",
  profession: "Architect",
  marital_status: "unmarried",
  anniversary_date: "",
  account_holder_name: "",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
  upi_id: "",
};

const ERROR_MESSAGES = {
  full_name: "Full name is required",
  firm_name: "Firm name is required",
  mobile_number: "Enter a valid 10-digit mobile number",
  email: "Enter a valid email address",
  account_holder_name: "Account holder name is required",
  bank_name: "Bank name is required",
  account_number: "Account number is required",
  ifsc_code: "IFSC code is required",
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [apiError, setApiError] = useState("");

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!form.full_name.trim()) newErrors.full_name = ERROR_MESSAGES.full_name;
      if (!form.firm_name.trim()) newErrors.firm_name = ERROR_MESSAGES.firm_name;
      if (!form.mobile_number.trim() || form.mobile_number.replace(/\D/g, "").length < 10)
        newErrors.mobile_number = ERROR_MESSAGES.mobile_number;
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        newErrors.email = ERROR_MESSAGES.email;
    }

    if (currentStep === 2) {
      if (!form.account_holder_name.trim()) newErrors.account_holder_name = ERROR_MESSAGES.account_holder_name;
      if (!form.bank_name.trim()) newErrors.bank_name = ERROR_MESSAGES.bank_name;
      if (!form.account_number.trim()) newErrors.account_number = ERROR_MESSAGES.account_number;
      if (!form.ifsc_code.trim()) newErrors.ifsc_code = ERROR_MESSAGES.ifsc_code;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(1)) {
      setStep(2);
    } else {
      showToast("error", "Please fix the errors below before continuing.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateStep(2)) {
      showToast("error", "Please fix the errors below before submitting.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        full_name: form.full_name,
        firm_name: form.firm_name,
        mobile_number: form.mobile_number,
        email: form.email,
        date_of_birth: form.date_of_birth || null,
        profession: form.profession,
        marital_status: form.marital_status,
        anniversary_date: form.marital_status === "married" ? form.anniversary_date || null : null,
        account_holder_name: form.account_holder_name,
        bank_name: form.bank_name,
        account_number: form.account_number,
        ifsc_code: form.ifsc_code,
        upi_id: form.upi_id || null,
      };

      const res = await fetch("https://api.panvic.in/api/arch-register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // non-JSON response
      }

      if (!res.ok) {
        // Handle field-level API errors (e.g. { email: ["Already registered."] })
        if (typeof data === "object" && !data.detail && !data.message) {
          const fieldErrors = {};
          let hasFieldErrors = false;
          for (const [key, val] of Object.entries(data)) {
            if (INITIAL_FORM.hasOwnProperty(key)) {
              fieldErrors[key] = Array.isArray(val) ? val[0] : val;
              hasFieldErrors = true;
            }
          }
          if (hasFieldErrors) {
            setErrors(fieldErrors);
            // If the field is in step 1, go back
            const step1Fields = ["full_name", "firm_name", "mobile_number", "email", "date_of_birth", "profession", "marital_status", "anniversary_date"];
            const hasStep1Error = Object.keys(fieldErrors).some((k) => step1Fields.includes(k));
            if (hasStep1Error) setStep(1);
            showToast("error", "Please fix the highlighted fields.");
            setLoading(false);
            return;
          }
        }

        const message =
          data.detail ||
          data.message ||
          (res.status === 409 ? "This email or mobile is already registered." : null) ||
          (res.status === 400 ? "Invalid data submitted. Please check your inputs." : null) ||
          (res.status === 500 ? "Server error. Please try again later." : null) ||
          "Registration failed. Please try again.";

        throw new Error(message);
      }

      setSuccess(true);
      localStorage.setItem("arch_user_verified", "true");
      localStorage.setItem(
        "arch_user",
        JSON.stringify({
          name: form.full_name,
          email: form.email,
          mobile: form.mobile_number,
          profession: form.profession,
          firm_name: form.firm_name,
        })
      );

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      console.error(err);
      const msg = err.message || "Something went wrong. Please try again.";
      setApiError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-root {
          min-height: 100vh;
          background: #f5f4f0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: 'DM Sans', sans-serif;
        }

        .reg-card {
          background: #fff;
          width: 100%;
          max-width: 480px;
          border-radius: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 8px 32px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        /* ── HEADER ── */
        .reg-header {
          padding: 2.5rem 2.5rem 0;
          border-bottom: 1px solid #f0ede8;
          padding-bottom: 1.75rem;
        }

        .reg-brand {
          font-family: 'DM Serif Display', serif;
          font-size: 1.5rem;
          color: #1a1a1a;
          letter-spacing: -0.02em;
          margin-bottom: 0.35rem;
        }

        .reg-subtitle {
          font-size: 0.8125rem;
          color: #888;
          font-weight: 400;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        /* ── PROGRESS ── */
        .reg-steps {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .reg-step-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #bbb;
          font-weight: 500;
        }

        .reg-step-pill.active { color: #1a1a1a; }
        .reg-step-pill.done { color: #888; }

        .reg-step-num {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #eee;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6875rem;
          font-weight: 600;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .reg-step-pill.active .reg-step-num {
          background: #1a1a1a;
          color: #fff;
        }

        .reg-step-pill.done .reg-step-num {
          background: #4caf50;
          color: #fff;
        }

        .reg-step-divider {
          flex: 1;
          height: 1px;
          background: #e8e5e0;
        }

        /* ── BODY ── */
        .reg-body {
          padding: 2rem 2.5rem 2.5rem;
        }

        .reg-section-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 1.25rem;
        }

        /* ── FIELD ── */
        .reg-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem 1rem;
          margin-bottom: 1.5rem;
        }

        .reg-field { display: flex; flex-direction: column; gap: 0.35rem; }
        .reg-field.full { grid-column: 1 / -1; }

        .reg-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #555;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .reg-label .req {
          color: #c0392b;
          font-size: 0.7rem;
          line-height: 1;
        }

        .reg-label .opt {
          color: #bbb;
          font-size: 0.65rem;
          font-weight: 400;
        }

        .reg-input, .reg-select {
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
          appearance: none;
        }

        .reg-input::placeholder { color: #c0bdb8; }

        .reg-input:focus, .reg-select:focus {
          border-color: #1a1a1a;
          background: #fff;
        }

        .reg-input.err { border-color: #c0392b; background: #fff8f7; }

        .reg-select-wrap {
          position: relative;
        }

        .reg-select-wrap::after {
          content: '';
          position: absolute;
          right: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid #888;
          pointer-events: none;
        }

        .reg-select { cursor: pointer; padding-right: 2rem; }

        .reg-error-msg {
          font-size: 0.7rem;
          color: #c0392b;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .reg-error-msg::before {
          content: '!';
          display: inline-flex;
          width: 13px; height: 13px;
          background: #c0392b;
          color: #fff;
          border-radius: 50%;
          font-size: 0.6rem;
          font-weight: 700;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── RADIO ── */
        .reg-radio-group {
          display: flex;
          gap: 1rem;
        }

        .reg-radio-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.875rem;
          color: #333;
          cursor: pointer;
        }

        .reg-radio-label input[type="radio"] {
          accent-color: #1a1a1a;
          width: 15px; height: 15px;
          cursor: pointer;
        }

        /* ── API ERROR BANNER ── */
        .reg-api-error {
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

        .reg-api-error-icon {
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: -1px;
        }

        /* ── ACTIONS ── */
        .reg-actions {
          display: flex;
          gap: 0.75rem;
          padding-top: 0.25rem;
        }

        .reg-btn {
          flex: 1;
          height: 44px;
          border: none;
          border-radius: 2px;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          letter-spacing: 0.01em;
        }

        .reg-btn-primary {
          background: #1a1a1a;
          color: #fff;
        }

        .reg-btn-primary:hover:not(:disabled) { background: #333; }
        .reg-btn-primary:disabled { background: #ccc; cursor: not-allowed; }

        .reg-btn-ghost {
          background: transparent;
          color: #666;
          border: 1.5px solid #ddd;
          flex: 0 0 auto;
          width: 80px;
        }

        .reg-btn-ghost:hover { border-color: #999; color: #333; }

        /* ── SPINNER ── */
        .reg-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── TOAST ── */
        .reg-toast {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.875rem 1.125rem;
          border-radius: 3px;
          font-size: 0.8125rem;
          font-family: 'DM Sans', sans-serif;
          max-width: 340px;
          line-height: 1.45;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          animation: slideIn 0.25s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .reg-toast.success { background: #1a1a1a; color: #fff; }
        .reg-toast.error   { background: #c0392b; color: #fff; }

        .reg-toast-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.6;
          flex-shrink: 0;
          margin-top: 4px;
        }

        /* ── SUCCESS ── */
        .reg-success {
          padding: 3rem 2.5rem;
          text-align: center;
        }

        .reg-success-icon {
          width: 56px; height: 56px;
          background: #1a1a1a;
          color: #fff;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          margin: 0 auto 1.25rem;
        }

        .reg-success h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 1.4rem;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .reg-success p {
          font-size: 0.875rem;
          color: #888;
        }

        .reg-redirect-bar {
          width: 100%;
          height: 2px;
          background: #eee;
          margin-top: 1.5rem;
          border-radius: 1px;
          overflow: hidden;
        }

        .reg-redirect-bar-fill {
          height: 100%;
          background: #1a1a1a;
          animation: fillBar 2s linear forwards;
        }

        @keyframes fillBar { from { width: 0; } to { width: 100%; } }

        @media (max-width: 520px) {
          .reg-header, .reg-body { padding-left: 1.5rem; padding-right: 1.5rem; }
          .reg-grid { grid-template-columns: 1fr; }
          .reg-field.full { grid-column: auto; }
        }
      `}</style>

      <div className="reg-root">
        {/* TOAST */}
        {toast.message && (
          <div className={`reg-toast ${toast.type}`}>
            <div className="reg-toast-dot" />
            <span>{toast.message}</span>
          </div>
        )}

        <div className="reg-card">
          {/* HEADER */}
          <div className="reg-header">
            <h1 className="reg-brand">Partner Registration</h1>
            <p className="reg-subtitle">
              Join as an Architect or Interior Designer to access your dashboard and referral rewards.
            </p>

            {/* STEP PROGRESS */}
            <div className="reg-steps">
              <div className={`reg-step-pill ${step === 1 ? "active" : "done"}`}>
                <div className="reg-step-num">{step > 1 ? "✓" : "1"}</div>
                Personal Info
              </div>
              <div className="reg-step-divider" />
              <div className={`reg-step-pill ${step === 2 ? "active" : ""}`}>
                <div className="reg-step-num">2</div>
                Bank Details
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="reg-body">
            {success ? (
              <div className="reg-success">
                <div className="reg-success-icon">✓</div>
                <h2>Registration Complete</h2>
                <p>Redirecting to your profile…</p>
                <div className="reg-redirect-bar">
                  <div className="reg-redirect-bar-fill" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <>
                    <p className="reg-section-label">Step 1 — Personal Information</p>
                    <div className="reg-grid">

                      <div className="reg-field">
                        <label className="reg-label">Full Name <span className="req">*</span></label>
                        <input
                          type="text"
                          name="full_name"
                          className={`reg-input ${errors.full_name ? "err" : ""}`}
                          placeholder="e.g. Raj Mehta"
                          value={form.full_name}
                          onChange={handleChange}
                          autoComplete="name"
                        />
                        {errors.full_name && <span className="reg-error-msg">{errors.full_name}</span>}
                      </div>

                      <div className="reg-field">
                        <label className="reg-label">Firm Name <span className="req">*</span></label>
                        <input
                          type="text"
                          name="firm_name"
                          className={`reg-input ${errors.firm_name ? "err" : ""}`}
                          placeholder="e.g. Mehta Designs"
                          value={form.firm_name}
                          onChange={handleChange}
                        />
                        {errors.firm_name && <span className="reg-error-msg">{errors.firm_name}</span>}
                      </div>

                      <div className="reg-field">
                        <label className="reg-label">Mobile Number <span className="req">*</span></label>
                        <input
                          type="tel"
                          name="mobile_number"
                          className={`reg-input ${errors.mobile_number ? "err" : ""}`}
                          placeholder="10-digit number"
                          value={form.mobile_number}
                          onChange={handleChange}
                          maxLength={15}
                          autoComplete="tel"
                        />
                        {errors.mobile_number && <span className="reg-error-msg">{errors.mobile_number}</span>}
                      </div>

                      <div className="reg-field">
                        <label className="reg-label">Email Address <span className="req">*</span></label>
                        <input
                          type="email"
                          name="email"
                          className={`reg-input ${errors.email ? "err" : ""}`}
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={handleChange}
                          autoComplete="email"
                        />
                        {errors.email && <span className="reg-error-msg">{errors.email}</span>}
                      </div>

                      <div className="reg-field">
                        <label className="reg-label">Date of Birth </label>
                        <input
                          type="date"
                          name="date_of_birth"
                          className="reg-input"
                          value={form.date_of_birth}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="reg-field">
                        <label className="reg-label">Profession <span className="req">*</span></label>
                        <div className="reg-select-wrap">
                          <select
                            name="profession"
                            className="reg-select"
                            value={form.profession}
                            onChange={handleChange}
                          >
                            <option value="Architect">Architect</option>
                            <option value="Interior Designer">Interior Designer</option>
                          </select>
                        </div>
                      </div>

                      <div className="reg-field full">
                        <label className="reg-label">Marital Status <span className="req">*</span></label>
                        <div className="reg-radio-group">
                          <label className="reg-radio-label">
                            <input
                              type="radio"
                              name="marital_status"
                              value="unmarried"
                              checked={form.marital_status === "unmarried"}
                              onChange={handleChange}
                            />
                            Unmarried
                          </label>
                          <label className="reg-radio-label">
                            <input
                              type="radio"
                              name="marital_status"
                              value="married"
                              checked={form.marital_status === "married"}
                              onChange={handleChange}
                            />
                            Married
                          </label>
                        </div>
                      </div>

                      {form.marital_status === "married" && (
                        <div className="reg-field">
                          <label className="reg-label">Anniversary Date <span className="opt">(optional)</span></label>
                          <input
                            type="date"
                            name="anniversary_date"
                            className="reg-input"
                            value={form.anniversary_date}
                            onChange={handleChange}
                          />
                        </div>
                      )}

                    </div>

                    <div className="reg-actions">
                      <button type="button" className="reg-btn reg-btn-primary" onClick={handleNext}>
                        Continue →
                      </button>
                    </div>
                  </>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <>
                    <p className="reg-section-label">Step 2 — Bank Details</p>

                    {/* API-level error banner */}
                    {apiError && (
                      <div className="reg-api-error">
                        <span className="reg-api-error-icon">⚠</span>
                        <span>{apiError}</span>
                      </div>
                    )}

                    <div className="reg-grid">

                      <div className="reg-field full">
                        <label className="reg-label">Account Holder Name <span className="req">*</span></label>
                        <input
                          type="text"
                          name="account_holder_name"
                          className={`reg-input ${errors.account_holder_name ? "err" : ""}`}
                          placeholder="As printed on your passbook"
                          value={form.account_holder_name}
                          onChange={handleChange}
                        />
                        {errors.account_holder_name && <span className="reg-error-msg">{errors.account_holder_name}</span>}
                      </div>

                      <div className="reg-field">
                        <label className="reg-label">Bank Name <span className="req">*</span></label>
                        <input
                          type="text"
                          name="bank_name"
                          className={`reg-input ${errors.bank_name ? "err" : ""}`}
                          placeholder="e.g. HDFC Bank"
                          value={form.bank_name}
                          onChange={handleChange}
                        />
                        {errors.bank_name && <span className="reg-error-msg">{errors.bank_name}</span>}
                      </div>

                      <div className="reg-field">
                        <label className="reg-label">Account Number <span className="req">*</span></label>
                        <input
                          type="text"
                          name="account_number"
                          className={`reg-input ${errors.account_number ? "err" : ""}`}
                          placeholder="Your bank account number"
                          value={form.account_number}
                          onChange={handleChange}
                          inputMode="numeric"
                        />
                        {errors.account_number && <span className="reg-error-msg">{errors.account_number}</span>}
                      </div>

                      <div className="reg-field">
                        <label className="reg-label">IFSC Code <span className="req">*</span></label>
                        <input
                          type="text"
                          name="ifsc_code"
                          className={`reg-input ${errors.ifsc_code ? "err" : ""}`}
                          placeholder="e.g. HDFC0001234"
                          value={form.ifsc_code}
                          onChange={handleChange}
                          maxLength={11}
                          style={{ textTransform: "uppercase" }}
                        />
                        {errors.ifsc_code && <span className="reg-error-msg">{errors.ifsc_code}</span>}
                      </div>

                      <div className="reg-field full">
                        <label className="reg-label">UPI ID <span className="opt">(optional)</span></label>
                        <input
                          type="text"
                          name="upi_id"
                          className="reg-input"
                          placeholder="e.g. name@upi"
                          value={form.upi_id}
                          onChange={handleChange}
                        />
                      </div>

                    </div>

                    <div className="reg-actions">
                      <button
                        type="button"
                        className="reg-btn reg-btn-ghost"
                        onClick={() => { setErrors({}); setApiError(""); setStep(1); }}
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="reg-btn reg-btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="reg-spinner" />
                            Submitting…
                          </>
                        ) : (
                          "Complete Registration"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
