const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// Define Maintenance Request Schema
const MaintenanceSchema = new mongoose.Schema({
  requestId: {
    type: Number,
    unique: true,
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Appliances", "Cleaning", "Plumbing & Leaking", "Heating", "Lighting", "Windows & Doors", "Furniture & Fitting", "Flooring", "Other"],
  },
  description: {
    type: String,
  },
  roomAccess: {
    type: String,
    required: true,
    enum: ['Yes', 'No'],
  },
  pictures: [{
    data: Buffer,
    contentType: String,
    filename: String
  }],
  status: {
    type: String,
    required: true,
    enum: ['In Process', 'Completed'],
    default: 'In Process',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Middleware to process image before saving
MaintenanceSchema.pre('save', async function(next) {
  if (!this.isModified('pictures')) return next();

  try {
    for (let i = 0; i < this.pictures.length; i++) {
      if (this.pictures[i].data) {
        const processedImage = await sharp(this.pictures[i].data)
          .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        this.pictures[i].data = processedImage;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Export Maintenance Model and upload middleware
const Maintenance = mongoose.model('Maintenance', MaintenanceSchema);
module.exports = { Maintenance, upload };