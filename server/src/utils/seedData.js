import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Request from '../models/Request.js';
import Volunteer from '../models/Volunteer.js';
import Organization from '../models/Organization.js';
import { logger } from './logger.js';

dotenv.config();

const SEED_REQUESTS = [
  {
    customId: 'CC-1042',
    category: 'Medical',
    urgency: 'Critical',
    aiPriorityScore: 96,
    title: 'Urgent Insulin & Oxygen Supply Required',
    description: 'Elderly diabetic patient trapped in flooded apartment complex with low oxygen cylinder levels. Requires immediate medical supply dispatch.',
    locationName: 'Central Heights, Sector 4, Metro Area',
    geometry: { type: 'Point', coordinates: [77.2090, 28.6139] },
    coordinates: { lat: 28.6139, lng: 77.2090 },
    requesterName: 'Ananya Sharma',
    requesterPhone: '+91 98765 43210',
    status: 'Assigned',
    assignedTo: {
      id: 'VOL-802',
      name: 'Dr. Rahul Verma',
      type: 'Volunteer Doctor',
      trustScore: 98,
      phone: '+91 91234 56789'
    },
    timeline: [
      { status: 'Created', timestamp: '10:15 AM', note: 'Emergency request submitted via Web App' },
      { status: 'AI Triaged', timestamp: '10:16 AM', note: 'AI Auto-Triage assigned CRITICAL (96/100)' },
      { status: 'Volunteer Assigned', timestamp: '10:22 AM', note: 'Assigned to Dr. Rahul Verma (Dispatched)' }
    ],
    isDuplicate: false,
    keywords: ['diabetic', 'oxygen cylinder', 'flooded', 'medical supply', 'immediate']
  },
  {
    customId: 'CC-1043',
    category: 'Rescue',
    urgency: 'Critical',
    aiPriorityScore: 98,
    title: 'Family Trapped on Roof due to Rising Floodwaters',
    description: '4 adults and 2 children stuck on rooftop near Riverside Colony. Water levels rising rapidly.',
    locationName: 'Riverside Colony, Block C, River Bank',
    geometry: { type: 'Point', coordinates: [77.2180, 28.6250] },
    coordinates: { lat: 28.6250, lng: 77.2180 },
    requesterName: 'Vikram Singh',
    requesterPhone: '+91 99887 76655',
    status: 'Awaiting Help',
    assignedTo: null,
    timeline: [
      { status: 'Created', timestamp: '10:25 AM', note: 'Submitted via 1-Tap SOS Button' },
      { status: 'AI Triaged', timestamp: '10:26 AM', note: 'AI Auto-Triage assigned CRITICAL (98/100)' }
    ],
    isDuplicate: false,
    keywords: ['trapped', 'roof', 'flooded', 'children', 'rising water']
  },
  {
    customId: 'CC-1044',
    category: 'Food & Water',
    urgency: 'High',
    aiPriorityScore: 84,
    title: 'Clean Drinking Water Packets for 50 Evacuees',
    description: 'Community center shelter hosting families displaced by storm. Running out of drinking water.',
    locationName: 'Community Hall, Sector 12',
    geometry: { type: 'Point', coordinates: [77.2250, 28.6010] },
    coordinates: { lat: 28.6010, lng: 77.2250 },
    requesterName: 'Priya Mehta (NGO Co-ordinator)',
    requesterPhone: '+91 97654 32109',
    status: 'En Route',
    assignedTo: {
      id: 'NGO-102',
      name: 'Red Cross Relief Team B',
      type: 'Registered NGO',
      trustScore: 99,
      phone: '+91 90000 11111'
    },
    timeline: [
      { status: 'Created', timestamp: '09:45 AM', note: 'Standard request created' },
      { status: 'AI Triaged', timestamp: '09:46 AM', note: 'AI Auto-Triage assigned HIGH (84/100)' },
      { status: 'Volunteer Assigned', timestamp: '10:00 AM', note: 'Red Cross Relief Team B accepted' },
      { status: 'Volunteer En Route', timestamp: '10:20 AM', note: 'Water truck dispatched & en route' }
    ],
    isDuplicate: false,
    keywords: ['drinking water', 'shelter', 'displaced', 'evacuees']
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crisisconnect';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for seeding...');

    await Request.deleteMany({});
    await Request.insertMany(SEED_REQUESTS);
    logger.success('Requests seeded successfully');

    await Organization.deleteMany({});
    await Organization.create({
      name: 'Red Cross Relief Team B',
      registrationNumber: 'NGO-DEL-8921',
      type: 'Registered NGO',
      contactEmail: 'contact@redcross-relief.org',
      contactPhone: '+91 90000 11111',
      resourcesInventory: {
        oxygenCylinders: 40,
        foodKits: 1200,
        drinkingWaterLiters: 5000,
        temporaryShelterBeds: 150,
        rescueBoats: 6,
        medicalFirstAidKits: 300
      }
    });
    logger.success('Organizations seeded successfully');

    process.exit(0);
  } catch (err) {
    logger.error(`Seeding failed: ${err.message}`);
    process.exit(1);
  }
};

seedDB();
