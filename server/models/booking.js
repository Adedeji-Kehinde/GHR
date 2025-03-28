const mongoose = require('mongoose');

// Helper function to compute check-in and check-out dates based on the selected length of stay.
function computeDates(lengthOfStay) {
  let checkInDate, checkOutDate;
  const currentYear = new Date().getFullYear();

  if (lengthOfStay === 'First Semester') {
    // First Semester starts on 1st September
    checkInDate = new Date(currentYear, 8, 1); // September 1
    checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + 17 * 7); // 17 weeks later
  } else if (lengthOfStay === 'Second Semester') {
    // Second Semester starts on 1st January of the following year
    checkInDate = new Date(currentYear + 1, 0, 1); // January 1 of next year
    checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + 17 * 7);
  } else if (lengthOfStay === 'Summer') {
    // Summer starts on 1st May
    checkInDate = new Date(currentYear, 4, 1); // May 1
    checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + 17 * 7);
  } else if (lengthOfStay === 'Full Year') {
    // Full Year: from September 1 to the following September 1
    checkInDate = new Date(currentYear, 8, 1); // September 1
    checkOutDate = new Date(currentYear + 1, 8, 1);
  }
  return { checkInDate, checkOutDate };
}

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  buildingBlock: { type: String, required: true },
  floor: { type: Number, required: true },
  apartmentNumber: { type: Number, required: true },
  bedSpace: { type: String, enum: ['A','B','C'], required: true },
  bedNumber: { type: String, enum: ['1','2'] },
  roomType: { type: String, enum: ['Ensuite','Twin Shared'], required: true },
  lengthOfStay: {
    type: String,
    enum: ['Summer','First Semester','Second Semester','Full Year','Flexible'],
    required: true
  },
  checkInDate: {
    type: Date,
    required: function() { return this.lengthOfStay === 'Flexible'; }
  },
  checkOutDate: {
    type: Date,
    required: function() { return this.lengthOfStay === 'Flexible'; }
  },
  status: { type: String, enum: ['Booked','Cancelled','Expired'], default: 'Booked' }
});

// Auto‑calculate fixed‑term dates; leave flexible untouched
BookingSchema.pre('save', async function(next) {
  if (this.lengthOfStay !== 'Flexible') {
    const { checkInDate, checkOutDate } = computeDates(this.lengthOfStay);
    this.checkInDate = checkInDate;
    this.checkOutDate = checkOutDate;
  }

  // Update status to "Expired" if the check-out date is in the past.
  if (this.checkOutDate && this.checkOutDate < new Date() && this.status === 'Booked') {
    this.status = 'Expired';
  }
  
  // Room occupancy validations and updates.
  const Room = mongoose.model('Room');
  const room = await Room.findOne({
    buildingBlock: this.buildingBlock,
    floor: this.floor,
    apartmentNumber: this.apartmentNumber
  });
  if (!room) {
    return next(new Error('Room not found.'));
  }
  const bedSpaceData = room.bedSpaces[this.bedSpace];
  if (!bedSpaceData) {
    return next(new Error('Invalid bed space selected.'));
  }
  if (bedSpaceData.roomType !== this.roomType) {
    return next(new Error('Selected bed space is not available for the chosen room type.'));
  }

  if (bedSpaceData.roomType === 'Ensuite') {
    if (bedSpaceData.bed1) {
      return next(new Error('This ensuite is already occupied.'));
    }
    bedSpaceData.bed1 = true;
    bedSpaceData.occupied = true;
  } else if (bedSpaceData.roomType === 'Twin Shared') {
    if (bedSpaceData.bed1 && bedSpaceData.bed2) {
      return next(new Error('This Twin Shared space is fully occupied.'));
    }
    if (this.bedNumber) {
      bedSpaceData[`bed${this.bedNumber}`] = true;
    } else {
      return next(new Error('Bed number is required for Twin Shared.'));
    }
    bedSpaceData.occupied = bedSpaceData.bed1 && bedSpaceData.bed2;
  }
  room.bedSpaces[this.bedSpace] = bedSpaceData;
  await room.save();

  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
