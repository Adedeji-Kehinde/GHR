import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";

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

  // Styles matching other admin pages
  const styles = {
    content: {
      marginTop: 40,
      margin: 40,
      padding: '2rem',
      width: "90vw",
      background: '#f8f9fa',
    },
    detailsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "1.5rem",
      marginBottom: "2rem",
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    editableGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1.5rem",
      marginBottom: "2rem",
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    detailBox: {
      padding: "1.5rem",
      backgroundColor: "#fff",
      borderRadius: "8px",
      border: "1px solid #dee2e6"
    },
    label: {
      fontWeight: "bold",
      marginBottom: "0.5rem",
      display: "block",
      color: "#495057"
    },
    value: {
      fontSize: "1rem",
      color: "#212529"
    },
    select: {
      width: "100%",
      padding: "0.5rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      fontSize: "1rem"
    },
    buttonGroup: {
      display: "flex",
      gap: "1rem",
      justifyContent: "flex-end",
      marginTop: "2rem"
    },
    button: {
      padding: "0.75rem 1.5rem",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "500"
    },
    saveButton: {
      backgroundColor: "#28a745",
      color: "#fff"
    },
    deleteButton: {
      backgroundColor: "#dc3545",
      color: "#fff"
    },
    cancelButton: {
      backgroundColor: "#6c757d",
      color: "#fff"
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
      
      <div style={styles.content}>
        {/* Room Details Grid */}
        <div style={styles.detailsGrid}>
          <div style={styles.detailBox}>
            <div style={styles.label}>Occupant Name</div>
            <div style={styles.value}>{userName}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.label}>Room Number</div>
            <div style={styles.value}>{roomNumber}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.label}>Building Block</div>
            <div style={styles.value}>{buildingBlock}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.label}>Floor</div>
            <div style={styles.value}>{floor}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.label}>Apartment Number</div>
            <div style={styles.value}>{apartmentNumber}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.label}>Bed Space</div>
            <div style={styles.value}>{bedSpace}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.label}>Bed Number</div>
            <div style={styles.value}>{bedNumber || '-'}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.label}>Room Type</div>
            <div style={styles.value}>{roomType}</div>
          </div>
        </div>

        {/* Editable Fields Grid */}
        <div style={styles.editableGrid}>
          <div style={styles.detailBox}>
            <div style={styles.label}>Status</div>
            <select
              value={status}
              onChange={handleStatusChange}
              style={styles.select}
            >
              <option value="Booked">Booked</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <div style={{marginTop: '0.5rem'}}>
              <div style={statusStyles[status]}>{status}</div>
            </div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.label}>Length of Stay</div>
            <select
              value={lengthOfStay}
              onChange={handleLengthOfStayChange}
              style={styles.select}
            >
              <option value="Summer">Summer</option>
              <option value="First Semester">First Semester</option>
              <option value="Second Semester">Second Semester</option>
              <option value="Full Year">Full Year</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button
            onClick={handleSave}
            style={{...styles.button, ...styles.saveButton}}
          >
            Save Changes
          </button>
          <button
            onClick={handleDelete}
            style={{...styles.button, ...styles.deleteButton}}
          >
            Delete
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{...styles.button, ...styles.cancelButton}}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default BookingDetails;
