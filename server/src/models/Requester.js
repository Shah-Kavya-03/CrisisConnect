import mongoose from 'mongoose';

const RequesterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: 'Family' }
  },
  medicalConditions: [{
    type: String,
    trim: true
  }],
  householdCount: {
    type: Number,
    min: 1,
    default: 1
  },
  defaultAddress: {
    type: String,
    default: 'Central Metro Area'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [77.2090, 28.6139]
    }
  },
  specialNeedsNotes: {
    type: String,
    default: ''
  },
  totalRequestsCreated: {
    type: Number,
    default: 0
  },
  activeRequestIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  }]
}, {
  timestamps: true
});

RequesterSchema.index({ location: '2dsphere' });

export default mongoose.models.Requester || mongoose.model('Requester', RequesterSchema);
