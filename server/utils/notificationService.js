// utils/notificationService.js

const admin = require('firebase-admin');
const serviceAccount = require('../google-services.json'); // Adjust the path if your JSON is elsewhere

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Optional: Add databaseURL if needed
  // databaseURL: "https://your-database-name.firebaseio.com"
});

module.exports = admin;
