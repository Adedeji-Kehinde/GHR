// AnnouncementDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import '../announcement/AnnouncementAdmin.css';


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

  if (loading || !admin) return (
    <div className="announcement-admin-content">
      <div className="announcement-admin-section">
        <p>Loading announcement details...</p>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="announcement-admin-section">
      <form onSubmit={handleSubmit}>
        <div className="announcement-form-group">
          <label className="announcement-label">Title</label>
          <input
            type="text"
            name="title"
            value={announcementData.title}
            onChange={handleChange}
            required
            className="announcement-input"
          />
        </div>
        <div className="announcement-form-group">
          <label className="announcement-label">Message</label>
          <textarea
            name="message"
            value={announcementData.message}
            onChange={handleChange}
            required
            className="announcement-textarea"
          />
        </div>
        <div className="announcement-status-section">
          <div>
            <label className="announcement-label">Status</label>
            <div className={announcementData.approved ? 'announcement-status-approved' : 'announcement-status-pending'}>
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
              className="announcement-checkbox"
            />
          </div>
        </div>
        <div className="announcement-button-group">
          <button
            type="submit"
            className="announcement-btn save"
          >
            Update Announcement
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="announcement-btn cancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderAttachmentsTab = () => (
    <div className="announcement-admin-section">
      {announcementData.attachments && announcementData.attachments.length > 0 ? (
        <div className="announcement-attachments-grid">
          {announcementData.attachments.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Attachment ${index + 1}`}
              className="announcement-attachment-image"
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
      <div className="announcement-admin-content">
        <div className="announcement-tab-header">
          <div
            className={`announcement-tab${activeTab === "general" ? " active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            General
          </div>
          <div
            className={`announcement-tab${activeTab === "attachments" ? " active" : ""}`}
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
