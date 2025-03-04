import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';

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

  const adminName = admin ? `${admin.name} ${admin.lastName}` : "Admin";
  const profilePicture = admin ? admin.profileImageUrl : "";

  // Styling for detail boxes
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

  // Top grid: two rows, three columns (6 boxes)
  const topGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  };

  return (
    <>
      <AdminHeader title="Contact Submission Details" adminName={adminName} profilePicture={profilePicture} />
      <AdminTabs />
      <div style={{ margin: '3rem', paddingLeft: '2rem' }}>
        {/* Top Grid: Key Details */}
        <div style={topGridStyle}>
          {/* Contact Name */}
          <div style={boxStyle}>
            <label style={labelStyle}>Contact Name</label>
            <div>{submission.firstName} {submission.lastName}</div>
          </div>
          {/* Email */}
          <div style={boxStyle}>
            <label style={labelStyle}>Email</label>
            <div>{submission.email}</div>
          </div>
          {/* Phone */}
          <div style={boxStyle}>
            <label style={labelStyle}>Phone</label>
            <div>{submission.phone}</div>
          </div>
          {/* Submitted At */}
          <div style={boxStyle}>
            <label style={labelStyle}>Submitted At</label>
            <div>{formattedSubmittedAt}</div>
          </div>
          {/* Completed At */}
          <div style={boxStyle}>
            <label style={labelStyle}>Completed At</label>
            <div>{formattedCompletedAt}</div>
          </div>
          {/* Status */}
          <div style={boxStyle}>
            <label style={labelStyle}>Status</label>
            <select
              value={status}
              onChange={handleStatusChange}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '5px' }}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Bottom Grid: Message and Action Taken */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div style={boxStyle}>
            <label style={labelStyle}>Message</label>
            <textarea
              value={submission.message}
              readOnly
              rows={6}
              style={{ width: '100%', resize: 'none', border: 'none', backgroundColor: 'inherit' }}
            />
          </div>
          <div style={boxStyle}>
            <label style={labelStyle}>Action Taken</label>
            <textarea
              value={actionTaken}
              onChange={handleActionTakenChange}
              placeholder="Responded by email/phone?"
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
            style={{ padding: '0.75rem 1.5rem', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px' }}
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

export default ContactUsDetails;
