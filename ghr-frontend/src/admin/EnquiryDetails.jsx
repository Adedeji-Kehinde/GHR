import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';

const EnquiryDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Retrieve the full enquiry object passed via navigation state
  const { enquiry } = location.state || {};
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Fetch admin details so we can pass them to the AdminHeader
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

  if (!enquiry) {
    return <p className="error">No enquiry details available.</p>;
  }

  // State for the editable fields: status and response
  const [status, setStatus] = useState(enquiry.status);
  const [response, setResponse] = useState(enquiry.response);

  const handleStatusChange = (e) => setStatus(e.target.value);
  const handleResponseChange = (e) => setResponse(e.target.value);

  const handleSave = async () => {
    try {
      await axios.put(
        `${API_URL}/api/auth/enquiries/${enquiry._id}`,
        { status, response },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Enquiry updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error updating enquiry:", err.response || err);
      alert("Error updating enquiry");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/auth/enquiries/${enquiry._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Enquiry deleted successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error deleting enquiry:", err.response || err);
      alert("Error deleting enquiry");
    }
  };

  const formattedCreatedAt = new Date(enquiry.createdAt).toLocaleString();
  const formattedResolvedAt = enquiry.resolvedAt
    ? new Date(enquiry.resolvedAt).toLocaleString()
    : "N/A";

  // Derive adminName and profilePicture if admin is loaded
  const adminName = admin ? `${admin.name} ${admin.lastName}` : "Admin";
  const profilePicture = admin ? admin.profileImageUrl : "";

  // Common styling for boxes
  const boxStyle = {
    border: '1px solid #ccc',
    padding: '1.5rem',
    borderRadius: '10px',
  };

  // Label styling
  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    display: 'block',
  };

  // Top grid style: 3 columns with increased minimum width (300px)
  const topGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  };

  // Bottom grid style: two large boxes with increased minimum width (300px)
  const bottomGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  };

  return (
    <>
      <AdminHeader title="Enquiry Details" adminName={adminName} profilePicture={profilePicture} />
      <AdminTabs />
      <div style={{ margin: '2rem' }}>
        {/* Top Grid: 6 fields in 3 columns x 2 rows */}
        <div style={topGridStyle}>
          {/* Request ID */}
          <div style={boxStyle}>
            <label style={labelStyle}>Request ID</label>
            <div>{enquiry.requestId}</div>
          </div>
          {/* Room Number */}
          <div style={boxStyle}>
            <label style={labelStyle}>Room Number</label>
            <div>{enquiry.roomNumber}</div>
          </div>
          {/* Enquirer Name */}
          <div style={boxStyle}>
            <label style={labelStyle}>Enquirer Name</label>
            <div>{enquiry.enquirerName}</div>
          </div>
          {/* Created At */}
          <div style={boxStyle}>
            <label style={labelStyle}>Created At</label>
            <div>{formattedCreatedAt}</div>
          </div>
          {/* Resolved At */}
          <div style={boxStyle}>
            <label style={labelStyle}>Resolved At</label>
            <div>{formattedResolvedAt}</div>
          </div>
          {/* Status (Editable) */}
          <div style={boxStyle}>
            <label style={labelStyle}>Status</label>
            <select
              value={status}
              onChange={handleStatusChange}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '5px' }}
            >
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Bottom Grid: Two large boxes for Enquiry Text and Response */}
        <div style={bottomGridStyle}>
          {/* Enquiry Text (Read-only; no border on the textarea, matching container background) */}
          <div style={boxStyle}>
            <label style={labelStyle}>Enquiry Text</label>
            <textarea
              value={enquiry.enquiryText}
              readOnly
              rows={6}
              style={{
                width: '100%',
                resize: 'none',
                border: 'none',
                backgroundColor: 'inherit',
              }}
            />
          </div>
          {/* Response (Editable) */}
          <div style={boxStyle}>
            <label style={labelStyle}>Response</label>
            <textarea
              value={response}
              onChange={handleResponseChange}
              rows={6}
              style={{ width: '100%', resize: 'none', padding: '0.5rem' }}
            />
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

export default EnquiryDetails;
