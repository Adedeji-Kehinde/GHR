import React from "react";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

const LifeAtGHR = () => {
  // Container for the main content
  const containerStyle = {
    width: "100%",
    padding: "2rem",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "2rem",
  };

  const titleStyle = {
    fontSize: "2.5rem",
    margin: "0.5rem 0",
  };

  const subtitleStyle = {
    fontSize: "1.5rem",
    margin: "0.5rem 0",
    color: "#555",
  };

  const descriptionStyle = {
    fontSize: "1rem",
    color: "#555",
    margin: "0 auto",
    maxWidth: "800px",
  };

  // Grid style for category boxes
  const gridStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "2rem",
    justifyContent: "center",
    marginTop: "2rem",
  };

  const boxStyle = {
    flex: "1 1 300px",
    maxWidth: "350px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const boxTitleStyle = {
    fontSize: "1.25rem",
    marginBottom: "0.75rem",
    color: "#007BFF",
  };

  const boxTextStyle = {
    fontSize: "1rem",
    lineHeight: "1.5",
    color: "#333",
  };

  return (
    <>
      <UserHeader user={null} />
      {/* Ensure content starts below the fixed header */}
      <div style={{ marginTop: "120px" }}>
        <div style={containerStyle}>
          <header style={headerStyle}>
            <h1 style={titleStyle}>Life @ GHR</h1>
            <h2 style={subtitleStyle}>Experience the Excitement & Diversity</h2>
            <p style={descriptionStyle}>
              Life at Griffith Halls of Residence (GHR) is an ever-changing adventure where no two days or people are the same. We’re here to make your experience as enjoyable as possible – offering you a taste of what makes our halls tick, what you can expect, and why you should join our vibrant community.
            </p>
          </header>

          <section style={gridStyle}>
            <div style={boxStyle}>
              <h3 style={boxTitleStyle}>Vibrant Events & Activities</h3>
              <p style={boxTextStyle}>
                From lively social gatherings, themed parties, cultural nights, and sports events to academic workshops and study groups, there’s always something happening at GHR. Our events are designed to help you connect, explore new interests, and create lasting memories.
              </p>
            </div>
            <div style={boxStyle}>
              <h3 style={boxTitleStyle}>Urban Square Restaurant</h3>
              <p style={boxTextStyle}>
                Enjoy a culinary experience right on campus at Urban Square, our on‑site restaurant. Whether you’re grabbing a quick snack between classes or enjoying a leisurely dinner with friends, Urban Square offers a variety of delicious options in a welcoming atmosphere.
              </p>
            </div>
            <div style={boxStyle}>
              <h3 style={boxTitleStyle}>Settling In & Resources</h3>
              <p style={boxTextStyle}>
                We know starting a new chapter can be overwhelming. That’s why we provide helpful PDFs and guides covering everything from local area insights to practical tips for living on campus. These resources ensure you have all the support you need to settle in smoothly.
              </p>
            </div>
            <div style={boxStyle}>
              <h3 style={boxTitleStyle}>A Global Community</h3>
              <p style={boxTextStyle}>
                Our halls are home to students from institutions all over Dublin and from around the world. At GHR, you’ll find an inclusive, diverse community that celebrates different cultures and backgrounds, offering endless opportunities to learn, share, and grow together.
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LifeAtGHR;
