// routes/paymentRecord.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Payment = require('../models/payment');
const Booking = require('../models/booking');
const User = require('../models/User');
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

// POST /api/payment/:paymentId/record
router.post('/:paymentId/record', async (req, res) => {
  const { paymentId } = req.params;

  try {
    // 1. Mark the payment as paid
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status: 'Paid' },
      { new: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }

    // 2. Fetch the booking and user
    const booking = await Booking.findById(payment.bookingId).populate('userId', 'name lastName email');
    if (!booking) {
      return res.status(404).json({ message: 'Associated booking not found.' });
    }
    const user = booking.userId;

    // 3. Prepare your email content
    const mailOptionsUser = {
      from: `"GHR Payments" <${VERIFIED_SENDER}>`,
      to: user.email,
      subject: `Payment Confirmation for Month Rent ${booking._id}`,
      text: `
Hi ${user.name},

We have received your payment. Here are the details for your records:

Booking ID: ${booking._id}
Stay Month: ${payment.stayMonth}
Stay Dates: ${payment.stayDates}
Nights: ${payment.nights}
Amount Paid: €${payment.amount}
Due Date: ${moment(payment.dueDate).format('DD MMM YYYY')}

Thank you for your prompt payment. If you have any questions, just reply to this email.

Best regards,
Griffith Halls Residence
      `
    };

    // (Optional) you can send an admin notification too:
    const mailOptionsAdmin = {
      from: `"GHR Payments" <${VERIFIED_SENDER}>`,
      to: VERIFIED_SENDER,
      subject: `Payment Received for Booking ${booking._id}`,
      text: `User ${user.name} (${user.email}) has just paid €${payment.amount} for booking ${booking._id}.`
    };

    // 4. Send the emails in parallel
    const [userInfo, adminInfo] = await Promise.all([
      transporter.sendMail(mailOptionsUser),
      transporter.sendMail(mailOptionsAdmin)
    ]);

    console.log('User email sent:', userInfo.messageId);
    console.log('Admin email sent:', adminInfo.messageId);

    // 5. Return success
    res.json({ message: 'Monthly payment recorded and email sent.', payment });
  } catch (err) {
    console.error('Error recording monthly payment and sending emails:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
