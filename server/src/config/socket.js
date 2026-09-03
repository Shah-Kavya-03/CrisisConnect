import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join role channel (Requester, Volunteer, NGO, Admin)
    socket.on('join:role', (role) => {
      socket.join(`role:${role}`);
      logger.info(`Socket ${socket.id} joined role:${role}`);
    });

    // Join specific request room for live tracking
    socket.on('join:request', (requestId) => {
      socket.join(`request:${requestId}`);
      logger.info(`Socket ${socket.id} joined request:${requestId}`);
    });

    // Leave request room
    socket.on('leave:request', (requestId) => {
      socket.leave(`request:${requestId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return ioInstance;
};

/**
 * Broadcast emergency SOS to all volunteers and admins
 */
export const broadcastEmergency = (requestData) => {
  if (!ioInstance) return;
  ioInstance.emit('emergency:new', requestData);
  ioInstance.to('role:Volunteer').emit('emergency:volunteer_alert', requestData);
  ioInstance.to('role:Admin').emit('emergency:admin_alert', requestData);
};

/**
 * Broadcast request status updates to all listeners and the specific request room
 */
export const broadcastStatusUpdate = (requestId, updateData) => {
  if (!ioInstance) return;
  ioInstance.to(`request:${requestId}`).emit('request:status_update', {
    requestId,
    ...updateData
  });
  ioInstance.emit('request:updated', { requestId, ...updateData });
};

/**
 * Send targeted notification to a user
 */
export const emitNotification = (userId, notification) => {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit('notification:received', notification);
};
