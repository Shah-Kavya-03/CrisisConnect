import express from 'express';
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  renewRequest,
  approveRequest,
  mergeRequests,
  rejectRequest,
  addComment,
  verifyArrival
} from '../controllers/requestController.js';
import { sosRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.route('/')
  .get(getRequests)
  .post(sosRateLimiter, createRequest);

router.post('/merge', mergeRequests);

router.route('/:id')
  .get(getRequestById);

router.route('/:id/status')
  .patch(updateRequestStatus);

router.route('/:id/renew')
  .patch(renewRequest);

router.patch('/:id/approve', approveRequest);
router.patch('/:id/reject', rejectRequest);
router.post('/:id/comments', addComment);
router.post('/:id/verify-arrival', verifyArrival);

export default router;
