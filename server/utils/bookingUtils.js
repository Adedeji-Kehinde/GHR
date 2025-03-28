// utils/bookingUtils.js

const Room = require('../models/room');
const User = require('../models/User');

async function freeUpBed({ buildingBlock, floor, apartmentNumber, bedSpace, bedNumber, roomType, userId }) {
  const room = await Room.findOne({ buildingBlock, floor, apartmentNumber });
  if (!room) throw new Error('Room not found');

  const bs = room.bedSpaces[bedSpace];
  if (!bs) throw new Error('Invalid bed space');

  if (roomType === 'Ensuite') {
    bs.bed1 = false;
    bs.occupied = false;
  } else {
    if (!bedNumber) throw new Error('Missing bed number for Twin Shared');
    if (bedNumber === '1') bs.bed1 = false;
    else bs.bed2 = false;
    bs.occupied = !!(bs.bed1 && bs.bed2);
  }

  room.bedSpaces[bedSpace] = bs;
  await room.save();

  // Clear the user's room assignment
  if (userId) {
    await User.findByIdAndUpdate(userId, { roomNumber: null });
  }
}

module.exports = { freeUpBed };
