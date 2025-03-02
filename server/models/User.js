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
  phone: { type: String, default: "" },
  profileImageUrl: { 
    type: String, 
    default: "https://res.cloudinary.com/dxlrv28eb/user_photos/default_Image.png" 
  },
  profileImageId: { type: String, default: "" },
  university: { type: String, default: "" },
  yearOfStudy: { type: String, default: "" },
  course: { type: String, default: "" },
  degree: { type: String, default: "" },
  dob: { type: Date, default: null },
  address: { type: String, default: "" },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  nationality: { type: String, default: "" },
  // Update emergencyContacts to be an array of the new EmergencyContactSchema.
  emergencyContacts: { type: [EmergencyContactSchema], default: [] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
