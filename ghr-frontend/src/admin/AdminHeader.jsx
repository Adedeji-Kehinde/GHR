import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ title, adminName, profilePicture }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  // Define image path from the "images" folder
  const logoImage = "/images/logo.png";

  // Fixed header style so that every page using AdminHeader has it fixed at the top.
  const headerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #ddd",
    height: "70px",
    boxSizing: "border-box",
  };

  return (
    <header style={headerStyle}>
      {/* Left Section: Logo */}
      <div style={{ flex: "1", display: "flex", alignItems: "center" }}>
        <img
          src={logoImage}
          alt="Logo"
          style={{ height: "40px", marginRight: "1rem", cursor: "pointer" }}
          onClick={() => navigate("/")}
        />
      </div>

      {/* Center Section: Page Title */}
      <div
        style={{
          flex: "2",
          textAlign: "center",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        {title}
      </div>

      {/* Right Section: Admin Profile with Dropdown */}
      <div
        style={{
          flex: "0 0 220px", // fixed width to ensure content fits
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          position: "relative",
        }}
      >
        <img
          src={profilePicture}
          alt="Profile"
          style={{
            height: "40px",
            width: "40px",
            marginRight: "0.5rem",
          }}
        />
        {/* Wrap the admin name in a relative container */}
        <div style={{ position: "relative", display: "inline-block" }} ref={dropdownRef}>
          <span
            style={{ marginRight: "0.5rem", cursor: "pointer" }}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {adminName}
          </span>
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                backgroundColor: "#fff",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                borderRadius: "4px",
                marginTop: "0.5rem",
                zIndex: 1001,
              }}
            >
              <div
                style={{
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                onClick={handleProfile}
              >
                Profile
              </div>
              <div
                style={{
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          )}
        </div>
        <span style={{ marginLeft: "0.5rem" }}>Admin</span>
      </div>
    </header>
  );
};

export default AdminHeader;
