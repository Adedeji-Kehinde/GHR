import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// -- HELPER FUNCTIONS (defined above) --
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
  // -----------------
  // STATE
  // -----------------
  const [allRooms, setAllRooms] = useState([]);

  // Form fields
  const [lengthOfStay, setLengthOfStay] = useState("");
  const [flatmates, setFlatmates] = useState("");
  const [roomType, setRoomType] = useState("");
  const [buildingBlock, setBuildingBlock] = useState("");
  const [floor, setFloor] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");

  // For dropdown data
  const [uniqueBuildings, setUniqueBuildings] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  // -----------------
  // FETCH ALL ROOMS
  // -----------------
  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        if (!token) {
          console.error("No token found; please login");
          navigate("/login");
          return;
        }
        const response = await axios.get(`${API_URL}/api/booking/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllRooms(response.data || []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchAllRooms();
  }, [API_URL, token, navigate]);

  // -----------------
  // GET VALID ROOM TYPES BASED ON FLATMATES
  // (logic: if 3 => only "Ensuite", etc.)
  // (logic: if 6 => only "Twin Shared", etc.)
  // -----------------
  const getValidRoomTypes = () => {
    if (!flatmates) {
      return ["Ensuite", "Twin Shared"];
    }
    if (flatmates === "3") {
      return ["Ensuite"]; // Only 3 capacity => all Ensuite
    }
    if (flatmates === "6") {
        return ["Twin Shared"]; // Only 6 capacity => all Twin Shared
      }
    return ["Ensuite", "Twin Shared"];
  };

  // If user picks "Twin Shared", remove "3" from the flatmates
  const getValidFlatmateOptions = () => {
    const base = ["3", "4", "5", "6"];
    if (roomType === "Twin Shared") {
      return base.filter((val) => val !== "3");
    }
    return base;
  };

  // -----------------
  // 1) BUILDING BLOCK DROPDOWN
  // We want to show only blocks that have at least one room matching:
  //   - capacity = flatmates
  //   - hasFreeBedOfType = roomType
  // We'll do final filtering in floors & apartments, but let's also filter building blocks if we want.
  // Or we can simply show all building blocks and let floors/apts filter further.
  // For simplicity, let's gather unique blocks from the "filteredRooms" (that match capacity & roomType).
  // Then set them in setUniqueBuildings.
  // -----------------
  useEffect(() => {
    // Filter the entire allRooms by (flatmates + roomType)
    let filtered = allRooms;

    // If the user picked flatmates, keep only rooms that have EXACT capacity (3,4,5,6)
    if (flatmates) {
      filtered = filtered.filter(
        (room) => calcRoomCapacity(room) === Number(flatmates)
      );
    }

    // If the user picked a roomType, keep only rooms that have at least 1 free bed of that type
    if (roomType) {
      filtered = filtered.filter((room) => hasFreeBedOfType(room, roomType));
    }

    // Now gather building blocks from that filtered subset
    const blocks = [...new Set(filtered.map((r) => r.buildingBlock))];
    blocks.sort();

    setUniqueBuildings(blocks);

    // If the current buildingBlock is not in that list, reset it
    if (buildingBlock && !blocks.includes(buildingBlock)) {
      setBuildingBlock("");
      setFloor("");
      setApartmentNumber("");
      setFilteredFloors([]);
      setFilteredApartments([]);
    }
  }, [allRooms, flatmates, roomType, buildingBlock]);

  // -----------------
  // 2) FLOORS
  // Once buildingBlock is chosen, further filter for that block
  // + capacity + free bed of type
  // Then collect floors
  // -----------------
  useEffect(() => {
    if (!buildingBlock) {
      setFloor("");
      setFilteredFloors([]);
      setApartmentNumber("");
      setFilteredApartments([]);
      return;
    }

    let matching = allRooms;

    // Filter by capacity if flatmates is chosen
    if (flatmates) {
      matching = matching.filter(
        (room) => calcRoomCapacity(room) === Number(flatmates)
      );
    }

    // Filter by roomType if chosen
    if (roomType) {
      matching = matching.filter((room) => hasFreeBedOfType(room, roomType));
    }

    // Filter by buildingBlock
    matching = matching.filter((r) => r.buildingBlock === buildingBlock);

    // Gather floors
    const floors = [...new Set(matching.map((r) => r.floor))];
    floors.sort((a, b) => a - b);

    setFilteredFloors(floors);

    // If current floor is no longer valid, reset
    if (floor && !floors.includes(Number(floor))) {
      setFloor("");
      setApartmentNumber("");
      setFilteredApartments([]);
    }
  }, [allRooms, flatmates, roomType, buildingBlock, floor]);

  // -----------------
  // 3) APARTMENTS
  // Filter by capacity + free bed type + buildingBlock + floor
  // -----------------
  useEffect(() => {
    if (!buildingBlock || floor === "") {
      setApartmentNumber("");
      setFilteredApartments([]);
      return;
    }

    let matches = allRooms;

    // Filter by capacity
    if (flatmates) {
      matches = matches.filter(
        (room) => calcRoomCapacity(room) === Number(flatmates)
      );
    }

    // Filter by roomType
    if (roomType) {
      matches = matches.filter((room) => hasFreeBedOfType(room, roomType));
    }

    // Filter by buildingBlock & floor
    matches = matches.filter(
      (r) =>
        r.buildingBlock === buildingBlock &&
        r.floor === Number(floor)
    );

    // Gather unique apartmentNumbers
    const aptNums = [...new Set(matches.map((m) => m.apartmentNumber))];
    aptNums.sort((a, b) => a - b);

    setFilteredApartments(aptNums);

    // If current apartmentNumber is not in the new list, reset
    if (apartmentNumber && !aptNums.includes(Number(apartmentNumber))) {
      setApartmentNumber("");
    }
  }, [
    allRooms,
    flatmates,
    roomType,
    buildingBlock,
    floor,
    apartmentNumber
  ]);

  // -----------------
  // PROCEED
  // -----------------
  const handleProceed = () => {
    localStorage.setItem("lengthOfStay", lengthOfStay);
    localStorage.setItem("flatmates", flatmates);
    localStorage.setItem("roomType", roomType);
    localStorage.setItem("buildingBlock", buildingBlock);
    localStorage.setItem("floor", floor);
    localStorage.setItem("apartmentNumber", apartmentNumber);

    localStorage.setItem("allRooms", JSON.stringify(allRooms));
    navigate("/selectBed");
  };

  return (
    <div className="container">
      <div className="box">
        <h2>Room Booking</h2>

        {/* LENGTH OF STAY */}
        <label>Length of Stay</label>
        <select
          value={lengthOfStay}
          onChange={(e) => setLengthOfStay(e.target.value)}
        >
          <option value="">-- Select Duration --</option>
          <option value="Summer">Summer</option>
          <option value="First Semester">First Semester</option>
          <option value="Second Semester">Second Semester</option>
          <option value="Full Year">Full Year</option>
        </select>

        {/* FLATMATES */}
        <label>Number of Flatmates</label>
        <select
          value={flatmates}
          onChange={(e) => {
            setFlatmates(e.target.value);
            // If picking 3 => can only do Ensuite
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

        {/* ROOM TYPE */}
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

        {/* BUILDING BLOCK */}
        <label>Building Block</label>
        <select
          value={buildingBlock}
          onChange={(e) => setBuildingBlock(e.target.value)}
        >
          <option value="">-- Select Building Block --</option>
          {uniqueBuildings.map((block) => (
            <option key={block} value={block}>
              {block}
            </option>
          ))}
        </select>

        {/* FLOOR */}
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

        {/* APARTMENT NUMBER */}
        <label>Apartment Number</label>
        <select
          value={apartmentNumber}
          onChange={(e) => setApartmentNumber(e.target.value)}
          disabled={floor === ""}
        >
          <option value="">-- Select Apartment --</option>
          {filteredApartments.map((apt) => (
            <option key={apt} value={apt}>
              {apt}
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
            !apartmentNumber
          }
        >
          Proceed to Bed Selection
        </button>
      </div>
    </div>
  );
};

export default Booking;
