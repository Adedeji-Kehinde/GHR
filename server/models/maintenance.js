const mongoose = require('mongoose');

// Define Maintenance Request Schema
const MaintenanceSchema = new mongoose.Schema({
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
    required: true, // Maintenance category like Plumbing, Electrical, etc.
    enum: ["Appliances", "Cleaning", "Plumbing & Leaking", "Heating", "Lighting", "Windows & Doors", "Furniture & Fitting", "Flooring", "Other"], // Add more as needed
  },
  description: {
    type: String,
  },
  roomAccess: {
    type: String,
    required: true,
    enum: ['Yes', 'No'], // Whether the maintenance team can enter the room when the user is away
  },
  pictures: {
    data: Buffer,
    contentType: String,
    filename: String
  },
  status: {
    type: String,
    required: true,
    enum: ['In Process', 'Completed'], // The status of the maintenance request
    default: 'In Process', // Default status when created
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date and time when created
  },
  completedAt: {
    type: Date, // Will be set when the status is updated to "Completed"
  },
});

// Export Maintenance Model
const Maintenance = mongoose.model('Maintenance', MaintenanceSchema);
module.exports = Maintenance;
