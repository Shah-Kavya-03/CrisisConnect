import User from '../models/User.js';
import Request from '../models/Request.js';
import Volunteer from '../models/Volunteer.js';
import Requester from '../models/Requester.js';
import Organization from '../models/Organization.js';
import Admin from '../models/Admin.js';
import VerificationLog from '../models/VerificationLog.js';

// @desc    Get aggregate database & system statistics for Admin Overwatch
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      requestersCount,
      volunteersCount,
      ngosCount,
      adminsCount,
      totalRequests,
      criticalRequests,
      highRequests,
      resolvedRequests,
      flaggedDuplicates,
      totalOrganizations,
      verifiedOrganizations
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'Requester' }),
      User.countDocuments({ role: 'Volunteer' }),
      User.countDocuments({ role: 'NGO' }),
      User.countDocuments({ role: 'Admin' }),
      Request.countDocuments(),
      Request.countDocuments({ urgency: 'Critical', status: { $ne: 'Resolved' } }),
      Request.countDocuments({ urgency: 'High', status: { $ne: 'Resolved' } }),
      Request.countDocuments({ status: 'Resolved' }),
      Request.countDocuments({ isDuplicate: true }),
      Organization.countDocuments(),
      Organization.countDocuments({ isVerified: true })
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          requesters: requestersCount,
          volunteers: volunteersCount,
          ngos: ngosCount,
          admins: adminsCount
        },
        requests: {
          total: totalRequests,
          critical: criticalRequests,
          high: highRequests,
          resolved: resolvedRequests,
          duplicates: flaggedDuplicates,
          active: totalRequests - resolvedRequests
        },
        organizations: {
          total: totalOrganizations,
          verified: verifiedOrganizations
        },
        systemStatus: 'Operational',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users with filter & search
