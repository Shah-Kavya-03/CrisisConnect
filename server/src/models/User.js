import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide a valid phone number'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['Requester', 'Volunteer', 'NGO', 'Admin'],
    default: 'Requester'
  },
  location: {
    address: { type: String, default: 'Central Metro Area' },
    coordinates: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.2090 }
    }
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: function () {
      if (this.role === 'NGO') return undefined;
      if (this.role === 'Admin') return 100;
      if (this.role === 'Volunteer') return 90;
      return 85;
    }
  },
  trustScoreLastUpdatedBy: {
    type: String,
    default: 'Principal Admin Authority'
  },
  trustScoreUpdateReason: {
    type: String,
    default: 'Baseline Registration Score'
  },
  completedAssignments: {
    type: Number,
    default: 0
  },
  abandonedAssignments: {
    type: Number,
    default: 0
  },
  avgResponseMinutes: {
    type: Number,
    default: 15
  },
  badges: [{
    type: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  }
}, {
  timestamps: true
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) return false;
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    try {
      return await bcrypt.compare(enteredPassword, this.password);
    } catch {
      return false;
    }
  }
  return this.password === enteredPassword;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
