import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String },
    extractedText: { type: String },
    jobDescription: { type: String },
    analysis: {
      atsScore: { type: Number },
      overallScore: { type: Number },
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
      keywordGaps: [String],
      matchedKeywords: [String],
      sections: {
        contact: { score: Number, feedback: String },
        summary: { score: Number, feedback: String },
        experience: { score: Number, feedback: String },
        education: { score: Number, feedback: String },
        skills: { score: Number, feedback: String },
      },
    },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Resume', resumeSchema);
