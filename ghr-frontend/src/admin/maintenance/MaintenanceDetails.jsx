// MaintenanceDetailsPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";

const MaintenanceDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { maintenance } = location.state || {};
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Fetch admin details for header
  const [admin, setAdmin] = useState(null);
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

  if (!maintenance) {
    return <p className="error">No maintenance details available.</p>;
  }

  // Two tabs: General and Attachments
  const [activeTab, setActiveTab] = useState("general");

  // Local state for the editable field (Status only)
  const [updatedMaintenance, setUpdatedMaintenance] = useState({
    status: maintenance.status,
  });

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setUpdatedMaintenance((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updateData = { status: updatedMaintenance.status };
      const res = await axios.put(
        `${API_URL}/api/maintenance/${maintenance._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Maintenance updated successfully!");
      setUpdatedMaintenance({ status: res.data.maintenance.status });
    } catch (err) {
      console.error("Error updating maintenance:", err.response || err);
      alert("Error updating maintenance");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this maintenance request?")) {
      try {
        await axios.delete(`${API_URL}/api/maintenance/${maintenance._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Maintenance deleted successfully!");
        navigate(-1);
      } catch (err) {
        console.error("Error deleting maintenance:", err.response || err);
        alert("Error deleting maintenance");
      }
    }
  };

  const formattedCreatedAt = new Date(maintenance.createdAt).toLocaleString();
  const formattedCompletedAt = maintenance.completedAt
    ? new Date(maintenance.completedAt).toLocaleString()
    : "N/A";

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
    detailsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1.5rem",
      marginBottom: "2rem",
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
    detailBox: {
      padding: "1.5rem",
      backgroundColor: "#fff",
      borderRadius: "8px",
      border: "1px solid #dee2e6",
    },
    label: {
      fontWeight: "bold",
      marginBottom: "0.5rem",
      display: "block",
      color: "#495057",
    },
    value: {
      fontSize: "1rem",
      color: "#212529",
    },
    select: {
      width: "100%",
      padding: "0.5rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      fontSize: "1rem",
    },
    textarea: {
      width: "100%",
    padding: "1rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      resize: "vertical",
      minHeight: "150px",
      fontSize: "1rem",
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
    deleteButton: {
      backgroundColor: "#dc3545",
      color: "#fff",
    },
    cancelButton: {
      backgroundColor: "#6c757d",
      color: "#fff",
    },
    attachmentsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "1.5rem",
      padding: "2rem",
      backgroundColor: "#fff",
    borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    attachmentImage: {
      width: "100%",
      height: "auto",
      borderRadius: "4px",
      border: "1px solid #dee2e6",
    },
  };

  // Status styles matching the main page
  const statusStyles = {
    "Pending": {
      backgroundColor: '#fff3e0',  // Light orange
      color: '#e65100',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "In Process": {
      backgroundColor: '#e3f2fd',  // Light blue
      color: '#1976d2',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "Completed": {
      backgroundColor: '#e8f5e9',  // Light green
      color: '#2e7d32',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    }
  };

  const renderGeneralTab = () => (
    <div style={styles.detailsGrid}>
      <div style={styles.detailBox}>
        <div style={styles.label}>Request ID</div>
        <div style={styles.value}>{maintenance.requestId}</div>
        </div>
      <div style={styles.detailBox}>
        <div style={styles.label}>Room Number</div>
        <div style={styles.value}>{maintenance.roomNumber}</div>
        </div>
      <div style={styles.detailBox}>
        <div style={styles.label}>Category</div>
        <div style={styles.value}>{maintenance.category}</div>
        </div>
      <div style={styles.detailBox}>
        <div style={styles.label}>Room Access</div>
        <div style={styles.value}>{maintenance.roomAccess}</div>
        </div>
      <div style={styles.detailBox}>
        <div style={styles.label}>Created At</div>
        <div style={styles.value}>{formattedCreatedAt}</div>
        </div>
      <div style={styles.detailBox}>
        <div style={styles.label}>Completed At</div>
        <div style={styles.value}>{formattedCompletedAt}</div>
        </div>
      <div style={styles.detailBox}>
        <div style={styles.label}>Enquirer Name</div>
        <div style={styles.value}>{maintenance.enquirerName}</div>
        </div>
      <div style={styles.detailBox}>
        <div style={styles.label}>Status</div>
          <select
            name="status"
            value={updatedMaintenance.status}
            onChange={handleFieldChange}
          style={styles.select}
          >
          <option value="Pending">Pending</option>
            <option value="In Process">In Process</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      <div style={{...styles.detailBox, ...styles.fullWidth}}>
        <div style={styles.label}>Description</div>
            <textarea
              value={maintenance.description}
              readOnly
          style={styles.textarea}
            />
        </div>
      </div>
    );

  const renderAttachmentsTab = () => (
    <div style={styles.attachmentsGrid}>
          {maintenance.pictures && maintenance.pictures.length > 0 ? (
            maintenance.pictures.map((pic, index) => (
              <img
                key={index}
                src={pic}
            alt={`Attachment ${index + 1}`}
            style={styles.attachmentImage}
              />
            ))
          ) : (
            <p>No attachments available.</p>
          )}
      </div>
    );

  return (
    <>
      <AdminHeader
        title="Maintenance Details"
        adminName={admin ? `${admin.name} ${admin.lastName}` : "Admin"}
        profilePicture={admin ? admin.profileImageUrl : ""}
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

        {activeTab === "general" && (
          <div style={styles.buttonGroup}>
            <button
              onClick={handleSave}
              style={{...styles.button, ...styles.saveButton}}
            >
              Save Changes
            </button>
            <button
              onClick={handleDelete}
              style={{...styles.button, ...styles.deleteButton}}
            >
              Delete
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{...styles.button, ...styles.cancelButton}}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MaintenanceDetailsPage;
