// MaintenanceDetailsPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";

const MaintenanceDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Retrieve the maintenance object passed via navigation state
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

  // Styles for tab headers (two tabs)
  const tabHeaderStyle = {
    display: "flex",
    borderBottom: "1px solid #ccc",
    marginBottom: "1rem",
  };

  const tabStyle = (tabName) => ({
    flex: 1,
    padding: "1rem",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: activeTab === tabName ? "#f5f5f5" : "#fff",
    borderBottom: activeTab === tabName ? "2px solid #007bff" : "none",
  });

  // Common box style for each individual field box
  const boxStyle = {
    border: "1px solid #ccc",
    padding: "1rem",
    borderRadius: "8px",
    backgroundColor: "#fff",
  };

  // Non-editable fields will use a different background color
  const nonEditableBoxStyle = { ...boxStyle, backgroundColor: "#f2f2f2" };

  // Render content for the General tab:
  // The first eight boxes are arranged in a 4-column grid; the description spans all 4 columns at the bottom.
  const renderGeneralTab = () => {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {/* Box 1: Request ID */}
        <div style={nonEditableBoxStyle}>
          <label style={{ fontWeight: "bold" }}>Request ID</label>
          <div>{maintenance.requestId}</div>
        </div>
        {/* Box 2: Room Number */}
        <div style={nonEditableBoxStyle}>
          <label style={{ fontWeight: "bold" }}>Room Number</label>
          <div>{maintenance.roomNumber}</div>
        </div>
        {/* Box 3: Enquirer Name */}
        <div style={nonEditableBoxStyle}>
          <label style={{ fontWeight: "bold" }}>Enquirer Name</label>
          <div>{maintenance.enquirerName}</div>
        </div>
        {/* Box 4: Created At */}
        <div style={nonEditableBoxStyle}>
          <label style={{ fontWeight: "bold" }}>Created At</label>
          <div>{formattedCreatedAt}</div>
        </div>
        {/* Box 5: Completed At */}
        <div style={nonEditableBoxStyle}>
          <label style={{ fontWeight: "bold" }}>Completed At</label>
          <div>{formattedCompletedAt}</div>
        </div>
        {/* Box 6: Category */}
        <div style={nonEditableBoxStyle}>
          <label style={{ fontWeight: "bold" }}>Category</label>
          <div>{maintenance.category}</div>
        </div>
        {/* Box 7: Room Access */}
        <div style={nonEditableBoxStyle}>
          <label style={{ fontWeight: "bold" }}>Room Access</label>
          <div>{maintenance.roomAccess}</div>
        </div>
        {/* Box 8: Status (Editable) */}
        <div style={boxStyle}>
          <label style={{ fontWeight: "bold" }}>Status</label>
          <select
            name="status"
            value={updatedMaintenance.status}
            onChange={handleFieldChange}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "5px" }}
          >
            <option value="In Process">In Process</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        {/* Box 9: Description spanning all 4 columns */}
        <div style={{ gridColumn: "span 4" }}>
          <div style={nonEditableBoxStyle}>
            <label style={{ fontWeight: "bold" }}>Description</label>
            <textarea
              value={maintenance.description}
              readOnly
              rows={10}
              style={{
                width: "100%",
                resize: "none",
                border: "none",
                backgroundColor: "inherit",
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render content for the Attachments tab (with larger images)
  const renderAttachmentsTab = () => {
    return (
      <div style={boxStyle}>
        <h3>Attachments</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {maintenance.pictures && maintenance.pictures.length > 0 ? (
            maintenance.pictures.map((pic, index) => (
              <img
                key={index}
                src={pic}
                alt={`Attachment ${index}`}
                style={{
                  width: "300px",
                  height: "auto",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
            ))
          ) : (
            <p>No attachments available.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <AdminHeader
        title="Maintenance Details"
        adminName={admin ? `${admin.name} ${admin.lastName}` : "Admin"}
        profilePicture={admin ? admin.profileImageUrl : ""}
      />
      <AdminTabs />
      <div style={{ margin: "3rem", paddingLeft: "2rem" }}>
        {/* Tab Headers */}
        <div style={tabHeaderStyle}>
          <div style={tabStyle("general")} onClick={() => setActiveTab("general")}>
            General
          </div>
          <div style={tabStyle("attachments")} onClick={() => setActiveTab("attachments")}>
            Attachments
          </div>
        </div>
        {/* Render Active Tab Content */}
        {activeTab === "general" ? renderGeneralTab() : renderAttachmentsTab()}
        {/* Action Buttons: Only on General tab */}
        {activeTab === "general" && (
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button onClick={handleSave} style={{ padding: "0.75rem 1.5rem" }}>
              Save
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "red",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Delete
            </button>
            <button onClick={() => navigate(-1)} style={{ padding: "0.75rem 1.5rem" }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MaintenanceDetailsPage;
