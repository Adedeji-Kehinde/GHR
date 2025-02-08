import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SelectBed = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL|| "http://localhost:8000";

  // Retrieve from localStorage
  const token = localStorage.getItem("token");
  const buildingBlock = localStorage.getItem("buildingBlock");
  const floor = localStorage.getItem("floor");
  const apartmentNumber = localStorage.getItem("apartmentNumber");
  const flatmates = localStorage.getItem("flatmates");
  const roomType = localStorage.getItem("roomType");
  const lengthOfStay = localStorage.getItem("lengthOfStay");

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBedSpace, setSelectedBedSpace] = useState("");
  const [selectedBedNumber, setSelectedBedNumber] = useState("");

  useEffect(() => {
    // Option A: we already have "allRooms" stored from Booking.jsx
    const allRoomsStr = localStorage.getItem("allRooms");
    if (!allRoomsStr) return;

    try {
      const allRooms = JSON.parse(allRoomsStr);
      // Find the single room doc
      const match = allRooms.find(
        (r) =>
          r.buildingBlock === buildingBlock &&
          r.floor === Number(floor) &&
          r.apartmentNumber === Number(apartmentNumber)
      );
      if (match) {
        setSelectedRoom(match);
      }
    } catch (err) {
      console.error("Error parsing allRooms from localStorage:", err);
    }

    // Option B: (If you want) re-fetch from server with token:
    // fetchRoomDetails();
  }, [buildingBlock, floor, apartmentNumber]);

  // Helper: Check if a bedSpace is available according to bed1/bed2
  // ignoring the 'occupied' field for partial occupancy
  const isBedSpaceAvailable = (bedSpaceData) => {
    if (!bedSpaceData) return false;
    // Must match the user's chosen roomType
    if (bedSpaceData.roomType !== roomType) return false;

    // If "Ensuite", it effectively has only bed1. If bed1 is false => it's free
    if (bedSpaceData.roomType === "Ensuite") {
      return !bedSpaceData.bed1; // false => free
    }

    // If "Twin Shared", we have two potential beds
    // If either bed is false => that sub-room is still partially open
    if (bedSpaceData.roomType === "Twin Shared") {
      const bed1Free = !bedSpaceData.bed1;
      const bed2Free = !bedSpaceData.bed2;
      return bed1Free || bed2Free;
    }

    return false;
  };

  const handleBooking = async () => {
    if (!selectedBedSpace || !selectedBedNumber) {
      alert("Please select a bed space and bed number.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/booking/bookings`,
        {
          buildingBlock,
          floor: Number(floor),
          apartmentNumber: Number(apartmentNumber),
          bedSpace: selectedBedSpace,
          bedNumber: selectedBedNumber,
          roomType,
          lengthOfStay
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert("Room booked successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Error booking room:", error);
      alert(error.response?.data?.message || "Booking failed");
    }
  };

  if (!selectedRoom) {
    return (
      <div className="container">
        <div className="box">
          <h2>Select Bed</h2>
          <p>Could not find the selected apartment data.</p>
        </div>
      </div>
    );
  }

  const bedSpaceKeys = ["A", "B", "C"];
  const chosenSpace = selectedBedSpace
    ? selectedRoom.bedSpaces[selectedBedSpace]
    : null;

  return (
    <div className="container">
      <div className="box">
        <h2>Select Bed</h2>
        <p>
          Building Block: {buildingBlock}, Floor: {floor}, Apt#: {apartmentNumber}
        </p>
        <p>Flatmates: {flatmates}, Room Type: {roomType}, Stay: {lengthOfStay}</p>

        {/* BED SPACE */}
        <label>Bed Space</label>
        <select
          value={selectedBedSpace}
          onChange={(e) => {
            setSelectedBedSpace(e.target.value);
            setSelectedBedNumber("");
          }}
        >
          <option value="">-- Select BedSpace --</option>
          {bedSpaceKeys
            .filter((key) => isBedSpaceAvailable(selectedRoom.bedSpaces[key]))
            .map((key) => (
              <option key={key} value={key}>
                {key} {/* e.g., A, B, C */}
              </option>
            ))}
        </select>

        {/* BED NUMBER */}
        {chosenSpace && (
          <>
            <label>Bed Number</label>
            <select
              value={selectedBedNumber}
              onChange={(e) => setSelectedBedNumber(e.target.value)}
            >
              <option value="">-- Select Bed Number --</option>

              {/* If Ensuite, only show Bed1 if it's free */}
              {chosenSpace.roomType === "Ensuite" && !chosenSpace.bed1 && (
                <option value="1">Bed 1</option>
              )}

              {/* If Twin Shared, show whichever of bed1/bed2 is free */}
              {chosenSpace.roomType === "Twin Shared" && !chosenSpace.bed1 && (
                <option value="1">Bed 1</option>
              )}
              {chosenSpace.roomType === "Twin Shared" && !chosenSpace.bed2 && (
                <option value="2">Bed 2</option>
              )}
            </select>
          </>
        )}

        <button onClick={handleBooking} disabled={!selectedBedNumber}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default SelectBed;
