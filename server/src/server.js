import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { startExpiryCronJob } from './services/expiryCronJob.js';
import { logger } from './utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server wrapping Express app
const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Connect MongoDB Database
await connectDB();

// Start Background Life-Preserving Lease Expiry Daemon
const cronInterval = parseInt(process.env.EXPIRY_CRON_INTERVAL_MS || '60000', 10);
startExpiryCronJob(cronInterval);

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use by another process.`);
    logger.info(`To free the port on Windows PowerShell, run:`);
    logger.info(`  Get-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess | Stop-Process -Force`);
  } else {
    logger.error(`Server startup error: ${err.message}`);
  }
  process.exit(1);
});

httpServer.listen(PORT, () => {
  logger.success(`CrisisConnect API Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  logger.info(`REST API: http://localhost:${PORT}/api`);
  logger.info(`WebSocket: ws://localhost:${PORT}`);
});

