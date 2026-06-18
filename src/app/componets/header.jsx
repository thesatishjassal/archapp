"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Hide header on homepage
  if (pathname === "/" || pathname === "/register" || pathname === "/login") {
    return null;
  }

  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verified = localStorage.getItem("arch_user_verified");

    if (verified === "true") {
      setIsLoggedIn(true);

      const userData = localStorage.getItem("arch_user");

      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    console.log("User data from localStorage:", user);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("arch_user_verified");
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  return (
    <>
      {/* Your existing styles */}
      <style>{`
        /* all your existing CSS here */
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
            {!isLoggedIn ? (
              <div className="header__auth">
                <a
                  href="/login"
                  className="header__button header__button--light"
                >
                  Login
                </a>

                <a href="/register" className="header__button">
                  Register
                </a>
              </div>
            ) : (
              <div className="header__profile" ref={dropdownRef}>
                <button
                  className="header__profile-btn"
                  onClick={() => setOpen(!open)}
                  aria-expanded={open}
                  aria-haspopup="true"
                >
                  <div className="header__avatar">
                    {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div className="header__profile-info">
                    <span className="header__name">
                      {user?.full_name || "User"}
                    </span>

                    <span className="header__role">
                      {user?.profession || "Sales Person "}
                    </span>
                  </div>

                  <span className={`header__arrow ${open ? "active" : ""}`}>
                    ⌄
                  </span>
                </button>

                <div className={`header__dropdown ${open ? "active" : ""}`}>
                  <a href="/profile" className="header__dropdown-link">
                    My Profile
                  </a>

                  <a href="/commissions" className="header__dropdown-link">
                    Reward Points
                  </a>

                  <a href="/projetcts" className="header__dropdown-link">
                    My Projects
                  </a>

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
