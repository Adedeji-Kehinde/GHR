import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  // Editable admin information (only the fields needed)
  const [adminInfo, setAdminInfo] = useState({
    name: "",
    lastName: "",
    email: "",
    gender: "",
    profileImageUrl: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setAdminInfo({
          name: res.data.name || "",
          lastName: res.data.lastName || "",
          email: res.data.email || "",
          gender: res.data.gender || "",
          profileImageUrl: res.data.profileImageUrl || "",
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [API_URL, token, navigate]);

  const saveAdminInfo = async () => {
    try {
      await axios.put(
        `${API_URL}/api/auth/updatePersonal`,
        { ...adminInfo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser((prev) => ({ ...prev, ...adminInfo }));
      alert("Admin information updated");
      setEditing(false);
    } catch (error) {
      console.error("Error updating admin info", error);
      alert("Update failed");
    }
  };

  const handleProfilePicClick = () => {
    const confirmEdit = window.confirm("Do you want to change your profile image?");
    if (confirmEdit) {
      fileInputRef.current.click();
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await axios.put(
        `${API_URL}/api/auth/update-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAdminInfo((prev) => ({ ...prev, profileImageUrl: response.data.profileImageUrl }));
      alert("Profile picture updated");
    } catch (error) {
      console.error("Error updating profile picture", error);
      alert("Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  // Dashboard container with two columns: left (80%) and right (20%)
  const dashboardContainerStyle = {
    display: "flex",
    marginTop: "70px", // below fixed header
  };

  const leftColumnStyle = {
    flex: 4,
    padding: "7rem"
  };

  const rightColumnStyle = {
    flex: 1,
    padding: "2rem",
    borderLeft: "1px solid #ddd",
    minWidth: "250px",
  };

  const containerStyle = {
    margin: "0 40px",
    fontFamily: "'Open Sans', sans-serif",
    color: "#333",
    textAlign: "left",
  };

  const fieldStyle = {
    marginBottom: "10px",
    fontSize: "1.1rem",
  };

  const inputStyle = {
    padding: "5px",
    fontSize: "1rem",
    marginTop: "5px",
  };

  const profileImageStyle = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    cursor: "pointer",
    marginBottom: "20px",
  };

  const editTextStyle = {
    fontSize: "0.9rem",
    color: "#007bff",
    cursor: "pointer",
    marginTop: "20px",
  };

  return (
    <>
      <AdminHeader 
        title="Dashboard" 
        adminName={`${adminInfo.name} ${adminInfo.lastName}`} 
        profilePicture={adminInfo.profileImageUrl} 
      />
      <AdminTabs />
      <div style={dashboardContainerStyle}>
        {/* Left Column for Future Content */}
        <div style={leftColumnStyle}>
          <h2>Other Dashboard Contents</h2>
          <p>This area is reserved for future content.</p>
        </div>
        {/* Right Column: Admin Profile Section */}
        <div style={rightColumnStyle}>
          <div style={containerStyle}>
            <h2>Admin Profile</h2>
            <div>
              <img
                src={adminInfo.profileImageUrl}
                alt="Admin Profile"
                style={profileImageStyle}
                onClick={handleProfilePicClick}
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleProfilePicChange}
              />
            </div>
            <div style={fieldStyle}>
              <strong>Name:</strong>{" "}
              {editing ? (
                <>
                  <input
                    type="text"
                    style={inputStyle}
                    value={adminInfo.name}
                    onChange={(e) => setAdminInfo({ ...adminInfo, name: e.target.value })}
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    style={inputStyle}
                    value={adminInfo.lastName}
                    onChange={(e) => setAdminInfo({ ...adminInfo, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                </>
              ) : (
                `${adminInfo.name} ${adminInfo.lastName}`
              )}
            </div>
            <div style={fieldStyle}>
              <strong>Email:</strong>{" "}
              {editing ? (
                <input
                  type="email"
                  style={inputStyle}
                  value={adminInfo.email}
                  onChange={(e) => setAdminInfo({ ...adminInfo, email: e.target.value })}
                />
              ) : (
                adminInfo.email
              )}
            </div>
            <div style={fieldStyle}>
              <strong>Gender:</strong>{" "}
              {editing ? (
                <select
                  style={inputStyle}
                  value={adminInfo.gender}
                  onChange={(e) => setAdminInfo({ ...adminInfo, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                adminInfo.gender
              )}
            </div>
            <div style={editTextStyle} onClick={() => {
              if (editing) {
                saveAdminInfo();
              } else {
                setEditing(true);
              }
            }}>
              {editing ? "Save" : "Edit"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
