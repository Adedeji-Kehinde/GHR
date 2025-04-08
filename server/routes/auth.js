const express = require('express');
const User = require('../models/User');
const Delivery = require('../models/deliveries');
const Enquiry = require('../models/enquiries');
const ContactUs = require("../models/contactus");
const Testimonial = require("../models/testimonials");
const Announcement = require('../models/announcement');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware.js');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const nodemailer = require('nodemailer');
const admin = require('../utils/notificationService');

router.post("/firebase-register", async (req, res) => {
  const { idToken, name, lastName, gender, phone } = req.body;

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, uid } = decoded;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name,
        lastName,
        gender,
        phone,
        password: uid // Not used
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("Firebase Register Error:", err);
    res.status(401).json({ error: "Invalid Firebase ID token" });
  }
});


router.post("/firebase-login", async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;

    if (!email) {
      return res.status(400).json({ error: "Email not found in Firebase token" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const [firstName, lastName] = name?.split(" ") || ["User"];
      user = new User({
        email,
        name: firstName,
        lastName: lastName || "",
        profileImageUrl: picture,
        password: uid // Not used
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Firebase login error:", error);
    res.status(401).json({ error: "Invalid Firebase token" });
  }
});


// Update FCM token for a user
router.put('/updateToken', authenticateToken, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required" });
    }
    // Update the user's fcmToken field
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fcmToken },
      { new: true }
    ).select('-password'); // Exclude the password field

    res.status(200).json({
      message: "FCM token updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/update-image", authenticateToken, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let newProfileImageUrl;
        let newPublicId;
        try {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "user_photos", resource_type: "image" },
                    (error, result) => (error ? reject(error) : resolve(result))
                ).end(req.file.buffer);
            });

            newProfileImageUrl = result.secure_url;
            newPublicId = result.public_id;
        } catch (uploadError) {
            console.error("Cloudinary Upload Error:", uploadError);
            return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
        }

        if (user.avatarPublicId) {
            await cloudinary.uploader.destroy(user.avatarPublicId);
        }

        user.profileImageUrl = newProfileImageUrl;
        user.avatarPublicId = newPublicId;
        await user.save();

        res.status(200).json({
            message: "Profile image updated successfully",
            profileImageUrl: user.profileImageUrl,
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Fetch user
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Fetch all users
router.get('/users', authenticateToken, async (req, res) => {
    try {
      // Fetch all users, excluding the password field
      const users = await User.find().select('-password');
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

// Update personal information (including greeting fields)
router.put('/updatePersonal', authenticateToken, async (req, res) => {
  try {
    // Build an update object with only the defined fields from the request
    const updateData = {};
    Object.keys(req.body).forEach((key) => {
      // If the value is not undefined, update it.
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password'); // Exclude the password field

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Personal information updated', user: updatedUser });
  } catch (error) {
    console.error("Error updating personal info:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update emergency contacts 
router.put('/updateEmergency', authenticateToken, async (req, res) => {
  try {
    const { emergencyContacts } = req.body; // Expecting an array
    if (!emergencyContacts || !Array.isArray(emergencyContacts)) {
      return res.status(400).json({ message: 'Emergency contacts must be provided as an array' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { emergencyContacts },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Emergency contacts updated', user: updatedUser });
  } catch (error) {
    console.error("Error updating emergency contacts:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});
  
router.post('/deliveries', authenticateToken, async (req, res) => {
    try {
        const { sender, parcelType, description, roomNumber } = req.body;

        const validParcelTypes = ['Letter', 'Package'];
        if (!validParcelTypes.includes(parcelType)) {
            return res.status(400).json({ message: 'Invalid parcel type' });
        }

        if (!roomNumber) {
            return res.status(400).json({ message: 'Room number is required' });
        }

        let parcelNumber;
        let isUnique = false;

        while (!isUnique) {
            parcelNumber = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
            const existingDelivery = await Delivery.findOne({ parcelNumber });

            if (!existingDelivery) {
                isUnique = true;
            } else if (existingDelivery.status === 'Collected' || existingDelivery.status === 'Cancelled') {
                await Delivery.deleteOne({ parcelNumber });
                isUnique = true;
            }
        }

        const newDelivery = new Delivery({
            parcelNumber,
            sender: sender || null,
            parcelType,
            description: description || null,
            status: "To Collect",
            roomNumber
        });

        await newDelivery.save();
        const user = await User.findOne({ roomNumber });
        if (user && user.fcmToken) {
          const message = {
            notification: {
              title: "New Delivery Arrived",
              body: `Your parcel ${newDelivery.parcelNumber} is ready for collection.`,
            },
            token: user.fcmToken
          };

          admin.messaging().send(message)
            .then(response => {
              console.log("Push notification sent successfully:", response);
            })
            .catch(error => {
              console.error("Error sending push notification:", error);
            });
        } else {
          console.log("User does not have an FCM token registered.");
        }
        res.status(201).json({ message: 'Parcel added successfully', delivery: newDelivery });
    } catch (error) {
        console.error('Parcel creation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/deliveries', authenticateToken, async (req, res) => {
    try {
        const deliveries = await Delivery.find();
        if (!deliveries || deliveries.length === 0) {
            return res.status(404).json({ message: 'No deliveries found' });
        }

        res.json(deliveries);
    } catch (error) {
        console.error('Deliveries fetch error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/deliveries/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { sender, parcelType, description, roomNumber, status } = req.body;
  
      const validParcelTypes = ['Letter', 'Package'];
      if (!validParcelTypes.includes(parcelType)) {
        return res.status(400).json({ message: 'Invalid parcel type' });
      }
  
      const validStatuses = ['To Collect', 'Collected', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
  
      const updateFields = { sender, parcelType, description, roomNumber, status };
      if (status === 'Collected') {
        updateFields.collectedAt = new Date();
      } else {
        updateFields.collectedAt = null;
      }
  
      const updatedDelivery = await Delivery.findByIdAndUpdate(id, updateFields, { new: true });
      if (!updatedDelivery) {
        return res.status(404).json({ message: 'Delivery not found' });
      }
  
      // Send a push notification to the user
      const user = await User.findOne({ roomNumber: updatedDelivery.roomNumber });
      if (user && user.fcmToken) {
        const message = {
          notification: {
            title: "Delivery Updated",
            body: `Your delivery ${updatedDelivery.parcelNumber} status is now ${updatedDelivery.status}.`,
          },
          token: user.fcmToken,
        };

        admin.messaging().send(message)
          .then(response => {
            console.log("Notification sent successfully:", response);
          })
          .catch(error => {
            console.error("Error sending notification:", error);
          });
      } else {
        console.log("User does not have an FCM token registered.");
      }

      return res.json({ message: 'Delivery updated successfully', delivery: updatedDelivery });
    } catch (error) {
      console.error('Delivery update error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
router.delete('/deliveries/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedDelivery = await Delivery.findByIdAndDelete(id);
      if (!deletedDelivery) {
        return res.status(404).json({ message: 'Delivery not found' });
      }
  
      return res.json({ message: 'Delivery deleted successfully' });
    } catch (error) {
      console.error('Delivery deletion error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
});
  
router.post('/enquiries', authenticateToken, async (req, res) => {
    try {
        const { roomNumber, enquiryText } = req.body;

        if (!roomNumber || !enquiryText) {
            return res.status(400).json({ message: 'Room number and enquiry text are required' });
        }

        const lastRequest = await Enquiry.findOne().sort({ requestId: -1 });
        const nextRequestId = lastRequest ? lastRequest.requestId + 1 : 1;

        const newEnquiry = new Enquiry({
            requestId: nextRequestId,
            roomNumber,
            enquiryText,
        });

        await newEnquiry.save();
        res.status(201).json({ message: 'Enquiry submitted successfully', enquiry: newEnquiry });
    } catch (error) {
        console.error('Error creating enquiry:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/enquiries', authenticateToken, async (req, res) => {
    try {
        const enquiries = await Enquiry.find();

        if (!enquiries || enquiries.length === 0) {
            return res.status(404).json({ message: 'No enquiries found' });
        }

        res.status(200).json(enquiries);
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/auth/enquiries/:id - Update an enquiry (status and response)
router.put('/enquiries/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, response } = req.body;
  
      const validStatuses = ['Pending', 'Resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
  
      const updateFields = { status, response };
      // If status is resolved, set resolvedAt timestamp
      if (status === 'Resolved') {
        updateFields.resolvedAt = new Date();
      } else {
        updateFields.resolvedAt = null;
      }
  
      const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, updateFields, { new: true });
      if (!updatedEnquiry) {
        return res.status(404).json({ message: 'Enquiry not found' });
      }
      const user = await User.findOne({ roomNumber: updatedEnquiry.roomNumber });
      if (user && user.fcmToken) {
        const notificationMessage = {
          notification: {
            title: "Enquiry Update",
            body: `Your enquiry has been updated to ${updatedEnquiry.status}.`,
          },
          token: user.fcmToken,
        };

        admin.messaging().send(notificationMessage)
          .then(response => {
            console.log("Enquiry update notification sent successfully:", response);
          })
          .catch(error => {
            console.error("Error sending enquiry update notification:", error);
          });
      } else {
        console.log("User does not have an FCM token registered.");
      }
      res.json({ message: 'Enquiry updated successfully', enquiry: updatedEnquiry });
    } catch (error) {
      console.error('Error updating enquiry:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
});
  
// DELETE /api/auth/enquiries/:id - Delete an enquiry
router.delete('/enquiries/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const deletedEnquiry = await Enquiry.findByIdAndDelete(id);
      if (!deletedEnquiry) {
        return res.status(404).json({ message: 'Enquiry not found' });
      }
      res.json({ message: 'Enquiry deleted successfully' });
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
});
  
// GET all Contact Us submissions
router.get("/contactus", async (req, res) => {
  try {
    const submissions = await ContactUs.find();
    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Server error while fetching submissions." });
  }
});

router.post('/contactus', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;
    const newSubmission = new ContactUs({ firstName, lastName, email, phone, message });
    await newSubmission.save();

    let transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    const verifiedSender = 'adedejikehinde2004@gmail.com';

    const mailOptionsAdmin = {
      from: `"Griffith Halls Contact Us" <${verifiedSender}>`,
      to: 'adedejikehinde2004@gmail.com',
      subject: 'New Contact Us Submission',
      text: `You have a new submission from ${firstName} ${lastName}.
      
Email: ${email}
Phone: ${phone}

Message:
${message}`,
    };

    const mailOptionsUser = {
      from: `"GHR Contact Us" <${verifiedSender}>`,
      to: email,
      subject: 'Thank you for contacting us',
      text: `Hi ${firstName},

Thank you for reaching out to us. We have received your message:

"${message}"

We will get back to you soon.

Best regards,
Your Team`,
    };

    const [adminInfo, userInfo] = await Promise.all([
      transporter.sendMail(mailOptionsAdmin),
      transporter.sendMail(mailOptionsUser),
    ]);

    console.log("Admin email sent: %s", adminInfo.messageId);
    console.log("User email sent: %s", userInfo.messageId);

    res.status(201).json(newSubmission);
  } catch (error) {
    console.error("Error saving submission or sending emails:", error);
    res.status(500).json({ message: "Server error while saving submission and sending emails." });
  }
});

router.delete("/contactus/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubmission = await ContactUs.findByIdAndDelete(id);
    if (!deletedSubmission) {
      return res.status(404).json({ message: "Submission not found." });
    }
    res.status(200).json({ message: "Submission deleted successfully." });
  } catch (error) {
    console.error("Error deleting submission:", error);
    res.status(500).json({ message: "Server error while deleting submission." });
  }
});

router.put('/contactus/:id', async (req, res) => {
  try {
    const { status, actionTaken } = req.body;
    const updateData = { status, actionTaken };

    if (status.toLowerCase() === "completed") {
      updateData.completedAt = Date.now();
    }

    const updatedSubmission = await ContactUs.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedSubmission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    res.status(200).json(updatedSubmission);
  } catch (error) {
    console.error("Error updating submission:", error);
    res.status(500).json({ message: "Server error while updating submission." });
  }
});

// POST /api/auth/testimonials
router.post("/testimonials", async (req, res) => {
  try {
    const { name, message, rating } = req.body;
    if (!name || !message || !rating) {
      return res.status(400).json({ error: "Please provide name, message, and rating." });
    }
    const testimonial = new Testimonial({ name, message, rating });
    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/auth/testimonials
router.get("/testimonials", async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ date: -1 });
    res.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/auth/testimonials/:id
router.delete("/testimonials/:id", async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    await testimonial.remove();
    res.json({ message: "Testimonial deleted" });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/auth/testimonials/:id
router.put("/testimonials/:id", async (req, res) => {
  try {
    const { approved } = req.body;
    if (approved === undefined) {
      return res.status(400).json({ error: "Approved field is required" });
    }
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    testimonial.approved = approved;
    await testimonial.save();
    res.json({ message: "Testimonial approval status updated", testimonial });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* Announcement Routes */
// POST /api/auth/announcements - Create a new announcement
router.post('/announcements', authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { title, message, approved } = req.body;
    let attachments = [];
    
    // If an image file is provided, upload it to Cloudinary
    if (req.file) {
      let secure_url;
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "announcement_attachments", resource_type: "image" },
            (error, result) => (error ? reject(error) : resolve(result))
          ).end(req.file.buffer);
        });
        secure_url = result.secure_url;
        attachments.push(secure_url);
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
      }
    }

    const announcement = new Announcement({
      title,
      message,
      attachments, // Array with the uploaded image URL (if any)
      approved: approved === "true" || approved === true, // Ensure boolean
      createdBy: req.user.id,
    });

    const savedAnnouncement = await announcement.save();
    res.status(201).json(savedAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Server error while creating announcement.' });
  }
});

// GET /api/auth/announcements - Get all announcements
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Server error while fetching announcements.' });
  }
});

// PUT /api/auth/announcements/:id - Update an announcement
router.put('/announcements/:id', authenticateToken, async (req, res) => {
  try {
    const { title, message, attachments, approved, favourite } = req.body;
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, message, attachments, approved, favourite },
      { new: true, runValidators: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(updatedAnnouncement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Server error while updating announcement.' });
  }
});


router.put('/announcements/:id/toggleFavourite', authenticateToken, async (req, res) => {
  try {
    const announcementId = req.params.id;
    const userId = req.user.id; // Provided by your authentication middleware

    // Find the announcement by id
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    let isFavourite;
    // Check if the current user's ID is already in the favouriteBy array.
    if (announcement.favouriteBy.some(id => id.toString() === userId)) {
      // Remove user ID if already favourited.
      announcement.favouriteBy = announcement.favouriteBy.filter(id => id.toString() !== userId);
      isFavourite = false;
    } else {
      // Add user ID if not favourited yet.
      announcement.favouriteBy.push(mongoose.Types.ObjectId(userId));
      isFavourite = true;
    }

    await announcement.save();

    res.status(200).json({ favourite: isFavourite });
  } catch (err) {
    console.error("Error toggling favourite announcement:", err);
    res.status(500).json({ error: "Server error while toggling favourite" });
  }
});


// DELETE /api/auth/announcements/:id - Delete an announcement
router.delete('/announcements/:id', authenticateToken, async (req, res) => {
  try {
    const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
    if (!deletedAnnouncement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Server error while deleting announcement.' });
  }
});

module.exports = router;
