import express from 'express';
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  renewRequest
} from '../controllers/requestController.js';
import { sosRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.route('/')
  .get(getRequests)
  .post(sosRateLimiter, createRequest);

router.route('/:id')
  .get(getRequestById);

router.route('/:id/status')
  .patch(updateRequestStatus);

router.route('/:id/renew')
  .patch(renewRequest);

export default router;
