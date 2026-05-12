"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [active, setActive] = useState("account");

  return (
    <div className="ig">

      {/* LEFT NAV */}
      <aside className="ig__sidebar">

        <h2 className="ig__logo">Settings</h2>

        <button
          className={active === "account" ? "active" : ""}
          onClick={() => setActive("account")}
        >
          Account
        </button>

        <button
          className={active === "security" ? "active" : ""}
          onClick={() => setActive("security")}
        >
          Security
        </button>

        <button
          className={active === "privacy" ? "active" : ""}
          onClick={() => setActive("privacy")}
        >
          Privacy
        </button>

        <button
          className={active === "danger" ? "active dangerText" : "dangerText"}
          onClick={() => setActive("danger")}
        >
          Delete Account
        </button>

      </aside>

      {/* CONTENT */}
      <main className="ig__content">

        {/* ACCOUNT */}
        {active === "account" && (
          <section className="ig__card">

            <h3>Account Information</h3>

            <div className="ig__row">
              <label>Name</label>
              <input placeholder="Your name" />
            </div>

            <div className="ig__row">
              <label>Email</label>
              <input placeholder="email@example.com" />
            </div>

            <div className="ig__row">
              <label>Phone</label>
              <input placeholder="+91 XXXXX XXXXX" />
            </div>

            <button className="ig__btn">Save Changes</button>

          </section>
        )}

        {/* SECURITY */}
        {active === "security" && (
          <section className="ig__card">

            <h3>Security</h3>

            <div className="ig__row">
              <label>Current Password</label>
              <input type="password" />
            </div>

            <div className="ig__row">
              <label>New Password</label>
              <input type="password" />
            </div>

            <div className="ig__row">
              <label>Confirm Password</label>
              <input type="password" />
            </div>

            <button className="ig__btn">Update Password</button>

          </section>
        )}

        {/* PRIVACY */}
        {active === "privacy" && (
          <section className="ig__card">

            <h3>Privacy</h3>

            <div className="ig__switch">
              <span>Profile Visibility</span>
              <input type="checkbox" />
            </div>

            <div className="ig__switch">
              <span>Show Activity Status</span>
              <input type="checkbox" />
            </div>

            <div className="ig__switch">
              <span>Allow Messages</span>
              <input type="checkbox" />
            </div>

          </section>
        )}

        {/* DANGER */}
        {active === "danger" && (
          <section className="ig__card danger">

            <h3>Delete Account</h3>

            <p>
              Once deleted, all your commissions, projects and data will be permanently removed.
            </p>

            <button className="ig__dangerBtn">
              Delete My Account
            </button>

          </section>
        )}

      </main>

    </div>
  );
}