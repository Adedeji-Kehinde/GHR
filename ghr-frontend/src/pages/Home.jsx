import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
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
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate, API_URL]);

  return (
    <>
      <UserHeader user={user} />
      <div
        style={{
          width: "100%", // full width
        }}
      >
        <h1>Welcome to GHR Website</h1>
        {loading ? (
          <p>Loading user details...</p>
        ) : user ? (
          <h2>Hello, {user.name}!</h2>
        ) : (
          <p>Failed to load user details.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Home;
