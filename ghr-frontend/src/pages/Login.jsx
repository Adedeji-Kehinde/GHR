import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, googleProvider } from "../firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  sendEmailVerification 
} from "firebase/auth";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL =import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setUnverifiedUser(null);
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      // Refresh user data
      await userCred.user.reload();
      if (!userCred.user.emailVerified) {
        setError("Please verify your email before logging in.");
        setUnverifiedUser(userCred.user);
        setLoading(false);
        return;
      }
      
      const idToken = await userCred.user.getIdToken();
      const res = await axios.post(`${API_URL}/api/auth/firebase-login`, { idToken });
      localStorage.setItem("token", res.data.token);
      const role = res.data.user.role;
      navigate(role === "admin" ? "/admin-dashboard" : "/home");
    } catch (err) {
      setError("Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await axios.post(`${API_URL}/api/auth/firebase-login`, { idToken });
      localStorage.setItem("token", res.data.token);
      const role = res.data.user.role;
      navigate(role === "admin" ? "/admin-dashboard" : "/home");
    } catch (err) {
      setError("Google login failed.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email above first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your inbox.");
    } catch (error) {
      console.error("Error sending reset email:", error);
      setError("Failed to send reset email. Try again later.");
    }
  };

  const handleResendVerification = async () => {
    if (unverifiedUser) {
      try {
        await sendEmailVerification(unverifiedUser);
        alert("Verification email resent. Please check your inbox.");
      } catch (error) {
        console.error("Error resending verification email:", error);
        setError("Failed to resend verification email.");
      }
    }
  };

  // Style object for clickable texts to match label style
  const clickableTextStyle = {
    fontSize: "0.8rem",
    textAlign: "left",
    color: "#007bff",
    cursor: "pointer"
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="text-container">
          <h1>Welcome Home</h1>
          <p>Login to access your account and more at Griffith Halls</p>
        </div>
        <div className="logo-container">
          <img src="/images/logo.png" alt="Griffith Halls Logo" />
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="login-form-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            {loading && <p className="loading">Logging in...</p>}
            <form onSubmit={handleLogin}>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {/* Resend Verification Email appears below the email input when needed */}
              {error === "Please verify your email before logging in." && (
                <p 
                  style={clickableTextStyle}
                  onClick={handleResendVerification}
                >
                  Resend Verification Email
                </p>
              )}

              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {/* Forgot password link moved below the password input */}
              <p 
                style={clickableTextStyle}
                onClick={handleForgotPassword}
              >
                Forgot password?
              </p>
              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <p>
              Don't have an account? <Link to="/register">Create Account</Link>
            </p>
            <hr className="divider" />
            <p className="or-text">or</p>
            <button onClick={handleGoogleLogin} className="google-login-btn">
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
