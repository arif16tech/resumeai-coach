import express from 'express';

import { protect } from '../middleware/auth.middleware.js';
import {
  startInterview,
  submitAnswer,
  getInterviews,
  getInterview,
  getCurrentQuestion,
} from '../controllers/interview.controller.js';

const router = express.Router();

import { interviewLimiter, aiLimiter } from '../middleware/rateLimit.middleware.js';

router.use(protect);

router.post('/start', interviewLimiter, aiLimiter, startInterview);
router.post('/:id/answer', aiLimiter, submitAnswer);
router.get('/', getInterviews);
router.get('/:id', getInterview);
router.get('/:id/current', getCurrentQuestion);

export default router;
