import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const UserHeader = ({ user }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [learnMoreDropdownOpen, setLearnMoreDropdownOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const learnMoreDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
      if (
        learnMoreDropdownRef.current &&
        !learnMoreDropdownRef.current.contains(e.target)
      ) {
        setLearnMoreDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = user ? user.name : null;
  const userProfilePicture = user ? user.profileImageUrl : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  // Styles
  const headerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
    padding: "0.5rem 0",
    boxSizing: "border-box",
    height: "100px",
    backgroundColor: "#fff",
  };

  const containerStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
  };

  const logoStyle = {
    height: "60px",
    width: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    cursor: "pointer",
  };

  const navItemStyle = {
    fontWeight: "bold",
    cursor: "pointer",
  };

  const userInfoStyle = {
    display: "flex",
    alignItems: "center",
    position: "relative",
    gap: "1rem",
    marginRight: "80px",
  };

  const profilePicStyle = {
    height: "40px",
    width: "40px",
    objectFit: "cover",
    marginRight: "0.75rem",
  };

  const userNameStyle = {
    fontWeight: "bold",
    whiteSpace: "nowrap",
    cursor: "pointer",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    borderRadius: "4px",
    marginTop: "0.5rem",
    zIndex: 1001,
  };

  const learnMoreDropdownStyle = {
    position: "absolute",
    top: "100%",
    left: 0,
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    borderRadius: "4px",
    marginTop: "0.5rem",
    zIndex: 1001,
  };

  const dropdownItemStyle = {
    padding: "0.5rem 1rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const bookRoomButtonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const navContainerStyle = {
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    padding: "0.75rem 1.5rem",
    width: "100%",
    boxSizing: "border-box",
    justifyContent: "space-between",
  };

  const leftNavGroupStyle = {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  };

  const rightNavGroupStyle = {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
    marginRight: "40px",
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        {/* Logo */}
        <div onClick={() => navigate("/")}>
          <img src="/images/logo.png" alt="Logo" style={logoStyle} />
        </div>
        {user ? (
          // Logged in: Profile picture, clickable greeting (dropdown), and Book Room button.
          <div style={userInfoStyle}>
            <img
              src={userProfilePicture}
              alt="Profile"
              style={profilePicStyle}
            />
            <div
              ref={userDropdownRef}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={userNameStyle}
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                Hello, {userName}
              </span>
              {dropdownOpen && (
                <div style={dropdownStyle}>
                  <div
                    style={dropdownItemStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProfile();
                    }}
                  >
                    Profile
                  </div>
                  <div
                    style={dropdownItemStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
            <button
              style={bookRoomButtonStyle}
              onClick={() => navigate("/booking")}
            >
              Book Room
            </button>
          </div>
        ) : (
          // Non-logged in: Navigation container with left and right groups.
          <div style={navContainerStyle}>
            <div style={leftNavGroupStyle}>
              <span style={navItemStyle} onClick={() => navigate("/about")}>
                About
              </span>
              <span style={navItemStyle} onClick={() => navigate("/life-ghr")}>
                Life@GHR
              </span>
              <div ref={learnMoreDropdownRef} style={{ position: "relative" }}>
                <span
                  style={navItemStyle}
                  onClick={() =>
                    setLearnMoreDropdownOpen((prev) => !prev)
                  }
                >
                  Learn more
                </span>
                {learnMoreDropdownOpen && (
                  <div style={learnMoreDropdownStyle}>
                    <div
                      style={dropdownItemStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/privacy-policy");
                      }}
                    >
                      Privacy Policy
                    </div>
                    <div
                      style={dropdownItemStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/cancellation-policy");
                      }}
                    >
                      Cancellation Policy
                    </div>
                    <div
                      style={dropdownItemStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/terms-and-conditions");
                      }}
                    >
                      Terms and Conditions
                    </div>
                    <div
                      style={dropdownItemStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/faqs");
                      }}
                    >
                      FAQs
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={rightNavGroupStyle}>
              <span style={navItemStyle} onClick={() => navigate("/login")}>
                Login
              </span>
              <span style={navItemStyle} onClick={() => navigate("/register")}>
                Register
              </span>
              <span style={navItemStyle} onClick={() => navigate("/booking")}>
                Book Room
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default UserHeader;
