import Interview from '../models/interview.model.js';
import Resume from '../models/resume.model.js';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateInterviewSummary,
} from '../services/gemini.service.js';

export const startInterview = asyncHandler(async (req, res) => {
  const { mode, role, difficulty, totalQuestions, resumeId } = req.body;

  let resumeText = '';
  let resume = null;

  if (mode === 'resume') {
    if (!resumeId) throw new AppError('Resume ID required for resume-based interview', 400);
    resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) throw new AppError('Resume not found', 404);
    resumeText = resume.extractedText;
  }

  const questions = await generateInterviewQuestions({
    mode,
    role,
    difficulty: difficulty || 'medium',
    totalQuestions: totalQuestions || 5,
    resumeText,
  });

  const interview = await Interview.create({
    user: req.user._id,
    resume: resume?._id,
    mode,
    role,
    difficulty: difficulty || 'medium',
    totalQuestions: questions.length,
    generatedQuestions: questions,
    status: 'active',
  });

  res.status(201).json({
    success: true,
    interview: {
      _id: interview._id,
      mode: interview.mode,
      role: interview.role,
      difficulty: interview.difficulty,
      totalQuestions: interview.totalQuestions,
      currentQuestion: questions[0],
      questionNumber: 1,
    },
  });
});

export const submitAnswer = asyncHandler(async (req, res) => {
  const { answer } = req.body;
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });

  if (!interview) throw new AppError('Interview not found', 404);
  if (interview.status === 'completed') throw new AppError('Interview already completed', 400);

  const currentIdx = interview.currentQuestionIndex;

  // Ensure question exists in array
  if (!interview.questions[currentIdx]) {
    interview.questions.push({ question: interview.generatedQuestions[currentIdx] });
  }
  interview.questions[currentIdx].userAnswer = answer;

  const evaluation = await evaluateAnswer({
    question: interview.generatedQuestions[currentIdx],
    answer,
    mode: interview.mode,
    difficulty: interview.difficulty,
  });

  interview.questions[currentIdx].aiFeedback = evaluation.feedback;
  interview.questions[currentIdx].score = evaluation.score;
  if (evaluation.suggestedAnswer) {
    interview.questions[currentIdx].suggestedAnswer = evaluation.suggestedAnswer;
  }

  // Move to next question
  const nextIdx = currentIdx + 1;
  const isLastQuestion = nextIdx >= interview.totalQuestions;

  if (isLastQuestion) {
    // Generate final summary
    const summary = await generateInterviewSummary(interview.questions, interview.mode);
    interview.finalScore = summary.finalScore;
    interview.summary = summary.summary;
    interview.strongAreas = summary.strongAreas;
    interview.weakAreas = summary.weakAreas;
    interview.status = 'completed';
    await interview.save();

    return res.json({
      success: true,
      isCompleted: true,
      summary,
    });
  }

  interview.currentQuestionIndex = nextIdx;
  await interview.save();

  res.json({
    success: true,
    feedback: evaluation.feedback,
    score: evaluation.score,
    strengths: evaluation.strengths,
    improvements: evaluation.improvements,
    isCompleted: false,
    nextQuestion: interview.generatedQuestions[nextIdx],
    questionNumber: nextIdx + 1,
    totalQuestions: interview.totalQuestions,
  });
});

export const getInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('-generatedQuestions -questions');

  res.json({ success: true, interviews });
});

export const getInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) throw new AppError('Interview not found', 404);
  res.json({ success: true, interview });
});

export const getCurrentQuestion = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) throw new AppError('Interview not found', 404);
  if (interview.status === 'completed') {
    return res.json({ success: true, isCompleted: true });
  }

  const idx = interview.currentQuestionIndex;
  res.json({
    success: true,
    currentQuestion: interview.generatedQuestions[idx],
    questionNumber: idx + 1,
    totalQuestions: interview.totalQuestions,
    previousFeedback: interview.questions[idx - 1]?.aiFeedback || null,
  });
});
