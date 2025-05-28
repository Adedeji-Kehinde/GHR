// AddAnnouncement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import '../announcement/AnnouncementAdmin.css';


const AddAnnouncement = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [announcementData, setAnnouncementData] = useState({
    title: "",
    message: "",
    approved: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  // Fetch admin details
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAnnouncementData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file input change with preview
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setSelectedFilePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", announcementData.title);
    formData.append("message", announcementData.message);
    formData.append("approved", announcementData.approved);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      await axios.post(
        `${API_URL}/api/auth/announcements`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      alert("Announcement added successfully");
      navigate("/announcement");
    } catch (error) {
      console.error("Error adding announcement:", error);
      alert("Error adding announcement");
    }
  };

  if (!admin) return (
    <div className="announcement-admin-content">
      <div className="announcement-admin-section">
        <p>Loading admin details...</p>
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
            Add Announcement
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

  const renderAttachmentTab = () => (
    <div className="announcement-admin-section">
      <div className="announcement-form-group">
        <label className="announcement-label">Upload Image</label>
        <input
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          accept="image/*"
          className="announcement-file-input"
        />
        <label htmlFor="file-upload" className="announcement-file-label">
          Choose Image
        </label>
        {selectedFile && (
          <p style={{marginTop: '0.5rem', color: '#6c757d'}}>
            Selected: {selectedFile.name}
          </p>
        )}
      </div>
      {selectedFilePreview && (
        <div className="announcement-form-group">
          <label className="announcement-label">Preview</label>
          <img
            src={selectedFilePreview}
            alt="Preview"
            className="announcement-image-preview"
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      <AdminHeader 
        title="Add Announcement" 
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
            className={`announcement-tab${activeTab === "attachment" ? " active" : ""}`}
            onClick={() => setActiveTab("attachment")}
          >
            Attachment
          </div>
          </div>
        {activeTab === "general" ? renderGeneralTab() : renderAttachmentTab()}
      </div>
    </>
  );
};

export default AddAnnouncement;
