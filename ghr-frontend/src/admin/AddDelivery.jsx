// AddDelivery.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminHeader from "./AdminHeader";
import AdminTabs from "./AdminTabs";

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
        console.log("Users fetched:", res.data);
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
    // Clear previously selected recipient when typing a new query.
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
    // Set the selected recipient and format as: Name LastName | RoomNumber.
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

  if (!admin) return <p>Loading admin details...</p>;

  const adminName = `${admin.name} ${admin.lastName}`;
  const profilePicture = admin.profileImageUrl;

  // Helper function to render each field row.
  // The "centered" flag (when true) applies a fixed width to the input so it is centered in the right column.
  const renderRow = (label, fieldName, value, isEditable, type = "text", options = null, readOnly = false, centered = false) => {
    const rightColStyle = centered
      ? { width: '70%', paddingRight: '1rem', display: 'flex', justifyContent: 'center' }
      : { width: '70%', paddingRight: '1rem' };

    const inputStyle = { 
      width: '100%', 
      padding: '0.75rem', 
      fontSize: "1.1rem", 
      borderRadius: "4px" 
    };

    if (centered) {
      // If centered, set a fixed width (e.g., 80%) for the input.
      inputStyle.width = '80%';
    }

    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{
          width: '30%',
          textAlign: 'right',
          paddingRight: '1.5rem',
          fontWeight: 'bold',
          padding: "0.75rem",
          backgroundColor: "#f2f2f2",
          borderRadius: "4px",
          fontSize: "1.1rem"
        }}>
          {label}:
        </div>
        <div style={rightColStyle}>
          {isEditable ? (
            type === "select" ? (
              <select 
                name={fieldName} 
                value={value} 
                onChange={handleNewDeliveryChange} 
                style={{ ...inputStyle }}
                required
              >
                {options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : type === "textarea" ? (
              <textarea 
                name={fieldName} 
                value={value} 
                onChange={handleNewDeliveryChange} 
                style={{ ...inputStyle, height: "100px" }}
                required
              />
            ) : (
              <input 
                type="text" 
                name={fieldName} 
                value={value} 
                onChange={handleNewDeliveryChange} 
                style={{ ...inputStyle }}
                required
              />
            )
          ) : (
            readOnly ? (
              <input 
                type="text" 
                value={value} 
                disabled 
                style={{ ...inputStyle, backgroundColor: "#e9ecef" }}
              />
            ) : (
              <span style={{ fontSize: "1.1rem" }}>{value}</span>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <AdminHeader title="Add New Parcel" adminName={adminName} profilePicture={profilePicture} />
      <AdminTabs />
      {/* Main container placed closer to the AdminTabs */}
      <div style={{ padding: "1rem 2rem", width: "100%" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}></h2>
        {error && <p style={{ color: "red", fontSize: "1.2rem" }}>{error}</p>}
        <form onSubmit={handleAddDelivery} style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Recipient Search Box */}
          <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", position: "relative" }}>
            {/* If a recipient is selected, display a big card on the left */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {newDelivery.roomNumber && (
                <div style={{
                  flex: "0 0 40%",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginRight: "1rem",
                  minHeight: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f8f9fa",
                  fontSize: "1.2rem",
                  fontWeight: "bold"
                }}>
                  <span>{userSearchQuery}</span>
                </div>
              )}
              <div style={{ flex: newDelivery.roomNumber ? "1" : "1 1 100%", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ fontWeight: "bold", fontSize: "1.2rem", marginRight: "1rem" }}>
                    Search Recipient:
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name or room number..."
                    value={userSearchQuery}
                    onChange={handleUserSearchChange}
                    required
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      fontSize: "1.2rem",
                      borderRadius: "8px",
                      border: "1px solid #ccc"
                    }}
                  />
                </div>
                {userSearchQuery && !newDelivery.roomNumber && (
                  <ul style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    maxHeight: "150px",
                    overflowY: "auto",
                    margin: 0,
                    padding: "0.75rem",
                    listStyle: "none",
                    zIndex: 10,
                    fontSize: "1.1rem"
                  }}>
                    {filteredUsers.map((user) => (
                      <li
                        key={user._id}
                        style={{ cursor: "pointer", padding: "0.5rem", borderBottom: "1px solid #eee" }}
                        onClick={() => handleSelectUser(user)}
                      >
                        {user.name} {user.lastName} | {user.roomNumber}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Other Fields Box */}
          {newDelivery.roomNumber && (
            <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "1.5rem" }}>
              {renderRow("Sender", "sender", newDelivery.sender, true, "text", null, false, true)}
              {renderRow("Parcel Type", "parcelType", newDelivery.parcelType, true, "select", ["Letter", "Package"], false, true)}
              {renderRow("Description", "description", newDelivery.description, true, "textarea", null, false, true)}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button type="submit" disabled={loading} style={{
                  padding: "1rem 2rem",
                  fontSize: "1.2rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none"
                }}>
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
