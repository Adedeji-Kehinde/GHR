import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css"; 
import Loading from "../components/Loading";
const MyBookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking: initialBooking } = location.state || {};

  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(initialBooking);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!booking || !booking._id) {
        throw new Error("No booking id found.");
      }
      const res = await axios.get(`${API_URL}/api/booking/bookings/${booking._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooking(res.data.booking);
      const payments = res.data.payments || [];
      setPaymentData({
        paymentSchedule: payments,
        totalAmount: payments.reduce((acc, p) => acc + p.amount, 0).toFixed(2),
        totalPaid: payments.filter((p) => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0).toFixed(2),
        totalUnpaid: payments.filter((p) => p.status === "Unpaid").reduce((sum, p) => sum + p.amount, 0).toFixed(2),
      });
    } catch (error) {
      console.error("Error fetching booking:", error);
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

    const fetchUser = async () => {
      try {
        const userRes = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
    AOS.init({ duration: 1000 });
  }, [navigate, API_URL]);

  const openMonthlyPaymentPopup = (monthlyPayment) => {
    const popup = window.open(
      `${API_URL}/payment?amount=${monthlyPayment.amount}&paymentId=${monthlyPayment._id}`,
      "Payment",
      "width=500,height=500"
    );

    const messageHandler = async (event) => {
      if (event.data && event.data.payment === "success") {
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            `${API_URL}/api/payment/${monthlyPayment._id}/record`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert("Payment successful!");
          fetchBookingDetails();
        } catch (error) {
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


  if (!booking || !paymentData) return <Loading icon="/images/logo.png" text="Loading Your booking details..." />;
  const upcomingPayment = paymentData.paymentSchedule.find((p) => p.status === "Unpaid");
  const futurePayments = paymentData.paymentSchedule.filter(
    (p) => p.status === "Unpaid" && (!upcomingPayment || p._id !== upcomingPayment._id)
  );

  return (
    <>
      <UserHeader user={user} hideBookRoom={!!booking} />
      <div className="my-booking-details-wrapper">
        
        {/* Booking Details Section */}
        <h2 className="main-section-title" data-aos="fade-down">My Booking Details</h2>
        <div className="booking-details-grid" data-aos="fade-up">
          <div className="booking-detail-item" data-aos="fade-right">
            <img src="/images/building-block.png" alt="Building" className="booking-detail-icon" />
            <span><strong>Building Block:</strong> {booking.buildingBlock}</span>
          </div>
          <div className="booking-detail-item" data-aos="fade-right">
            <img src="/images/floor.png" alt="Floor" className="booking-detail-icon" />
            <span><strong>Floor:</strong> {booking.floor}</span>
          </div>
          <div className="booking-detail-item" data-aos="fade-right">
            <img src="/images/apartment.png" alt="Apartment" className="booking-detail-icon" />
            <span><strong>Apartment:</strong> {booking.apartmentNumber}</span>
          </div>
          <div className="booking-detail-item" data-aos="fade-right">
            <img src="/images/room.png" alt="Room" className="booking-detail-icon" />
            <span><strong>Room:</strong> {booking.bedSpace}</span>
          </div>
          <div className="booking-detail-item" data-aos="fade-right">
            <img src="/images/length-of-stay.png" alt="Length" className="booking-detail-icon" />
            <span><strong>Length of Stay:</strong> {booking.lengthOfStay}</span>
          </div>
          <div className="booking-detail-item" data-aos="fade-right">
            <img src="/images/booked.png" alt="Status" className="booking-detail-icon" />
            <span><strong>Status:</strong> {booking.status}</span>
          </div>
          <div className="booking-detail-item" data-aos="fade-right">
            <img src="/images/check-in.png" alt="CheckIn" className="booking-detail-icon" />
            <span><strong>Check-In:</strong> {new Date(booking.checkInDate).toLocaleString()}</span>
          </div>
          <div className="booking-detail-item" data-aos="fade-right">
            <img src="/images/check-out.png" alt="CheckOut" className="booking-detail-icon" />
            <span><strong>Check-Out:</strong> {new Date(booking.checkOutDate).toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Section */}
        <h2 className="main-section-title" data-aos="fade-left">My Payments</h2>

        {/* Upcoming Payment */}
        {upcomingPayment && (
          <>
            <h3 className="sub-section-title" data-aos="fade-left">Upcoming Payment </h3>
            <div className="payment-cards-container" data-aos="flip-left">
              <div
                className="payment-card upcoming-payment"
                onClick={() => openMonthlyPaymentPopup(upcomingPayment)}
              >
                <p><strong>Stay Month:</strong> {upcomingPayment.stayMonth}</p>
                <p><strong>Dates:</strong> {upcomingPayment.stayDates}</p>
                <p><strong>Due:</strong> {moment(upcomingPayment.dueDate).format("DD MMM YYYY")}</p>
                <p><strong>Amount:</strong> €{upcomingPayment.amount}</p>
              </div>
            </div>
            <p data-aos="zoom-out" style={{ fontStyle: "italic", color: "#777", marginTop: "0.5rem" }}>
              (Click card to pay)
            </p>
          </>
        )}

        {/* Future Payments */}
        {futurePayments.length > 0 && (
          <>
            <h3 className="sub-section-title" data-aos="fade-left">Future Payments</h3>
            <div className="payment-cards-container" data-aos="zoom-in">
              {futurePayments.map((p) => (
                <div key={p._id} className="payment-card future-payment">
                  <p><strong>Stay Month:</strong> {p.stayMonth}</p>
                  <p><strong>Dates:</strong> {p.stayDates}</p>
                  <p><strong>Due:</strong> {moment(p.dueDate).format("DD MMM YYYY")}</p>
                  <p><strong>Amount:</strong> €{p.amount}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Summary */}
        <div className="summary-cards" data-aos="fade-down">
          <div className="summary-card"data-aos="flip-right">
            <strong>Total Contract Amount</strong>
            <p>€{paymentData.totalAmount}</p>
          </div>
          <div className="summary-card" data-aos="flip-right">
            <strong>Total Paid</strong>
            <p>€{paymentData.totalPaid}</p>
          </div>
          <div className="summary-card" data-aos="flip-right">
            <strong>Total Unpaid</strong>
            <p>€{paymentData.totalUnpaid}</p>
          </div>
        </div>

        {/* Payment Schedule */}
        <h3 className="sub-section-title"  data-aos="fade-up" style={{ marginTop: "2rem" }}>Payment Schedule</h3>
        <table className="payment-schedule-table" data-aos="zoom-out">
          <thead data-aos="flip-right">
            <tr data-aos="zoom-out" >
              <th>Stay Month</th>
              <th>Dates</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentData.paymentSchedule.map((p) => (
              <tr key={p._id}>
                <td data-aos="flip-right">{p.stayMonth}</td>
                <td data-aos="flip-left">{p.stayDates}</td>
                <td data-aos="flip-right">€{p.amount}</td>
                <td data-aos="flip-left">{moment(p.dueDate).format("DD MMM YYYY")}</td>
                <td data-aos="flip-right">{p.status}</td>
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
