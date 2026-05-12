'use client';

import { useEffect, useRef, useState } from 'react';

export default function Header() {

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {

    const handleClickOutside = (e) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
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

  return (

    <>
    
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

            {/* AUTH */}

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

            {/* PROFILE */}

            <div
              className="header__profile"
              ref={dropdownRef}
            >

              <button
                className="header__profile-btn"
                onClick={() => setOpen(!open)}
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

                <span className="header__arrow">
                  ⌄
                </span>

              </button>

              {/* DROPDOWN */}

              <div
                className={`header__dropdown ${
                  open ? 'active' : ''
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
                  Commissions
                </a>

                <a
                  href="/settings"
                  className="header__dropdown-link"
                >
                  Settings
                </a>

                <a
                  href="/logout"
                  className="header__dropdown-link header__dropdown-link--logout"
                >
                  Logout
                </a>

              </div>

            </div>

          </div>

        </div>

      </header>

    </>

  );

}