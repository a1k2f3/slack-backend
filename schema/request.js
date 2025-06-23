import mongoose from 'mongoose';

const bookingRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Accounts' },
  role: { type: String, enum: ['user', 'mechanic', 'petrol_pump'], required: true },

  // GeoJSON point format
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for geospatial queries
bookingRequestSchema.index({ location: '2dsphere' });

export default mongoose.model('BookingRequest', bookingRequestSchema);
