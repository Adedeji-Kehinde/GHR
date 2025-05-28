import React from "react";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <>
      <UserHeader user={null} />
      <div className="privacy-page-wrapper">
        <div className="privacy-header">
          <div className="privacy-header-content">
            <h1>Privacy Policy</h1>
            <h2>Your Privacy Matters</h2>
            <p>
              Welcome to Griffith Halls of Residence (GHR). This Privacy Policy outlines how we collect, use, store, and protect your personal information when you access our website and services. Your privacy is paramount to us, and we are committed to safeguarding your data.
            </p>
          </div>
        </div>

        <div className="privacy-content">
          <div className="content-wrapper">
            <section className="policy-section legal-disclaimer">
              <h3 className="section-title">PRIVACY & LEGAL DISCLAIMER</h3>
              <p className="section-content">
                The information contained on this website is intended as a guide for persons seeking to stay at Griffith Rooms and shall not be deemed to constitute a contract or the terms thereof between the property and a tenant or any third party. The property reserves the right to cancel, suspend, or modify in any way the contents of this website.
              </p>
            </section>

            <section className="policy-section">
              <h3 className="section-title">Privacy Statement</h3>
              <p className="section-content">
                This is a statement of the practices of Griffith Rooms (the "property") in connection with the capture of personal data on this website (that is, all web pages within the domain griffithrooms.ie) and the steps taken by the property to respect your privacy. The property is not responsible for the content or privacy practices of other websites accessed through our website. It is the property's policy to clearly identify links to external websites, and it is your responsibility to ensure that you are satisfied with the privacy practices of those sites.
              </p>
            </section>

            <section className="policy-section">
              <h3 className="section-title">General Statement</h3>
              <p className="section-content">
                The property fully respects your right to privacy and actively seeks to preserve the privacy rights of those who share information with us. We will not collect any personal information about you on this website without your permission, except as may be required or permitted by law. Any personal information you volunteer will be treated with the highest standards of security and confidentiality in accordance with the General Data Protection Regulation (GDPR).
              </p>
            </section>

            <section className="policy-section">
              <h3 className="section-title">Collection and Use of Personal Information</h3>
              <p className="section-content">
                Any information you provide is not made available to third parties and is used solely for the purpose for which it was provided. This purpose is usually stated on the webpage where the information is requested, ensuring you know exactly how your data will be used. Your data will only be retained for as long as necessary.
              </p>
            </section>

            <section className="policy-section">
              <h3 className="section-title">Use of Third-Party Services</h3>
              <p className="section-content">
                The property uses HubSpot as its inbound marketing platform to more effectively manage applications and enquiries, providing you with more relevant information and a better service. Please note that HubSpot data is held outside of the EU. We have a model clauses agreement in place with HubSpot to ensure that your data is managed in compliance with EU data protection requirements. For more details, please refer to our Cookie Policy.
              </p>
            </section>

            <section className="policy-section">
              <h3 className="section-title">Your Rights</h3>
              <p className="section-content">
                You have the right to access, update, or delete your personal data at any time. If you have any questions about our data practices or wish to exercise your rights, please contact us.
              </p>
            </section>

            <section className="policy-section">
              <h3 className="section-title">Changes to This Privacy Policy</h3>
              <p className="section-content">
                We may update this Privacy Policy periodically. Any changes will be posted on this page along with an updated revision date. We encourage you to review this policy regularly to stay informed about our practices.
              </p>
            </section>

            <section className="policy-section">
              <h3 className="section-title">Contact Us</h3>
              <p className="section-content">
                If you have any questions or concerns regarding this Privacy Policy, please visit our Contact Us page or reach out directly to our support team.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
