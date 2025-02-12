const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  roomNumber: { type: String, default: null, sparse: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  phone: { type: String, required: true },
  profileImageUrl: { 
    type: String, 
    default: "https://res.cloudinary.com/dxlrv28eb/user_profiles/default_Image.JPG" 
  },
  profileImageId: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },

  // New field for user role
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
});

// Compare Password Method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);