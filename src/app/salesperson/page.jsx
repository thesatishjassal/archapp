"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://api.panvic.in/api";

function Spinner() {
  return <span className="spinner" />;
}

export default function AddSalesPersonPage() {
  const [loading, setLoading] = useState(false);
  const [architects, setArchitects] = useState([]);
  const [selectedArchitect, setSelectedArchitect] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    architecture_id: "",
    company_name: "",
  });

  useEffect(() => {
    fetchArchitects();
  }, []);

  const fetchArchitects = async () => {
    try {
      const response = await fetch("https://api.panvic.in/api/arch-register/");
      const result = await response.json();
      const architectsList = (result.data || []).filter(
        (arch) => arch.role !== "admin"
      );
      setArchitects(architectsList);
      console.log("Fetched architects:", architectsList);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load architects");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setFieldErrors({});

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        architecture_id: formData.architecture_id,
        company_name: formData.company_name,
      };

      const response = await fetch(`${API_BASE}/salespersons/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Parse error response
        const errors = {};
        let errorMessage = "";

        if (data.detail) {
          errorMessage = data.detail;
        } else if (typeof data === "object") {
          // Check for field-specific errors
          Object.keys(data).forEach((key) => {
            if (Array.isArray(data[key])) {
              errors[key] = data[key].join(", ");
            } else if (typeof data[key] === "string") {
              errors[key] = data[key];
            }
          });

          // Build error message from field errors
          if (Object.keys(errors).length > 0) {
            const errorMessages = Object.entries(errors).map(
              ([field, message]) => `${field}: ${message}`
            );
            errorMessage = errorMessages.join(" | ");
            setFieldErrors(errors);
          } else {
            errorMessage = "Something went wrong";
          }
        }
        console.error("Error response:", data);
        throw new Error(errorMessage);
      }

      toast.success("Sales person added successfully! 🎉");
      setFieldErrors({});

      setFormData({
        name: "",
        email: "",
        phone: "",
        architecture_id: "",
        company_name: "",
      });

      setSelectedArchitect("");
    } catch (error) {
      const errorMsg = error.message || "An error occurred";
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Block: page */
        .page {
          background: #f5f4f0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
          font-family: 'DM Sans', sans-serif;
        }

        /* Block: card */
        .card {
          width: 100%;
          max-width: 500px;
          background: #fff;
          border-radius: 2px;
          overflow: hidden;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.07),
            0 8px 32px rgba(0, 0, 0, 0.05);
        }

        /* Element: card__header */
        .card__header {
          padding: 1.5rem;
          border-bottom: 1px solid #f0ede8;
        }

        /* Element: card__title */
        .card__title {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #1a1a1a;
          margin-bottom: 0.4rem;
        }
      

        /* Element: card__subtitle */
        .card__subtitle {
          color: #999;
          font-size: 0.85rem;
        }

        /* Element: card__body */
        .card__body {
          padding: 2rem 2.5rem;
        }

        /* Block: row */
        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .row .field {
          margin-bottom: 0;
        }

        /* Block: field */
        .field {
          margin-bottom: 1.25rem;
        }

        /* Element: field__label */
        .field__label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #666;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* Element: field__input */
        .field__input {
          width: 100%;
          height: 44px;
          border: 1.5px solid #e5e2dc;
          background: #faf9f7;
          padding: 0 0.9rem;
          font-size: 0.9rem;
          outline: none;
          border-radius: 2px;
          transition: 0.2s;
          font-family: 'DM Sans', sans-serif;
        }

        .field__input:focus {
          border-color: #1a1a1a;
          background: #fff;
        }

        .field__input.field__input--error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .field__input.field__input--error:focus {
          border-color: #ef4444;
          background: #fff;
        }

        /* Element: field__error */
        .field__error {
          font-size: 0.75rem;
          color: #ef4444;
          margin-top: 0.4rem;
          font-weight: 500;
        }

        /* Block: btn */
        .btn {
          width: 100%;
          height: 46px;
          border: none;
          background: #1a1a1a;
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: 0.2s;
          margin-top: 1rem;
        }

        .btn:hover {
          background: #333;
        }

        /* Modifier: btn--disabled */
        .btn--disabled,
        .btn:disabled {
          background: #bcbcbc;
          cursor: not-allowed;
        }

        /* Block: spinner */
        .spinner {
          display: inline-block;
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spinner__rotate 0.7s linear infinite;
        }

        @keyframes spinner__rotate {
          to {
            transform: rotate(360deg);
          }
        }

        /* Toast Custom Styling */
        :global(.Toastify__toast-container) {
          padding: 0;
        }

        :global(.Toastify__toast) {
          font-family: 'DM Sans', sans-serif;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 1rem;
        }

        :global(.Toastify__toast--success) {
          background: #10b981;
        }

        :global(.Toastify__toast--error) {
          background: #ef4444;
        }

        :global(.Toastify__toast--warning) {
          background: #f59e0b;
        }

        :global(.Toastify__toast--info) {
          background: #3b82f6;
        }

        :global(.Toastify__toast-body) {
          color: white;
          font-weight: 500;
        }

        :global(.Toastify__progress-bar) {
          height: 3px;
        }
      `}</style>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="page">
        <div className="card">
          <div className="card__header">
            <h1 className="card__title">Add Sales Person</h1>
            <p className="card__subtitle">
              Create a new sales representative account.
            </p>
          </div>  

          <form onSubmit={handleSubmit}>
            <div className="card__body">
              {/* Row 1: Full Name + Email */}
              <div className="row">
                <div className="field">
                  <label className="field__label">Full Name</label>
                  <input
                    className={`field__input${
                      fieldErrors.name ? " field__input--error" : ""
                    }`}
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {fieldErrors.name && (
                    <div className="field__error">⚠️ {fieldErrors.name}</div>
                  )}
                </div>

                <div className="field">
                  <label className="field__label">Email Address</label>
                  <input
                    type="email"
                    className={`field__input${
                      fieldErrors.email ? " field__input--error" : ""
                    }`}
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {fieldErrors.email && (
                    <div className="field__error">⚠️ {fieldErrors.email}</div>
                  )}
                </div>
              </div>

              {/* Row 2: Phone + Company */}
              <div className="row">
                <div className="field">
                  <label className="field__label">Phone Number</label>
                  <input
                    className={`field__input${
                      fieldErrors.phone ? " field__input--error" : ""
                    }`}
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  {fieldErrors.phone && (
                    <div className="field__error">⚠️ {fieldErrors.phone}</div>
                  )}
                </div>

                <div className="field">
                  <label className="field__label">Company Name</label>
                  <input
                    className={`field__input${
                      fieldErrors.company_name ? " field__input--error" : ""
                    }`}
                    name="company_name"
                    placeholder="Panvik"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                  {fieldErrors.company_name && (
                    <div className="field__error">
                      ⚠️ {fieldErrors.company_name}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Architecture Name (full width) */}
              <div className="field">
                <label className="field__label">Architecture Name</label>
                <select
                  className={`field__input${
                    fieldErrors.architecture_id ? " field__input--error" : ""
                  }`}
                  name="architecture_id"
                  value={formData.architecture_id}
                  onChange={(e) => {
                    setSelectedArchitect(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      architecture_id: e.target.value,
                    }));
                  }}
                  required
                >
                  <option value="">Select Architect</option>
                  {architects.map((arch) => (
                    <option key={arch.id} value={arch.id}>
                      {arch.full_name}
                    </option>
                  ))}
                </select>
                {fieldErrors.architecture_id && (
                  <div className="field__error">
                    ⚠️ {fieldErrors.architecture_id}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`btn${loading ? " btn--disabled" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Creating...
                  </>
                ) : (
                  "Add Sales Person"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
