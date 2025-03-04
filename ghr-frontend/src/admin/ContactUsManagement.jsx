import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';
import deleteImage from '/images/deleteImage.png';

const ContactUsManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });
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

  const filteredSubmissions = submissions.filter(submission => {
    if (filterStatus === "pending" && submission.status.toLowerCase() !== "pending") return false;
    if (filterStatus === "completed" && submission.status.toLowerCase() !== "completed") return false;
    const query = searchQuery.toLowerCase();
    return (
      submission.firstName.toLowerCase().includes(query) ||
      submission.lastName.toLowerCase().includes(query) ||
      submission.email.toLowerCase().includes(query) ||
      submission.phone.toLowerCase().includes(query) ||
      submission.message.toLowerCase().includes(query) ||
      submission.status.toLowerCase().includes(query)
    );
  });

  const sortedSubmissions = useMemo(() => {
    let sortable = [...filteredSubmissions];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === "contactName") {
          aValue = (a.firstName + " " + a.lastName).toLowerCase();
          bValue = (b.firstName + " " + b.lastName).toLowerCase();
        } else {
          aValue = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : "";
          bValue = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : "";
        }
        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredSubmissions, sortConfig]);

  const handleSort = (columnKey) => {
    let direction = "ascending";
    if (sortConfig.key === columnKey && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: columnKey, direction });
  };

  const toggleSelectRow = (id) => {
    setSelectedSubmissions(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = sortedSubmissions.map(s => s._id);
    const allSelected = visibleIds.every(id => selectedSubmissions.includes(id));
    if (allSelected) {
      setSelectedSubmissions(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      const newSelected = Array.from(new Set([...selectedSubmissions, ...visibleIds]));
      setSelectedSubmissions(newSelected);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSubmissions.length === 0) {
      alert("No submissions selected.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete selected submissions?")) return;
    try {
      await Promise.all(
        selectedSubmissions.map(id =>
          axios.delete(`${API_URL}/api/auth/contactus/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      alert("Selected submissions deleted successfully!");
      fetchData();
    } catch (err) {
      console.error("Error deleting submissions:", err.response || err);
      alert("Error deleting submissions");
    }
  };

  const handleRowClick = (submission) => {
    navigate("/contactus-details", { state: { submission } });
  };

  const contentStyle = {
    marginTop: "70px",
    marginLeft: "80px",
    padding: "2rem",
    position: "relative",
  };

  if (loading) return <p>Loading submissions...</p>;
  if (error) return <p className="error">{error}</p>;

  const pendingCount = submissions.filter(s => s.status.toLowerCase() === "pending").length;
  const adminName = admin ? `${admin.name} ${admin.lastName}` : "Admin";
  const profilePicture = admin ? admin.profileImageUrl : "";

  return (
    <>
      <AdminHeader title="Contact Us Management" adminName={adminName} profilePicture={profilePicture} />
      <AdminTabs />
      <div className="contactus-management" style={contentStyle}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div
            onClick={() => setFilterStatus("pending")}
            style={{
              padding: "1rem",
              border: filterStatus === "pending" ? "2px solid blue" : "1px solid #ccc",
              borderRadius: "5px",
              cursor: "pointer",
              flex: 1,
              textAlign: "center",
            }}
          >
            <h3>Pending Submissions</h3>
            <p>{pendingCount}</p>
          </div>
          <div
            onClick={() => setFilterStatus("completed")}
            style={{
              padding: "1rem",
              border: filterStatus === "completed" ? "2px solid blue" : "1px solid #ccc",
              borderRadius: "5px",
              cursor: "pointer",
              flex: 1,
              textAlign: "center",
            }}
          >
            <h3>Completed Submissions</h3>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search submissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />

        {selectedSubmissions.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
            <img
              src={deleteImage}
              alt="Delete Selected"
              style={{ cursor: "pointer", width: "25px", height: "25px" }}
              onClick={handleDeleteSelected}
            />
          </div>
        )}

        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
          <thead>
            <tr>
            <th>
                <label style={{ cursor: 'pointer' }}>
                  <th
                    onClick={toggleSelectAll}
                    checked={
                      sortedSubmissions.length > 0 &&
                      sortedSubmissions.every((s) => selectedSubmissions.includes(s._id))
                    }
                    readOnly
                  />
                </label>
              </th>
              <th onClick={() => handleSort("contactName")} style={{ cursor: "pointer" }}>Contact Name</th>
              <th onClick={() => handleSort("email")} style={{ cursor: "pointer" }}>Email</th>
              <th onClick={() => handleSort("phone")} style={{ cursor: "pointer" }}>Phone</th>
              <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>Status</th>
              <th onClick={() => handleSort("submittedAt")} style={{ cursor: "pointer" }}>Submitted At</th>
              <th onClick={() => handleSort("completedAt")} style={{ cursor: "pointer" }}>Completed At</th>
              <th onClick={() => handleSort("actionTaken")} style={{ cursor: "pointer" }}>Action Taken</th>
            </tr>
          </thead>
          <tbody>
            {sortedSubmissions.map(submission => (
              <tr key={submission._id} onClick={() => handleRowClick(submission)} style={{ cursor: "pointer" }}>
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="radio"
                    checked={selectedSubmissions.includes(submission._id)}
                    onChange={() => toggleSelectRow(submission._id)}
                    readOnly
                  />
                </td>
                <td>{submission.firstName} {submission.lastName}</td>
                <td>{submission.email}</td>
                <td>{submission.phone}</td>
                <td>{submission.status}</td>
                <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                <td>{submission.completedAt ? new Date(submission.completedAt).toLocaleString() : "N/A"}</td>
                <td>{submission.actionTaken || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ContactUsManagement;
