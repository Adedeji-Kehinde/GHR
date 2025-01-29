const mongoose = require('mongoose');

// Define Enquiry Schema
const EnquirySchema = new mongoose.Schema({
    requestId: {
        type: Number,
        unique: true,
        required: true,
    },
    roomNumber: {
        type: String,
        required: true, // Room number of the user
    },
    enquiryText: {
        type: String,
        required: true, // The content of the enquiry
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved'], // Status of the enquiry
        default: 'Pending', // Default status is Pending
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set to the current date and time
    },
    resolvedAt: {
        type: Date, // Optional field to track when the enquiry was resolved
    },
});

// Export Enquiry Model
const Enquiry = mongoose.model('Enquiry', EnquirySchema);
module.exports = Enquiry;
