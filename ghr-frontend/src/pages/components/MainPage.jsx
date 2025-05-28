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
          <h2 style={{ textAlign: "center" }}>About GHR</h2>
          <p style={{ maxWidth: "800px", margin: "1rem auto", fontSize: "1.1rem"}}>
            At Griffith Halls, we offer more than accommodation — we offer a community. 
            Affordable, safe, and located in the heart of the city, our halls are perfect 
            for students and professionals alike. Come experience the best of campus living.
          </p>
        </section>

        {/* Our Rooms Section */}
        <section data-aos="zoom-in" className="rooms-section">
          <h2 style={{ textAlign: "center" }}>Our Rooms</h2>
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
          <h2 style={{ textAlign: "center" }}>Amenities</h2>
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
          <h2 style={{ textAlign: "center" }}>What Our Residents Say</h2>
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
          <h2 style={{ textAlign: "center" }}>Ready to move in?</h2>
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

        {/* Mobile App Download Section */}
        <section 
          data-aos="fade-up" 
          style={{
            padding: "4rem 2rem",
            backgroundColor: "#f8f9fa",
            textAlign: "center",
            borderTop: "1px solid #eee",
            borderBottom: "1px solid #eee",
          }}
        >
          <div style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem"
          }}>
            <div style={{ maxWidth: "600px" }}>
              <h2 style={{ 
                marginBottom: "1rem",
                color: "#2c3e50"
              }}>
                Get the GHR Mobile App
              </h2>
              <p style={{
                fontSize: "1.1rem",
                color: "#666",
                marginBottom: "2rem"
              }}>
                Access your accommodation details, make payments, and manage your stay right from your phone.
              </p>
              
              <a 
                href="/downloads/ghr-app.apk"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  marginBottom: "2rem",
                  transition: "background-color 0.3s ease"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#4CAF50"}
              >
                Download Android App
              </a>
              
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
                flexWrap: "wrap"
              }}>
                <a 
                  href="/downloads/GHR_apk.apk" 
                  download
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "12px 24px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#0056b3";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#007bff";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                  }}
                >
                  <img 
                    src="/images/android-icon.png" 
                    alt="Android Icon" 
                    style={{
                      width: "24px",
                      height: "24px"
                    }}
                  />
                  Download for Android
                </a>
              </div>

              <p style={{
                fontSize: "0.9rem",
                color: "#888",
                marginTop: "1rem"
              }}>
                Version 1.0.0 • Requires Android 6.0 and up
              </p>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "1rem"
            }}>
              <div className="mobile-app-images">
                <img 
                  src="/images/app.png" 
                  alt="GHR Mobile App Screen 1" 
                  style={{
                    maxWidth: "200px",
                    width: "100%",
                    height: "auto",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    border: "8px solid #333",
                    backgroundColor: "#333"
                  }}
                />
                <img 
                  src="/images/app1.png" 
                  alt="GHR Mobile App Screen 2" 
                  style={{
                    maxWidth: "200px",
                    width: "100%",
                    height: "auto",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    border: "8px solid #333",
                    backgroundColor: "#333"
                  }}
                />
                <img 
                  src="/images/app2.png" 
                  alt="GHR Mobile App Screen 3" 
                  style={{
                    maxWidth: "200px",
                    width: "100%",
                    height: "auto",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    border: "8px solid #333",
                    backgroundColor: "#333"
                  }}
                />
                <img 
                  src="/images/app3.png" 
                  alt="GHR Mobile App Screen 4" 
                  style={{
                    maxWidth: "200px",
                    width: "100%",
                    height: "auto",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    border: "8px solid #333",
                    backgroundColor: "#333"
                  }}
                />
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default MainPage;
