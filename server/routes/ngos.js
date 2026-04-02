// ngos.js
const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// GET all NGOs
router.get('/', async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo', isActive: true })
      .select('-password')
      .sort({ totalMealsServed: -1 });
    res.json({ success: true, count: ngos.length, ngos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET nearby NGOs
router.get('/nearby', async (req, res) => {
  try {
    const { longitude, latitude, radius = 20000 } = req.query;
    const ngos = await User.find({
      role: 'ngo',
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: parseInt(radius)
        }
      }
    }).select('-password').limit(20);
    res.json({ success: true, ngos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

// ── Separate file for users (export as combined) ──────────────────────────────
