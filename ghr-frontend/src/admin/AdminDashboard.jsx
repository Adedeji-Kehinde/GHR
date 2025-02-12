import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const API_URL =  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [API_URL, token]);

  if (!user) return <p>Loading...</p>;

  const adminName = `${user.name} ${user.lastName}`;
  const profilePicture = user.profileImageUrl;
  const pageTitle = "Dashboard";

  // Content area style to push content below the fixed header and to the right of the sidebar
  const contentStyle = {
    marginTop: "70px", // header height
    marginLeft: "80px", // sidebar width (AdminTabs)
    padding: "2rem",
    textAlign: "center",
  };

  return (
    <>
      <AdminHeader title={pageTitle} adminName={adminName} profilePicture={profilePicture} />
      <AdminTabs />
      <div className="admin-dashboard-container" style={contentStyle}>
        <h2>Welcome to the Admin Dashboard</h2>
      </div>
    </>
  );
};

export default AdminDashboard;
