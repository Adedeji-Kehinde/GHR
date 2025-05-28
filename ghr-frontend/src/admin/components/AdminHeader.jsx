import React from "react";
import { useNavigate } from "react-router-dom";

const AdminHeader = ({ title, adminName, profilePicture }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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

      {/* Right Section: Admin Profile and Logout */}
      <div
        style={{
          flex: "0 0 320px", // more space for name and logout
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
        <span style={{ marginRight: "1rem", fontWeight: 500 }}>{adminName}</span>
        <span style={{ color: "#888" }}>Admin</span>
        <span
          style={{
            color: "#d32f2f",
            cursor: "pointer",
            fontWeight: 500,
            marginLeft: "1rem"
          }}
          onClick={handleLogout}
        >
          Logout
        </span>
      </div>
    </header>
  );
};

export default AdminHeader;
