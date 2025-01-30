const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  phone: { type: String, required: true },
  profileImageUrl: { 
    type: String, 
    default: "https://res.cloudinary.com/dxlrv28eb/image/upload/vDEFAULT_IMAGE_ID.jpg" 
  },
  createdAt: { type: Date, default: Date.now },
});

// Compare Password Method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);