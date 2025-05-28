// DeliveryManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import DeliveryDetails from './DeliveryDetails'; // Modal component
import plusImage from '/images/plusImage.png';
import deleteImage from '/images/deleteImage.png'; // Bulk delete image
import Loading from '../../pages/components/Loading';
import bookedIcon from '/images/booked.png';
import './delivery.css';

const DeliveryManagement = () => {
  // Admin details state
  const [admin, setAdmin] = useState(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // State to control which deliveries are shown in the table.
  const [viewStatus, setViewStatus] = useState("toCollect");

  // For viewing delivery details in a modal:
  const [viewDelivery, setViewDelivery] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Multi-selection state for deletion (using "radio buttons" that we control manually)
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState([]);

  // Delivery states
  const [deliveries, setDeliveries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add this style object near the other styles
  const statusStyles = {
    "To Collect": {
      backgroundColor: '#e3f2fd',  // Light blue
      color: '#1976d2',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "Collected": {
      backgroundColor: '#e8f5e9',  // Light green
      color: '#2e7d32',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    },
    "Cancelled": {
      backgroundColor: '#ffebee',  // Light red
      color: '#c62828',
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold'
    }
  };

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const deliveryRes = await axios.get(`${API_URL}/api/auth/deliveries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersRes = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const deliveriesData = deliveryRes.data;
      const usersData = usersRes.data;

      // Join each delivery with matching user's name based on roomNumber
      const joinedData = deliveriesData.map((delivery) => {
        const matchingUser = usersData.find(user => user.roomNumber === delivery.roomNumber);
        return {
          ...delivery,
          recipientName: matchingUser ? `${matchingUser.name} ${matchingUser.lastName}` : "Not Found"
        };
      });

      setDeliveries(joinedData);
      setError("");
      setSelectedDeliveryIds([]); // Clear selections after refresh
    } catch (err) {
      console.error("Error fetching data:", err.response || err);
      setError(err.response?.data?.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_URL, token]);

  const countAll = deliveries.length;
  const countToCollect = deliveries.filter(d => d.status === "To Collect").length;
  const countCollected = deliveries.filter(d => d.status === "Collected").length;

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery) => {
    const query = searchQuery.toLowerCase();
    const searchMatches = (
      delivery.parcelNumber.toLowerCase().includes(query) ||
      (delivery.sender && delivery.sender.toLowerCase().includes(query)) ||
      (delivery.parcelType && delivery.parcelType.toLowerCase().includes(query)) ||
      (delivery.description && delivery.description.toLowerCase().includes(query)) ||
      (delivery.status && delivery.status.toLowerCase().includes(query)) ||
      (delivery.roomNumber && delivery.roomNumber.toLowerCase().includes(query)) ||
      (delivery.recipientName && delivery.recipientName.toLowerCase().includes(query))
    );
    const statusMatches = viewStatus === "toCollect"
      ? delivery.status === "To Collect"
      : delivery.status === "Collected";
    return searchMatches && statusMatches;
  });
  }, [deliveries, searchQuery, viewStatus]);

  const handleSort = (columnKey) => {
    let direction = "ascending";
    if (sortConfig.key === columnKey && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: columnKey, direction });
  };

  // When a row's radio "button" is clicked, toggle its selection
  const handleRowSelect = (e, id) => {
    e.stopPropagation();
    setSelectedDeliveryIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };

  // Handler for the header "Select All" radio button
  const handleSelectAll = () => {
    if (selectedDeliveryIds.length === filteredDeliveries.length) {
      // If already all selected, unselect all
      setSelectedDeliveryIds([]);
    } else {
      // Otherwise, select all
      setSelectedDeliveryIds(filteredDeliveries.map(delivery => delivery._id));
    }
  };

  // Bulk deletion handler using the selected deliveries
  const handleBulkDelete = async () => {
    if (selectedDeliveryIds.length === 0) {
      alert("No rows selected");
      return;
    }
    if (window.confirm("Are you sure you want to delete the selected deliveries?")) {
      try {
        setLoading(true);
        await Promise.all(selectedDeliveryIds.map(id =>
          axios.delete(`${API_URL}/api/auth/deliveries/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ));
        setSelectedDeliveryIds([]);
        fetchData();
      } catch (err) {
        console.error("Error deleting deliveries:", err.response || err);
        alert("Error deleting deliveries");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <Loading icon="/images/deliveries.png" text="Loading delivery details..." />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!admin) return <Loading icon="/images/deliveries.png" text="Loading delivery details..." />;

  return (
    <>
      <AdminHeader 
        title="Delivery Management" 
        adminName={`${admin.name} ${admin.lastName}`} 
        profilePicture={admin.profileImageUrl} 
      />
      <AdminTabs />

      <div className="delivery-management-content">
        {/* Top cards */}
        <div className="delivery-management-top-boxes">
          <div
            className={`delivery-management-box ${viewStatus === "all" ? "selected" : ""}`}
            onClick={() => setViewStatus("all")}
          >
            <img src={bookedIcon} alt="" className="delivery-management-icon"/>
            <div className="delivery-management-text-container">
              <p className="delivery-management-title">All Deliveries</p>
              <p className="delivery-management-count">{countAll}</p>
            </div>
          </div>
          <div
            className={`delivery-management-box ${viewStatus === "toCollect" ? "selected" : ""}`}
            onClick={() => setViewStatus("toCollect")}
          >
            <img src={bookedIcon} alt="" className="delivery-management-icon"/>
            <div className="delivery-management-text-container">
              <p className="delivery-management-title">To Collect</p>
              <p className="delivery-management-count">{countToCollect}</p>
            </div>
          </div>
          <div
            className={`delivery-management-box ${viewStatus === "collected" ? "selected" : ""}`}
            onClick={() => setViewStatus("collected")}
          >
            <img src={bookedIcon} alt="" className="delivery-management-icon"/>
            <div className="delivery-management-text-container">
              <p className="delivery-management-title">Collected</p>
              <p className="delivery-management-count">{countCollected}</p>
            </div>
          </div>
        </div>

        {/* Search + Add New */}
        <div className="delivery-management-filter-bar">
          <input
            type="text"
            placeholder="Search deliveries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="delivery-management-search"
          />
          <button
            className="delivery-management-add-btn"
            onClick={() => navigate('/add-delivery')}
          >
            Add New Delivery
          </button>
          {selectedDeliveryIds.length > 0 && (
            <img 
              src={deleteImage} 
              alt="Delete Selected" 
              onClick={handleBulkDelete}
              style={{ width: 24, height: 24, cursor: 'pointer' }}
            />
          )}
        </div>

        {/* Deliveries table */}
        <div className="delivery-management-table-card">
          <table className="delivery-management-table">
            <thead>
              <tr>
                <th className="delivery-management-th">
                  <input
                    type="checkbox"
                    checked={filteredDeliveries.length > 0 && selectedDeliveryIds.length === filteredDeliveries.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="delivery-management-th">Parcel Number</th>
                <th className="delivery-management-th">Sender</th>
                <th className="delivery-management-th">Parcel Type</th>
                <th className="delivery-management-th">Description</th>
                <th className="delivery-management-th">Status</th>
                <th className="delivery-management-th">Room Number</th>
                <th className="delivery-management-th">Recipient Name</th>
                <th className="delivery-management-th">Created At</th>
                <th className="delivery-management-th">Collected At</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.map((delivery) => (
                <tr 
                  key={delivery._id}
                  onClick={() => { setViewDelivery(delivery); setShowDetailsModal(true); }}
                  style={{ cursor: "pointer" }}
                >
                  <td className="delivery-management-td" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox"
                      checked={selectedDeliveryIds.includes(delivery._id)}
                      onChange={(e) => handleRowSelect(e, delivery._id)}
                    />
                  </td>
                  <td className="delivery-management-td">{delivery.parcelNumber}</td>
                  <td className="delivery-management-td">{delivery.sender}</td>
                  <td className="delivery-management-td">{delivery.parcelType}</td>
                  <td className="delivery-management-td">{delivery.description}</td>
                  <td className="delivery-management-td">
                    <span className={`status-${delivery.status.toLowerCase().replace(' ', '-')}`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td className="delivery-management-td">{delivery.roomNumber}</td>
                  <td className="delivery-management-td">{delivery.recipientName}</td>
                  <td className="delivery-management-td">{new Date(delivery.arrivedAt).toLocaleString()}</td>
                  <td className="delivery-management-td">{delivery.collectedAt ? new Date(delivery.collectedAt).toLocaleString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showDetailsModal && viewDelivery && (
          <DeliveryDetails 
            delivery={viewDelivery} 
            onClose={() => setShowDetailsModal(false)} 
            onUpdateDeleted={fetchData}
          />
        )}
      </div>
    </>
  );
};

export default DeliveryManagement;
