import React from "react";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <>
      <UserHeader user={null} />
      <div className="about-page-wrapper">
        <div className="about-header">
          <div className="about-header-content">
            <h1>Griffith Halls of Residence (GHR)</h1>
            <h2>Stay in the Heart of the City</h2>
            <p>
              City centre-adjacent accommodation available now!
            </p>
          </div>
        </div>

        <div className="about-content">
          <div className="content-wrapper">
            <div className="grid-container">
              <div className="info-box">
                <h3>Prime Location & Accessibility</h3>
                <p>
                  Nestled in Dublin 8, our accommodation is just a few minutes' walk
                  south of Dublin's bustling centre. Enjoy a 20-minute stroll to St.
                  Stephen's Green, 25 minutes to Trinity College, and 30 minutes to
                  O'Connell Street. Multiple bus routes connect you effortlessly to
                  every corner of the city.
                </p>
              </div>
              <div className="info-box">
                <h3>Modern Accommodation & Amenities</h3>
                <p>
                  GHR features two twin blocks with 170 beautifully designed apartments.
                  Each apartment is thoughtfully arranged with a seating area, dining
                  area, and a fully equipped kitchen featuring a microwave, fridge, oven,
                  stovetop, kettle, and toaster. Options include two or three bedrooms –
                  perfect for families or groups.
                </p>
              </div>
              <div className="info-box">
                <h3>Exceptional Services & Security</h3>
                <p>
                  Our dedicated full-time accommodation and maintenance teams work from
                  9am to 8:30pm (Monday to Friday) and 9am to 5:30pm (weekends), with a
                  24/7 security team ensuring your safety at all times. We pride ourselves
                  on providing a first-class experience to every guest.
                </p>
              </div>
              <div className="info-box">
                <h3>Experience GHR</h3>
                <p>
                  At GHR, our apartments blend historical charm with modern comfort.
                  Designed to reflect the campus's heritage, our spaces offer comfortable
                  living enhanced by quality service. Our many return guests are a testament
                  to the outstanding experience we deliver.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;
