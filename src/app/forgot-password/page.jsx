"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {

  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {

    e.preventDefault();

    setSuccess(true);

  };

  return (
    <>
      <section className="forgot">

        <div className="forgot__card">

          {/* TOP */}

          <div className="forgot__top">

            <div className="forgot__icon">
              ↺
            </div>

            <div>

              <h1 className="forgot__title">
                Reset Password
              </h1>

              <p className="forgot__subtext">
                Enter your registered email address
                to receive a password reset link.
              </p>

            </div>

          </div>

          {/* FORM */}

          <form
            className="forgot__form"
            onSubmit={handleSubmit}
          >

            <div className="forgot__field">

              <label className="forgot__label">
                Email Address
              </label>

              <input
                type="email"
                className="forgot__input"
                placeholder="Enter your email"
                required
              />

            </div>

            <button
              type="submit"
              className="forgot__button"
            >
              Send Reset Link
            </button>

          </form>

          {/* SUCCESS */}

          {success && (

            <div className="forgot__success active">

              Password reset link sent successfully.
              Please check your inbox.

            </div>

          )}

          {/* BOTTOM */}

          <div className="forgot__bottom">

            Remember your password?

            <a href="/login">
              Back to Login
            </a>

          </div>

        </div>

      </section>

    </>
  );
}