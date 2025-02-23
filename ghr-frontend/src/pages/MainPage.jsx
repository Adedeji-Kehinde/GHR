import React from "react";
import UserHeader from "./UserHeader"; // Adjust the path if necessary
import Footer from "./Footer";

const MainPage = () => {
  return (
    <>
      {/* Fixed header */}
      <UserHeader />

      {/* Main content container */}
      <div
        style={{
          marginTop: "80px", // to avoid overlap with the fixed header
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 80px)",
        }}
      >
        <h1>Welcome to GHR Website</h1>
      </div>
      <Footer />
    </>
  );
};

export default MainPage;
