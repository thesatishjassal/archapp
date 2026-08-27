"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Team/salesperson login is stored in cookies (see LoginPage.jsx); these
// mirror the helpers there so the header can read/clear the same values.
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export default function Header() {
  const pathname = usePathname();

  // FIX: all hooks now run unconditionally on every render. The previous
  // version called `return null` (for "/", "/register", "/login") BEFORE
  // useState/useEffect/useRef ran. Since `pathname` changes as you
  // navigate, React would call a different number of hooks between
  // renders — a Rules-of-Hooks violation that throws "Rendered more hooks
  // than during the previous render" the moment you leave one of those
  // pages for any other route.;
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // "architect" | "team"
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Architect login: localStorage (see LoginPage.jsx architect flow)
    const archVerified = localStorage.getItem("arch_user_verified");
    if (archVerified === "true") {
      setIsLoggedIn(true);
      setUserType("architect");
      const userData = localStorage.getItem("arch_user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
        }
      }
      return;
    }

    // Team / salesperson login: cookies (see LoginPage.jsx team flow)
    const teamVerified = getCookie("team_user_verified");  
    if (teamVerified === "true") {
      setIsLoggedIn(true);
      setUserType("team");
      const teamData = getCookie("team_user");
      if (teamData) {
        try {
          setUser(JSON.parse(teamData));
          console.log("Team user data:", teamData); // Debugging line
        } catch {
          setUser(null);
        }
      }
    }
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

  // Hide header on homepage / auth pages. Safe here now — it runs after
  // every hook above has already been called on every render.
  if (pathname === "/" || pathname === "/register" || pathname === "/login") {
    return null;
  }

  const handleLogout = () => {
    if (userType === "architect") {
      localStorage.removeItem("arch_user_verified");
      localStorage.removeItem("arch_user");
    } else if (userType === "team") {
      deleteCookie("team_user_verified");
      deleteCookie("team_user");
      deleteCookie("team_logged_in");
    }
    setIsLoggedIn(false);
    setUser(null);
    setUserType(null);
    window.location.href = "/login";
  };

  const displayName = userType === "team" ? user?.name : user?.full_name;
  const displayRole =
    userType === "team"
      ? user?.company_name || "Sales Person"
      : user?.profession || "Architect";

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

                <a
                  href="/team-login"
                  className="header__button header__button--light"
                >
                  Team Login
                </a>

                <a href="/register" className="header__button">
                  Register
                </a>

                <a href="/salesperson/" className="header__button">
                  Register as Team
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
                    {displayName?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div className="header__profile-info">
                    <span className="header__name">
                      {displayName || "User"}
                    </span>

                    <span className="header__role">{displayRole}</span>
                  </div>

                  <span className={`header__arrow ${open ? "active" : ""}`}>
                    ⌄
                  </span>
                </button>

                <div className={`header__dropdown ${open ? "active" : ""}`}>
                  {userType === "team" ? (
                    <>
                      <a
                        href="/salesdashboard"
                        className="header__dropdown-link"
                      >
                        Dashboard
                      </a>
                      {/* <a href="/commissions" className="header__dropdown-link">
                        Reward Points
                      </a> */}
                    </>
                  ) : (
                    <>
                      <a href="/profile" className="header__dropdown-link">
                        My Profile
                      </a>
                      <a href="/commissions" className="header__dropdown-link">
                        Reward Points
                      </a>
                      <a href="/projetcts" className="header__dropdown-link">
                        My Projects
                      </a>
                    </>
                  )}

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