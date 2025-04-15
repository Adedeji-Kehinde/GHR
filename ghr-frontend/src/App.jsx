import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateAdmin from "./admin/CreateAdmin";
import UserProfilePage from "./pages/UserProfilePage";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import TestimonialPage from "./pages/TestimonialPage";
import TestimonialsManagement from "./admin/TestimonialManagement";
import LifeAtGHR from "./pages/LifeAtGHR";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CancellationPolicy from "./pages/CancellationPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import FAQs from "./pages/FAQs";
import ContactUs from "./pages/ContactUs";
import ContactUsManagement from "./admin/ContactUsManagement";
import ContactUsDetails from "./admin/ContactUsDetails";
import MyBookingDetails from "./pages/MyBookingDetails";
import Booking from "./pages/Booking";
import SelectBed from "./pages/SelectBed";
import AdminDashboard from "./admin/AdminDashboard";
import Deliveries from "./admin/Deliveries";
import AddDelivery from "./admin/AddDelivery";
import Enquiry from "./admin/Enquiry";
import EnquiryDetails from "./admin/EnquiryDetails";
import Maintenance from "./admin/Maintenace";
import MaintenanceDetailsPage from "./admin/MaintenanceDetails";
import AddMaintenance from "./admin/AddMaintenance";
import BookingManagement from "./admin/BookingManagement";
import BookingDetails from "./admin/BookingDetails";
import MainPage from "./pages/MainPage";
import AnnouncementManagement from "./admin/Announcement";
import AddAnnouncement from "./admin/AddAnnouncement";
import AnnouncementDetails from "./admin/AnnouncementDetails";
import ManageAdmin from "./admin/ManageAdmin";
import AdminDetailsPage from "./admin/AdminDetails";


import "./App.css";
import "./styles.css";
import "./login.css";
import "./Register.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-admin" element={<CreateAdmin />} />
        <Route path="/manage-admin" element={<ManageAdmin />} />
        <Route path="/admin/details" element={<AdminDetailsPage />} />
        <Route path="/user-profile" element={<UserProfilePage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/testimonials" element={<TestimonialPage />} />
        <Route path="/testimonials-management" element={<TestimonialsManagement />} />
        <Route path="/life-ghr" element={<LifeAtGHR />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/contactus-management" element={<ContactUsManagement />} />
        <Route path="/contactus-details" element={<ContactUsDetails />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/my-booking-details" element={<MyBookingDetails />} />
        <Route path="/selectBed" element={<SelectBed />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/booking-management" element={<BookingManagement />} />
        <Route path="/booking-details" element={<BookingDetails />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/add-delivery" element={<AddDelivery />} />
        <Route path="/enquiries" element={<Enquiry />} />
        <Route path="/enquiry-details" element={<EnquiryDetails />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/maintenance-details" element={<MaintenanceDetailsPage />} />
        <Route path="/add-maintenance" element={<AddMaintenance />} />
        <Route path="/announcement" element={<AnnouncementManagement />} />
        <Route path="/add-announcement" element={<AddAnnouncement />} />
        <Route path="/announcement-details" element={<AnnouncementDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
