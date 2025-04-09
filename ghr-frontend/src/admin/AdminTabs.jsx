import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const baseTabStyle = {
  display: "flex",
  alignItems: "center",
  padding: "0.5rem 0.5rem",
  cursor: "pointer",
};

const containerCollapsedStyle = {
  position: "fixed",
  top: "70px", // below the header
  left: 0,
  width: "60px", // smaller width when collapsed
  height: "calc(100% - 70px)",
  backgroundColor: "#f5f5f5",
  borderRight: "1px solid #ddd",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  overflowY: "auto",
  transition: "width 0.3s ease",
};

const containerExpandedStyle = {
  ...containerCollapsedStyle,
  width: "200px", // wider when expanded to show text
  alignItems: "flex-start",
  paddingLeft: "1rem",
};

const iconStyle = {
  height: "40px", 
  marginBottom: "0.5rem",
};

const iconStyleExpanded = {
  height: "50px",
  marginRight: "1rem",
};

const tabsData = [
  { route: "/admin-dashboard", icon: "/images/dashboard.png", title: "Dashboard" },
  { route: "/maintenance", icon: "/images/maintenance.png", title: "Maintenance" },
  { route: "/enquiries", icon: "/images/enquiries.png", title: "Enquiries" },
  { route: "/deliveries", icon: "/images/deliveries.png", title: "Deliveries" },
  { route: "/booking-management", icon: "/images/bookings.png", title: "Bookings" },
  { route: "/contactus-management", icon: "/images/contact.png", title: "Contact Us" },
  { route: "/testimonials-management", icon: "/images/testimonials.png", title: "Testimonials" },
  { route: "/manage-admin", icon: "/images/manageadmin.png", title: "Manage Admin" },
  { route: "/announcement", icon: "/images/announcement.png", title: "Announcements" },
];

const AdminTabs = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={expanded ? containerExpandedStyle : containerCollapsedStyle}>
      {/* Toggle Button using text labels */}
      <div
        style={{
          ...baseTabStyle,
          alignSelf: "stretch",
          justifyContent: "center",
          borderBottom: "1px solid #ddd",
          padding: "0.5rem",
          fontSize: "0.9rem",
          fontWeight: "bold",
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? "Minimise" : "Expand"}
      </div>

      {tabsData.map((tab) => (
        <div
          key={tab.route}
          style={{
            ...baseTabStyle,
            width: "100%",
            justifyContent: expanded ? "flex-start" : "center",
            padding: expanded ? "0.5rem 1rem" : "0.5rem 0",
          }}
          onClick={() => navigate(tab.route)}
        >
          <img
            src={tab.icon}
            alt={tab.title}
            style={expanded ? iconStyleExpanded : iconStyle}
            title={tab.title}
          />
          {expanded && <span style={{ fontSize: "1rem", color: "#333" }}>{tab.title}</span>}
        </div>
      ))}
    </div>
  );
};

export default AdminTabs;
