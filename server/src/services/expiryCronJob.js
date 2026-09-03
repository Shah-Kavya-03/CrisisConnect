import Request from '../models/Request.js';
import VerificationLog from '../models/VerificationLog.js';
import { broadcastStatusUpdate } from '../config/socket.js';
import { logger } from '../utils/logger.js';

let cronTimer = null;

export const startExpiryCronJob = (intervalMs = 60000) => {
  if (cronTimer) clearInterval(cronTimer);

  logger.info(`Starting Request Expiry Cron Daemon (checks every ${intervalMs / 1000}s)`);

  cronTimer = setInterval(async () => {
    try {
      const now = new Date();
      // Find active, unfulfilled requests whose expiresAt has passed
      const expiredRequests = await Request.find({
        status: { $in: ['Awaiting Help', 'Assigned', 'Flagged Duplicate'] },
        expiresAt: { $lte: now }
      });

      if (expiredRequests.length > 0) {
        logger.info(`Cron detected ${expiredRequests.length} expired request(s). Archiving...`);

        for (const req of expiredRequests) {
          const oldStatus = req.status;
          req.status = 'Expired';
          req.timeline.push({
            status: 'Expired',
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note: 'Request auto-expired by CrisisConnect Life-Preserving Lease daemon due to no renewal.'
          });
          await req.save();

          // Log verification audit trail
          await VerificationLog.create({
            actionType: 'EXPIRY_AUTO_ARCHIVE',
            requestId: req.customId,
            performerRole: 'SYSTEM_CRON',
            previousState: oldStatus,
            newState: 'Expired',
            details: { expiredAt: now.toISOString() }
          }).catch(() => {});

          // Real-time broadcast
          broadcastStatusUpdate(req.customId, {
            status: 'Expired',
            timeline: req.timeline
          });
        }
      }
    } catch (err) {
      // Gracefully ignore if MongoDB is reconnecting
    }
  }, intervalMs);
};

export const stopExpiryCronJob = () => {
  if (cronTimer) {
    clearInterval(cronTimer);
    cronTimer = null;
  }
};
