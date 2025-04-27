import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

const ContactUs = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // Fetch user details if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/auth/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user:", error);
        } finally {
          setLoadingUser(false);
        }
      };
      fetchUser();
    } else {
      setLoadingUser(false);
    }
  }, [API_URL]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/auth/contactus`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      setSubmissionStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Error posting message:", error);
      setSubmissionStatus("error");
    }
  };

  // Animate Info Cards on Scroll
  useEffect(() => {
    const cards = document.querySelectorAll(".contact-info-box");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.3 });

    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  return (
    <>
      <UserHeader user={user}  hideBookRoom/>
      
      <div className="contact-page-wrapper">
        {/* Left Side - Info */}
        <div className="contact-info-section">
          <h1>Get More Info</h1>
          <div className="contact-divider"></div>
          <div className="contact-info-grid">
            {/* Phone */}
            <div className="contact-info-box">
              <img src="/images/phone.png" alt="Phone" />
              <div className="contact-info-title">Phone Number</div>
              <div className="contact-info-text">+353899666753</div>
            </div>
            {/* Email */}
            <div className="contact-info-box">
              <img src="/images/email.png" alt="Email" />
              <div className="contact-info-title">Email</div>
              <div className="contact-info-text">contact@ghrwebsite.com</div>
            </div>
            {/* Location */}
            <div className="contact-info-box">
              <img src="/images/location.png" alt="Location" />
              <div className="contact-info-title">Location</div>
              <div className="contact-info-text">
                Griffith Halls of Residence,<br />
                South Circular Road, Dublin 8, Ireland
              </div>
            </div>
            {/* Working Hours */}
            <div className="contact-info-box">
              <img src="/images/clock.png" alt="Working Hours" />
              <div className="contact-info-title">Working Hours</div>
              <div className="contact-info-text">
                Monday - Friday 9AM - 5PM<br />
                Break: 1PM - 2PM
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Contact Form */}
        <div className="contact-form-section">
          <h1>Contact Us</h1>
          <div className="contact-divider"></div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />

            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="phone">Phone Number:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit">Submit</button>
          </form>

          {submissionStatus === "success" && (
            <p className="contact-success">Your message has been sent successfully!</p>
          )}
          {submissionStatus === "error" && (
            <p className="contact-error">There was an error sending your message. Please try again later.</p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactUs;
