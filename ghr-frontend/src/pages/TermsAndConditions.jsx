import React, { useState } from "react";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

const TermsAndConditions = () => {
  // Inline Accordion component for this page (darker style)
  const Accordion = ({ title, children }) => {
    const [open, setOpen] = useState(false);
    const toggleOpen = () => setOpen(!open);

    const containerStyle = {
      border: "1px solid #ccc",
      borderRadius: "4px",
      marginBottom: "1rem",
      overflow: "hidden",
    };

    const headerStyle = {
      backgroundColor: "#333",
      color: "#fff",
      padding: "1rem",
      fontSize: "1.1rem",
      cursor: "pointer",
    };

    const contentStyle = {
      padding: "1rem",
      backgroundColor: "#f9f9f9",
      display: open ? "block" : "none",
    };

    return (
      <div style={containerStyle}>
        <div style={headerStyle} onClick={toggleOpen}>
          {title}
        </div>
        <div style={contentStyle}>{children}</div>
      </div>
    );
  };

  // Styles for the page layout
  const outerContainerStyle = {
    width: "100%",
    padding: "2rem",
    backgroundColor: "#fafafa",
    boxSizing: "border-box",
  };

  const contentStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "left",
    fontSize: "1rem",
    color: "#333",
    lineHeight: "1.6",
  };

  const pageHeaderStyle = {
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

  const paragraphStyle = {
    marginBottom: "1rem",
  };

  return (
    <>
      <UserHeader user={null} />
      {/* Add top margin to push content below the fixed header */}
      <div style={{ marginTop: "120px" }}>
        <div style={outerContainerStyle}>
          <div style={contentStyle}>
            <header style={pageHeaderStyle}>
              <h1 style={titleStyle}>Terms & Conditions</h1>
              <h2 style={subtitleStyle}>Please Read Carefully</h2>
              <p style={paragraphStyle}>
                These Terms and Conditions govern your use of our website and services.
                By accessing or using our website, you agree to these terms. They may be updated at any time without prior notice.
              </p>
            </header>
            <Accordion title="General Terms & Legal Disclaimer">
              <p style={paragraphStyle}>
                These terms may change at any time without notice. Please consult our website for the most up-to-date amendments.
                While we strive for accuracy, Griffith Halls of Residence is not responsible for unintentional errors.
                Reservations with incorrect or fraudulent details are null and void.
              </p>
            </Accordion>
            <Accordion title="Facilities/Services Included in the Price">
              <p style={paragraphStyle}>
                All apartments are fully furnished with a kitchen equipped with appliances, cutlery, crockery, and utensils.
                Basic toiletries are provided, and prices include bed linen and towels. No items may be removed.
              </p>
            </Accordion>
            <Accordion title="Check-in and Check-out Requirements">
              <p style={paragraphStyle}>
                Apartments are available from 14:00 on arrival and must be vacated by 12:00 Noon on departure unless otherwise arranged.
                Late check-outs incur surcharges or require an additional night’s charge.
              </p>
            </Accordion>
            <Accordion title="Rates and VAT">
              <p style={paragraphStyle}>
                Rates include VAT at the prevailing rate. Advertised rates are subject to change at the property’s discretion.
              </p>
            </Accordion>
            <Accordion title="Accessible Rooms">
              <p style={paragraphStyle}>
                Limited accessible guest rooms are available. Please contact the front desk in advance if accessible accommodation is needed.
              </p>
            </Accordion>
            <Accordion title="Pets, Smoking & Candle Policies">
              <p style={paragraphStyle}>
                No pets are allowed except service dogs. All apartments are non-smoking. A fee of €1000 may be applied if smoking is detected.
                The use of candles or naked flames is prohibited.
              </p>
            </Accordion>
            <Accordion title="Access, Safety & Child Policy">
              <p style={paragraphStyle}>
                Management may access apartments for inspections or maintenance. Guests under 18 must be accompanied by an adult, and those under 14 must be supervised at all times.
              </p>
            </Accordion>
            <Accordion title="Property Use & Quiet Hours">
              <p style={paragraphStyle}>
                Guests must maintain respectful behavior and adhere to quiet hours from 23:00 to 07:00. The property reserves the right to terminate a stay without refund if terms are breached.
              </p>
            </Accordion>
            <Accordion title="Damage, Theft & Liability">
              <p style={paragraphStyle}>
                Guests are liable for any damage, loss, or theft during their stay. Griffith Rooms may charge your card for costs incurred.
              </p>
            </Accordion>
            <Accordion title="Fire Safety, Car Park & Security">
              <p style={paragraphStyle}>
                The property is equipped with fire detection systems and emergency evacuation plans.
                Car park access is provided without warranty for vehicle safety, and a 24-hour security team is on site.
              </p>
            </Accordion>
            <Accordion title="Booking & Third-Party Sources">
              <p style={paragraphStyle}>
                If your reserved room is unavailable upon arrival, we reserve the right to relocate you to another room or to a comparable alternative.
                For bookings through third parties, please contact your provider directly.
              </p>
            </Accordion>
            <Accordion title="Additional Information">
              <p style={paragraphStyle}>
                These Terms and Conditions are governed by applicable law. By using our website, you agree to these terms.
                For questions, please contact our support team.
              </p>
            </Accordion>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsAndConditions;
