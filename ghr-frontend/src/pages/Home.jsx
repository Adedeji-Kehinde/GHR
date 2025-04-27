import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "./UserHeader";
import Footer from "./Footer";
import Loading from "./Loading";
// Helper function to format dates
function formatDateTime(dateTimeString) {
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  } catch (e) {
    console.error("Error formatting date", e);
    return "-";
  }
}

// Booking Card
function BookingCard({ booking, cardWidth = "300px", clickable = false, onClick }) {
  const isPast = booking.status === "Cancelled" || booking.status === "Expired";

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className="booking-card"
      style={{
        width: cardWidth,
        cursor: clickable ? "pointer" : "default",
        filter: isPast ? "grayscale(100%)" : "none",
      }}
    >
      <img src="/images/building.jpeg" alt="Building" className="booking-card-img" />
      <div className="booking-card-info">
        <h3>{`Bed ${booking.floor}.${booking.apartmentNumber}${booking.bedSpace}, Block ${booking.buildingBlock}, ${booking.roomType}`}</h3>
        <p>{`${booking.checkInDate ? formatDateTime(booking.checkInDate) : "-"} → ${booking.checkOutDate ? formatDateTime(booking.checkOutDate) : "-"}`}</p>
        <p>{booking.lengthOfStay}</p>
      </div>
    </div>
  );
}

// No Bookings Message
function NoBookingsMessage() {
  return (
    <div className="no-bookings">
      <h2>How to Book Your Room</h2>
      <ol>
        <li>Review available rooms on the Availability page.</li>
        <li>Choose your room type, stay length, and preferences.</li>
        <li>Proceed to select your bed and complete your booking.</li>
        <li>Your booking will then appear here under "Current Bookings".</li>
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
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const token = localStorage.getItem("token");
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
        console.error("Error fetching user:", err);
        navigate("/login");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [navigate, API_URL]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/booking/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllBookings(res.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoadingBookings(false);
      }
    };
    fetchBookings();
  }, [API_URL]);

  const userSpecificBookings = user
    ? allBookings.filter(
        (b) => b.userId === user._id || (b.userId && b.userId._id === user._id)
      )
    : [];

  const activeBookings = userSpecificBookings.filter(
    (b) => b.status === "Booked"
  );
  const pastBookings = userSpecificBookings.filter(
    (b) => b.status === "Cancelled" || b.status === "Expired"
  );

  const hideBookRoom = activeBookings.length > 0;

  if (loadingUser) return <Loading icon="/images/logo.png" text="Loading Your Bookings..." />;
  return (
    <>
      <UserHeader user={user} hideBookRoom={hideBookRoom} />

      <div className="home-wrapper">
        {loadingUser || loadingBookings ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <>
            <section className="home-section">
              <h2>My Current Bookings</h2>
              {activeBookings.length > 0 ? (
                <div className="booking-cards-grid">
                  {activeBookings.map((booking) => (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      cardWidth={activeBookings.length === 1 ? "40%" : "300px"}
                      clickable={true}
                      onClick={() =>
                        navigate("/my-booking-details", { state: { booking } })
                      }
                    />
                  ))}
                </div>
              ) : (
                <NoBookingsMessage />
              )}
            </section>

            <section className="home-section">
              <h2>Past / Archived</h2>
              {pastBookings.length > 0 ? (
                <div className="booking-cards-grid">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} />
                  ))}
                </div>
              ) : (
                <p className="no-past-text">You have no past bookings yet.</p>
              )}
            </section>
          </>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Home;
