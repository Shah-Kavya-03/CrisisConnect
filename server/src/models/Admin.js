import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  password: {
    type: String
  },
  department: {
    type: String,
    default: 'Emergency Operations Command',
    trim: true
  },
  accessLevel: {
    type: String,
    enum: ['SuperAdmin', 'Dispatcher', 'Moderator', 'Analyst'],
    default: 'Dispatcher'
  },
  badgeNumber: {
    type: String,
    default: 'CMD-001',
    trim: true
  },
  assignedJurisdiction: {
    type: String,
    default: 'Delhi NCR'
  },
  permissions: [{
    type: String,
    default: ['MANAGE_REQUESTS', 'MODERATE_DUPLICATES', 'DISPATCH_VOLUNTEERS', 'EXPORT_REPORTS']
  }],
  dutyStatus: {
    type: String,
    enum: ['On Duty', 'Off Duty', 'On Call'],
    default: 'On Duty'
  },
  actionsPerformedCount: {
    type: Number,
    default: 0
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  strict: false
});

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
