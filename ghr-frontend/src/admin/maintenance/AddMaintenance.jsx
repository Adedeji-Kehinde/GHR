// AddMaintenance.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import './maintenance.css';

const AddMaintenance = () => {
  const [admin, setAdmin] = useState(null);
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

  // Form state for maintenance request
  const [newMaintenance, setNewMaintenance] = useState({
    roomNumber: "",
    category: "Appliances",
    description: "",
    roomAccess: "Yes"
  });
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch users for recipient selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err.response || err);
      }
    };
    fetchUsers();
  }, [API_URL, token]);

  const handleNewMaintenanceChange = (e) => {
    setNewMaintenance({ ...newMaintenance, [e.target.name]: e.target.value });
  };

  const handleUserSearchChange = (e) => {
    setUserSearchQuery(e.target.value);
    setNewMaintenance({ ...newMaintenance, roomNumber: "" });
  };

  const filteredUsers = useMemo(() => {
    const query = userSearchQuery.toLowerCase();
    return users.filter(user =>
      user.roomNumber &&
      ((user.name && user.name.toLowerCase().includes(query)) ||
       (user.lastName && user.lastName.toLowerCase().includes(query)) ||
       (user.roomNumber && user.roomNumber.toLowerCase().includes(query)))
    );
  }, [users, userSearchQuery]);

  const handleSelectUser = (user) => {
    setNewMaintenance({ ...newMaintenance, roomNumber: user.roomNumber });
    setUserSearchQuery(`${user.name} ${user.lastName} | ${user.roomNumber}`);
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/maintenance/register`, newMaintenance, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/maintenance");
    } catch (err) {
      console.error("Error adding maintenance request:", err.response || err);
      setError(err.response?.data?.message || "Error adding maintenance request");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return (
    <div className="add-maintenance-content">
      <div className="add-maintenance-section">
        <p>Loading admin details...</p>
      </div>
    </div>
  );

  return (
    <>
      <AdminHeader 
        title="Add Maintenance Request" 
        adminName={`${admin.name} ${admin.lastName}`} 
        profilePicture={admin.profileImageUrl} 
      />
      <AdminTabs />
      
      <div className="add-maintenance-content">
        {error && (
          <div className="add-maintenance-error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleAddMaintenance}>
          {/* Search Section */}
          <div className="add-maintenance-search-section">
            <div className="add-maintenance-form-group">
              <label className="add-maintenance-label">Search Recipient</label>
              {newMaintenance.roomNumber && (
                <div className="add-maintenance-selected-user">
                  <span>Selected: {userSearchQuery}</span>
                </div>
              )}
              <input
                type="text"
                placeholder="Search by name or room number..."
                value={userSearchQuery}
                onChange={handleUserSearchChange}
                className="add-maintenance-search-input"
              />
              {userSearchQuery && !newMaintenance.roomNumber && (
                <div className="add-maintenance-search-results">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className="add-maintenance-search-result-item"
                    >
                      {user.name} {user.lastName} | {user.roomNumber}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Maintenance Details Section */}
          {newMaintenance.roomNumber && (
            <div className="add-maintenance-section">
              <div className="add-maintenance-form-group">
                <label className="add-maintenance-label">Category</label>
                <select
                  name="category"
                  value={newMaintenance.category}
                  onChange={handleNewMaintenanceChange}
                  className="add-maintenance-select"
                >
                  {[
                    "Appliances",
                    "Cleaning",
                    "Plumbing & Leaking",
                    "Heating",
                    "Lighting",
                    "Windows & Doors",
                    "Furniture & Fitting",
                    "Flooring",
                    "Other"
                  ].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="add-maintenance-form-group">
                <label className="add-maintenance-label">Description</label>
                <textarea
                  name="description"
                  value={newMaintenance.description}
                  onChange={handleNewMaintenanceChange}
                  required
                  placeholder="Please describe the maintenance issue..."
                  className="add-maintenance-textarea"
                />
              </div>

              <div className="add-maintenance-form-group">
                <label className="add-maintenance-label">Room Access</label>
                <select
                  name="roomAccess"
                  value={newMaintenance.roomAccess}
                  onChange={handleNewMaintenanceChange}
                  className="add-maintenance-select"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="add-maintenance-button-group">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="add-maintenance-button add-maintenance-cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="add-maintenance-button add-maintenance-primary-button"
                >
                  {loading ? "Adding..." : "Add Maintenance Request"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default AddMaintenance;
