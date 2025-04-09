import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";
import plusImage from "/images/plusImage.png"; // Adjust path as needed

const ManageAdmin = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // State for logged in admin (for header)
  const [currentAdmin, setCurrentAdmin] = useState(null);
  // List of all admin users
  const [admins, setAdmins] = useState([]);
  // Search query state
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Fetch all users and filter to get only admins
  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Only include users whose role is "admin"
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
    fetchAdmins();
  }, [API_URL, token]);

  // Navigate to Create Admin page
  const handleCreateAdmin = () => {
    navigate("/create-admin");
  };

  // Navigate to Admin Details page; pass selected admin via state
  const handleRowClick = (admin) => {
    navigate("/admin/details", { state: { admin } });
  };

  // Build a map from admin id to the full name for display in "Created By" column
  const adminCreatorsMap = admins.reduce((acc, admin) => {
    acc[admin._id] = `${admin.name} ${admin.lastName}`;
    return acc;
  }, {});

  // Filter admins using the search query (search by name, email, or phone)
  const filteredAdmins = admins.filter(admin => {
    const query = searchQuery.toLowerCase();
    return (
      admin.name.toLowerCase().includes(query) ||
      admin.lastName.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query) ||
      (admin.phone && admin.phone.toLowerCase().includes(query))
    );
  });

  const containerStyle = {
    marginLeft: "80px",
    marginTop: "70px",
    padding: "2rem",
  };

  return (
    <>
      <AdminHeader 
        title="Manage Admins" 
        adminName={currentAdmin ? `${currentAdmin.name} ${currentAdmin.lastName}` : "Admin"} 
        profilePicture={currentAdmin ? currentAdmin.profileImageUrl : "/images/default-admin.png"} 
      />
      <AdminTabs />
      <div style={containerStyle} className="manage-admin-container">
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
        >
          <button
            onClick={handleCreateAdmin}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.5rem", 
              padding: "0.5rem 1rem",
              cursor: "pointer",
              border: "none",
              background: "#007bff",
              color: "#fff",
              borderRadius: "4px"
            }}
          >
            <img src={plusImage} alt="Create Admin" style={{ width: "20px", height: "20px" }} />
            Create Admin
          </button>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search admins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />

        {loading ? (
          <p>Loading admin users...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              border: "1px solid #ccc"
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>Admin Name</th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>Email</th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>Phone</th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>Created By</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => (
                <tr
                  key={admin._id}
                  onClick={() => handleRowClick(admin)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                    {admin.name} {admin.lastName}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                    {admin.email}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                    {admin.phone}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                    {admin.createdBy 
                      ? adminCreatorsMap[admin.createdBy] || admin.createdBy 
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default ManageAdmin;
