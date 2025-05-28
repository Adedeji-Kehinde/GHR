// AnnouncementDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";


const AnnouncementDetails = () => {
  const { state } = useLocation();
  const announcementFromState = state?.announcement;
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [announcementData, setAnnouncementData] = useState({
    title: "",
    message: "",
    attachments: [],
    approved: false,
  });
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  // Fetch admin details on page load
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(res.data);
      } catch (err) {
        console.error("Error fetching admin details:", err.response || err);
      }
    };
    fetchAdmin();
  }, [API_URL, token]);

  // Load announcement details from state
  useEffect(() => {
    if (!announcementFromState) {
      alert("No announcement data found.");
      navigate("/announcement");
    } else {
      setAnnouncementData({
        title: announcementFromState.title,
        message: announcementFromState.message,
        attachments: announcementFromState.attachments,
        approved: announcementFromState.approved,
      });
      setLoading(false);
    }
  }, [announcementFromState, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAnnouncementData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/api/auth/announcements/${announcementFromState._id}`,
        {
          title: announcementData.title,
          message: announcementData.message,
          attachments: announcementData.attachments,
          approved: announcementData.approved,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Announcement updated successfully");
      navigate("/announcement");
    } catch (err) {
      console.error("Error updating announcement:", err);
      alert("Error updating announcement");
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
    tabHeader: {
      display: "flex",
      gap: "1rem",
      marginBottom: "2rem",
    },
    tab: (isActive) => ({
      flex: 1,
      padding: "1rem 2rem",
      textAlign: "center",
      cursor: "pointer",
      backgroundColor: isActive ? "#fff" : "#f8f9fa",
      border: isActive ? "1px solid #dee2e6" : "1px solid #dee2e6",
      borderBottom: isActive ? "2px solid #007bff" : "1px solid #dee2e6",
      borderRadius: "4px 4px 0 0",
      fontWeight: isActive ? "bold" : "normal",
    }),
    section: {
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    formGroup: {
      marginBottom: "1.5rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "500",
      color: "#495057",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      fontSize: "1rem",
    },
    textarea: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      fontSize: "1rem",
      minHeight: "150px",
      resize: "vertical",
    },
    statusSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem",
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      marginTop: "1rem",
    },
    checkbox: {
      marginLeft: "1rem",
    },
    attachmentsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "1rem",
      marginTop: "1rem",
    },
    attachmentImage: {
      width: "100%",
      height: "200px",
      objectFit: "cover",
      borderRadius: "4px",
      border: "1px solid #dee2e6",
    },
    buttonGroup: {
      display: "flex",
      gap: "1rem",
      justifyContent: "flex-end",
      marginTop: "2rem",
    },
    button: {
      padding: "0.75rem 1.5rem",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "500",
    },
    saveButton: {
      backgroundColor: "#28a745",
      color: "#fff",
    },
    cancelButton: {
      backgroundColor: "#6c757d",
      color: "#fff",
    }
  };

  // Status styles matching the main page
  const statusStyles = {
    approved: {
      backgroundColor: '#e8f5e9',  // Light green
      color: '#2e7d32',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    pending: {
      backgroundColor: '#fff3e0',  // Light orange
      color: '#e65100',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    }
  };

  if (loading || !admin) return (
    <div style={styles.content}>
      <div style={styles.section}>
        <p>Loading announcement details...</p>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div style={styles.section}>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Title</label>
          <input
            type="text"
            name="title"
            value={announcementData.title}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Message</label>
          <textarea
            name="message"
            value={announcementData.message}
            onChange={handleChange}
            required
            style={styles.textarea}
          />
        </div>
        <div style={styles.statusSection}>
          <div>
            <label style={styles.label}>Status</label>
            <div style={statusStyles[announcementData.approved ? 'approved' : 'pending']}>
              {announcementData.approved ? 'Approved' : 'Pending'}
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <label style={{marginRight: '0.5rem'}}>Set as Approved</label>
            <input
              type="checkbox"
              name="approved"
              checked={announcementData.approved}
              onChange={handleChange}
              style={styles.checkbox}
            />
          </div>
        </div>
        <div style={styles.buttonGroup}>
          <button
            type="submit"
            style={{...styles.button, ...styles.saveButton}}
          >
            Update Announcement
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{...styles.button, ...styles.cancelButton}}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderAttachmentsTab = () => (
    <div style={styles.section}>
      {announcementData.attachments && announcementData.attachments.length > 0 ? (
        <div style={styles.attachmentsGrid}>
          {announcementData.attachments.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Attachment ${index + 1}`}
              style={styles.attachmentImage}
            />
          ))}
        </div>
      ) : (
        <p>No attachments available.</p>
      )}
    </div>
  );

  return (
    <>
      <AdminHeader 
        title="Edit Announcement" 
        adminName={`${admin.name} ${admin.lastName}`} 
        profilePicture={admin.profileImageUrl} 
      />
      <AdminTabs />
      
      <div style={styles.content}>
        <div style={styles.tabHeader}>
          <div
            style={styles.tab(activeTab === "general")}
            onClick={() => setActiveTab("general")}
          >
            General
          </div>
          <div
            style={styles.tab(activeTab === "attachments")}
            onClick={() => setActiveTab("attachments")}
          >
            Attachments
          </div>
              </div>

        {activeTab === "general" ? renderGeneralTab() : renderAttachmentsTab()}
      </div>
    </>
  );
};

export default AnnouncementDetails;
