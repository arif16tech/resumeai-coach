import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import { useVoiceInput } from '../../hooks/useVoiceInput.js';
import AIAssistant from '../../components/AIAssistant.jsx';
import {
  Mic, Send, Bot, Loader2, ChevronRight,
  ArrowLeft, Volume2
} from 'lucide-react';

export default function InterviewSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Core State
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answer, setAnswer] = useState('');
  
  // App State
  const [loading, setLoading] = useState(true);
  const [fetchingNext, setFetchingNext] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Feedback State
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(null);

  const { isRecording, startRecording, stopRecording } = useVoiceInput((transcript) => {
    setAnswer((prev) => prev ? prev + ' ' + transcript : transcript);
  });

  useEffect(() => {
    fetchCurrentQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentQuestion = async () => {
    try {
      const { data } = await api.get(`/interview/${id}/current`);
      if (data.isCompleted) {
        navigate(`/interview/${id}/result`);
        return;
      }
      setCurrentQuestion(data.currentQuestion);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
    } catch {
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
      setFetchingNext(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return toast.error('Please provide an answer');
    setSubmitting(true);

    try {
      const { data } = await api.post(`/interview/${id}/answer`, {
        answer: answer.trim(),
      });

      if (data.isCompleted) {
        toast.success('Interview completed!');
        navigate(`/interview/${id}/result`);
        return;
      }

      setFeedback(data.feedback);
      setScore(data.score);
      setShowFeedback(true);
      setAnswer('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    setFetchingNext(true);
    setShowFeedback(false);
    setFeedback(null);
    setScore(null);
    setAnswer('');
    
    await fetchCurrentQuestion();
  };

  const speakQuestion = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const progress = totalQuestions > 0 ? ((questionNumber - 1) / totalQuestions) * 100 : 0;
  
  // Tailwind v4 utility for dynamic score colors
  const getScoreTheme = (s) => {
    if (s >= 8) return { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' };
    if (s >= 6) return { text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' };
    return { text: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/5' };
  };

  if (loading) return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <Loader2 size={32} className="text-brand-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 glass-dark border-b border-white/5 sticky top-0 z-10">
        <Link to="/interview" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400 font-mono font-medium">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="w-32 h-1.5 bg-surface-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <button
          onClick={() => setShowAI(true)}
          className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors"
        >
          <Bot size={18} /> AI Help
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Question Card */}
          <div className={`card border transition-all duration-300 ${fetchingNext ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100 border-brand-500/10'}`}>
            <div className="flex items-start justify-between gap-3 mb-5">
              <span className="px-3 py-1 rounded-lg bg-brand-600/20 border border-brand-500/20 text-brand-400 text-xs font-mono font-semibold tracking-wide shadow-sm">
                Q{questionNumber}
              </span>
              <button onClick={speakQuestion} className="p-1.5 text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-md transition-all" title="Read aloud">
                <Volume2 size={18} />
              </button>
            </div>

            <p className="text-slate-50 text-lg leading-relaxed font-medium">
              {currentQuestion}
            </p>
          </div>

          {/* Feedback Card */}
          {showFeedback && feedback && score != null && (
            <div className={`card border ${getScoreTheme(score).border} ${getScoreTheme(score).bg} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-semibold text-white flex items-center gap-2">
                  <Bot size={18} className={getScoreTheme(score).text} /> AI Evaluation
                </span>
                <span className={`text-3xl font-display font-bold tracking-tight ${getScoreTheme(score).text}`}>
                  {score}<span className="text-lg text-slate-500">/10</span>
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{feedback}</p>
            </div>
          )}

          {/* Input Area */}
          {!showFeedback && (
            <div className={`card space-y-4 ${fetchingNext ? 'hidden' : 'block'}`}>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Your Answer</label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono">{answer.length} chars</span>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isRecording
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                        : 'glass hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <div className="flex items-center gap-0.5 h-4">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-0.5 h-full bg-rose-400 rounded-full wave-bar" />
                          ))}
                        </div>
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic size={14} /> Voice
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here, or use voice input..."
                rows={6}
                className="input-field resize-none leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.ctrlKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-surface-800 border border-white/10 rounded font-mono text-[10px]">Enter</kbd> to submit
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || submitting}
                  className="btn-primary"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {submitting ? 'Evaluating...' : 'Submit Answer'}
                </button>
              </div>
            </div>
          )}

          {/* Next Question Button */}
          {showFeedback && (
            <button 
              onClick={handleNext} 
              disabled={fetchingNext}
              className="btn-primary w-full justify-center py-3.5 text-base shadow-brand-500/20"
            >
              {fetchingNext ? (
                <><Loader2 size={18} className="animate-spin" /> Loading next...</>
              ) : (
                <>Next Question <ChevronRight size={18} /></>
              )}
            </button>
          )}
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAI && (
        <AIAssistant
          onClose={() => setShowAI(false)}
          context={`Current interview question: "${currentQuestion}". User's answer so far: "${answer}"`}
        />
      )}
    </div>
  );
}