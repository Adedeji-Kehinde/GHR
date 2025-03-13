import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';
import { useNavigate } from 'react-router-dom';
import deleteImage from '/images/deleteImage.png';
import AvailabilityFolderView from './AvailabilityFolderView';

const BookingManagement = () => {
  // States for bookings view
  const [adminUser, setAdminUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Booked");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "ascending" });
  
  // State to control view mode: "bookings" or "availableRooms"
  const [viewMode, setViewMode] = useState("bookings");
  
  // States for available rooms view
  const [allAvailability, setAllAvailability] = useState({});
  const [availabilityTree, setAvailabilityTree] = useState({});

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch admin details
  useEffect(() => {
    const fetchAdminUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminUser(res.data);
      } catch (err) {
        console.error("Error fetching admin user:", err.response || err);
      }
    };
    fetchAdminUser();
  }, [API_URL, token]);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const bookingsRes = await axios.get(`${API_URL}/api/booking/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const processedBookings = bookingsRes.data.map((booking) => {
        const user = booking.userId;
        return {
          ...booking,
          userName: user ? `${user.name} ${user.lastName}` : "Not Found",
          userRoom: user ? user.roomNumber : "Not Found",
        };
      });
      setBookings(processedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error.response || error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [API_URL, token]);

  // Transform the flat availability data into a hierarchical tree structure.
  // New structure: block -> floor -> apartment -> roomType -> bedSpace -> [bed numbers]
  const transformAvailabilityData = (availabilityData) => {
    const treeData = {};
    Object.entries(availabilityData).forEach(([block, data]) => {
      if (!treeData[block]) treeData[block] = {};
      // Assume each room entry has: floor, apartmentNumber, roomType, bedSpace, and bedNumber.
      data.rooms.forEach((room) => {
        const { floor, apartmentNumber, roomType, bedSpace, bedNumber } = room;
        if (!treeData[block][floor]) treeData[block][floor] = {};
        if (!treeData[block][floor][apartmentNumber]) treeData[block][floor][apartmentNumber] = {};
        if (!treeData[block][floor][apartmentNumber][roomType])
          treeData[block][floor][apartmentNumber][roomType] = {};
        if (!treeData[block][floor][apartmentNumber][roomType][bedSpace])
          treeData[block][floor][apartmentNumber][roomType][bedSpace] = [];
        treeData[block][floor][apartmentNumber][roomType][bedSpace].push(bedNumber);
      });
    });
    return treeData;
  };

  // Fetch availability data and transform it for the folder view.
  const fetchAvailability = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/booking/rooms-available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const availData = res.data.availability;
      setAllAvailability(availData);

      // Transform the data into the nested tree structure.
      const treeData = transformAvailabilityData(availData);
      setAvailabilityTree(treeData);
    } catch (error) {
      console.error("Error fetching room availability:", error.response || error);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [API_URL, token]);

  // Compute overall availability (sum over all blocks)
  const overallAvailability = useMemo(() => {
    let totalRooms = 0, totalBeds = 0;
    Object.values(allAvailability).forEach(block => {
      totalRooms += block.availableRooms;
      totalBeds += block.availableBedSpaces;
    });
    return { totalRooms, totalBeds };
  }, [allAvailability]);

  // Filtering and sorting for bookings table
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (booking.status !== filterStatus) return false;
      const query = searchQuery.toLowerCase();
      return (
        booking.userName.toLowerCase().includes(query) ||
        booking.userRoom.toLowerCase().includes(query) ||
        booking.buildingBlock.toLowerCase().includes(query) ||
        booking.floor.toString().includes(query) ||
        booking.apartmentNumber.toString().includes(query) ||
        booking.bedSpace.toLowerCase().includes(query) ||
        (booking.bedNumber ? booking.bedNumber.toString().includes(query) : false) ||
        booking.roomType.toLowerCase().includes(query) ||
        booking.status.toLowerCase().includes(query)
      );
    });
  }, [bookings, filterStatus, searchQuery]);

  const sortedBookings = useMemo(() => {
    let sortable = [...filteredBookings];
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
  }, [filteredBookings, sortConfig]);

  const handleSort = (columnKey) => {
    let direction = "ascending";
    if (sortConfig.key === columnKey && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key: columnKey, direction });
  };

  // Navigate to booking details on row click.
  const handleRowClick = (booking) => {
    navigate("/booking-details", { state: { booking } });
  };

  // Toggle selection for a booking row.
  const toggleSelectRow = (id) => {
    setSelectedBookings((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  // Toggle select all rows.
  const toggleSelectAll = () => {
    const visibleIds = sortedBookings.map((b) => b._id);
    const allSelected = visibleIds.every((id) => selectedBookings.includes(id));
    if (allSelected) {
      setSelectedBookings((prevSelected) =>
        prevSelected.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedBookings((prevSelected) =>
        Array.from(new Set([...prevSelected, ...visibleIds]))
      );
    }
  };

  // Delete selected bookings.
  const handleDeleteSelected = async () => {
    if (selectedBookings.length === 0) {
      alert("No bookings selected.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete all selected bookings?")) {
      return;
    }
    try {
      await Promise.all(
        selectedBookings.map((id) =>
          axios.delete(`${API_URL}/api/booking/bookings/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      alert("Selected bookings deleted successfully!");
      setSelectedBookings([]);
      fetchBookings();
    } catch (error) {
      console.error("Error deleting selected bookings:", error.response || error);
      alert("Error deleting selected bookings");
    }
  };

  if (!adminUser) return <p>Loading...</p>;

  const adminName = `${adminUser.name} ${adminUser.lastName}`;
  const profilePicture = adminUser.profileImageUrl;
  const pageTitle = "Booking Management";

  const countBooked = bookings.filter(b => b.status === "Booked").length;
  const countCancelled = bookings.filter(b => b.status === "Cancelled").length;

  const contentStyle = {
    marginTop: "70px",
    marginLeft: "80px",
    padding: "2rem",
  };

  return (
    <>
      <AdminHeader title={pageTitle} adminName={adminName} profilePicture={profilePicture} />
      <AdminTabs />
      <div className="booking-management-container" style={contentStyle}>
        {/* Top row with three clickable boxes */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <div
            onClick={() => { setViewMode("bookings"); setFilterStatus("Booked"); }}
            style={{
              flex: 1,
              padding: "1rem",
              border: viewMode === "bookings" && filterStatus === "Booked" ? "2px solid blue" : "1px solid #ccc",
              borderRadius: "5px",
              textAlign: "center",
              cursor: "pointer"
            }}
          >
            <h3>Booked Rooms</h3>
            <p>{countBooked}</p>
          </div>
          <div
            onClick={() => { setViewMode("bookings"); setFilterStatus("Cancelled"); }}
            style={{
              flex: 1,
              padding: "1rem",
              border: viewMode === "bookings" && filterStatus === "Cancelled" ? "2px solid blue" : "1px solid #ccc",
              borderRadius: "5px",
              textAlign: "center",
              cursor: "pointer"
            }}
          >
            <h3>Expired/Cancelled Bookings</h3>
            <p>{countCancelled}</p>
          </div>
          <div
            onClick={() => { 
              setViewMode("availableRooms"); 
              // When clicking Availability, fetch and transform the data.
              fetchAvailability();
            }}
            style={{
              flex: 1,
              padding: "1rem",
              border: viewMode === "availableRooms" ? "2px solid blue" : "1px solid #ccc",
              borderRadius: "5px",
              textAlign: "center",
              cursor: "pointer"
            }}
          >
            <h3>Availability</h3>
            <p style={{ fontSize: "0.9rem", marginTop: "0.3rem" }}>
              Rooms: {overallAvailability.totalRooms || 0} &nbsp;&nbsp; Beds: {overallAvailability.totalBeds || 0}
            </p>
          </div>
        </div>

        {viewMode === "availableRooms" ? (
          // Render the folder (tree) view for availability.
          <AvailabilityFolderView treeData={availabilityTree} />
        ) : (
          <>
            {/* Bookings View */}
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
            />
            {selectedBookings.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
                <img
                  src={deleteImage}
                  alt="Delete Selected"
                  style={{ cursor: "pointer", width: "25px", height: "25px" }}
                  onClick={handleDeleteSelected}
                />
              </div>
            )}
            <table
              border="1"
              cellPadding="10"
              cellSpacing="0"
              style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={toggleSelectAll}
                    checked={
                      sortedBookings.length > 0 &&
                      sortedBookings.every((b) => selectedBookings.includes(b._id))
                    }
                    readOnly
                  >
                    Select All
                  </th>
                  <th onClick={() => handleSort("userName")} style={{ cursor: "pointer" }}>Occupant Name</th>
                  <th onClick={() => handleSort("userRoom")} style={{ cursor: "pointer" }}>Room Number</th>
                  <th onClick={() => handleSort("buildingBlock")} style={{ cursor: "pointer" }}>Building Block</th>
                  <th onClick={() => handleSort("floor")} style={{ cursor: "pointer" }}>Floor</th>
                  <th onClick={() => handleSort("apartmentNumber")} style={{ cursor: "pointer" }}>Apartment Number</th>
                  <th onClick={() => handleSort("bedSpace")} style={{ cursor: "pointer" }}>Bed Space</th>
                  <th onClick={() => handleSort("bedNumber")} style={{ cursor: "pointer" }}>Bed Number</th>
                  <th onClick={() => handleSort("roomType")} style={{ cursor: "pointer" }}>Room Type</th>
                  <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    onClick={() => handleRowClick(booking)}
                    style={{ cursor: "pointer" }}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="radio"
                        checked={selectedBookings.includes(booking._id)}
                        onClick={() => toggleSelectRow(booking._id)}
                        readOnly
                      />
                    </td>
                    <td>{booking.userName}</td>
                    <td>{booking.userRoom}</td>
                    <td>{booking.buildingBlock}</td>
                    <td>{booking.floor}</td>
                    <td>{booking.apartmentNumber}</td>
                    <td>{booking.bedSpace}</td>
                    <td>{booking.bedNumber || "-"}</td>
                    <td>{booking.roomType}</td>
                    <td>{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
};

export default BookingManagement;
