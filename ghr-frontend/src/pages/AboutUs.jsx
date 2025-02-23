import React from "react";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

const AboutUs = () => {
  // Full-width container for the About Us content
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
  };

  // Grid style for category boxes
  const gridStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "2rem",
    justifyContent: "center",
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
            <h1 style={titleStyle}>Griffith Halls of Residence (GHR)</h1>
            <h2 style={subtitleStyle}>Stay in the Heart of the City</h2>
            <p style={descriptionStyle}>
              City centre-adjacent accommodation available now!
            </p>
          </header>
          <section style={gridStyle}>
            <div style={boxStyle}>
              <h3 style={boxTitleStyle}>Prime Location & Accessibility</h3>
              <p style={boxTextStyle}>
                Nestled in Dublin 8, our accommodation is just a few minutes’ walk
                south of Dublin’s bustling centre. Enjoy a 20-minute stroll to St.
                Stephen’s Green, 25 minutes to Trinity College, and 30 minutes to
                O’Connell Street. Multiple bus routes connect you effortlessly to
                every corner of the city.
              </p>
            </div>
            <div style={boxStyle}>
              <h3 style={boxTitleStyle}>Modern Accommodation & Amenities</h3>
              <p style={boxTextStyle}>
                GHR features two twin blocks with 170 beautifully designed apartments.
                Each apartment is thoughtfully arranged with a seating area, dining
                area, and a fully equipped kitchen featuring a microwave, fridge, oven,
                stovetop, kettle, and toaster. Options include two or three bedrooms –
                perfect for families or groups.
              </p>
            </div>
            <div style={boxStyle}>
              <h3 style={boxTitleStyle}>Exceptional Services & Security</h3>
              <p style={boxTextStyle}>
                Our dedicated full-time accommodation and maintenance teams work from
                9am to 8:30pm (Monday to Friday) and 9am to 5:30pm (weekends), with a
                24/7 security team ensuring your safety at all times. We pride ourselves
                on providing a first-class experience to every guest.
              </p>
            </div>
            <div style={boxStyle}>
              <h3 style={boxTitleStyle}>Experience GHR</h3>
              <p style={boxTextStyle}>
                At GHR, our apartments blend historical charm with modern comfort.
                Designed to reflect the campus’s heritage, our spaces offer comfortable
                living enhanced by quality service. Our many return guests are a testament
                to the outstanding experience we deliver.
              </p>
            </div>
          </section>
        </div>
      </div>
      {/* Footer rendered after all content; it fills the full viewport width */}
      <Footer />
    </>
  );
};

export default AboutUs;
