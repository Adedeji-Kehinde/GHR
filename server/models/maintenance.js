const mongoose = require("mongoose");

// Define Maintenance Request Schema
const MaintenanceSchema = new mongoose.Schema({
  userId: { // ✅ Add this field to track the user who submitted the request
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  requestId: {
    type: Number,
    unique: true,
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Appliances", "Cleaning", "Plumbing & Leaking", "Heating", "Lighting", "Windows & Doors", "Furniture & Fitting", "Flooring", "Other"],
  },
  description: { type: String },
  roomAccess: {
    type: String,
    required: true,
    enum: ["Yes", "No"],
  },
  pictures: {
    type: [String], // Array of image URLs
    default: [],
  },
  status: {
    type: String,
    required: true,
    enum: ["In Process", "Completed"],
    default: "In Process",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

const Maintenance = mongoose.model("Maintenance", MaintenanceSchema);
module.exports = Maintenance;
