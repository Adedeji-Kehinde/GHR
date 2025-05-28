// MaintenanceManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import plusImage from '/images/plusImage.png';
import deleteImage from '/images/deleteImage.png';
import Loading from '../../pages/components/Loading';
import bookedIcon from '/images/booked.png';

const MaintenanceManagement = () => {
  const [admin, setAdmin] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMaintenanceIds, setSelectedMaintenanceIds] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("In Process");

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

  // Fetch maintenance requests and users
  const fetchData = async () => {
    setLoading(true);
    try {
      const maintenanceRes = await axios.get(`${API_URL}/api/maintenance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersRes = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const maintenanceData = maintenanceRes.data;
      const usersData = usersRes.data;
      setUsers(usersData);

      const joinedData = maintenanceData.map((request) => {
        const matchingUser = usersData.find(user => user.roomNumber === request.roomNumber);
        return {
          ...request,
          enquirerName: matchingUser ? `${matchingUser.name} ${matchingUser.lastName}` : "Not Found"
        };
      });
      setMaintenanceRequests(joinedData);
      setError("");
      setSelectedMaintenanceIds([]);
    } catch (err) {
      console.error("Error fetching maintenance data:", err.response || err);
      setError(err.response?.data?.message || "Error fetching maintenance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_URL, token]);

  const countAll = maintenanceRequests.length;
  const countInProcess = maintenanceRequests.filter(request => request.status === "In Process").length;
  const countCompleted = maintenanceRequests.filter(request => request.status === "Completed").length;

  const filteredMaintenance = useMemo(() => {
    return maintenanceRequests.filter((request) => {
    const query = searchQuery.toLowerCase();
      const searchMatches = (
      request.requestId.toString().includes(query) ||
      (request.roomNumber && request.roomNumber.toLowerCase().includes(query)) ||
      (request.category && request.category.toLowerCase().includes(query)) ||
      (request.description && request.description.toLowerCase().includes(query)) ||
      (request.roomAccess && request.roomAccess.toLowerCase().includes(query)) ||
      (request.status && request.status.toLowerCase().includes(query)) ||
      (request.enquirerName && request.enquirerName.toLowerCase().includes(query))
    );
      const statusMatches = currentFilter === "All" || request.status === currentFilter;
      return searchMatches && statusMatches;
    });
  }, [maintenanceRequests, searchQuery, currentFilter]);

  const toggleSelectRow = (e, id) => {
    e.stopPropagation();
    setSelectedMaintenanceIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAll = () => {
    if (selectedMaintenanceIds.length === filteredMaintenance.length) {
      setSelectedMaintenanceIds([]);
    } else {
      setSelectedMaintenanceIds(filteredMaintenance.map(request => request._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMaintenanceIds.length === 0) {
      alert("No rows selected");
      return;
    }
    if (window.confirm("Are you sure you want to delete the selected maintenance requests?")) {
      try {
        setLoading(true);
        await Promise.all(selectedMaintenanceIds.map(id =>
          axios.delete(`${API_URL}/api/maintenance/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ));
        setSelectedMaintenanceIds([]);
        fetchData();
      } catch (err) {
        console.error("Error deleting maintenance requests:", err.response || err);
        alert("Error deleting maintenance requests");
      }
    }
  };

  if (loading) return <Loading icon="/images/maintenance.png" text="Loading maintenance details..." />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!admin) return <Loading icon="/images/maintenance.png" text="Loading maintenance details..." />;

  // Styles matching BookingManagement.jsx
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
      width: '75%',
      padding: 8,
      fontSize: 14
    },
    addBtn: {
      width: '25%',
      padding: 8,
      fontSize: 14,
      background: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer'
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

  // Add standardized status styles
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

  return (
    <>
      <AdminHeader
        title="Maintenance Management"
        adminName={`${admin.name} ${admin.lastName}`}
        profilePicture={admin.profileImageUrl}
      />
      <AdminTabs />

      <div style={styles.content}>
        {/* Top cards */}
        <div style={styles.topBoxes}>
          <div
            style={styles.box(currentFilter === "All")}
            onClick={() => setCurrentFilter("All")}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>All Requests</p>
              <p style={styles.count}>{countAll}</p>
            </div>
          </div>
          <div
            style={styles.box(currentFilter === "In Process")}
            onClick={() => setCurrentFilter("In Process")}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>In Process</p>
              <p style={styles.count}>{countInProcess}</p>
            </div>
          </div>
          <div
            style={styles.box(currentFilter === "Completed")}
            onClick={() => setCurrentFilter("Completed")}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>Completed</p>
              <p style={styles.count}>{countCompleted}</p>
            </div>
          </div>
        </div>

        {/* Search + Add New */}
        <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Search maintenance requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.search}
          />
          <button
            style={styles.addBtn}
            onClick={() => navigate('/add-maintenance')}
          >
            Add New Request
          </button>
        {selectedMaintenanceIds.length > 0 && (
            <img 
              src={deleteImage} 
              alt="Delete Selected" 
              onClick={handleBulkDelete}
              style={{ width: 24, height: 24, cursor: 'pointer' }}
            />
          )}
          </div>

        {/* Maintenance table */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
          <thead>
            <tr>
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    checked={filteredMaintenance.length > 0 && selectedMaintenanceIds.length === filteredMaintenance.length}
                    onChange={handleSelectAll}
                  />
              </th>
                <th style={styles.th}>Request ID</th>
                <th style={styles.th}>Room Number</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Room Access</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Enquirer Name</th>
                <th style={styles.th}>Created At</th>
                <th style={styles.th}>Completed At</th>
            </tr>
          </thead>
          <tbody>
              {filteredMaintenance.map((request) => (
              <tr
                key={request._id}
                onClick={() => navigate('/maintenance-details', { state: { maintenance: request } })}
                style={{ cursor: "pointer" }}
              >
                  <td style={styles.td} onClick={e => e.stopPropagation()}>
                  <input 
                      type="checkbox"
                    checked={selectedMaintenanceIds.includes(request._id)}
                      onChange={(e) => toggleSelectRow(e, request._id)}
                  />
                </td>
                  <td style={styles.td}>{request.requestId}</td>
                  <td style={styles.td}>{request.roomNumber}</td>
                  <td style={styles.td}>{request.category}</td>
                  <td style={styles.td}>{request.description}</td>
                  <td style={styles.td}>{request.roomAccess}</td>
                  <td style={styles.td}>
                    <span style={statusStyles[request.status] || {}}>
                      {request.status}
                    </span>
                  </td>
                  <td style={styles.td}>{request.enquirerName}</td>
                  <td style={styles.td}>{new Date(request.createdAt).toLocaleString()}</td>
                  <td style={styles.td}>{request.completedAt ? new Date(request.completedAt).toLocaleString() : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
};

export default MaintenanceManagement;
