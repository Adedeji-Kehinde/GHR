import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

// Helper Functions
function calcRoomCapacity(room) {
  let total = 0;
  if (!room?.bedSpaces) return total;
  for (const key of ["A", "B", "C"]) {
    const space = room.bedSpaces[key];
    if (!space) continue;
    if (space.roomType === "Ensuite") total += 1;
    else if (space.roomType === "Twin Shared") total += 2;
  }
  return total;
}

function hasFreeBedOfType(room, type) {
  if (!room?.bedSpaces) return false;
  for (const key of ["A", "B", "C"]) {
    const space = room.bedSpaces[key];
    if (!space) continue;
    if (space.roomType !== type) continue;
    if (type === "Ensuite" && !space.bed1) return true;
    if (type === "Twin Shared" && (!space.bed1 || !space.bed2)) return true;
  }
  return false;
}

function getBedDisplayDetails(roomType) {
  if (roomType === "Ensuite") {
    return { bedSize: "Small Double", roomSize: "16m²" };
  } else if (roomType === "Twin Shared") {
    return { bedSize: "Single", roomSize: "14m²" };
  }
  return { bedSize: "", roomSize: "" };
}

const SelectBed = () => {
  const navigate = useNavigate();
  const API_URL =import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  // ---------------------
  // USER AUTHENTICATION
  // ---------------------
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [navigate, token, API_URL]);

  // ---------------------
  // FETCHED BOOKING DETAILS
  // ---------------------
  const buildingBlock = localStorage.getItem("buildingBlock");
  const floor = localStorage.getItem("floor");
  const flatmates = localStorage.getItem("flatmates");
  const roomType = localStorage.getItem("roomType");
  const lengthOfStay = localStorage.getItem("lengthOfStay");
  const checkInDate = localStorage.getItem("checkInDateTime");
  const checkOutDate = localStorage.getItem("checkOutDateTime");
  
  // ---------------------
  // ROOMS & SELECTION STATE
  // ---------------------
  const [roomsData, setRoomsData] = useState([]);
  const [selectedApartmentNumber, setSelectedApartmentNumber] = useState("");
  const [selectedBedSpace, setSelectedBedSpace] = useState("");
  const [selectedBedNumber, setSelectedBedNumber] = useState("");
  const [bookingData, setBookingData] = useState(null);
  // ---------------------
  // OCCUPANT BOOKINGS
  // ---------------------
  const [allBookings, setAllBookings] = useState([]);

  // Load all room data from localStorage
  useEffect(() => {
    const allRoomsStr = localStorage.getItem("allRooms");
    if (!allRoomsStr) return;
    try {
      const parsedRooms = JSON.parse(allRoomsStr);
      setRoomsData(parsedRooms);
    } catch (err) {
      console.error("Error parsing allRooms from localStorage:", err);
    }
  }, []);

  // Fetch all bookings (populated with occupant data)
  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/api/booking/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllBookings(res.data);
      } catch (error) {
        console.error("Error fetching all bookings:", error);
      }
    };
    fetchBookings();
  }, [API_URL, token]);

  // ---------------------
  // FILTER APARTMENTS
  // ---------------------
  const filteredApartments = roomsData
    .filter((room) => room.buildingBlock === buildingBlock)
    .filter((room) => room.floor === Number(floor))
    .filter((room) => {
      if (!flatmates) return true;
      return calcRoomCapacity(room) === Number(flatmates);
    })
    .filter((room) => {
      if (!roomType) return true;
      return hasFreeBedOfType(room, roomType);
    })
    .sort((a, b) => a.apartmentNumber - b.apartmentNumber);

  // ---------------------
  // CLICK HANDLERS
  // ---------------------
  const isBedAvailable = (buildingBlock, floor, apartmentNumber, bedSpaceKey, bedNum) => {
    const room = roomsData.find(
      (r) =>
        r.buildingBlock === buildingBlock &&
        r.floor === floor &&
        r.apartmentNumber === apartmentNumber
    );
    if (!room) return false;
    const bedSpaceData = room.bedSpaces[bedSpaceKey];
    if (!bedSpaceData || bedSpaceData.roomType !== roomType) return false;
    if (bedSpaceData.roomType === "Ensuite") {
      if (bedSpaceData.bed1) return false;
    }
    if (bedSpaceData.roomType === "Twin Shared") {
      if (bedNum === "1" && bedSpaceData.bed1) return false;
      if (bedNum === "2" && bedSpaceData.bed2) return false;
    }
    const occupantBooking = allBookings.find((b) => {
      return (
        b.buildingBlock === buildingBlock &&
        b.floor === floor &&
        b.apartmentNumber === apartmentNumber &&
        b.bedSpace === bedSpaceKey &&
        b.bedNumber === bedNum &&
        b.status === "Booked"
      );
    });
    return !occupantBooking;
  };

  const getBedOccupantInfo = (buildingBlock, floor, apartmentNumber, bedSpaceKey, bedNum) => {
    const occupantBooking = allBookings.find((b) => {
      return (
        b.buildingBlock === buildingBlock &&
        b.floor === floor &&
        b.apartmentNumber === apartmentNumber &&
        b.bedSpace === bedSpaceKey &&
        b.bedNumber === bedNum &&
        b.status === "Booked"
      );
    });
    if (!occupantBooking) return null;
    return occupantBooking.userId;
  };

  const handleBedSelection = (apartmentNumber, bedSpaceKey, bedNum, disabled) => {
    if (disabled) return;
    setSelectedApartmentNumber(apartmentNumber.toString());
    setSelectedBedSpace(bedSpaceKey);
    setSelectedBedNumber(bedNum);
  };

  // Finalize booking with the selected bed.
  const handleBooking = async () => {
    if (!selectedApartmentNumber || !selectedBedSpace || !selectedBedNumber) {
      alert("Please select an apartment and bed.");
      return;
    }
    const data = {
      buildingBlock,
      floor: Number(floor),
      apartmentNumber: Number(selectedApartmentNumber),
      bedSpace: selectedBedSpace,
      bedNumber: selectedBedNumber,
      roomType,
      lengthOfStay,
    };
    if (lengthOfStay === "Flexible") {
      data.checkInDate = checkInDate;
      data.checkOutDate = checkOutDate;
    }
    localStorage.setItem("pendingBooking", JSON.stringify(data));
    openPaymentPopup(300);
  };

  const openPaymentPopup = (amount) => {
    // Open the popup pointing to the payment sub‑app URL
    const popup = window.open(
      `${API_URL}/payment?amount=${amount}`, // pass the amount as query param
      'Payment',
      'width=500,height=500'
    );
    window.addEventListener('message', async (event) => {
      const { payment } = event.data;
      if (payment === "success") {
        if (window.bookingInProgress) return;
        window.bookingInProgress = true;
      
        try {
          const bookingData = JSON.parse(localStorage.getItem("pendingBooking"));
          const res = await axios.post(`${API_URL}/api/booking/bookings`, bookingData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      
          alert("Booking complete!");
          navigate("/home");
        } catch (error) {
          console.error("Booking error:", error);
          alert("Booking failed.");
        } finally {
          window.bookingInProgress = false;
        }
      }else if (payment === "failure") {
        alert("Payment failed. Please try again.");
      }
    });
  };
  
  const isCardSelected = (apartmentNumber, bedSpaceKey, bedNum) =>
    selectedApartmentNumber === apartmentNumber.toString() &&
    selectedBedSpace === bedSpaceKey &&
    selectedBedNumber === bedNum;

  if (loadingUser) return <p>Loading...</p>;

  // ---------------------
  // STYLES
  // ---------------------
  const dataCardStyle = {
    border: "1px solid #ccc",
    padding: "1rem",
    borderRadius: "8px",
    background: "#fff",
    flex: "1 1 160px",
    minWidth: "140px",
  };

  const bedGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "1rem",
    marginBottom: "1rem",
  };

  const bedCardStyle = (disabled, selected) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: selected ? "2px solid #007bff" : "1px solid #ccc",
    padding: "1rem",
    borderRadius: "8px",
    background: disabled ? "#f5f5f5" : "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
    height: "240px",
  });

  const apartmentHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    margin: "1.5rem 0 0.25rem",
  };

  return (
    <>
      <UserHeader user={user}hideBookRoom={true} />
      <h2>Select Bed</h2>
      {/* Display selection summary */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
        <div style={dataCardStyle}><strong>Block:</strong> {buildingBlock}</div>
        <div style={dataCardStyle}><strong>Floor:</strong> {floor}</div>
        <div style={dataCardStyle}><strong>Flatmates:</strong> {flatmates}</div>
        <div style={dataCardStyle}><strong>Room Type:</strong> {roomType}</div>
        <div style={dataCardStyle}><strong>Length of Stay:</strong> {lengthOfStay}</div>
      </div>
      {filteredApartments.length === 0 ? (
        <p>No available apartments found for your criteria.</p>
      ) : (
        filteredApartments.map((apt) => {
          const aptNum = apt.apartmentNumber;
          const bedSpaces = apt.bedSpaces || {};
          const bedItems = [];
          for (const key of ["A", "B", "C"]) {
            const spaceData = bedSpaces[key];
            if (!spaceData) continue;
            if (spaceData.roomType !== roomType) continue;
            if (spaceData.roomType === "Ensuite") {
              const occupant = getBedOccupantInfo(apt.buildingBlock, apt.floor, aptNum, key, "1");
              const disabled = occupant ? true : !isBedAvailable(apt.buildingBlock, apt.floor, aptNum, key, "1");
              bedItems.push({ bedSpace: key, bedNumber: "1", disabled, occupant });
            } else if (spaceData.roomType === "Twin Shared") {
              const occupant1 = getBedOccupantInfo(apt.buildingBlock, apt.floor, aptNum, key, "1");
              const disabled1 = occupant1 ? true : !isBedAvailable(apt.buildingBlock, apt.floor, aptNum, key, "1");
              bedItems.push({ bedSpace: key, bedNumber: "1", disabled: disabled1, occupant: occupant1 });
              const occupant2 = getBedOccupantInfo(apt.buildingBlock, apt.floor, aptNum, key, "2");
              const disabled2 = occupant2 ? true : !isBedAvailable(apt.buildingBlock, apt.floor, aptNum, key, "2");
              bedItems.push({ bedSpace: key, bedNumber: "2", disabled: disabled2, occupant: occupant2 });
            }
          }
          if (bedItems.length === 0) return null;
          return (
            <div key={aptNum}>
              <div style={apartmentHeaderStyle}>
                <img src="/images/apartment.png" alt="Apartment icon" style={{ width: "24px", height: "24px" }} />
                <h3 style={{ margin: 0 }}>Apartment {aptNum}</h3>
              </div>
              <p style={{ color: "#777", margin: "0 0 0.5rem" }}>
                Co-ed | Smoking not allowed | Pets not allowed
              </p>
              <div style={bedGridStyle}>
                {bedItems.map(({ bedSpace, bedNumber, disabled, occupant }) => {
                  const selected = isCardSelected(aptNum, bedSpace, bedNumber);
                  const { bedSize, roomSize } = getBedDisplayDetails(bedSpaces[bedSpace].roomType);
                  return (
                    <div
                      key={`${aptNum}-${bedSpace}-${bedNumber}`}
                      style={bedCardStyle(disabled, selected)}
                      onClick={() => handleBedSelection(aptNum, bedSpace, bedNumber, disabled)}
                    >
                      <img src="/images/bed.png" alt="Bed icon" style={{ width: "30px", height: "30px", marginBottom: "0.5rem" }} />
                      <strong>
                        Bed {bedSpace}{bedNumber}
                      </strong>
                      <p style={{ margin: "0.25rem 0 0" }}>Bed size: {bedSize}</p>
                      <p style={{ margin: 0 }}>Room size: {roomSize}</p>
                      {occupant && (
                        <p style={{ margin: "0.5rem 0 0", color: "#555" }}>
                          Occupant: {occupant.name} {occupant.gender ? `(${occupant.gender})` : ""}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
      <button
        onClick={handleBooking}
        disabled={!selectedApartmentNumber || !selectedBedSpace || !selectedBedNumber}
        style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", marginTop: "1rem", marginBottom: "2rem" }}
      >
        Proceed to Payment Plan
      </button>
      <Footer />
    </>
  );
};

export default SelectBed;
