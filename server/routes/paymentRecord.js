// routes/paymentRecord.js
const express = require('express');
const router = express.Router();
const Payment = require('../models/payment'); // Make sure the path is correct

// POST endpoint for updating a monthly payment record
router.post('/:paymentId/record', async (req, res) => {
  const paymentId = req.params.paymentId;
  try {
    const paymentRecord = await Payment.findByIdAndUpdate(
      paymentId,
      { status: "Paid" },
      { new: true }
    );
    if (!paymentRecord) {
      return res.status(404).json({ message: "Payment record not found." });
    }
    res.json({
      message: "Monthly payment recorded successfully.",
      payment: paymentRecord,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error recording monthly payment.",
      error: error.message,
    });
  }
});

module.exports = router;
