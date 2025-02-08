import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login"); // Redirect to login if no token found
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login"); // Redirect to login if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleBookRoom = () => {
    // Navigate to the booking page
    navigate("/booking");
  };

  return (
    <div className="container">
      <div className="box">
        <h1>Welcome to GHR Website</h1>

        {loading ? (
          <p className="loading">Loading user details...</p>
        ) : user ? (
          <>
            <h2>Hello, {user.name}!</h2> {/* Display user's name */}
            <button className="book-room-btn" onClick={handleBookRoom}>
              Book Room
            </button>
          </>
        ) : (
          <p className="error">Failed to load user details.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
