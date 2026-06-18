"use client";

import { useState, useEffect } from "react";

const API_BASE = "https://api.panvic.in";

function Spinner() {
  return <span className="spinner" />;
}

export default function AddSalesPersonPage() {
  const [loading, setLoading] = useState(false);
  const [architects, setArchitects] = useState([]);
  const [selectedArchitect, setSelectedArchitect] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    architecture_name: "",
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
    } catch (error) {
      console.error(error);
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

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        architecture_name: formData.architecture_name,
        company_name: formData.company_name,
      };

      console.log("Submitting payload:", payload);

      const response = await fetch(`${API_BASE}/salespersons/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Logs full FastAPI validation detail to console for debugging
        console.error("API error:", JSON.stringify(data, null, 2));
        const detail = Array.isArray(data.detail)
          ? data.detail.map((err) => `${err.loc?.join(".")} — ${err.msg}`).join("\n")
          : data.detail || "Something went wrong";
        throw new Error(detail);
      }

      alert("Sales Person Added Successfully");
      setFormData({
        name: "",
        email: "",
        phone: "",
        architecture_name: "",
        company_name: "",
      });
      setSelectedArchitect("");
    } catch (error) {
      alert(error.message);
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
          min-height: 100vh;
          background: #f5f4f0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          font-family: 'DM Sans', sans-serif;
        }

        /* Block: card */
        .card {
          width: 100%;
          max-width: 700px;
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
          font-size: 25px;
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
        }

        .field__input:focus {
          border-color: #1a1a1a;
          background: #fff;
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
      `}</style>

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
        className="field__input"
        name="name"
        placeholder="Enter full name"
        value={formData.name}
        onChange={handleChange}
        required
      />
    </div>

    <div className="field">
      <label className="field__label">Email Address</label>
      <input
        type="email"
        className="field__input"
        name="email"
        placeholder="john@example.com"
        value={formData.email}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  {/* Row 2: Phone + Company */}
  <div className="row">
    <div className="field">
      <label className="field__label">Phone Number</label>
      <input
        className="field__input"
        name="phone"
        placeholder="+91 9876543210"
        value={formData.phone}
        onChange={handleChange}
        required
      />
    </div>

    <div className="field">
      <label className="field__label">Company Name</label>
      <input
        className="field__input"
        name="company_name"
        placeholder="Panvik"
        value={formData.company_name}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  {/* Row 3: Architecture Name (full width) */}
  <div className="field">
    <label className="field__label">Architecture Name</label>
<select
  className="field__input"
  name="architecture_name"
  value={formData.architecture_name}
  onChange={(e) => {
    setSelectedArchitect(e.target.value);

    setFormData((prev) => ({
      ...prev,
      architecture_name: e.target.value,
    }));
  }}
  required
>
  <option value="">Select Architect</option>
  {architects.map((arch) => (
    <option key={arch.id} value={arch.full_name}>
      {arch.full_name}
    </option>
  ))}
</select>
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
