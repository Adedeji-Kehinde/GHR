import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_BASE_URL || "https://your-backend-url.onrender.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Start loading

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      navigate("/home"); // Redirect after successful login
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="container">
      <div className="box">
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}
        {loading && <p className="loading">Logging in...</p>} {/* Show loading text */}

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}> {/* Disable button when loading */}
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p>
          Don't have an account?
          <Link to="/register"> Create Account </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
