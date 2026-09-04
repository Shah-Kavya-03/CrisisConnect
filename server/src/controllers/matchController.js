import Match from '../models/Match.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { broadcastStatusUpdate, getIO } from '../config/socket.js';

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

    // Auto-allocate resources from relief organization inventory
    let allocatedResourceNote = '';
    const org = await Organization.findOne({ isVerified: true });
    if (org && org.resourcesInventory) {
      const inv = org.resourcesInventory;
      let deducted = false;

      if (request.category === 'Oxygen' && inv.oxygenCylinders > 0) {
        inv.oxygenCylinders = Math.max(0, inv.oxygenCylinders - 1);
        allocatedResourceNote = ' • Auto-allocated: 1 Oxygen Cylinder';
        deducted = true;
      } else if (request.category === 'Food & Water') {
        if (inv.foodKits > 0) inv.foodKits = Math.max(0, inv.foodKits - 2);
        if (inv.drinkingWaterLiters > 0) inv.drinkingWaterLiters = Math.max(0, inv.drinkingWaterLiters - 10);
        allocatedResourceNote = ' • Auto-allocated: 2 Food Kits & 10L Water';
        deducted = true;
      } else if (request.category === 'Shelter' && inv.temporaryShelterBeds > 0) {
        inv.temporaryShelterBeds = Math.max(0, inv.temporaryShelterBeds - 1);
        allocatedResourceNote = ' • Auto-allocated: 1 Emergency Shelter Bed';
        deducted = true;
      } else if (request.category === 'Rescue' && inv.rescueBoats > 0) {
        inv.rescueBoats = Math.max(0, inv.rescueBoats - 1);
        allocatedResourceNote = ' • Auto-allocated: 1 Rapid Rescue Raft';
        deducted = true;
      } else if ((request.category === 'Medical' || request.category === 'Medicines' || request.category === 'Blood') && inv.medicalFirstAidKits > 0) {
        inv.medicalFirstAidKits = Math.max(0, inv.medicalFirstAidKits - 1);
        allocatedResourceNote = ' • Auto-allocated: 1 Trauma & First-Aid Kit';
        deducted = true;
      }

      if (deducted) {
        await org.save();
        try {
          const io = getIO();
          io.emit('organization:inventory_updated', {
            organizationId: org._id,
            resourcesInventory: org.resourcesInventory
          });
        } catch (e) {}
      }
    }

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
      note: `Dispatched to ${request.assignedTo.name} (Estimated arrival: ${estimatedArrivalMinutes || 12} mins)${allocatedResourceNote}`
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
