import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import deleteImage from '/images/deleteImage.png';
import Loading from '../../pages/components/Loading';
import bookedIcon from '/images/booked.png';

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

  // Styles matching other admin pages
  const styles = {
    content: {
      marginTop: 40,
      margin: 40,
      padding: '2rem',
      width: "90vw",
      background: '#f8f9fa',
    },
    topBoxes: {
      display: 'flex',
      gap: 16,
      marginBottom: 24
    },
    box: selected => ({
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: 16,
      borderRadius: 5,
      border: selected ? '2px solid #007bff' : '1px solid #ccc',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      gap: 16,
      whiteSpace: 'nowrap'
    }),
    icon: {
      width: 40,
      height: 40,
      flexShrink: 0
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1.2
    },
    title: {
      margin: 0,
      fontSize: 14,
      fontWeight: 'bold'
    },
    count: {
      margin: 0,
      fontSize: 18,
      color: '#333'
    },
    filterBar: {
      display: 'flex',
      gap: 16,
      marginBottom: 16,
      alignItems: 'center'
    },
    search: {
      width: '100%',
      padding: 8,
      fontSize: 14
    },
    tableCard: {
      background: '#fff',
      borderRadius: 5,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflowY: 'auto',
      maxHeight: 400,
      padding: 16
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      textAlign: 'left',
      fontSize: 14
    },
    th: {
      padding: 8,
      borderBottom: '2px solid #ddd',
      fontWeight: 'bold'
    },
    td: {
      padding: 8,
      borderBottom: '1px solid #eee'
    }
  };

  // Add standardized status styles
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
        title="Contact Us Management"
        adminName={`${admin.name} ${admin.lastName}`}
        profilePicture={admin.profileImageUrl}
      />
      <AdminTabs />

      <div style={styles.content}>
        {/* Top cards */}
        <div style={styles.topBoxes}>
          <div
            style={styles.box(filterStatus === "All")}
            onClick={() => setFilterStatus("All")}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>All Submissions</p>
              <p style={styles.count}>{countAll}</p>
            </div>
          </div>
          <div
            style={styles.box(filterStatus === "pending")}
            onClick={() => setFilterStatus("pending")}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>pending</p>
              <p style={styles.count}>{countpending}</p>
            </div>
          </div>
          <div
            style={styles.box(filterStatus === "completed")}
            onClick={() => setFilterStatus("completed")}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>completed</p>
              <p style={styles.count}>{countCompleted}</p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div style={styles.filterBar}>
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.search}
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
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    checked={filteredSubmissions.length > 0 && selectedSubmissions.length === filteredSubmissions.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={styles.th}>Contact Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Submitted At</th>
                <th style={styles.th}>Completed At</th>
                <th style={styles.th}>Action Taken</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr
                  key={submission._id}
                  onClick={() => handleRowClick(submission)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={styles.td} onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.includes(submission._id)}
                      onChange={(e) => toggleSelectRow(e, submission._id)}
                    />
                  </td>
                  <td style={styles.td}>{submission.firstName} {submission.lastName}</td>
                  <td style={styles.td}>{submission.email}</td>
                  <td style={styles.td}>{submission.phone}</td>
                  <td style={styles.td}>
                    <span style={statusStyles[submission.status] || {}}>
                      {submission.status}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(submission.submittedAt).toLocaleString()}</td>
                  <td style={styles.td}>{submission.completedAt ? new Date(submission.completedAt).toLocaleString() : "N/A"}</td>
                  <td style={styles.td}>{submission.actionTaken || "N/A"}</td>
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
