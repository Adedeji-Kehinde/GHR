import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const MaintenanceManagement = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [users, setUsers] = useState([]); // all users for searching
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Toggle forms for adding and updating maintenance requests
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Add Maintenance form state (no image upload here)
  const [newMaintenance, setNewMaintenance] = useState({
    roomNumber: "",
    category: "Appliances", // default category
    description: "",
    roomAccess: "Yes" // default
  });

  // State for user search in Add Maintenance form
  const [userSearchQuery, setUserSearchQuery] = useState("");

  // Update Maintenance form state
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [updateMaintenance, setUpdateMaintenance] = useState({
    category: "",
    description: "",
    roomAccess: "",
    status: ""
  });
  // For update search
  const [updateSearchQuery, setUpdateSearchQuery] = useState("");

  const API_URL =  "http://localhost:8000";
  const token = localStorage.getItem("token");

  // Fetch maintenance requests and users, and join enquirer name
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch maintenance requests
      const maintenanceRes = await axios.get(`${API_URL}/api/maintenance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Fetch all users
      const usersRes = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const maintenanceData = maintenanceRes.data;
      const usersData = usersRes.data;
      setUsers(usersData);

      // Join each maintenance request with the enquirer's full name based on roomNumber
      const joinedData = maintenanceData.map((request) => {
        const matchingUser = usersData.find(user => user.roomNumber === request.roomNumber);
        return {
          ...request,
          enquirerName: matchingUser ? `${matchingUser.name} ${matchingUser.lastName}` : "Not Found"
        };
      });
      setMaintenanceRequests(joinedData);
      setError("");
    } catch (err) {
      console.error("Error fetching maintenance data:", err.response || err);
      setError(err.response?.data?.message || "Error fetching maintenance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_URL, token]);

  // Main search filter for the table (case-insensitive)
  const filteredMaintenance = maintenanceRequests.filter((request) => {
    const query = searchQuery.toLowerCase();
    return (
      request.requestId.toString().includes(query) ||
      (request.roomNumber && request.roomNumber.toLowerCase().includes(query)) ||
      (request.category && request.category.toLowerCase().includes(query)) ||
      (request.description && request.description.toLowerCase().includes(query)) ||
      (request.roomAccess && request.roomAccess.toLowerCase().includes(query)) ||
      (request.status && request.status.toLowerCase().includes(query)) ||
      (request.enquirerName && request.enquirerName.toLowerCase().includes(query))
    );
  });

  // Sorting logic for the table
  const sortedMaintenance = useMemo(() => {
    let sortable = [...filteredMaintenance];
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
  }, [filteredMaintenance, sortConfig]);

  const handleSort = (columnKey) => {
    let direction = "ascending";
    if (sortConfig.key === columnKey && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: columnKey, direction });
  };

  // --------------------
  // Add Maintenance Handlers
  // --------------------
  const handleNewMaintenanceChange = (e) => {
    setNewMaintenance({ ...newMaintenance, [e.target.name]: e.target.value });
  };

  // For user search in the Add form
  const handleUserSearchChange = (e) => {
    setUserSearchQuery(e.target.value);
    setNewMaintenance({ ...newMaintenance, roomNumber: "" });
  };

  // Filter users for Add form: only those with a valid roomNumber and matching name or room number
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
    setNewMaintenance({ ...newMaintenance, roomNumber: user.roomNumber });
    setUserSearchQuery(`${user.name} ${user.lastName} (${user.roomNumber})`);
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    try {
      // Use POST /api/maintenance/register (existing route) to create a maintenance request
      await axios.post(`${API_URL}/api/maintenance/register`, newMaintenance, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setNewMaintenance({ roomNumber: "", category: "Appliances", description: "", roomAccess: "Yes" });
      setUserSearchQuery("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding maintenance request:", err.response || err);
      setError(err.response?.data?.message || "Error adding maintenance request");
    }
  };

  // --------------------
  // Update Maintenance Handlers
  // --------------------
  const filteredForUpdate = maintenanceRequests.filter((request) => {
    const query = updateSearchQuery.toLowerCase();
    return (
      request.requestId.toString().includes(query) ||
      (request.roomNumber && request.roomNumber.toLowerCase().includes(query)) ||
      (request.category && request.category.toLowerCase().includes(query)) ||
      (request.description && request.description.toLowerCase().includes(query)) ||
      (request.status && request.status.toLowerCase().includes(query))
    );
  });

  const handleSelectMaintenance = (id) => {
    setSelectedRequestId(id);
    const requestToEdit = maintenanceRequests.find((r) => r._id === id);
    if (requestToEdit) {
      setUpdateMaintenance({
        category: requestToEdit.category,
        description: requestToEdit.description,
        roomAccess: requestToEdit.roomAccess,
        status: requestToEdit.status,
      });
    } else {
      setUpdateMaintenance({ category: "", description: "", roomAccess: "", status: "" });
    }
  };

  const handleUpdateMaintenanceChange = (e) => {
    setUpdateMaintenance({ ...updateMaintenance, [e.target.name]: e.target.value });
  };

  const handleUpdateMaintenance = async (e) => {
    e.preventDefault();
    if (!selectedRequestId) {
      setError("Please select a maintenance request to update.");
      return;
    }
    try {
      await axios.put(`${API_URL}/api/maintenance/${selectedRequestId}`, updateMaintenance, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setShowUpdateForm(false);
      setSelectedRequestId("");
    } catch (err) {
      console.error("Error updating maintenance request:", err.response || err);
      setError(err.response?.data?.message || "Error updating maintenance request");
    }
  };

  const handleDeleteMaintenance = async () => {
    if (!selectedRequestId) {
      setError("Please select a maintenance request to delete.");
      return;
    }
    try {
      await axios.delete(`${API_URL}/api/maintenance/${selectedRequestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
      setShowUpdateForm(false);
      setSelectedRequestId("");
    } catch (err) {
      console.error("Error deleting maintenance request:", err.response || err);
      setError(err.response?.data?.message || "Error deleting maintenance request");
    }
  };

  if (loading) return <p>Loading maintenance requests...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="maintenance-management" style={{ padding: "1rem" }}>
      <h1>Maintenance Management</h1>
      
      {/* Buttons to toggle Add/Update forms */}
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => { setShowAddForm(!showAddForm); setShowUpdateForm(false); }}>
          {showAddForm ? "Hide Add Maintenance" : "Add Maintenance Request"}
        </button>
        <button onClick={() => { setShowUpdateForm(!showUpdateForm); setShowAddForm(false); }}>
          {showUpdateForm ? "Hide Update Maintenance" : "Update/Delete Maintenance Request"}
        </button>
      </div>

      {/* Add Maintenance Form (above table) */}
      {showAddForm && (
        <form onSubmit={handleAddMaintenance} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
          <h2>Add Maintenance Request</h2>
          {/* Instead of entering roomNumber manually, search for a user */}
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
          {/* The roomNumber field will be auto-filled and is hidden */}
          {/* <input type="hidden" name="roomNumber" value={newMaintenance.roomNumber} /> */}
          <select
            name="category"
            value={newMaintenance.category}
            onChange={handleNewMaintenanceChange}
            required
          >
            <option value="Appliances">Appliances</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Plumbing & Leaking">Plumbing & Leaking</option>
            <option value="Heating">Heating</option>
            <option value="Lighting">Lighting</option>
            <option value="Windows & Doors">Windows & Doors</option>
            <option value="Furniture & Fitting">Furniture & Fitting</option>
            <option value="Flooring">Flooring</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newMaintenance.description}
            onChange={handleNewMaintenanceChange}
          />
          <select
            name="roomAccess"
            value={newMaintenance.roomAccess}
            onChange={handleNewMaintenanceChange}
            required
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Maintenance Request"}
          </button>
        </form>
      )}

      {/* Update Maintenance Form (above table) */}
      {showUpdateForm && (
        <div style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
          <h2>Update/Delete Maintenance Request</h2>
          <input
            type="text"
            placeholder="Search maintenance request..."
            value={updateSearchQuery}
            onChange={(e) => setUpdateSearchQuery(e.target.value)}
            style={{ marginBottom: "0.5rem", padding: "0.5rem", width: "100%" }}
          />
          <ul style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #ccc", padding: "0.5rem", listStyle: "none" }}>
            {maintenanceRequests.filter((maintenance) => {
              const query = updateSearchQuery.toLowerCase();
              return (
                maintenance.requestId.toString().includes(query) ||
                (maintenance.roomNumber && maintenance.roomNumber.toLowerCase().includes(query)) ||
                (maintenance.category && maintenance.category.toLowerCase().includes(query)) ||
                (maintenance.description && maintenance.description.toLowerCase().includes(query)) ||
                (maintenance.status && maintenance.status.toLowerCase().includes(query))
              );
            }).map((maintenance) => (
              <li
                key={maintenance._id}
                style={{ cursor: "pointer", padding: "0.25rem" }}
                onClick={() => handleSelectMaintenance(maintenance._id)}
              >
                {maintenance.requestId} - {maintenance.roomNumber} - {maintenance.status}
              </li>
            ))}
          </ul>
          {selectedRequestId && (
            <form onSubmit={handleUpdateMaintenance}>
              <select name="category" value={updateMaintenance.category} onChange={handleUpdateMaintenanceChange} required>
                <option value="Appliances">Appliances</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Plumbing & Leaking">Plumbing & Leaking</option>
                <option value="Heating">Heating</option>
                <option value="Lighting">Lighting</option>
                <option value="Windows & Doors">Windows & Doors</option>
                <option value="Furniture & Fitting">Furniture & Fitting</option>
                <option value="Flooring">Flooring</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={updateMaintenance.description}
                onChange={handleUpdateMaintenanceChange}
                required
              />
              <select name="roomAccess" value={updateMaintenance.roomAccess} onChange={handleUpdateMaintenanceChange} required>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <select name="status" value={updateMaintenance.status} onChange={handleUpdateMaintenanceChange} required>
                <option value="In Process">In Process</option>
                <option value="Completed">Completed</option>
              </select>
              <div style={{ marginTop: "1rem" }}>
                <button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Request"}
                </button>
                <button type="button" onClick={handleDeleteMaintenance} disabled={loading} style={{ marginLeft: "1rem" }}>
                  {loading ? "Deleting..." : "Delete Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Main Search Input for Table */}
      <input
        type="text"
        placeholder="Search maintenance requests..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      />

      {/* Maintenance Requests Table */}
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
            <th onClick={() => handleSort("category")} style={{cursor: 'pointer'}}>Category</th>
            <th onClick={() => handleSort("description")} style={{cursor: 'pointer'}}>Description</th>
            <th onClick={() => handleSort("roomAccess")} style={{cursor: 'pointer'}}>Room Access</th>
            <th onClick={() => handleSort("status")} style={{cursor: 'pointer'}}>Status</th>
            <th onClick={() => handleSort("enquirerName")} style={{cursor: 'pointer'}}>Enquirer Name</th>
            <th onClick={() => handleSort("createdAt")} style={{cursor: 'pointer'}}>Created At</th>
            <th onClick={() => handleSort("completedAt")} style={{cursor: 'pointer'}}>Completed At</th>
          </tr>
        </thead>
        <tbody>
          {sortedMaintenance.map((maintenance) => (
            <tr key={maintenance._id}>
              <td>{maintenance.requestId}</td>
              <td>{maintenance.roomNumber}</td>
              <td>{maintenance.category}</td>
              <td>{maintenance.description}</td>
              <td>{maintenance.roomAccess}</td>
              <td>{maintenance.status}</td>
              <td>{maintenance.enquirerName}</td>
              <td>{new Date(maintenance.createdAt).toLocaleString()}</td>
              <td>{maintenance.completedAt ? new Date(maintenance.completedAt).toLocaleString() : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceManagement;
