import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import Loading from "../components/Loading";
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

const steps = [
  "Stay Duration",
  "Flatmates & Room Type",
  "Select Building",
  "Review & Confirm"
];

const Booking = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [allRooms, setAllRooms] = useState([]);
  const [lengthOfStay, setLengthOfStay] = useState(localStorage.getItem("lengthOfStay") || "");
  const [flatmates, setFlatmates] = useState(localStorage.getItem("flatmates") || "");
  const [roomType, setRoomType] = useState(localStorage.getItem("roomType") || "");
  const [buildingBlock, setBuildingBlock] = useState(localStorage.getItem("buildingBlock") || "");
  const [floor, setFloor] = useState(localStorage.getItem("floor") || "");
  const [apartmentNumber, setApartmentNumber] = useState(localStorage.getItem("apartmentNumber") || "");
  const [checkInDateTime, setCheckInDateTime] = useState(localStorage.getItem("checkInDateTime") || "");
  const [checkOutDateTime, setCheckOutDateTime] = useState(localStorage.getItem("checkOutDateTime") || "");

  const [uniqueBuildings, setUniqueBuildings] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);

  const [step, setStep] = useState(0);

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
          //  Redirect user if they already have an active booking
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

  // Stepper Progress Bar
  const canNext = () => {
    if (step === 0) return lengthOfStay && (lengthOfStay !== "Flexible" || (checkInDateTime && checkOutDateTime));
    if (step === 1) return flatmates && roomType;
    if (step === 2) return buildingBlock && floor !== "" && apartmentNumber;
    return true;
  };

  const handleStepClick = (idx) => {
    if (idx < step) {
      setStep(idx);
    } else if (idx === step + 1 && canNext()) {
      setStep(idx);
    }
  };

  // Auto-advance logic for each step
  useEffect(() => {
    if (step === 0 && canNext()) setTimeout(() => setStep(1), 200);
    if (step === 1 && canNext()) setTimeout(() => setStep(2), 200);
    if (step === 2 && canNext()) setTimeout(() => setStep(3), 200);
    // Don't auto-advance on review step
    // eslint-disable-next-line
  }, [lengthOfStay, checkInDateTime, checkOutDateTime, flatmates, roomType, buildingBlock, floor, apartmentNumber]);

  const ProgressBar = () => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
      {steps.map((label, idx) => (
        <React.Fragment key={label}>
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontWeight: step === idx ? "bold" : "normal",
              color: step === idx ? "#007bff" : idx < step ? "#333" : "#aaa",
              cursor: idx < step || (idx === step + 1 && canNext()) ? "pointer" : "default"
            }}
            onClick={() => handleStepClick(idx)}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: step >= idx ? "#007bff" : "#ccc", color: "#fff", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4,
              border: (idx < step || (idx === step + 1 && canNext())) ? "2px solid #007bff" : "2px solid #ccc"
            }}>{idx + 1}</div>
            <div style={{ fontSize: 14 }}>{label}</div>
          </div>
          {idx < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: step > idx ? "#007bff" : "#ccc" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Step 1: Stay Duration
  const StepStayDuration = () => (
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
  );

  // Step 2: Flatmates & Room Type
  const StepFlatmatesRoomType = () => (
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
  );

  // Step 3: Building Selection
  const StepBuildingSelection = () => (
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
  );

  // Step 4: Review & Confirm
  const reviewItems = [
    {
      label: "Length of Stay",
      value: lengthOfStay,
      icon: "/images/length-of-stay.png"
    },
    ...(lengthOfStay === "Flexible" ? [
      { label: "Check-in", value: checkInDateTime, icon: "/images/check-in.png" },
      { label: "Check-out", value: checkOutDateTime, icon: "/images/check-out.png" }
    ] : []),
    {
      label: "Flatmates",
      value: flatmates,
      icon: "/images/user.png"
    },
    {
      label: "Room Type",
      value: roomType,
      icon: roomType === "Ensuite" ? "/images/ensuite.png" : "/images/twin-shared.png"
    },
    {
      label: "Building Block",
      value: buildingBlock,
      icon: "/images/building-block.png"
    },
    {
      label: "Floor",
      value: floor,
      icon: "/images/floor.png"
    },
    {
      label: "Apartment Number",
      value: apartmentNumber,
      icon: "/images/apartment.png"
    }
  ];

  const StepReview = () => (
    <section data-aos="fade-up" style={{ marginBottom: "2rem" }}>
      <h2>Review & Confirm</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 24,
        marginTop: 24
      }}>
        {reviewItems.map((item, idx) => (
          <div key={idx} style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 180
          }}>
            <img src={item.icon} alt={item.label} style={{ width: 48, height: 48, marginBottom: 16 }} />
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{item.label}</div>
            <div style={{ fontSize: 18, color: "#007bff", wordBreak: "break-word", textAlign: "center" }}>{item.value}</div>
          </div>
        ))}
      </div>
    </section>
  );

  if (loadingUser) return <Loading icon="/images/logo.png" text="Loading Booking selections..." />;

  return (
    <>
      <UserHeader user={user} hideBookRoom={true} />
      <div className="booking-page" style={{ marginTop: "80px", padding: "2rem" }}>
        <h1 data-aos="fade-down">Room Booking</h1>
        <ProgressBar />
        {step === 0 && <StepStayDuration />}
        {step === 1 && <StepFlatmatesRoomType />}
        {step === 2 && <StepBuildingSelection />}
        {step === 3 && <StepReview />}
        {step === steps.length - 1 && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              onClick={handleProceed}
              style={{ padding: "0.75rem 2rem", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "8px", fontSize: "1.1rem", cursor: "pointer", minWidth: 180 }}
            >
              Proceed to Bed Selection
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Booking;
