"use client";

import Image from "next/image";
import Link from "next/link";

export default function ArchitectPortal() {
  return (
    <>
      <section className="auth">
        <div className="auth__card">
          {/* LEFT */}

          <div className="auth__left">
            <div className="auth__content">
              <div className="auth__logo-wrap">
                <img
                  src="https://panvik.com/wp-content/uploads/2025/01/logo-removebg-preview.png"
                  alt="Panvik Lighting"
                  className="auth__logo"
                />
              </div>

              <h1 className="auth__title">
                Join The Partner Portal
              </h1>

              <p className="auth__desc">
                Access Reward Points, orders and payouts
                from one clean dashboard experience.
              </p>
            </div>

            <div className="auth__circle auth__circle--one"></div>
            <div className="auth__circle auth__circle--two"></div>
          </div>

          {/* RIGHT */}

          <div className="auth__right">
            <div className="auth__inner">
              <div className="auth__top">
                <h2 className="auth__heading">
                  Create your account
                </h2>

                <p className="auth__text">
                  Continue with Google or register manually
                  to start your onboarding process.
                </p>
              </div>

              {/* GOOGLE */}

              <Link
                href="/login"
                className="auth__google"
              >
                Login
              </Link>

              {/* DIVIDER */}

              <div className="auth__divider">
                <span></span>
                OR
                <span></span>
              </div>

              {/* BUTTON */}

              <Link
                href="/register"
                className="auth__register"k
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}