import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const UserHeader = ({ user, hideBookRoom }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [learnMoreDropdownOpen, setLearnMoreDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const userDropdownRef = useRef(null);
  const learnMoreDropdownRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (learnMoreDropdownRef.current && !learnMoreDropdownRef.current.contains(e.target)) {
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
    navigate("/user-profile");
  };

  const handleMyBookings = () => {
    navigate("/home");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // --- Styles ---
  const headerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
    padding: "0.5rem 0",
    boxSizing: "border-box",
    height: "80px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #eee",
  };

  const containerStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
  };

  const logoMenuContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const logoStyle = {
    height: "50px",
    width: "50px",
    objectFit: "cover",
    cursor: "pointer",
    borderRadius: "50%"
  };

  const logoTitleStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    cursor: "pointer",
  };

  const titleStyle = {
    fontSize: isMobile ? "1rem" : "1.5rem",
    fontWeight: "bold",
    color: "#0072ff",
    margin: 0,
    whiteSpace: "nowrap",
  };

  const hamburgerButtonStyle = {
    display: isMobile ? "flex" : "none",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  const navLinksContainerStyle = {
    display: isMobile ? (isMobileMenuOpen ? "flex" : "none") : "flex",
    flexDirection: isMobile ? "column" : "row",
    position: isMobile ? "absolute" : "static",
    top: "80px",
    left: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: isMobile ? "1rem 0" : "0",
    boxShadow: isMobile ? "0px 4px 10px rgba(0,0,0,0.1)" : "none",
    alignItems: "center",
    justifyContent: isMobile ? "center" : "flex-end",
    gap: "1rem",
    zIndex: 999,
  };

  const navItemStyle = {
    fontWeight: "bold",
    cursor: "pointer",
    padding: "0.5rem 1rem",
  };

  const userInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginRight: "10px", // small margin so it doesn't touch screen edge
    position: "relative",
  };

  const profilePicStyle = {
    height: "40px",
    width: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    cursor: "pointer",
  };

  const userNameStyle = {
    fontWeight: "bold",
    whiteSpace: "nowrap",
    cursor: "pointer",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    borderRadius: "4px",
    zIndex: 1001,
    animation: "fadeSlideDown 0.3s ease",
  };

  const dropdownItemStyle = {
    padding: "0.5rem 1rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  // Keyframe animation
  const keyframesStyle = `
    @keyframes fadeSlideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      <style>{keyframesStyle}</style> {/* Add animation keyframes directly */}

      <header style={headerStyle}>
        <div style={containerStyle}>
          {/* Logo + Menu Button */}
          <div style={logoMenuContainerStyle}>
            <div style={logoTitleStyle} onClick={() => navigate("/")}>
              <img src="/images/logo.png" alt="Logo" style={logoStyle} />
            </div>

            {/* Hamburger Button */}
            <button style={hamburgerButtonStyle} onClick={toggleMobileMenu}>☰</button>
          </div>

          {/* Navigation Links */}
          <div style={navLinksContainerStyle}>
            {user ? (
              <div style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                gap: "1rem",
                marginRight: "10px",
              }}>
                {/* My Bookings */}
                <span style={userNameStyle} onClick={handleMyBookings}>
                  My Bookings
                </span>

                {/* User Info */}
                <div ref={userDropdownRef} style={userInfoStyle}>
                  <span style={userNameStyle} onClick={() => setDropdownOpen(prev => !prev)}>
                    Hello, {userName}
                  </span>
                  <img
                    src={userProfilePicture}
                    alt="Profile"
                    style={profilePicStyle}
                    onClick={() => setDropdownOpen(prev => !prev)}
                  />
                  {dropdownOpen && (
                    <div style={dropdownStyle}>
                      <div style={dropdownItemStyle} onClick={handleProfile}>
                        Profile
                      </div>
                      <div style={dropdownItemStyle} onClick={handleLogout}>
                        Logout
                      </div>
                    </div>
                  )}
                </div>

                {/* Book Room Button */}
                {!hideBookRoom && (
                  <button
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#007BFF",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      maxWidth: "150px",
                    }}
                    onClick={() => navigate("/booking")}
                  >
                    Book Room
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                display: isMobile ? "flex" : "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: isMobile ? "center" : "space-between",
                alignItems: "center",
                width: isMobile ? "100%" : "80%",
              }}>
                {/* Left Group */}
                <div style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: "1rem",
                  alignItems: "center",
                }}>
                  <span style={navItemStyle} onClick={() => navigate("/about")}>
                    About
                  </span>
                  <span style={navItemStyle} onClick={() => navigate("/life-ghr")}>
                    Life@GHR
                  </span>
                  <span style={navItemStyle} onClick={() => navigate("/testimonials")}>
                    Testimonials
                  </span>
                  {/* Learn More Dropdown */}
                  <div ref={learnMoreDropdownRef} style={{ position: "relative" }}>
                    <span
                      style={navItemStyle}
                      onClick={() => setLearnMoreDropdownOpen(prev => !prev)}
                    >
                      Learn More
                    </span>
                    {learnMoreDropdownOpen && (
                      <div style={dropdownStyle}>
                        <div style={dropdownItemStyle} onClick={() => navigate("/privacy-policy")}>
                          Privacy Policy
                        </div>
                        <div style={dropdownItemStyle} onClick={() => navigate("/cancellation-policy")}>
                          Cancellation Policy
                        </div>
                        <div style={dropdownItemStyle} onClick={() => navigate("/terms-and-conditions")}>
                          Terms and Conditions
                        </div>
                        <div style={dropdownItemStyle} onClick={() => navigate("/faqs")}>
                          FAQs
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Group */}
                <div style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: "0.5rem",
                  alignItems: "center",
                  marginRight: "10px",
                }}>
                  <span style={navItemStyle} onClick={() => navigate("/login")}>
                    Login
                  </span>
                  <span style={navItemStyle} onClick={() => navigate("/register")}>
                    Register
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default UserHeader;
