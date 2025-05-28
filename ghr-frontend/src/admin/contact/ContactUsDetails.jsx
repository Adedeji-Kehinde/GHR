import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";

const ContactUsDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Retrieve the full submission object passed via navigation state
  const { submission } = location.state || {};
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

  if (!submission) {
    return <p className="error">No contact submission details available.</p>;
  }

  // Editable fields: status and actionTaken (instead of response)
  const [status, setStatus] = useState(submission.status);
  const [actionTaken, setActionTaken] = useState(submission.actionTaken || "");

  const handleStatusChange = (e) => setStatus(e.target.value);
  const handleActionTakenChange = (e) => setActionTaken(e.target.value);

  const handleSave = async () => {
    try {
      // Prepare payload; if status is changed to completed, set completedAt to now
      const payload = { status, actionTaken };
      if (status.toLowerCase() === "completed" && submission.status.toLowerCase() !== "completed") {
        payload.completedAt = new Date();
      }
      await axios.put(
        `${API_URL}/api/auth/contactus/${submission._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Contact submission updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error updating contact submission:", err.response || err);
      alert("Error updating contact submission");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/auth/contactus/${submission._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Contact submission deleted successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error deleting contact submission:", err.response || err);
      alert("Error deleting contact submission");
    }
  };

  const formattedSubmittedAt = new Date(submission.submittedAt).toLocaleString();
  const formattedCompletedAt = submission.completedAt
    ? new Date(submission.completedAt).toLocaleString()
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
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1.5rem",
      marginBottom: "2rem",
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    messageGrid: {
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
    textarea: {
      width: "100%",
      padding: "1rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      resize: "vertical",
      minHeight: "150px",
      fontSize: "1rem",
      backgroundColor: "#fff"
    },
    readOnlyTextarea: {
      width: "100%",
      padding: "1rem",
      borderRadius: "4px",
      border: "1px solid #ced4da",
      resize: "vertical",
      minHeight: "150px",
      fontSize: "1rem",
      backgroundColor: "#f8f9fa"
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
    "pending": {
      backgroundColor: '#fff3e0',  // Light orange
      color: '#e65100',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "completed": {
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
        title="Contact Submission Details" 
        adminName={admin ? `${admin.name} ${admin.lastName}` : "Admin"}
        profilePicture={admin ? admin.profileImageUrl : ""}
      />
      <AdminTabs />
      
      <div style={styles.content}>
        {/* Contact Details Grid */}
        <div style={styles.detailsGrid}>
          {/* Contact Name */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Contact Name</div>
            <div style={styles.value}>{submission.firstName} {submission.lastName}</div>
          </div>
          {/* Email */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Email</div>
            <div style={styles.value}>{submission.email}</div>
          </div>
          {/* Phone */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Phone</div>
            <div style={styles.value}>{submission.phone}</div>
          </div>
          {/* Submitted At */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Submitted At</div>
            <div style={styles.value}>{formattedSubmittedAt}</div>
          </div>
          {/* Completed At */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Completed At</div>
            <div style={styles.value}>{formattedCompletedAt}</div>
          </div>
          {/* Status */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Status</div>
            <select
              value={status}
              onChange={handleStatusChange}
              style={styles.select}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <div style={{marginTop: '0.5rem'}}>
              <div style={statusStyles[status]}>{status}</div>
            </div>
          </div>
        </div>

        {/* Message and Action Taken Grid */}
        <div style={styles.messageGrid}>
          {/* Message */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Message</div>
            <textarea
              value={submission.message}
              readOnly
              style={styles.readOnlyTextarea}
            />
          </div>
          {/* Action Taken */}
          <div style={styles.detailBox}>
            <div style={styles.label}>Action Taken</div>
            <textarea
              value={actionTaken}
              onChange={handleActionTakenChange}
              placeholder="Responded by email/phone?"
              style={styles.textarea}
            />
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

export default ContactUsDetails;
