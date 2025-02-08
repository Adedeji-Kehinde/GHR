const express = require('express');
const mongoose = require('mongoose');
const authenticateToken = require('../middleware/authMiddleware');
const Booking = require('../models/booking');
const Room = require('../models/room');
const User = require('../models/User');

const router = express.Router();

// Get all rooms
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const allRooms = await Room.find();
    if (!allRooms.length) {
      return res.status(404).json({ message: 'No rooms found' });
    }
    res.json(allRooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});


// Create a new booking
router.post('/bookings', authenticateToken, async (req, res) => {
  try {
    const { buildingBlock, floor, apartmentNumber, bedSpace, bedNumber, roomType, lengthOfStay } = req.body;
    const userId = req.user.id;

    // Check if the user has already booked a room
    const existingBooking = await Booking.findOne({ userId });
    if (existingBooking) {
      return res.status(400).json({ message: 'User has already booked a room' });
    }

    // Check if the room exists and has the selected bed space available
    const room = await Room.findOne({
      buildingBlock,
      floor,
      apartmentNumber
    });

    // Create a booking
    const newBooking = new Booking({
      userId,
      buildingBlock,
      floor,
      apartmentNumber,
      bedSpace,
      bedNumber,
      roomType,
      lengthOfStay
    });
    await newBooking.save();

    // Mark the bed space as occupied
    room.bedSpaces[bedSpace].occupied = true;
    if (bedNumber) {
      room.bedSpaces[bedSpace][`bed${bedNumber}`] = true;
    }
    await room.save();

    res.status(201).json({ message: 'Room booked successfully', booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: 'Error booking room', error: error.message });
  }
});

// Get user booking details
router.get('/bookings/:userId', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({ userId: req.params.userId }).populate('userId', 'name email roomNumber');
    if (!booking) {
      return res.status(404).json({ message: 'No booking found for user' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking details', error: error.message });
  }
});

// DELETE a booking
router.delete('/bookings', authenticateToken, async (req, res) => {
  try {
    // Read bookingId from JSON body
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required in the request body' });
    }

    // 1) Find the booking document by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // 2) Grab relevant fields from the booking
    const { 
      buildingBlock, 
      floor, 
      apartmentNumber, 
      bedSpace, 
      bedNumber, 
      roomType, 
      userId 
    } = booking;

    // 3) Find the corresponding Room
    const room = await Room.findOne({
      buildingBlock,
      floor,
      apartmentNumber,
    });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // 4) Free up the bed in the Room document
    const subSpace = room.bedSpaces[bedSpace];
    if (!subSpace) {
      return res.status(400).json({ message: 'Invalid bed space in booking' });
    }

    // If it's 'Ensuite', set bed1 = false, occupied = false
    if (subSpace.roomType === 'Ensuite') {
      subSpace.bed1 = false;
      subSpace.occupied = false;
    }
    // If 'Twin Shared', free the specific bed and re-check occupancy
    else if (subSpace.roomType === 'Twin Shared') {
      if (!bedNumber) {
        return res.status(400).json({ message: 'Missing bedNumber for Twin Shared' });
      }
      subSpace[`bed${bedNumber}`] = false;
      if (!subSpace.bed1 && !subSpace.bed2) {
        subSpace.occupied = false;
      }
    }

    // Save the updated Room
    room.bedSpaces[bedSpace] = subSpace;
    await room.save();

    // 5) Delete the booking from the DB
    await Booking.findByIdAndDelete(bookingId);

    // 6) Update the user's roomNumber to null
    await User.findByIdAndUpdate(userId, { roomNumber: null });

    return res.json({ message: 'Booking deleted, bed freed, and user roomNumber cleared successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;
