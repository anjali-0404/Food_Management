const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// GET leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const donors = await User.find({ role: 'donor' })
      .select('name avatar totalDonations totalMealsServed badges')
      .sort({ totalMealsServed: -1 })
      .limit(20);
    res.json({ success: true, donors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address, location, ngoDetails } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, location, ngoDetails },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
