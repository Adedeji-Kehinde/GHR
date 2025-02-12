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
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // -----------------------------
  // Step Handlers
  // -----------------------------

  // (1) Click "Register as User"
  const handleRegisterAsUser = () => {
    setError("");
    setSuccess("");
    setCompanyPassword("");
    // Reset form data to user defaults
    setFormData({
      name: "",
      lastName: "",
      email: "",
      password: "",
      gender: "Male",
      phone: "",
      role: "user",
    });
    setFlowStep("FORM"); // go straight to form
  };

  // (2) Click "Register as Admin"
  const handleRegisterAsAdmin = () => {
    setError("");
    setSuccess("");
    setCompanyPassword("");
    // Prep form data to admin defaults
    setFormData({
      name: "",
      lastName: "",
      email: "",
      password: "",
      gender: "Male",
      phone: "",
      role: "admin",
    });
    setFlowStep("ADMIN_PASSWORD"); // show password prompt
  };

  // (3) Validate the company password
  const handleCompanyPasswordCheck = () => {
    if (companyPassword === COMPANY_PASSWORD) {
      setError("");
      setFlowStep("FORM"); // now show the final form with role=admin
    } else {
      setError("Invalid company password");
    }
  };

  // -----------------------------
  // Form Handlers
  // -----------------------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // We do a single POST to /register with the formData
      const response = await axios.post(`${API_URL}/api/auth/register`, formData);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="container">
      <div className="box">
        <h2>Register Portal</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        {loading && <p className="loading">Processing...</p>}

        {/* Step A: CHOICE */}
        {flowStep === "CHOICE" && (
          <div>
            <button onClick={handleRegisterAsUser}>Register as User</button>
            <button onClick={handleRegisterAsAdmin}>Register as Admin</button>
          </div>
        )}

        {/* Step B: ADMIN_PASSWORD */}
        {flowStep === "ADMIN_PASSWORD" && (
          <div>
            <p>Please enter the company password to proceed:</p>
            <input
              type="password"
              placeholder="Company Password"
              value={companyPassword}
              onChange={(e) => setCompanyPassword(e.target.value)}
            />
            <button onClick={handleCompanyPasswordCheck}>Validate</button>
          </div>
        )}

        {/* Step C: FORM (One Form for both user & admin) */}
        {flowStep === "FORM" && (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="First Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            {/* If the role is admin, you can show a read-only field
                or hide it entirely if you prefer. */}
            {formData.role === "admin" && (
              <div>
                <label>Role:</label>
                <input type="text" value="admin" readOnly />
              </div>
            )}

            <button type="submit" disabled={loading}>
              {formData.role === "admin"
                ? loading ? "Creating Admin..." : "Register as Admin"
                : loading ? "Creating User..." : "Register as User"
              }
            </button>
          </form>
        )}

        <p>
          Already have an account?
          <Link to="/login"> Login </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
