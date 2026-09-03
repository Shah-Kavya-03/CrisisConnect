import Notification from '../models/Notification.js';

// @desc    Get user or global notifications
// @route   GET /api/notifications
// @access  Public
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const query = userId ? { $or: [{ userId }, { userId: null }] } : {};

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);

    // If DB is empty, return high-fidelity disaster response notifications
    if (!notifications || notifications.length === 0) {
      return res.json({
        success: true,
        notifications: [
          {
            id: 'NOTIF-1',
            type: 'critical',
            title: '🔴 Critical Emergency Broadcast',
            message: 'New SOS Rescue Request #CC-1043 (Family trapped on roof) received 2.4 km away.',
            timestamp: '5m ago',
            read: false,
            requestId: 'CC-1043'
          },
          {
            id: 'NOTIF-2',
            type: 'duplicate',
            title: '⚠️ Duplicate Request Flagged',
            message: 'AI system flagged Request #CC-1046 as 87% duplicate match to #CC-1043.',
            timestamp: '2m ago',
            read: false,
            requestId: 'CC-1046'
          },
          {
            id: 'NOTIF-3',
            type: 'assignment',
            title: '✅ Request #CC-1044 Updated',
            message: 'Red Cross Relief Team B is now En Route with drinking water supplies.',
            timestamp: '10m ago',
            read: true,
            requestId: 'CC-1044'
          }
        ]
      });
    }

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Public
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Public
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user.id || req.user._id) : null;
    const query = userId ? { userId } : {};
    await Notification.updateMany(query, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
