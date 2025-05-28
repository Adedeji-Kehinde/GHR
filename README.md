# Griffith Halls of Residence (GHR) Frontend

A modern, full-featured web application for Griffith Halls of Residence, built with React and Vite. This project provides a seamless experience for both residents (students/professionals) and administrators, including room booking, profile management, announcements, maintenance, and more.

---

## Table of Contents
- [Features](#features)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

---

## Features
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
