# Griffith Halls of Residence (GHR) – Full Stack Project

A modern, full-featured platform for Griffith Halls of Residence, supporting residents and administrators with web, mobile (Android & iOS), and payment solutions.

---

## Live Demo

The application is already hosted and available at: [https://ghr-psi.vercel.app/](https://ghr-psi.vercel.app/)

# Griffith Halls of Residence (GHR) Frontend

A modern, full-featured web application for Griffith Halls of Residence, built with React and Vite. This project provides a seamless experience for both residents (students/professionals) and administrators, including room booking, profile management, announcements, maintenance, and more.

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Frontend (React/Vite)](#frontend-reactvite)
- [Backend API (Node.js/Express/MongoDB)](#backend-api-nodejsexpressmongodb)
- [Payments (Braintree/PayPal)](#payments-braintreepaypal)
- [Mobile App (Android/Kotlin)](#mobile-app-androidkotlin)
- [Mobile App (iOS/SwiftUI)](#mobile-app-iosswiftui)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [Screenshots](#screenshots)

- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **User Portal:** Book rooms, view amenities, manage bookings, submit enquiries, and more.
- **Admin Dashboard:** Manage bookings, users, announcements, maintenance, deliveries, testimonials, and more.
- **Mobile Apps:** 
  - **Android:** Fully completed, feature-rich app for residents.
  - **iOS:** Native app in development.
- **Payments:** Secure online payments via Braintree/PayPal.
- **Modern UI/UX:** Responsive design, animated transitions, and a clean, intuitive interface.
- **Authentication:** Secure login for both users and admins (Firebase, JWT).
- **Notifications:** Announcements and updates for residents.
- **Maintenance & Enquiries:** Submit and track requests easily.

- **User Portal**: Book rooms, view amenities, manage bookings, submit enquiries, and more.
- **Admin Dashboard**: Manage bookings, users, announcements, maintenance, deliveries, testimonials, and more.
- **Mobile App Download**: Android APK available for residents.
- **Modern UI/UX**: Responsive design, animated transitions, and a clean, intuitive interface.
- **Authentication**: Secure login for both users and admins.
- **Notifications**: Announcements and updates for residents.
- **Maintenance & Enquiries**: Submit and track requests easily.

---

## Screenshots
> **Tip:** Add screenshots of your main pages here for a more visual README. Place images in `public/screenshots/` and reference them as below.

| Landing Page | Admin Dashboard | Booking Page | Mobile App |
|-------------|----------------|-------------|------------|
| ![Landing](public/screenshots/landing.png) | ![Admin](public/screenshots/admin.png) | ![Booking](public/screenshots/booking.png) | ![App](public/screenshots/app.png) |

---

## Project Structure

```
project-root/
├── ghr-frontend/         # React + Vite frontend (user & admin portals)
├── server/               # Node.js/Express backend API (MongoDB, Firebase, etc.)
├── braintreeTutorial/    # Node.js backend for Braintree/PayPal payments
├── app/                  # Android mobile app (Kotlin, Jetpack Compose)
├── ios-app/              # Native iOS mobile app (SwiftUI)
└── ...                   # (Other folders as needed)

```
ghr-frontend/
├── public/                # Static assets (images, videos, icons, etc.)
├── src/
│   ├── pages/             # User-facing pages and components
│   │   ├── components/    # Shared UI components (header, footer, etc.)
│   │   ├── booking/       # Booking-related pages
│   │   ├── contact/       # Contact and enquiry pages
│   │   ├── legal/         # Privacy policy, terms, etc.
│   │   ├── profile/       # User profile management
│   │   └── ...
│   ├── admin/             # Admin dashboard and management sections
│   │   ├── components/    # Admin shared components (header, tabs, etc.)
│   │   ├── booking/       # Admin booking management
│   │   ├── maintenance/   # Maintenance management
│   │   ├── delivery/      # Delivery management
│   │   ├── announcement/  # Announcements management
│   │   ├── enquiry/       # Enquiry management
│   │   ├── contact/       # Contact submissions management
│   │   ├── testimonials/  # Testimonials management
│   │   └── auth/          # Admin authentication & user management
│   ├── assets/            # Custom fonts, icons, etc.
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── ...
├── package.json           # Project metadata and dependencies
├── vite.config.js         # Vite configuration
└── README.md              # Project documentation
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Xcode](https://developer.apple.com/xcode/) (for iOS app development)
- [Android Studio](https://developer.android.com/studio) (for Android app development)
- [MongoDB](https://www.mongodb.com/) (for backend database)

---

## Frontend (React/Vite)

- Located in `ghr-frontend/`
- Modern React app with Vite, React Router, Axios, Firebase, and more.
- To run locally:
  ```bash
  cd ghr-frontend
  npm install
  npm run dev
  ```
- Visit [http://localhost:5173](http://localhost:5173)

---

## Backend API (Node.js/Express/MongoDB)

- Located in `server/`
- RESTful API built with Express and MongoDB.
- Handles authentication (Firebase, JWT), user management, bookings, maintenance, announcements, deliveries, payments, and more.
- Integrates with Firebase for authentication and notifications.
- Key routes:
  - `/api/auth` — User/admin registration, login, profile, image upload, notifications, etc.
  - `/api/booking` — Room booking management.
  - `/api/maintenance` — Maintenance requests and management.
  - `/api/image` — Image upload and management.
  - `/api/payment` — Payment records and history.
- To run locally:
  ```bash
  cd server
  npm install
  node server.js
  ```
- Requires a `.env` file with MongoDB URI, JWT secret, and Firebase credentials.

---

## Payments (Braintree/PayPal)

- Located in `braintreeTutorial/`
- Node.js Express server for handling Braintree/PayPal payments.
- Key endpoints:
  - `GET /checkout` — Returns a Braintree client token for initializing the Drop-in UI.
  - `POST /checkout` — Processes a payment transaction.
- Integrated into the main backend via `/payment` route.
- (You do not need this as it is automatically ran by the server.js but if implemented separately)To run locally:
  ```bash
  cd braintreeTutorial
  npm install
  npm start
  ```
- Integrates with the frontend for secure payment processing.

---

## Mobile App (Android/Kotlin)

- Located in `app/`
- **Fully completed** native Android app built with Kotlin and Jetpack Compose.
- Features:
  - User authentication (Firebase)
  - Announcements (view and details)
  - Room booking and booking details
  - Deliveries (view, add, details)
  - Maintenance requests and enquiries
  - User profile management
  - Useful information and notifications (FCM)
- To run:
  1. Open the `app` folder in Android Studio.
  2. Connect an Android device or use an emulator.
  3. Build and run the app.

---

## Mobile App (iOS/SwiftUI)

- Located in `ios-app/`
- Native iOS app built with SwiftUI and MVVM.
- **Currently in development** (not all features may be available yet).
- Planned features: Announcements, delivery services, enquiries, maintenance, health records, appointments, and more.
- To run:
  1. Open `GHR.xcodeproj` in Xcode.
  2. Select your development team.
  3. Build and run on a simulator or device.


### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ghr-frontend.git
   cd ghr-frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

---

## Available Scripts
- `npm run dev` — Start the development server with hot reload
- `npm run build` — Build the app for production
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run ESLint on the codebase

---

## Technologies Used

- **Frontend:** React, Vite, React Router, Axios, Firebase, AOS, Chart.js, Recharts, React Icons, React Toastify
- **Backend:** Node.js, Express, MongoDB, Mongoose, Firebase Admin, JWT, Nodemailer, Cloudinary, Multer, SendGrid, Argon2/Bcrypt
- **Payments:** Braintree, PayPal
- **Mobile (Android):** Kotlin, Jetpack Compose, Retrofit, Firebase Auth, FCM
- **Mobile (iOS):** Swift, SwiftUI, MVVM, Swift Package Manager

- [React](https://react.dev/) (v19)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Firebase](https://firebase.google.com/) (for authentication, storage, etc.)
- [AOS](https://michalsnik.github.io/aos/) (animations)
- [Chart.js](https://www.chartjs.org/) & [Recharts](https://recharts.org/) (charts)
- [React Toastify](https://fkhadra.github.io/react-toastify/)

---

## Contributing



Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

---


## Screenshots

> **Tip:** Here are the screenshots of each page for a more visual README. images are Placed in images in `public/screenshots/` and referenced as below.

| Page                | Screenshot                                      |
|---------------------|------------------------------------------------|
| Landing Page        | ![Landing](public/screenshots/landing.png)      |
| Admin Dashboard     | ![Admin](public/screenshots/admin.png)          |
| Booking Page        | ![Booking](public/screenshots/booking.png)      |
| Mobile App (Android)| ![AndroidApp](public/screenshots/android-app.png)|
| Mobile App (iOS)    | ![App](public/screenshots/app.png)              |
| Delivery            | ![Delivery](public/screenshots/delivery.png)    |
| Delivery Details    | ![DeliveryDetails](public/screenshots/delivery-details.png) |
| Add Delivery        | ![AddDelivery](public/screenshots/add-delivery.png) |
| Maintenance         | ![Maintenance](public/screenshots/maintenance.png) |
| Maintenance Details | ![MaintenanceDetails](public/screenshots/maintenance-details.png) |
| Add Maintenance     | ![AddMaintenance](public/screenshots/add-maintenance.png) |
| Enquiry             | ![Enquiry](public/screenshots/enquiry.png)      |
| Enquiry Details     | ![EnquiryDetails](public/screenshots/enquiry-details.png) |
| Add Enquiry         | ![AddEnquiry](public/screenshots/add-enquiry.png) |
| Announcement        | ![Announcement](public/screenshots/announcement.png) |
| Announcement Details| ![AnnouncementDetails](public/screenshots/announcement-details.png) |
| Add Announcement    | ![AddAnnouncement](public/screenshots/add-announcement.png) |
| Testimonials        | ![Testimonials](public/screenshots/testimonials.png) |
| Contact Us          | ![ContactUs](public/screenshots/contactus.png)  |
| Contact Us Details  | ![ContactUsDetails](public/screenshots/contactus-details.png) |
| Add Contact Us      | ![AddContactUs](public/screenshots/add-contactus.png) |
| Profile             | ![Profile](public/screenshots/profile.png)      |
| ...                 | ...                                            | 

