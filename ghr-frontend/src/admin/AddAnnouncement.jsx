// AddAnnouncement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";

const AddAnnouncement = () => {
  const API_URL =import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [announcementData, setAnnouncementData] = useState({
    title: "",
    message: "",
    approved: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [admin, setAdmin] = useState(null);

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

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]); // For single file upload
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Create a FormData object to send text fields and file together
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

  if (!admin) return <p>Loading admin details...</p>;

  return (
    <>
      <AdminHeader 
        title="Add Announcement" 
        adminName={`${admin.name} ${admin.lastName}`} 
        profilePicture={admin.profileImageUrl} 
      />
      <AdminTabs />
      <div style={{ marginTop: "70px", marginLeft: "80px", padding: "2rem", maxWidth: "600px" }}>
        <h2>Add Announcement</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Title:</label>
            <input 
              type="text" 
              name="title" 
              value={announcementData.title} 
              onChange={handleChange} 
              required 
              style={{ width: "100%", padding: "0.5rem" }} 
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Message:</label>
            <textarea 
              name="message" 
              value={announcementData.message} 
              onChange={handleChange} 
              required 
              rows="4" 
              style={{ width: "100%", padding: "0.5rem" }} 
            />
          </div>
          {/* File upload input for image attachments */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Upload Image:</label>
            <input 
              type="file" 
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <input 
                type="checkbox" 
                name="approved" 
                checked={announcementData.approved} 
                onChange={handleChange} 
              />{" "}
              Approved
            </label>
          </div>
          <button type="submit" style={{ padding: "0.5rem 1rem" }}>Add Announcement</button>
        </form>
      </div>
    </>
  );
};

export default AddAnnouncement;
