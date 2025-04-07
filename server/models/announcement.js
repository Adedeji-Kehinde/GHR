// models/Announcement.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    // Attachments could be URLs or paths to files stored on your server/cloud
    attachments: [{ type: String }],
    approved: { type: Boolean, default: false },
    favourite: { type: Boolean, default: false },
    // Optionally, store who created the announcement (e.g., admin id)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Announcement', announcementSchema);
