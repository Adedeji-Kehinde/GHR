import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

const MyBookingDetails = () => {
  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL =import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"; // Update if needed

    // Summary box style for payment totals
    const summaryCardStyle = {
      flex: "1 1 200px",
      padding: "16px",
      borderRadius: "8px",
      backgroundColor: "#f8f8f8",
      border: "1px solid #ddd",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      textAlign: "center",
      fontSize: "18px",
    };

  // Fetch booking details using the specific booking id stored for the user.
  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const bookingId = localStorage.getItem("selectedBookingId");
      if (!bookingId) {
        throw new Error("No booking id found for this user.");
      }
      const res = await axios.get(`${API_URL}/api/booking/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Expected response: { booking: { ... }, payments: [ ... ] }
      const { booking: fetchedBooking, payments } = res.data;
      setBooking(fetchedBooking);
      setPaymentData({
        paymentSchedule: payments,
        totalAmount: payments.reduce((acc, p) => acc + p.amount, 0).toFixed(2),
        totalPaid: payments
          .filter((p) => p.status === "Paid")
          .reduce((sum, p) => sum + p.amount, 0)
          .toFixed(2),
        totalUnpaid: payments
          .filter((p) => p.status === "Unpaid")
          .reduce((sum, p) => sum + p.amount, 0)
          .toFixed(2),
      });
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchBookingDetails();

    // Fetch user info from the specific endpoint
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRes = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);
      } catch (error) {
        console.error("Error loading user info:", error);
      }
    };
    fetchUser();
  }, [API_URL, navigate]);

  // Trigger monthly payment popup (for upcoming payment)
  const openMonthlyPaymentPopup = (monthlyPayment) => {
    const popup = window.open(
      `${API_URL}/payment?amount=${monthlyPayment.amount}&paymentId=${monthlyPayment._id}`,
      "Payment",
      "width=500,height=500"
    );

    // Named message handler, so we can remove it later
    const messageHandler = async (event) => {
      console.log("Received message event:", event);
      if (event.data && event.data.payment === "success") {
        try {
          const token = localStorage.getItem("token");
          // Update the payment record to "Paid" for the specific booking
          const res = await axios.post(
            `${API_URL}/api/payment/${monthlyPayment._id}/record`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Payment record updated:", res.data);
          alert("Monthly Payment Complete!");
          // Refresh the booking details to reflect the updated payment status
          fetchBookingDetails();
        } catch (error) {
          console.error("Error recording monthly payment:", error);
          alert("Payment record update failed.");
        }
        window.removeEventListener("message", messageHandler);
      } else if (event.data && event.data.payment === "failure") {
        alert("Payment failed. Please try again.");
        window.removeEventListener("message", messageHandler);
      }
    };

    window.addEventListener("message", messageHandler);
  };

  // Identify the upcoming (first unpaid) monthly payment
  const upcomingPayment =
    paymentData && paymentData.paymentSchedule.find((p) => p.status === "Unpaid");

  // Identify future payments: all unpaid payments except the upcoming one
  const futurePayments =
    paymentData &&
    paymentData.paymentSchedule.filter(
      (p) => p.status === "Unpaid" && (!upcomingPayment || p._id !== upcomingPayment._id)
    );

  // -------------------------------
  // Styles for Booking Details Section (Adjusted for increased font and spacing)
  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  };

  const cellStyle = {
    flexBasis: "48%",
    display: "flex",
    alignItems: "center",
    fontSize: "18px", // Increased font size by 2px (e.g., 18px)
  };

  const iconStyle = {
    marginRight: "12px",
    width: "28px",
    height: "28px",
  };

  const textStyle = {
    textAlign: "left",
  };

  // -------------------------------
  // Styles for Section Titles (Booking Details & Payments)
  const mainTitleStyle = {
    fontSize: "34px",
    textAlign: "left",
    marginBottom: "16px",
  };

  // -------------------------------
  // Styles for Payment Section Titles (subtitles for Upcoming and Future Payments)
  const sectionTitleStyle = {
    fontSize: "24px",
    textAlign: "left",
    marginBottom: "8px",
  };

  // -------------------------------
  // Styles for Payment Cards (Upcoming Payment and Future Payments)
  const cardStyleBase = {
    borderRadius: "8px",
    padding: "12px",
    fontSize: "18px",
    minWidth: "220px",
    marginTop: "8px",
  };

  const upcomingCardStyle = {
    ...cardStyleBase,
    border: "2px solid #007bff",
    background: "#f0f8ff",
    cursor: "pointer",
  };

  const futureCardStyle = {
    ...cardStyleBase,
    border: "2px solid red",
    background: "#ffe6e6",
  };

  // Inside each card, the top row displays two fields (Stay Month and Stay Dates),
  // each preceded by the length-of-stay.png icon.
  const cardRowStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
  };

  const cardItemStyle = {
    flex: "1",
    display: "flex",
    alignItems: "center",
  };

  const cardIconStyle = {
    marginRight: "8px",
    width: "28px",
    height: "28px",
  };

  // -------------------------------
  if (loading) return <p>Loading...</p>;
  if (!booking || !paymentData) return <p>No active booking found.</p>;

  return (
    <>
      <UserHeader user={user} hideBookRoom={!!booking} />
      <div style={{ padding: "24px", marginTop: "80px" }}>
        {/* Booking Details Title */}
        <h2 style={mainTitleStyle}>My Booking Details</h2>

        {/* Booking Details: 5 rows, 2 columns */}
        <div style={{ marginBottom: "24px" }}>
          {/* Row 1: Building Block & Floor */}
          <div style={rowStyle}>
            <div style={cellStyle}>
              <img src="/images/building-block.png" alt="Building Block" style={iconStyle} />
              <span style={textStyle}>
                <strong>Building Block:</strong> {booking.buildingBlock}
              </span>
            </div>
            <div style={cellStyle}>
              <img src="/images/floor.png" alt="Floor" style={iconStyle} />
              <span style={textStyle}>
                <strong>Floor:</strong> {booking.floor}
              </span>
            </div>
          </div>
          {/* Row 2: Apartment Number & Room (Bed Space) */}
          <div style={rowStyle}>
            <div style={cellStyle}>
              <img src="/images/apartment.png" alt="Apartment" style={iconStyle} />
              <span style={textStyle}>
                <strong>Apartment:</strong> {booking.apartmentNumber}
              </span>
            </div>
            <div style={cellStyle}>
              <img src="/images/room.png" alt="Room" style={iconStyle} />
              <span style={textStyle}>
                <strong>Room:</strong> {booking.bedSpace}
              </span>
            </div>
          </div>
          {/* Row 3: Room Type & Bed (Bed Number) */}
          <div style={rowStyle}>
            <div style={cellStyle}>
              <img
                src={
                  booking.roomType.toLowerCase() === "ensuite"
                    ? "/images/ensuite.png"
                    : booking.roomType.toLowerCase() === "twin shared"
                    ? "/images/twin-shared.png"
                    : "/images/room-type.png"
                }
                alt="Room Type"
                style={iconStyle}
              />
              <span style={textStyle}>
                <strong>Room Type:</strong> {booking.roomType}
              </span>
            </div>
            <div style={cellStyle}>
              <img src="/images/bed.png" alt="Bed" style={iconStyle} />
              <span style={textStyle}>
                <strong>Bed:</strong> {booking.bedNumber}
              </span>
            </div>
          </div>
          {/* Row 4: Length of Stay & Status */}
          <div style={rowStyle}>
            <div style={cellStyle}>
              <img src="/images/length-of-stay.png" alt="Length of Stay" style={iconStyle} />
              <span style={textStyle}>
                <strong>Length of Stay:</strong> {booking.lengthOfStay}
              </span>
            </div>
            <div style={cellStyle}>
              <img src="/images/booked.png" alt="Status" style={iconStyle} />
              <span style={textStyle}>
                <strong>Status:</strong> {booking.status}
              </span>
            </div>
          </div>
          {/* Row 5: Check-In & Check-Out */}
          <div style={rowStyle}>
            <div style={cellStyle}>
              <img src="/images/check-in.png" alt="Check-In" style={iconStyle} />
              <span style={textStyle}>
                <strong>Check-In:</strong> {new Date(booking.checkInDate).toLocaleString()}
              </span>
            </div>
            <div style={cellStyle}>
              <img src="/images/check-out.png" alt="Check-Out" style={iconStyle} />
              <span style={textStyle}>
                <strong>Check-Out:</strong> {new Date(booking.checkOutDate).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Divider between Booking Details and Payments */}
        <hr style={{ marginBottom: "24px" }} />

        {/* Payment Section */}
        <h2 style={mainTitleStyle}>My Payments</h2>

        {/* Upcoming Payment Section */}
        {upcomingPayment && (
          <>
            <h4 style={sectionTitleStyle}>Upcoming Payment</h4>
            <div style={{ display: "flex", flexWrap: "wrap"}}>
            <div
              style={upcomingCardStyle}
              onClick={() => openMonthlyPaymentPopup(upcomingPayment)}
            >
              {/* Top Row: Two columns, each with its own length-of-stay icon and corresponding text */}
              <div style={cardRowStyle}>
                <div style={cardItemStyle}>
                  <img
                    src="/images/length-of-stay.png"
                    alt="Stay Month"
                    style={cardIconStyle}
                  />
                  <span>{upcomingPayment.stayMonth}</span>
                </div>
                <div style={cardItemStyle}>
                  <img
                    src="/images/length-of-stay.png"
                    alt="Stay Dates"
                    style={cardIconStyle}
                  />
                  <span>{upcomingPayment.stayDates}</span>
                </div>
              </div>
              {/* Bottom Row: Due and Amount */}
              <div style={cardRowStyle}>
                <div style={{ marginRight: "16px" }}>
                  <strong>Due:</strong> {moment(upcomingPayment.dueDate).format("DD MMM YYYY")}
                </div>
                <div>
                  <strong>Amount:</strong> €{upcomingPayment.amount}
                </div>
              </div>
            </div>
            </div>
            <p style={{ fontStyle: "italic", color: "#555", marginTop: "4px",display: "flex" }}>
                (Click to pay now)
              </p>
          </>
        )}

        {/* Future Payments Section */}
        {futurePayments && futurePayments.length > 0 && (
          <>
            <h4 style={{ ...sectionTitleStyle, marginTop: "24px" }}>Future Payments</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {futurePayments.map((payment) => (
                <div key={payment._id} style={futureCardStyle}>
                  <div style={cardRowStyle}>
                    <div style={cardItemStyle}>
                      <img
                        src="/images/length-of-stay.png"
                        alt="Stay Month"
                        style={cardIconStyle}
                      />
                      <span>{payment.stayMonth}</span>
                    </div>
                    <div style={cardItemStyle}>
                      <img
                        src="/images/length-of-stay.png"
                        alt="Stay Dates"
                        style={cardIconStyle}
                      />
                      <span>{payment.stayDates}</span>
                    </div>
                  </div>
                  <div style={cardRowStyle}>
                    <div style={{ marginRight: "16px" }}>
                      <strong>Due:</strong> {moment(payment.dueDate).format("DD MMM YYYY")}
                    </div>
                    <div>
                      <strong>Amount:</strong> €{payment.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Summary Boxes */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "24px" }}>
          <div style={summaryCardStyle}>
            <strong>Total Contract Amount</strong>
            <p>€{paymentData.totalAmount}</p>
          </div>
          <div style={summaryCardStyle}>
            <strong>Total Paid</strong>
            <p>€{paymentData.totalPaid || "0.00"}</p>
          </div>
          <div style={summaryCardStyle}>
            <strong>Total Unpaid</strong>
            <p>€{paymentData.totalUnpaid || paymentData.totalAmount}</p>
          </div>
        </div>

        {/* Payment Schedule Table */}
        <h3 style={{ fontSize: "24px", textAlign: "left", marginTop: "24px", marginBottom: "8px" }}>
          Payment Schedule
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ textAlign: "left", padding: "8px", fontSize: "18px" }}>Stay Month</th>
              <th style={{ textAlign: "left", padding: "8px", fontSize: "18px" }}>Stay Dates</th>
              <th style={{ textAlign: "left", padding: "8px", fontSize: "18px" }}>Payment Amount</th>
              <th style={{ textAlign: "left", padding: "8px", fontSize: "18px" }}>Payment Due Date</th>
              <th style={{ textAlign: "left", padding: "8px", fontSize: "18px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentData.paymentSchedule.map((p, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px", fontSize: "18px" }}>{p.stayMonth}</td>
                <td style={{ padding: "8px", fontSize: "18px" }}>{p.stayDates}</td>
                <td style={{ padding: "8px", fontSize: "18px" }}>
                  {p.amount ? `€${p.amount}` : "N/A"}
                </td>
                <td style={{ padding: "8px", fontSize: "18px" }}>
                  {moment(p.dueDate).format("DD MMM YYYY")}
                </td>
                <td style={{ padding: "8px", fontSize: "18px" }}>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
};

export default MyBookingDetails;
