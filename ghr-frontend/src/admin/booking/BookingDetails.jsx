import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import './booking.css';

const BookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Retrieve the full booking object passed via navigation state
  const { booking } = location.state || {};
  const API_URL = "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Fetch admin details for header display
  const [admin, setAdmin] = useState(null);
  React.useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(res.data);
      } catch (err) {
        console.error("Error fetching admin details:", err.response || err);
      }
    };
    fetchAdmin();
  }, [API_URL, token]);

  if (!booking) {
    return <p className="error">No booking details available.</p>;
  }

  // Destructure non-editable fields from the booking object
  const { userName, buildingBlock, floor, apartmentNumber, bedSpace, bedNumber, roomType } = booking;
  const roomNumber = `${buildingBlock}${floor}${String(apartmentNumber).padStart(2, '0')}${bedSpace}${bedNumber || ''}`;
  // Editable fields: status and lengthOfStay
  const [status, setStatus] = useState(booking.status);
  const [lengthOfStay, setLengthOfStay] = useState(booking.lengthOfStay);

  const handleStatusChange = (e) => setStatus(e.target.value);
  const handleLengthOfStayChange = (e) => setLengthOfStay(e.target.value);

  const handleSave = async () => {
    if (!window.confirm("Are you sure you want to update this booking? Updating may reallocate the room. If you cancel, the room will be freed for others and the user will need to rebook.")) {
      return;
    }
    try {
      await axios.put(
        `${API_URL}/api/booking/bookings/${booking._id}`,
        { status, lengthOfStay },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Booking updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error updating booking:", err.response || err);
      alert("Error updating booking");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this booking? Deleting will free the room for others and you'll need to rebook.")) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/api/booking/bookings/${booking._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Booking deleted successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error deleting booking:", err.response || err);
      alert("Error deleting booking");
    }
  };

  // Status styles matching the main page
  const statusStyles = {
    "Booked": {
      backgroundColor: '#e3f2fd',  // Light blue
      color: '#1976d2',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "Cancelled": {
      backgroundColor: '#ffebee',  // Light red
      color: '#c62828',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    }
  };

  return (
    <>
      <AdminHeader 
        title="Booking Details" 
        adminName={admin ? `${admin.name} ${admin.lastName}` : "Admin"}
        profilePicture={admin ? admin.profileImageUrl : ""}
      />
      <AdminTabs />
      
      <div className="booking-details-content">
        {/* Room Details Grid */}
        <div className="booking-details-grid">
          <div className="booking-details-box">
            <div className="booking-details-label">Occupant Name</div>
            <div className="booking-details-value">{userName}</div>
          </div>
          <div className="booking-details-box">
            <div className="booking-details-label">Room Number</div>
            <div className="booking-details-value">{roomNumber}</div>
          </div>
          <div className="booking-details-box">
            <div className="booking-details-label">Building Block</div>
            <div className="booking-details-value">{buildingBlock}</div>
          </div>
          <div className="booking-details-box">
            <div className="booking-details-label">Floor</div>
            <div className="booking-details-value">{floor}</div>
          </div>
          <div className="booking-details-box">
            <div className="booking-details-label">Apartment Number</div>
            <div className="booking-details-value">{apartmentNumber}</div>
          </div>
          <div className="booking-details-box">
            <div className="booking-details-label">Bed Space</div>
            <div className="booking-details-value">{bedSpace}</div>
          </div>
          <div className="booking-details-box">
            <div className="booking-details-label">Bed Number</div>
            <div className="booking-details-value">{bedNumber || '-'}</div>
          </div>
          <div className="booking-details-box">
            <div className="booking-details-label">Room Type</div>
            <div className="booking-details-value">{roomType}</div>
          </div>
        </div>

        {/* Editable Fields Grid */}
        <div className="booking-details-editable-grid">
          <div className="booking-details-box">
            <div className="booking-details-label">Status</div>
            <select
              value={status}
              onChange={handleStatusChange}
              className="booking-details-select"
            >
              <option value="Booked">Booked</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <div className="booking-details-status" style={statusStyles[status]}>{status}</div>
          </div>
          <div className="booking-details-box">
            <div className="booking-details-label">Length of Stay</div>
            <select
              value={lengthOfStay}
              onChange={handleLengthOfStayChange}
              className="booking-details-select"
            >
              <option value="Summer">Summer</option>
              <option value="First Semester">First Semester</option>
              <option value="Second Semester">Second Semester</option>
              <option value="Full Year">Full Year</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="booking-details-button-group">
          <button
            onClick={handleSave}
            className="booking-details-btn save"
          >
            Save Changes
          </button>
          <button
            onClick={handleDelete}
            className="booking-details-btn delete"
          >
            Delete
          </button>
          <button
            onClick={() => navigate(-1)}
            className="booking-details-btn cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default BookingDetails;
