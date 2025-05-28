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
import './maintenance.css';

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

  return (
    <>
      <AdminHeader
        title="Maintenance Management"
        adminName={`${admin.name} ${admin.lastName}`}
        profilePicture={admin.profileImageUrl}
      />
      <AdminTabs />

      <div className="maintenance-management-content">
        {/* Top cards */}
        <div className="maintenance-management-top-boxes">
          <div
            className={`maintenance-management-box ${currentFilter === "All" ? "selected" : ""}`}
            onClick={() => setCurrentFilter("All")}
          >
            <img src={bookedIcon} alt="" className="maintenance-management-icon"/>
            <div className="maintenance-management-text-container">
              <p className="maintenance-management-title">All Requests</p>
              <p className="maintenance-management-count">{countAll}</p>
            </div>
          </div>
          <div
            className={`maintenance-management-box ${currentFilter === "In Process" ? "selected" : ""}`}
            onClick={() => setCurrentFilter("In Process")}
          >
            <img src={bookedIcon} alt="" className="maintenance-management-icon"/>
            <div className="maintenance-management-text-container">
              <p className="maintenance-management-title">In Process</p>
              <p className="maintenance-management-count">{countInProcess}</p>
            </div>
          </div>
          <div
            className={`maintenance-management-box ${currentFilter === "Completed" ? "selected" : ""}`}
            onClick={() => setCurrentFilter("Completed")}
          >
            <img src={bookedIcon} alt="" className="maintenance-management-icon"/>
            <div className="maintenance-management-text-container">
              <p className="maintenance-management-title">Completed</p>
              <p className="maintenance-management-count">{countCompleted}</p>
            </div>
          </div>
        </div>

        {/* Search + Add New */}
        <div className="maintenance-management-filter-bar">
          <input
            type="text"
            placeholder="Search maintenance requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="maintenance-management-search"
          />
          <button
            className="maintenance-management-add-btn"
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
        <div className="maintenance-management-table-card">
          <table className="maintenance-management-table">
            <thead>
              <tr>
                <th className="maintenance-management-th">
                  <input
                    type="checkbox"
                    checked={filteredMaintenance.length > 0 && selectedMaintenanceIds.length === filteredMaintenance.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="maintenance-management-th">Request ID</th>
                <th className="maintenance-management-th">Room Number</th>
                <th className="maintenance-management-th">Category</th>
                <th className="maintenance-management-th">Description</th>
                <th className="maintenance-management-th">Room Access</th>
                <th className="maintenance-management-th">Status</th>
                <th className="maintenance-management-th">Enquirer Name</th>
                <th className="maintenance-management-th">Created At</th>
                <th className="maintenance-management-th">Completed At</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaintenance.map((request) => (
                <tr
                  key={request._id}
                  onClick={() => navigate('/maintenance-details', { state: { maintenance: request } })}
                  style={{ cursor: "pointer" }}
                >
                  <td className="maintenance-management-td" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox"
                      checked={selectedMaintenanceIds.includes(request._id)}
                      onChange={(e) => toggleSelectRow(e, request._id)}
                    />
                  </td>
                  <td className="maintenance-management-td">{request.requestId}</td>
                  <td className="maintenance-management-td">{request.roomNumber}</td>
                  <td className="maintenance-management-td">{request.category}</td>
                  <td className="maintenance-management-td">{request.description}</td>
                  <td className="maintenance-management-td">{request.roomAccess}</td>
                  <td className="maintenance-management-td">
                    <span className={`status-${request.status.toLowerCase().replace(' ', '-')}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="maintenance-management-td">{request.enquirerName}</td>
                  <td className="maintenance-management-td">{new Date(request.createdAt).toLocaleString()}</td>
                  <td className="maintenance-management-td">{request.completedAt ? new Date(request.completedAt).toLocaleString() : "N/A"}</td>
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
