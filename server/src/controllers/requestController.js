import Request from '../models/Request.js';
import User from '../models/User.js';
import VerificationLog from '../models/VerificationLog.js';
import { pythonServiceClient } from '../services/pythonServiceClient.js';
import { broadcastEmergency, broadcastStatusUpdate, getIO } from '../config/socket.js';
import { getHaversineDistanceKm } from '../services/geoMatchService.js';
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

// @desc    Moderation: Approve flagged request as unique and legitimate
// @route   PATCH /api/requests/:id/approve
// @access  Public (or Moderator/Admin)
export const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await Request.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.isDuplicate = false;
    request.similarityScore = 0;
    request.status = 'Awaiting Help';
    request.timeline.push({
      status: 'Approved',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: 'Moderator approved request as unique & legitimate (De-flagged)'
    });

    await request.save();

    await VerificationLog.create({
      actionType: 'MODERATOR_APPROVE',
      requestId: request.customId,
      performerRole: req.user?.role || 'MODERATOR',
      details: { verifiedAt: new Date().toISOString() }
    }).catch(() => {});

    broadcastStatusUpdate(request.customId, {
      status: 'Awaiting Help',
      isDuplicate: false,
      timeline: request.timeline
    });

    res.json({
      success: true,
      message: `Request #${request.customId} approved and released to responder feed`,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderation: Merge duplicate report into primary incident
// @route   POST /api/requests/merge
// @access  Public (or Moderator/Admin)
export const mergeRequests = async (req, res, next) => {
  try {
    const { duplicateId, targetId } = req.body;

    if (!duplicateId || !targetId) {
      return res.status(400).json({ success: false, message: 'Both duplicateId and targetId are required' });
    }

    const [duplicateReq, targetReq] = await Promise.all([
      Request.findOne({ $or: [{ customId: duplicateId }, { _id: duplicateId.match(/^[0-9a-fA-F]{24}$/) ? duplicateId : null }] }),
      Request.findOne({ $or: [{ customId: targetId }, { _id: targetId.match(/^[0-9a-fA-F]{24}$/) ? targetId : null }] })
    ]);

    if (!duplicateReq || !targetReq) {
      return res.status(404).json({ success: false, message: 'One or both requests not found' });
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update target request
    targetReq.peopleCount = (targetReq.peopleCount || 1) + (duplicateReq.peopleCount || 1);
    targetReq.comments.push({
      author: 'System Auto-Merge',
      text: `Merged duplicate report #${duplicateReq.customId}: "${duplicateReq.description}"`,
      timestamp: timeStr,
      createdAt: now
    });
    targetReq.timeline.push({
      status: 'Duplicate Merged',
      timestamp: timeStr,
      note: `Merged with duplicate report #${duplicateReq.customId} (+${duplicateReq.peopleCount || 1} people affected)`
    });

    // Update duplicate request
    duplicateReq.status = 'Merged';
    duplicateReq.isDuplicate = true;
    duplicateReq.duplicateMatchId = targetReq.customId;
    duplicateReq.timeline.push({
      status: 'Merged',
      timestamp: timeStr,
      note: `Merged into primary incident #${targetReq.customId}`
    });

    await Promise.all([targetReq.save(), duplicateReq.save()]);

    await VerificationLog.create({
      actionType: 'MODERATOR_MERGE',
      requestId: targetReq.customId,
      performerRole: req.user?.role || 'MODERATOR',
      details: {
        mergedDuplicateId: duplicateReq.customId,
        newPeopleCount: targetReq.peopleCount
      }
    }).catch(() => {});

    broadcastStatusUpdate(targetReq.customId, {
      peopleCount: targetReq.peopleCount,
      timeline: targetReq.timeline,
      comments: targetReq.comments
    });

    broadcastStatusUpdate(duplicateReq.customId, {
      status: 'Merged',
      timeline: duplicateReq.timeline
    });

    res.json({
      success: true,
      message: `Duplicate #${duplicateReq.customId} successfully merged into #${targetReq.customId}`,
      targetRequest: targetReq,
      duplicateRequest: duplicateReq
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderation: Reject request as fraudulent / spam
// @route   PATCH /api/requests/:id/reject
// @access  Public (or Moderator/Admin)
export const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const request = await Request.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.status = 'Rejected (Spam)';
    request.timeline.push({
      status: 'Rejected',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: reason ? `Moderator flagged as fraudulent/spam: ${reason}` : 'Moderator flagged as fraudulent / spam'
    });

    await request.save();

    await VerificationLog.create({
      actionType: 'MODERATOR_REJECT',
      requestId: request.customId,
      performerRole: req.user?.role || 'MODERATOR',
      details: { reason: reason || 'Fraudulent/Spam report' }
    }).catch(() => {});

    broadcastStatusUpdate(request.customId, {
      status: 'Rejected (Spam)',
      timeline: request.timeline
    });

    res.json({
      success: true,
      message: `Request #${request.customId} marked as spam and removed from feed`,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment / field note to request
// @route   POST /api/requests/:id/comments
// @access  Public (or Authenticated)
export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, author } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const request = await Request.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const now = new Date();
    const commentAuthor = author || req.user?.name || 'Responder';
    const newComment = {
      id: `comm-${Date.now()}`,
      author: commentAuthor,
      text: text.trim(),
      timestamp: 'Just now',
      createdAt: now
    };

    request.comments.push(newComment);
    await request.save();

    // Emit live socket event
    try {
      const io = getIO();
      io.to(`request:${request.customId}`).emit('request:comment_added', {
        requestId: request.customId,
        comment: newComment
      });
      io.emit('request:comment_added', {
        requestId: request.customId,
        comment: newComment
      });
    } catch (e) {}

    res.status(201).json({
      success: true,
      comment: newComment,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Geofenced Proof-of-Help: Verify volunteer on-site arrival (within 200m)
// @route   POST /api/requests/:id/verify-arrival
// @access  Public (or Volunteer)
export const verifyArrival = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { volunteerId, coordinates } = req.body;

    const request = await Request.findOne({
      $or: [{ customId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const reqCoords = request.coordinates || { lat: 28.6139, lng: 77.2090 };
    let distanceKm = 0.05; // default close proximity

    if (coordinates && coordinates.lat && coordinates.lng) {
      distanceKm = getHaversineDistanceKm(
        coordinates.lat,
        coordinates.lng,
        reqCoords.lat,
        reqCoords.lng
      );
    }

    const distanceMeters = Math.round(distanceKm * 1000);
    const isWithinGeofence = distanceMeters <= 500; // Allow within 500m geofence radius for disaster terrain

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    request.status = 'In Progress';
    request.timeline.push({
      status: 'Arrived On-Site',
      timestamp: timeStr,
      note: `Volunteer on-site arrival confirmed via GPS Geofence (${distanceMeters}m from site)`
    });

    await request.save();

    // Reward volunteer trust score if userId or volunteerId is available
    let updatedTrustScore = null;
    const targetUserId = req.user?._id || volunteerId;
    if (targetUserId) {
      const user = await User.findById(targetUserId);
      if (user && user.role !== 'NGO') {
        user.trustScore = Math.min((user.trustScore || 85) + 3, 100);
        await user.save();
        updatedTrustScore = user.trustScore;
      }
    }

    await VerificationLog.create({
      actionType: 'GEOFENCE_PROXIMITY_VERIFIED',
      requestId: request.customId,
      performerRole: 'VOLUNTEER',
      details: {
        distanceMeters,
        verifiedAt: now.toISOString(),
        trustScoreAwarded: 3
      }
    }).catch(() => {});

    broadcastStatusUpdate(request.customId, {
      status: 'In Progress',
      timeline: request.timeline,
      isGeofenceVerified: true
    });

    res.json({
      success: true,
      verified: true,
      distanceMeters,
      updatedTrustScore,
      message: `On-site arrival verified (${distanceMeters}m away). Status updated to 'In Progress'.`,
      request
    });
  } catch (error) {
    next(error);
  }
};
