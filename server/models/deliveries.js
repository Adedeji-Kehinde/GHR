const mongoose = require('mongoose');

// Define Deliveries Schema
const DeliverySchema = new mongoose.Schema({
  arrivedAt: { type: Date, default: Date.now}, // Date and time parcel arrived
  parcelNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\d{3}$/, 'Parcel number must be a three-digit number'] // Regex for format 001-999
  },
  sender: { type: String }, // Sender of the parcel
  parcelType: { 
    type: String, 
    required: true, 
    enum: ['Letter', 'Package'] // Only allow 'Letter' or 'Package'
  },
  description: { type: String }, // Optional description of the parcel
  collectedAt: { type: Date }, // Date and time parcel was collected (optional)
  status: { 
    type: String, 
    required: true, 
    enum: ['To Collect', 'Collected', 'Cancelled'], // Status options
    default: 'To Collect' // Default status
  },
  roomNumber: {
    type: String,
    required: true, // Room number must be provided for every delivery
  }
});

// Export Deliveries Model
module.exports = mongoose.model('Delivery', DeliverySchema);
