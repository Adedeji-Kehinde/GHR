import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const outerFooterStyle = {
    position: "relative",
    left: "50%",
    marginLeft: "-50vw",
    width: "100vw",
    backgroundColor: "#f8f8f8",
    borderTop: "1px solid #ddd",
    boxSizing: "border-box",
  };

  const innerFooterStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1.5rem 1rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "2rem",
  };

  const leftSectionStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const contactButtonStyle = {
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const socialIconStyle = {
    height: "30px",
    width: "30px",
    objectFit: "cover",
    cursor: "pointer",
  };

  const rightSectionStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  };

  const footerLogoStyle = {
    height: "70px",
    width: "70px",
    borderRadius: "50%",
    objectFit: "cover",
    cursor: "pointer",
  };

  const footerTextContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.5rem",
  };

  const footerLineStyle = {
    fontSize: "0.85rem",
    color: "#555",
    margin: 0,
    lineHeight: "1.2",
  };

  // Keyframe animation for slight fade (optional, you can comment this out if you don't want)
  const keyframesStyle = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;

  return (
    <>
      <style>{keyframesStyle}</style>

      <footer style={outerFooterStyle}>
        <div style={innerFooterStyle}>
          {/* Left Section */}
          <div style={leftSectionStyle}>
            <button
              style={contactButtonStyle}
              onClick={() => navigate("/contact-us")}
            >
              Contact Us
            </button>
            <img
              src="/images/instagram.png"
              alt="Instagram"
              style={socialIconStyle}
              onClick={() => window.open("https://instagram.com", "_blank")}
            />
            <img
              src="/images/snapchat.png"
              alt="Snapchat"
              style={socialIconStyle}
              onClick={() => window.open("https://snapchat.com", "_blank")}
            />
            <img
              src="/images/linkedin.png"
              alt="LinkedIn"
              style={socialIconStyle}
              onClick={() =>
                window.open(
                  "https://www.linkedin.com/in/adedeji-abdulraheem/",
                  "_blank"
                )
              }
            />
            <img
              src="/images/github.png"
              alt="GitHub"
              style={socialIconStyle}
              onClick={() =>
                window.open("https://github.com/Adedeji-Kehinde", "_blank")
              }
            />
          </div>

          {/* Right Section */}
          <div style={rightSectionStyle}>
            <img
              src="/images/logo.png"
              alt="Logo"
              style={footerLogoStyle}
              onClick={() => navigate("/")}
            />
            <div style={footerTextContainerStyle}>
              <p style={footerLineStyle}>
                © {new Date().getFullYear()} GHR Website. All rights reserved.
              </p>
              <p
                style={{ ...footerLineStyle, cursor: "pointer" }}
                onClick={() => navigate("/about")}
              >
                About Us
              </p>
              <p style={footerLineStyle}>Innovate. Inspire. Impact.</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
