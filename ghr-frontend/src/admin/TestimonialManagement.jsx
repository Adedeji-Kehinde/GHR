import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";

const TestimonialsManagement = () => {
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // Default view: Approved testimonials
  const [filterStatus, setFilterStatus] = useState("Approved");
  const [selectedTestimonials, setSelectedTestimonials] = useState([]);
  // Sort configuration state
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });

  // Fetch testimonials from backend
  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/auth/testimonials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTestimonials(response.data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Compute counts for cards
  const pendingCount = testimonials.filter((t) => !t.approved).length;
  const approvedCount = testimonials.filter((t) => t.approved).length;

  // Filter testimonials based on status and search query
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      const matchesStatus =
        filterStatus === "Approved"
          ? t.approved === true
          : filterStatus === "Pending"
          ? t.approved === false
          : true;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        t.name.toLowerCase().includes(query) ||
        t.message.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [testimonials, filterStatus, searchQuery]);

  // Sorting functionality
  const handleSort = (columnKey) => {
    let direction = "ascending";
    if (sortConfig.key === columnKey && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: columnKey, direction });
  };

  const sortedTestimonials = useMemo(() => {
    let sortableTestimonials = [...filteredTestimonials];
    if (sortConfig.key) {
      sortableTestimonials.sort((a, b) => {
        let aValue, bValue;
        switch (sortConfig.key) {
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "message":
            aValue = a.message.toLowerCase();
            bValue = b.message.toLowerCase();
            break;
          case "rating":
            aValue = a.rating;
            bValue = b.rating;
            break;
          case "date":
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case "status":
            aValue = a.approved ? "approved" : "pending";
            bValue = b.approved ? "approved" : "pending";
            break;
          default:
            aValue = "";
            bValue = "";
        }
        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableTestimonials;
  }, [filteredTestimonials, sortConfig]);

  // Toggle selection for an individual testimonial (using a checkbox)
  const toggleSelectRow = (id) => {
    setSelectedTestimonials((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle selection for all visible testimonials using the header cell
  const toggleSelectAll = () => {
    const visibleIds = filteredTestimonials.map((t) => t._id);
    const allSelected = visibleIds.every((id) =>
      selectedTestimonials.includes(id)
    );
    if (allSelected) {
      setSelectedTestimonials((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      const newSelected = Array.from(new Set([...selectedTestimonials, ...visibleIds]));
      setSelectedTestimonials(newSelected);
    }
  };

  // Toggle approval status for an individual testimonial using the PUT route
  const handleToggleApproval = async (id, currentStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/auth/testimonials/${id}`,
        { approved: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTestimonials();
    } catch (error) {
      console.error("Error toggling testimonial approval:", error);
    }
  };

  // Delete testimonial
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/auth/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  // Bulk actions using image icons
  const bulkApprove = async () => {
    if (selectedTestimonials.length === 0) {
      alert("No testimonials selected.");
      return;
    }
    try {
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
    }
  };

  const bulkDisapprove = async () => {
    if (selectedTestimonials.length === 0) {
      alert("No testimonials selected.");
      return;
    }
    try {
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
    }
  };

  const bulkDelete = async () => {
    if (selectedTestimonials.length === 0) {
      alert("No testimonials selected.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete the selected testimonials?")) return;
    try {
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
    }
  };

  // Helper to display sort indicator
  const getSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return "";
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  // Styles
  const containerStyle = {
    marginLeft: "100px",
    padding: "2rem",
  };

  const cardContainerStyle = {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  };

  const cardStyle = (active) => ({
    padding: "1rem",
    border: active ? "2px solid blue" : "1px solid #ccc",
    borderRadius: "5px",
    cursor: "pointer",
    flex: 1,
    textAlign: "center",
  });

  const iconStyle = {
    width: "20px",
    height: "20px",
    cursor: "pointer",
    marginRight: "0.5rem",
  };

  return (
    <>
      <AdminHeader title="Testimonials Management" adminName="Admin" profilePicture="" />
      <AdminTabs />
      <div style={containerStyle}>
        {/* Card-Based Filtering */}
        <div style={cardContainerStyle}>
          <div
            style={cardStyle(filterStatus === "Pending")}
            onClick={() => setFilterStatus("Pending")}
          >
            <h3>Pending Testimonials</h3>
            <p>{pendingCount}</p>
          </div>
          <div
            style={cardStyle(filterStatus === "Approved")}
            onClick={() => setFilterStatus("Approved")}
          >
            <h3>Approved Testimonials</h3>
            <p>{approvedCount}</p>
          </div>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search testimonials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
        />

        {/* Bulk Action Icons */}
        {selectedTestimonials.length > 0 && (
          <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
            {filterStatus === "Pending" && (
              <img
                src="/images/approve.png"
                alt="Bulk Approve"
                title="Bulk Approve"
                style={{ cursor: "pointer", width: "25px", height: "25px" }}
                onClick={bulkApprove}
              />
            )}
            {filterStatus === "Approved" && (
              <img
                src="/images/disapprove.png"
                alt="Bulk Disapprove"
                title="Bulk Disapprove"
                style={{ cursor: "pointer", width: "25px", height: "25px" }}
                onClick={bulkDisapprove}
              />
            )}
            <img
              src="/images/deleteImage.png"
              alt="Bulk Delete"
              title="Bulk Delete"
              style={{ cursor: "pointer", width: "25px", height: "25px" }}
              onClick={bulkDelete}
            />
          </div>
        )}

        {/* Testimonials Table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }} border="1" cellPadding="10">
          <thead>
            <tr>
              <th
                checked={
                  filteredTestimonials.length > 0 &&
                  filteredTestimonials.every((t) => selectedTestimonials.includes(t._id))
                }
                onClick={toggleSelectAll}
                style={{ cursor: "pointer" }}
              >
                Select All
              </th>
              <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                Name{getSortIndicator("name")}
              </th>
              <th onClick={() => handleSort("message")} style={{ cursor: "pointer" }}>
                Message{getSortIndicator("message")}
              </th>
              <th onClick={() => handleSort("rating")} style={{ cursor: "pointer", textAlign: "center" }}>
                Rating{getSortIndicator("rating")}
              </th>
              <th onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>
                Date{getSortIndicator("date")}
              </th>
              <th onClick={() => handleSort("status")} style={{ cursor: "pointer", textAlign: "center" }}>
                Status{getSortIndicator("status")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading testimonials...</td>
              </tr>
            ) : sortedTestimonials.length > 0 ? (
              sortedTestimonials.map((t) => (
                <tr key={t._id}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedTestimonials.includes(t._id)}
                      onChange={() => toggleSelectRow(t._id)}
                    />
                  </td>
                  <td>{t.name}</td>
                  <td>{t.message.length > 50 ? t.message.substring(0, 50) + "..." : t.message}</td>
                  <td style={{ textAlign: "center" }}>{t.rating}</td>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={{ textAlign: "center" }}>{t.approved ? "Approved" : "Pending"}</td>
                  <td style={{ textAlign: "center" }}>
                    <img
                      src={t.approved ? "/images/disapprove.png" : "/images/approve.png"}
                      alt={t.approved ? "Disapprove" : "Approve"}
                      title={t.approved ? "Disapprove" : "Approve"}
                      style={iconStyle}
                      onClick={() => handleToggleApproval(t._id, t.approved)}
                    />
                    <img
                      src="/images/deleteImage.png"
                      alt="Delete"
                      title="Delete"
                      style={iconStyle}
                      onClick={() => handleDelete(t._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No testimonials found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TestimonialsManagement;
