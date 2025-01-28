const express = require('express');
const User = require('../models/User');
const Delivery = require('../models/deliveries'); // Import the Delivery model
const Maintenance = require('../models/maintenance');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware.js'); // Import middleware
const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    const { password, name, lastName, roomNumber, gender, phone, email } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const newUser = new User({
            password,
            name,
            lastName,
            roomNumber,
            gender,
            phone,
            email,
            createdAt: new Date(),
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login Route
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

// Protected Route to Get User Details
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Protected Route to Create a New Delivery
router.post('/deliveries', authenticateToken, async (req, res) => {
    try {
        const { sender, parcelType, description, collectedAt, roomNumber } = req.body;

        // Validate parcel type
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
            // Generate a random parcel number
            parcelNumber = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');

            // Check if the parcel number exists in the database
            const existingDelivery = await Delivery.findOne({ parcelNumber });

            if (!existingDelivery) {
                // If no parcel exists with this number, it's unique
                isUnique = true;
            } else if (existingDelivery.status === 'Collected' || existingDelivery.status === 'Cancelled') {
                // If the parcel exists but is marked as "Collected" or "Cancelled," delete it and reuse the number
                await Delivery.deleteOne({ parcelNumber });
                isUnique = true;
            }
        }

        // Automatically set `arrivedAt` to the current date and time
        const newDelivery = new Delivery({
            arrivedAt: new Date(), // Set to the current date and time
            parcelNumber,
            sender: sender || null,
            parcelType,
            description: description || null,
            collectedAt: collectedAt || null,
            status: "To Collect", // Default status
            roomNumber // Set room number from the request body
        });

        await newDelivery.save();
        res.status(201).json({ message: 'Parcel added successfully', delivery: newDelivery });
    } catch (error) {
        console.error('Parcel creation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Protected Route to Get Delivery Details
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

//update delivery status
router.put('/deliveries/:parcelNumber/status', authenticateToken, async (req, res) => {
    try {
        const { parcelNumber } = req.params;
        const { status } = req.body;

        // Validate the status
        const validStatuses = ['To Collect', 'Collected', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // If marking as collected, set `collectedAt`
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

// Route to Create a Maintenance Request
router.post('/maintenance', authenticateToken, async (req, res) => {
    try {
      const { roomNumber, category, description, roomAccess, pictures } = req.body;
  
      // Validate category
      const validCategories = ["Appliances", "Cleaning", "Plumbing & Leaking", "Heating", "Lighting", "Windows & Doors", "Furniture & Fitting", "Flooring", "Other"];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: 'Invalid maintenance category' });
      }
  
      // Find the highest existing requestId and increment it
      const lastRequest = await Maintenance.findOne().sort({ requestId: -1 }); // Sort by descending order of requestId
      const nextRequestId = lastRequest ? lastRequest.requestId + 1 : 1;
  
      // Create the maintenance request
      const newRequest = new Maintenance({
        requestId: nextRequestId,
        roomNumber,
        category,
        description,
        roomAccess,
        pictures: pictures || [], // Optional array of picture URLs
      });
  
      await newRequest.save();
      res.status(201).json({ message: 'Maintenance request created successfully', request: newRequest });
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  
// Route to Get All Maintenance Requests
router.get('/maintenance', authenticateToken, async (req, res) => {
    try {
      // Fetch all maintenance requests
      const maintenanceRequests = await Maintenance.find();
  
      if (!maintenanceRequests || maintenanceRequests.length === 0) {
        return res.status(404).json({ message: 'No maintenance requests found' });
      }
  
      res.status(200).json(maintenanceRequests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

module.exports = router;
