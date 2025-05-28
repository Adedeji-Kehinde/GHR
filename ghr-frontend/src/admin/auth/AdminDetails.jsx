import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import './AdminManagement.css';

const AdminDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Retrieve the admin object from navigation state
  const { admin: passedAdmin } = location.state || {};
  const API_URL = import.meta.env.VITE_API_BASE_URL ||  "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Use the passed admin details (or fall back to null)
  const [adminDetails, setAdminDetails] = useState(passedAdmin);
  const [createdByName, setCreatedByName] = useState("");  
  const [loading, setLoading] = useState(!passedAdmin);
  const [error, setError] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  // Form state for updating admin details
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: ""
  });

  // Form state for password change with new and confirm password
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Fetch admin details if not passed via state (optional) and update form state
  useEffect(() => {
    if (adminDetails) {
      setFormData({
        name: adminDetails.name,
        lastName: adminDetails.lastName,
        email: adminDetails.email,
        phone: adminDetails.phone
      });
    } else {
      setLoading(false);
      setError("No admin details available");
    }
  }, [adminDetails]);

  // If adminDetails.createdBy is present, fetch the creator's name
  useEffect(() => {
    if (adminDetails && adminDetails.createdBy) {
      axios.get(`${API_URL}/api/auth/users/${adminDetails.createdBy}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const creator = res.data;
        setCreatedByName(`${creator.name} ${creator.lastName}`);
      })
      .catch(err => {
        console.error("Failed to fetch creator details:", err.response || err);
        setCreatedByName("Unknown");
      });
    }
  }, [adminDetails, API_URL, token]);

  // Handle form input changes for admin details
  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle changes for password fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Save updated admin details
  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/auth/users/${adminDetails._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpdateMessage("Admin details updated successfully!");
      setTimeout(() => setUpdateMessage(""), 3000); // Clear message after 3 seconds
    } catch (err) {
      console.error("Error updating details:", err.response || err);
      setError("Failed to update admin details");
      setTimeout(() => setError(""), 3000); // Clear error after 3 seconds
    }
  };

  // Change the admin's password using newPassword and confirmPassword
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      setTimeout(() => setError(""), 3000);
      return;
    }
    try {
      await axios.put(`${API_URL}/api/auth/users/${adminDetails._id}/reset-password`, {
        newPassword: passwordData.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpdateMessage("Password changed successfully!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
      setError("");
      setTimeout(() => setUpdateMessage(""), 3000);
    } catch (err) {
      console.error("Error changing password:", err.response || err);
      setError("Failed to change password");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Delete the admin user (from the database and optionally from Firebase)
  const handleDeleteAdmin = async () => {
    if (!window.confirm("Are you sure you want to delete this admin? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/api/auth/users/${adminDetails._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Admin deleted successfully!");
      navigate("/manage-admin");
    } catch (err) {
      console.error("Error deleting admin:", err.response || err);
      setError("Failed to delete admin");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) return (
    <div className="admin-management-content">
      <div className="admin-management-section">
        <p>Loading admin details...</p>
      </div>
    </div>
  );

  return (
    <>
      <AdminHeader 
        title="Admin Details" 
        adminName={adminDetails ? `${adminDetails.name} ${adminDetails.lastName}` : "Admin"} 
        profilePicture={adminDetails ? adminDetails.profileImageUrl : "/images/default-admin.png"} 
      />
      <AdminTabs />
      
      <div className="admin-management-content">
        {updateMessage && (
          <div className="admin-management-message success">
            {updateMessage}
          </div>
        )}
        {error && (
          <div className="admin-management-message error">
            {error}
          </div>
        )}

        {/* Personal Information Section */}
        <div className="admin-management-section">
          <h2 className="admin-management-title">Personal Information</h2>
        <form onSubmit={handleUpdateDetails}>
            <div className="admin-management-form-grid">
              <div className="admin-management-form-group">
                <label className="admin-management-label">First Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              required 
                  className="admin-management-input"
            />
          </div>
              <div className="admin-management-form-group">
                <label className="admin-management-label">Last Name</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleInputChange} 
              required 
                  className="admin-management-input"
            />
          </div>
              <div className="admin-management-form-group">
                <label className="admin-management-label">Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              required 
                  className="admin-management-input"
            />
          </div>
              <div className="admin-management-form-group">
                <label className="admin-management-label">Phone</label>
            <input 
              type="text" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              required 
                  className="admin-management-input"
            />
          </div>
            </div>
          {createdByName && (
              <div className="admin-management-form-group">
                <label className="admin-management-label">Created By</label>
                <input 
                  type="text" 
                  value={createdByName} 
                  readOnly 
                  className="admin-management-input"
                />
              </div>
            )}
            <div className="admin-management-button-group">
              <button type="submit" className="admin-management-btn primary">
                Update Details
              </button>
            </div>
        </form>
        </div>

        {/* Password Change Section */}
        <div className="admin-management-section">
          <h2 className="admin-management-title">Change Password</h2>
        <form onSubmit={handleChangePassword}>
            <div className="admin-management-form-grid">
              <div className="admin-management-form-group">
                <label className="admin-management-label">New Password</label>
            <input 
              type="password" 
              name="newPassword" 
              value={passwordData.newPassword} 
              onChange={handlePasswordChange} 
              required 
                  className="admin-management-input"
            />
          </div>
              <div className="admin-management-form-group">
                <label className="admin-management-label">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={passwordData.confirmPassword} 
              onChange={handlePasswordChange} 
              required 
                  className="admin-management-input"
            />
          </div>
            </div>
            <div className="admin-management-button-group">
              <button type="submit" className="admin-management-btn primary">
                Change Password
              </button>
            </div>
        </form>
        </div>

        {/* Danger Zone Section */}
        <div className="admin-management-section" style={{ backgroundColor: "#fff5f5" }}>
          <h2 className="admin-management-title" style={{ color: "#dc3545" }}>Danger Zone</h2>
          <p style={{marginBottom: "1.5rem", color: "#6b7280"}}>
            Once you delete an admin account, there is no going back. Please be certain.
          </p>
          <div className="admin-management-button-group">
        <button
          onClick={handleDeleteAdmin}
              className="admin-management-btn danger"
        >
              Delete Admin Account
        </button>
            <button 
              onClick={() => navigate(-1)} 
              className="admin-management-btn cancel"
            >
          Back
        </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDetailsPage;
