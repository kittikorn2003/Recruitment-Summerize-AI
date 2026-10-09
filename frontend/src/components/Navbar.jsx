import React, { useState } from "react";
import "./Navbar.css";
import logo from "../assets/LOGO.png";
import { useNavigate } from "react-router-dom";

function Navbar({
  onSignInClick,
  user,
  onLogout,
  onUploadClick,
  onUploadProfileClick,
}) {
  const [isDropdown, setIsDropDown] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="rm-navbar">
      <div className="rm-navbar-inner">

        {/* Logo */}
        <div
          className="rm-logo"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="ResuMatch" className="rm-logo-image" />
        </div>

        {/* Navigation */}
        <nav className="rm-nav-links">

          <button
            className="rm-nav-link"
            onClick={() => navigate("/search")}
          >
            SearchCandidates 
          </button>
          <button
            className="rm-nav-link"
            onClick={() => navigate("/role-request")}
          >
            Request HR 
          </button>

          <a href="/#process" className="rm-nav-link">
            How it works
          </a>

          <a href="/#pricing" className="rm-nav-link">
            Pricing
          </a>

        </nav>

        {/* Right side */}
        <div className="rm-navbar-right">

          {!user && (
            <button
              className="rm-cta-small"
              onClick={onSignInClick}
            >
              Sign In
            </button>
          )}

          {user && (
            <div className="rm-navbar-profile">

              <button
                onClick={onUploadClick}
                className="rm-cta-small"
              >
                Upload
              </button>

              <div className="rm-profile">
                <img
                  className="rm-profile-circle"
                  src={`http://localhost:3000${user.profile_image}`}
                  alt="profile"
                  onClick={() => setIsDropDown(!isDropdown)}
                />

                {isDropdown && (
                  <div className="rm-dropdown-menu">

                    <span className="rm-user-name">
                      {user?.username}
                    </span>

                    <button
                      onClick={onUploadProfileClick}
                      className="rm-dropdown-btn"
                    >
                      Profile
                    </button>

                    <button className="rm-dropdown-btn">
                      Setting
                    </button>

                    <button
                      className="rm-dropdown-btn"
                      onClick={() => navigate("/admin/role-requests")}
                    >
                      Role-requests 
                    </button>

                    <button
                      onClick={() => {
                        setIsDropDown(false);
                        onLogout();
                      }}
                      className="rm-dropdown-btn"
                    >
                      Sign Out
                    </button>

                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}

export default Navbar;