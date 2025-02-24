import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';

const BookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Retrieve the full booking object passed via navigation state
  const { booking } = location.state || {};
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
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
  const { userName, userRoom, buildingBlock, floor, apartmentNumber, bedSpace, bedNumber, roomType } = booking;

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

  // Styling objects
  const boxStyle = {
    border: '1px solid #ccc',
    padding: '1.5rem',
    borderRadius: '10px',
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    display: 'block',
  };

  // Grid for non-editable fields: 4 boxes per row
  const nonEditableGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(200px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  };

  // Grid for editable fields: 2 boxes per row
  const editableGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  };

  const adminName = admin ? `${admin.name} ${admin.lastName}` : "Admin";
  const profilePicture = admin ? admin.profileImageUrl : "";

  return (
    <>
      <AdminHeader title="Booking Details" adminName={adminName} profilePicture={profilePicture} />
      <AdminTabs />
      <div style={{ margin: '3rem', paddingLeft: '2rem' }}>
        {/* Non-editable Fields Grid */}
        <div style={nonEditableGridStyle}>
          <div style={boxStyle}>
            <label style={labelStyle}>Occupant Name</label>
            <div>{userName}</div>
          </div>
          <div style={boxStyle}>
            <label style={labelStyle}>Room Number</label>
            <div>{userRoom}</div>
          </div>
          <div style={boxStyle}>
            <label style={labelStyle}>Building Block</label>
            <div>{buildingBlock}</div>
          </div>
          <div style={boxStyle}>
            <label style={labelStyle}>Floor</label>
            <div>{floor}</div>
          </div>
          <div style={boxStyle}>
            <label style={labelStyle}>Apartment Number</label>
            <div>{apartmentNumber}</div>
          </div>
          <div style={boxStyle}>
            <label style={labelStyle}>Bed Space</label>
            <div>{bedSpace}</div>
          </div>
          <div style={boxStyle}>
            <label style={labelStyle}>Bed Number</label>
            <div>{bedNumber || '-'}</div>
          </div>
          <div style={boxStyle}>
            <label style={labelStyle}>Room Type</label>
            <div>{roomType}</div>
          </div>
        </div>

        {/* Editable Fields Grid */}
        <div style={editableGridStyle}>
          <div style={boxStyle}>
            <label style={labelStyle}>Status</label>
            <select
              value={status}
              onChange={handleStatusChange}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '5px' }}
            >
              <option value="Booked">Booked</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div style={boxStyle}>
            <label style={labelStyle}>Length of Stay</label>
            <select
              value={lengthOfStay}
              onChange={handleLengthOfStayChange}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '5px' }}
            >
              <option value="Summer">Summer</option>
              <option value="First Semester">First Semester</option>
              <option value="Second Semester">Second Semester</option>
              <option value="Full Year">Full Year</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleSave} style={{ padding: '0.75rem 1.5rem' }}>
            Save
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Delete
          </button>
          <button onClick={() => navigate(-1)} style={{ padding: '0.75rem 1.5rem' }}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default BookingDetails;
