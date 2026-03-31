const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

// ── Helper: generate token ────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, location, address } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name, email, password, phone,
      role: role || 'donor',
      address,
      location: location || { type: 'Point', coordinates: [0, 0] }
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        avatar: user.avatar,
        totalDonations:   user.totalDonations,
        totalMealsServed: user.totalMealsServed
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ── PUT /api/auth/update-location ─────────────────────────────────────────────
router.put('/update-location', protect, async (req, res) => {
  try {
    const { coordinates, accuracy } = req.body;  // [longitude, latitude]

    await User.findByIdAndUpdate(req.user._id, {
      'location.coordinates': coordinates,
      'location.accuracy':    accuracy
    });

    res.json({ success: true, message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
