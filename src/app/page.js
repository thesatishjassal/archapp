"use client";

import Link from "next/link";

export default function ArchitectPortal() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ap-root {
          min-height: 100vh;
          background: #f5f4f0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: 'DM Sans', sans-serif;
        }

        .ap-card {
          background: #fff;
          width: 100%;
          max-width: 420px;
          border-radius: 2px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 8px 32px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        /* ── HEADER ── */
        .ap-header {
          padding: 2.5rem 2.5rem 1.75rem;
          border-bottom: 1px solid #f0ede8;
        }

        .ap-brand {
          font-family: 'DM Serif Display', serif;
          font-size: 1.5rem;
          color: #1a1a1a;
          letter-spacing: -0.02em;
          margin-bottom: 0.3rem;
        }

        .ap-subtitle {
          font-size: 0.8125rem;
          color: #999;
          line-height: 1.55;
        }

        /* ── BODY ── */
        .ap-body {
          padding: 2rem 2.5rem 2.5rem;
        }

        .ap-section-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 1.25rem;
        }

        /* ── BUTTONS ── */
        .ap-btn {
          width: 100%;
          height: 44px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-decoration: none;
          transition: all 0.15s;
          letter-spacing: 0.01em;
          border: none;
        }

        .ap-btn-primary {
          background: #1a1a1a;
          color: #fff;
        }
        .ap-btn-primary:hover { background: #333; }

        .ap-btn-ghost {
          background: transparent;
          color: #444;
          border: 1.5px solid #ddd;
        }
        .ap-btn-ghost:hover { border-color: #999; color: #1a1a1a; }

        /* ── DIVIDER ── */
        .ap-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1.125rem 0;
          font-size: 0.75rem;
          font-weight: 500;
          color: #ccc;
          letter-spacing: 0.05em;
        }

        .ap-divider-line {
          flex: 1;
          height: 1px;
          background: #f0ede8;
        }

        /* ── PERKS ── */
        .ap-perks {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          margin-bottom: 1.75rem;
        }

        .ap-perk {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-size: 0.8125rem;
          color: #666;
        }

        .ap-perk-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #1a1a1a;
          flex-shrink: 0;
        }

        /* ── FOOTER ── */
        .ap-footer {
          margin-top: 1.25rem;
          font-size: 0.8rem;
          color: #bbb;
          text-align: center;
          line-height: 1.5;
        }

        .ap-footer a {
          color: #888;
          text-decoration: none;
          font-weight: 500;
        }
        .ap-footer a:hover { color: #1a1a1a; }

        @media (max-width: 480px) {
          .ap-header, .ap-body { padding-left: 1.5rem; padding-right: 1.5rem; }
        }
      `}</style>

      <div className="ap-root">
        <div className="ap-card">

          {/* HEADER */}
          <div className="ap-header">
            <h1 className="ap-brand">Partner Portal</h1>
            <p className="ap-subtitle">
              Rewards, projects, and payouts — all in one place for architects and interior designers.
            </p>
          </div>

          {/* BODY */}
          <div className="ap-body">
            {/* <p className="ap-section-label">What you get</p>

            <div className="ap-perks">
              <div className="ap-perk"><div className="ap-perk-dot" /> Track referral reward points in real time</div>
              <div className="ap-perk"><div className="ap-perk-dot" /> View order history and project status</div>
              <div className="ap-perk"><div className="ap-perk-dot" /> Manage bank details and request payouts</div>
              <div className="ap-perk"><div className="ap-perk-dot" /> Exclusive architect & designer pricing</div>
            </div> */}

            <Link href="/login" className="ap-btn ap-btn-primary">
              Sign In
            </Link>

            <div className="ap-divider">
              <div className="ap-divider-line" />
              NEW HERE
              <div className="ap-divider-line" />
            </div>

            <Link href="/register" className="ap-btn ap-btn-ghost">
              Create an Account
            </Link>

            <div className="ap-footer">
              For architects &amp; interior designers only.<br />
              Need help? <a href="mailto:support@panvik.com">support@panvik.com</a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
