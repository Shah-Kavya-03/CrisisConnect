import express from 'express';
import {
  getNearbyVolunteers,
  updateVolunteerLocation,
  getVolunteerStats
} from '../controllers/volunteerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/nearby', getNearbyVolunteers);
router.get('/stats', getVolunteerStats);
router.patch('/location', protect, updateVolunteerLocation);

export default router;
