const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Middleware to Hash Password Before Saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Hash only if password is new or modified
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

// Instance Method to Compare Passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Export User Model
module.exports = mongoose.model('User', UserSchema);
