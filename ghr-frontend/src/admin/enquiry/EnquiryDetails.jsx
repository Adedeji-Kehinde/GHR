import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";

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
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1.5rem",
      marginBottom: "2rem",
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
    detailBox: {
      padding: "1.5rem",
      backgroundColor: "#fff",
      borderRadius: "8px",
      border: "1px solid #dee2e6",
    },
    label: {
      fontWeight: "bold",
      marginBottom: "0.5rem",
      display: "block",
      color: "#495057",
    },
    value: {
      fontSize: "1rem",
      color: "#212529",
    },
    select: {
      width: "100%",
      padding: "0.5rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      fontSize: "1rem",
    },
    textarea: {
      width: "100%",
      padding: "1rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      resize: "vertical",
      minHeight: "150px",
      fontSize: "1rem",
    },
    buttonGroup: {
      display: "flex",
      gap: "1rem",
      justifyContent: "flex-end",
      marginTop: "2rem",
    },
    button: {
      padding: "0.75rem 1.5rem",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "500",
    },
    saveButton: {
      backgroundColor: "#28a745",
      color: "#fff",
    },
    deleteButton: {
      backgroundColor: "#dc3545",
      color: "#fff",
    },
    cancelButton: {
      backgroundColor: "#6c757d",
      color: "#fff",
    },
  };

  // Status styles matching the main page
  const statusStyles = {
    "Pending": {
      backgroundColor: '#fff3e0',  // Light orange
      color: '#e65100',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "Resolved": {
      backgroundColor: '#e8f5e9',  // Light green
      color: '#2e7d32',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    }
  };

  return (
    <>
      <AdminHeader 
        title="Enquiry Details" 
        adminName={admin ? `${admin.name} ${admin.lastName}` : "Admin"}
        profilePicture={admin ? admin.profileImageUrl : ""}
      />
      <AdminTabs />
      
      <div style={styles.content}>
        <div style={styles.detailsGrid}>
          {/* Request ID */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Request ID</div>
            <div style={styles.value}>{enquiry.requestId}</div>
          </div>
          {/* Room Number */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Room Number</div>
            <div style={styles.value}>{enquiry.roomNumber}</div>
          </div>
          {/* Enquirer Name */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Enquirer Name</div>
            <div style={styles.value}>{enquiry.enquirerName}</div>
          </div>
          {/* Status */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Status</div>
            <select
              value={status}
              onChange={handleStatusChange}
              style={styles.select}
            >
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          {/* Created At */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Created At</div>
            <div style={styles.value}>{formattedCreatedAt}</div>
          </div>
          {/* Resolved At */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Resolved At</div>
            <div style={styles.value}>{formattedResolvedAt}</div>
          </div>
          {/* Enquiry Text */}
          <div style={{...styles.detailBox, ...styles.fullWidth}}>
            <div style={styles.label}>Enquiry Text</div>
            <textarea
              value={enquiry.enquiryText}
              readOnly
              style={styles.textarea}
            />
          </div>
          {/* Response */}
          <div style={{...styles.detailBox, ...styles.fullWidth}}>
            <div style={styles.label}>Response</div>
            <textarea
              value={response}
              onChange={handleResponseChange}
              style={styles.textarea}
              placeholder="Enter your response here..."
            />
          </div>
        </div>

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

export default EnquiryDetails;
