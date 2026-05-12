'use client';

import { useState } from 'react';

export default function LoginPage() {

  const [showPassword, setShowPassword] =
    useState(false);

  return (

    <>

      <section className="login">

        <div className="login__card">

          {/* TOP */}

          <div className="login__top">

            <div className="login__icon">
              ⌁
            </div>

            <div>

              <h1 className="login__heading">
                Login to Your Account
              </h1>

              <p className="login__subtext">
                Continue with Google or login using
                your email and password.
              </p>

            </div>

          </div>

          {/* GOOGLE */}

          <a
            href="/complete_profile"
            className="login__google"
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

          </a>

          {/* DIVIDER */}

          <div className="login__divider">

            <span></span>

            OR

            <span></span>

          </div>

          {/* FORM */}

          <form className="login__form">

            <div className="login__field">

              <label className="login__label">
                Email Address
              </label>

              <input
                type="email"
                className="login__input"
                placeholder="Enter email address"
              />

            </div>

            <div className="login__field">

              <label className="login__label">
                Password
              </label>

              <div className="login__input-wrap">

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  className="login__input"
                  placeholder="Enter password"
                />

                <span
                  className="login__toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? 'Hide'
                    : 'Show'}
                </span>

              </div>

            </div>

            {/* OPTIONS */}

            <div className="login__options">

              <label className="login__remember">

                <input type="checkbox" />

                Remember me

              </label>

              <a
                href="/forgot-password"
                className="login__forgot"
              >
                Forgot Password?
              </a>

            </div>

            {/* BUTTON */}

            <button className="login__button">
              Login
            </button>

          </form>

          {/* BOTTOM */}

          <div className="login__bottom">

            Don’t have an account?

            <a href="/register">
              Register Now
            </a>

          </div>

        </div>

      </section>


    </>

  );

}