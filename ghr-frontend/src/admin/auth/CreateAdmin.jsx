import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import './AdminManagement.css';

const CreateAdmin = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminUser(response.data);
      } catch (error) {
        console.error("Error fetching admin info:", error);
      }
    };
    fetchAdminInfo();
  }, [API_URL]);

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    gender: "Male",
    phone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const idToken = await userCredential.user.getIdToken();
      
      await axios.post(
        `${API_URL}/api/auth/firebase-register/admin`,
        {
          idToken,
          name: formData.name,
          lastName: formData.lastName,
          gender: formData.gender,
          phone: formData.phone,
          role: "admin"
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      setSuccess("Admin account created successfully!");
      setTimeout(() => navigate("/manage-admin"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!adminUser) return (
    <div className="admin-management-content">
      <div className="admin-management-section">
        <p>Loading admin details...</p>
      </div>
    </div>
  );

  return (
    <>
      <AdminHeader 
        title="Create Admin" 
        adminName={`${adminUser.name} ${adminUser.lastName}`} 
        profilePicture={adminUser.profileImageUrl || "/images/default-admin.png"} 
      />
      <AdminTabs />
      
      <div className="admin-management-content">
        <div className="admin-management-section">
          <h2 className="admin-management-title">Create New Admin Account</h2>
          
          {error && (
            <div className="admin-management-message error">
              {error}
            </div>
          )}
          {success && (
            <div className="admin-management-message success">
              {success}
            </div>
          )}
          {loading && (
            <div className="admin-management-message loading">
              Processing...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="admin-management-form-grid">
              <div className="admin-management-form-group">
                <label className="admin-management-label" htmlFor="name">First Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter first name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="admin-management-input"
                />
              </div>

              <div className="admin-management-form-group">
                <label className="admin-management-label" htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="admin-management-input"
                />
              </div>

              <div className="admin-management-form-group">
                <label className="admin-management-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="admin-management-input"
                />
              </div>

              <div className="admin-management-form-group">
                <label className="admin-management-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="admin-management-input"
                />
              </div>

              <div className="admin-management-form-group">
                <label className="admin-management-label" htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="admin-management-select"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="admin-management-form-group">
                <label className="admin-management-label" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="admin-management-input"
                />
              </div>
            </div>

            <div className="admin-management-button-group">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="admin-management-btn cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="admin-management-btn create"
              >
                {loading ? "Creating Admin..." : "Create Admin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateAdmin;
