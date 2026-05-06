import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const keyGenerator = (req) => req.user?._id || ipKeyGenerator(req);

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { success: false, message: 'Too many requests, please try again later' },
  keyGenerator: (req) => req.user?._id || ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
  keyGenerator: (req) => ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute (stricter for Gemini API)
  message: { success: false, message: 'Too many requests to AI evaluation service. Please wait before submitting another answer.' },
  keyGenerator,
  skip: (req) => !req.user, // Only apply to authenticated users
  standardHeaders: true,
  legacyHeaders: false,
});

export const resumeAnalyzeLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2, // limit each user to 2 requests per windowMs
  message: { success: false, message: 'Daily limit reached: You can only analyze 2 resumes per day.' },
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
});

export const interviewLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // limit each user to 3 interviews per windowMs
  message: { success: false, message: 'Daily limit reached: You can only start 3 interviews per day.' },
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
});