// @route   GET /api/admin/users
// @access  Private (Admin Only)
export const getAdminUsers = async (req, res, next) => {
  try {
    const { role, isVerified, search } = req.query;
    const filter = {};

    if (role && role !== 'All') {
      filter.role = role;
    }
    if (isVerified !== undefined && isVerified !== '') {
      filter.isVerified = isVerified === 'true';
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('organizationId', 'name type')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user profile by Admin
// @route   PATCH /api/admin/users/:id
// @access  Private (Admin Only)
export const updateAdminUser = async (req, res, next) => {
  try {
    const { name, phone, role, isVerified, badges } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (badges !== undefined) user.badges = badges;

    // Ensure NGO never holds a trust score
    if (user.role === 'NGO') {
      user.trustScore = undefined;
    }

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user and cascade associated profiles
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin Only)
export const deleteAdminUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await Promise.all([
      Volunteer.deleteMany({ userId: user._id }),
      Requester.deleteMany({ userId: user._id }),
      Admin.deleteMany({ userId: user._id }),
      User.findByIdAndDelete(user._id)
    ]);

    res.json({
      success: true,
      message: `User ${user.name} (${user.email}) deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all NGOs and Agencies
// @route   GET /api/admin/organizations
// @access  Private (Admin Only)
export const getAdminOrganizations = async (req, res, next) => {
  try {
    const organizations = await Organization.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: organizations.length,
      organizations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new NGO/Agency by Admin
// @route   POST /api/admin/organizations
// @access  Private (Admin Only)
export const createAdminOrganization = async (req, res, next) => {
  try {
    const {
      name,
      registrationNumber,
      type,
      contactEmail,
      contactPhone,
      headquartersAddress,
      jurisdictionCity,
      resourcesInventory,
      isVerified
    } = req.body;

    const existing = await Organization.findOne({
      $or: [{ name }, { registrationNumber }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Organization with this name or registration number already exists'
      });
    }

    const org = await Organization.create({
      name,
      registrationNumber,
      type: type || 'Registered NGO',
      contactEmail,
      contactPhone,
      headquartersAddress: headquartersAddress || 'Central Dispatch Center',
      jurisdictionCity: jurisdictionCity || 'National Capital Region',
      resourcesInventory: resourcesInventory || {
        oxygenCylinders: 25,
        foodKits: 500,
        drinkingWaterLiters: 2000,
        temporaryShelterBeds: 80,
        rescueBoats: 4,
        medicalFirstAidKits: 150
      },
      isVerified: isVerified !== undefined ? isVerified : true
    });

    res.status(201).json({
      success: true,
      organization: org
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update NGO/Agency details, verification status or resource inventory
// @route   PATCH /api/admin/organizations/:id
// @access  Private (Admin Only)
export const updateAdminOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    const {
      name,
      registrationNumber,
      type,
      contactEmail,
      contactPhone,
      headquartersAddress,
      jurisdictionCity,
      resourcesInventory,
      isVerified,
      activeVolunteersCount
    } = req.body;

    if (name !== undefined) org.name = name;
    if (registrationNumber !== undefined) org.registrationNumber = registrationNumber;
    if (type !== undefined) org.type = type;
    if (contactEmail !== undefined) org.contactEmail = contactEmail;
    if (contactPhone !== undefined) org.contactPhone = contactPhone;
    if (headquartersAddress !== undefined) org.headquartersAddress = headquartersAddress;
    if (jurisdictionCity !== undefined) org.jurisdictionCity = jurisdictionCity;
    if (isVerified !== undefined) org.isVerified = isVerified;
    if (activeVolunteersCount !== undefined) org.activeVolunteersCount = activeVolunteersCount;
    if (resourcesInventory) {
      org.resourcesInventory = { ...org.resourcesInventory, ...resourcesInventory };
    }

    await org.save();

    res.json({
      success: true,
      organization: org
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an NGO/Agency
// @route   DELETE /api/admin/organizations/:id
// @access  Private (Admin Only)
export const deleteAdminOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findByIdAndDelete(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    // Clear organizationId reference on associated users
    await User.updateMany({ organizationId: org._id }, { $set: { organizationId: null } });

    res.json({
      success: true,
      message: `Organization '${org.name}' deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Emergency Requests with filters
// @route   GET /api/admin/requests
// @access  Private (Admin Only)
export const getAdminRequests = async (req, res, next) => {
  try {
    const { status, urgency, category, search } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (urgency && urgency !== 'All') filter.urgency = urgency;
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { locationName: { $regex: search, $options: 'i' } },
        { requesterName: { $regex: search, $options: 'i' } },
        { customId: { $regex: search, $options: 'i' } }
      ];
    }

    const requests = await Request.find(filter)
      .populate('requesterId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an Emergency Request (Status, Urgency, Assignment) by Admin
// @route   PATCH /api/admin/requests/:id
// @access  Private (Admin Only)
export const updateAdminRequest = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const { status, urgency, category, assignedTo, note } = req.body;

    if (status !== undefined) request.status = status;
    if (urgency !== undefined) request.urgency = urgency;
    if (category !== undefined) request.category = category;
    if (assignedTo !== undefined) request.assignedTo = assignedTo;

    if (note) {
      request.timeline.push({
        status: status || request.status,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: `Admin Action: ${note}`
      });
    }

    await request.save();

    res.json({
      success: true,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an Emergency Request by Admin
// @route   DELETE /api/admin/requests/:id
// @access  Private (Admin Only)
export const deleteAdminRequest = async (req, res, next) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({
      success: true,
      message: `Request '${request.title}' (${request.customId}) deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all entities with their Principal Trust Scores & Audit History
// @route   GET /api/admin/trust-scores
// @access  Private (Admin Only)
export const getAdminTrustScores = async (req, res, next) => {
  try {
    // Retrieve users eligible for trust scores (Volunteers, Requesters, Admins)
    // Note: NGOs are explicitly excluded from holding Trust Scores per Principal Authority
    const entities = await User.find({ role: { $ne: 'NGO' } })
      .select('name email phone role trustScore trustScoreLastUpdatedBy trustScoreUpdateReason completedAssignments abandonedAssignments avgResponseMinutes badges isVerified createdAt')
      .sort({ trustScore: -1 });

    const auditLogs = await VerificationLog.find()
      .populate('targetUserId', 'name email role')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      governingAuthority: 'Principal Admin Trust Authority',
      policy: 'Trust Scores are exclusively governed by the Principal Administrator. NGOs and agencies are segregated with no access or control.',
      count: entities.length,
      entities,
      auditLogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust and manage Trust Score for any entity by Principal Admin Authority
// @route   PATCH /api/admin/trust-scores/:userId
// @access  Private (Admin Only)
export const updateEntityTrustScore = async (req, res, next) => {
  try {
    const { trustScore, reason, badges, badgesToAdd, badgesToRemove } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Entity user not found' });
    }

    if (user.role === 'NGO') {
      return res.status(400).json({
        success: false,
        message: 'NGOs and agencies cannot hold or be assigned a Trust Score under Principal Governance'
      });
    }

    const previousScore = user.trustScore || 85;
    const validatedScore = Math.min(Math.max(parseInt(trustScore, 10), 0), 100);

    user.trustScore = validatedScore;
    user.trustScoreLastUpdatedBy = req.user?.name || 'Principal Administrator';
    user.trustScoreUpdateReason = reason || 'Manual adjustment by Principal Authority';

    if (Array.isArray(badges)) {
      user.badges = badges;
    } else {
      if (Array.isArray(badgesToAdd)) {
        user.badges = Array.from(new Set([...user.badges, ...badgesToAdd]));
      }
      if (Array.isArray(badgesToRemove)) {
        user.badges = user.badges.filter(b => !badgesToRemove.includes(b));
      }
    }

    await user.save();

    // Record audit log
    await VerificationLog.create({
      targetUserId: user._id,
      verifiedBy: req.user?._id || req.user?.id,
      verificationType: 'TRUST_SCORE_OVERRIDE',
      previousScore,
      newScore: validatedScore,
      notes: reason || 'Trust Score modified by Principal Authority',
      status: 'APPROVED'
    }).catch(() => {});

    res.json({
      success: true,
      message: `Trust Score for ${user.name} successfully updated to ${validatedScore}/100`,
      entity: {
        id: user._id,
        name: user.name,
        role: user.role,
        trustScore: user.trustScore,
        trustScoreLastUpdatedBy: user.trustScoreLastUpdatedBy,
        trustScoreUpdateReason: user.trustScoreUpdateReason,
        badges: user.badges
      }
    });
  } catch (error) {
    next(error);
  }
};
