import express from 'express';
import {
  getAdminStats,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminOrganizations,
  createAdminOrganization,
  updateAdminOrganization,
  deleteAdminOrganization,
  getAdminRequests,
  updateAdminRequest,
  deleteAdminRequest,
  getAdminTrustScores,
  updateEntityTrustScore
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect & adminOnly to all routes in this router
router.use(protect, adminOnly);

// System & Database Overview Statistics
router.get('/stats', getAdminStats);

// User Management (Citizens, Volunteers, NGOs, Admins)
router.route('/users')
  .get(getAdminUsers);

router.route('/users/:id')
  .patch(updateAdminUser)
  .delete(deleteAdminUser);

// NGOs & Agencies Registry
router.route('/organizations')
  .get(getAdminOrganizations)
  .post(createAdminOrganization);

router.route('/organizations/:id')
  .patch(updateAdminOrganization)
  .delete(deleteAdminOrganization);

// Emergency SOS Requests Overwatch
router.route('/requests')
  .get(getAdminRequests);

router.route('/requests/:id')
  .patch(updateAdminRequest)
  .delete(deleteAdminRequest);

// Principal Trust Authority & Score Management
router.get('/trust-scores', getAdminTrustScores);
router.patch('/trust-scores/:userId', updateEntityTrustScore);

export default router;
