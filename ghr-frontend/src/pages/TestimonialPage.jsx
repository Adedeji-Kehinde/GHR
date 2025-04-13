import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

const Testimonials = () => {
  // User authentication state (for header display and pre-filling the form)
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();
  const API_URL =import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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

  // Testimonials fetching state
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/testimonials`);
        setTestimonials(response.data);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoadingTestimonials(false);
      }
    };
    fetchTestimonials();
  }, [API_URL]);

  // Control display of the submission form
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  // Testimonial submission form state (note the added rating field)
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    message: "",
    rating: 0,
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);

  // Pre-fill the form name if the user is logged in
  useEffect(() => {
    if (user && user.name) {
      setTestimonialForm((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const handleFormChange = (e) => {
    setTestimonialForm({
      ...testimonialForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle rating selection by setting the rating in the form state
  const handleRatingSelect = (ratingValue) => {
    setTestimonialForm({
      ...testimonialForm,
      rating: ratingValue,
    });
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/testimonials`,
        testimonialForm,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Testimonial submitted:", response.data);
      setSubmissionStatus("success");
      // Re-fetch testimonials to include the new submission
      const updatedTestimonials = await axios.get(`${API_URL}/api/auth/testimonials`);
      setTestimonials(updatedTestimonials.data);
      // Clear the testimonial form (pre-fill name if available)
      setTestimonialForm({ name: user?.name || "", message: "", rating: 0 });
      // Hide the form after submission
      setShowSubmissionForm(false);
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      setSubmissionStatus("error");
    }
  };

  // Styles
  const containerStyle = {
    marginTop: "80px", // offset for fixed header
    padding: "2rem",
    minHeight: "calc(100vh - 80px - 100px)", // adjust for header and footer heights
  };

  const sectionTitleStyle = {
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

  const testimonialCardStyle = {
    backgroundColor: "#f8f8f8",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const testimonialHeaderStyle = {
    fontWeight: "bold",
    marginBottom: "0.5rem",
  };

  const testimonialContentStyle = {
    fontStyle: "italic",
    marginBottom: "0.5rem",
  };

  const testimonialDateStyle = {
    fontSize: "0.8rem",
    color: "#555",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    marginTop: "1rem",
    marginBottom: "2rem",
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
    marginRight: "1rem",
  };

  const funTextStyle = {
    fontSize: "1.1rem",
    marginTop: "2rem",
    textAlign: "center",
    color: "#333",
  };

  const clickableTextStyle = {
    color: "#007BFF",
    textDecoration: "underline",
    cursor: "pointer",
    marginLeft: "0.25rem",
  };

  // Only display testimonials that are approved
  const approvedTestimonials = testimonials.filter(
    (testimonial) => testimonial.approved === true
  );

  return (
    <>
      <UserHeader  />
      <div style={containerStyle}>
        <h1 style={sectionTitleStyle}>Testimonials</h1>
        <hr style={titleDividerStyle} />

        {/* Display Approved Testimonials */}
        {loadingTestimonials ? (
          <p>Loading testimonials...</p>
        ) : approvedTestimonials.length > 0 ? (
          approvedTestimonials.map((testimonial, index) => (
            <div key={index} style={testimonialCardStyle}>
              <div style={testimonialHeaderStyle}>{testimonial.name}</div>
              <div style={testimonialContentStyle}>{testimonial.message}</div>
              <div style={testimonialDateStyle}>
                {new Date(testimonial.date).toLocaleDateString()}
              </div>
              {/* Optionally display the rating */}
              {testimonial.rating && (
                <div style={{ marginTop: "0.5rem" }}>
                  Rating:{" "}
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      style={{
                        color: testimonial.rating > i ? "#FFD700" : "#ccc",
                        fontSize: "1.2rem",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No testimonials available at this time.</p>
        )}

        {/* Fun invitation text or the Submission Form */}
        {!showSubmissionForm ? (
          <p style={funTextStyle}>
            Wow, these testimonials are amazing! If you have a story to share,
            <span
              style={clickableTextStyle}
              onClick={() => setShowSubmissionForm(true)}
            >
              click here to add your testimonial.
            </span>
          </p>
        ) : (
          <>
            <h2 style={{ ...sectionTitleStyle, fontSize: "1.25rem" }}>
              Submit Your Testimonial
            </h2>
            <form onSubmit={handleTestimonialSubmit} style={formStyle}>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={testimonialForm.name}
                onChange={handleFormChange}
                style={inputStyle}
                required
              />

              <label htmlFor="message">Testimonial:</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={testimonialForm.message}
                onChange={handleFormChange}
                style={inputStyle}
                required
              />

              <label htmlFor="rating">Rating:</label>
              <div style={{ marginBottom: "1rem" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleRatingSelect(star)}
                    style={{
                      fontSize: "1.5rem",
                      color: testimonialForm.rating >= star ? "#FFD700" : "#ccc",
                      cursor: "pointer",
                      marginRight: "0.25rem",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div>
                <button type="submit" style={buttonStyle}>
                  Submit
                </button>
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#ccc",
                    color: "#000",
                  }}
                  onClick={() => setShowSubmissionForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
            {submissionStatus === "success" && (
              <p style={{ color: "green", marginBottom: "1rem" }}>
                Your testimonial has been submitted successfully and is pending approval.
              </p>
            )}
            {submissionStatus === "error" && (
              <p style={{ color: "red", marginBottom: "1rem" }}>
                There was an error submitting your testimonial. Please try again later.
              </p>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Testimonials;
