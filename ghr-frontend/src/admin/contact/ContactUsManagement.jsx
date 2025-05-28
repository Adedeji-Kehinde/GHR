import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import deleteImage from '/images/deleteImage.png';
import Loading from '../../pages/components/Loading';
import bookedIcon from '/images/booked.png';
import './contact.css';

const ContactUsManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [admin, setAdmin] = useState(null);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/auth/contactus`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data);
      setError("");
      setSelectedSubmissions([]);
    } catch (err) {
      console.error("Error fetching contact submissions:", err.response || err);
      setError(err.response?.data?.message || "Error fetching submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_URL, token]);

  const countAll = submissions.length;
  const countpending = submissions.filter(submission => submission.status.toLowerCase() === "pending").length;
  const countCompleted = submissions.filter(submission => submission.status.toLowerCase() === "completed").length;

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const statusMatches = filterStatus === "All" || 
                          submission.status.toLowerCase() === filterStatus.toLowerCase();
      const query = searchQuery.toLowerCase();
      const searchMatches = (
        submission.firstName.toLowerCase().includes(query) ||
        submission.lastName.toLowerCase().includes(query) ||
        submission.email.toLowerCase().includes(query) ||
        submission.phone.toLowerCase().includes(query) ||
        submission.message.toLowerCase().includes(query) ||
        submission.status.toLowerCase().includes(query)
      );
      return statusMatches && searchMatches;
    });
  }, [submissions, searchQuery, filterStatus]);

  const toggleSelectRow = (e, id) => {
    e.stopPropagation();
    setSelectedSubmissions(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAll = () => {
    if (selectedSubmissions.length === filteredSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(filteredSubmissions.map(submission => submission._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubmissions.length === 0) {
      alert("No submissions selected");
      return;
    }
    if (window.confirm("Are you sure you want to delete the selected submissions?")) {
      try {
        setLoading(true);
        await Promise.all(selectedSubmissions.map(id =>
          axios.delete(`${API_URL}/api/auth/contactus/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ));
        setSelectedSubmissions([]);
        fetchData();
      } catch (err) {
        console.error("Error deleting submissions:", err.response || err);
        alert("Error deleting submissions");
      }
    }
  };

  const handleRowClick = (submission) => {
    navigate("/contactus-details", { state: { submission } });
  };

  if (loading) return <Loading icon="/images/contact.png" text="Loading contact submissions..." />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!admin) return <Loading icon="/images/contact.png" text="Loading contact submissions..." />;

  return (
    <>
      <AdminHeader
        title="Contact Us Management"
        adminName={`${admin.name} ${admin.lastName}`}
        profilePicture={admin.profileImageUrl}
      />
      <AdminTabs />

      <div className="contact-management-content">
        {/* Top cards */}
        <div className="contact-management-top-boxes">
          <div
            className={`contact-management-box ${filterStatus === "All" ? 'selected' : ''}`}
            onClick={() => setFilterStatus("All")}
          >
            <img src={bookedIcon} alt="" className="contact-management-icon"/>
            <div className="contact-management-text-container">
              <p className="contact-management-title">All Submissions</p>
              <p className="contact-management-count">{countAll}</p>
            </div>
          </div>
          <div
            className={`contact-management-box ${filterStatus === "pending" ? 'selected' : ''}`}
            onClick={() => setFilterStatus("pending")}
          >
            <img src={bookedIcon} alt="" className="contact-management-icon"/>
            <div className="contact-management-text-container">
              <p className="contact-management-title">pending</p>
              <p className="contact-management-count">{countpending}</p>
            </div>
          </div>
          <div
            className={`contact-management-box ${filterStatus === "completed" ? 'selected' : ''}`}
            onClick={() => setFilterStatus("completed")}
          >
            <img src={bookedIcon} alt="" className="contact-management-icon"/>
            <div className="contact-management-text-container">
              <p className="contact-management-title">completed</p>
              <p className="contact-management-count">{countCompleted}</p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="contact-management-filter-bar">
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="contact-management-search"
          />
          {selectedSubmissions.length > 0 && (
            <img
              src={deleteImage}
              alt="Delete Selected"
              onClick={handleBulkDelete}
              style={{ width: 24, height: 24, cursor: 'pointer' }}
            />
          )}
        </div>

        {/* Submissions table */}
        <div className="contact-management-table-card">
          <table className="contact-management-table">
            <thead>
              <tr>
                <th className="contact-management-th">
                  <input
                    type="checkbox"
                    checked={filteredSubmissions.length > 0 && selectedSubmissions.length === filteredSubmissions.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="contact-management-th">Contact Name</th>
                <th className="contact-management-th">Email</th>
                <th className="contact-management-th">Phone</th>
                <th className="contact-management-th">Status</th>
                <th className="contact-management-th">Submitted At</th>
                <th className="contact-management-th">Completed At</th>
                <th className="contact-management-th">Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr
                  key={submission._id}
                  onClick={() => handleRowClick(submission)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="contact-management-td" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.includes(submission._id)}
                      onChange={(e) => toggleSelectRow(e, submission._id)}
                    />
                  </td>
                  <td className="contact-management-td">{submission.firstName} {submission.lastName}</td>
                  <td className="contact-management-td">{submission.email}</td>
                  <td className="contact-management-td">{submission.phone}</td>
                  <td className="contact-management-td">
                    <span className={`status-${submission.status.toLowerCase()}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="contact-management-td">{new Date(submission.submittedAt).toLocaleString()}</td>
                  <td className="contact-management-td">{submission.completedAt ? new Date(submission.completedAt).toLocaleString() : "N/A"}</td>
                  <td className="contact-management-td">{submission.actionTaken || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ContactUsManagement;
