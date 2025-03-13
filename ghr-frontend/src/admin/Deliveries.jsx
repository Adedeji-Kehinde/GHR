// DeliveryManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";
import DeliveryDetails from './DeliveryDetails'; // Modal component
import plusImage from '/images/plusImage.png';
import deleteImage from '/images/deleteImage.png'; // Bulk delete image

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

  // Multi-selection state for deletion (using “radio buttons” that we control manually)
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState([]);

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

  // Delivery states
  const [deliveries, setDeliveries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const availableCount = deliveries.filter(delivery => delivery.status === "To Collect").length;

  const filteredDeliveries = deliveries.filter((delivery) => {
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

  const sortedDeliveries = useMemo(() => {
    let sortable = [...filteredDeliveries];
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
  }, [filteredDeliveries, sortConfig]);

  const handleSort = (columnKey) => {
    let direction = "ascending";
    if (sortConfig.key === columnKey && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: columnKey, direction });
  };

  // When a row’s radio “button” is clicked, toggle its selection
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
    if (selectedDeliveryIds.length === sortedDeliveries.length) {
      // If already all selected, unselect all
      setSelectedDeliveryIds([]);
    } else {
      // Otherwise, select all
      setSelectedDeliveryIds(sortedDeliveries.map(delivery => delivery._id));
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

  const contentStyle = {
    marginTop: "70px",
    marginLeft: "80px",
    padding: "2rem",
  };

  if (loading) return <p>Loading deliveries...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!admin) return <p>Loading admin details...</p>;

  const adminNameDisplay = `${admin.name} ${admin.lastName}`;
  const profilePictureDisplay = admin.profileImageUrl;

  return (
    <>
      <AdminHeader title="Delivery Management" adminName={adminNameDisplay} profilePicture={profilePictureDisplay} />
      <AdminTabs />
      <div className="delivery-management" style={contentStyle}>
        {/* Summary Boxes */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
          <div onClick={() => setViewStatus("toCollect")} style={{ border: "1px solid #ccc", padding: "1rem", flex: 1, cursor: "pointer" }}>
            <h3>Parcels Available to Collect</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{availableCount}</p>
          </div>
          <div onClick={() => setViewStatus("collected")} style={{ border: "1px solid #ccc", padding: "1rem", flex: 1, cursor: "pointer", textAlign: "center" }}>
            <h3>Collected Parcels</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>View Collected</p>
          </div>
          <div onClick={() => navigate('/add-delivery')} style={{ border: "1px solid #ccc", padding: "1rem", flex: 1, cursor: "pointer", textAlign: "center" }}>
            <h3>Add New Parcel</h3>
            <img src={plusImage} alt="Add New Parcel" style={{ marginTop: "0.3rem", width: "50px", height: "50px" }} />
          </div>
        </div>

        {/* Main Search Input */}
        <input
          type="text"
          placeholder="Search deliveries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />
        
        {/* Bulk Delete Icon (for selected deliveries) */}
        {selectedDeliveryIds.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
            <img 
              src={deleteImage} 
              alt="Delete Selected" 
              onClick={handleBulkDelete}
              style={{ cursor: "pointer", width: "25px", height: "25px" }}
              title="Delete Selected Deliveries"
            />
          </div>
        )}

        {/* Deliveries Table */}
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th
                style={{ cursor: 'pointer' }}
                onClick={handleSelectAll}
                checked={sortedDeliveries.length > 0 && selectedDeliveryIds.length === sortedDeliveries.length}
                readOnly
                >
                  Select All
              </th>
              <th onClick={() => handleSort("parcelNumber")} style={{cursor: 'pointer'}}>Parcel Number</th>
              <th onClick={() => handleSort("sender")} style={{cursor: 'pointer'}}>Sender</th>
              <th onClick={() => handleSort("parcelType")} style={{cursor: 'pointer'}}>Parcel Type</th>
              <th onClick={() => handleSort("description")} style={{cursor: 'pointer'}}>Description</th>
              <th onClick={() => handleSort("status")} style={{cursor: 'pointer'}}>Status</th>
              <th onClick={() => handleSort("roomNumber")} style={{cursor: 'pointer'}}>Room Number</th>
              <th onClick={() => handleSort("recipientName")} style={{cursor: 'pointer'}}>Recipient Name</th>
              <th onClick={() => handleSort("arrivedAt")} style={{cursor: 'pointer'}}>Created At</th>
              <th onClick={() => handleSort("collectedAt")} style={{cursor: 'pointer'}}>Collected At</th>
            </tr>
          </thead>
          <tbody>
            {sortedDeliveries.map((delivery) => (
              <tr 
                key={delivery._id}
                onClick={() => { setViewDelivery(delivery); setShowDetailsModal(true); }}
                style={{ cursor: "pointer" }}
              >
                <td onClick={e => e.stopPropagation()}>
                  <input 
                    type="radio"
                    // Omit the common 'name' attribute so each acts independently
                    checked={selectedDeliveryIds.includes(delivery._id)}
                    onClick={(e) => handleRowSelect(e, delivery._id)}
                    readOnly
                  />
                </td>
                <td>{delivery.parcelNumber}</td>
                <td>{delivery.sender}</td>
                <td>{delivery.parcelType}</td>
                <td>{delivery.description}</td>
                <td>{delivery.status}</td>
                <td>{delivery.roomNumber}</td>
                <td>{delivery.recipientName}</td>
                <td>{new Date(delivery.arrivedAt).toLocaleString()}</td>
                <td>{delivery.collectedAt ? new Date(delivery.collectedAt).toLocaleString() : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
