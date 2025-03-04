const mongoose = require('mongoose');

const ContactUsSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    trim: true, 
    lowercase: true, 
    match: [/.+\@.+\..+/, "Please enter a valid email address"]
  },
  phone: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ["pending", "completed"], 
    default: "pending" 
  },
  actionTaken: { type: String, trim: true, default: "" },
  completedAt: { type: Date },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactUs', ContactUsSchema);
