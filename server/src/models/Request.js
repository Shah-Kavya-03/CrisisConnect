import mongoose from 'mongoose';

const TimelineEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: String, required: true },
  note: { type: String, required: true }
}, { _id: false });

const RequestSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide an emergency title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a detailed description'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Medical', 'Rescue', 'Food & Water', 'Oxygen', 'Medicines', 'Blood', 'Shelter', 'Transportation', 'General'],
    default: 'General'
  },
  urgency: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  aiPriorityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  locationName: {
    type: String,
    required: [true, 'Please specify emergency location description']
  },
  // GeoJSON Point for 2dsphere spatial queries [lng, lat]
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [77.2090, 28.6139]
    }
  },
  coordinates: {
    lat: { type: Number, required: true, default: 28.6139 },
    lng: { type: Number, required: true, default: 77.2090 }
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  requesterName: {
    type: String,
    default: 'Anonymous Requester'
  },
  requesterPhone: {
    type: String,
    default: '+91 98765 00000'
  },
  status: {
    type: String,
    enum: ['Awaiting Help', 'Assigned', 'En Route', 'In Progress', 'Resolved', 'Expired', 'Flagged Duplicate', 'Cancelled'],
    default: 'Awaiting Help'
  },
  assignedTo: {
    id: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, default: null },
    type: { type: String, default: null },
    trustScore: { type: Number, default: 85 },
    phone: { type: String, default: null }
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 4 * 3600000)
  },
  isDuplicate: {
    type: Boolean,
    default: false
  },
  duplicateMatchId: {
    type: String,
    default: null
  },
  similarityScore: {
    type: Number,
    default: 0
  },
  duplicateReasons: [{
    type: String
  }],
  keywords: [{
    type: String
  }],
  timeline: [TimelineEventSchema],
  peopleCount: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index 2dsphere for geospatial proximity search
RequestSchema.index({ geometry: '2dsphere' });
RequestSchema.index({ status: 1, urgency: 1, aiPriorityScore: -1 });

export default mongoose.models.Request || mongoose.model('Request', RequestSchema);
