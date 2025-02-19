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
import AddDelivery from "./admin/AddDelivery";
import Enquiry from "./admin/Enquiry";
import EnquiryDetails from './admin/EnquiryDetails';
import Maintenance from "./admin/Maintenace";
import AddMaintenance from './admin/AddMaintenance';
import "./styles.css"; // Import the styles
import "./login.css"; // Import the styles
import "./Register.css"; // Import the styles
import BookingManagement from './admin/BookingManagement';
import BookingDetails from './admin/BookingDetails';

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
          path="/booking-management" 
          element={<BookingManagement />} 
        />

        <Route 
          path="/booking-details" 
          element={<BookingDetails />} 
        />

        <Route 
          path="/deliveries" 
          element={<Deliveries />} 
        />

        <Route 
          path="/add-delivery" 
          element={<AddDelivery />} 
        />

        <Route 
          path="/enquiries" 
          element={<Enquiry />} 
        />

        <Route 
          path="/enquiry-details" 
          element={<EnquiryDetails />} 
        />

        <Route 
          path="/maintenance" 
          element={<Maintenance />} 
        />

        <Route 
          path="/add-maintenance" 
          element={<AddMaintenance />} 
        />
      </Routes>
    </Router>
    </>
  )
}

export default App
