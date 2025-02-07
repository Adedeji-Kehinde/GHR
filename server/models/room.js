// models/Room.js
const mongoose = require('mongoose');
const RoomSchema = new mongoose.Schema({
    buildingBlock: { type: String, required: true },
    floor: { type: Number, required: true },
    apartmentNumber: { type: Number, required: true },
    bedSpaces: {
      A: { roomType: { type: String, enum: ['Ensuite', 'Twin Shared'] }, occupied: Boolean, bed1: Boolean, bed2: Boolean },
      B: { roomType: { type: String, enum: ['Ensuite', 'Twin Shared'] }, occupied: Boolean, bed1: Boolean, bed2: Boolean },
      C: { roomType: { type: String, enum: ['Ensuite', 'Twin Shared'] }, occupied: Boolean, bed1: Boolean, bed2: Boolean }
    }
  });
  
  module.exports = mongoose.model('Room', RoomSchema);