import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import Loading from '../../pages/components/Loading';
import bookedIcon from '/images/booked.png';
import deleteImage from '/images/deleteImage.png';
import './testimonials.css';

const TestimonialsManagement = () => {
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedTestimonials, setSelectedTestimonials] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState("");

  // Fetch admin details
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

  // Fetch testimonials from backend
  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/auth/testimonials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTestimonials(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      setError("Error fetching testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Compute counts for cards
  const countAll = testimonials.length;
  const countPending = testimonials.filter((t) => !t.approved).length;
  const countApproved = testimonials.filter((t) => t.approved).length;

  // Filter testimonials based on status and search query
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      const statusMatches = filterStatus === "All" || 
        (filterStatus === "Approved" && t.approved) ||
        (filterStatus === "Pending" && !t.approved);
      
      const query = searchQuery.toLowerCase();
      const searchMatches =
        t.name.toLowerCase().includes(query) ||
        t.message.toLowerCase().includes(query);
      
      return statusMatches && searchMatches;
    });
  }, [testimonials, filterStatus, searchQuery]);

  const toggleSelectRow = (e, id) => {
    e.stopPropagation();
    setSelectedTestimonials(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAll = () => {
    if (selectedTestimonials.length === filteredTestimonials.length) {
      setSelectedTestimonials([]);
    } else {
      setSelectedTestimonials(filteredTestimonials.map(t => t._id));
    }
  };

  // Toggle approval status for an individual testimonial
  const handleToggleApproval = async (e, id, currentStatus) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/api/auth/testimonials/${id}`,
        { approved: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTestimonials();
    } catch (error) {
      console.error("Error toggling testimonial approval:", error);
      setError("Error updating testimonial status");
    }
  };

  // Delete testimonial
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
    try {
        setLoading(true);
      await axios.delete(`${API_URL}/api/auth/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
        setError("Error deleting testimonial");
      }
    }
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    if (selectedTestimonials.length === 0) {
      alert("No testimonials selected");
      return;
    }
    try {
      setLoading(true);
      await Promise.all(
        selectedTestimonials.map((id) =>
          axios.put(
            `${API_URL}/api/auth/testimonials/${id}`,
            { approved: true },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      setSelectedTestimonials([]);
      fetchTestimonials();
    } catch (error) {
      console.error("Error bulk approving testimonials:", error);
      setError("Error approving testimonials");
    }
  };

  const handleBulkDisapprove = async () => {
    if (selectedTestimonials.length === 0) {
      alert("No testimonials selected");
      return;
    }
    try {
      setLoading(true);
      await Promise.all(
        selectedTestimonials.map((id) =>
          axios.put(
            `${API_URL}/api/auth/testimonials/${id}`,
            { approved: false },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      setSelectedTestimonials([]);
      fetchTestimonials();
    } catch (error) {
      console.error("Error bulk disapproving testimonials:", error);
      setError("Error disapproving testimonials");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTestimonials.length === 0) {
      alert("No testimonials selected");
      return;
    }
    if (window.confirm("Are you sure you want to delete the selected testimonials?")) {
    try {
        setLoading(true);
      await Promise.all(
        selectedTestimonials.map((id) =>
          axios.delete(`${API_URL}/api/auth/testimonials/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setSelectedTestimonials([]);
      fetchTestimonials();
    } catch (error) {
      console.error("Error bulk deleting testimonials:", error);
        setError("Error deleting testimonials");
      }
    }
  };

  if (loading) return <Loading icon="/images/testimonials.png" text="Loading testimonials..." />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!admin) return <Loading icon="/images/testimonials.png" text="Loading testimonials..." />;

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
    actionIcon: {
      width: 20,
      height: 20,
      cursor: 'pointer',
      marginRight: 8
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
    "Pending": {
      backgroundColor: '#fff3e0',  // Light orange
      color: '#e65100',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "Approved": {
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
        title="Testimonials Management"
        adminName={`${admin.name} ${admin.lastName}`}
        profilePicture={admin.profileImageUrl}
      />
      <AdminTabs />

      <div className="testimonials-management-content">
        {/* Top cards */}
        <div className="testimonials-management-top-boxes">
          <div
            className={`testimonials-management-box ${filterStatus === "All" ? "selected" : ""}`}
            onClick={() => setFilterStatus("All")}
          >
            <img src={bookedIcon} alt="" className="testimonials-management-icon"/>
            <div className="testimonials-management-text-container">
              <p className="testimonials-management-title">All Testimonials</p>
              <p className="testimonials-management-count">{countAll}</p>
            </div>
          </div>
          <div
            className={`testimonials-management-box ${filterStatus === "Pending" ? "selected" : ""}`}
            onClick={() => setFilterStatus("Pending")}
          >
            <img src={bookedIcon} alt="" className="testimonials-management-icon"/>
            <div className="testimonials-management-text-container">
              <p className="testimonials-management-title">Pending</p>
              <p className="testimonials-management-count">{countPending}</p>
            </div>
          </div>
          <div
            className={`testimonials-management-box ${filterStatus === "Approved" ? "selected" : ""}`}
            onClick={() => setFilterStatus("Approved")}
          >
            <img src={bookedIcon} alt="" className="testimonials-management-icon"/>
            <div className="testimonials-management-text-container">
              <p className="testimonials-management-title">Approved</p>
              <p className="testimonials-management-count">{countApproved}</p>
            </div>
          </div>
        </div>

        {/* Search bar and actions */}
        <div className="testimonials-management-filter-bar">
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="testimonials-management-search"
          />
          {selectedTestimonials.length > 0 && (
            <>
              {filterStatus !== "Approved" && (
                <img
                  src="/images/approve.png"
                  alt="Bulk Approve"
                  title="Bulk Approve"
                  onClick={handleBulkApprove}
                  className="testimonials-management-action-icon"
                />
              )}
              {filterStatus !== "Pending" && (
                <img
                  src="/images/disapprove.png"
                  alt="Bulk Disapprove"
                  title="Bulk Disapprove"
                  onClick={handleBulkDisapprove}
                  className="testimonials-management-action-icon"
                />
              )}
              <img
                src={deleteImage}
                alt="Bulk Delete"
                title="Bulk Delete"
                onClick={handleBulkDelete}
                className="testimonials-management-action-icon"
              />
            </>
          )}
        </div>

        {/* Testimonials table */}
        <div className="testimonials-management-table-card">
          <table className="testimonials-management-table">
            <thead>
              <tr>
                <th className="testimonials-management-th">
                  <input
                    type="checkbox"
                    checked={filteredTestimonials.length > 0 && selectedTestimonials.length === filteredTestimonials.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="testimonials-management-th">Name</th>
                <th className="testimonials-management-th">Message</th>
                <th className="testimonials-management-th">Rating</th>
                <th className="testimonials-management-th">Date</th>
                <th className="testimonials-management-th">Status</th>
                <th className="testimonials-management-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestimonials.length > 0 ? (
                filteredTestimonials.map((t) => (
                  <tr key={t._id} style={{ cursor: "pointer" }}>
                    <td className="testimonials-management-td" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedTestimonials.includes(t._id)}
                        onChange={(e) => toggleSelectRow(e, t._id)}
                      />
                    </td>
                    <td className="testimonials-management-td">{t.name}</td>
                    <td className="testimonials-management-td">
                      {t.message.length > 50 ? t.message.substring(0, 50) + "..." : t.message}
                    </td>
                    <td className="testimonials-management-td">{t.rating}</td>
                    <td className="testimonials-management-td">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="testimonials-management-td">
                      <span className={t.approved ? "status-approved" : "status-pending"}>
                        {t.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="testimonials-management-td">
                      <img
                        src={t.approved ? "/images/disapprove.png" : "/images/approve.png"}
                        alt={t.approved ? "Disapprove" : "Approve"}
                        title={t.approved ? "Disapprove" : "Approve"}
                        className="testimonials-management-action-icon"
                        onClick={(e) => handleToggleApproval(e, t._id, t.approved)}
                      />
                      <img
                        src={deleteImage}
                        alt="Delete"
                        title="Delete"
                        className="testimonials-management-action-icon"
                        onClick={(e) => handleDelete(e, t._id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="testimonials-management-td">No testimonials found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TestimonialsManagement;
