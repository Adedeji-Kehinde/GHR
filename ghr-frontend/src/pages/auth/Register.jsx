import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, googleProvider } from "../../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup
} from "firebase/auth";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    gender: "Male",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL ||"http://localhost:8000";


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Email/Password registration with email verification
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const idToken = await userCred.user.getIdToken();

      const response = await axios.post(`${API_URL}/api/auth/firebase-register`, {
        idToken,
        name: formData.name,
        lastName: formData.lastName,
        gender: formData.gender,
        phone: formData.phone,
      });

      // Send verification email
      await sendEmailVerification(userCred.user);

      // Alert the user and redirect to login page
      window.alert("Verification email sent. Please check your inbox before logging in.");
      navigate("/login");
    } catch (err) {
      setError("Registration failed. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google registration (simple, syncs to MongoDB)
  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await axios.post(`${API_URL}/api/auth/firebase-login`, {
        idToken,
      });

      localStorage.setItem("token", response.data.token);
      const role = response.data.user.role;
      navigate(role === "admin" ? "/admin-dashboard" : "/home");
    } catch (err) {
      setError("Google registration failed.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-left">
        <div className="text-container">
          <h1>Welcome to Griffith Halls</h1>
          <p>Register now to join our community</p>
        </div>
        <div className="logo-container">
          <img src="/images/logo.png" alt="Griffith Halls Logo" />
        </div>
      </div>

      <div className="register-right">
          <h2>Create Account</h2>
          {error && <p className="error">{error}</p>}
          {loading && <p className="loading">Creating account...</p>}

          <form onSubmit={handleRegister}>
            <div className="form-grid">
              <div>
                <label htmlFor="name">First Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
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
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register as User"}
            </button>
          </form>

          <p>Already have an account? <Link to="/login">Login</Link></p>

          <hr className="divider" />
          <p className="or-text">or</p>

          <button onClick={handleGoogleRegister} className="google-login-btn">
            <img src="/images/google-icon.png" alt="Google Icon" className="google-icon" />
            Continue with Google
          </button>
      </div>
    </div>
  );
};

export default Register;
