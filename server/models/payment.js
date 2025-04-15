// models/Payment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  stayMonth: { type: String, required: true },
  stayDates: { type: String, required: true },
  nights: { type: Number, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["Unpaid", "Paid"], default: "Unpaid" },
});

module.exports = mongoose.model("Payment", PaymentSchema);
