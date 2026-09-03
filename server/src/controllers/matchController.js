import Match from '../models/Match.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { broadcastStatusUpdate } from '../config/socket.js';

// @desc    Dispatch/Create a match between request and volunteer
// @route   POST /api/matches
// @access  Private (or Public demo)
export const createMatch = async (req, res, next) => {
  try {
    const { requestId, customRequestId, volunteerUserId, distanceKm, estimatedArrivalMinutes } = req.body;

    const request = await Request.findOne({
      $or: [{ customId: customRequestId || requestId }, { _id: requestId.match(/^[0-9a-fA-F]{24}$/) ? requestId : null }]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const match = await Match.create({
      requestId: request._id,
      customRequestId: request.customId,
      volunteerUserId,
      distanceKm: distanceKm || 2.5,
      estimatedArrivalMinutes: estimatedArrivalMinutes || 12,
      status: 'Accepted'
    });

    // Update request status to Assigned
    request.status = 'Assigned';
    const volunteerUser = await User.findById(volunteerUserId);
    request.assignedTo = {
      id: `VOL-${Math.floor(100 + Math.random() * 900)}`,
      userId: volunteerUserId,
      name: volunteerUser ? volunteerUser.name : 'Volunteer Responder',
      type: 'Registered Volunteer',
      trustScore: volunteerUser ? volunteerUser.trustScore : 92,
      phone: volunteerUser ? volunteerUser.phone : '+91 98765 43210'
    };

    request.timeline.push({
      status: 'Volunteer Assigned',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: `Dispatched to ${request.assignedTo.name} (Estimated arrival: ${estimatedArrivalMinutes || 12} mins)`
    });

    await request.save();

    broadcastStatusUpdate(request.customId, {
      status: 'Assigned',
      assignedTo: request.assignedTo,
      timeline: request.timeline
    });

    res.status(201).json({
      success: true,
      match,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active matches
// @route   GET /api/matches
// @access  Public
export const getActiveMatches = async (req, res, next) => {
  try {
    const matches = await Match.find().populate('volunteerUserId', 'name phone trustScore').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    next(error);
  }
};
