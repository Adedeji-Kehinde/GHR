import React from "react";
import { useNavigate } from "react-router-dom";
import './admin.css';

const AdminHeader = ({ title, adminName, profilePicture }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Define image path from the "images" folder
  const logoImage = "/images/logo.png";

  return (
    <header className="admin-header">
      {/* Left Section: Logo */}
      <div className="admin-header-left">
        <img
          src={logoImage}
          alt="Logo"
          className="admin-header-logo"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Center Section: Page Title */}
      <div className="admin-header-center">
        {title}
      </div>

      {/* Right Section: Admin Profile and Logout */}
      <div className="admin-header-right">
        <img
          src={profilePicture}
          alt="Profile"
          className="admin-header-profile"
        />
        <span className="admin-header-name">{adminName}</span>
        <span className="admin-header-role">Admin</span>
          <span
          className="admin-header-logout"
                onClick={handleLogout}
              >
                Logout
        </span>
      </div>
    </header>
  );
};

export default AdminHeader;
