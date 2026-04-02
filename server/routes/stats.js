// ── stats.js ──────────────────────────────────────────────────────────────────
const express  = require('express');
const router   = express.Router();
const Donation = require('../models/Donation');
const User     = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const [
      totalDonations,
      activeDonations,
      completedDonations,
      totalDonors,
      totalNGOs,
      mealResult
    ] = await Promise.all([
      Donation.countDocuments({ isActive: true }),
      Donation.countDocuments({ isActive: true, status: { $in: ['pending', 'accepted', 'picked'] } }),
      Donation.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo' }),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$servings' } } }
      ])
    ]);

    const mealsServed = mealResult.length ? mealResult[0].total : 0;

    // Recent 7 days donations
    const recentDonations = await Donation.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('donor', 'name avatar');

    res.json({
      success: true,
      stats: {
        totalDonations,
        activeDonations,
        completedDonations,
        totalDonors,
        totalNGOs,
        mealsServed,
        livesImpacted: Math.floor(mealsServed / 3)
      },
      recentDonations
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
