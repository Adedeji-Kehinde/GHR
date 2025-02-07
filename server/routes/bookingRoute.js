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

    if (!room || room.bedSpaces[bedSpace].occupied || room.bedSpaces[bedSpace].roomType !== roomType) {
      return res.status(400).json({ message: 'Selected bed space is not available for the chosen room type' });
    }

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

module.exports = router;
