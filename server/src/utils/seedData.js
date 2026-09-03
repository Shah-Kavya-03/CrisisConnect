import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Request from '../models/Request.js';
import Volunteer from '../models/Volunteer.js';
import Requester from '../models/Requester.js';
import Organization from '../models/Organization.js';
import Admin from '../models/Admin.js';
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

    // Clear existing collections
    await User.deleteMany({});
    await Volunteer.deleteMany({});
    await Requester.deleteMany({});
    await Organization.deleteMany({});
    await Admin.deleteMany({});
    await Request.deleteMany({});

    // 1. Seed Organizations & Shelters
    const org = await Organization.create({
      name: 'Red Cross Relief Team B',
      registrationNumber: 'NGO-DEL-8921',
      type: 'Registered NGO',
      contactEmail: 'contact@redcross-relief.org',
      contactPhone: '+91 90000 11111',
      headquartersAddress: 'District Emergency Operations Center, Sector 12',
      jurisdictionCity: 'Delhi NCR',
      resourcesInventory: {
        oxygenCylinders: 40,
        foodKits: 1200,
        drinkingWaterLiters: 5000,
        temporaryShelterBeds: 150,
        rescueBoats: 6,
        medicalFirstAidKits: 300
      },
      isVerified: true,
      activeVolunteersCount: 18
    });

    const shelterOrg = await Organization.create({
      name: 'Central Metro Community Relief Shelter',
      registrationNumber: 'GOV-SHELTER-4401',
      type: 'Government Agency',
      contactEmail: 'shelter.metro@crisis.gov',
      contactPhone: '+91 98888 22334',
      headquartersAddress: 'Central Stadium Complex, Metro City',
      jurisdictionCity: 'Delhi NCR',
      resourcesInventory: {
        oxygenCylinders: 20,
        foodKits: 800,
        drinkingWaterLiters: 4000,
        temporaryShelterBeds: 250,
        rescueBoats: 2,
        medicalFirstAidKits: 100
      },
      isVerified: true,
      activeVolunteersCount: 25
    });
    logger.success('Organizations & Shelters seeded successfully');

    // 2. Seed Users
    const requesterUser = await User.create({
      name: 'Ananya Sharma',
      email: 'ananya@crisis.org',
      phone: '+91 98765 43210',
      password: 'password123',
      role: 'Requester',
      location: {
        address: 'Central Heights, Sector 4, Metro Area',
        coordinates: { lat: 28.6139, lng: 77.2090 }
      },
      trustScore: 88,
      badges: ['🔰 Verified Requester'],
      isVerified: true
    });

    const volunteerUser = await User.create({
      name: 'Dr. Rahul Verma',
      email: 'rahul@relief.org',
      phone: '+91 91234 56789',
      password: 'password123',
      role: 'Volunteer',
      location: {
        address: 'Apollo Clinic, Block B, Metro Area',
        coordinates: { lat: 28.6150, lng: 77.2100 }
      },
      trustScore: 98,
      completedAssignments: 48,
      abandonedAssignments: 0,
      avgResponseMinutes: 11,
      badges: ['🏆 Reliable Responder', '⚡ Rapid Action', '🩺 Medical Specialist'],
      isVerified: true
    });

    const adminUser = await User.create({
      name: 'Operations Commander',
      email: 'admin@crisis.gov',
      phone: '+91 98111 22233',
      password: 'password123',
      role: 'Admin',
      location: {
        address: 'State Emergency Command Center',
        coordinates: { lat: 28.6200, lng: 77.2150 }
      },
      trustScore: 100,
      badges: ['🛡️ Command Dispatcher'],
      isVerified: true
    });

    const ngoUser = await User.create({
      name: 'Red Cross Admin',
      email: 'ngo@redcross.org',
      phone: '+91 90000 11111',
      password: 'password123',
      role: 'NGO',
      organizationId: org._id,
      location: {
        address: 'Red Cross Relief Headquarters',
        coordinates: { lat: 28.6100, lng: 77.2050 }
      },
      trustScore: 99,
      badges: ['🤝 NGO Partner'],
      isVerified: true
    });
    logger.success('Users (Requester, Volunteer, Admin, NGO) seeded successfully');

    // 3. Seed Volunteer Profile
    await Volunteer.create({
      userId: volunteerUser._id,
      skills: ['First Aid / BLS', 'Emergency Response', 'Medical Triage', 'Ambulance Driving'],
      vehicleType: 'Ambulance / Medical Van',
      isAvailable: true,
      serviceRadiusKm: 25,
      currentLocation: {
        type: 'Point',
        coordinates: [77.2100, 28.6150]
      },
      verificationStatus: 'Verified',
      idCardNumber: 'MED-VOL-98214',
      totalHoursVolunteered: 142
    });
    logger.success('Volunteer profiles seeded successfully');

    // 4. Seed Requester Profile
    await Requester.create({
      userId: requesterUser._id,
      emergencyContact: {
        name: 'Rohan Sharma',
        phone: '+91 98765 11223',
        relationship: 'Brother'
      },
      medicalConditions: ['Diabetic', 'Elderly Family Member'],
      householdCount: 4,
      defaultAddress: 'Central Heights, Sector 4, Metro Area',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      },
      specialNeedsNotes: 'Requires refrigeration for insulin medication; 1st floor apartment prone to waterlogging.',
      totalRequestsCreated: 2
    });
    logger.success('Requester profiles seeded successfully');

    // 5. Seed Admin Profile
    await Admin.create({
      userId: adminUser._id,
      department: 'State Emergency Command Center',
      accessLevel: 'SuperAdmin',
      badgeNumber: 'CMD-001',
      assignedJurisdiction: 'National Capital Region',
      permissions: ['ALL_PERMISSIONS', 'MANAGE_REQUESTS', 'MODERATE_DUPLICATES', 'DISPATCH_VOLUNTEERS', 'EXPORT_REPORTS', 'MANAGE_ORGANIZATIONS'],
      dutyStatus: 'On Duty',
      actionsPerformedCount: 154
    });
    logger.success('Admin profiles seeded successfully');

    // 6. Seed Requests with references
    const requestsToSeed = SEED_REQUESTS.map((req, index) => {
      const copy = { ...req };
      if (index === 0) {
        copy.requesterId = requesterUser._id;
        copy.assignedTo.userId = volunteerUser._id;
      } else if (index === 1) {
        copy.requesterId = requesterUser._id;
      }
      return copy;
    });

    await Request.insertMany(requestsToSeed);
    logger.success('Requests seeded successfully');

    logger.success('CrisisConnect MongoDB database seeded successfully!');
    process.exit(0);
  } catch (err) {
    logger.error(`Seeding failed: ${err.message}`);
    process.exit(1);
  }
};

seedDB();
