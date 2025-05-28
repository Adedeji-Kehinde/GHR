import React from "react";
import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import "./LifeAtGHR.css";

const LifeAtGHR = () => {
  return (
    <>
      <UserHeader user={null} />
      <div className="life-page-wrapper">
        <div className="life-header">
          <div className="life-header-content">
            <h1>Life @ GHR</h1>
            <h2>Experience the Excitement & Diversity</h2>
            <p>
              Life at Griffith Halls of Residence (GHR) is an ever-changing adventure where no two days or people are the same. We're here to make your experience as enjoyable as possible – offering you a taste of what makes our halls tick, what you can expect, and why you should join our vibrant community.
            </p>
          </div>
        </div>

        <div className="life-content">
          <div className="content-wrapper">
            <div className="grid-container">
              <div className="feature-box">
                <h3>Vibrant Events & Activities</h3>
                <p>
                  From lively social gatherings, themed parties, cultural nights, and sports events to academic workshops and study groups, there's always something happening at GHR. Our events are designed to help you connect, explore new interests, and create lasting memories.
                </p>
              </div>
              <div className="feature-box">
                <h3>Urban Square Restaurant</h3>
                <p>
                  Enjoy a culinary experience right on campus at Urban Square, our on‑site restaurant. Whether you're grabbing a quick snack between classes or enjoying a leisurely dinner with friends, Urban Square offers a variety of delicious options in a welcoming atmosphere.
                </p>
              </div>
              <div className="feature-box">
                <h3>Settling In & Resources</h3>
                <p>
                  We know starting a new chapter can be overwhelming. That's why we provide helpful PDFs and guides covering everything from local area insights to practical tips for living on campus. These resources ensure you have all the support you need to settle in smoothly.
                </p>
              </div>
              <div className="feature-box">
                <h3>A Global Community</h3>
                <p>
                  Our halls are home to students from institutions all over Dublin and from around the world. At GHR, you'll find an inclusive, diverse community that celebrates different cultures and backgrounds, offering endless opportunities to learn, share, and grow together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LifeAtGHR;
