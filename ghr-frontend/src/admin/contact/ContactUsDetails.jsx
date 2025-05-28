import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import './contact.css';

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

  return (
    <>
      <AdminHeader 
        title="Contact Submission Details" 
        adminName={admin ? `${admin.name} ${admin.lastName}` : "Admin"}
        profilePicture={admin ? admin.profileImageUrl : ""}
      />
      <AdminTabs />
      
      <div className="contact-details-content">
        {/* Contact Details Grid */}
        <div className="contact-details-grid">
          {/* Contact Name */}
          <div className="contact-details-box">
            <div className="contact-details-label">Contact Name</div>
            <div className="contact-details-value">{submission.firstName} {submission.lastName}</div>
          </div>
          {/* Email */}
          <div className="contact-details-box">
            <div className="contact-details-label">Email</div>
            <div className="contact-details-value">{submission.email}</div>
          </div>
          {/* Phone */}
          <div className="contact-details-box">
            <div className="contact-details-label">Phone</div>
            <div className="contact-details-value">{submission.phone}</div>
          </div>
          {/* Submitted At */}
          <div className="contact-details-box">
            <div className="contact-details-label">Submitted At</div>
            <div className="contact-details-value">{formattedSubmittedAt}</div>
          </div>
          {/* Completed At */}
          <div className="contact-details-box">
            <div className="contact-details-label">Completed At</div>
            <div className="contact-details-value">{formattedCompletedAt}</div>
          </div>
          {/* Status */}
          <div className="contact-details-box">
            <div className="contact-details-label">Status</div>
            <select
              value={status}
              onChange={handleStatusChange}
              className="contact-details-select"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <div style={{marginTop: '0.5rem'}}>
              <div className={`status-${status.toLowerCase()}`}>{status}</div>
            </div>
          </div>
        </div>

        {/* Message and Action Taken Grid */}
        <div className="contact-details-message-grid">
          {/* Message */}
          <div className="contact-details-box">
            <div className="contact-details-label">Message</div>
            <textarea
              value={submission.message}
              readOnly
              className="contact-details-textarea-readonly"
            />
          </div>
          {/* Action Taken */}
          <div className="contact-details-box">
            <div className="contact-details-label">Action Taken</div>
            <textarea
              value={actionTaken}
              onChange={handleActionTakenChange}
              placeholder="Responded by email/phone?"
              className="contact-details-textarea"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="contact-details-button-group">
          <button
            onClick={handleSave}
            className="contact-details-button contact-details-button-save"
          >
            Save Changes
          </button>
          <button
            onClick={handleDelete}
            className="contact-details-button contact-details-button-delete"
          >
            Delete
          </button>
          <button
            onClick={() => navigate(-1)}
            className="contact-details-button contact-details-button-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default ContactUsDetails;
