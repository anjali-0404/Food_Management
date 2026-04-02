const express  = require('express');
const router   = express.Router();
const Donation = require('../models/Donation');
const User     = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ── GET /api/donations  (all, with filters) ───────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, urgency, foodType, category, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };

    if (status)   filter.status   = status;
    if (urgency)  filter.urgency  = urgency;
    if (foodType) filter.foodType = foodType;
    if (category) filter.category = category;

    const skip  = (page - 1) * limit;
    const total = await Donation.countDocuments(filter);

    const donations = await Donation.find(filter)
      .populate('donor',       'name avatar phone address')
      .populate('assignedNGO', 'name avatar phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count:       donations.length,
      total,
      pages:       Math.ceil(total / limit),
      currentPage: Number(page),
      donations
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/donations/nearby  (GPS-based search) ────────────────────────────
router.get('/nearby', async (req, res) => {
  try {
    const { longitude, latitude, radius = 10000 } = req.query;  // radius in meters

    if (!longitude || !latitude)
      return res.status(400).json({ message: 'longitude and latitude are required' });

    const donations = await Donation.find({
      isActive: true,
      status:   'pending',
      pickupLocation: {
        $near: {
          $geometry: {
            type:        'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
    .populate('donor', 'name avatar phone')
    .limit(50);

    res.json({ success: true, count: donations.length, donations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/donations  (create) ────────────────────────────────────────────
router.post('/', protect, authorize('donor', 'admin'), async (req, res) => {
  try {
    const {
      title, description, foodType, category,
      quantity, servings, expiryTime, urgency,
      pickupLocation, images
    } = req.body;

    if (!title || !description || !foodType || !quantity || !pickupLocation) {
      return res.status(400).json({ message: 'Missing required donation fields' });
    }

    if (!quantity.amount || Number(quantity.amount) <= 0) {
      return res.status(400).json({ message: 'Quantity amount must be greater than 0' });
    }

    if (!servings || Number(servings) <= 0) {
      return res.status(400).json({ message: 'Servings must be greater than 0' });
    }

    const expiryInput = expiryTime || req.body.expiryDate;
    if (!expiryInput) {
      return res.status(400).json({ message: 'expiryTime is required' });
    }

    const parsedExpiryTime = new Date(expiryInput);
    if (Number.isNaN(parsedExpiryTime.getTime())) {
      return res.status(400).json({ message: 'Invalid expiryTime format' });
    }

    if (parsedExpiryTime.getTime() <= Date.now()) {
      return res.status(400).json({ message: 'expiryTime must be in the future' });
    }

    const donation = await Donation.create({
      donor: req.user._id,
      title, description, foodType, category,
      quantity, servings, expiryTime: parsedExpiryTime,
      urgency: urgency || 'medium',
      pickupLocation,
      images: images || [],
      timeline: [{
        status:    'pending',
        message:   'Donation listed successfully',
        updatedBy: req.user._id
      }]
    });

    // Update donor stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalDonations: 1 }
    });

    await donation.populate('donor', 'name avatar');
    res.status(201).json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/donations/:id  ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor',       'name avatar phone address location')
      .populate('assignedNGO', 'name avatar phone ngoDetails');

    if (!donation || !donation.isActive)
      return res.status(404).json({ message: 'Donation not found' });

    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/donations/:id/accept  (NGO accepts) ─────────────────────────────
router.put('/:id/accept', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.status !== 'pending')
      return res.status(400).json({ message: 'Donation is no longer available' });

    donation.status      = 'accepted';
    donation.assignedNGO = req.user._id;
    donation.timeline.push({
      status:    'accepted',
      message:   `Accepted by ${req.user.name}`,
      updatedBy: req.user._id
    });
    await donation.save();

    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/donations/:id/status  (update status) ───────────────────────────
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, message } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    donation.status = status;
    donation.timeline.push({
      status,
      message: message || `Status updated to ${status}`,
      updatedBy: req.user._id
    });

    if (status === 'completed') {
      await User.findByIdAndUpdate(donation.donor, {
        $inc: { totalMealsServed: donation.servings }
      });
      if (donation.assignedNGO) {
        await User.findByIdAndUpdate(donation.assignedNGO, {
          $inc: { totalMealsServed: donation.servings }
        });
      }
    }

    await donation.save();
    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/donations/my/donations ──────────────────────────────────────────
router.get('/my/donations', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('assignedNGO', 'name avatar phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: donations.length, donations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
