import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { chat } from '../controllers/chat.controller.js';

const router = express.Router();

router.use(protect);
router.post('/', chat);

export default router;
