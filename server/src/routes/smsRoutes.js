import express from 'express';
import { handleIncomingSms } from '../controllers/smsController.js';
import { sosRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/sms/incoming
router.post('/incoming', sosRateLimiter, handleIncomingSms);

export default router;
