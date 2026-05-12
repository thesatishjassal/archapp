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
                href="/register"
                className="auth__google"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303C33.659 32.657 29.24 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.219 0-9.627-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303C34.477 30.965 32.34 33.478 29.219 34.57l6.19 5.238C34.971 40.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>

                Continue with Google
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
                className="auth__register"
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