import React from "react";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

const PrivacyPolicy = () => {
  // Container for the main privacy policy content
  const containerStyle = {
    width: "100%",
    padding: "2rem",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
  };

  // Content wrapper to center text (if desired)
  const contentWrapperStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "left",
    fontSize: "1rem",
    color: "#333",
    lineHeight: "1.6",
  };

  // Header style for the policy page
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

  // Section title style
  const sectionTitleStyle = {
    fontSize: "1.25rem",
    marginTop: "1.5rem",
    marginBottom: "0.5rem",
    color: "#007BFF",
  };

  // Paragraph style
  const paragraphStyle = {
    marginBottom: "1rem",
  };

  return (
    <>
      <UserHeader user={null} />
      {/* Push content below fixed header */}
      <div style={{ marginTop: "120px" }}>
        <div style={containerStyle}>
          <div style={contentWrapperStyle}>
            <header style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h1 style={titleStyle}>Privacy Policy</h1>
              <h2 style={subtitleStyle}>Your Privacy Matters</h2>
              <p style={paragraphStyle}>
                Welcome to Griffith Halls of Residence (GHR). This Privacy Policy outlines how we collect, use, store, and protect your personal information when you access our website and services. Your privacy is paramount to us, and we are committed to safeguarding your data.
              </p>
            </header>

            <section>
              <h3 style={sectionTitleStyle}>PRIVACY & LEGAL DISCLAIMER</h3>
              <p style={paragraphStyle}>
                The information contained on this website is intended as a guide for persons seeking to stay at Griffith Rooms and shall not be deemed to constitute a contract or the terms thereof between the property and a tenant or any third party. The property reserves the right to cancel, suspend, or modify in any way the contents of this website.
              </p>
            </section>

            <section>
              <h3 style={sectionTitleStyle}>Privacy Statement</h3>
              <p style={paragraphStyle}>
                This is a statement of the practices of Griffith Rooms (the "property") in connection with the capture of personal data on this website (that is, all web pages within the domain griffithrooms.ie) and the steps taken by the property to respect your privacy. The property is not responsible for the content or privacy practices of other websites accessed through our website. It is the property’s policy to clearly identify links to external websites, and it is your responsibility to ensure that you are satisfied with the privacy practices of those sites.
              </p>
            </section>

            <section>
              <h3 style={sectionTitleStyle}>General Statement</h3>
              <p style={paragraphStyle}>
                The property fully respects your right to privacy and actively seeks to preserve the privacy rights of those who share information with us. We will not collect any personal information about you on this website without your permission, except as may be required or permitted by law. Any personal information you volunteer will be treated with the highest standards of security and confidentiality in accordance with the General Data Protection Regulation (GDPR).
              </p>
            </section>

            <section>
              <h3 style={sectionTitleStyle}>Collection and Use of Personal Information</h3>
              <p style={paragraphStyle}>
                Any information you provide is not made available to third parties and is used solely for the purpose for which it was provided. This purpose is usually stated on the webpage where the information is requested, ensuring you know exactly how your data will be used. Your data will only be retained for as long as necessary.
              </p>
            </section>

            <section>
              <h3 style={sectionTitleStyle}>Use of Third-Party Services</h3>
              <p style={paragraphStyle}>
                The property uses HubSpot as its inbound marketing platform to more effectively manage applications and enquiries, providing you with more relevant information and a better service. Please note that HubSpot data is held outside of the EU. We have a model clauses agreement in place with HubSpot to ensure that your data is managed in compliance with EU data protection requirements. For more details, please refer to our Cookie Policy.
              </p>
            </section>

            <section>
              <h3 style={sectionTitleStyle}>Your Rights</h3>
              <p style={paragraphStyle}>
                You have the right to access, update, or delete your personal data at any time. If you have any questions about our data practices or wish to exercise your rights, please contact us.
              </p>
            </section>

            <section>
              <h3 style={sectionTitleStyle}>Changes to This Privacy Policy</h3>
              <p style={paragraphStyle}>
                We may update this Privacy Policy periodically. Any changes will be posted on this page along with an updated revision date. We encourage you to review this policy regularly to stay informed about our practices.
              </p>
            </section>

            <section>
              <h3 style={sectionTitleStyle}>Contact Us</h3>
              <p style={paragraphStyle}>
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
