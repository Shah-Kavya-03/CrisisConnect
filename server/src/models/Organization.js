import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide organization name'],
    unique: true,
    trim: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Please provide NGO/Govt registration number'],
    unique: true
  },
  type: {
    type: String,
    enum: ['Registered NGO', 'Government Agency', 'Red Cross Unit', 'Disaster Relief Force', 'Community Group'],
    default: 'Registered NGO'
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  headquartersAddress: {
    type: String,
    default: 'District Emergency Operations Center'
  },
  jurisdictionCity: {
    type: String,
    default: 'Delhi NCR'
  },
  resourcesInventory: {
    oxygenCylinders: { type: Number, default: 25 },
    foodKits: { type: Number, default: 500 },
    drinkingWaterLiters: { type: Number, default: 2000 },
    temporaryShelterBeds: { type: Number, default: 80 },
    rescueBoats: { type: Number, default: 4 },
    medicalFirstAidKits: { type: Number, default: 150 }
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  activeVolunteersCount: {
    type: Number,
    default: 12
  }
}, {
  timestamps: true
});

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
