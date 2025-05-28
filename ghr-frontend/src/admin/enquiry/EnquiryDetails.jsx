import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import './enquiry.css';

const EnquiryDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  return (
    <>
      <AdminHeader 
        title="Enquiry Details" 
        adminName={admin ? `${admin.name} ${admin.lastName}` : "Admin"}
        profilePicture={admin ? admin.profileImageUrl : ""}
      />
      <AdminTabs />
      
      <div className="enquiry-details-content">
        <div className="enquiry-details-grid">
          {/* Request ID */}
          <div className="enquiry-details-box">
            <div className="enquiry-details-label">Request ID</div>
            <div className="enquiry-details-value">{enquiry.requestId}</div>
          </div>
          {/* Room Number */}
          <div className="enquiry-details-box">
            <div className="enquiry-details-label">Room Number</div>
            <div className="enquiry-details-value">{enquiry.roomNumber}</div>
          </div>
          {/* Enquirer Name */}
          <div className="enquiry-details-box">
            <div className="enquiry-details-label">Enquirer Name</div>
            <div className="enquiry-details-value">{enquiry.enquirerName}</div>
          </div>
          {/* Status */}
          <div className="enquiry-details-box">
            <div className="enquiry-details-label">Status</div>
            <select
              value={status}
              onChange={handleStatusChange}
              className="enquiry-details-select"
            >
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          {/* Created At */}
          <div className="enquiry-details-box">
            <div className="enquiry-details-label">Created At</div>
            <div className="enquiry-details-value">{formattedCreatedAt}</div>
          </div>
          {/* Resolved At */}
          <div className="enquiry-details-box">
            <div className="enquiry-details-label">Resolved At</div>
            <div className="enquiry-details-value">{formattedResolvedAt}</div>
          </div>
          {/* Enquiry Text */}
          <div className="enquiry-details-box" style={{ gridColumn: '1 / -1' }}>
            <div className="enquiry-details-label">Enquiry Text</div>
            <textarea
              value={enquiry.enquiryText}
              readOnly
              className="enquiry-details-textarea"
            />
          </div>
          {/* Response */}
          <div className="enquiry-details-box" style={{ gridColumn: '1 / -1' }}>
            <div className="enquiry-details-label">Response</div>
            <textarea
              value={response}
              onChange={handleResponseChange}
              className="enquiry-details-textarea"
              placeholder="Enter your response here..."
            />
          </div>
        </div>

        <div className="enquiry-details-button-group">
          <button
            onClick={handleSave}
            className="enquiry-details-button enquiry-details-save-btn"
          >
            Save Changes
          </button>
          <button
            onClick={handleDelete}
            className="enquiry-details-button enquiry-details-delete-btn"
          >
            Delete
          </button>
          <button
            onClick={() => navigate(-1)}
            className="enquiry-details-button enquiry-details-cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default EnquiryDetails;
