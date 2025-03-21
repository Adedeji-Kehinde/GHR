import React from "react";
import { useNavigate } from "react-router-dom";

const tabStyle = {
  display: "flex",
  alignItems: "center",
  padding: "1rem",
  cursor: "pointer",
};

const containerStyle = {
  position: "fixed",
  top: "70px", // below the header (header height)
  left: 0,
  width: "80px",
  height: "calc(100% - 70px)",
  backgroundColor: "#f5f5f5",
  borderRight: "1px solid #ddd",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1rem",
  paddingTop: "1rem",
};

const dashboardIcon = "/images/dashboard.png";
const maintenanceIcon = "/images/maintenance.png";
const enquiriesIcon = "/images/enquiries.png";
const deliveriesIcon = "/images/deliveries.png";
const bookingsIcon = "/images/bookings.png";
const contactIcon = "/images/contact.png";
const testimonialsIcon = "/images/testimonials.png";
const createAdminIcon = "/images/create-admin.png";

const AdminTabs = () => {
  const navigate = useNavigate();
  return (
    <div style={containerStyle}>
      <div style={tabStyle} onClick={() => navigate("/admin-dashboard")}>
        <img src={dashboardIcon} alt="Dashboard" style={{ height: "40px" }} title="Dashboard" />
      </div>
      <div style={tabStyle} onClick={() => navigate("/maintenance")}>
        <img src={maintenanceIcon} alt="Maintenance" style={{ height: "40px" }} title="Maintenance" />
      </div>
      <div style={tabStyle} onClick={() => navigate("/enquiries")}>
        <img src={enquiriesIcon} alt="Enquiries" style={{ height: "40px" }} title="Enquiries" />
      </div>
      <div style={tabStyle} onClick={() => navigate("/deliveries")}>
        <img src={deliveriesIcon} alt="Deliveries" style={{ height: "40px" }} title="Deliveries" />
      </div>
      <div style={tabStyle} onClick={() => navigate("/booking-management")}>
        <img src={bookingsIcon} alt="Bookings" style={{ height: "40px" }} title="Bookings" />
      </div>
      <div style={tabStyle} onClick={() => navigate("/contactus-management")}>
        <img src={contactIcon} alt="Contact Us" style={{ height: "40px" }} title="Contact Us" />
      </div>
      <div style={tabStyle} onClick={() => navigate("/testimonials-management")}>
        <img src={testimonialsIcon} alt="Testimonials" style={{ height: "40px" }} title="Testimonials" />
      </div>
      <div style={tabStyle} onClick={() => navigate("/create-admin")}>
        <img src={createAdminIcon} alt="Create Admin" style={{ height: "40px" }} title="Create Admin" />
      </div>
    </div>
  );
};

export default AdminTabs;
