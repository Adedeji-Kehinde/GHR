const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const authenticateToken = require("../middleware/authMiddleware");
const Maintenance = require("../models/maintenance");
const admin = require('../utils/notificationService');
const User = require('../models/User');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory before Cloudinary upload

// 📌 **Register a Maintenance Request with Image Upload**
router.post("/register", authenticateToken, upload.array("images", 5), async (req, res) => {
    try {
        const { roomNumber, category, description, roomAccess } = req.body;
        const userId = req.user.id; // ✅ Get user ID from token

        // ✅ Validate category
        const validCategories = ["Appliances", "Cleaning", "Plumbing & Leaking", "Heating", "Lighting", "Windows & Doors", "Furniture & Fitting", "Flooring", "Other"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid maintenance category" });
        }

        // ✅ Find the last request and increment requestId
        const lastRequest = await Maintenance.findOne().sort({ requestId: -1 });
        const nextRequestId = lastRequest ? lastRequest.requestId + 1 : 1;

        // ✅ Upload images to Cloudinary
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            { folder: "maintenance-photos", resource_type: "image" }, // ✅ Save to maintenance-photos folder
                            (error, result) => (error ? reject(error) : resolve(result))
                        ).end(file.buffer);
                    });

                    imageUrls.push(result.secure_url);
                } catch (uploadError) {
                    console.error("❌ Cloudinary Upload Error:", uploadError);
                    return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
                }
            }
        }

        // ✅ Create a new maintenance request **with userId**
        const newRequest = new Maintenance({
            userId, // ✅ Store userId
            requestId: nextRequestId,
            roomNumber,
            category,
            description,
            roomAccess,
            pictures: imageUrls, // Store uploaded images
        });

        await newRequest.save();

        res.status(201).json({ message: "Maintenance request created successfully", request: newRequest });
    } catch (error) {
        console.error("❌ Error creating maintenance request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// 📌 **Get All Maintenance Requests**
router.get("/", authenticateToken, async (req, res) => {
    try {
        const maintenanceRequests = await Maintenance.find();

        if (!maintenanceRequests || maintenanceRequests.length === 0) {
            return res.status(404).json({ message: "No maintenance requests found" });
        }

        res.status(200).json(maintenanceRequests);
    } catch (error) {
        console.error("❌ Error fetching maintenance requests:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// PUT: Update a maintenance request
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate that status is provided and is one of the allowed values
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const validStatuses = ["In Process", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Build the update object: only status and completedAt fields will be updated
    const updateFields = { status };
    updateFields.completedAt = status === "Completed" ? new Date() : null;

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updatedMaintenance) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }

    // After updating, send a push notification to the user.
    // Find the user associated with this maintenance request by roomNumber.
    const user = await User.findOne({ roomNumber: updatedMaintenance.roomNumber });
    if (user && user.fcmToken) {
      const notificationMessage = {
        notification: {
          title: "Maintenance Request Update",
          body: `Your maintenance request ${updatedMaintenance.requestId || ""} is now ${updatedMaintenance.status}.`,
        },
        token: user.fcmToken,
      };

      admin.messaging().send(notificationMessage)
        .then(response => {
          console.log("Maintenance update notification sent successfully:", response);
        })
        .catch(error => {
          console.error("Error sending maintenance update notification:", error);
        });
    } else {
      console.log("User does not have an FCM token registered.");
    }

    res.json({ message: "Maintenance request updated successfully", maintenance: updatedMaintenance });
  } catch (error) {
    console.error("Error updating maintenance request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
  
  // DELETE: Delete a maintenance request
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const deletedMaintenance = await Maintenance.findByIdAndDelete(id);
      if (!deletedMaintenance) {
        return res.status(404).json({ message: "Maintenance request not found" });
      }
      res.json({ message: "Maintenance request deleted successfully" });
    } catch (error) {
      console.error("Error deleting maintenance request:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
module.exports = router;