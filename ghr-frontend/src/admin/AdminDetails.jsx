import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";

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
    } catch (err) {
      console.error("Error updating details:", err.response || err);
      setError("Failed to update admin details");
    }
  };

  // Change the admin's password using newPassword and confirmPassword
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      // Call your reset-password route. Adjust the URL if needed.
      await axios.put(`${API_URL}/api/auth/users/${adminDetails._id}/reset-password`, {
        newPassword: passwordData.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpdateMessage("Password changed successfully!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
      setError("");
    } catch (err) {
      console.error("Error changing password:", err.response || err);
      setError("Failed to change password");
    }
  };

  // Delete the admin user (from the database and optionally from Firebase)
  const handleDeleteAdmin = async () => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await axios.delete(`${API_URL}/api/auth/users/${adminDetails._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Admin deleted successfully!");
      navigate("/manage-admin");
    } catch (err) {
      console.error("Error deleting admin:", err.response || err);
      setError("Failed to delete admin");
    }
  };

  const containerStyle = {
    marginLeft: "80px",
    marginTop: "70px",
    padding: "2rem",
  };

  if (loading) return <p>Loading admin details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <AdminHeader 
        title="Admin Details" 
        adminName={adminDetails ? `${adminDetails.name} ${adminDetails.lastName}` : "Admin"} 
        profilePicture={adminDetails ? adminDetails.profileImageUrl : "/images/default-admin.png"} 
      />
      <AdminTabs />
      <div style={containerStyle}>
        {updateMessage && <p style={{ color: "green" }}>{updateMessage}</p>}
        <form onSubmit={handleUpdateDetails}>
          <div>
            <label>First Name:</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div>
            <label>Last Name:</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div>
            <label>Email:</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div>
            <label>Phone:</label>
            <input 
              type="text" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          {/* Display the creator's name (non-editable) */}
          {createdByName && (
            <div>
              <label>Created By:</label>
              <input type="text" value={createdByName} readOnly />
            </div>
          )}
          <button type="submit">Update Details</button>
        </form>

        <hr />

        <form onSubmit={handleChangePassword}>
          <div>
            <label>New Password:</label>
            <input 
              type="password" 
              name="newPassword" 
              value={passwordData.newPassword} 
              onChange={handlePasswordChange} 
              required 
            />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={passwordData.confirmPassword} 
              onChange={handlePasswordChange} 
              required 
            />
          </div>
          <button type="submit">Change Password</button>
        </form>

        <hr />

        <button
          onClick={handleDeleteAdmin}
          style={{
            backgroundColor: "#dc3545",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "1rem"
          }}
        >
          Delete Admin
        </button>
        <button onClick={() => navigate(-1)} style={{ padding: "0.75rem 1.5rem", cursor: "pointer" }}>
          Back
        </button>
      </div>
    </>
  );
};

export default AdminDetailsPage;
