import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";

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

  // Styles matching other admin pages
  const styles = {
    content: {
      marginTop: 40,
      margin: 40,
      padding: '2rem',
      width: "90vw",
      background: '#f8f9fa',
    },
    section: {
      backgroundColor: "#fff",
    padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      marginBottom: "2rem"
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1.5rem",
      marginBottom: "1.5rem"
    },
    formGroup: {
      marginBottom: "1.5rem"
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "500",
      color: "#495057"
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      fontSize: "1rem",
      transition: "border-color 0.15s ease-in-out",
      "&:focus": {
        borderColor: "#80bdff",
        outline: "none"
      }
    },
    readOnlyInput: {
      backgroundColor: "#f8f9fa",
      cursor: "not-allowed"
    },
    buttonGroup: {
      display: "flex",
      gap: "1rem",
      justifyContent: "flex-end",
      marginTop: "1.5rem"
    },
    button: {
      padding: "0.75rem 1.5rem",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "500",
      transition: "background-color 0.15s ease-in-out"
    },
    primaryButton: {
      backgroundColor: "#28a745",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#218838"
      }
    },
    dangerButton: {
      backgroundColor: "#dc3545",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#c82333"
      }
    },
    cancelButton: {
      backgroundColor: "#6c757d",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#5a6268"
      }
    },
    message: {
      padding: "1rem",
      borderRadius: "4px",
      marginBottom: "1rem"
    },
    successMessage: {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb"
    },
    errorMessage: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb"
    }
  };

  if (loading) return (
    <div style={styles.content}>
      <div style={styles.section}>
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
      
      <div style={styles.content}>
        {updateMessage && (
          <div style={{...styles.message, ...styles.successMessage}}>
            {updateMessage}
          </div>
        )}
        {error && (
          <div style={{...styles.message, ...styles.errorMessage}}>
            {error}
          </div>
        )}

        {/* Personal Information Section */}
        <div style={styles.section}>
          <h2 style={{marginBottom: "1.5rem"}}>Personal Information</h2>
        <form onSubmit={handleUpdateDetails}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              required 
                  style={styles.input}
            />
          </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleInputChange} 
              required 
                  style={styles.input}
            />
          </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              required 
                  style={styles.input}
            />
          </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
            <input 
              type="text" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              required 
                  style={styles.input}
            />
          </div>
            </div>
          {createdByName && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Created By</label>
                <input 
                  type="text" 
                  value={createdByName} 
                  readOnly 
                  style={{...styles.input, ...styles.readOnlyInput}}
                />
              </div>
            )}
            <div style={styles.buttonGroup}>
              <button type="submit" style={{...styles.button, ...styles.primaryButton}}>
                Update Details
              </button>
            </div>
        </form>
        </div>

        {/* Password Change Section */}
        <div style={styles.section}>
          <h2 style={{marginBottom: "1.5rem"}}>Change Password</h2>
        <form onSubmit={handleChangePassword}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>New Password</label>
            <input 
              type="password" 
              name="newPassword" 
              value={passwordData.newPassword} 
              onChange={handlePasswordChange} 
              required 
                  style={styles.input}
            />
          </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={passwordData.confirmPassword} 
              onChange={handlePasswordChange} 
              required 
                  style={styles.input}
            />
          </div>
            </div>
            <div style={styles.buttonGroup}>
              <button type="submit" style={{...styles.button, ...styles.primaryButton}}>
                Change Password
              </button>
            </div>
        </form>
        </div>

        {/* Danger Zone Section */}
        <div style={{...styles.section, backgroundColor: "#fff5f5"}}>
          <h2 style={{marginBottom: "1.5rem", color: "#dc3545"}}>Danger Zone</h2>
          <p style={{marginBottom: "1.5rem", color: "#6b7280"}}>
            Once you delete an admin account, there is no going back. Please be certain.
          </p>
          <div style={styles.buttonGroup}>
        <button
          onClick={handleDeleteAdmin}
              style={{...styles.button, ...styles.dangerButton}}
        >
              Delete Admin Account
        </button>
            <button 
              onClick={() => navigate(-1)} 
              style={{...styles.button, ...styles.cancelButton}}
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
