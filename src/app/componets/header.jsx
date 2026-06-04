'use client';

import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const verified = localStorage.getItem('arch_user_verified');
    if (verified === 'true') setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('arch_user_verified');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <>
      <style>{`
        .header {
          background: #fff;
          border-bottom: 1px solid #eeebe6;
          position: sticky;
          top: 0;
          z-index: 200;
        }
        .header__inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header__logo-wrap {
          display: flex;
          align-items: center;
          text-decoration: none;
          flex-shrink: 0;
        }
        .header__logo {
          height: 36px;
          width: auto;
          display: block;
        }
        .header__right {
          display: flex;
          align-items: center;
        }

        /* ── AUTH BUTTONS ── */
        .header__auth {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .header__button {
          height: 34px;
          padding: 0 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.15s;
          font-family: inherit;
          border: 1px solid transparent;
        }
        .header__button--light {
          background: #fff;
          color: #1a1714;
          border-color: #ddd8d0;
        }
        .header__button--light:hover {
          background: #f7f5f2;
          border-color: #c9b99a;
        }
        .header__button:not(.header__button--light) {
          background: #1a1714;
          color: #fff;
        }
        .header__button:not(.header__button--light):hover {
          background: #2d2a26;
        }

        /* ── PROFILE BUTTON ── */
        .header__profile {
          position: relative;
        }
        .header__profile-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          background: #fff;
          border: 1px solid #eeebe6;
          border-radius: 10px;
          padding: 5px 10px 5px 6px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          font-family: inherit;
        }
        .header__profile-btn:hover {
          background: #faf8f5;
          border-color: #ddd8d0;
        }
        .header__avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #f0ede8;
          border: 1px solid #ddd8d0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #6b5e50;
          flex-shrink: 0;
        }
        .header__profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1px;
        }
        .header__name {
          font-size: 13px;
          font-weight: 600;
          color: #1a1714;
          line-height: 1;
        }
        .header__role {
          font-size: 10.5px;
          color: #a08060;
          font-weight: 500;
          line-height: 1;
        }
        .header__arrow {
          font-size: 14px;
          color: #a08060;
          transition: transform 0.2s;
          display: inline-block;
          line-height: 1;
          margin-left: 2px;
        }
        .header__arrow.active {
          transform: rotate(180deg);
        }

        /* ── DROPDOWN ── */
        .header__dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: #fff;
          border: 1px solid #eeebe6;
          border-radius: 12px;
          padding: 6px;
          min-width: 180px;
          display: none;
          flex-direction: column;
          gap: 1px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          z-index: 300;
        }
        .header__dropdown.active {
          display: flex;
        }
        .header__dropdown-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #3d3530;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: background 0.12s, color 0.12s;
          width: 100%;
        }
        .header__dropdown-link:hover {
          background: #f7f5f2;
          color: #1a1714;
        }
        .header__dropdown-link--logout {
          color: #c0392b;
          margin-top: 2px;
          border-top: 1px solid #f0ede8;
          border-radius: 0 0 6px 6px;
          padding-top: 10px;
        }
        .header__dropdown-link--logout:hover {
          background: #fff5f5;
          color: #a93226;
        }
      `}</style>

      <header className="header">
        <div className="header__inner">

          {/* LOGO */}
          <a href="/" className="header__logo-wrap">
            <img
              src="https://panvik.com/wp-content/uploads/2025/01/logo-removebg-preview.png"
              alt="Panvik Lighting"
              className="header__logo"
            />
          </a>

          {/* RIGHT */}
          <div className="header__right">

            {/* NOT LOGGED IN */}
            {!isLoggedIn && (
              <div className="header__auth">
                <a href="/login" className="header__button header__button--light">Login</a>
                <a href="/register" className="header__button">Register</a>
              </div>
            )}

            {/* LOGGED IN */}
            {isLoggedIn && (
              <div className="header__profile" ref={dropdownRef}>
                <button
                  className="header__profile-btn"
                  onClick={() => setOpen(!open)}
                  aria-expanded={open}
                  aria-haspopup="true"
                >
                  <div className="header__avatar">S</div>
                  <div className="header__profile-info">
                    <span className="header__name">Satish</span>
                    <span className="header__role">Architect</span>
                  </div>
                  <span className={`header__arrow ${open ? 'active' : ''}`}>⌄</span>
                </button>

                <div className={`header__dropdown ${open ? 'active' : ''}`}>
                  <a href="/profile" className="header__dropdown-link">My Profile</a>
                  {/* <a href="/dashboard" className="header__dropdown-link">Dashboard</a> */}
                  <a href="/commissions" className="header__dropdown-link">Reward Points</a>
                  <a href="/myprojects" className="header__dropdown-link">My Projects</a>
                  {/* <a href="/settings" className="header__dropdown-link">Settings</a> */}
                  <button
                    onClick={handleLogout}
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
    </>
  );
}
