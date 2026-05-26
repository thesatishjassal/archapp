'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

export default function Header() {
  const [open, setOpen] =
    useState(false);

  // DYNAMIC LOGIN STATE
  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const dropdownRef = useRef(null);

  // -------------------------
  // CHECK LOGIN
  // -------------------------

  useEffect(() => {
    const verified =
      localStorage.getItem(
        'arch_user_verified'
      );

    if (verified === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // -------------------------
  // OUTSIDE CLICK
  // -------------------------

  useEffect(() => {
    const handleClickOutside = (
      e
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  // -------------------------
  // LOGOUT
  // -------------------------

  const handleLogout = () => {
    localStorage.removeItem(
      'arch_user_verified'
    );

    setIsLoggedIn(false);

    window.location.href = '/login';
  };

  return (
    <header className="header">
      <div className="header__inner">

        {/* LOGO */}

        <a
          href="/"
          className="header__logo-wrap"
        >
          <img
            src="https://panvik.com/wp-content/uploads/2025/01/logo-removebg-preview.png"
            alt="Panvik Lighting"
            className="header__logo"
          />
        </a>

        {/* RIGHT */}

        <div className="header__right">

          {/* -------------------------
              NOT LOGGED IN
          ------------------------- */}

          {!isLoggedIn && (
            <div className="header__auth">

              <a
                href="/login"
                className="header__button header__button--light"
              >
                Login
              </a>

              <a
                href="/register"
                className="header__button"
              >
                Register
              </a>

            </div>
          )}

          {/* -------------------------
              LOGGED IN
          ------------------------- */}

          {isLoggedIn && (
            <div
              className="header__profile"
              ref={dropdownRef}
            >
              <button
                className="header__profile-btn"
                onClick={() =>
                  setOpen(!open)
                }
              >
                <div className="header__avatar">
                  S
                </div>

                <div className="header__profile-info">
                  <span className="header__name">
                    Satish
                  </span>

                  <span className="header__role">
                    Architect
                  </span>
                </div>

                <span
                  className={`header__arrow ${
                    open
                      ? 'active'
                      : ''
                  }`}
                >
                  ⌄
                </span>
              </button>

              {/* DROPDOWN */}

              <div
                className={`header__dropdown ${
                  open
                    ? 'active'
                    : ''
                }`}
              >
                <a
                  href="/profile"
                  className="header__dropdown-link"
                >
                  My Profile
                </a>

                <a
                  href="/dashboard"
                  className="header__dropdown-link"
                >
                  Dashboard
                </a>

                <a
                  href="/commissions"
                  className="header__dropdown-link"
                >
                  Reward Points
                </a>    <a
                  href="/myprojetcts"
                  className="header__dropdown-link"
                >
                  My Projetcts
                </a>

                <a
                  href="/settings"
                  className="header__dropdown-link"
                >
                  Settings
                </a>

                <button
                  onClick={
                    handleLogout
                  }
                  className="header__dropdown-link header__dropdown-link--logout"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}