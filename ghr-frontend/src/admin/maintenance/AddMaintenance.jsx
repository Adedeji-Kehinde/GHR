// AddMaintenance.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";

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

  // Styles matching other admin pages
  const styles = {
    content: {
      marginTop: 40,
      margin: 40,
      padding: '2rem',
      width: "90vw",
      background: '#f8f9fa',
    },
    section: {
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      marginBottom: "2rem",
    },
    searchSection: {
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      marginBottom: "2rem",
    },
    selectedUser: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
      padding: '1rem',
      borderRadius: '4px',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      fontSize: '1.1rem',
      fontWeight: '500',
    },
    searchInput: {
      width: "100%",
      padding: "0.75rem",
      fontSize: "1.1rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      marginBottom: "0.5rem",
    },
    searchResults: {
      maxHeight: "200px",
      overflowY: "auto",
      border: "1px solid #ced4da",
      borderRadius: "4px",
      backgroundColor: "#fff",
      marginTop: "0.5rem",
    },
    searchResultItem: {
      padding: "0.75rem",
      cursor: "pointer",
      borderBottom: "1px solid #ced4da",
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    },
    formGroup: {
      marginBottom: "1.5rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "500",
      color: "#495057",
      fontSize: "1.1rem",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      fontSize: "1.1rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
    },
    select: {
      width: "100%",
      padding: "0.75rem",
      fontSize: "1.1rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      backgroundColor: "#fff",
    },
    textarea: {
      width: "100%",
      padding: "0.75rem",
      fontSize: "1.1rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      minHeight: "150px",
      resize: "vertical",
    },
    buttonGroup: {
      display: "flex",
      gap: "1rem",
      justifyContent: "flex-end",
      marginTop: "2rem",
    },
    button: {
      padding: "0.75rem 1.5rem",
      fontSize: "1.1rem",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontWeight: "500",
      transition: "background-color 0.2s",
    },
    primaryButton: {
      backgroundColor: "#007bff",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#0056b3",
      },
    },
    errorMessage: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "1rem",
      borderRadius: "4px",
      marginBottom: "1rem",
      fontSize: "1.1rem",
    },
  };

  if (!admin) return (
    <div style={styles.content}>
      <div style={styles.section}>
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
      
      <div style={styles.content}>
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleAddMaintenance}>
          {/* Search Section */}
          <div style={styles.searchSection}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Search Recipient</label>
              {newMaintenance.roomNumber && (
                <div style={styles.selectedUser}>
                  <span>Selected: {userSearchQuery}</span>
                </div>
              )}
              <input
                type="text"
                placeholder="Search by name or room number..."
                value={userSearchQuery}
                onChange={handleUserSearchChange}
                style={styles.searchInput}
              />
              {userSearchQuery && !newMaintenance.roomNumber && (
                <div style={styles.searchResults}>
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      style={styles.searchResultItem}
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
            <div style={styles.section}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  name="category"
                  value={newMaintenance.category}
                  onChange={handleNewMaintenanceChange}
                  style={styles.select}
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

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={newMaintenance.description}
                  onChange={handleNewMaintenanceChange}
                  required
                  placeholder="Please describe the maintenance issue..."
                  style={styles.textarea}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Room Access</label>
                <select
                  name="roomAccess"
                  value={newMaintenance.roomAccess}
                  onChange={handleNewMaintenanceChange}
                  style={styles.select}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={{...styles.button, backgroundColor: "#6c757d", color: "#fff"}}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{...styles.button, ...styles.primaryButton}}
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
