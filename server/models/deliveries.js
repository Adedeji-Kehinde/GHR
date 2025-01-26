const mongoose = require('mongoose');

// Define Deliveries Schema
const DeliverySchema = new mongoose.Schema({
  arrivedAt: { type: Date, required: true }, // Date and time parcel arrived
  parcelNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\d{3}$/, 'Parcel number must be a three-digit number'] // Regex for format 001-999
  },
  sender: { type: String}, // Sender of the parcel
  parcelType: { 
    type: String, 
    required: true, 
    enum: ['Letter', 'Package'] // Only allow 'Letter' or 'Package'
  },
  description: { type: String }, // Optional description of the parcel
  collectedAt: { type: Date }, // Date and time parcel was collected (optional)
});

// Middleware to Auto-generate Parcel Number
DeliverySchema.pre('save', function (next) {
  if (!this.parcelNumber) {
    this.parcelNumber = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  }
  next();
});

// Export Deliveries Model
module.exports = mongoose.model('Delivery', DeliverySchema);
