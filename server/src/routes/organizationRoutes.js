import express from 'express';
import {
  registerOrganization,
  getOrganizations,
  updateInventory
} from '../controllers/organizationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getOrganizations)
  .post(registerOrganization);

router.patch('/:id/inventory', protect, updateInventory);

export default router;
