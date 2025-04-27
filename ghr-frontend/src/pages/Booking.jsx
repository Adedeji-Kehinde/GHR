import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "./UserHeader";
import Footer from "./Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import Loading from "./Loading";
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
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [allRooms, setAllRooms] = useState([]);
  const [lengthOfStay, setLengthOfStay] = useState("");
  const [flatmates, setFlatmates] = useState("");
  const [roomType, setRoomType] = useState("");
  const [buildingBlock, setBuildingBlock] = useState("");
  const [floor, setFloor] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [checkInDateTime, setCheckInDateTime] = useState("");
  const [checkOutDateTime, setCheckOutDateTime] = useState("");

  const [uniqueBuildings, setUniqueBuildings] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);

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
  
        // 🎯 Now fetch the user's bookings
        const bookingsRes = await axios.get(`${API_URL}/api/booking/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const userBookings = bookingsRes.data.filter(
          (b) => (b.userId === response.data._id || (b.userId && b.userId._id === response.data._id)) 
            && b.status === "Booked"
        );
  
        if (userBookings.length > 0) {
          // 🛑 Redirect user if they already have an active booking
          navigate("/home");
        }
      } catch (error) {
        console.error("Error fetching user or bookings:", error);
        navigate("/login");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
    AOS.init({ duration: 1000 });
  }, [navigate, token, API_URL]);

  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/booking/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllRooms(response.data || []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchAllRooms();
  }, [API_URL, token]);

  const getValidRoomTypes = () => {
    if (!flatmates) return ["Ensuite", "Twin Shared"];
    if (flatmates === "3") return ["Ensuite"];
    if (flatmates === "6") return ["Twin Shared"];
    return ["Ensuite", "Twin Shared"];
  };

  const getValidFlatmateOptions = () => {
    const base = ["3", "4", "5", "6"];
    if (roomType === "Twin Shared") {
      return base.filter((val) => val !== "3");
    }
    return base;
  };

  useEffect(() => {
    let filtered = allRooms;
    if (flatmates) {
      filtered = filtered.filter(room => calcRoomCapacity(room) === Number(flatmates));
    }
    if (roomType) {
      filtered = filtered.filter(room => hasFreeBedOfType(room, roomType));
    }
    const blocks = [...new Set(filtered.map((r) => r.buildingBlock))];
    blocks.sort();
    setUniqueBuildings(blocks);

    if (buildingBlock && !blocks.includes(buildingBlock)) {
      setBuildingBlock("");
      setFloor("");
      setApartmentNumber("");
      setFilteredFloors([]);
      setFilteredApartments([]);
    }
  }, [allRooms, flatmates, roomType, buildingBlock]);

  useEffect(() => {
    if (!buildingBlock) {
      setFloor("");
      setFilteredFloors([]);
      setApartmentNumber("");
      setFilteredApartments([]);
      return;
    }
    let matching = allRooms;
    if (flatmates) {
      matching = matching.filter(room => calcRoomCapacity(room) === Number(flatmates));
    }
    if (roomType) {
      matching = matching.filter(room => hasFreeBedOfType(room, roomType));
    }
    matching = matching.filter(r => r.buildingBlock === buildingBlock);
    const floors = [...new Set(matching.map((r) => r.floor))];
    floors.sort((a, b) => a - b);
    setFilteredFloors(floors);

    if (floor && !floors.includes(Number(floor))) {
      setFloor("");
      setApartmentNumber("");
      setFilteredApartments([]);
    }
  }, [allRooms, flatmates, roomType, buildingBlock, floor]);

  useEffect(() => {
    if (!buildingBlock || floor === "") {
      setApartmentNumber("");
      setFilteredApartments([]);
      return;
    }
    let matches = allRooms;
    if (flatmates) {
      matches = matches.filter(room => calcRoomCapacity(room) === Number(flatmates));
    }
    if (roomType) {
      matches = matches.filter(room => hasFreeBedOfType(room, roomType));
    }
    matches = matches.filter(
      (r) =>
        r.buildingBlock === buildingBlock &&
        r.floor === Number(floor)
    );
    const aptNums = [...new Set(matches.map((m) => m.apartmentNumber))];
    aptNums.sort((a, b) => a - b);
    setFilteredApartments(aptNums);

    if (apartmentNumber && !aptNums.includes(Number(apartmentNumber))) {
      setApartmentNumber("");
    }
  }, [allRooms, flatmates, roomType, buildingBlock, floor, apartmentNumber]);

  const handleProceed = () => {
    localStorage.setItem("lengthOfStay", lengthOfStay);
    localStorage.setItem("flatmates", flatmates);
    localStorage.setItem("roomType", roomType);
    localStorage.setItem("buildingBlock", buildingBlock);
    localStorage.setItem("floor", floor);
    localStorage.setItem("apartmentNumber", apartmentNumber);
    localStorage.setItem("allRooms", JSON.stringify(allRooms));
    if (lengthOfStay === "Flexible") {
      localStorage.setItem("checkInDateTime", checkInDateTime);
      localStorage.setItem("checkOutDateTime", checkOutDateTime);
    }
    navigate("/selectBed");
  };

  if (loadingUser) return <Loading icon="/images/logo.png" text="Loading Booking selections..." />;

  return (
    <>
      <UserHeader user={user} hideBookRoom={true} />
      <div className="booking-page" style={{ marginTop: "80px", padding: "2rem" }}>
        <h1 data-aos="fade-down">Room Booking</h1>

        {/* Stay Duration Section */}
        <section data-aos="fade-up" style={{ marginBottom: "2rem" }}>
          <h2>Stay Duration</h2>
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
              <label>Check-in Date</label>
              <input
                type="datetime-local"
                value={checkInDateTime}
                onChange={(e) => setCheckInDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <label>Check-out Date</label>
              <input
                type="datetime-local"
                value={checkOutDateTime}
                onChange={(e) => setCheckOutDateTime(e.target.value)}
                min={checkInDateTime || new Date().toISOString().slice(0, 16)}
              />
            </>
          )}
        </section>

        {/* Flatmates and Room Type Section */}
        <section data-aos="fade-up" style={{ marginBottom: "2rem" }}>
          <h2>Flat & Room Type</h2>
          <label>Number of Flatmates</label>
          <select value={flatmates} onChange={(e) => setFlatmates(e.target.value)}>
            <option value="">-- Select Flatmates --</option>
            {getValidFlatmateOptions().map((fm) => (
              <option key={fm} value={fm}>{fm}</option>
            ))}
          </select>

          <label>Room Type</label>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
            <option value="">-- Select Room Type --</option>
            {getValidRoomTypes().map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </section>

        {/* Building Selection Section */}
        <section data-aos="fade-up" style={{ marginBottom: "2rem" }}>
          <h2>Select Building</h2>
          <label>Building Block</label>
          <select value={buildingBlock} onChange={(e) => setBuildingBlock(e.target.value)}>
            <option value="">-- Select Building Block --</option>
            {uniqueBuildings.map((block) => (
              <option key={block} value={block}>{block}</option>
            ))}
          </select>

          <label>Floor</label>
          <select value={floor} onChange={(e) => setFloor(e.target.value)} disabled={!buildingBlock}>
            <option value="">-- Select Floor --</option>
            {filteredFloors.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <label>Apartment Number</label>
          <select value={apartmentNumber} onChange={(e) => setApartmentNumber(e.target.value)} disabled={!floor}>
            <option value="">-- Select Apartment --</option>
            {filteredApartments.map((apt) => (
              <option key={apt} value={apt}>{apt}</option>
            ))}
          </select>
        </section>

        {/* Proceed Button */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            onClick={handleProceed}
            disabled={
              !lengthOfStay ||
              !flatmates ||
              !roomType ||
              !buildingBlock ||
              floor === "" ||
              !apartmentNumber ||
              (lengthOfStay === "Flexible" && (!checkInDateTime || !checkOutDateTime))
            }
            style={{
              padding: "1rem 2rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            Proceed to Bed Selection
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Booking;
