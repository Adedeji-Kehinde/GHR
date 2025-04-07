// AnnouncementDetails.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";

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
        attachments: announcementFromState.attachments, // Already an array
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

  if (loading || !admin) return <p>Loading announcement details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <AdminHeader 
        title="Edit Announcement" 
        adminName={`${admin.name} ${admin.lastName}`} 
        profilePicture={admin.profileImageUrl} 
      />
      <AdminTabs />
      <div style={{ marginTop: "70px", marginLeft: "80px", padding: "2rem", maxWidth: "600px" }}>
        <h2>Edit Announcement</h2>
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
          {/* Display uploaded attachments as images */}
          {announcementData.attachments && announcementData.attachments.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <strong>Attachments:</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.5rem" }}>
                {announcementData.attachments.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    style={{ maxWidth: "150px", maxHeight: "150px", objectFit: "cover", border: "1px solid #ccc" }}
                  />
                ))}
              </div>
            </div>
          )}
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
          <button type="submit" style={{ padding: "0.5rem 1rem" }}>
            Update Announcement
          </button>
        </form>
      </div>
    </>
  );
};

export default AnnouncementDetails;
