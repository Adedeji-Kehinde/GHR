import React from "react";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import "./FAQs.css";

const FAQs = () => {
  // FAQ data
  const beforeStayFaqs = [
    {
      question: "How do I make a reservation?",
      answer: "Reservations can be made online through our website or by calling our reservations team directly.",
    },
    {
      question: "What documents do I need to provide?",
      answer: "Typically, you will need to provide proof of identity and enrollment details. Check our booking page for specifics.",
    },
    {
      question: "Can I choose my room type?",
      answer: "Yes, you can select your preferred room type during the booking process, subject to availability.",
    },
    {
      question: "Are there any discounts for early bookings?",
      answer: "Occasionally, we offer early booking discounts. Please check our promotions page or contact our team for current offers.",
    },
    {
      question: "What is the cancellation policy before my stay?",
      answer: "Our cancellation policy is clearly outlined on our website. Generally, cancellations made more than 14 days before check‑in receive a full refund (minus an administrative fee).",
    },
  ];

  const duringStayFaqs = [
    {
      question: "What services are available on-site?",
      answer: "Our accommodation offers 24-hour security, maintenance, an on-site restaurant (Urban Square), laundry services, and free high-speed Wi-Fi throughout the campus.",
    },
    {
      question: "How do I report an issue during my stay?",
      answer: "Simply contact our front desk or use our online support system available on our website.",
    },
    {
      question: "Is Wi-Fi available in all areas?",
      answer: "Yes, free high-speed Wi-Fi is available throughout the entire property.",
    },
    {
      question: "What dining options are available on campus?",
      answer: "Apart from our on-site restaurant Urban Square, there are multiple cafes and food outlets in the surrounding area for diverse culinary choices.",
    },
    {
      question: "How can I contact the maintenance team?",
      answer: "Maintenance can be contacted directly via the front desk or through our online support portal on the website.",
    },
  ];

  const afterStayFaqs = [
    {
      question: "How do I get my deposit back?",
      answer: "After your departure and a successful inspection of the apartment, your deposit will be refunded, subject to any applicable deductions.",
    },
    {
      question: "Can I leave feedback about my stay?",
      answer: "Absolutely. We welcome your feedback! Please use our online review system or contact our support team.",
    },
    {
      question: "What if I lose something during my stay?",
      answer: "In case of any lost items, please visit our Lost & Found desk or contact the front desk immediately.",
    },
    {
      question: "Will I receive a copy of my final bill?",
      answer: "Yes, a detailed final bill will be emailed to you after your stay, outlining all charges and any refunds due.",
    },
    {
      question: "How can I update my booking details after reservation?",
      answer: "For any changes or updates to your booking, please contact our customer service team as soon as possible.",
    },
  ];

  const renderFaqs = (faqs) => {
    return faqs.map((faq, index) => (
      <div key={index} className="qa-container">
        <div className="question">{faq.question}</div>
        <div className="answer">{faq.answer}</div>
      </div>
    ));
  };

  return (
    <>
      <UserHeader user={null} />
      <div className="faqs-page-wrapper">
        <div className="faqs-header">
          <div className="faqs-header-content">
            <h1>Frequently Asked Questions</h1>
          </div>
        </div>

        <div className="faqs-content">
          <div className="content-wrapper">
            <section className="faq-section">
              <h2 className="section-header">Before Your Stay</h2>
              {renderFaqs(beforeStayFaqs)}
            </section>

            <section className="faq-section">
              <h2 className="section-header">During Your Stay</h2>
              {renderFaqs(duringStayFaqs)}
            </section>

            <section className="faq-section">
              <h2 className="section-header">After Your Stay</h2>
              {renderFaqs(afterStayFaqs)}
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQs;
