// AddDelivery.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "../components/AdminHeader";
import AdminTabs from "../components/AdminTabs";
import './delivery.css';

const AddDelivery = () => {
  const [admin, setAdmin] = useState(null);
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
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

  // Form state
  const [newDelivery, setNewDelivery] = useState({
    sender: "",
    parcelType: "Package",
    description: "",
    roomNumber: ""
  });
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch users for recipient selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err.response || err);
      }
    };
    fetchUsers();
  }, [API_URL, token]);

  const handleNewDeliveryChange = (e) => {
    setNewDelivery({ ...newDelivery, [e.target.name]: e.target.value });
  };

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
    setUserSearchQuery(`${user.name} ${user.lastName} | ${user.roomNumber}`);
  };

  const handleAddDelivery = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/deliveries`, newDelivery, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/deliveries");
    } catch (err) {
      console.error("Error adding delivery:", err.response || err);
      setError(err.response?.data?.message || "Error adding delivery");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return (
    <div className="add-delivery-content">
      <div className="add-delivery-section">
        <p>Loading admin details...</p>
      </div>
    </div>
  );

  return (
    <>
      <AdminHeader 
        title="Add New Parcel" 
        adminName={`${admin.name} ${admin.lastName}`} 
        profilePicture={admin.profileImageUrl} 
      />
      <AdminTabs />
      
      <div className="add-delivery-content">
        {error && (
          <div className="add-delivery-error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleAddDelivery}>
          {/* Search Section */}
          <div className="add-delivery-section">
            <div className="add-delivery-form-group">
              <label className="add-delivery-label">Search Recipient</label>
              {newDelivery.roomNumber && (
                <div className="add-delivery-selected-recipient">
                  <span>Selected: {userSearchQuery}</span>
                </div>
              )}
              <input
                type="text"
                placeholder="Search by name or room number..."
                value={userSearchQuery}
                onChange={handleUserSearchChange}
                className="add-delivery-input"
              />
              {userSearchQuery && !newDelivery.roomNumber && (
                <div className="add-delivery-search-results">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className="add-delivery-search-result-item"
                    >
                      {user.name} {user.lastName} | {user.roomNumber}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Details Section */}
          {newDelivery.roomNumber && (
            <div className="add-delivery-section">
              <div className="add-delivery-form-group">
                <label className="add-delivery-label">Sender</label>
                <input
                  type="text"
                  name="sender"
                  value={newDelivery.sender}
                  onChange={handleNewDeliveryChange}
                  required
                  placeholder="Enter sender's name..."
                  className="add-delivery-input"
                />
              </div>

              <div className="add-delivery-form-group">
                <label className="add-delivery-label">Parcel Type</label>
                <select
                  name="parcelType"
                  value={newDelivery.parcelType}
                  onChange={handleNewDeliveryChange}
                  className="add-delivery-select"
                >
                  <option value="Letter">Letter</option>
                  <option value="Package">Package</option>
                </select>
              </div>

              <div className="add-delivery-form-group">
                <label className="add-delivery-label">Description</label>
                <textarea
                  name="description"
                  value={newDelivery.description}
                  onChange={handleNewDeliveryChange}
                  required
                  placeholder="Enter parcel description..."
                  className="add-delivery-textarea"
                />
              </div>

              <div className="add-delivery-button-group">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="add-delivery-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="add-delivery-submit-btn"
                >
                  {loading ? "Adding..." : "Add Parcel"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default AddDelivery;
