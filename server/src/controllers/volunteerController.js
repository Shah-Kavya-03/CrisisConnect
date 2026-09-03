import Volunteer from '../models/Volunteer.js';
import User from '../models/User.js';
import Request from '../models/Request.js';
import { findMatchingVolunteers } from '../services/geoMatchService.js';

// @desc    Get nearby matching volunteers for a specific request or coordinates
// @route   GET /api/volunteers/nearby
// @access  Public
export const getNearbyVolunteers = async (req, res, next) => {
  try {
    const { requestId, lat, lng, category } = req.query;

    let targetRequest = null;
    if (requestId) {
      targetRequest = await Request.findOne({
        $or: [{ customId: requestId }, { _id: requestId.match(/^[0-9a-fA-F]{24}$/) ? requestId : null }]
      });
    }

    const mockRequest = targetRequest || {
      coordinates: {
        lat: lat ? parseFloat(lat) : 28.6139,
        lng: lng ? parseFloat(lng) : 77.2090
      },
      category: category || 'Medical'
    };

    const matches = await findMatchingVolunteers(mockRequest);

    res.json({
      success: true,
      count: matches.length,
      volunteers: matches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update volunteer live location & availability
// @route   PATCH /api/volunteers/location
// @access  Private (Volunteer)
export const updateVolunteerLocation = async (req, res, next) => {
  try {
    const { lat, lng, isAvailable } = req.body;
    const userId = req.user.id || req.user._id;

    let volunteer = await Volunteer.findOne({ userId });
    if (!volunteer) {
      volunteer = await Volunteer.create({
        userId,
        currentLocation: { type: 'Point', coordinates: [lng, lat] },
        isAvailable: isAvailable !== undefined ? isAvailable : true
      });
    } else {
      if (lat && lng) {
        volunteer.currentLocation = { type: 'Point', coordinates: [lng, lat] };
      }
      if (isAvailable !== undefined) {
        volunteer.isAvailable = isAvailable;
      }
      await volunteer.save();
    }

    res.json({
      success: true,
      volunteer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get volunteer reputation stats & telemetry
// @route   GET /api/volunteers/stats
// @access  Private (or Public demo)
export const getVolunteerStats = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }

    res.json({
      success: true,
      stats: {
        trustScore: user ? user.trustScore : 94,
        completedAssignments: user ? user.completedAssignments : 48,
        abandonedAssignments: user ? user.abandonedAssignments : 2,
        avgResponseMinutes: user ? user.avgResponseMinutes : 14,
        badges: user && user.badges.length ? user.badges : ['🏆 Reliable Responder', '⚡ Rapid Action', '✅ 50+ Completed Requests']
      }
    });
  } catch (error) {
    next(error);
  }
};
