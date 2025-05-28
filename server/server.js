const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');
// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors({
  origin: [
    'http://localhost:5173',               // dev
    'https://ghr-psi.vercel.app'        // your deployed front‑end
  ],
  credentials: true
}));
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process with failure
  });

// Serve static files from the downloads directory with proper MIME type
app.use('/downloads', express.static(path.join(__dirname, '../ghr-frontend/public/downloads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    }
  }
}));
  
// Routes
const authRoutes = require("./routes/auth"); // Import auth routes
app.use("/api/auth", authRoutes); // Mount auth routes under "/api/auth"
const imageRoutes = require("./routes/image"); // Import image routes
app.use("/api/image", imageRoutes); // Mount image routes under "/api/image"
const maintenanceRoutes = require("./routes/maintenance"); // Import maintenance routes
app.use("/api/maintenance", maintenanceRoutes); // Mount maintenance routes under "/api/maintenance"
const bookingRoutes = require("./routes/bookingRoute"); // Import booking routes
app.use("/api/booking", bookingRoutes); // Mount booking routes under "/api/booking"
const paymentRoutes = require("./routes/paymentRecord");
app.use("/api/payment", paymentRoutes);

// const generateBuildingsAndRooms = require('./utils/generateRooms');

// mongoose.connection.once('open', async () => {
//   await generateBuildingsAndRooms(); // Run once on server startup
// });

const paymentApp = require("../braintreeTutorial/app");
app.use("/payment", paymentApp);
// Base Route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start the Server
const PORT = process.env.PORT || 8000; // Use the port from .env or fallback to 8000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
