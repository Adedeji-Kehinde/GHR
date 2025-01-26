const express = require('express');
const User = require('../models/User');
const Delivery = require('../models/deliveries'); // Import the Delivery model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware.js'); // Import middleware
const router = express.Router();
const { format } = require('date-fns');

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

// Route to Post a New Parcel
router.post('/deliveries', authenticateToken, async (req, res) => {
    try {
        const { arrivedAt, parcelNumber, sender, parcelType, description, collectedAt } = req.body;

        // Validate parcel type
        const validParcelTypes = ['Letter', 'Package'];
        if (!validParcelTypes.includes(parcelType)) {
            return res.status(400).json({ message: 'Invalid parcel type' });
        }

        // Validate parcel number
        const parcelNumberRegex = /^\d{3}$/; // Must be a three-digit number
        if (!parcelNumber || !parcelNumberRegex.test(parcelNumber)) {
            return res.status(400).json({ message: 'Invalid parcel number. Must be a three-digit number.' });
        }

        // Check if the parcel number already exists
        const existingDelivery = await Delivery.findOne({ parcelNumber });
        if (existingDelivery) {
            return res.status(400).json({ message: 'Parcel number already exists' });
        }

        // Format the arrivedAt date
        const formattedArrivedAt = format(new Date(arrivedAt), 'EEE, dd MMM \'at\' HH:mm');

        const newDelivery = new Delivery({
            arrivedAt: formattedArrivedAt,
            parcelNumber,
            sender: sender || null,
            parcelType,
            description: description || null,
            collectedAt: collectedAt || null, // If collectedAt is not provided, set it to null
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

module.exports = router;
