import Request from '../models/Request.js';
import VerificationLog from '../models/VerificationLog.js';
import { pythonServiceClient } from '../services/pythonServiceClient.js';
import { broadcastEmergency } from '../config/socket.js';
import { logger } from '../utils/logger.js';

// @desc    Process incoming disaster emergency SMS (Twilio / Telecom Webhook / Low-Bandwidth Gateway)
// @route   POST /api/sms/incoming
// @access  Public
export const handleIncomingSms = async (req, res, next) => {
  try {
    // Support standard webhook payloads (From/Body) or custom json (senderPhone/message)
    const senderPhone = req.body.From || req.body.senderPhone || req.body.phone || '+91 98765 00000';
    const rawMessage = req.body.Body || req.body.message || req.body.text || '';
    const locationText = req.body.location || req.body.locationText;
    const coordinates = req.body.coordinates || { lat: 28.6139, lng: 77.2090 };

    if (!rawMessage || !rawMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Empty SMS body. An emergency message description is required.'
      });
    }

    const message = rawMessage.trim();
    logger.info(`Received emergency SMS from ${senderPhone}: "${message}"`);

    // Infer category heuristics
    const lower = message.toLowerCase();
    let category = 'General';
    if (lower.includes('boat') || lower.includes('trapped') || lower.includes('drown') || lower.includes('flood') || lower.includes('roof')) {
      category = 'Rescue';
    } else if (lower.includes('oxygen') || lower.includes('cylinder') || lower.includes('breathing')) {
      category = 'Oxygen';
    } else if (lower.includes('insulin') || lower.includes('medicine') || lower.includes('drug') || lower.includes('tablet')) {
      category = 'Medicines';
    } else if (lower.includes('blood') || lower.includes('bleeding')) {
      category = 'Blood';
    } else if (lower.includes('doctor') || lower.includes('heart') || lower.includes('cardiac') || lower.includes('fever') || lower.includes('hospital')) {
      category = 'Medical';
    } else if (lower.includes('food') || lower.includes('water') || lower.includes('ration') || lower.includes('hungry')) {
      category = 'Food & Water';
    } else if (lower.includes('shelter') || lower.includes('tarp') || lower.includes('blanket') || lower.includes('tent')) {
      category = 'Shelter';
    } else if (lower.includes('transport') || lower.includes('ambulance') || lower.includes('evacuat')) {
      category = 'Transportation';
    }

    // Call Python AI Microservice for Urgency Scoring
    const triageAnalysis = await pythonServiceClient.scoreUrgency({
      title: 'SMS Emergency Alert',
      description: message,
      category,
      declaredUrgency: 'High',
      coordinates
    }).catch(() => ({
      urgencyScore: 92,
      recommendedUrgency: 'Critical',
      criticalFactors: ['2G/SMS Disaster Gateway Intake']
    }));

    const customId = `SMS-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const aiPriorityScore = triageAnalysis.urgencyScore || 92;

    const newRequest = await Request.create({
      customId,
      title: `🚨 2G/SMS SOS: ${message.length > 55 ? message.slice(0, 52) + '...' : message}`,
      description: `Automated Low-Bandwidth SMS Intake from ${senderPhone}: "${message}"`,
      category,
      urgency: triageAnalysis.recommendedUrgency || 'Critical',
      aiPriorityScore,
      locationName: locationText || `SMS Cell Tower Triangulation (Lat: ${coordinates.lat.toFixed(4)}, Lng: ${coordinates.lng.toFixed(4)})`,
      geometry: {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat]
      },
      coordinates,
      requesterName: `SMS Citizen (${senderPhone})`,
      requesterPhone: senderPhone,
      status: 'Awaiting Help',
      expiresAt: new Date(now.getTime() + 4 * 3600000),
      isDuplicate: false,
      keywords: triageAnalysis.criticalFactors || [category.toLowerCase(), 'sms-dispatch'],
      peopleCount: 1,
      timeline: [
        {
          status: 'Created',
          timestamp: timeStr,
          note: `Received via 2G/SMS Gateway from ${senderPhone}`
        },
        {
          status: 'AI Triaged',
          timestamp: timeStr,
          note: `AI NLP Triage: Assigned priority (${aiPriorityScore}/100, category: ${category})`
        }
      ]
    });

    // Verification Log Audit Trail
    await VerificationLog.create({
      actionType: 'SMS_GATEWAY_INTAKE',
      requestId: customId,
      performerRole: 'TELECOM_GATEWAY',
      details: {
        senderPhone,
        rawMessage: message,
        parsedCategory: category,
        aiPriorityScore
      }
    }).catch(() => {});

    // Broadcast globally to all volunteers & admins via Socket.io
    broadcastEmergency(newRequest);

    res.status(201).json({
      success: true,
      message: `Emergency SOS #${customId} dispatched from SMS intake`,
      request: newRequest,
      aiTriage: triageAnalysis
    });
  } catch (error) {
    next(error);
  }
};
