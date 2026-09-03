import Request from '../models/Request.js';
import VerificationLog from '../models/VerificationLog.js';
import { pythonServiceClient } from '../services/pythonServiceClient.js';
import { broadcastEmergency, broadcastStatusUpdate } from '../config/socket.js';
import { logger } from '../utils/logger.js';

// @desc    Create a new emergency assistance request (or SOS)
// @route   POST /api/requests
// @access  Public (or Authenticated)
export const createRequest = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category = 'General',
      urgency = 'Medium',
      locationName,
      coordinates = { lat: 28.6139, lng: 77.2090 },
      requesterName,
      requesterPhone,
      peopleCount = 1,
      isSOS = false
    } = req.body;

    const customId = `CC-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();

    // 1. Fetch active requests for AI duplicate checking
    const existingActiveRequests = await Request.find({
      status: { $in: ['Awaiting Help', 'Assigned', 'En Route', 'In Progress'] }
    }).limit(25).lean();

    const formattedExisting = existingActiveRequests.map(r => ({
      id: r.customId || r._id.toString(),
      title: r.title,
      description: r.description,
      category: r.category,
      coordinates: r.coordinates,
      urgency: r.urgency
    }));

    // 2. Call AI Microservice for Duplicate Detection
    const duplicateAnalysis = await pythonServiceClient.checkDuplicate({
      title: isSOS ? `CRITICAL SOS: ${title || 'Immediate Help Needed'}` : title,
      description: description || 'Emergency assistance needed.',
      category,
      coordinates,
      existingRequests: formattedExisting
    });

    // 3. Call AI Microservice for Distress Triage Priority Scoring
    const triageAnalysis = await pythonServiceClient.scoreUrgency({
      title: title || 'Emergency Help Request',
      description: description || 'Assistance requested',
      category,
      declaredUrgency: urgency,
      coordinates,
      peopleCount
    });

    const aiPriorityScore = isSOS ? 98 : (triageAnalysis.urgencyScore || 65);
    const isDup = duplicateAnalysis.isDuplicate;

    // 4. Construct Request Document
    const newRequest = await Request.create({
      customId,
      title: isSOS ? `🚨 CRITICAL SOS: ${title || 'Immediate Help Required'}` : (title || `${category} Support Request`),
      description: description || (isSOS ? 'Automated high-priority SOS alert sent via Panic Button. Requester requires immediate response at current GPS coordinates.' : 'Emergency assistance required.'),
      category,
      urgency: isSOS ? 'Critical' : (triageAnalysis.recommendedUrgency || urgency),
      aiPriorityScore,
      locationName: locationName || `GPS Detected (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})`,
      geometry: {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat]
      },
      coordinates,
      requesterId: req.user ? req.user._id : null,
      requesterName: requesterName || (req.user ? req.user.name : 'Anonymous Requester'),
      requesterPhone: requesterPhone || (req.user ? req.user.phone : '+91 98765 00000'),
      status: isDup ? 'Flagged Duplicate' : 'Awaiting Help',
      expiresAt: new Date(now.getTime() + (isSOS ? 3 : 4) * 3600000),
      isDuplicate: isDup,
      duplicateMatchId: duplicateAnalysis.matchedRequestId,
      similarityScore: duplicateAnalysis.highestSimilarityScore || 0,
      duplicateReasons: duplicateAnalysis.duplicateReasons || [],
      keywords: triageAnalysis.criticalFactors || [category.toLowerCase()],
      peopleCount,
      timeline: [
        {
          status: 'Created',
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: isSOS ? '1-Tap SOS Panic Button Triggered' : 'Request submitted via CrisisConnect portal'
        },
        {
          status: 'AI Triaged',
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `AI Auto-Triage: Assigned priority (${aiPriorityScore}/100). ${isDup ? `⚠️ Flagged ${duplicateAnalysis.highestSimilarityScore}% duplicate match to #${duplicateAnalysis.matchedRequestId}` : 'Request validated.'}`
        }
      ]
    });

    // 5. Audit Log
    if (isDup) {
      await VerificationLog.create({
        actionType: 'AI_DUPLICATE_FLAG',
        requestId: customId,
        performerRole: 'SYSTEM_AI',
        details: {
          matchedWith: duplicateAnalysis.matchedRequestId,
          similarityScore: duplicateAnalysis.highestSimilarityScore,
          reasons: duplicateAnalysis.duplicateReasons
        }
      }).catch(() => {});
    }

    // 6. Broadcast via Socket.io
    broadcastEmergency(newRequest);

    res.status(201).json({
      success: true,
      request: newRequest,
      aiTriage: triageAnalysis,
      duplicateCheck: duplicateAnalysis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of requests with filters (category, urgency, status, radius)
// @route   GET /api/requests
// @access  Public
export const getRequests = async (req, res, next) => {
  try {
    const { category, urgency, status, lat, lng, radiusKm = 25, search } = req.query;
    let query = {};

    if (category && category !== 'All') query.category = category;
    if (urgency && urgency !== 'All') query.urgency = urgency;
    if (status && status !== 'All') query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { locationName: { $regex: search, $options: 'i' } },
        { customId: { $regex: search, $options: 'i' } }
      ];
    }

    // Geospatial query if coordinates provided
    if (lat && lng) {
      const radiusMeters = parseFloat(radiusKm) * 1000;
      query.geometry = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusMeters
        }
      };
    }

    const requests = await Request.find(query).sort({ aiPriorityScore: -1, createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get request details by customId or ObjectId
// @route   GET /api/requests/:id
// @access  Public
export const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status (Assigned, En Route, In Progress, Resolved)
// @route   PATCH /api/requests/:id/status
// @access  Public (or Volunteer/Admin)
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, volunteerInfo, note } = req.body;
    const now = new Date();

    const request = await Request.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const oldStatus = request.status;
    request.status = status;

    if (volunteerInfo) {
      request.assignedTo = {
        id: volunteerInfo.id || 'VOL-CURRENT',
        name: volunteerInfo.name || 'Volunteer Responder',
        type: volunteerInfo.type || 'Registered Volunteer',
        trustScore: volunteerInfo.trustScore || 90,
        phone: volunteerInfo.phone || '+91 91234 56789'
      };
    }

    request.timeline.push({
      status,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: note || `Status updated to ${status}`
    });

    await request.save();

    // Broadcast status change
    broadcastStatusUpdate(request.customId, {
      status,
      assignedTo: request.assignedTo,
      timeline: request.timeline
    });

    res.json({
      success: true,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Renew request to extend 4-hour lease
// @route   PATCH /api/requests/:id/renew
// @access  Public
export const renewRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const newExpiry = new Date(Date.now() + 4 * 3600000);
    request.expiresAt = newExpiry;
    request.timeline.push({
      status: 'Renewed',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: 'Requester confirmed emergency still active; duration extended by 4 hours.'
    });

    await request.save();

    await VerificationLog.create({
      actionType: 'REQUEST_RENEWAL',
      requestId: request.customId,
      performerRole: 'REQUESTER',
      details: { extendedUntil: newExpiry.toISOString() }
    }).catch(() => {});

    broadcastStatusUpdate(request.customId, {
      expiresAt: newExpiry,
      timeline: request.timeline
    });

    res.json({
      success: true,
      message: 'Request renewed successfully for 4 hours',
      request
    });
  } catch (error) {
    next(error);
  }
};
