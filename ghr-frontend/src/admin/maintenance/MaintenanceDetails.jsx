// MaintenanceDetailsPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import './maintenance.css';

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

  const renderGeneralTab = () => (
    <div className="maintenance-details-grid">
      <div className="maintenance-details-box">
        <div className="maintenance-details-label">Request ID</div>
        <div className="maintenance-details-value">{maintenance.requestId}</div>
      </div>
      <div className="maintenance-details-box">
        <div className="maintenance-details-label">Room Number</div>
        <div className="maintenance-details-value">{maintenance.roomNumber}</div>
      </div>
      <div className="maintenance-details-box">
        <div className="maintenance-details-label">Category</div>
        <div className="maintenance-details-value">{maintenance.category}</div>
      </div>
      <div className="maintenance-details-box">
        <div className="maintenance-details-label">Room Access</div>
        <div className="maintenance-details-value">{maintenance.roomAccess}</div>
      </div>
      <div className="maintenance-details-box">
        <div className="maintenance-details-label">Created At</div>
        <div className="maintenance-details-value">{formattedCreatedAt}</div>
      </div>
      <div className="maintenance-details-box">
        <div className="maintenance-details-label">Completed At</div>
        <div className="maintenance-details-value">{formattedCompletedAt}</div>
      </div>
      <div className="maintenance-details-box">
        <div className="maintenance-details-label">Enquirer Name</div>
        <div className="maintenance-details-value">{maintenance.enquirerName}</div>
      </div>
      <div className="maintenance-details-box">
        <div className="maintenance-details-label">Status</div>
        <select
          name="status"
          value={updatedMaintenance.status}
          onChange={handleFieldChange}
          className="maintenance-details-select"
        >
          <option value="Pending">Pending</option>
          <option value="In Process">In Process</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div className="maintenance-details-box" style={{ gridColumn: '1 / -1' }}>
        <div className="maintenance-details-label">Description</div>
        <textarea
          value={maintenance.description}
          readOnly
          className="maintenance-details-textarea"
        />
      </div>
    </div>
  );

  const renderAttachmentsTab = () => (
    <div className="maintenance-details-attachments-grid">
      {maintenance.pictures && maintenance.pictures.length > 0 ? (
        maintenance.pictures.map((pic, index) => (
          <img
            key={index}
            src={pic}
            alt={`Attachment ${index + 1}`}
            className="maintenance-details-attachment-image"
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
      
      <div className="maintenance-details-content">
        <div className="maintenance-details-tab-header">
          <div
            className={`maintenance-details-tab ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            General
          </div>
          <div
            className={`maintenance-details-tab ${activeTab === "attachments" ? "active" : ""}`}
            onClick={() => setActiveTab("attachments")}
          >
            Attachments
          </div>
        </div>

        {activeTab === "general" ? renderGeneralTab() : renderAttachmentsTab()}

        {activeTab === "general" && (
          <div className="maintenance-details-button-group">
            <button
              onClick={handleSave}
              className="maintenance-details-button maintenance-details-save-btn"
            >
              Save Changes
            </button>
            <button
              onClick={handleDelete}
              className="maintenance-details-button maintenance-details-delete-btn"
            >
              Delete
            </button>
            <button
              onClick={() => navigate(-1)}
              className="maintenance-details-button maintenance-details-cancel-btn"
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
