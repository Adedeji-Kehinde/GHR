// EnquiryManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import deleteImage from '/images/deleteImage.png';
import Loading from '../../pages/components/Loading';
import bookedIcon from '/images/booked.png';
import './enquiry.css';

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

  return (
    <>
      <AdminHeader
        title="Enquiry Management"
        adminName={`${admin.name} ${admin.lastName}`}
        profilePicture={admin.profileImageUrl}
      />
      <AdminTabs />

      <div className="enquiry-management-content">
        {/* Top cards */}
        <div className="enquiry-management-top-boxes">
          <div
            className={`enquiry-management-box ${filterStatus === "All" ? "selected" : ""}`}
            onClick={() => setFilterStatus("All")}
          >
            <img src={bookedIcon} alt="" className="enquiry-management-icon"/>
            <div className="enquiry-management-text-container">
              <p className="enquiry-management-title">All Enquiries</p>
              <p className="enquiry-management-count">{countAll}</p>
            </div>
          </div>
          <div
            className={`enquiry-management-box ${filterStatus === "Pending" ? "selected" : ""}`}
            onClick={() => setFilterStatus("Pending")}
          >
            <img src={bookedIcon} alt="" className="enquiry-management-icon"/>
            <div className="enquiry-management-text-container">
              <p className="enquiry-management-title">Pending</p>
              <p className="enquiry-management-count">{countPending}</p>
            </div>
          </div>
          <div
            className={`enquiry-management-box ${filterStatus === "Resolved" ? "selected" : ""}`}
            onClick={() => setFilterStatus("Resolved")}
          >
            <img src={bookedIcon} alt="" className="enquiry-management-icon"/>
            <div className="enquiry-management-text-container">
              <p className="enquiry-management-title">Resolved</p>
              <p className="enquiry-management-count">{countResolved}</p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="enquiry-management-filter-bar">
          <input
            type="text"
            placeholder="Search enquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="enquiry-management-search"
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
        <div className="enquiry-management-table-card">
          <table className="enquiry-management-table">
            <thead>
              <tr>
                <th className="enquiry-management-th">
                  <input
                    type="checkbox"
                    checked={filteredEnquiries.length > 0 && selectedEnquiries.length === filteredEnquiries.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="enquiry-management-th">Request ID</th>
                <th className="enquiry-management-th">Room Number</th>
                <th className="enquiry-management-th">Enquiry Text</th>
                <th className="enquiry-management-th">Enquirer Name</th>
                <th className="enquiry-management-th">Status</th>
                <th className="enquiry-management-th">Response</th>
                <th className="enquiry-management-th">Created At</th>
                <th className="enquiry-management-th">Resolved At</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map((enquiry) => (
                <tr 
                  key={enquiry._id}
                  onClick={() => handleRowClick(enquiry)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="enquiry-management-td" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedEnquiries.includes(enquiry._id)}
                      onChange={(e) => toggleSelectRow(e, enquiry._id)}
                    />
                  </td>
                  <td className="enquiry-management-td">{enquiry.requestId}</td>
                  <td className="enquiry-management-td">{enquiry.roomNumber}</td>
                  <td className="enquiry-management-td">{enquiry.enquiryText}</td>
                  <td className="enquiry-management-td">{enquiry.enquirerName}</td>
                  <td className="enquiry-management-td">
                    <span className={`status-${enquiry.status.toLowerCase()}`}>
                      {enquiry.status}
                    </span>
                  </td>
                  <td className="enquiry-management-td">{enquiry.response}</td>
                  <td className="enquiry-management-td">{new Date(enquiry.createdAt).toLocaleString()}</td>
                  <td className="enquiry-management-td">{enquiry.resolvedAt ? new Date(enquiry.resolvedAt).toLocaleString() : "N/A"}</td>
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
