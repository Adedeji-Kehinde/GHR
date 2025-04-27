import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import UserHeader from "./UserHeader";
import Footer from "./Footer";
import Loading from "./Loading";

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", 
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", 
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", 
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", 
  "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", 
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", 
  "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", 
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", 
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia", "Fiji", 
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", 
  "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", 
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", 
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", 
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", 
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", 
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", 
  "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", 
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", 
  "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", 
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", 
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", 
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", 
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", 
  "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", 
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", 
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", 
  "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", 
  "Zambia", "Zimbabwe"
];

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingGreeting, setEditingGreeting] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const fileInputRef = useRef(null);

  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    lastName: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    nationality: "",
    university: "",
    yearOfStudy: "",
    course: "",
    degree: "",
  });

  useEffect(() => {
    AOS.init({ duration: 1000 });
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setPersonalInfo({
          name: response.data.name || "",
          lastName: response.data.lastName || "",
          phone: response.data.phone || "",
          dob: response.data.dob
            ? new Date(response.data.dob).toISOString().split("T")[0]
            : "",
          gender: response.data.gender || "",
          address: response.data.address || "",
          nationality: response.data.nationality || "",
          university: response.data.university || "",
          yearOfStudy: response.data.yearOfStudy || "",
          course: response.data.course || "",
          degree: response.data.degree || "",
        });
        setEmergencyContacts(
          (response.data.emergencyContacts || []).map((contact) => ({
            ...contact,
            isEditing: false,
          }))
        );
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();

    return () => window.removeEventListener('resize', handleResize);
  }, [navigate, API_URL]);

  const savePersonalInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/auth/updatePersonal`,
        { ...personalInfo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser((prev) => ({ ...prev, ...personalInfo }));
      alert("Personal Information updated");
    } catch (error) {
      console.error("Error updating personal info", error);
      alert("Update failed");
    }
  };

  const saveEmergencyContacts = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/auth/updateEmergency`,
        { emergencyContacts },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser((prev) => ({ ...prev, emergencyContacts }));
      alert("Emergency Contacts updated");
    } catch (error) {
      console.error("Error updating emergency contacts", error);
      alert("Update failed");
    }
  };

  const handleProfilePicClick = () => {
    if (window.confirm("Do you want to change your profile image?")) {
      fileInputRef.current.click();
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await axios.put(
        `${API_URL}/api/auth/update-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser((prev) => ({ ...prev, profileImageUrl: response.data.profileImageUrl }));
      alert("Profile picture updated");
    } catch (error) {
      console.error("Error updating profile picture", error);
      alert("Update failed");
    }
  };

  const calculateProgress = () => {
    const personalFields = Object.values(personalInfo);
    const emergencyFields = emergencyContacts.flatMap((contact) => Object.values(contact).filter(val => typeof val === "string"));
    const total = personalFields.length + emergencyFields.length;
    const filled = [...personalFields, ...emergencyFields].filter(
      (value) => typeof value === "string" && value.trim() !== ""
    ).length;
    return Math.round((filled / total) * 100);
  };

  const computedProgress = calculateProgress();

  if (loading) return <Loading icon="/images/logo.png" text="Loading Your Bookings..." />;
  const {
    name,
    university = "N/A",
    yearOfStudy = "N/A",
    course = "N/A",
    degree = "N/A",
    studentId = "N/A",
    profileImageUrl,
  } = user;
  const userEmail = user.email || "N/A";
  const formattedDob = personalInfo.dob;
  const InfoField = ({ icon, label, value }) => (
    <div className="info-field">
      <img src={`/images/${icon}`} alt={label} title={label} />
      <span>{value}</span>
    </div>
  );

  return (
    <>
      <UserHeader user={user} hideBookRoom={true} />
      <div className="user-profile-container">
        <div className="greeting-section">
          {editingGreeting ? (
            <>
              <h1 className="main-heading">Hi, I'm {personalInfo.name}</h1>
              <div className="sub-heading">
                {/* Editable University Section */}
                <div className="row">
                  <div className="field">
                    <img src="/images/university.png" alt="University" />
                    <input
                      type="text"
                      value={personalInfo.university}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, university: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="field">
                    <input
                      type="text"
                      value={personalInfo.yearOfStudy}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, yearOfStudy: e.target.value })}
                      placeholder="Year of Study"
                    />
                  </div>
                  <div className="field">
                    <input
                      type="text"
                      value={personalInfo.course}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, course: e.target.value })}
                      placeholder="Course"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="field">
                    <input
                      type="text"
                      value={personalInfo.degree}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, degree: e.target.value })}
                      placeholder="Degree"
                    />
                  </div>
                </div>
              </div>
              <div className="edit-text" onClick={() => { savePersonalInfo(); setEditingGreeting(false); }}>
                Save
              </div>
            </>
          ) : (
            <>
              <h1 className="main-heading">Hi, I'm {personalInfo.name}</h1>
              <div className="sub-heading">
                <InfoField icon="university.png" label="University" value={personalInfo.university} />
                <br />
                Year of Study: {personalInfo.yearOfStudy} | Course: {personalInfo.course} | Degree: {personalInfo.degree}
              </div>
              <div className="edit-text" onClick={() => setEditingGreeting(true)}>
                Edit
              </div>
            </>
          )}
        </div>

        <hr className="divider" />

        <div className="content-row">
          {/* Left Column */}
          <div className="left-column">
          <h2 className="section-title">Personal Information</h2>

          {editingPersonal ? (
            <>
              <div className="row">
                <div className="field">
                  <img src="/images/user.png" alt="Name" />
                  <input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    placeholder="First Name"
                  />
                </div>
                <div className="field">
                  <input
                    type="text"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <img src="/images/phone.png" alt="Phone" />
                  <input
                    type="text"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    placeholder="Phone Number"
                  />
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <img src="/images/calendar.png" alt="DOB" />
                  <input
                    type="date"
                    value={personalInfo.dob}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
                  />
                </div>
                <div className="field">
                  <img src="/images/gender.png" alt="Gender" />
                  <select
                    value={personalInfo.gender}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <img src="/images/location.png" alt="Address" />
                  <input
                    type="text"
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                    placeholder="Address"
                  />
                </div>
                <div className="field">
                  <img src="/images/nationality.png" alt="Nationality" />
                  <select
                    value={personalInfo.nationality}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="edit-text" onClick={() => { savePersonalInfo(); setEditingPersonal(false); }}>
                Save
              </div>
            </>
          ) : (
            <>
              <div className="row">
                <InfoField icon="user.png" label="Name" value={`${personalInfo.name} ${personalInfo.lastName}`} />
                <InfoField icon="phone.png" label="Phone" value={personalInfo.phone} />
              </div>

              <div className="row">
                <InfoField icon="calendar.png" label="DOB" value={personalInfo.dob} />
                <InfoField icon="gender.png" label="Gender" value={personalInfo.gender} />
              </div>

              <div className="row">
                <InfoField icon="location.png" label="Address" value={personalInfo.address} />
                <InfoField icon="nationality.png" label="Nationality" value={personalInfo.nationality} />
              </div>

              <div className="edit-text" onClick={() => setEditingPersonal(true)}>
                Edit
              </div>
            </>
          )}

          <hr className="divider" />

          {/* Emergency Contact Section */}
          <h2 className="section-title">Emergency Contact</h2>

          {emergencyContacts.map((contact, index) => (
            <div key={index} className="emergency-contact-card">
              {contact.isEditing ? (
                <>
                  <div className="row">
                    <div className="field">
                      <input
                        type="text"
                        placeholder="Name"
                        value={contact.name}
                        onChange={(e) => {
                          const newContacts = [...emergencyContacts];
                          newContacts[index].name = e.target.value;
                          setEmergencyContacts(newContacts);
                        }}
                      />
                    </div>
                    <div className="field">
                      <input
                        type="email"
                        placeholder="Email"
                        value={contact.email}
                        onChange={(e) => {
                          const newContacts = [...emergencyContacts];
                          newContacts[index].email = e.target.value;
                          setEmergencyContacts(newContacts);
                        }}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="field">
                      <input
                        type="text"
                        placeholder="Phone"
                        value={contact.phone}
                        onChange={(e) => {
                          const newContacts = [...emergencyContacts];
                          newContacts[index].phone = e.target.value;
                          setEmergencyContacts(newContacts);
                        }}
                      />
                    </div>
                    <div className="field">
                      <input
                        type="text"
                        placeholder="Address"
                        value={contact.address}
                        onChange={(e) => {
                          const newContacts = [...emergencyContacts];
                          newContacts[index].address = e.target.value;
                          setEmergencyContacts(newContacts);
                        }}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="field">
                      <select
                        value={contact.relation}
                        onChange={(e) => {
                          const newContacts = [...emergencyContacts];
                          newContacts[index].relation = e.target.value;
                          setEmergencyContacts(newContacts);
                        }}
                      >
                        <option value="">Select Relation</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Guarantor">Guarantor</option>
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="edit-text" onClick={() => {
                    const newContacts = [...emergencyContacts];
                    newContacts[index].isEditing = false;
                    setEmergencyContacts(newContacts);
                    saveEmergencyContacts();
                  }}>
                    Save
                  </div>
                </>
              ) : (
                <>
                  <div><strong>Name:</strong> {contact.name}</div>
                  <div><strong>Email:</strong> {contact.email}</div>
                  <div><strong>Phone:</strong> {contact.phone}</div>
                  <div><strong>Address:</strong> {contact.address}</div>
                  <div><strong>Relation:</strong> {contact.relation}</div>

                  <div className="edit-text" onClick={() => {
                    const newContacts = [...emergencyContacts];
                    newContacts[index].isEditing = true;
                    setEmergencyContacts(newContacts);
                  }}>
                    Edit
                  </div>
                </>
              )}
            </div>
          ))}

          <div className="add-contact">
            <span
              className="edit-text"
              onClick={() =>
                setEmergencyContacts((prev) => [
                  ...prev,
                  { name: "", email: "", phone: "", address: "", relation: "Other", isEditing: true },
                ])
              }
            >
              + Add Emergency Contact
            </span>
          </div>
        </div>

          {/* Right Column */}
          <div className="right-column">
            <div className="profile-picture" onClick={handleProfilePicClick}>
              <img src={user.profileImageUrl} alt="Profile" />
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleProfilePicChange} />
            </div>

            <div className="progress-section">
              <div className="progress-label">Profile Completion</div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${computedProgress}%` }} />
              </div>
            </div>

            <hr className="divider" />
            <div className="email-info">
              <InfoField icon="email.png" label="Email" value={user.email || "N/A"} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfilePage;
