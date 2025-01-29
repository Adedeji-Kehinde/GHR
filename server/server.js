const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for cross-origin requests

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

// Routes
const authRoutes = require("./routes/auth"); // Import auth routes
const maintenanceRoutes = require("./routes/auth"); // Maintenance functionality is part of auth.js

// Mount routes
app.use("/api/auth", authRoutes); // Mount all routes under "/api/auth"

// Base Route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: "Internal Server Error" });
});

// Multer Storage Configuration (if you have general image handling at the server level)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPEG, JPG, and PNG images are allowed!"));
    }
  },
});

// Sample image upload endpoint
app.post("/upload", upload.array("pictures", 5), async (req, res) => {
  try {
    const processedImages = await Promise.all(
      req.files.map(async (file) => {
        const processedImage = await sharp(file.buffer)
          .resize(800, 800, { fit: 'inside' })
          .jpeg({ quality: 80 })
          .toBuffer();
        
        return {
          filename: file.originalname,
          mimetype: 'image/jpeg',
          size: processedImage.length,
          buffer: processedImage
        };
      })
    );
    
    res.status(200).json({ message: "Images uploaded and processed successfully", images: processedImages });
  } catch (error) {
    res.status(500).json({ message: "Error processing images", error: error.message });
  }
});

// Start the Server
const PORT = process.env.PORT || 8000; // Use the port from .env or fallback to 8000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});