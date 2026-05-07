import Resume from '../models/resume.model.js';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import { extractTextFromPDF } from '../services/pdf.service.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';
import { analyzeResume } from '../services/gemini.service.js';

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const { jobDescription } = req.body;

  console.time('PDF & Cloudinary Processing');
  // Use allSettled to ensure we can cleanup Cloudinary if text extraction fails
  const [textResult, cloudResult] = await Promise.allSettled([
    extractTextFromPDF(req.file.buffer),
    uploadToCloudinary(req.file.buffer, req.file.originalname)
  ]);
  console.timeEnd('PDF & Cloudinary Processing');

  // Check if text extraction failed
  if (textResult.status === 'rejected') {
    // If Cloudinary succeeded, clean it up to prevent orphaned files
    if (cloudResult.status === 'fulfilled' && cloudResult.value?.public_id) {
      deleteFromCloudinary(cloudResult.value.public_id).catch(err =>
        console.error('Cloudinary cleanup failed during aborted upload:', err.message)
      );
    }
    throw new AppError(textResult.reason?.message || 'Could not extract meaningful text from PDF', 400);
  }

  // Check if Cloudinary upload failed
  if (cloudResult.status === 'rejected') {
    throw new AppError('Failed to upload file to secure storage', 500);
  }

  const extractedText = textResult.value;
  const cloudinaryResult = cloudResult.value;

  console.time('Gemini API Analysis');
  // Analyze with Gemini
  const analysis = await analyzeResume(extractedText, jobDescription);
  console.timeEnd('Gemini API Analysis');

  // Save to DB
  const resume = await Resume.create({
    user: req.user._id,
    fileName: req.file.originalname,
    fileUrl: cloudinaryResult.secure_url,
    publicId: cloudinaryResult.public_id,
    extractedText,
    jobDescription,
    analysis,
  });

  res.status(201).json({ success: true, resume });
});

export const getResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('-extractedText');

  res.json({ success: true, resumes });
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) throw new AppError('Resume not found', 404);
  res.json({ success: true, resume });
});

export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) throw new AppError('Resume not found', 404);

  await resume.deleteOne();

  // Delete from Cloudinary in background (don't await)
  if (resume.publicId) {
    deleteFromCloudinary(resume.publicId).catch(err => 
      console.error('Cloudinary cleanup failed:', err.message)
    );
  }

  res.json({ success: true, message: 'Resume deleted' });
});

export const reanalyzeResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) throw new AppError('Resume not found', 404);

  const { jobDescription } = req.body;
  const analysis = await analyzeResume(resume.extractedText, jobDescription || resume.jobDescription);

  resume.analysis = analysis;
  if (jobDescription) resume.jobDescription = jobDescription;
  await resume.save();

  res.json({ success: true, resume });
});
