import React from "react";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import "./CancellationPolicy.css";

const CancellationPolicy = () => {
  return (
    <>
      <UserHeader user={null} />
      <div className="cancellation-page-wrapper">
        <div className="cancellation-header">
          <div className="cancellation-header-content">
            <h1>Cancellation Policy</h1>
            <h2>Understanding Your Options</h2>
            <p>
              At Griffith Halls of Residence, we understand that plans can change. Our cancellation policy is designed to provide flexibility while ensuring our operations remain sustainable.
            </p>
          </div>
        </div>

        <div className="cancellation-content">
          <div className="content-wrapper">
            <section className="policy-section">
              <h3 className="section-title">General Cancellation Policy</h3>
              <p className="section-content">
                If you need to cancel your reservation, please do so as soon as possible. Cancellation requests made more than 14 days before your check‑in date will receive a full refund (minus a small administrative fee).
              </p>
            </section>

            <section className="policy-section">
              <h3 className="section-title">Cancellation Fee</h3>
              <p className="section-content">
                For cancellations made less than 14 days prior to check‑in, a cancellation fee of <strong>€150</strong> will apply. This fee covers costs associated with preparing the accommodation and helps us manage booking adjustments.
              </p>
            </section>

            <section className="policy-section">
              <h3 className="section-title">Refund Process</h3>
              <p className="section-content">
                Once your cancellation request is approved, any refund due (if applicable) will be processed within 7–10 business days. Refunds are issued to the original payment method used at the time of booking.
              </p>
            </section>

            <section className="policy-section">
              <h3 className="section-title">How to Cancel</h3>
              <p className="section-content">
                To cancel your reservation, please contact our reservations team via email at reservations@griffithrooms.ie or call our customer service line. We recommend including your booking reference number for prompt processing.
              </p>
            </section>

            <section className="policy-section">
              <h3 className="section-title">Additional Conditions</h3>
              <p className="section-content">
                If you fail to cancel within the required timeframe, your reservation may be considered a no‑show, and no refund will be issued. For group or corporate bookings, additional terms may apply.
              </p>
            </section>

            <section className="policy-section contact-section">
              <h3 className="section-title">Contact Information</h3>
              <p className="section-content">
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
