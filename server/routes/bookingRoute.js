// routes/booking.js
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const Booking = require('../models/booking');
const Room = require('../models/room');
const User = require('../models/User');

const router = express.Router();

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

    // Check if the room exists
    const room = await Room.findOne({ buildingBlock, floor, apartmentNumber });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Create the booking
    const newBooking = new Booking({
      userId,
      buildingBlock,
      floor,
      apartmentNumber,
      bedSpace,
      bedNumber,
      roomType,
      lengthOfStay,
    });
    await newBooking.save();

    // Update room occupancy based on room type
    const bedSpaceData = room.bedSpaces[bedSpace];
    if (!bedSpaceData) {
      return res.status(400).json({ message: 'Invalid bed space' });
    }
    if (roomType === 'Ensuite') {
      if (bedSpaceData.bed1) {
        return res.status(400).json({ message: 'This ensuite is already occupied.' });
      }
      bedSpaceData.bed1 = true;
      bedSpaceData.occupied = true;
    } else if (roomType === 'Twin Shared') {
      if (bedNumber) {
        if (bedNumber === '1') {
          if (bedSpaceData.bed1) {
            return res.status(400).json({ message: 'Bed 1 is already occupied.' });
          }
          bedSpaceData.bed1 = true;
        } else if (bedNumber === '2') {
          if (bedSpaceData.bed2) {
            return res.status(400).json({ message: 'Bed 2 is already occupied.' });
          }
          bedSpaceData.bed2 = true;
        } else {
          return res.status(400).json({ message: 'Invalid bed number.' });
        }
        if (bedSpaceData.bed1 && bedSpaceData.bed2) {
          bedSpaceData.occupied = true;
        }
      } else {
        return res.status(400).json({ message: 'Bed number is required for Twin Shared.' });
      }
    }
    room.bedSpaces[bedSpace] = bedSpaceData;
    await room.save();

    res.status(201).json({ message: 'Room booked successfully', booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: 'Error booking room', error: error.message });
  }
});

// Get all bookings with populated occupant details
router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const allBookings = await Booking.find().populate('userId', 'name lastName roomNumber');
    if (!allBookings.length) {
      return res.status(404).json({ message: 'No bookings found' });
    }
    res.json(allBookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Get a single booking by its ID (with occupant details)
router.get('/bookings/:bookingId', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('userId', 'name lastName roomNumber');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking details', error: error.message });
  }
});

// Update a booking by its ID (partial update allowed)
router.put('/bookings/:bookingId', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const { status, lengthOfStay } = req.body; // Both fields are optional

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updateFields = {};
    const { buildingBlock, floor, apartmentNumber, bedSpace, bedNumber, roomType, userId } = booking;

    if (status && status !== booking.status) {
      if (status === 'Cancelled' && booking.status !== 'Cancelled') {
        // Free up the bed (same as DELETE)
        const room = await Room.findOne({ buildingBlock, floor, apartmentNumber });
        if (!room) {
          return res.status(404).json({ message: 'Room not found' });
        }
        const bedSpaceData = room.bedSpaces[bedSpace];
        if (!bedSpaceData) {
          return res.status(400).json({ message: 'Invalid bed space in booking' });
        }
        if (roomType === 'Ensuite') {
          bedSpaceData.bed1 = false;
          bedSpaceData.occupied = false;
        } else if (roomType === 'Twin Shared') {
          if (!bedNumber) {
            return res.status(400).json({ message: 'Missing bed number for Twin Shared' });
          }
          if (bedNumber === '1') {
            bedSpaceData.bed1 = false;
          } else if (bedNumber === '2') {
            bedSpaceData.bed2 = false;
          }
          if (!bedSpaceData.bed1 && !bedSpaceData.bed2) {
            bedSpaceData.occupied = false;
          }
        }
        room.bedSpaces[bedSpace] = bedSpaceData;
        await room.save();
        await User.findByIdAndUpdate(userId, { roomNumber: null });
        updateFields.status = status;
      } else if (status === 'Booked' && booking.status === 'Cancelled') {
        // Reallocate the room back to the user.
        const room = await Room.findOne({ buildingBlock, floor, apartmentNumber });
        if (!room) {
          return res.status(404).json({ message: 'Room not found' });
        }
        const bedSpaceData = room.bedSpaces[bedSpace];
        if (!bedSpaceData) {
          return res.status(400).json({ message: 'Invalid bed space in booking' });
        }
        if (roomType === 'Ensuite') {
          if (bedSpaceData.bed1) {
            return res.status(400).json({ message: 'This ensuite is already occupied.' });
          }
          bedSpaceData.bed1 = true;
          bedSpaceData.occupied = true;
        } else if (roomType === 'Twin Shared') {
          if (!bedNumber) {
            return res.status(400).json({ message: 'Bed number is required for Twin Shared.' });
          }
          if (bedNumber === '1') {
            if (bedSpaceData.bed1) {
              return res.status(400).json({ message: 'Bed 1 is already occupied.' });
            }
            bedSpaceData.bed1 = true;
          } else if (bedNumber === '2') {
            if (bedSpaceData.bed2) {
              return res.status(400).json({ message: 'Bed 2 is already occupied.' });
            }
            bedSpaceData.bed2 = true;
          }
          if (bedSpaceData.bed1 && bedSpaceData.bed2) {
            bedSpaceData.occupied = true;
          }
        }
        room.bedSpaces[bedSpace] = bedSpaceData;
        await room.save();
        const generatedRoomNumber = `${room.buildingBlock}${room.floor}${String(room.apartmentNumber).padStart(2, '0')}${bedSpace}${bedNumber || ''}`;
        await User.findByIdAndUpdate(userId, { roomNumber: generatedRoomNumber });
        updateFields.status = status;
      } else {
        updateFields.status = status;
      }
    }

    if (lengthOfStay) {
      updateFields.lengthOfStay = lengthOfStay;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: updateFields },
      { new: true }
    ).populate('userId', 'name lastName roomNumber');

    res.json({ message: 'Booking updated successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
});

