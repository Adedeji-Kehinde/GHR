import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer style={{
      width: "100vw",
      background: "#fff",
      color: "#222",
      borderTop: "1px solid #eee",
      boxSizing: "border-box",
      padding: 0,
      marginTop: 40,
      left: 0,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2rem 1rem 1rem 1rem",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "2rem",
        borderBottom: "none"
      }}>
        {/* Left Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <button
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: "24px",
              background: "#007bff",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              transition: "background 0.2s",
              minWidth: 120,
              maxWidth: 180,
              whiteSpace: "nowrap"
            }}
            onClick={() => navigate("/contact-us")}
            onMouseOver={e => e.currentTarget.style.background = '#0056b3'}
            onMouseOut={e => e.currentTarget.style.background = '#007bff'}
          >
            Contact Us
          </button>
          {["instagram", "snapchat", "linkedin", "github"].map((icon, i) => (
            <img
              key={icon}
              src={`/images/${icon}.png`}
              alt={icon.charAt(0).toUpperCase() + icon.slice(1)}
              style={{
                height: 36,
                width: 36,
                objectFit: "cover",
                cursor: "pointer",
                filter: "none",
                transition: "filter 0.2s, transform 0.2s",
                marginLeft: i === 0 ? 12 : 0
              }}
              onClick={() => {
                const urls = {
                  instagram: "https://instagram.com",
                  snapchat: "https://snapchat.com",
                  linkedin: "https://www.linkedin.com/in/adedeji-abdulraheem/",
                  github: "https://github.com/Adedeji-Kehinde"
                };
                window.open(urls[icon], "_blank");
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.12)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            />
          ))}
        </div>
        {/* Right Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <img
            src="/images/logo.png"
            alt="Logo"
            style={{
              height: 70,
              width: 70,
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: "2px solid #eee"
            }}
            onClick={() => navigate("/")}
          />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
            <p style={{ fontSize: 15, color: "#222", margin: 0, fontWeight: 500 }}>
              © {new Date().getFullYear()} GHR Website. All rights reserved.
            </p>
            <p
              style={{ fontSize: 15, color: "#007bff", margin: 0, cursor: "pointer", fontWeight: 500 }}
              onClick={() => navigate("/about")}
              onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
            >
              About Us
            </p>
            <p style={{ fontSize: 14, color: "#888", margin: 0 }}>Innovate. Inspire. Impact.</p>
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", color: "#bbb", fontSize: 13, padding: "0.5rem 0 1rem 0" }}>
        Built with ❤️ by GHR Team
      </div>
    </footer>
  );
};

export default Footer;
