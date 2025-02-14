import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';

const EnquiryManagement = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [users, setUsers] = useState([]); // for joining enquirer name
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State to control which enquiries are shown ("pending" or "resolved")
  const [filterStatus, setFilterStatus] = useState("pending");

  // State for admin details
  const [admin, setAdmin] = useState(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  // Fetch admin details so we can pass them to the AdminHeader
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

  // Filter enquiries based on search query and active status filter
  const filteredEnquiries = enquiries.filter((enquiry) => {
    if (filterStatus === "pending" && enquiry.status.toLowerCase() !== "pending") return false;
    if (filterStatus === "resolved" && enquiry.status.toLowerCase() !== "resolved") return false;

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

  // Clicking a row navigates to the enquiry details page with the full enquiry object
  const handleRowClick = (enquiry) => {
    navigate("/enquiry-details", { state: { enquiry } });
  };

  // Basic content styling to account for fixed header/sidebar
  const contentStyle = {
    marginTop: "70px", // header height
    marginLeft: "80px", // sidebar width
    padding: "2rem",
  };

  if (loading) return <p>Loading enquiries...</p>;
  if (error) return <p className="error">{error}</p>;

  // Count pending enquiries for the box display
  const pendingCount = enquiries.filter(e => e.status.toLowerCase() === "pending").length;

  // Derive adminName and profilePicture if admin is loaded
  const adminName = admin ? `${admin.name} ${admin.lastName}` : "Admin";
  const profilePicture = admin ? admin.profileImageUrl : "";

  return (
    <>
      <AdminHeader title="Enquiry Management" adminName={adminName} profilePicture={profilePicture} />
      <AdminTabs />
      <div className="enquiry-management" style={contentStyle}>
        {/* Two Clickable Boxes to Filter Enquiries */}
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
            <h3>Pending Enquiries</h3>
            <p>{pendingCount}</p>
          </div>
          <div
            onClick={() => setFilterStatus("resolved")}
            style={{
              padding: "1rem",
              border: filterStatus === "resolved" ? "2px solid blue" : "1px solid #ccc",
              borderRadius: "5px",
              cursor: "pointer",
              flex: 1,
              textAlign: "center",
            }}
          >
            <h3>Resolved Enquiries</h3>
          </div>
        </div>

        {/* Main Search Input */}
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
              <tr 
                key={enquiry._id} 
                onClick={() => handleRowClick(enquiry)}
                style={{ cursor: 'pointer' }}
              >
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