// Delete a booking by its ID
router.delete('/bookings/:bookingId', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const { buildingBlock, floor, apartmentNumber, bedSpace, bedNumber, roomType, userId } = booking;
    const room = await Room.findOne({ buildingBlock, floor, apartmentNumber });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const bedSpaceData = room.bedSpaces[bedSpace];
    if (!bedSpaceData) {
      return res.status(400).json({ message: 'Invalid bed space in booking' });
    }
    if (roomType === 'Ensuite') {
      bedSpaceData.bed1 = false;
      bedSpaceData.occupied = false;
    } else if (roomType === 'Twin Shared') {
      if (!bedNumber) {
        return res.status(400).json({ message: 'Missing bed number for Twin Shared' });
      }
      if (bedNumber === '1') {
        bedSpaceData.bed1 = false;
      } else if (bedNumber === '2') {
        bedSpaceData.bed2 = false;
      }
      if (!bedSpaceData.bed1 && !bedSpaceData.bed2) {
        bedSpaceData.occupied = false;
      }
    }
    room.bedSpaces[bedSpace] = bedSpaceData;
    await room.save();

    await Booking.findByIdAndDelete(bookingId);
    await User.findByIdAndUpdate(userId, { roomNumber: null });

    res.json({ message: 'Booking deleted, bed freed, and user room number cleared successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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

// GET all rooms with aggregated availability 
router.get('/rooms-available', authenticateToken, async (req, res) => {
  try {
    const allRooms = await Room.find();
    if (!allRooms.length) {
      return res.status(404).json({ message: 'No rooms found' });
    }

    // Compute availability per building block
    const availability = {};
    allRooms.forEach(room => {
      const block = room.buildingBlock;
      if (!availability[block]) {
        availability[block] = {
          totalRooms: 0,
          availableRooms: 0,
          availableBedSpaces: 0,
          rooms: []  // Array to hold details of each available bedSpace
        };
      }
      availability[block].totalRooms++;

      let availableCountForRoom = 0;
      // Check each bedSpace in this room
      for (const key in room.bedSpaces) {
        const bs = room.bedSpaces[key];
        if (!bs.occupied) {
          availableCountForRoom++;
        }
      }
      if (availableCountForRoom > 0) {
        availability[block].availableRooms++;
        availability[block].availableBedSpaces += availableCountForRoom;
        // For each available bedSpace, add a detail record (include floor, remove lengthOfStay)
        for (const key in room.bedSpaces) {
          const bs = room.bedSpaces[key];
          if (!bs.occupied) {
            if (bs.roomType === 'Ensuite') {
              availability[block].rooms.push({
                apartmentNumber: room.apartmentNumber,
                floor: room.floor, // Include floor here
                bedSpace: key,
                bedNumber: "1",
                roomType: bs.roomType,
              });
            } else if (bs.roomType === 'Twin Shared') {
              if (!bs.bed1) {
                availability[block].rooms.push({
                  apartmentNumber: room.apartmentNumber,
                  floor: room.floor,
                  bedSpace: key,
                  bedNumber: "1",
                  roomType: bs.roomType,
                });
              }
              if (!bs.bed2) {
                availability[block].rooms.push({
                  apartmentNumber: room.apartmentNumber,
                  floor: room.floor,
                  bedSpace: key,
                  bedNumber: "2",
                  roomType: bs.roomType,
                });
              }
            }
          }
        }
      }
    });

    res.json({ rooms: allRooms, availability });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});


module.exports = router;
