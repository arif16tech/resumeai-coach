import Resume from '../models/resume.model.js';
import Interview from '../models/interview.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [resumes, interviews] = await Promise.all([
    Resume.find({ user: userId }).sort({ createdAt: -1 }).limit(5).select('-extractedText'),
    Interview.find({ user: userId }).sort({ createdAt: -1 }).limit(5).select('-generatedQuestions -questions'),
  ]);

  const completedInterviews = await Interview.find({ user: userId, status: 'completed' });
  const avgScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum, i) => sum + (i.finalScore || 0), 0) /
            completedInterviews.length
        )
      : 0;

  const weakAreas = completedInterviews
    .flatMap((i) => i.weakAreas || [])
    .reduce((acc, area) => {
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {});

  res.json({
    success: true,
    stats: {
      totalResumes: await Resume.countDocuments({ user: userId }),
      totalInterviews: await Interview.countDocuments({ user: userId }),
      completedInterviews: completedInterviews.length,
      avgInterviewScore: avgScore,
      topWeakAreas: Object.entries(weakAreas)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([area]) => area),
    },
    recentResumes: resumes,
    recentInterviews: interviews,
  });
});
