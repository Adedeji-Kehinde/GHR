import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

// -- HELPER FUNCTIONS --
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

const Booking = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();
  const API_URL =import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

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
      } catch (err) {
        console.error("Error fetching user:", err.response || err);
        navigate("/login");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [API_URL, token, navigate]);

  // Booking form state (fixed durations only)
  const [allRooms, setAllRooms] = useState([]);
  const [lengthOfStay, setLengthOfStay] = useState("");
  const [flatmates, setFlatmates] = useState("");
  const [roomType, setRoomType] = useState("");
  const [buildingBlock, setBuildingBlock] = useState("");
  const [floor, setFloor] = useState("");
  const [checkInDateTime, setCheckInDateTime] = useState("");
  const [checkOutDateTime, setCheckOutDateTime] = useState("");


  // Dropdown data
  const [uniqueBuildings, setUniqueBuildings] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);

  // Fetch all rooms
  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        if (!token) {
          console.error("No token found; please login");
          navigate("/login");
          return;
        }
        const res = await axios.get(`${API_URL}/api/booking/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllRooms(res.data || []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchAllRooms();
  }, [API_URL, token, navigate]);

  // Get valid room types based on flatmates
  const getValidRoomTypes = () => {
    if (!flatmates) return ["Ensuite", "Twin Shared"];
    if (flatmates === "3") return ["Ensuite"];
    if (flatmates === "6") return ["Twin Shared"];
    return ["Ensuite", "Twin Shared"];
  };

  // Adjust flatmate options if room type is Twin Shared
  const getValidFlatmateOptions = () => {
    const base = ["3", "4", "5", "6"];
    if (roomType === "Twin Shared") return base.filter((val) => val !== "3");
    return base;
  };

  // Update Building Block dropdown
  useEffect(() => {
    let filtered = allRooms;
    if (flatmates) {
      filtered = filtered.filter(
        (room) => calcRoomCapacity(room) === Number(flatmates)
      );
    }
    if (roomType) {
      filtered = filtered.filter((room) => hasFreeBedOfType(room, roomType));
    }
    const blocks = [...new Set(filtered.map((r) => r.buildingBlock))];
    blocks.sort();
    setUniqueBuildings(blocks);
    if (buildingBlock && !blocks.includes(buildingBlock)) {
      setBuildingBlock("");
      setFloor("");
      setFilteredFloors([]);
    }
  }, [allRooms, flatmates, roomType, buildingBlock]);

  // Update Floors dropdown
  useEffect(() => {
    if (!buildingBlock) {
      setFloor("");
      setFilteredFloors([]);
      return;
    }
    let matching = allRooms;
    if (flatmates) {
      matching = matching.filter(
        (room) => calcRoomCapacity(room) === Number(flatmates)
      );
    }
    if (roomType) {
      matching = matching.filter((room) => hasFreeBedOfType(room, roomType));
    }
    matching = matching.filter((r) => r.buildingBlock === buildingBlock);
    const floors = [...new Set(matching.map((r) => r.floor))];
    floors.sort((a, b) => a - b);
    setFilteredFloors(floors);
    if (floor && !floors.includes(Number(floor))) {
      setFloor("");
    }
  }, [allRooms, flatmates, roomType, buildingBlock, floor]);

  // Proceed to bed selection
  const handleProceed = () => {
    localStorage.setItem("lengthOfStay", lengthOfStay);
    localStorage.setItem("flatmates", flatmates);
    localStorage.setItem("roomType", roomType);
    localStorage.setItem("buildingBlock", buildingBlock);
    localStorage.setItem("floor", floor);
    if (lengthOfStay === "Flexible") {
      localStorage.setItem("checkInDateTime", checkInDateTime);
      localStorage.setItem("checkOutDateTime", checkOutDateTime);
    }
    // Apartment Number will be selected in the next phase (SelectBed)
    navigate("/selectBed");
  };

  if (loadingUser) return <p>Loading...</p>;

  return (
    <>
      <UserHeader user={user} hideBookRoom={true} />
      <h2>Room Preferences</h2>
      <label>Length of Stay</label>
      <select value={lengthOfStay} onChange={(e) => setLengthOfStay(e.target.value)}>
        <option value="">-- Select Duration --</option>
        <option value="Summer">Summer</option>
        <option value="First Semester">First Semester</option>
        <option value="Second Semester">Second Semester</option>
        <option value="Full Year">Full Year</option>
        <option value="Flexible">Flexible</option>
      </select>
      {lengthOfStay === "Flexible" && (
        <>
          <label>Check‑in Date & Time</label>
          <input
            type="datetime-local"
            value={checkInDateTime}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setCheckInDateTime(e.target.value)}
          />

          <label>Check‑out Date & Time</label>
          <input
            type="datetime-local"
            value={checkOutDateTime}
            min={
              checkInDateTime
                ? new Date(new Date(checkInDateTime).setMonth(new Date(checkInDateTime).getMonth() + 2))
                    .toISOString()
                    .slice(0, 16)
                : new Date().toISOString().slice(0, 16)
            }
            onChange={(e) => setCheckOutDateTime(e.target.value)}
          />
        </>
      )}



      <label>Number of Flatmates</label>
      <select
        value={flatmates}
        onChange={(e) => {
          setFlatmates(e.target.value);
          if (e.target.value === "3" && roomType === "Twin Shared") {
            setRoomType("");
          }
        }}
      >
        <option value="">-- Select Flatmates --</option>
        {getValidFlatmateOptions().map((fm) => (
          <option key={fm} value={fm}>
            {fm}
          </option>
        ))}
      </select>
      <label>Room Type</label>
      <select
        value={roomType}
        onChange={(e) => {
          setRoomType(e.target.value);
          if (e.target.value === "Twin Shared" && flatmates === "3") {
            setFlatmates("");
          }
        }}
      >
        <option value="">-- Select Room Type --</option>
        {getValidRoomTypes().map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <label>Building Block</label>
      <select value={buildingBlock} onChange={(e) => setBuildingBlock(e.target.value)}>
        <option value="">-- Select Building Block --</option>
        {uniqueBuildings.map((block) => (
          <option key={block} value={block}>
            {block}
          </option>
        ))}
      </select>
      <label>Floor</label>
      <select
        value={floor}
        onChange={(e) => setFloor(e.target.value)}
        disabled={!buildingBlock}
      >
        <option value="">-- Select Floor --</option>
        {filteredFloors.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
      <button
        onClick={handleProceed}
        disabled={
          !lengthOfStay ||
          !flatmates ||
          !roomType ||
          !buildingBlock ||
          floor === "" ||
          (lengthOfStay === "Flexible" && (!checkInDateTime || !checkOutDateTime))
        }
      >
        Proceed to Bed Selection
      </button>
      <Footer />
    </>
  );
};

export default Booking;
