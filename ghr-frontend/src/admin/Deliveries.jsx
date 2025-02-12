import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";

const DeliveryManagement = () => {
  // Admin details state
  const [admin, setAdmin] = useState(null);
  const API_URL =  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

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

  // Delivery states and toggles
  const [deliveries, setDeliveries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Toggle forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Add Delivery form state
  const [newDelivery, setNewDelivery] = useState({
    sender: "",
    parcelType: "Package",
    description: "",
    roomNumber: ""
  });

  // Update Delivery form state
  const [selectedDeliveryId, setSelectedDeliveryId] = useState("");
  const [updateDelivery, setUpdateDelivery] = useState({
    sender: "",
    parcelType: "",
    description: "",
    roomNumber: "",
    status: ""
  });

  // For searching users when adding a delivery
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [users, setUsers] = useState([]);

  // For update form search
  const [updateSearchQuery, setUpdateSearchQuery] = useState("");

  // For selected delivery object
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch deliveries
      const deliveryRes = await axios.get(`${API_URL}/api/auth/deliveries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Fetch users (to join recipient name)
      const usersRes = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const deliveriesData = deliveryRes.data;
      const usersData = usersRes.data;
      setUsers(usersData);

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

  // Filter for main table search (case-insensitive)
  const filteredDeliveries = deliveries.filter((delivery) => {
    const query = searchQuery.toLowerCase();
    return (
      delivery.parcelNumber.toLowerCase().includes(query) ||
      (delivery.sender && delivery.sender.toLowerCase().includes(query)) ||
      (delivery.parcelType && delivery.parcelType.toLowerCase().includes(query)) ||
      (delivery.description && delivery.description.toLowerCase().includes(query)) ||
      (delivery.status && delivery.status.toLowerCase().includes(query)) ||
      (delivery.roomNumber && delivery.roomNumber.toLowerCase().includes(query)) ||
      (delivery.recipientName && delivery.recipientName.toLowerCase().includes(query))
    );
  });

  // Sorting logic for the table
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

  // --------------------
  // Add Delivery Handlers
  // --------------------
  const handleNewDeliveryChange = (e) => {
    setNewDelivery({ ...newDelivery, [e.target.name]: e.target.value });
  };

  // User search for add delivery
  const handleUserSearchChange = (e) => {
    setUserSearchQuery(e.target.value);
    setNewDelivery({ ...newDelivery, roomNumber: "" });
  };

  const filteredUsers = useMemo(() => {
    const query = userSearchQuery.toLowerCase();
    return users.filter((user) =>
      user.roomNumber &&
      ((user.name && user.name.toLowerCase().includes(query)) ||
       (user.lastName && user.lastName.toLowerCase().includes(query)) ||
       (user.roomNumber && user.roomNumber.toLowerCase().includes(query)))
    );
  }, [users, userSearchQuery]);

  const handleSelectUser = (user) => {
    setNewDelivery({ ...newDelivery, roomNumber: user.roomNumber });
    setUserSearchQuery(`${user.name} ${user.lastName} (${user.roomNumber})`);
  };

  const handleAddDelivery = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/auth/deliveries`, newDelivery, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setNewDelivery({ sender: "", parcelType: "Package", description: "", roomNumber: "" });
      setUserSearchQuery("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding delivery:", err.response || err);
      setError(err.response?.data?.message || "Error adding delivery");
    }
  };

  // --------------------
  // Update Delivery Handlers
  // --------------------
  const handleSelectDeliveryById = (id) => {
    setSelectedDeliveryId(id);
    const deliveryToEdit = deliveries.find((d) => d._id === id);
    setSelectedDelivery(deliveryToEdit);
    if (deliveryToEdit) {
      setUpdateDelivery({
        sender: deliveryToEdit.sender,
        parcelType: deliveryToEdit.parcelType,
        description: deliveryToEdit.description,
        roomNumber: deliveryToEdit.roomNumber,
        status: deliveryToEdit.status,
      });
    } else {
      setUpdateDelivery({
        sender: "",
        parcelType: "",
        description: "",
        roomNumber: "",
        status: ""
      });
    }
  };

  const handleUpdateDeliveryChange = (e) => {
    setUpdateDelivery({ ...updateDelivery, [e.target.name]: e.target.value });
  };

  const handleUpdateDelivery = async (e) => {
    e.preventDefault();
    if (!selectedDeliveryId) {
      setError("Please select a delivery to update.");
      return;
    }
    try {
      await axios.put(`${API_URL}/api/auth/deliveries/${selectedDeliveryId}`, updateDelivery, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setShowUpdateForm(false);
      setSelectedDeliveryId("");
      setSelectedDelivery(null);
    } catch (err) {
      console.error("Error updating delivery:", err.response || err);
      setError(err.response?.data?.message || "Error updating delivery");
    }
  };

  const handleDeleteDelivery = async () => {
    if (!selectedDeliveryId) {
      setError("Please select a delivery to delete.");
      return;
    }
    try {
      await axios.delete(`${API_URL}/api/auth/deliveries/${selectedDeliveryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setShowUpdateForm(false);
      setSelectedDeliveryId("");
      setSelectedDelivery(null);
    } catch (err) {
      console.error("Error deleting delivery:", err.response || err);
      setError(err.response?.data?.message || "Error deleting delivery");
    }
  };

  // Content style to offset fixed header and sidebar
  const contentStyle = {
    marginTop: "70px", // header height
    marginLeft: "80px", // sidebar width
    padding: "2rem"
  };

  if (loading) return <p>Loading deliveries...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!admin) return <p>Loading admin details...</p>;

  const adminName = `${admin.name} ${admin.lastName}`;
  const profilePicture = admin.profileImageUrl;

  return (
    <>
      <AdminHeader title="Delivery Management" adminName={adminName} profilePicture={profilePicture} />
      <AdminTabs />
      <div className="delivery-management" style={contentStyle}>
        {/* Add and Update buttons above table */}
        <div style={{ marginBottom: "1rem" }}>
          <button onClick={() => { setShowAddForm(!showAddForm); setShowUpdateForm(false); }}>
            {showAddForm ? "Hide Add Delivery" : "Add New Delivery"}
          </button>
          <button onClick={() => { setShowUpdateForm(!showUpdateForm); setShowAddForm(false); }}>
            {showUpdateForm ? "Hide Update Delivery" : "Update/Delete Delivery"}
          </button>
        </div>

        {/* Add Delivery Form */}
        {showAddForm && (
          <form onSubmit={handleAddDelivery} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
            <h2>Add New Delivery</h2>
            <input
              type="text"
              name="sender"
              placeholder="Sender"
              value={newDelivery.sender}
              onChange={handleNewDeliveryChange}
              required
            />
            <select
              name="parcelType"
              value={newDelivery.parcelType}
              onChange={handleNewDeliveryChange}
              required
            >
              <option value="Letter">Letter</option>
              <option value="Package">Package</option>
            </select>
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={newDelivery.description}
              onChange={handleNewDeliveryChange}
              required
            />
            <input
              type="text"
              placeholder="Search user by name or room number..."
              value={userSearchQuery}
              onChange={handleUserSearchChange}
              required
            />
            {userSearchQuery && (
              <ul style={{ border: "1px solid #ccc", maxHeight: "100px", overflowY: "auto", margin: "0.5rem 0", padding: "0.5rem", listStyle: "none" }}>
                {filteredUsers.map((user) => (
                  <li
                    key={user._id}
                    style={{ cursor: "pointer", padding: "0.25rem" }}
                    onClick={() => handleSelectUser(user)}
                  >
                    {user.name} {user.lastName} ({user.roomNumber})
                  </li>
                ))}
              </ul>
            )}
            <button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Delivery"}
            </button>
          </form>
        )}

        {/* Update Delivery Form */}
        {showUpdateForm && (
          <div style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
            <h2>Update/Delete Delivery</h2>
            <input
              type="text"
              placeholder="Search delivery..."
              value={updateSearchQuery}
              onChange={(e) => setUpdateSearchQuery(e.target.value)}
              style={{ marginBottom: "0.5rem", padding: "0.5rem", width: "100%" }}
            />
            <ul style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #ccc", padding: "0.5rem", listStyle: "none" }}>
              {deliveries.filter((delivery) => {
                const query = updateSearchQuery.toLowerCase();
                return (
                  delivery.parcelNumber.toLowerCase().includes(query) ||
                  (delivery.sender && delivery.sender.toLowerCase().includes(query)) ||
                  (delivery.parcelType && delivery.parcelType.toLowerCase().includes(query)) ||
                  (delivery.description && delivery.description.toLowerCase().includes(query)) ||
                  (delivery.status && delivery.status.toLowerCase().includes(query)) ||
                  (delivery.roomNumber && delivery.roomNumber.toLowerCase().includes(query)) ||
                  (delivery.recipientName && delivery.recipientName.toLowerCase().includes(query))
                );
              }).map((delivery) => (
                <li
                  key={delivery._id}
                  style={{ cursor: "pointer", padding: "0.25rem" }}
                  onClick={() => handleSelectDeliveryById(delivery._id)}
                >
                  {delivery.parcelNumber} - {delivery.sender} - {delivery.roomNumber}
                </li>
              ))}
            </ul>
            {selectedDeliveryId && (
              <form onSubmit={handleUpdateDelivery}>
                <input
                  type="text"
                  name="sender"
                  placeholder="Sender"
                  value={updateDelivery.sender}
                  onChange={handleUpdateDeliveryChange}
                  required
                />
                <select
                  name="parcelType"
                  value={updateDelivery.parcelType}
                  onChange={handleUpdateDeliveryChange}
                  required
                >
                  <option value="Letter">Letter</option>
                  <option value="Package">Package</option>
                </select>
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={updateDelivery.description}
                  onChange={handleUpdateDeliveryChange}
                  required
                />
                <input
                  type="text"
                  name="roomNumber"
                  placeholder="Room Number"
                  value={updateDelivery.roomNumber}
                  onChange={handleUpdateDeliveryChange}
                  required
                />
                <select
                  name="status"
                  value={updateDelivery.status}
                  onChange={handleUpdateDeliveryChange}
                  required
                >
                  <option value="To Collect">To Collect</option>
                  <option value="Collected">Collected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <div style={{ marginTop: "1rem" }}>
                  <button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Delivery"}
                  </button>
                  <button type="button" onClick={handleDeleteDelivery} disabled={loading} style={{ marginLeft: "1rem" }}>
                    {loading ? "Deleting..." : "Delete Delivery"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Main Search Input for Table */}
        <input
          type="text"
          placeholder="Search deliveries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />

        {/* Deliveries Table */}
        <table 
          border="1" 
          cellPadding="10" 
          cellSpacing="0" 
          style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}
        >
          <thead>
            <tr>
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
              <tr key={delivery._id}>
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
      </div>
    </>
  );
};

export default DeliveryManagement;
