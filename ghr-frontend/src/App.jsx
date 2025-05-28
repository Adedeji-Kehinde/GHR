import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CreateAdmin from "./admin/auth/CreateAdmin";
import ManageAdmin from "./admin/auth/ManageAdmin";
import AdminDetailsPage from "./admin/auth/AdminDetails";

// User Pages
import UserProfilePage from "./pages/profile/UserProfilePage";
import Home from "./pages/components/Home";
import AboutUs from "./pages/about/AboutUs";
import TestimonialPage from "./pages/testimonials/TestimonialPage";
import LifeAtGHR from "./pages/about/LifeAtGHR";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import CancellationPolicy from "./pages/legal/CancellationPolicy";
import TermsAndConditions from "./pages/legal/TermsAndConditions";
import FAQs from "./pages/legal/FAQs";
import ContactUs from "./pages/contact/ContactUs";
import MyBookingDetails from "./pages/booking/MyBookingDetails";
import Booking from "./pages/booking/Booking";
import SelectBed from "./pages/booking/SelectBed";
import MainPage from "./pages/components/MainPage";

// Common Components
import UserHeader from "./pages/components/UserHeader";
import Footer from "./pages/components/Footer";
import Loading from "./pages/components/Loading";

// Admin Components
import AdminHeader from "./admin/components/AdminHeader";
import AdminTabs from "./admin/components/AdminTabs";
import AdminDashboard from "./admin/components/AdminDashboard";

// Admin Pages
import TestimonialsManagement from "./admin/testimonials/TestimonialManagement";
import ContactUsManagement from "./admin/contact/ContactUsManagement";
import ContactUsDetails from "./admin/contact/ContactUsDetails";
import BookingManagement from "./admin/booking/BookingManagement";
import BookingDetails from "./admin/booking/BookingDetails";
import Deliveries from "./admin/delivery/Deliveries";
import AddDelivery from "./admin/delivery/AddDelivery";
import Enquiry from "./admin/enquiry/Enquiry";
import EnquiryDetails from "./admin/enquiry/EnquiryDetails";
import Maintenance from "./admin/maintenance/Maintenance";
import MaintenanceDetailsPage from "./admin/maintenance/MaintenanceDetails";
import AddMaintenance from "./admin/maintenance/AddMaintenance";
import AnnouncementManagement from "./admin/announcement/Announcement";
import AddAnnouncement from "./admin/announcement/AddAnnouncement";
import AnnouncementDetails from "./admin/announcement/AnnouncementDetails";

// Styles
import "./App.css";
import "./styles.css";
import "./pages/auth/login.css";
import "./pages/auth/Register.css";
import "./pages/components/MainPage.css";
import "./pages/components/Home.css";
import "./pages/booking/Booking.css";
import "./pages/contact/ContactUs.css";
import "./pages/booking/MyBookingDetails.css";
import "./pages/components/Loading.css";
import "./pages/booking/SelectBed.css";
import "./pages/profile/userProfilePage.css";

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
