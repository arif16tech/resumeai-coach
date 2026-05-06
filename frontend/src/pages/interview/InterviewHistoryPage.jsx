import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import {
  Mic2, Clock, CheckCircle2, AlertCircle, Loader2, ChevronRight, Plus
} from 'lucide-react';

export default function InterviewHistoryPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/interview')
      .then(({ data }) => setInterviews(data.interviews))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const modeColor = {
    resume: 'text-brand-400 bg-brand-600/20 border-brand-500/20',
    technical: 'text-accent-teal bg-accent-teal/10 border-accent-teal/20',
    hr: 'text-accent-amber bg-amber-500/10 border-amber-500/20',
  };

  const scoreColor = (s) =>
    s >= 80 ? 'text-accent-emerald' : s >= 60 ? 'text-accent-amber' : 'text-accent-rose';

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header: Stacks on mobile, inline on sm+ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">Interview History</h1>
          <p className="text-sm sm:text-base text-slate-400">Track your progress over time</p>
        </div>
        <Link to="/interview" className="btn-primary w-full sm:w-auto justify-center">
          <Plus size={16} /> New Interview
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-24 shimmer-bg" />
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div className="card text-center py-12 sm:py-16">
          <Mic2 size={40} className="sm:w-12 sm:h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-medium text-base sm:text-lg mb-2">No interviews yet</p>
          <p className="text-slate-500 text-xs sm:text-sm mb-6">Start your first mock interview to track progress</p>
          <Link to="/interview" className="btn-primary inline-flex">
            <Plus size={16} /> Start Interview
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <Link
              key={interview._id}
              to={interview.status === 'completed'
                ? `/interview/${interview._id}/result`
                : `/interview/${interview._id}/session`}
              className="card hover:bg-white/8 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group p-4 sm:p-5"
            >
              
              {/* Top/Left Section: Icon and Details */}
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border ${modeColor[interview.mode]}`}>
                  <Mic2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Added flex-wrap so long roles or difficulty tags drop down instead of overflowing */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-1">
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-md border capitalize ${modeColor[interview.mode]}`}>
                      {interview.mode}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{interview.difficulty}</span>
                    {interview.role && (
                      <span className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-xs">
                        · {interview.role}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(interview.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                    <span className="hidden sm:inline text-slate-600">•</span>
                    <span>{interview.totalQuestions} questions</span>
                  </div>
                </div>
              </div>

              {/* Bottom/Right Section: Status and Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t border-slate-700/50 sm:border-t-0 pt-3 sm:pt-0">
                <div className="flex items-center gap-2">
                  {interview.status === 'completed' ? (
                    <>
                      <CheckCircle2 size={16} className="text-accent-emerald hidden sm:block" />
                      {interview.finalScore != null && (
                        <span className={`font-display font-bold text-base sm:text-lg ${scoreColor(interview.finalScore)}`}>
                          {interview.finalScore}%
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] sm:text-xs text-accent-amber border border-amber-500/20 bg-amber-500/10 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg">
                      <AlertCircle size={12} /> In Progress
                    </span>
                  )}
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>

            </Link>
          ))}
        </div>
      )}
    </div>
  );
}