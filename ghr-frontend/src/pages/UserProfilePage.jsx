import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserHeader from "./UserHeader";
import Footer from "./Footer";

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
  // We now store each emergency contact with an "isEditing" property.
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const navigate = useNavigate();
  const API_URL =import.meta.env.VITE_API_BASE_URL ||"http://localhost:8000";
  const fileInputRef = useRef(null);

  // Editable state for personal info (including greeting fields)
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
    degree: ""
  });

  useEffect(() => {
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
          degree: response.data.degree || ""
        });
        // Initialize emergency contacts; add isEditing:false to each.
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

  // Profile picture update handlers.
  const handleProfilePicClick = () => {
    const confirmEdit = window.confirm("Do you want to change your profile image?");
    if (confirmEdit) {
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

  // Calculate progress based on filled fields.
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

  if (loading) {
    return (
      <>
        <UserHeader user={user} hideBookRoom={true} />
        <div style={{ padding: "20px", textAlign: "center", marginTop: "120px" }}>
          <p>Loading user details...</p>
        </div>
        <Footer />
      </>
    );
  }

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

  // Inline styles for layout.
  const containerStyle = {
    maxWidth: "1800px",
    margin: "120px auto 40px auto",
    padding: "0 40px",
    fontFamily: "'Open Sans', sans-serif",
    color: "#333",
    textAlign: "left",
  };

  const sectionTitleStyle = {
    fontSize: "1.4rem",
    fontWeight: "600",
    margin: "20px 0 10px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "5px",
  };

  const editTextStyle = {
    textAlign: "left",
    fontSize: "0.9rem",
    color: "#007bff",
    cursor: "pointer",
    marginTop: "5px",
  };

  const dividerStyle = {
    margin: "30px 0",
    border: "none",
    borderTop: "1px solid #ddd",
  };

  const rowStyle = {
    display: "flex",
    gap: "20px",
    marginBottom: "10px",
    flexWrap: "nowrap",
    overflowX: "auto",
    textAlign: "left",
  };

  const fieldStyle = {
    display: "flex",
    alignItems: "center",
    flex: "1",
    minWidth: "180px",
  };

  const inputStyle = {
    padding: "5px",
    fontSize: "1rem",
    flex: "1",
  };

  const mainHeadingStyle = {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "10px",
  };

  const subHeadingStyle = {
    fontSize: "1rem",
    marginBottom: "20px",
    color: "#555",
  };

  const contentRowStyle = {
    display: "flex",
    gap: "120px",
    alignItems: "flex-start",
    flexWrap: "nowrap",
  };

  const leftColumnStyle = {
    flex: "1 1 800px",
  };

  const rightColumnStyle = {
    flex: "1 1 800px",
    marginLeft: "auto",
    textAlign: "left",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
  };

  const progressContainerStyle = {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: "20px",
    backgroundColor: "#f3f3f3",
    overflow: "hidden",
    margin: "10px 0",
  };

  const progressBarStyle = {
    width: `${computedProgress}%`,
    height: "10px",
    backgroundColor: "#28a745",
  };

  // Helper component for displaying an icon with tooltip and value.
  const InfoField = ({ icon, label, value }) => (
    <div style={fieldStyle}>
      <img
        src={`/images/${icon}`}
        alt={label}
        title={label}
        style={{ width: "20px", verticalAlign: "middle", marginRight: "5px" }}
      />
      <span>{value}</span>
    </div>
  );

  return (
    <>
      <UserHeader user={user} hideBookRoom={true} />
      <div style={containerStyle}>
        {/* Greeting and Subheading Section */}
        <div>
          {editingGreeting ? (
            <>
              <h1 style={mainHeadingStyle}>Hi, I'm {name}</h1>
              <div style={subHeadingStyle}>
                <div style={rowStyle}>
                  <div style={fieldStyle}>
                    <img src="/images/university.png" alt="University" title="University" style={{ width: "20px", marginRight: "5px" }} />
                    <input
                      type="text"
                      style={inputStyle}
                      value={personalInfo.university}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, university: e.target.value })}
                    />
                  </div>
                </div>
                <div style={rowStyle}>
                  <div style={fieldStyle}>
                    <input
                      type="text"
                      style={inputStyle}
                      value={personalInfo.yearOfStudy}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, yearOfStudy: e.target.value })}
                      placeholder="Year of Study"
                    />
                  </div>
                  <div style={fieldStyle}>
                    <input
                      type="text"
                      style={inputStyle}
                      value={personalInfo.course}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, course: e.target.value })}
                      placeholder="Course"
                    />
                  </div>
                </div>
                <div style={rowStyle}>
                  <div style={fieldStyle}>
                    <input
                      type="text"
                      style={inputStyle}
                      value={personalInfo.degree}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, degree: e.target.value })}
                      placeholder="Degree"
                    />
                  </div>
                </div>
              </div>
              <div style={editTextStyle} onClick={() => {
                savePersonalInfo();
                setEditingGreeting(false);
              }}>
                Save
              </div>
            </>
          ) : (
            <>
              <h1 style={mainHeadingStyle}>Hi, I'm {name}</h1>
              <div style={subHeadingStyle}>
                <InfoField icon="university.png" label="University" value={personalInfo.university} />
                <br />
                Year of Study: {personalInfo.yearOfStudy} &nbsp;|&nbsp; Course: {personalInfo.course} &nbsp;|&nbsp; Degree: {personalInfo.degree}
              </div>
              <div style={editTextStyle} onClick={() => setEditingGreeting(true)}>
                Edit
              </div>
            </>
          )}
        </div>

        <hr style={dividerStyle} />

        {/* Main content row with left and right columns */}
        <div style={contentRowStyle}>
          {/* Left Column: Personal & Emergency Info */}
          <div style={leftColumnStyle}>
            <h2 style={sectionTitleStyle}>Personal Information</h2>
            {editingPersonal ? (
              <>
                <div style={rowStyle}>
                  <div style={fieldStyle}>
                    <img src="/images/user.png" alt="Name" title="Name" style={{ width: "20px", marginRight: "5px" }} />
                    <input
                      type="text"
                      style={inputStyle}
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                      placeholder="First Name"
                    />
                  </div>
                  <div style={fieldStyle}>
                    <input
                      type="text"
                      style={inputStyle}
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                <div style={rowStyle}>
                  <div style={fieldStyle}>
                    <img src="/images/phone.png" alt="Phone" title="Phone" style={{ width: "20px", marginRight: "5px" }} />
                    <input
                      type="text"
                      style={inputStyle}
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div style={rowStyle}>
                  <div style={fieldStyle}>
                    <img src="/images/calendar.png" alt="DOB" title="DOB" style={{ width: "20px", marginRight: "5px" }} />
                    <input
                      type="date"
                      style={inputStyle}
                      value={personalInfo.dob}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
                    />
                  </div>
                  <div style={fieldStyle}>
                    <img src="/images/gender.png" alt="Gender" title="Gender" style={{ width: "20px", marginRight: "5px" }} />
                    <select
                      style={inputStyle}
                      value={personalInfo.gender}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={rowStyle}>
                  <div style={fieldStyle}>
                    <img src="/images/location.png" alt="Address" title="Address" style={{ width: "20px", marginRight: "5px" }} />
                    <input
                      type="text"
                      style={inputStyle}
                      value={personalInfo.address}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                    />
                  </div>
                  <div style={fieldStyle}>
                    <img src="/images/nationality.png" alt="Nationality" title="Nationality" style={{ width: "20px", marginRight: "5px" }} />
                    <select
                      style={inputStyle}
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
              </>
            ) : (
              <>
                <div style={rowStyle}>
                  <InfoField icon="user.png" label="Name" value={`${personalInfo.name} ${personalInfo.lastName}`} />
                  <InfoField icon="phone.png" label="Phone" value={personalInfo.phone} />
                </div>
                <div style={rowStyle}>
                  <InfoField icon="calendar.png" label="DOB" value={formattedDob} />
                  <InfoField icon="gender.png" label="Gender" value={personalInfo.gender} />
                </div>
                <div style={rowStyle}>
                  <InfoField icon="location.png" label="Address" value={personalInfo.address} />
                  <InfoField icon="nationality.png" label="Nationality" value={personalInfo.nationality} />
                </div>
              </>
            )}
            <div style={editTextStyle} onClick={() => {
              if (editingPersonal) {
                savePersonalInfo();
                setEditingPersonal(false);
              } else {
                setEditingPersonal(true);
              }
            }}>
              {editingPersonal ? "Save" : "Edit"}
            </div>

            <hr style={dividerStyle} />

            {/* Emergency Contact Section */}
            <h2 style={sectionTitleStyle}>Emergency Contact</h2>
            {emergencyContacts.map((contact, index) => (
              <div key={index} style={{ marginBottom: "10px", borderBottom: "1px dashed #ccc", paddingBottom: "10px" }}>
                {contact.isEditing ? (
                  <>
                    <div style={{ marginBottom: "5px" }}>
                      <span style={{ fontWeight: "600", marginRight: "5px" }}>Name:</span>
                      <input
                        type="text"
                        style={inputStyle}
                        value={contact.name}
                        onChange={(e) => {
                          const newContacts = [...emergencyContacts];
                          newContacts[index].name = e.target.value;
                          setEmergencyContacts(newContacts);
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <span style={{ fontWeight: "600", marginRight: "5px" }}>Email:</span>
                      <input
                        type="email"
                        style={inputStyle}
                        value={contact.email}
                        onChange={(e) => {
                          const newContacts = [...emergencyContacts];
                          newContacts[index].email = e.target.value;
                          setEmergencyContacts(newContacts);
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <span style={{ fontWeight: "600", marginRight: "5px" }}>Phone:</span>
                      <input
                        type="text"
                        style={inputStyle}
                        value={contact.phone}
                        onChange={(e) => {
                          const newContacts = [...emergencyContacts];
                          newContacts[index].phone = e.target.value;
                          setEmergencyContacts(newContacts);
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <span style={{ fontWeight: "600", marginRight: "5px" }}>Address:</span>
                      <input
                        type="text"
                        style={inputStyle}
                        value={contact.address}
                        onChange={(e) => {
                          const newContacts = [...emergencyContacts];
                          newContacts[index].address = e.target.value;
                          setEmergencyContacts(newContacts);
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <span style={{ fontWeight: "600", marginRight: "5px" }}>Relation:</span>
                      <select
                        style={inputStyle}
                        value={contact.relation}
                        onChange={(e) => {
                          const newContacts = [...emergencyContacts];
                          newContacts[index].relation = e.target.value;
                          setEmergencyContacts(newContacts);
                        }}
                      >
                        <option value="Guardian">Guardian</option>
                        <option value="Guarantor">Guarantor</option>
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Brother">Brother</option>
                        <option value="Sister">Sister</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div style={editTextStyle} onClick={() => {
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
                    <div style={{ marginBottom: "5px" }}>
                      <span style={{ fontWeight: "600", marginRight: "5px" }}>Name:</span> {contact.name}
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <span style={{ fontWeight: "600", marginRight: "5px" }}>Email:</span> {contact.email}
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <span style={{ fontWeight: "600", marginRight: "5px" }}>Phone:</span> {contact.phone}
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <span style={{ fontWeight: "600", marginRight: "5px" }}>Address:</span> {contact.address}
                    </div>
                    <div style={{ marginBottom: "5px" }}>
                      <span style={{ fontWeight: "600", marginRight: "5px" }}>Relation:</span> {contact.relation}
                    </div>
                    <div style={editTextStyle} onClick={() => {
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
            <div style={{ marginTop: "5px" }}>
              <span
                style={{ ...editTextStyle, cursor: "pointer" }}
                onClick={() => {
                  // Append a new empty emergency contact with isEditing set to true.
                  setEmergencyContacts((prev) => [
                    ...prev,
                    { name: "", email: "", phone: "", address: "", relation: "Other", isEditing: true },
                  ]);
                }}
              >
                +Add
              </span>
            </div>
          </div>

          {/* Right Column: Profile Photo, Completion Bar, Student ID & Email */}
          <div style={rightColumnStyle}>
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  margin: "0 auto",
                  cursor: "pointer"
                }}
                onClick={handleProfilePicClick}
              >
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleProfilePicChange}
              />
            </div>
            <div style={{ textAlign: "center", fontWeight: "600", marginBottom: "5px" }}>
              Profile Completion
            </div>
            <div style={progressContainerStyle}>
              <div style={progressBarStyle} title={`${computedProgress}%`}></div>
            </div>
            <hr style={dividerStyle} />
            <div style={{ marginTop: "10px", textAlign: "left" }}>
              <InfoField icon="email.png" label="Email" value={userEmail} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfilePage;
