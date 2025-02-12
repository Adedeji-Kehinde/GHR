import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';

const EnquiryManagement = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [users, setUsers] = useState([]); // for joining enquirer name
  const [searchQuery, setSearchQuery] = useState("");
  const [updateSearchQuery, setUpdateSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Toggle update form visibility
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Update Enquiry form state
  const [selectedEnquiryId, setSelectedEnquiryId] = useState("");
  const [updateEnquiry, setUpdateEnquiry] = useState({
    status: "",
    response: "",
  });

  // State for admin details
  const [admin, setAdmin] = useState(null);

  const API_URL =  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Fetch logged-in admin's details
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

  // Fetch enquiries and users, then join enquirer name
  const fetchData = async () => {
    setLoading(true);
    try {
      const enquiriesRes = await axios.get(`${API_URL}/api/auth/enquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersRes = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const enquiriesData = enquiriesRes.data;
      const usersData = usersRes.data;
      setUsers(usersData);

      // Join each enquiry with the enquirer's full name based on roomNumber
      const joinedData = enquiriesData.map((enquiry) => {
        const matchingUser = usersData.find(user => user.roomNumber === enquiry.roomNumber);
        return {
          ...enquiry,
          enquirerName: matchingUser ? `${matchingUser.name} ${matchingUser.lastName}` : "Not Found"
        };
      });
      setEnquiries(joinedData);
      setError("");
    } catch (err) {
      console.error("Error fetching enquiries:", err.response || err);
      setError(err.response?.data?.message || "Error fetching enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_URL, token]);

  // Filter enquiries for the main table based on searchQuery (case-insensitive)
  const filteredEnquiries = enquiries.filter((enquiry) => {
    const query = searchQuery.toLowerCase();
    return (
      enquiry.requestId.toString().includes(query) ||
      (enquiry.roomNumber && enquiry.roomNumber.toLowerCase().includes(query)) ||
      (enquiry.enquiryText && enquiry.enquiryText.toLowerCase().includes(query)) ||
      (enquiry.status && enquiry.status.toLowerCase().includes(query)) ||
      (enquiry.response && enquiry.response.toLowerCase().includes(query)) ||
      (enquiry.enquirerName && enquiry.enquirerName.toLowerCase().includes(query))
    );
  });

  // Sorting logic for the table
  const sortedEnquiries = useMemo(() => {
    let sortable = [...filteredEnquiries];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aValue = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : "";
        const bValue = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : "";
        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredEnquiries, sortConfig]);

  const handleSort = (columnKey) => {
    let direction = "ascending";
    if (sortConfig.key === columnKey && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: columnKey, direction });
  };

  // Update Enquiry section – filter for update based on updateSearchQuery
  const filteredForUpdate = enquiries.filter((enquiry) => {
    const query = updateSearchQuery.toLowerCase();
    return (
      enquiry.requestId.toString().includes(query) ||
      (enquiry.roomNumber && enquiry.roomNumber.toLowerCase().includes(query)) ||
      (enquiry.enquiryText && enquiry.enquiryText.toLowerCase().includes(query)) ||
      (enquiry.status && enquiry.status.toLowerCase().includes(query))
    );
  });

  const handleSelectEnquiry = (id) => {
    setSelectedEnquiryId(id);
    const enquiry = enquiries.find(e => e._id === id);
    if (enquiry) {
      setUpdateEnquiry({
        status: enquiry.status,
        response: enquiry.response || "",
      });
    } else {
      setUpdateEnquiry({ status: "", response: "" });
    }
  };

  const handleUpdateChange = (e) => {
    setUpdateEnquiry({ ...updateEnquiry, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEnquiryId) {
      setError("Please select an enquiry to update.");
      return;
    }
    try {
      await axios.put(`${API_URL}/api/auth/enquiries/${selectedEnquiryId}`, updateEnquiry, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setShowUpdateForm(false);
      setSelectedEnquiryId("");
    } catch (err) {
      console.error("Error updating enquiry:", err.response || err);
      setError(err.response?.data?.message || "Error updating enquiry");
    }
  };

  const handleDeleteEnquiry = async () => {
    if (!selectedEnquiryId) {
      setError("Please select an enquiry to delete.");
      return;
    }
    try {
      await axios.delete(`${API_URL}/api/auth/enquiries/${selectedEnquiryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setShowUpdateForm(false);
      setSelectedEnquiryId("");
    } catch (err) {
      console.error("Error deleting enquiry:", err.response || err);
      setError(err.response?.data?.message || "Error deleting enquiry");
    }
  };

  // Define content style to offset fixed header and sidebar
  const contentStyle = {
    marginTop: "70px", // header height
    marginLeft: "80px", // sidebar width
    padding: "2rem",
  };

  if (loading) return <p>Loading enquiries...</p>;
  if (error) return <p className="error">{error}</p>;

  // If admin details haven't loaded yet, you can render a loading indicator
  if (!admin) return <p>Loading admin details...</p>;

  const adminName = `${admin.name} ${admin.lastName}`;
  const profilePicture = admin.profileImageUrl;

  return (
    <>
      <AdminHeader title="Enquiry Management" adminName={adminName} profilePicture={profilePicture} />
      <AdminTabs />
      <div className="enquiry-management" style={contentStyle}>
        {/* Update Enquiry Section */}
        <div style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
          <h2>Update/Delete Enquiry</h2>
          <input
            type="text"
            placeholder="Search enquiry..."
            value={updateSearchQuery}
            onChange={(e) => setUpdateSearchQuery(e.target.value)}
            style={{ marginBottom: "0.5rem", padding: "0.5rem", width: "100%" }}
          />
          <ul style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #ccc", padding: "0.5rem", listStyle: "none" }}>
            {filteredForUpdate.map((enquiry) => (
              <li
                key={enquiry._id}
                style={{ cursor: "pointer", padding: "0.25rem" }}
                onClick={() => handleSelectEnquiry(enquiry._id)}
              >
                {enquiry.requestId} - {enquiry.roomNumber} - {enquiry.status}
              </li>
            ))}
          </ul>
          {selectedEnquiryId && (
            <form onSubmit={handleUpdateSubmit}>
              <select name="status" value={updateEnquiry.status} onChange={handleUpdateChange} required>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>
              <textarea
                name="response"
                placeholder="Write response here..."
                value={updateEnquiry.response}
                onChange={handleUpdateChange}
                style={{ width: "100%", minHeight: "80px", marginTop: "0.5rem" }}
              />
              <div style={{ marginTop: "1rem" }}>
                <button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Enquiry"}
                </button>
                <button type="button" onClick={handleDeleteEnquiry} disabled={loading} style={{ marginLeft: "1rem" }}>
                  {loading ? "Deleting..." : "Delete Enquiry"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Main Search Input for Table */}
        <input
          type="text"
          placeholder="Search enquiries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />

        {/* Enquiries Table */}
        <table 
          border="1" 
          cellPadding="10" 
          cellSpacing="0" 
          style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}
        >
          <thead>
            <tr>
              <th onClick={() => handleSort("requestId")} style={{cursor: 'pointer'}}>Request ID</th>
              <th onClick={() => handleSort("roomNumber")} style={{cursor: 'pointer'}}>Room Number</th>
              <th onClick={() => handleSort("enquiryText")} style={{cursor: 'pointer'}}>Enquiry Text</th>
              <th onClick={() => handleSort("enquirerName")} style={{cursor: 'pointer'}}>Enquirer Name</th>
              <th onClick={() => handleSort("status")} style={{cursor: 'pointer'}}>Status</th>
              <th onClick={() => handleSort("response")} style={{cursor: 'pointer'}}>Response</th>
              <th onClick={() => handleSort("createdAt")} style={{cursor: 'pointer'}}>Created At</th>
              <th onClick={() => handleSort("resolvedAt")} style={{cursor: 'pointer'}}>Resolved At</th>
            </tr>
          </thead>
          <tbody>
            {sortedEnquiries.map((enquiry) => (
              <tr key={enquiry._id}>
                <td>{enquiry.requestId}</td>
                <td>{enquiry.roomNumber}</td>
                <td>{enquiry.enquiryText}</td>
                <td>{enquiry.enquirerName}</td>
                <td>{enquiry.status}</td>
                <td>{enquiry.response}</td>
                <td>{new Date(enquiry.createdAt).toLocaleString()}</td>
                <td>{enquiry.resolvedAt ? new Date(enquiry.resolvedAt).toLocaleString() : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EnquiryManagement;
