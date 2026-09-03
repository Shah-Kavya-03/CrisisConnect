import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null indicates broadcast
  },
  type: {
    type: String,
    enum: ['critical', 'duplicate', 'assignment', 'warning', 'info', 'success'],
    default: 'info'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  requestId: {
    type: String,
    default: null
  },
  targetRole: {
    type: String,
    enum: ['All', 'Requester', 'Volunteer', 'NGO', 'Admin'],
    default: 'All'
  }
}, {
  timestamps: true
});

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
