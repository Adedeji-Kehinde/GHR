import React from "react";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

const CancellationPolicy = () => {
  // Outer container spans full width
  const containerStyle = {
    width: "100%",
    padding: "2rem",
    backgroundColor: "#fafafa",
    boxSizing: "border-box",
  };

  // Centered content wrapper for readability
  const contentStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "left",
    fontSize: "1rem",
    color: "#333",
    lineHeight: "1.6",
  };

  // Page header styling
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

  // Section title and paragraph styles
  const sectionTitleStyle = {
    fontSize: "1.25rem",
    marginTop: "1.5rem",
    marginBottom: "0.5rem",
    color: "#007BFF",
  };

  const paragraphStyle = {
    marginBottom: "1rem",
  };

  return (
    <>
      <UserHeader user={null} />
      {/* Push content below the fixed header */}
      <div style={{ marginTop: "120px" }}>
        <div style={containerStyle}>
          <div style={contentStyle}>
            <header style={headerStyle}>
              <h1 style={titleStyle}>Cancellation Policy</h1>
              <h2 style={subtitleStyle}>Understanding Your Options</h2>
              <p style={paragraphStyle}>
                At Griffith Halls of Residence, we understand that plans can change. Our cancellation policy is designed to provide flexibility while ensuring our operations remain sustainable.
              </p>
            </header>

            <section>
              <h3 style={sectionTitleStyle}>General Cancellation Policy</h3>
              <p style={paragraphStyle}>
                If you need to cancel your reservation, please do so as soon as possible. Cancellation requests made more than 14 days before your check‑in date will receive a full refund (minus a small administrative fee).
              </p>
            </section>

            <section>
              <h3 style={sectionTitleStyle}>Cancellation Fee</h3>
              <p style={paragraphStyle}>
                For cancellations made less than 14 days prior to check‑in, a cancellation fee of <strong>€150</strong> will apply. This fee covers costs associated with preparing the accommodation and helps us manage booking adjustments.
              </p>
            </section>

            <section>
              <h3 style={sectionTitleStyle}>Refund Process</h3>
              <p style={paragraphStyle}>
                Once your cancellation request is approved, any refund due (if applicable) will be processed within 7–10 business days. Refunds are issued to the original payment method used at the time of booking.
              </p>
            </section>

            <section>
              <h3 style={sectionTitleStyle}>How to Cancel</h3>
              <p style={paragraphStyle}>
                To cancel your reservation, please contact our reservations team via email at reservations@griffithrooms.ie or call our customer service line. We recommend including your booking reference number for prompt processing.
              </p>
            </section>

            <section>
              <h3 style={sectionTitleStyle}>Additional Conditions</h3>
              <p style={paragraphStyle}>
                If you fail to cancel within the required timeframe, your reservation may be considered a no‑show, and no refund will be issued. For group or corporate bookings, additional terms may apply.
              </p>
            </section>

            <section>
              <h3 style={sectionTitleStyle}>Contact Information</h3>
              <p style={paragraphStyle}>
                For any further questions regarding our cancellation policy, please visit our Contact Us page or contact our support team directly.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CancellationPolicy;
