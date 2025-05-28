// routes/booking.js
const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const Booking = require('../models/booking');
const Room = require('../models/room');
const User = require('../models/User');
const Payment = require('../models/payment'); // New Payment model
const cron = require('node-cron');
const { freeUpBed } = require('../utils/bookingUtils');
const generatePaymentSchedule = require("../utils/paymentSchedule");
const nodemailer = require('nodemailer');
const router = express.Router();
const moment = require('moment');

const VERIFIED_SENDER = 'adedejikehinde2004@gmail.com';
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

// Create a new booking
router.post('/bookings', authenticateToken, async (req, res) => {
  try {
    const { buildingBlock, floor, apartmentNumber, bedSpace, bedNumber, roomType, lengthOfStay, checkInDate, checkOutDate } = req.body;
    const userId = req.user.id;

    // Ensure one active booking per user
    const existingBooking = await Booking.findOne({ userId, status: 'Booked' });
    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'You already have an active booking' });
    }

    // Find room
    const room = await Room.findOne({ buildingBlock, floor, apartmentNumber });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Validate flexible dates
    if (lengthOfStay === 'Flexible') {
      if (!checkInDate || !checkOutDate) {
        return res.status(400).json({ message: 'Check‑in and check‑out required for Flexible stay' });
      }
      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        return res.status(400).json({ message: 'Check‑out must be after check‑in' });
      }
    }

    // Build and save booking
    const payload = { userId, buildingBlock, floor, apartmentNumber, bedSpace, bedNumber, roomType, lengthOfStay };
    if (lengthOfStay === 'Flexible') {
      payload.checkInDate = new Date(checkInDate);
      payload.checkOutDate = new Date(checkOutDate);
    }
    const newBooking = new Booking(payload);
    await newBooking.save();

    // Mark bed occupied
    const bs = room.bedSpaces[bedSpace];
    if (!bs) return res.status(400).json({ message: 'Invalid bed space' });
    if (roomType === 'Ensuite') {
      if (bs.bed1) return res.status(400).json({ message: 'This ensuite is already occupied.' });
      bs.bed1 = true; bs.occupied = true;
    } else {
      if (!bedNumber) return res.status(400).json({ message: 'Bed number required for Twin Shared.' });
      if (bedNumber !== '1' && bedNumber !== '2') return res.status(400).json({ message: 'Invalid bed number.' });
      if (bs[`bed${bedNumber}`]) return res.status(400).json({ message: `Bed ${bedNumber} is already occupied.` });
      bs[`bed${bedNumber}`] = true;
      if (bs.bed1 && bs.bed2) bs.occupied = true;
    }
    room.bedSpaces[bedSpace] = bs;
    await room.save();

    // Assign room number to user
    const roomNumber = `${room.buildingBlock}${room.floor}${String(room.apartmentNumber).padStart(2, '0')}${bedSpace}${bedNumber || ''}`;
    await User.findByIdAndUpdate(userId, { roomNumber });

    // Generate and save payments
    const rate = roomType === "Ensuite" ? 40 : 30;
    const schedule = generatePaymentSchedule(newBooking.checkInDate, newBooking.checkOutDate, rate);
    const payments = schedule.map(item => ({
      bookingId: newBooking._id,
      stayMonth: item.stayMonth,
      stayDates: item.stayDates,
      nights: item.nights,
      amount: item.amount,
      dueDate: item.dueDate,
      status: "Unpaid"
    }));
    await Payment.insertMany(payments);

    // Prepare detailed confirmation email
    const user = await User.findById(userId);
    const totalCost = payments.reduce((sum, p) => sum + p.amount, 0);
    const scheduleLines = schedule.map(i =>
      `- ${i.stayMonth}: €${i.amount} due ${i.dueDate.toDateString()}`
    ).join('\n');

    const mailOptionsUser = {
      from: `"GHR Booking" <${VERIFIED_SENDER}>`,
      to: user.email,
      subject: `Booking Confirmation - ${newBooking._id}`,
      text: `Hi ${user.name},

Your booking is confirmed with the following details:

•Booking ID: ${newBooking._id}
•Building: ${buildingBlock}
•Floor: ${floor}
•Apartment: ${apartmentNumber}
•Room Type: ${roomType}
•Bed Space: ${bedSpace}
•${bedNumber ? `Bed Number: ${bedNumber}\n` : ''}Room Number: ${roomNumber}
•Stay Type: ${lengthOfStay}
•${lengthOfStay === 'Flexible' ? `Check-In: ${payload.checkInDate.toDateString()}\nCheck-Out: ${payload.checkOutDate.toDateString()}\n` : ''}
•Price/Night: €${rate}
•Total Nights: ${payments.reduce((sum, p) => sum + p.nights, 0)}
•Total Cost: €${totalCost}

Deposit Paid: €300.00
Date of Payment: ${moment().format('DD MMM YYYY')}

Payment Schedule:
${scheduleLines}

Thank you for choosing Griffith Halls Residence.

Best regards,
Griffith Halls Residence
      `
    };

    const mailOptionsAdmin = {
      from: `"GHR Booking" <${VERIFIED_SENDER}>`,
      to: VERIFIED_SENDER,
      subject: `New Booking - ${newBooking._id}`,
      text: `New booking by ${user.name} (${user.email}):\nBooking ID: ${newBooking._id}\nRoom Number: ${roomNumber}\nTotal Cost: €${totalCost}`
    };

    // Send emails
    const [userInfo, adminInfo] = await Promise.all([
      transporter.sendMail(mailOptionsUser),
      transporter.sendMail(mailOptionsAdmin)
    ]);

    console.log('User email sent:', userInfo.messageId);
    console.log('Admin email sent:', adminInfo.messageId);


    res.status(201).json({ message: 'Booking created and emails sent', booking: newBooking });
  } catch (err) {
    console.error('Error booking & emailing:', err);
    res.status(500).json({ message: 'Error booking room', error: err.message });
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

router.get('/bookings/:bookingId', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('userId', 'name lastName roomNumber');
      
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Fetch related payments and sort by dueDate in ascending order
    const payments = await Payment.find({ bookingId: req.params.bookingId }).sort({ dueDate: 1 });

    res.json({ booking, payments });
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
        // Free bed + clear user.roomNumber
        await freeUpBed(booking);
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

// Delete a booking by its ID, and also delete associated Payment documents.
// DELETE a booking by its ID, and only free up bed if it was still active
router.delete('/bookings/:bookingId', authenticateToken, async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId).populate('userId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // ONLY free the bed and clear the user.roomNumber if this booking was still Booked
    if (booking.status === 'Booked') {
      await freeUpBed(booking);
    }

    // Remove associated payments
    await Payment.deleteMany({ bookingId: booking._id });
    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);

    return res.json({
      message: booking.status === 'Booked'
        ? 'Booking deleted, bed freed, and user room number cleared.'
        : 'Booking deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
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

// Run every minute — update any “Booked” whose checkout ≤ now
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Find all bookings that should expire
    const expiredBookings = await Booking.find({
      status: 'Booked',
      checkOutDate: { $lte: now }
    });

    // Update each booking’s status and clear its user’s roomNumber
    for (const booking of expiredBookings) {
      // Free bed + clear user’s roomNumber
      await freeUpBed(booking);
      await Booking.findByIdAndUpdate(booking._id, { status: 'Expired' });
    }

    if (expiredBookings.length) {
      console.log(`Expired ${expiredBookings.length} booking(s) and cleared their users' room numbers.`);
    }
  } catch (err) {
    console.error('Booking expiration job error:', err);
  }
});
module.exports = router;
