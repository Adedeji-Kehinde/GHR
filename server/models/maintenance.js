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
    required: true, // Automatically set based on the authenticated user's token
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
    type: [String], // Array of image URLs or base64 strings
    default: [],
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

// Middleware to generate a sequential requestId
MaintenanceSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const lastRequest = await Maintenance.findOne().sort({ requestId: -1 }); // Find the highest requestId
      this.requestId = lastRequest ? lastRequest.requestId + 1 : 1; // Increment or start at 1
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Export Maintenance Model
const Maintenance = mongoose.model('Maintenance', MaintenanceSchema);
module.exports = Maintenance;
