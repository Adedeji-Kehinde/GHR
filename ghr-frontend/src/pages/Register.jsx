import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  // Steps in the flow: "CHOICE", "ADMIN_PASSWORD", "FORM"
  const [flowStep, setFlowStep] = useState("CHOICE");

  // Hard-coded password for admin (not secure for production)
  const COMPANY_PASSWORD = "1234567890";
  const [companyPassword, setCompanyPassword] = useState("");

  // Common form data for both user/admin
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    gender: "Male",
    phone: "",
    role: "user", // default role is "user"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // Step Handlers
  const handleRegisterAsUser = () => {
    setError("");
    setSuccess("");
    setCompanyPassword("");
    setFormData({
      name: "",
      lastName: "",
      email: "",
      password: "",
      gender: "Male",
      phone: "",
      role: "user",
    });
    setFlowStep("FORM");
  };

  const handleRegisterAsAdmin = () => {
    setError("");
    setSuccess("");
    setCompanyPassword("");
    setFormData({
      name: "",
      lastName: "",
      email: "",
      password: "",
      gender: "Male",
      phone: "",
      role: "admin",
    });
    setFlowStep("ADMIN_PASSWORD");
  };

  const handleCompanyPasswordCheck = () => {
    if (companyPassword === COMPANY_PASSWORD) {
      setError("");
      setFlowStep("FORM");
    } else {
      setError("Invalid company password");
    }
  };

  // Form Handlers
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/register`, formData);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Left Side: Fixed sidebar with background image */}
      <div className="register-left">
        <div className="text-container">
          <h1>Welcome to Griffith Halls</h1>
          <p>Register now to join our community</p>
        </div>
        <div className="logo-container">
          <img src="/images/logo.png" alt="Griffith Halls Logo" />
        </div>
      </div>

      {/* Right Side: Registration Flow */}
      <div className="register-right">
        <div className="register-form-container">
          <h2>Create Account</h2>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          {loading && <p className="loading">Processing...</p>}

          {flowStep === "CHOICE" && (
            <div className="choice-buttons">
              <button onClick={handleRegisterAsUser}>Register as User</button>
              <button onClick={handleRegisterAsAdmin}>Register as Admin</button>
            </div>
          )}

          {flowStep === "ADMIN_PASSWORD" && (
            <div>
              <p>Please enter the company password to proceed:</p>
              <label htmlFor="company-password">Company Password</label>
              <input
                id="company-password"
                type="password"
                placeholder="Company Password"
                value={companyPassword}
                onChange={(e) => setCompanyPassword(e.target.value)}
              />
              <button onClick={handleCompanyPasswordCheck}>Validate</button>
            </div>
          )}

          {flowStep === "FORM" && (
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
              {formData.role === "admin" && (
                <div className="role-field">
                  <label>Role:</label>
                  <input type="text" value="admin" readOnly />
                </div>
              )}
              <button type="submit" disabled={loading}>
                {formData.role === "admin"
                  ? loading
                    ? "Creating Admin..."
                    : "Register as Admin"
                  : loading
                  ? "Creating User..."
                  : "Register as User"}
              </button>
            </form>
          )}

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
