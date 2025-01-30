const express = require("express");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const authenticate = require("../middleware/authMiddleware");
const multer = require("multer");
const dotenv = require("dotenv");

dotenv.config(); // ✅ Load environment variables

// ✅ Configure Cloudinary properly
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// 📌 **Upload Image**
router.post("/upload", authenticate, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    console.log("✅ File received:", req.file.originalname);
    console.log("✅ User ID:", req.user.id);

    cloudinary.uploader.upload_stream(
      { 
        resource_type: "image", 
        folder: "user_photos", 
        timeout: 60000, // 1 min timeout
        eager: [{ width: 500, height: 500, crop: "limit", quality: "auto" }]
      },
      async (error, result) => {
        if (error) {
          console.error("❌ Cloudinary Upload Error:", error);
          return res.status(500).json({ message: "Cloudinary upload failed", error: error.message });
        }

        try {
          // ✅ **Find User**
          const user = await User.findById(req.user.id);
          if (!user) {
            console.error("❌ User Not Found");
            return res.status(404).json({ message: "User not found" });
          }

          // ✅ **Delete old avatar from Cloudinary**
          if (user.avatarPublicId) {
            console.log("🛑 Deleting old avatar:", user.avatarPublicId);
            await cloudinary.uploader.destroy(user.avatarPublicId);
          }

          // ✅ **Update User Profile with New Avatar**
          user.avatarUrl = result.secure_url;
          user.avatarPublicId = result.public_id;
          await user.save();

          return res.status(201).json({ 
            message: "Image uploaded successfully", 
            avatarUrl: user.avatarUrl 
          });

        } catch (dbError) {
          console.error("❌ MongoDB Save Error:", dbError);
          await cloudinary.uploader.destroy(result.public_id, { resource_type: "image" });
          return res.status(500).json({ message: "MongoDB save failed", error: dbError.message });
        }
      }
    ).end(req.file.buffer);
    
  } catch (error) {
    console.error("❌ Server Error:", error);
    return res.status(500).json({ message: "Unexpected server error", error: error.message });
  }
});

module.exports = router;
