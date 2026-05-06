import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
  reanalyzeResume,
} from '../controllers/resume.controller.js';

import { resumeAnalyzeLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/upload', resumeAnalyzeLimiter, upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);
router.post('/:id/reanalyze', resumeAnalyzeLimiter, reanalyzeResume);

export default router;
