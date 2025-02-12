import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import SelectBed from "./pages/SelectBed";
import AdminDashboard from "./admin/AdminDashboard";
import Deliveries from "./admin/Deliveries";
import "./styles.css"; // Import the styles

function App() {
  return (
    <>
    <Router>
      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/home"
          element={<Home />}
        />
        
        <Route 
          path="/booking" 
          element={<Booking />} 
        />

        <Route 
          path="/selectBed" 
          element={<SelectBed />} 
        />
      
        <Route 
          path="/admin-dashboard" 
          element={<AdminDashboard />} 
        />

        <Route 
          path="/deliveries" 
          element={<Deliveries />} 
        />
      </Routes>
    </Router>
    </>
  )
}

export default App
