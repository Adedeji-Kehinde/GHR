const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const EmergencyContactSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  relation: { 
    type: String, 
    enum: ['Guardian', 'Guarantor', 'Mother', 'Father', 'Brother', 'Sister', 'Other'],
    default: 'Other'
  },
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  roomNumber: { type: String, default: null, sparse: true },
  phone: { type: String, default: "" },
  profileImageUrl: { 
    type: String, 
    default: "https://res.cloudinary.com/dxlrv28eb/image/upload/v1740475083/user_photos/default_image.png"
  },
  university: { type: String, default: "" },
  yearOfStudy: { type: String, default: "" },
  course: { type: String, default: "" },
  degree: { type: String, default: "" },
  dob: { type: Date, default: null },
  address: { type: String, default: "" },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  nationality: { type: String, default: "" },
  emergencyContacts: { type: [EmergencyContactSchema], default: [] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  fcmToken: { type: String, default: "" },
  createdBy: { type: String, default: null }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
