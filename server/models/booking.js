// models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  buildingBlock: { type: String, required: true },
  floor: { type: Number, required: true },
  apartmentNumber: { type: Number, required: true },
  bedSpace: { type: String, enum: ['A', 'B', 'C'], required: true },
  bedNumber: { type: String, enum: ['1', '2'], required: false },
  roomType: { type: String, enum: ['Ensuite', 'Twin Shared'], required: true },
  lengthOfStay: { type: String, enum: ['Summer', 'First Semester', 'Second Semester', 'Full Year'], required: true },
  status: { type: String, enum: ['Booked', 'Cancelled'], default: 'Booked' }
});

// Middleware to update user schema with generated room number and prevent invalid bookings
// models/Booking.js

BookingSchema.pre('save', async function (next) {
  const Booking = mongoose.model('Booking');
  const existingBooking = await Booking.findOne({ userId: this.userId });
  if (existingBooking) {
    return next(new Error('User has already booked a room.'));
  }

  const Room = mongoose.model('Room');
  const room = await Room.findOne({
    buildingBlock: this.buildingBlock,
    floor: this.floor,
    apartmentNumber: this.apartmentNumber
  });

  if (!room) {
    return next(new Error('Room not found.'));
  }

  const bedSpaceData = room.bedSpaces[this.bedSpace];
  if (!bedSpaceData) {
    return next(new Error('Invalid bed space selected.'));
  }

  // Check roomType matches
  if (bedSpaceData.roomType !== this.roomType) {
    return next(new Error('Selected bed space is not available for the chosen room type.'));
  }

  // ------------- PARTIAL OCCUPANCY CHECK -------------
  // If Ensuite => only 1 bed (bed1). If bed1 is true => fully occupied
  if (bedSpaceData.roomType === 'Ensuite') {
    // If bed1 is already true => no space
    if (bedSpaceData.bed1) {
      return next(new Error('This ensuite is already occupied.'));
    }
    // Otherwise, user can take bed1
    bedSpaceData.bed1 = true;
    // Mark entire ensuite as occupied
    bedSpaceData.occupied = true;
  } 
  else if (bedSpaceData.roomType === 'Twin Shared') {
    // Twin Shared => 2 possible beds
    const bed1 = bedSpaceData.bed1; // true if taken
    const bed2 = bedSpaceData.bed2; // true if taken

    // If BOTH are true => it's fully occupied
    if (bed1 && bed2) {
      return next(new Error('This Twin Shared space is fully occupied.'));
    }

    // Otherwise we mark the specific bed the user is booking
    if (this.bedNumber) {
      bedSpaceData[`bed${this.bedNumber}`] = true;
    } else {
      // fallback, if user didn't specify bedNumber for a Twin Shared
      return next(new Error('Bed number is required for Twin Shared.'));
    }

    // Now re-check if BOTH beds are taken => set occupied = true
    if (bedSpaceData.bed1 && bedSpaceData.bed2) {
      bedSpaceData.occupied = true;
    } else {
      // If at least one bed is still free, keep "occupied = false"
      bedSpaceData.occupied = false;
    }
  }

  // Save updated room
  room.bedSpaces[this.bedSpace] = bedSpaceData;
  await room.save();

  next();
});


BookingSchema.post('save', async function (doc) {
  const User = require('./User');
  const Room = require('./room');

  const room = await Room.findOne({
    buildingBlock: doc.buildingBlock,
    floor: doc.floor,
    apartmentNumber: doc.apartmentNumber
  });
  
  if (room) {
    const generatedRoomNumber = `${room.buildingBlock}${room.floor}${String(room.apartmentNumber).padStart(2, '0')}${doc.bedSpace}${doc.bedNumber || ''}`;
    await User.findByIdAndUpdate(doc.userId, { roomNumber: generatedRoomNumber });
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
