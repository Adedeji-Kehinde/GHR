// models/Announcement.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    attachments: [{ type: String }],
    approved: { type: Boolean, default: false },
    favouriteBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  }, { timestamps: true });  

module.exports = mongoose.model('Announcement', announcementSchema);
