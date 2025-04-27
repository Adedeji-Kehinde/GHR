import React, { useEffect } from "react";
import UserHeader from "./UserHeader";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const MainPage = () => {
  const navigate = useNavigate();


  useEffect(() => {
    // Save original styles
    const originalRootStyles = {
      margin: document.getElementById("root").style.margin,
      padding: document.getElementById("root").style.padding,
      textAlign: document.getElementById("root").style.textAlign,
    };

    // Override for MainPage
    document.getElementById("root").style.margin = "0";
    document.getElementById("root").style.padding = "0";
    document.getElementById("root").style.textAlign = "initial";

    AOS.init({
      duration: 1000, // 1 second animation
    });

    // Cleanup: restore when leaving the page
    return () => {
      document.getElementById("root").style.margin = originalRootStyles.margin;
      document.getElementById("root").style.padding = originalRootStyles.padding;
      document.getElementById("root").style.textAlign = originalRootStyles.textAlign;
    };
  }, []);
  return (
    <>
      {/* Header */}
      <UserHeader />

      {/* Main Content */}
      <div className= "main-page-wrapper" style={{ marginTop: "80px" }}>
        {/* Hero Section */}
        <section 
          style={{
            position: "relative",
            height: "calc(100vh - 80px)",
            overflow: "hidden",
          }}
        >
          {/* Video background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              top: 0,
              left: 0,
              zIndex: 0,
            }}
          >
            <source src="/images/ghr-hero-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Overlay content */}
          <div style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            color: "#fff",
            padding: "2rem",
          }}>
            <h1>Welcome to Griffith Halls</h1>
            <p>Comfortable. Affordable. Unforgettable.</p>
            <button
              onClick={() => navigate("/booking")}
              style={{
                marginTop: "1rem",
                padding: "12px 24px",
                backgroundColor: "red",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "1rem",
                width: "auto", 
                maxWidth: "250px", 
                textAlign: "center",
                alignSelf: "center",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#a30000"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "red"}
            >
              Book Your Room
            </button>

          </div>
        </section>


        {/* About Section */}
        <section style={{
          padding: "4rem 2rem",
          textAlign: "center",
        }}
        data-aos="fade-up"
        >
          <h2>About GHR</h2>
          <p style={{ maxWidth: "800px", margin: "1rem auto", fontSize: "1.1rem"}}>
            At Griffith Halls, we offer more than accommodation — we offer a community. 
            Affordable, safe, and located in the heart of the city, our halls are perfect 
            for students and professionals alike. Come experience the best of campus living.
          </p>
        </section>

        {/* Our Rooms Section */}
        <section data-aos="zoom-in" className="rooms-section">
          <h2>Our Rooms</h2>
          <div className="room-cards">
            <div className="room-card">
              <img src="/images/ensuite.jpg" alt="Ensuite Room" />
              <h3>Ensuite Rooms</h3>
              <p>Private bathroom, cozy comfort, modern living space.</p>
            </div>
            <div className="room-card">
              <img src="/images/twin.jpg" alt="Twin Shared Room" />
              <h3>Twin Shared Rooms</h3>
              <p>Spacious shared rooms, perfect for students on a budget.</p>
            </div>
          </div>
        </section>

        {/* Amenities Section */}
        <section data-aos="fade-up" className="amenities-section">
          <h2>Amenities</h2>
          <div className="amenities-grid">
            {[
              { icon: "/images/wifi.png", label: "Free WiFi" },
              { icon: "/images/security.png", label: "24/7 Security" },
              { icon: "/images/laundry.png", label: "Laundry Services" },
              { icon: "/images/study.png", label: "Study Rooms" },
              { icon: "/images/kitchen.png", label: "Common Kitchens" },
            ].map((item, index) => (
              <div key={index}  className="amenity-card" data-aos="zoom-in">
                <img src={item.icon} alt={item.label} className="amenity-icon" />
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section style={{
          padding: "4rem 2rem",
          backgroundColor: "#f9f9f9",
          textAlign: "center",
        }}
        data-aos="fade-left"
        >
          <h2>What Our Residents Say</h2>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2rem",
            marginTop: "2rem",
          }}>
            {[
              "GHR made my university experience unforgettable! - Sarah",
              "Comfortable rooms and great community! - Daniel",
              "Affordable and close to everything. Love it! - Aisha",
            ].map((testimonial, idx) => (
              <div key={idx} className="testimonial-card" data-aos="fade-up">
                <p style={{ fontSize: "0.95rem", color: "#555" }}>{testimonial}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate("/testimonials")}
            style={{
              marginTop: "1rem",
              padding: "12px 24px",
              backgroundColor: "red",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
              width: "auto", 
              maxWidth: "250px", 
              textAlign: "center",
              alignSelf: "center",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#a30000"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "red"}
          >
            See Testimonials
          </button>
        </section>

        {/* CTA Banner */}
        <section data-aos="fade-up" style={{
          padding: "4rem 2rem",
          textAlign: "center",
        }}>
          <h2>Ready to move in?</h2>
          <p>Find your new home at Griffith Halls today.</p>
          <button 
            onClick={() => navigate("/register")}
            style={{
              marginTop: "1rem",
              padding: "12px 24px",
              backgroundColor: "red",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "1rem",
              width: "auto", 
              maxWidth: "250px", 
              textAlign: "center",
              alignSelf: "center",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#a30000"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "red"}
          >
            Get Started
          </button>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default MainPage;
