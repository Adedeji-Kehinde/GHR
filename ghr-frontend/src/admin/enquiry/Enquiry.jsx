// EnquiryManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import deleteImage from '/images/deleteImage.png';
import Loading from '../../pages/components/Loading';
import bookedIcon from '/images/booked.png';

const EnquiryManagement = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [admin, setAdmin] = useState(null);
  const [selectedEnquiries, setSelectedEnquiries] = useState([]);
  
  const API_URL = import.meta.env.VITE_API_BASE_URL ||"http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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

  // Fetch enquiries and users
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
      
      const joinedData = enquiriesData.map((enquiry) => {
        const matchingUser = usersData.find(user => user.roomNumber === enquiry.roomNumber);
        return {
          ...enquiry,
          enquirerName: matchingUser ? `${matchingUser.name} ${matchingUser.lastName}` : "Not Found"
        };
      });
      setEnquiries(joinedData);
      setError("");
      setSelectedEnquiries([]);
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

  const countAll = enquiries.length;
  const countPending = enquiries.filter(enquiry => enquiry.status.toLowerCase() === "pending").length;
  const countResolved = enquiries.filter(enquiry => enquiry.status.toLowerCase() === "resolved").length;

  // Filter enquiries based on search query and active status filter
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) => {
      const statusMatches = filterStatus === "All" || 
                          enquiry.status.toLowerCase() === filterStatus.toLowerCase();
    const query = searchQuery.toLowerCase();
      const searchMatches = (
      enquiry.requestId.toString().includes(query) ||
      (enquiry.roomNumber && enquiry.roomNumber.toLowerCase().includes(query)) ||
      (enquiry.enquiryText && enquiry.enquiryText.toLowerCase().includes(query)) ||
      (enquiry.status && enquiry.status.toLowerCase().includes(query)) ||
      (enquiry.response && enquiry.response.toLowerCase().includes(query)) ||
      (enquiry.enquirerName && enquiry.enquirerName.toLowerCase().includes(query))
    );
      return statusMatches && searchMatches;
    });
  }, [enquiries, searchQuery, filterStatus]);

  const toggleSelectRow = (e, id) => {
    e.stopPropagation();
    setSelectedEnquiries(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAll = () => {
    if (selectedEnquiries.length === filteredEnquiries.length) {
      setSelectedEnquiries([]);
    } else {
      setSelectedEnquiries(filteredEnquiries.map(enquiry => enquiry._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEnquiries.length === 0) {
      alert("No enquiries selected");
      return;
    }
    if (window.confirm("Are you sure you want to delete the selected enquiries?")) {
    try {
        setLoading(true);
        await Promise.all(selectedEnquiries.map(id =>
          axios.delete(`${API_URL}/api/auth/enquiries/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ));
        setSelectedEnquiries([]);
      fetchData();
    } catch (err) {
        console.error("Error deleting enquiries:", err.response || err);
        alert("Error deleting enquiries");
      }
    }
  };

  const handleRowClick = (enquiry) => {
    navigate("/enquiry-details", { state: { enquiry } });
  };

  if (loading) return <Loading icon="/images/enquiries.png" text="Loading enquiries..." />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!admin) return <Loading icon="/images/enquiries.png" text="Loading enquiries..." />;

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

  // Add this style object near the other styles
  const statusStyles = {
    "Pending": {
      backgroundColor: '#fff3e0',  // Light orange
      color: '#e65100',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "Resolved": {
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
        title="Enquiry Management"
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
              <p style={styles.title}>All Enquiries</p>
              <p style={styles.count}>{countAll}</p>
            </div>
          </div>
          <div
            style={styles.box(filterStatus === "Pending")}
            onClick={() => setFilterStatus("Pending")}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>Pending</p>
              <p style={styles.count}>{countPending}</p>
            </div>
          </div>
          <div
            style={styles.box(filterStatus === "Resolved")}
            onClick={() => setFilterStatus("Resolved")}
          >
            <img src={bookedIcon} alt="" style={styles.icon}/>
            <div style={styles.textContainer}>
              <p style={styles.title}>Resolved</p>
              <p style={styles.count}>{countResolved}</p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Search enquiries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.search}
        />
        {selectedEnquiries.length > 0 && (
            <img
              src={deleteImage}
              alt="Delete Selected"
              onClick={handleBulkDelete}
              style={{ width: 24, height: 24, cursor: 'pointer' }}
            />
          )}
          </div>

        {/* Enquiries table */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
          <thead>
            <tr>
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    checked={filteredEnquiries.length > 0 && selectedEnquiries.length === filteredEnquiries.length}
                    onChange={handleSelectAll}
                  />
              </th>
                <th style={styles.th}>Request ID</th>
                <th style={styles.th}>Room Number</th>
                <th style={styles.th}>Enquiry Text</th>
                <th style={styles.th}>Enquirer Name</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Response</th>
                <th style={styles.th}>Created At</th>
                <th style={styles.th}>Resolved At</th>
            </tr>
          </thead>
          <tbody>
              {filteredEnquiries.map((enquiry) => (
              <tr 
                key={enquiry._id}
                onClick={() => handleRowClick(enquiry)}
                  style={{ cursor: "pointer" }}
              >
                  <td style={styles.td} onClick={e => e.stopPropagation()}>
                  <input
                      type="checkbox"
                    checked={selectedEnquiries.includes(enquiry._id)}
                      onChange={(e) => toggleSelectRow(e, enquiry._id)}
                  />
                </td>
                  <td style={styles.td}>{enquiry.requestId}</td>
                  <td style={styles.td}>{enquiry.roomNumber}</td>
                  <td style={styles.td}>{enquiry.enquiryText}</td>
                  <td style={styles.td}>{enquiry.enquirerName}</td>
                  <td style={styles.td}>
                    <span style={statusStyles[enquiry.status] || {}}>
                      {enquiry.status}
                    </span>
                  </td>
                  <td style={styles.td}>{enquiry.response}</td>
                  <td style={styles.td}>{new Date(enquiry.createdAt).toLocaleString()}</td>
                  <td style={styles.td}>{enquiry.resolvedAt ? new Date(enquiry.resolvedAt).toLocaleString() : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
};

export default EnquiryManagement;
