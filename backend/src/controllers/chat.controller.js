import { asyncHandler } from '../middleware/error.middleware.js';
import { chatWithAI } from '../services/gemini.service.js';

export const chat = asyncHandler(async (req, res) => {
  const { messages, context } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ success: false, message: 'Messages required' });
  }

  const reply = await chatWithAI(messages, context);
  res.json({ success: true, reply });
});
