import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: String,
  userAnswer: String,
  aiFeedback: String,
  suggestedAnswer: String,
  score: Number,
  difficulty: String,
  topic: String,
});

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    mode: { type: String, enum: ['resume', 'technical', 'hr'], required: true },
    role: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    totalQuestions: { type: Number, default: 5 },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    currentQuestionIndex: { type: Number, default: 0 },
    questions: [questionSchema],
    finalScore: { type: Number },
    summary: { type: String },
    weakAreas: [String],
    strongAreas: [String],
    generatedQuestions: [String],
  },
  { timestamps: true }
);

interviewSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Interview', interviewSchema);
