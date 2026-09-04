import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      phone: phone || '+91 98765 43210',
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

    if (role === 'Requester') {
      await Requester.create({ userId: user._id }).catch(() => {});
    } else if (role === 'Volunteer') {
      await Volunteer.create({ userId: user._id, skills: skills || ['First Aid / BLS'] }).catch(() => {});
    } else if (role === 'NGO') {
      const org = await Organization.create({
        name: req.body.organizationName || `${user.name} Relief Foundation`,
        registrationNumber: `NGO-${Math.floor(1000 + Math.random() * 9000)}`,
        contactEmail: user.email,
        contactPhone: user.phone
      }).catch(() => {});
      if (org) {
        user.organizationId = org._id;
        await user.save();
      }
    } else if (role === 'Admin') {
      await Admin.create({ 
        userId: user._id, 
        email: user.email,
        department: 'Emergency Operations Command' 
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

// @desc    Login user & Authenticate against admins / users collections in MongoDB
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const identifier = (req.body.email || req.body.username || req.body.identifier || '').trim();
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/username and password' });
    }

    // 1. Direct MongoDB `admins` collection lookup by email
    const adminDoc = await Admin.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { email: identifier }
      ]
    });

    if (adminDoc) {
      let isMatch = false;

      // Check if password stored on admin document (supports both bcrypt hash and plain text)
      if (adminDoc.password) {
        if (adminDoc.password.startsWith('$2a$') || adminDoc.password.startsWith('$2b$')) {
          isMatch = await bcrypt.compare(password, adminDoc.password);
        } else {
          isMatch = adminDoc.password === password;
        }
      }

      // If not verified via adminDoc.password, check linked user account in users collection if present
      if (!isMatch && adminDoc.userId) {
        const linkedUser = await User.findById(adminDoc.userId).select('+password');
        if (linkedUser) {
          isMatch = await linkedUser.matchPassword(password);
        }
      }

      if (isMatch) {
        const adminId = adminDoc.userId || adminDoc._id;
        const token = generateToken(adminId, 'Admin');

        return res.json({
          success: true,
          token,
          user: {
            id: adminId,
            name: adminDoc.name || adminDoc.badgeNumber || 'Operations Commander',
            email: adminDoc.email || identifier,
            role: 'Admin',
            department: adminDoc.department || 'Emergency Operations Command',
            accessLevel: adminDoc.accessLevel || 'SuperAdmin',
            permissions: adminDoc.permissions || ['ALL_PERMISSIONS'],
            dutyStatus: adminDoc.dutyStatus || 'On Duty',
            trustScore: 100,
            badges: ['🛡️ Command Dispatcher', '👑 SuperAdmin Authority']
          }
        });
      } else {
        // Admin found by email, but password was incorrect
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Password does not match.'
        });
      }
    }

    // 2. Standard MongoDB `users` collection lookup (Case-insensitive)
    let user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } },
        { name: { $regex: new RegExp(`^${identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } }
      ]
    }).select('+password');

    // 3. Fallback: Check role-specific collections (requester, requesters, volunteers, organizations, etc.)
    if (!user && mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const fallbackCollections = ['requester', 'requesters', 'volunteers', 'volunteer', 'organizations', 'organization'];
      const query = {
        $or: [
          { email: { $regex: new RegExp(`^${identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } },
          { name: { $regex: new RegExp(`^${identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } },
          { phone: identifier }
        ]
      };

      for (const colName of fallbackCollections) {
        try {
          const rawDoc = await mongoose.connection.db.collection(colName).findOne(query);
          if (rawDoc) {
            // Check password
            let isRawMatch = false;
            if (rawDoc.password) {
              if (rawDoc.password.startsWith('$2a$') || rawDoc.password.startsWith('$2b$')) {
                isRawMatch = await bcrypt.compare(password, rawDoc.password);
              } else {
                isRawMatch = rawDoc.password === password;
              }
            }

            if (!isRawMatch) {
              return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Password does not match our database records.'
              });
            }

            // Sync or Upsert to users collection so the entire system works consistently
            const detectedRole = rawDoc.role || (colName.includes('requester') ? 'Requester' : colName.includes('volunteer') ? 'Volunteer' : 'NGO');
            
            // Check if already in users collection by email
            user = await User.findOne({ email: (rawDoc.email || identifier).toLowerCase() }).select('+password');
            if (!user) {
              // Create user in users collection
              user = await User.create({
                _id: rawDoc._id,
                name: rawDoc.name || identifier.split('@')[0],
                email: (rawDoc.email || identifier).toLowerCase(),
                phone: rawDoc.phone || '+91 98765 43210',
                password: rawDoc.password || password,
                role: detectedRole,
                trustScore: detectedRole === 'NGO' ? undefined : detectedRole === 'Volunteer' ? 90 : 85,
                badges: detectedRole === 'Volunteer' ? ['⚡ Registered Responder'] : ['🔰 Verified Requester']
              });
            }
            break;
          }
        } catch (err) {
          console.warn(`Error querying fallback collection ${colName}:`, err.message);
        }
      }
    }

    // Strict Database Check: If user does not exist in any DB collection, reject login!
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found in database. Please check your email or Sign Up first.'
      });
    }

    // Strict Password Validation
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match our database records.'
      });
    }

    // Check if user is linked in `admins` collection
    const linkedAdmin = await Admin.findOne({
      $or: [
        { userId: user._id },
        { email: user.email }
      ]
    });

    const isSecretAdmin = !!linkedAdmin || user.role === 'Admin';
    const effectiveRole = isSecretAdmin ? 'Admin' : user.role;
    const token = generateToken(user._id, effectiveRole);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: effectiveRole, // Automatically routes to Admin if matched in admins collection
        trustScore: effectiveRole === 'Admin' ? 100 : user.trustScore,
        completedAssignments: user.completedAssignments,
        avgResponseMinutes: user.avgResponseMinutes,
        badges: effectiveRole === 'Admin' ? ['🛡️ Command Dispatcher', '👑 Secret Admin'] : user.badges
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
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PATCH /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location } = req.body;
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
