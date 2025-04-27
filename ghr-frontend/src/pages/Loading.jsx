import React from "react";

const Loading = ({ icon = "/images/logo.png", text = "Loading..." }) => {
    return (
      <div className="loading-wrapper">
        <div className="loading-icon-container">
          <img src={icon} alt="Loading Icon" className="loading-icon" />
        </div>
        <p className="loading-text">{text}</p>
      </div>
    );
  };

export default Loading;
