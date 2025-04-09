import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const CreateAdmin = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  
  // State to hold the logged in admin's information
  const [adminUser, setAdminUser] = useState(null);

  // Fetch admin user data on mount
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

  // Form data state. The role is fixed to "admin" on the backend.
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

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission: use Firebase to create the account then call backend's firebase-register endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    const auth = getAuth();
    try {
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const idToken = await userCredential.user.getIdToken();
      
      // Call the firebase-register endpoint to create the user in your backend
      await axios.post(
        `${API_URL}/api/auth/firebase-register`,
        {
          idToken,
          name: formData.name,
          lastName: formData.lastName,
          gender: formData.gender,
          phone: formData.phone,
          // Optionally include role if your backend supports it:
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

  // Layout styling: adjust margin to account for fixed header (70px) and sidebar (80px)
  const containerStyle = {
    marginLeft: "80px",
    marginTop: "70px",
    padding: "2rem",
  };

  return (
    <>
      <AdminHeader 
        title="Create Admin" 
        adminName={adminUser ? `${adminUser.name} ${adminUser.lastName}` : "Admin"} 
        profilePicture={adminUser ? adminUser.profileImageUrl : "/images/default-admin.png"} 
      />
      <AdminTabs />
      <div style={containerStyle} className="create-admin-container">
        <h2>Create New Admin Account</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        {loading && <p className="loading">Processing...</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label htmlFor="name">First Name</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="First Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Creating Admin..." : "Create Admin"}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateAdmin;
