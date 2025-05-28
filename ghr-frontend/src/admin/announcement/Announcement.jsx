// AnnouncementManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import deleteImage from '/images/deleteImage.png';
import Loading from '../../pages/components/Loading';
import bookedIcon from '/images/booked.png';
import plusIcon from '/images/plusImage.png';
import '../announcement/AnnouncementAdmin.css';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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

  // Fetch announcements and users from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const [announcementsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/auth/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      setAnnouncements(announcementsRes.data);
      setUsers(usersRes.data);
      setError("");
      setSelectedAnnouncements([]);
    } catch (err) {
      console.error("Error fetching announcements:", err.response || err);
      setError(err.response?.data?.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_URL, token]);

  const countAll = announcements.length;
  const countApproved = announcements.filter(a => a.approved).length;
  const countPending = announcements.filter(a => !a.approved).length;

  // Filter announcements based on search query and status
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
    const query = searchQuery.toLowerCase();
      const searchMatches = (
      (announcement.title && announcement.title.toLowerCase().includes(query)) ||
      (announcement.message && announcement.message.toLowerCase().includes(query))
    );
      
      const statusMatches = filterStatus === "All" || 
        (filterStatus === "Approved" && announcement.approved) ||
        (filterStatus === "Pending" && !announcement.approved);
      
      return searchMatches && statusMatches;
    });
  }, [announcements, searchQuery, filterStatus]);

  const toggleSelectRow = (e, id) => {
    e.stopPropagation();
    setSelectedAnnouncements(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAll = () => {
    if (selectedAnnouncements.length === filteredAnnouncements.length) {
      setSelectedAnnouncements([]);
    } else {
      setSelectedAnnouncements(filteredAnnouncements.map(announcement => announcement._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAnnouncements.length === 0) {
      alert("No announcements selected");
      return;
    }
    if (window.confirm("Are you sure you want to delete the selected announcements?")) {
    try {
        setLoading(true);
        await Promise.all(selectedAnnouncements.map(id =>
          axios.delete(`${API_URL}/api/auth/announcements/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ));
        setSelectedAnnouncements([]);
      fetchData();
    } catch (err) {
        console.error("Error deleting announcements:", err.response || err);
        alert("Error deleting announcements");
      }
    }
  };

  const handleRowClick = (announcement) => {
    navigate("/announcement-details", { state: { announcement } });
  };

  const handleAddNew = () => {
    navigate('/add-announcement');
  };

  if (loading) return <Loading icon="/images/announcement.png" text="Loading announcements..." />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!admin) return <Loading icon="/images/announcement.png" text="Loading announcements..." />;

  return (
    <>
      <AdminHeader
        title="Announcement Management"
        adminName={`${admin.name} ${admin.lastName}`}
        profilePicture={admin.profileImageUrl}
      />
      <AdminTabs />
      <div className="announcement-admin-content">
        {/* Top cards */}
        <div className="announcement-top-boxes">
          <div
            className={`announcement-box${filterStatus === "All" ? " selected" : ""}`}
            onClick={() => setFilterStatus("All")}
          >
            <img src={bookedIcon} alt="" className="announcement-icon"/>
            <div className="announcement-text-container">
              <p className="announcement-title">All Announcements</p>
              <p className="announcement-count">{countAll}</p>
            </div>
          </div>
          <div
            className={`announcement-box${filterStatus === "Approved" ? " selected" : ""}`}
            onClick={() => setFilterStatus("Approved")}
          >
            <img src={bookedIcon} alt="" className="announcement-icon"/>
            <div className="announcement-text-container">
              <p className="announcement-title">Approved</p>
              <p className="announcement-count">{countApproved}</p>
            </div>
          </div>
          <div
            className={`announcement-box${filterStatus === "Pending" ? " selected" : ""}`}
            onClick={() => setFilterStatus("Pending")}
          >
            <img src={bookedIcon} alt="" className="announcement-icon"/>
            <div className="announcement-text-container">
              <p className="announcement-title">Pending</p>
              <p className="announcement-count">{countPending}</p>
            </div>
          </div>
        </div>
        {/* Search bar and actions */}
        <div className="announcement-filter-bar">
        <input
          type="text"
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
            className="announcement-search"
          />
          <button onClick={handleAddNew} className="announcement-add-btn">
            <img src={plusIcon} alt="" style={{ width: 20, height: 20 }} />
            Add New
          </button>
        {selectedAnnouncements.length > 0 && (
            <img
              src={deleteImage}
              alt="Delete Selected"
              onClick={handleBulkDelete}
              className="announcement-delete-btn"
            />
          )}
          </div>
        {/* Announcements table */}
        <div className="announcement-table-card">
          <table className="announcement-table">
          <thead>
            <tr>
                <th className="announcement-th">
                  <input
                    type="checkbox"
                    checked={filteredAnnouncements.length > 0 && selectedAnnouncements.length === filteredAnnouncements.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="announcement-th">Title</th>
                <th className="announcement-th">Message</th>
                <th className="announcement-th">Created At</th>
                <th className="announcement-th">Created By</th>
                <th className="announcement-th">Status</th>
            </tr>
          </thead>
          <tbody>
              {filteredAnnouncements.map((announcement) => {
              const truncatedMessage = announcement.message.length > 50
                ? announcement.message.slice(0, 50) + "..."
                : announcement.message;
                const creator = users.find(user => user._id === announcement.createdBy);
              const creatorName = creator ? `${creator.name} ${creator.lastName}` : "Unknown";
              return (
                <tr
                  key={announcement._id}
                  onClick={() => handleRowClick(announcement)}
                  style={{ cursor: "pointer" }}
                >
                    <td className="announcement-td" onClick={e => e.stopPropagation()}>
                    <input
                        type="checkbox"
                      checked={selectedAnnouncements.includes(announcement._id)}
                        onChange={(e) => toggleSelectRow(e, announcement._id)}
                    />
                  </td>
                    <td className="announcement-td">{announcement.title}</td>
                    <td className="announcement-td">{truncatedMessage}</td>
                    <td className="announcement-td">{new Date(announcement.createdAt).toLocaleString()}</td>
                    <td className="announcement-td">{creatorName}</td>
                    <td className="announcement-td">
                      <span className={announcement.approved ? "announcement-status-approved" : "announcement-status-pending"}>
                        {announcement.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
};

export default AnnouncementManagement;
