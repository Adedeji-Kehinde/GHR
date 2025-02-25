import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

const SelectBed = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // User Authentication State
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [navigate, token, API_URL]);

  // Retrieve booking details from localStorage
  const buildingBlock = localStorage.getItem("buildingBlock");
  const floor = localStorage.getItem("floor");
  const apartmentNumber = localStorage.getItem("apartmentNumber");
  const flatmates = localStorage.getItem("flatmates");
  const roomType = localStorage.getItem("roomType");
  const lengthOfStay = localStorage.getItem("lengthOfStay");

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBedSpace, setSelectedBedSpace] = useState("");
  const [selectedBedNumber, setSelectedBedNumber] = useState("");

  // Fetch selected room from localStorage (saved from Booking page)
  useEffect(() => {
    const allRoomsStr = localStorage.getItem("allRooms");
    if (!allRoomsStr) return;

    try {
      const allRooms = JSON.parse(allRoomsStr);
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
  }, [buildingBlock, floor, apartmentNumber]);

  // Helper to check if a bedSpace is available (ignoring overall occupancy)
  const isBedSpaceAvailable = (bedSpaceData) => {
    if (!bedSpaceData) return false;
    if (bedSpaceData.roomType !== roomType) return false;

    if (bedSpaceData.roomType === "Ensuite") {
      return !bedSpaceData.bed1;
    }
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
          lengthOfStay,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Room booked successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Error booking room:", error);
      alert(error.response?.data?.message || "Booking failed");
    }
  };

  // Show a loading message until user data is fetched
  if (loadingUser) {
    return <p>Loading...</p>;
  }

  if (!selectedRoom) {
    return (
      <>
        <UserHeader user={user} />
        <div className="container">
          <div className="box">
            <h2>Select Bed</h2>
            <p>Could not find the selected apartment data.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const bedSpaceKeys = ["A", "B", "C"];
  const chosenSpace = selectedBedSpace
    ? selectedRoom.bedSpaces[selectedBedSpace]
    : null;

  return (
    <>
      {/* Header with user info */}
      <UserHeader user={user} />

      <div className="container">
        <div className="box">
          <h2>Select Bed</h2>
          <p>
            Building Block: {buildingBlock}, Floor: {floor}, Apt#: {apartmentNumber}
          </p>
          <p>
            Flatmates: {flatmates}, Room Type: {roomType}, Stay: {lengthOfStay}
          </p>

          {/* BED SPACE SELECTION */}
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
                  {key}
                </option>
              ))}
          </select>

          {/* BED NUMBER SELECTION */}
          {chosenSpace && (
            <>
              <label>Bed Number</label>
              <select
                value={selectedBedNumber}
                onChange={(e) => setSelectedBedNumber(e.target.value)}
              >
                <option value="">-- Select Bed Number --</option>
                {chosenSpace.roomType === "Ensuite" && !chosenSpace.bed1 && (
                  <option value="1">Bed 1</option>
                )}
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

      {/* Footer */}
      <Footer />
    </>
  );
};

export default SelectBed;
