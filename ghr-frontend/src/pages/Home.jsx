import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if no token
    }
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <h1 className="text-2xl font-bold">Welcome to GHR Website</h1>
    </div>
  );
};

export default Home;
