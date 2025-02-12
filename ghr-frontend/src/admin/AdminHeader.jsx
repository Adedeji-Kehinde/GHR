import React from "react";

const AdminHeader = ({ title, adminName, profilePicture }) => {
  // Define image paths from the "images" folder
  const logoImage = "/images/logo.png";

  // Fixed header style applied here so that every page using AdminHeader has it fixed at the top.
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
          style={{ height: "40px", marginRight: "1rem" }}
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

      {/* Right Section: Admin Profile */}
      <div
        style={{
          flex: "0 0 220px", // fixed width to ensure content fits
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <img
          src={profilePicture}
          alt="Profile"
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            marginRight: "0.5rem",
          }}
        />
        <span style={{ marginRight: "0.5rem" }}>{adminName}</span>
        <div
          style={{
            borderLeft: "1px solid #ccc",
            height: "40px",
            marginRight: "0.5rem",
          }}
        ></div>
        <span>Admin</span>
      </div>
    </header>
  );
};

export default AdminHeader;
