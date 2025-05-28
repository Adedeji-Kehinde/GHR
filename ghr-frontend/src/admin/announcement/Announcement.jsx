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

  // Styles matching other admin pages
  const styles = {
    content: {
      marginTop: 40,
      margin: 40,
      padding: '2rem',
      width: "90vw",
      background: '#f8f9fa',
    },
    topBoxes: {
      display: 'flex',
      gap: 16,
      marginBottom: 24
    },
    box: selected => ({
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: 16,
      borderRadius: 5,
      border: selected ? '2px solid #007bff' : '1px solid #ccc',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      gap: 16,
      whiteSpace: 'nowrap'
    }),
    icon: {
      width: 40,
      height: 40,
      flexShrink: 0
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1.2
    },
    title: {
      margin: 0,
      fontSize: 14,
      fontWeight: 'bold'
    },
    count: {
      margin: 0,
      fontSize: 18,
      color: '#333'
    },
    filterBar: {
      display: 'flex',
      gap: 16,
      marginBottom: 16,
      alignItems: 'center'
    },
    search: {
      width: '100%',
      padding: 8,
      fontSize: 14
    },
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 16px',
      background: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: 14
    },
    tableCard: {
      background: '#fff',
      borderRadius: 5,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflowY: 'auto',
      maxHeight: 400,
      padding: 16
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      fontSize: 14
    },
    th: {
      padding: 8,
      borderBottom: '2px solid #ddd',
      fontWeight: 'bold'
    },
    td: {
      padding: 8,
      borderBottom: '1px solid #eee'
    }
  };

  // Add this style object near the other styles
  const statusStyles = {
    "Pending": {
      backgroundColor: '#fff3e0',  // Light orange
      color: '#e65100',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "Approved": {
      backgroundColor: '#e8f5e9',  // Light green
      color: '#2e7d32',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    }
  };

  return (
    <>
      <AdminHeader
        title="Announcement Management"
        adminName={`${admin.name} ${admin.lastName}`}
        profilePicture={admin.profileImageUrl}
      />
      <AdminTabs />

      <div style={styles.content}>
        {/* Top cards */}
        <div style={styles.topBoxes}>
          <div
            style={styles.box(filterStatus === "All")}
            onClick={() => setFilterStatus("All")}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>All Announcements</p>
              <p style={styles.count}>{countAll}</p>
            </div>
          </div>
          <div
            style={styles.box(filterStatus === "Approved")}
            onClick={() => setFilterStatus("Approved")}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>Approved</p>
              <p style={styles.count}>{countApproved}</p>
            </div>
          </div>
          <div
            style={styles.box(filterStatus === "Pending")}
            onClick={() => setFilterStatus("Pending")}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>Pending</p>
              <p style={styles.count}>{countPending}</p>
            </div>
          </div>
        </div>

        {/* Search bar and actions */}
        <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.search}
          />
          <button onClick={handleAddNew} style={styles.addButton}>
            <img src={plusIcon} alt="" style={{ width: 20, height: 20 }} />
            Add New
          </button>
        {selectedAnnouncements.length > 0 && (
            <img
              src={deleteImage}
              alt="Delete Selected"
              onClick={handleBulkDelete}
              style={{ width: 24, height: 24, cursor: 'pointer' }}
            />
          )}
          </div>

        {/* Announcements table */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
          <thead>
            <tr>
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    checked={filteredAnnouncements.length > 0 && selectedAnnouncements.length === filteredAnnouncements.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Message</th>
                <th style={styles.th}>Created At</th>
                <th style={styles.th}>Created By</th>
                <th style={styles.th}>Status</th>
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
                    <td style={styles.td} onClick={e => e.stopPropagation()}>
                    <input
                        type="checkbox"
                      checked={selectedAnnouncements.includes(announcement._id)}
                        onChange={(e) => toggleSelectRow(e, announcement._id)}
                    />
                  </td>
                    <td style={styles.td}>{announcement.title}</td>
                    <td style={styles.td}>{truncatedMessage}</td>
                    <td style={styles.td}>{new Date(announcement.createdAt).toLocaleString()}</td>
                    <td style={styles.td}>{creatorName}</td>
                    <td style={styles.td}>
                      <span style={statusStyles[announcement.approved ? "Approved" : "Pending"] || {}}>
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
