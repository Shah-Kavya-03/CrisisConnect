import mongoose from 'mongoose';

const VerificationLogSchema = new mongoose.Schema({
  actionType: {
    type: String,
    enum: [
      'AI_DUPLICATE_FLAG',
      'ADMIN_DUPLICATE_MERGE',
      'ADMIN_DUPLICATE_DISMISS',
      'REQUEST_RENEWAL',
      'GEO_VERIFICATION_CHECKIN',
      'TRUST_SCORE_UPDATE',
      'EXPIRY_AUTO_ARCHIVE'
    ],
    required: true
  },
  requestId: {
    type: String,
    required: true
  },
  performedByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null if automated AI or cron
  },
  performerRole: {
    type: String,
    default: 'SYSTEM_AI'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  previousState: {
    type: String,
    default: null
  },
  newState: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

VerificationLogSchema.index({ requestId: 1, createdAt: -1 });

export default mongoose.models.VerificationLog || mongoose.model('VerificationLog', VerificationLogSchema);
