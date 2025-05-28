import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

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
    title: {
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#2c3e50",
      marginBottom: "1.5rem",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1.5rem",
      marginBottom: "2rem",
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
      transition: "border-color 0.2s",
      "&:focus": {
        borderColor: "#80bdff",
        outline: "none",
      },
    },
    select: {
      width: "100%",
      padding: "0.75rem",
      fontSize: "1.1rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      backgroundColor: "#fff",
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
      transition: "all 0.2s",
      backgroundColor: "#007bff",
      color: "#fff",
      "&:hover": {
        backgroundColor: "#0056b3",
      },
      "&:disabled": {
        backgroundColor: "#6c757d",
        cursor: "not-allowed",
      },
    },
    message: {
      padding: "1rem",
      borderRadius: "4px",
      marginBottom: "1rem",
      fontSize: "1.1rem",
    },
    errorMessage: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb",
    },
    successMessage: {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb",
    },
    loadingMessage: {
      backgroundColor: "#e2e3e5",
      color: "#383d41",
      border: "1px solid #d6d8db",
    },
  };

  if (!adminUser) return (
    <div style={styles.content}>
      <div style={styles.section}>
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
      
      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.title}>Create New Admin Account</h2>
          
          {error && (
            <div style={{...styles.message, ...styles.errorMessage}}>
              {error}
            </div>
          )}
          {success && (
            <div style={{...styles.message, ...styles.successMessage}}>
              {success}
            </div>
          )}
          {loading && (
            <div style={{...styles.message, ...styles.loadingMessage}}>
              Processing...
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="name">First Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter first name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{...styles.button, backgroundColor: "#6c757d"}}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={styles.button}
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
