const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedNGO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
    type: String,
    required: [true, 'Donation title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 1000
  },
  foodType: {
    type: String,
    enum: ['cooked', 'raw', 'packaged', 'beverages', 'dairy', 'bakery', 'fruits_vegetables', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan', 'mixed'],
    default: 'veg'
  },
  quantity: {
    amount: { type: Number, required: true },
    unit: {
      type: String,
      enum: ['kg', 'plates', 'packets', 'liters', 'boxes', 'pieces'],
      default: 'kg'
    }
  },
  servings: { type: Number, required: true },   // estimated meals
  expiryTime: { type: Date, required: true },    // best before
  images: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'picked', 'delivered', 'completed', 'expired', 'cancelled'],
    default: 'pending'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  // ── GPS Location ──────────────────────────────────────────────────────────
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],   // [longitude, latitude]
      required: true
    },
    address: { type: String },
    landmark: { type: String },
    accuracy: { type: Number }   // GPS accuracy in meters
  },
  // ── Timeline ──────────────────────────────────────────────────────────────
  timeline: [{
    status:    String,
    message:   String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  // ── Feedback ──────────────────────────────────────────────────────────────
  feedback: {
    rating:  { type: Number, min: 1, max: 5 },
    comment: String,
    givenAt: Date
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Geo index for location-based queries
donationSchema.index({ pickupLocation: '2dsphere' });
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ donor: 1, createdAt: -1 });

module.exports = mongoose.model('Donation', donationSchema);
