import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

const ContactUs = () => {
  // User authentication state (for header display)
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
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
          // Optionally, you might clear the token or navigate to login
        } finally {
          setLoadingUser(false);
        }
      };
      fetchUser();
    } else {
      setLoadingUser(false);
    }
  }, [API_URL]);

  // Form state for contact submission
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submissionStatus, setSubmissionStatus] = useState(null); // null, 'success', or 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Post the form data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/contactus`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Message posted:", response.data);
      setSubmissionStatus("success");
      // Optionally, display a success message or redirect the user
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

  // Layout styles
  const containerStyle = {
    marginTop: "80px", // avoid overlap with fixed header
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    minHeight: "calc(100vh - 80px - 100px)", // adjust for header and footer heights
    padding: "2rem",
  };

  const leftSectionStyle = {
    flex: 3,
    paddingRight: "2rem",
    borderRight: "2px solid #ddd", // vertical divider
  };

  const rightSectionStyle = {
    flex: 1,
    paddingLeft: "2rem",
  };

  const titleStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  };

  const titleDividerStyle = {
    border: "none",
    borderBottom: "1px solid #ddd",
    marginBottom: "1rem",
    width: "100%",
  };

  const infoGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr", // two columns
    gridGap: "20px",
  };

  const boxStyle = {
    backgroundColor: "#f8f8f8",
    width: "200px",
    height: "200px",
    padding: "1rem",
    textAlign: "center",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  };

  const iconStyle = {
    width: "40px",
    height: "40px",
    marginBottom: "0.5rem",
  };

  const infoTextStyle = {
    fontSize: "0.9rem",
    color: "#555",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    marginTop: "1rem",
  };

  const inputStyle = {
    padding: "0.5rem",
    marginBottom: "1rem",
    fontSize: "1rem",
  };

  const buttonStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  };

  return (
    <>
      <UserHeader user={user} />
      <div style={containerStyle}>
        {/* Left Section: Info Boxes */}
        <div style={leftSectionStyle}>
          <h1 style={titleStyle}>Get More Info</h1>
          <hr style={titleDividerStyle} />
          <div style={infoGridStyle}>
            {/* Phone Number Box */}
            <div style={boxStyle}>
              <img src="/images/phone.png" alt="Phone" style={iconStyle} />
              <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                Phone Number
              </div>
              <div style={infoTextStyle}>+353899666753</div>
            </div>
            {/* Email Box */}
            <div style={boxStyle}>
              <img src="/images/email.png" alt="Email" style={iconStyle} />
              <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                Email
              </div>
              <div style={infoTextStyle}>contact@ghrwebsite.com</div>
            </div>
            {/* Location Box */}
            <div style={boxStyle}>
              <img src="/images/location.png" alt="Location" style={iconStyle} />
              <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                Location
              </div>
              <div style={infoTextStyle}>
                Griffith halls of residence,
                <br />
                South Circular Road,
                <br />
                Dublin 8, Dublin, Ireland
              </div>
            </div>
            {/* Working Hours Box */}
            <div style={boxStyle}>
              <img src="/images/clock.png" alt="Working Hours" style={iconStyle} />
              <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                Working Hours
              </div>
              <div style={infoTextStyle}>
                Monday - Friday 9-5
                <br />
                Break: 1-2pm each day
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Contact Form */}
        <div style={rightSectionStyle}>
          <h1 style={titleStyle}>Contact Us</h1>
          <hr style={titleDividerStyle} />
          <form onSubmit={handleSubmit} style={formStyle}>
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <label htmlFor="phone">Phone Number:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <button type="submit" style={buttonStyle}>
              Submit
            </button>
          </form>
          {submissionStatus === "success" && (
            <p style={{ color: "green", marginTop: "1rem" }}>
              Your message has been sent successfully.
            </p>
          )}
          {submissionStatus === "error" && (
            <p style={{ color: "red", marginTop: "1rem" }}>
              There was an error sending your message. Please try again later.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs;
