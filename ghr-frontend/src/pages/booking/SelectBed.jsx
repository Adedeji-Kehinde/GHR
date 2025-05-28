import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css"; 
import Loading from "../components/Loading";
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
  if (roomType === "Ensuite") return { bedSize: "Small Double", roomSize: "16m²" };
  if (roomType === "Twin Shared") return { bedSize: "Single", roomSize: "14m²" };
  return { bedSize: "", roomSize: "" };
}

const SelectBed = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [roomsData, setRoomsData] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  const [selectedApartmentNumber, setSelectedApartmentNumber] = useState("");
  const [selectedBedSpace, setSelectedBedSpace] = useState("");
  const [selectedBedNumber, setSelectedBedNumber] = useState("");

  const buildingBlock = localStorage.getItem("buildingBlock");
  const floor = localStorage.getItem("floor");
  const flatmates = localStorage.getItem("flatmates");
  const roomType = localStorage.getItem("roomType");
  const lengthOfStay = localStorage.getItem("lengthOfStay");
  const checkInDate = localStorage.getItem("checkInDateTime");
  const checkOutDate = localStorage.getItem("checkOutDateTime");

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
    AOS.init({ duration: 1000 });
  }, [navigate, token, API_URL]);

  useEffect(() => {
    const allRoomsStr = localStorage.getItem("allRooms");
    if (allRoomsStr) {
      try {
        const parsedRooms = JSON.parse(allRoomsStr);
        setRoomsData(parsedRooms);
      } catch (err) {
        console.error("Error parsing rooms data:", err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/api/booking/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllBookings(res.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, [API_URL, token]);

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

  const isBedAvailable = (buildingBlock, floor, apartmentNumber, bedSpaceKey, bedNum) => {
    const occupant = allBookings.find(
      (b) =>
        b.buildingBlock === buildingBlock &&
        b.floor === floor &&
        b.apartmentNumber === apartmentNumber &&
        b.bedSpace === bedSpaceKey &&
        b.bedNumber === bedNum &&
        b.status === "Booked"
    );
    return !occupant;
  };

  const getBedOccupantInfo = (buildingBlock, floor, apartmentNumber, bedSpaceKey, bedNum) => {
    return allBookings.find(
      (b) =>
        b.buildingBlock === buildingBlock &&
        b.floor === floor &&
        b.apartmentNumber === apartmentNumber &&
        b.bedSpace === bedSpaceKey &&
        b.bedNumber === bedNum &&
        b.status === "Booked"
    )?.userId;
  };

  const handleBedSelection = (apartmentNumber, bedSpaceKey, bedNum, disabled) => {
    if (disabled) return;
    setSelectedApartmentNumber(apartmentNumber.toString());
    setSelectedBedSpace(bedSpaceKey);
    setSelectedBedNumber(bedNum);
  };

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
    const popup = window.open(
      `${API_URL}/payment?amount=${amount}`,
      "Payment",
      "width=500,height=500"
    );
    window.addEventListener("message", async (event) => {
      const { payment } = event.data;
      if (payment === "success") {
        if (window.bookingInProgress) return;
        window.bookingInProgress = true;
        try {
          const bookingData = JSON.parse(localStorage.getItem("pendingBooking"));
          await axios.post(`${API_URL}/api/booking/bookings`, bookingData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("Booking complete!");
          navigate("/home");
        } catch (error) {
          console.error("Booking error:", error);
          alert("Booking failed.");
        } finally {
          window.bookingInProgress = false;
        }
      } else if (payment === "failure") {
        alert("Payment failed. Please try again.");
      }
    });
  };

  const isCardSelected = (aptNum, bedSpace, bedNum) =>
    selectedApartmentNumber === aptNum.toString() &&
    selectedBedSpace === bedSpace &&
    selectedBedNumber === bedNum;

    if (loadingUser) return <Loading icon="/images/logo.png" text="Loading Available Beds..." />;

  return (
    <>
      <UserHeader user={user} hideBookRoom={true} />
      <div className="select-bed-page" data-aos="fade-up">
        <h2 data-aos="fade-down">Select Bed</h2>

        {/* Booking Summary */}
        <div className="data-summary" data-aos="fade-up">
          <div className="data-card" ><strong>Block:</strong> {buildingBlock}</div>
          <div className="data-card"><strong>Floor:</strong> {floor}</div>
          <div className="data-card"><strong>Flatmates:</strong> {flatmates}</div>
          <div className="data-card"><strong>Room Type:</strong> {roomType}</div>
          <div className="data-card"><strong>Length of Stay:</strong> {lengthOfStay}</div>
        </div>

        {/* Apartments */}
        {filteredApartments.length === 0 ? (
          <p>No available apartments found for your criteria.</p>
        ) : (
          filteredApartments.map((apt) => {
            const aptNum = apt.apartmentNumber;
            const bedSpaces = apt.bedSpaces || {};
            const bedItems = [];

            for (const key of ["A", "B", "C"]) {
              const space = bedSpaces[key];
              if (!space || space.roomType !== roomType) continue;
              if (space.roomType === "Ensuite") {
                const disabled = !isBedAvailable(apt.buildingBlock, apt.floor, aptNum, key, "1");
                const occupant = getBedOccupantInfo(apt.buildingBlock, apt.floor, aptNum, key, "1");
                bedItems.push({ bedSpace: key, bedNumber: "1", disabled, occupant });
              } else if (space.roomType === "Twin Shared") {
                ["1", "2"].forEach((bedNum) => {
                  const disabled = !isBedAvailable(apt.buildingBlock, apt.floor, aptNum, key, bedNum);
                  const occupant = getBedOccupantInfo(apt.buildingBlock, apt.floor, aptNum, key, bedNum);
                  bedItems.push({ bedSpace: key, bedNumber: bedNum, disabled, occupant });
                });
              }
            }

            if (bedItems.length === 0) return null;

            return (
              <div key={aptNum} data-aos="fade-right">
                <div className="apartment-header" data-aos="fade-right">
                  <img src="/images/apartment.png" alt="Apartment icon" width="24" height="24" />
                  <h3 data-aos="fade-right">Apartment {aptNum}</h3>
                </div>
                <p style={{ color: "#777", marginBottom: "1rem" }}>
                  Co-ed | Smoking not allowed | Pets not allowed
                </p>

                <div className="bed-grid" data-aos="fade-right">
                  {bedItems.map(({ bedSpace, bedNumber, disabled, occupant }) => {
                    const selected = isCardSelected(aptNum, bedSpace, bedNumber);
                    const { bedSize, roomSize } = getBedDisplayDetails(roomType);
                    return (
                      <div data-aos="fade-right"
                        key={`${aptNum}-${bedSpace}-${bedNumber}`}
                        className={`bed-card ${disabled ? "disabled" : ""} ${selected ? "selected" : ""}`}
                        onClick={() => handleBedSelection(aptNum, bedSpace, bedNumber, disabled)}
                      >
                        <img src="/images/bed.png" alt="Bed" />
                        <strong>Bed {bedSpace}{bedNumber}</strong>
                        <p>Bed size: {bedSize}</p>
                        <p>Room size: {roomSize}</p>
                        {occupant && (
                          <p>Occupant: {occupant.name} {occupant.gender && `(${occupant.gender})`}</p>
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
          className="proceed-button"
          onClick={handleBooking}
          disabled={!selectedApartmentNumber || !selectedBedSpace || !selectedBedNumber}
        >
          Proceed to Payment Plan
        </button>
      </div>
      <Footer />
    </>
  );
};

export default SelectBed;
