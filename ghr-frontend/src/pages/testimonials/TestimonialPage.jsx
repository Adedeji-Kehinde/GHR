import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import "./TestimonialPage.css";

const Testimonials = () => {
  // User authentication state (for header display and pre-filling the form)
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();
  const API_URL =import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

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

  // Only display testimonials that are approved
  const approvedTestimonials = testimonials.filter(
    (testimonial) => testimonial.approved === true
  );

  return (
    <>
      <UserHeader user={null} />
      <div className="testimonials-page-wrapper">
        <div className="testimonials-header">
          <div className="testimonials-header-content">
            <h1>What Our Residents Say</h1>
            <h2>Real Stories from Our Community</h2>
            <p>Discover authentic experiences shared by residents who call GHR their home</p>
          </div>
        </div>

        <div className="testimonials-content">
          <div className="content-wrapper">
            {loadingTestimonials ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading testimonials...</p>
              </div>
            ) : (
              <div className="testimonials-grid">
                {approvedTestimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="testimonial-card"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="testimonial-header">
                      <div className="avatar">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{testimonial.name}</div>
                        <div className="date">
                          {new Date(testimonial.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="rating">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`star ${i < testimonial.rating ? 'filled' : 'empty'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="message">{testimonial.message}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              className="add-button"
              onClick={() => setShowSubmissionForm(true)}
              title="Add your testimonial"
            >
              +
            </button>

            {showSubmissionForm && (
              <div className="form-overlay">
                <div className="form-container">
                  <div className="form-title-row">
                    <h2 className="form-title">Share Your Experience</h2>
                    <button
                      className="close-button"
                      onClick={() => setShowSubmissionForm(false)}
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleTestimonialSubmit}>
                    <input
                      type="text"
                      name="name"
                      value={testimonialForm.name}
                      onChange={handleFormChange}
                      placeholder="Your Name"
                      className="form-input"
                      required
                    />
                    <div className="rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() => handleRatingSelect(star)}
                          className={`star ${star <= testimonialForm.rating ? 'filled' : 'empty'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <textarea
                      name="message"
                      value={testimonialForm.message}
                      onChange={handleFormChange}
                      placeholder="Share your experience..."
                      className="form-textarea"
                      required
                    />
                    <button type="submit" className="submit-button">
                      Submit Testimonial
                    </button>
                  </form>
                  {submissionStatus === "success" && (
                    <p className="success-message">
                      Thank you! Your testimonial has been submitted for review.
                    </p>
                  )}
                  {submissionStatus === "error" && (
                    <p className="error-message">
                      Oops! Something went wrong. Please try again.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Testimonials;
