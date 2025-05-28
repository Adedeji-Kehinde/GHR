import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import Loading from '../../pages/components/Loading';
import plusImage from "/images/plusImage.png";
import deleteImage from '/images/deleteImage.png';

const ManageAdmin = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // State management
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAdmins, setSelectedAdmins] = useState([]);

  // Fetch the logged in admin data for header
  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentAdmin(res.data);
      } catch (err) {
        console.error("Error fetching current admin:", err.response || err);
        setError("Failed to fetch current admin details");
      }
    };
    fetchCurrentAdmin();
  }, [API_URL, token]);

  // Fetch all admin users
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const adminUsers = res.data.filter(user => user.role === "admin");
        setAdmins(adminUsers);
        setError("");
      } catch (err) {
        console.error("Error fetching admin users:", err.response || err);
        setError(err.response?.data?.message || "Error fetching admin users");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchAdmins();
  }, [API_URL, token]);

  // Filter admins based on search query
  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const query = searchQuery.toLowerCase();
      return (
        admin.name.toLowerCase().includes(query) ||
        admin.lastName.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query) ||
        (admin.phone && admin.phone.toLowerCase().includes(query))
      );
    });
  }, [admins, searchQuery]);

  // Row selection handlers
  const toggleSelectRow = (e, id) => {
    e.stopPropagation();
    setSelectedAdmins(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAll = () => {
    if (selectedAdmins.length === filteredAdmins.length) {
      setSelectedAdmins([]);
    } else {
      setSelectedAdmins(filteredAdmins.map(a => a._id));
    }
  };

  // Navigation handlers
  const handleCreateAdmin = () => {
    navigate("/create-admin");
  };

  const handleRowClick = (admin) => {
    navigate("/admin/details", { state: { admin } });
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedAdmins.length === 0) {
      alert("No admins selected");
      return;
    }
    if (window.confirm("Are you sure you want to delete the selected admins?")) {
      try {
        setLoading(true);
        await Promise.all(
          selectedAdmins.map((id) =>
            axios.delete(`${API_URL}/api/auth/users/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        setSelectedAdmins([]);
        fetchAdmins();
      } catch (error) {
        console.error("Error bulk deleting admins:", error);
        setError("Error deleting admins");
      }
    }
  };

  if (loading) return <Loading icon="/images/manageadmin.png" text="Loading admins..." />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!currentAdmin) return <Loading icon="/images/manageadmin.png" text="Loading..." />;

  // Styles matching other admin pages
  const styles = {
    content: {
      marginTop: 40,
      margin: 40,
      padding: '2rem',
      width: "90vw",
      background: '#f8f9fa',
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
    createButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      border: 'none',
      background: '#007bff',
      color: '#fff',
      borderRadius: '4px'
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
    },
    actionIcon: {
      width: 24,
      height: 24,
      cursor: 'pointer'
    }
  };

  return (
    <>
      <AdminHeader 
        title="Manage Admins" 
        adminName={`${currentAdmin.name} ${currentAdmin.lastName}`}
        profilePicture={currentAdmin.profileImageUrl || "/images/default-admin.png"}
      />
      <AdminTabs />

      <div style={styles.content}>
        {/* Action bar */}
        <div style={styles.filterBar}>
          <button onClick={handleCreateAdmin} style={styles.createButton}>
            <img src={plusImage} alt="Create Admin" style={{ width: "20px", height: "20px" }} />
            Create Admin
          </button>
        <input
          type="text"
          placeholder="Search admins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.search}
        />
          {selectedAdmins.length > 0 && (
            <img
              src={deleteImage}
              alt="Bulk Delete"
              title="Bulk Delete"
              onClick={handleBulkDelete}
              style={styles.actionIcon}
            />
          )}
        </div>

        {/* Admins table */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    checked={filteredAdmins.length > 0 && selectedAdmins.length === filteredAdmins.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={styles.th}>Admin Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Created By</th>
                <th style={styles.th}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin._id} onClick={() => handleRowClick(admin)} style={{ cursor: "pointer" }}>
                    <td style={styles.td} onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedAdmins.includes(admin._id)}
                        onChange={(e) => toggleSelectRow(e, admin._id)}
                      />
                  </td>
                    <td style={styles.td}>{`${admin.name} ${admin.lastName}`}</td>
                    <td style={styles.td}>{admin.email}</td>
                    <td style={styles.td}>{admin.phone || 'N/A'}</td>
                    <td style={styles.td}>
                      {admin.createdBy ? 
                        admins.find(a => a._id === admin.createdBy)?.name || admin.createdBy 
                        : 'N/A'}
                  </td>
                    <td style={styles.td}>
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleString() : 'N/A'}
                  </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={styles.td}>No admins found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ManageAdmin;
