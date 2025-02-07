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
  
  if (room) {
    if (room.bedSpaces[this.bedSpace].occupied || room.bedSpaces[this.bedSpace].roomType !== this.roomType) {
      return next(new Error('Selected bed space is not available for the chosen room type.'));
    }
    
    room.bedSpaces[this.bedSpace].occupied = true;
    if (this.bedNumber) {
      room.bedSpaces[this.bedSpace][`bed${this.bedNumber}`] = true;
    }
    await room.save();
  }
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
