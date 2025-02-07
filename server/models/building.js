// models/Building.js
const mongoose = require('mongoose');

const BuildingSchema = new mongoose.Schema({
  block: { type: String, enum: ['1A', '1B', '2A', '2B'], required: true },
  floors: { type: [Number], default: [0, 1, 2, 3, 4] },
  totalApartmentsPerFloor: { type: Number, default: 10 }
});

module.exports = mongoose.model('Building', BuildingSchema);