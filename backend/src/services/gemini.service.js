import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { AppError } from '../middleware/error.middleware.js';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Initializes the Gemini model.
 * Uses gemini-3-flash-preview: The best model for fast, cost-effective, and structured tasks on the free tier.
 */
const getModel = (requireJson = false, systemInstruction = null) => {
  const modelConfig = { model: 'gemini-3-flash-preview' };
  const generationConfig = {};

  if (systemInstruction) {
    modelConfig.systemInstruction = systemInstruction;
  }

  if (requireJson) {
    // Native JSON mode guarantees a clean JSON string, eliminating regex parsing
    generationConfig.responseMimeType = 'application/json';
  }

  return genAI.getGenerativeModel(modelConfig, { generationConfig });
};

const safeJsonParse = (text) => {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse AI JSON response:', error.message, '\nRaw Text:', text);
    throw new AppError('AI generated an invalid response format. Please try again.', 500);
  }
};

const handleGeminiError = (error) => {
  // console.error("Gemini Error Details:", error);
  const message = error.message || '';
  
  if (message.includes('429') || message.includes('Too Many Requests') || message.includes('quota')) {
    throw { statusCode: 429, message: 'AI service quota exceeded. Please try again in a few moments.', retryAfter: 60 };
  }
  
  if (message.includes('401') || message.includes('Unauthorized') || message.includes('invalid API key')) {
    throw { statusCode: 500, message: 'AI service authentication failed. Please contact support.' };
  }
  
  if (message.includes('RESOURCE_EXHAUSTED')) {
    throw { statusCode: 429, message: 'AI service is temporarily busy. Please try again shortly.', retryAfter: 30 };
  }
  
  if (message.includes('ERR_') || message.includes('ECONNREFUSED')) {
    throw { statusCode: 503, message: 'AI service is temporarily unavailable. Please try again.' };
  }
  
  if (error.statusCode) {
    throw error;
  }
  
  throw { statusCode: 500, message: 'Failed to process request with AI service. Please try again.' };
};

export const analyzeResume = async (resumeText, jobDescription = '') => {
  try {
    const model = getModel(true); // Enable JSON mode
    const jdSection = jobDescription
      ? `Job Description:\n${jobDescription}\n\nPerform keyword gap analysis between the resume and job description.`
      : 'No job description provided. Skip keyword gap analysis.';

    const prompt = `You are an expert ATS resume analyzer and career coach. Analyze this resume and provide a detailed, structured evaluation.

Resume Text:
${resumeText}

${jdSection}

Scoring Criteria:
- atsScore (0-100): Evaluates ATS compatibility, keyword optimization, formatting, and resume parsability.
- overallScore (0-100): Evaluates overall resume quality including content impact, clarity, action verbs, achievements, relevance, and grammar.

Use this exact JSON structure:
{
  "atsScore": <number 0-100>,
  "overallScore": <number 0-100>,
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "suggestions": [<string>, ...],
  "keywordGaps": [<string>, ...],
  "matchedKeywords": [<string>, ...],
  "sections": {
    "contact": { "score": <0-100>, "feedback": "<string>" },
    "summary": { "score": <0-100>, "feedback": "<string>" },
    "experience": { "score": <0-100>, "feedback": "<string>" },
    "education": { "score": <0-100>, "feedback": "<string>" },
    "skills": { "score": <0-100>, "feedback": "<string>" }
  }
}`;

    const result = await model.generateContent(prompt);
    // Because of responseMimeType, we can parse immediately
    return safeJsonParse(result.response.text()); 
  } catch (error) {
    handleGeminiError(error);
  }
};

export const generateInterviewQuestions = async ({ mode, role, difficulty, totalQuestions, resumeText }) => {
  try {
    const model = getModel(true); // Enable JSON mode

    let contextPrompt = '';
    if (mode === 'resume' && resumeText) {
      contextPrompt = `Generate questions based on this resume:\n${resumeText.substring(0, 3000)}`;
    } else if (mode === 'technical') {
      contextPrompt = `Generate technical interview questions for a ${role || 'software engineer'} role.`;
    } else if (mode === 'hr') {
      contextPrompt = `Generate HR behavioral interview questions for a ${role || 'professional'} role. Focus on situational, behavioral, and culture-fit questions.`;
    }

    const prompt = `You are an expert interviewer. ${contextPrompt}

Difficulty: ${difficulty}
Number of questions: ${totalQuestions}

Return ONLY a valid JSON array of exactly ${totalQuestions} questions:
["<question1>", "<question2>", ...]

Make questions ${difficulty === 'easy' ? 'straightforward and foundational' : difficulty === 'medium' ? 'moderate and scenario-based' : 'challenging and in-depth'}. No numbering in the strings.`;

    const result = await model.generateContent(prompt);
    return safeJsonParse(result.response.text());
  } catch (error) {
    handleGeminiError(error);
  }
};

export const evaluateAnswer = async ({ question, answer, mode, difficulty }) => {
  try {
    const model = getModel(true); // Enable JSON mode

    const prompt = `You are an expert interviewer evaluating a candidate's answer.

Question: ${question}
Candidate's Answer: ${answer}
Interview Type: ${mode}
Difficulty: ${difficulty}

Evaluate the answer and provide highly specific, actionable feedback. Avoid generic phrases.
Return a JSON object with this structure:
{
  "score": <number 0-10>,
  "feedback": "<highly specific, actionable constructive feedback in 2-3 sentences>",
  "strengths": "<what was good about this answer>",
  "improvements": "<specific areas to improve>",
  "suggestedAnswer": "<a concise suggested answer to the question in less than 100 words>"
}`;

    const result = await model.generateContent(prompt);
    return safeJsonParse(result.response.text());
  } catch (error) {
    handleGeminiError(error);
  }
};

export const generateInterviewSummary = async (questions, mode) => {
  try {
    const model = getModel(true); // Enable JSON mode

    const qa = questions.map((q) => ({
      q: q.question,
      a: q.userAnswer,
      score: q.score,
    }));

    const prompt = `You are an expert career coach. Based on this completed interview session, provide a comprehensive summary.

Interview Mode: ${mode}
Questions and Scores:
${JSON.stringify(qa, null, 2)}

Return a JSON object with this structure:
{
  "finalScore": <overall score 0-100>,
  "summary": "<2-3 paragraph overall performance summary>",
  "strongAreas": ["<topic>", ...],
  "weakAreas": ["<topic>", ...],
  "nextSteps": ["<actionable advice>", ...]
}`;

    const result = await model.generateContent(prompt);
    return safeJsonParse(result.response.text());
  } catch (error) {
    handleGeminiError(error);
  }
};

export const chatWithAI = async (messages, context = '') => {
  try {
    const systemInstruction = `You are an expert AI career coach and interview preparation assistant. Help users improve their answers, explain interview concepts, and provide career advice. Be concise, practical, and encouraging.
${context ? `Context: ${context}` : ''}`;
    
    // Initialize model with System Instructions, JSON mode off
    const model = getModel(false, systemInstruction); 

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1];
    // No need to prepend the system prompt anymore!
    const result = await chat.sendMessage(lastMessage.content); 
    return result.response.text();
  } catch (error) {
    handleGeminiError(error);
  }
};