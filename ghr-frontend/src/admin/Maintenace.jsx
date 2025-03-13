// MaintenanceManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';
import plusImage from '/images/plusImage.png';
import deleteImage from '/images/deleteImage.png';

const MaintenanceManagement = () => {
  const [admin, setAdmin] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMaintenanceIds, setSelectedMaintenanceIds] = useState([]);
  // New state to control which requests to show
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

  // Fetch maintenance requests and users; join enquirer name
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

  // Filter based on search query
  const filteredMaintenance = maintenanceRequests.filter((request) => {
    const query = searchQuery.toLowerCase();
    return (
      request.requestId.toString().includes(query) ||
      (request.roomNumber && request.roomNumber.toLowerCase().includes(query)) ||
      (request.category && request.category.toLowerCase().includes(query)) ||
      (request.description && request.description.toLowerCase().includes(query)) ||
      (request.roomAccess && request.roomAccess.toLowerCase().includes(query)) ||
      (request.status && request.status.toLowerCase().includes(query)) ||
      (request.enquirerName && request.enquirerName.toLowerCase().includes(query))
    );
  });

  // Further filter by currentFilter (either "In Process" or "Completed")
  const filteredByStatus = filteredMaintenance.filter(request => request.status === currentFilter);

  const sortedMaintenance = useMemo(() => {
    let sortable = [...filteredByStatus];
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
  }, [filteredByStatus, sortConfig]);

  const handleSort = (columnKey) => {
    let direction = "ascending";
    if (sortConfig.key === columnKey && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: columnKey, direction });
  };

  // Toggle individual row selection using radio buttons
  const toggleSelectRow = (id) => {
    setSelectedMaintenanceIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  // Toggle "Select All" for visible rows
  const toggleSelectAll = () => {
    const visibleIds = sortedMaintenance.map(request => request._id);
    const allSelected = visibleIds.every(id => selectedMaintenanceIds.includes(id));
    if (allSelected) {
      setSelectedMaintenanceIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      const newSelected = Array.from(new Set([...selectedMaintenanceIds, ...visibleIds]));
      setSelectedMaintenanceIds(newSelected);
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
      } finally {
        setLoading(false);
      }
    }
  };

  const contentStyle = {
    marginTop: "70px",
    marginLeft: "80px",
    padding: "2rem",
  };

  if (loading) return <p>Loading maintenance requests...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!admin) return <p>Loading admin details...</p>;

  return (
    <>
      <AdminHeader
        title="Maintenance Management"
        adminName={`${admin.name} ${admin.lastName}`}
        profilePicture={admin.profileImageUrl}
      />
      <AdminTabs />
      <div className="maintenance-management" style={contentStyle}>
        {/* Summary Boxes */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
          {/* Open Requests card displays count */}
          <div
            onClick={() => setCurrentFilter("In Process")}
            style={{ border: "1px solid #ccc", padding: "1rem", flex: 1, cursor: "pointer" }}
          >
            <h3>Open Requests</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {maintenanceRequests.filter(request => request.status === "In Process").length}
            </p>
          </div>
          {/* Completed Requests card (no count displayed) */}
          <div
            onClick={() => setCurrentFilter("Completed")}
            style={{ border: "1px solid #ccc", padding: "1rem", flex: 1, cursor: "pointer", textAlign: "center" }}
          >
            <h3>Completed Requests</h3>
          </div>
          <div
            onClick={() => navigate('/add-maintenance')}
            style={{ border: "1px solid #ccc", padding: "1rem", flex: 1, cursor: "pointer", textAlign: "center" }}
          >
            <h3>Add New Request</h3>
            <img src={plusImage} alt="Add New Request" style={{ marginTop: "0.3rem", width: "50px", height: "50px" }} />
          </div>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search maintenance requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />

        {/* Bulk Delete Image */}
        {selectedMaintenanceIds.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
            <img 
              src={deleteImage} 
              alt="Delete Selected" 
              onClick={handleBulkDelete}
              style={{ cursor: "pointer", width: "25px", height: "25px" }}
              title="Delete Selected Requests"
            />
          </div>
        )}

        {/* Maintenance Requests Table */}
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th 
                style={{ cursor: 'pointer' }}
                onClick={toggleSelectAll}
                checked={sortedMaintenance.length > 0 && sortedMaintenance.every(request => selectedMaintenanceIds.includes(request._id))}
                readOnly
              >
                Select All
              </th>
              <th onClick={() => handleSort("requestId")} style={{ cursor: 'pointer' }}>Request ID</th>
              <th onClick={() => handleSort("roomNumber")} style={{ cursor: 'pointer' }}>Room Number</th>
              <th onClick={() => handleSort("category")} style={{ cursor: 'pointer' }}>Category</th>
              <th onClick={() => handleSort("description")} style={{ cursor: 'pointer' }}>Description</th>
              <th onClick={() => handleSort("roomAccess")} style={{ cursor: 'pointer' }}>Room Access</th>
              <th onClick={() => handleSort("status")} style={{ cursor: 'pointer' }}>Status</th>
              <th onClick={() => handleSort("enquirerName")} style={{ cursor: 'pointer' }}>Enquirer Name</th>
              <th onClick={() => handleSort("createdAt")} style={{ cursor: 'pointer' }}>Created At</th>
              <th onClick={() => handleSort("completedAt")} style={{ cursor: 'pointer' }}>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {sortedMaintenance.map((request) => (
              <tr
                key={request._id}
                onClick={() => navigate('/maintenance-details', { state: { maintenance: request } })}
                style={{ cursor: "pointer" }}
              >
                <td onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="radio"
                    checked={selectedMaintenanceIds.includes(request._id)}
                    onClick={() => toggleSelectRow(request._id)}
                    readOnly
                  />
                </td>
                <td>{request.requestId}</td>
                <td>{request.roomNumber}</td>
                <td>{request.category}</td>
                <td>{request.description}</td>
                <td>{request.roomAccess}</td>
                <td>{request.status}</td>
                <td>{request.enquirerName}</td>
                <td>{new Date(request.createdAt).toLocaleString()}</td>
                <td>{request.completedAt ? new Date(request.completedAt).toLocaleString() : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MaintenanceManagement;
