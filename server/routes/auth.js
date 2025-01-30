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
        const { email, password, name, lastName, roomNumber, gender, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let profileImageUrl = "https://res.cloudinary.com/dxlrv28eb/image/upload/vDEFAULT_IMAGE_ID.jpg";

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

router.get('/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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

router.put('/deliveries/:parcelNumber/status', authenticateToken, async (req, res) => {
    try {
        const { parcelNumber } = req.params;
        const { status } = req.body;

        const validStatuses = ['To Collect', 'Collected', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const update = { status };
        if (status === 'Collected') {
            update.collectedAt = new Date();
        }

        const updatedDelivery = await Delivery.findOneAndUpdate(
            { parcelNumber },
            update,
            { new: true }
        );

        if (!updatedDelivery) {
            return res.status(404).json({ message: 'Parcel not found' });
        }

        res.status(200).json({ message: 'Parcel status updated', delivery: updatedDelivery });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
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

router.put('/enquiries/:requestId/status', authenticateToken, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const update = { status };
        if (status === 'Resolved') {
            update.resolvedAt = new Date();
        }

        const updatedEnquiry = await Enquiry.findOneAndUpdate(
            { requestId },
            update,
            { new: true }
        );

        if (!updatedEnquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        res.status(200).json({ message: 'Enquiry status updated', enquiry: updatedEnquiry });
    } catch (error) {
        console.error('Error updating enquiry status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;