import User from '../models/User.js';
import Volunteer from '../models/Volunteer.js';
import Requester from '../models/Requester.js';
import Organization from '../models/Organization.js';
import Admin from '../models/Admin.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Register a new user (Requester, Volunteer, NGO, Admin)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'Requester', skills, vehicleType } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'Requester',
      trustScore: role === 'NGO' ? undefined : role === 'Volunteer' ? 90 : role === 'Admin' ? 100 : 85,
      badges: role === 'Volunteer' 
        ? ['⚡ Registered Responder'] 
        : role === 'Admin' 
        ? ['🛡️ Command Dispatcher'] 
        : role === 'NGO'
        ? ['🏢 Registered Agency']
        : ['🔰 Verified Requester']
    });

    // Create role-specific document in dedicated collection
    if (role === 'Requester') {
      await Requester.create({
        userId: user._id,
        emergencyContact: {
          name: req.body.emergencyContactName || '',
          phone: req.body.emergencyContactPhone || ''
        },
        medicalConditions: req.body.medicalConditions || [],
        householdCount: req.body.householdCount || 1,
        defaultAddress: req.body.address || 'Central Metro Area',
        location: {
          type: 'Point',
          coordinates: req.body.coordinates ? [req.body.coordinates.lng, req.body.coordinates.lat] : [77.2090, 28.6139]
        }
      }).catch(() => {});
    } else if (role === 'Volunteer') {
      await Volunteer.create({
        userId: user._id,
        skills: skills || ['First Aid / BLS', 'Emergency Response'],
        vehicleType: vehicleType || 'Standard Car / Sedan',
        currentLocation: {
          type: 'Point',
          coordinates: req.body.coordinates ? [req.body.coordinates.lng, req.body.coordinates.lat] : [77.2090, 28.6139]
        }
      }).catch(() => {});
    } else if (role === 'NGO') {
      const org = await Organization.create({
        name: req.body.organizationName || `${user.name} Relief Foundation`,
        registrationNumber: req.body.registrationNumber || `NGO-${Math.floor(1000 + Math.random() * 9000)}`,
        type: req.body.organizationType || 'Registered NGO',
        contactEmail: user.email,
        contactPhone: user.phone,
        jurisdictionCity: req.body.jurisdictionCity || 'Delhi NCR'
      }).catch(() => {});
      if (org) {
        user.organizationId = org._id;
        await user.save();
      }
    } else if (role === 'Admin') {
      await Admin.create({
        userId: user._id,
        department: req.body.department || 'State Emergency Command Center',
        accessLevel: req.body.accessLevel || 'Dispatcher',
        badgeNumber: req.body.badgeNumber || `CMD-${Math.floor(100 + Math.random() * 900)}`,
        assignedJurisdiction: req.body.assignedJurisdiction || 'Delhi NCR',
        permissions: ['MANAGE_REQUESTS', 'MODERATE_DUPLICATES', 'DISPATCH_VOLUNTEERS', 'EXPORT_REPORTS']
      }).catch(() => {});
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        trustScore: user.trustScore,
        badges: user.badges
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token (supports email or username)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const identifier = (req.body.email || req.body.username || req.body.identifier || '').trim();
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username/email and password' });
    }

    // Match by email (case-insensitive) or name/username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { name: { $regex: new RegExp(`^${identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        trustScore: user.role === 'NGO' ? undefined : user.trustScore,
        completedAssignments: user.completedAssignments,
        avgResponseMinutes: user.avgResponseMinutes,
        badges: user.badges
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & trust telemetry
// @route   PATCH /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location } = req.body;
    const user = await User.findById(req.user.id || req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
