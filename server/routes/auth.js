const express = require('express');
const User = require('../models/User');
const Delivery = require('../models/deliveries');
const Enquiry = require('../models/enquiries');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware.js');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/register", upload.single("image"), async (req, res) => {
    try {
        const { email, password, name, lastName, roomNumber, gender, phone, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let profileImageUrl = "https://res.cloudinary.com/dxlrv28eb/user_photos/default_Image.png";

        if (req.file) {
            try {
                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: "user_profiles", resource_type: "image" },
                        (error, result) => (error ? reject(error) : resolve(result))
                    ).end(req.file.buffer);
                });

                profileImageUrl = result.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
            }
        }

        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            lastName,
            roomNumber,
            gender,
            phone,
            profileImageUrl,
            role
        });

        await newUser.save();

        const { password: _, ...userData } = newUser.toObject();

        res.status(201).json({ message: "User registered successfully", user: userData });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Registration failed", details: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
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
                    { folder: "user_profiles", resource_type: "image" },
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

//fetch user
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

//fetch all users
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
  

module.exports = router;