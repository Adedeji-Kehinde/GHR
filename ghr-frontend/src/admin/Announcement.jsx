// AnnouncementManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';
import deleteImage from '/images/deleteImage.png'; // Bulk delete icon

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]); // To join createdBy user names
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]);
  const [admin, setAdmin] = useState(null);

  const API_URL =import.meta.env.VITE_API_BASE_URL ||"http://localhost:8000";
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
      // Fetch announcements
      const res = await axios.get(`${API_URL}/api/auth/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Fetch all users
      const usersRes = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(res.data);
      setUsers(usersRes.data);
      setError("");
      setSelectedAnnouncements([]); // Clear selections after refresh
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

  // Helper to truncate text to 50 characters.
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // Filter announcements based on search query.
  const filteredAnnouncements = announcements.filter((announcement) => {
    const query = searchQuery.toLowerCase();
    return (
      (announcement.title && announcement.title.toLowerCase().includes(query)) ||
      (announcement.message && announcement.message.toLowerCase().includes(query))
    );
  });

  // Sort announcements based on sortConfig.
  const sortedAnnouncements = useMemo(() => {
    let sortable = [...filteredAnnouncements];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aValue = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : "";
        const bValue = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : "";
        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredAnnouncements, sortConfig]);

  const handleSort = (columnKey) => {
    let direction = "ascending";
    if (sortConfig.key === columnKey && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: columnKey, direction });
  };

  // Toggle selection for bulk deletion.
  const toggleSelectRow = (id) => {
    setSelectedAnnouncements((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  // "Select All" toggle for visible rows.
  const toggleSelectAll = () => {
    const visibleIds = sortedAnnouncements.map((a) => a._id);
    const allSelected = visibleIds.every((id) => selectedAnnouncements.includes(id));
    if (allSelected) {
      setSelectedAnnouncements((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedAnnouncements(Array.from(new Set([...selectedAnnouncements, ...visibleIds])));
    }
  };

  // Bulk deletion handler.
  const handleDeleteSelected = async () => {
    if (selectedAnnouncements.length === 0) {
      alert("No announcements selected.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete the selected announcements?")) {
      return;
    }
    try {
      await Promise.all(
        selectedAnnouncements.map((id) =>
          axios.delete(`${API_URL}/api/auth/announcements/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      alert("Selected announcements deleted successfully!");
      fetchData();
    } catch (err) {
      console.error("Error deleting selected announcements:", err.response || err);
      alert("Error deleting selected announcements");
    }
  };

  // When a row is clicked, redirect to the announcement details page, passing the announcement in state.
  const handleRowClick = (announcement) => {
    navigate("/announcement-details", { state: { announcement } });
  };

  // Navigate to add announcement page.
  const handleAddNew = () => {
    navigate('/add-announcement');
  };

  const contentStyle = {
    marginTop: "70px", // header height
    marginLeft: "80px", // sidebar width
    padding: "2rem",
  };

  if (loading) return <p>Loading announcements...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!admin) return <p>Loading admin details...</p>;

  return (
    <>
      <AdminHeader
        title="Announcement Management"
        adminName={`${admin.name} ${admin.lastName}`}
        profilePicture={admin.profileImageUrl}
      />
      <AdminTabs />
      <div className="announcement-management" style={contentStyle}>
        {/* Summary Section */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div
            style={{
              flex: 1,
              padding: "1rem",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            <h3>Total Announcements</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{announcements.length}</p>
          </div>
          <div
            style={{
              flex: 1,
              padding: "1rem",
              border: "1px solid #ccc",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <h3>Approved</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {announcements.filter((a) => a.approved).length}
            </p>
          </div>
          <div
            onClick={handleAddNew}
            style={{
              flex: 1,
              padding: "1rem",
              border: "1px solid #ccc",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <h3>Add New Announcement</h3>
          </div>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />

        {/* Bulk Delete Icon */}
        {selectedAnnouncements.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
            <img
              src={deleteImage}
              alt="Delete Selected"
              style={{ cursor: "pointer", width: "25px", height: "25px" }}
              onClick={handleDeleteSelected}
              title="Delete Selected Announcements"
            />
          </div>
        )}

        {/* Announcements Table */}
        <table
          border="1"
          cellPadding="10"
          cellSpacing="0"
          style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th onClick={toggleSelectAll} style={{ cursor: "pointer" }}>Select All</th>
              <th onClick={() => handleSort("title")} style={{ cursor: "pointer" }}>Title</th>
              <th onClick={() => handleSort("message")} style={{ cursor: "pointer" }}>Message</th>
              <th onClick={() => handleSort("createdAt")} style={{ cursor: "pointer" }}>Created At</th>
              <th onClick={() => handleSort("createdBy")} style={{ cursor: "pointer" }}>Created By</th>
            </tr>
          </thead>
          <tbody>
            {sortedAnnouncements.map((announcement) => {
              // Truncate the message to 50 characters.
              const truncatedMessage = announcement.message.length > 50
                ? announcement.message.slice(0, 50) + "..."
                : announcement.message;
              // Find the user who created the announcement.
              const creator = users.find(
                user => user._id === announcement.createdBy
              );
              const creatorName = creator ? `${creator.name} ${creator.lastName}` : "Unknown";
              return (
                <tr
                  key={announcement._id}
                  onClick={() => handleRowClick(announcement)}
                  style={{ cursor: "pointer" }}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="radio"
                      checked={selectedAnnouncements.includes(announcement._id)}
                      onClick={() => toggleSelectRow(announcement._id)}
                      readOnly
                    />
                  </td>
                  <td>{announcement.title}</td>
                  <td>{truncatedMessage}</td>
                  <td>{new Date(announcement.createdAt).toLocaleString()}</td>
                  <td>{creatorName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AnnouncementManagement;
