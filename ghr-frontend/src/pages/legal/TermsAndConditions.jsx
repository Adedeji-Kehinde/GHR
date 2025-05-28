import React, { useState } from "react";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import "./TermsAndConditions.css";

const TermsAndConditions = () => {
  // Improved Accordion component
  const Accordion = ({ title, children, isLegalDisclaimer }) => {
    const [open, setOpen] = useState(false);
    const toggleOpen = () => setOpen(!open);

    return (
      <div className={`accordion-item ${isLegalDisclaimer ? 'legal-disclaimer' : ''}`}>
        <div className="accordion-header" onClick={toggleOpen}>
          {title}
          <span className={`accordion-icon ${open ? 'open' : ''}`}>▼</span>
        </div>
        {open && (
          <div className="accordion-content">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <UserHeader user={null} />
      <div className="terms-page-wrapper">
        <div className="terms-header">
          <div className="terms-header-content">
            <h1>Terms & Conditions</h1>
            <h2>Please Read Carefully</h2>
            <p>
              These Terms and Conditions govern your use of our website and services.
              By accessing or using our website, you agree to these terms. They may be updated at any time without prior notice.
            </p>
          </div>
        </div>

        <div className="terms-content">
          <div className="content-wrapper">
            <Accordion title="General Terms & Legal Disclaimer" isLegalDisclaimer={true}>
              <p>
                These terms may change at any time without notice. Please consult our website for the most up-to-date amendments.
                While we strive for accuracy, Griffith Halls of Residence is not responsible for unintentional errors.
                Reservations with incorrect or fraudulent details are null and void.
              </p>
            </Accordion>

            <Accordion title="Facilities/Services Included in the Price">
              <p>
                All apartments are fully furnished with a kitchen equipped with appliances, cutlery, crockery, and utensils.
                Basic toiletries are provided, and prices include bed linen and towels. No items may be removed.
              </p>
            </Accordion>

            <Accordion title="Check-in and Check-out Requirements">
              <p>
                Apartments are available from 14:00 on arrival and must be vacated by 12:00 Noon on departure unless otherwise arranged.
                Late check-outs incur surcharges or require an additional night's charge.
              </p>
            </Accordion>

            <Accordion title="Rates and VAT">
              <p>
                Rates include VAT at the prevailing rate. Advertised rates are subject to change at the property's discretion.
              </p>
            </Accordion>

            <Accordion title="Accessible Rooms">
              <p>
                Limited accessible guest rooms are available. Please contact the front desk in advance if accessible accommodation is needed.
              </p>
            </Accordion>

            <Accordion title="Pets, Smoking & Candle Policies">
              <p>
                No pets are allowed except service dogs. All apartments are non-smoking. A fee of €1000 may be applied if smoking is detected.
                The use of candles or naked flames is prohibited.
              </p>
            </Accordion>

            <Accordion title="Access, Safety & Child Policy">
              <p>
                Management may access apartments for inspections or maintenance. Guests under 18 must be accompanied by an adult, and those under 14 must be supervised at all times.
              </p>
            </Accordion>

            <Accordion title="Property Use & Quiet Hours">
              <p>
                Guests must maintain respectful behavior and adhere to quiet hours from 23:00 to 07:00. The property reserves the right to terminate a stay without refund if terms are breached.
              </p>
            </Accordion>

            <Accordion title="Damage, Theft & Liability">
              <p>
                Guests are liable for any damage, loss, or theft during their stay. Griffith Rooms may charge your card for costs incurred.
              </p>
            </Accordion>

            <Accordion title="Fire Safety, Car Park & Security">
              <p>
                The property is equipped with fire detection systems and emergency evacuation plans.
                Car park access is provided without warranty for vehicle safety, and a 24-hour security team is on site.
              </p>
            </Accordion>

            <Accordion title="Booking & Third-Party Sources">
              <p>
                If your reserved room is unavailable upon arrival, we reserve the right to relocate you to another room or to a comparable alternative.
                For bookings through third parties, please contact your provider directly.
              </p>
            </Accordion>

            <Accordion title="Additional Information">
              <p>
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
