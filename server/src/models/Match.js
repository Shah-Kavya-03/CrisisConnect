import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  customRequestId: {
    type: String,
    required: true
  },
  volunteerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  distanceKm: {
    type: Number,
    required: true
  },
  estimatedArrivalMinutes: {
    type: Number,
    default: 15
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

MatchSchema.index({ customRequestId: 1, volunteerUserId: 1 });

export default mongoose.models.Match || mongoose.model('Match', MatchSchema);
