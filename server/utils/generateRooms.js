// // utils/generateRooms.js
// const Building = require('../models/building');
// const Room = require('../models/room');
// const mongoose = require('mongoose');

// const generateBuildingsAndRooms = async () => {
//   try {
//     const buildings = ['1A', '1B', '2A', '2B'];
//     const floors = [0, 1, 2, 3, 4];
//     const totalApartmentsPerFloor = 10;
    
//     await Building.deleteMany(); // Clear existing data
//     await Room.deleteMany();

//     for (let block of buildings) {
//       await new Building({ block, floors, totalApartmentsPerFloor }).save();
      
//       for (let floor of floors) {
//         for (let apartment = 1; apartment <= totalApartmentsPerFloor; apartment++) {
//           const roomConfig = {
//             buildingBlock: block,
//             floor: floor,
//             apartmentNumber: apartment,
//             bedSpaces: {
//               A: { roomType: Math.random() > 0.5 ? 'Ensuite' : 'Twin Shared', occupied: false, bed1: false, bed2: false },
//               B: { roomType: Math.random() > 0.5 ? 'Ensuite' : 'Twin Shared', occupied: false, bed1: false, bed2: false },
//               C: { roomType: Math.random() > 0.5 ? 'Ensuite' : 'Twin Shared', occupied: false, bed1: false, bed2: false }
//             }
//           };
//           await new Room(roomConfig).save();
//         }
//       }
//     }

//     console.log('Buildings and Rooms generated successfully');
//   } catch (error) {
//     console.error('Error generating buildings and rooms:', error);
//   }
// };

// module.exports = generateBuildingsAndRooms;
