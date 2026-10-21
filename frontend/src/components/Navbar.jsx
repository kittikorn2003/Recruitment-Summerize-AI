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
  const closeDropdown = () => {
  setIsDropDown(false);
  };

  const handleNavigate = (path) => {
    closeDropdown();
    navigate(path);
  };

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
            onClick={() => handleNavigate("/search")}
          >
            SearchCandidates 
          </button>
          <button
            className="rm-nav-link"
            onClick={() => handleNavigate("/role-request")}
          >
            Request HR 
          </button>
          
          <button
            className="rm-nav-link"
            onClick={() => handleNavigate("/my-resumes")}
          >
            My Resumes
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
              onClick={() => {
                closeDropdown();
                onSignInClick();
              }}
            >
              Sign In
            </button>
          )}

          {user && (
            <div className="rm-navbar-profile">

              <button
                onClick={() => {
                  closeDropdown();
                  onUploadClick();
                }}
                className="rm-cta-small"
              >
                Upload
              </button>

              <div className="rm-profile">
                <img
                  className="rm-profile-circle"
                  src={`http://localhost:3000${user.profile_image || ""}`}
                  alt="profile"
                  onClick={() => setIsDropDown((prev) => !prev)}
                />

                {isDropdown && (
                  <div className="rm-dropdown-menu">

                    <span className="rm-user-name">
                      {user?.username}
                    </span>


                    <button
                      className="rm-dropdown-btn"
                      onClick={() => {
                        closeDropdown();
                        // เพิ่มการทำงานของ Setting ตรงนี้
                      }}
                    >
                      Setting
                    </button>

                    <button
                      className="rm-dropdown-btn"
                      onClick={() => handleNavigate("/admin/role-requests")}
                    >
                      Role-requests
                    </button>
                    <button
                      className="rm-dropdown-btn"
                      onClick={() => handleNavigate("/my-resumes")}
                    >
                      My Resumes
                    </button>

                    <button
                      className="rm-dropdown-btn"
                      onClick={() => handleNavigate("/edit-profile")}
                    >
                      Edit Profile
                    </button>

                    <button
                      className="rm-dropdown-btn"
                      onClick={() => {
                        closeDropdown();
                        onLogout();
                      }}
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