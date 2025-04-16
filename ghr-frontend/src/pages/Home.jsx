import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

// Helper function to format date/time strings
function formatDateTime(dateTimeString) {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  } catch (e) {
    console.error("Error formatting date", e);
    return "-";
  }
}

// Reusable BookingCard component (non-clickable)
function BookingCard({ booking, cardWidth = "300px", clickable = false, onClick }) {
  const isPast = booking.status === "Cancelled" || booking.status === "Expired";

  const containerStyle =
    cardWidth === "100%"
      ? {
          display: "block",
          width: "100%",
          maxWidth: "100%",
          margin: "16px 0",
          cursor: clickable ? "pointer" : "default"
        }
      : {
          width: cardWidth,
          margin: "16px 0",
          cursor: clickable ? "pointer" : "default"
        };

  return (
    <div
      onClick={clickable ? onClick : undefined}
      style={{
        ...containerStyle,
        border: "1px solid #ccc",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.3s",
      }}
    >
      <img
        src="/images/building.jpeg"
        alt="Building"
        style={{
          width: "100%",
          height: "180px",
          objectFit: "cover",
          filter: isPast ? "grayscale(100%)" : "none",
        }}
      />
      <div style={{ padding: "16px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "bold", color: "#000" }}>
          {`Bed ${booking.floor}.${booking.apartmentNumber}${booking.bedSpace}, Block ${booking.buildingBlock}, ${booking.roomType}`}
        </h3>
        <p style={{ margin: "0 0 4px", color: "#666", fontSize: "18px" }}>
          {`${booking.checkInDate ? formatDateTime(booking.checkInDate) : "-"} → ${
            booking.checkOutDate ? formatDateTime(booking.checkOutDate) : "-"
          }`}
        </p>
        <p style={{ margin: "0", color: "#666", fontSize: "18px" }}>
          {booking.lengthOfStay}
        </p>
      </div>
    </div>
  );
}

// Component to display steps if the user has no active booking
function NoBookingsMessage() {
  return (
    <div
      style={{
        padding: "16px",
        maxWidth: "600px",
        margin: "auto",
        textAlign: "left",
      }}
    >
      <h2 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "16px" }}>
        How to Book Your Room
      </h2>
      <ol style={{ fontSize: "18px", lineHeight: "1.5" }}>
        <li>Review available rooms on the Availability page.</li>
        <li>
          Choose your room type, length of stay, and other preferences on the
          booking page.
        </li>
        <li>Proceed to select your bed and complete your booking.</li>
        <li>
          Once your booking is confirmed, it will appear in "My Current Bookings."
        </li>
      </ol>
    </div>
  );
}

const Home = () => {
  const [user, setUser] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const navigate = useNavigate();
  const API_URL =import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // Fetch user details.
  useEffect(() => {
    const token = localStorage.getItem("token");
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
  }, [navigate, API_URL]);

  // Fetch bookings for the current user.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const fetchBookings = async () => {
      try {
        const bookingsRes = await axios.get(`${API_URL}/api/booking/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter bookings to only include those specific to the current user.
        // Assume the booking object has a property "userId" (as a string or object _id)
        // Adjust according to your actual data structure.
        setAllBookings(bookingsRes.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [API_URL]);

  // Once the user data is loaded, filter bookings to those that belong to the current user.
  const userSpecificBookings = user
    ? allBookings.filter(
        (b) =>
          // Adjust the check below based on your API. Here we assume user._id is a string.
          (b.userId === user._id || (b.userId && b.userId._id === user._id))
      )
    : [];

  // Split user-specific bookings into active and past.
  const activeBookings = userSpecificBookings.filter(
    (b) => b.status === "Booked"
  );
  const pastBookings = userSpecificBookings.filter(
    (b) => b.status === "Cancelled" || b.status === "Expired"
  );

  // If there is an active booking, disable the booking button in the header.
  const hideBookRoom = activeBookings.length > 0;

  return (
    <>
      <UserHeader user={user} hideBookRoom={hideBookRoom} />
      <div style={{ marginTop: "80px", width: "100%", padding: "16px" }}>
        {loadingUser || loadingBookings ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* My Current Bookings Section */}
            <h2
              style={{
                textAlign: "left",
                fontSize: "32px",
                fontWeight: "bold",
                margin: "16px 0 8px 0",
              }}
            >
              My Current Bookings
            </h2>
            {activeBookings.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                  gap: "16px",
                }}
              >
                {activeBookings.map((booking) => (
                  <BookingCard
                  key={booking._id}
                  booking={booking}
                  cardWidth={activeBookings.length === 1 ? "100%" : "300px"}
                  clickable={true}
                  onClick={() => {
                    console.log("Navigating with booking:", booking);
                    navigate("/my-booking-details", { state: { booking } });
                  }}                  
                />
              ))}
              </div>
            ) : (
              // If the user has no active bookings, display the no-booking steps.
              <NoBookingsMessage />
            )}

            {/* Past/Archived Bookings Section */}
            <h2
              style={{
                textAlign: "left",
                fontSize: "32px",
                fontWeight: "bold",
                margin: "40px 0 8px 0",
              }}
            >
              Past/Archived
            </h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                gap: "24px",
              }}
            >
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <p>You do not have any past bookings.</p>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Home;
