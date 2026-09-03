import mongoose from 'mongoose';

const VolunteerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    type: String
  }],
  vehicleType: {
    type: String,
    enum: [
      'None / Walking',
      'Bicycle / Two-Wheeler',
      'Standard Car / Sedan',
      'SUV / 4x4 Off-Road',
      'Ambulance / Medical Van',
      'Cargo Truck / Lorry',
      'Rescue Boat / Raft'
    ],
    default: 'Standard Car / Sedan'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  serviceRadiusKm: {
    type: Number,
    default: 15
  },
  currentLocation: {
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
  activeAssignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    default: null
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Suspended'],
    default: 'Verified'
  },
  idCardNumber: {
    type: String,
    default: ''
  },
  totalHoursVolunteered: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

VolunteerSchema.index({ currentLocation: '2dsphere' });

export default mongoose.models.Volunteer || mongoose.model('Volunteer', VolunteerSchema);
