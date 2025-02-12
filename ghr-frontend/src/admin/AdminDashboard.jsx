import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard-container" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Admin Dashboard</h1>
      <div className="dashboard-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '2rem auto' }}>
        <button onClick={() => navigate("/deliveries")}>
          Delivery Management
        </button>
        <button onClick={() => navigate("/enquiries")}>
          Enquiry Management
        </button>
        <button onClick={() => navigate("/maintenance")}>
          Maintenance Management
        </button>
        <button onClick={() => navigate("/bookings")}>
          Booking Management
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
