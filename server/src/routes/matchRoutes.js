import express from 'express';
import { createMatch, getActiveMatches } from '../controllers/matchController.js';

const router = express.Router();

router.route('/')
  .get(getActiveMatches)
  .post(createMatch);

export default router;
