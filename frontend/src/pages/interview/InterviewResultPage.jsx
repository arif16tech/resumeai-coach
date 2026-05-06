import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import ScoreRing from '../../components/ScoreRing.jsx';
import {
  ArrowLeft, CheckCircle2, XCircle, Mic2, RotateCcw,
  TrendingUp, TrendingDown, Loader2, MessageSquare
} from 'lucide-react';

export default function InterviewResultPage() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/interview/${id}`)
      .then(({ data }) => setInterview(data.interview))
      .catch(() => toast.error('Failed to load result'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="text-brand-400 animate-spin" />
    </div>
  );

  if (!interview) return <div className="text-slate-400 text-center py-20">Interview not found</div>;

  const scoreColor = (s) => s >= 8 ? 'text-accent-emerald' : s >= 6 ? 'text-accent-amber' : 'text-accent-rose';
  const scoreBg = (s) => s >= 8 ? 'bg-emerald-500/10 border-emerald-500/20' : s >= 6 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/interview/history" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl text-white capitalize">
            {interview.mode} Interview — Results
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date(interview.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            {interview.role && ` · ${interview.role}`}
          </p>
        </div>
      </div>

      {interview.status !== 'completed' ? (
        <div className="card text-center py-12">
          <Mic2 size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">Interview not completed yet</p>
          <Link to={`/interview/${id}/session`} className="btn-primary mt-4 inline-flex">
            Continue Interview
          </Link>
        </div>
      ) : (
        <>
          {/* Score overview */}
          <div className="card flex flex-col sm:flex-row items-center gap-8">
            <ScoreRing score={interview.finalScore || 0} size={140} strokeWidth={10} label="Final Score" />
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Performance Summary</p>
                <p className="text-slate-300 text-sm leading-relaxed">{interview.summary || 'No summary available.'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-medium border capitalize ${
                  interview.difficulty === 'hard' ? 'text-accent-rose border-rose-500/20 bg-rose-500/10' :
                  interview.difficulty === 'medium' ? 'text-accent-amber border-amber-500/20 bg-amber-500/10' :
                  'text-accent-emerald border-emerald-500/20 bg-emerald-500/10'
                }`}>
                  {interview.difficulty} difficulty
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-medium border border-white/10 bg-white/5 text-slate-300">
                  {interview.totalQuestions} questions
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strong areas */}
            <div className="card">
              <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-accent-emerald" /> Strong Areas
              </h2>
              {interview.strongAreas?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interview.strongAreas.map((area, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-accent-emerald text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              ) : <p className="text-slate-500 text-sm">No data</p>}
            </div>

            {/* Weak areas */}
            <div className="card">
              <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingDown size={18} className="text-accent-rose" /> Areas to Improve
              </h2>
              {interview.weakAreas?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interview.weakAreas.map((area, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-accent-rose text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              ) : <p className="text-slate-500 text-sm">No data</p>}
            </div>
          </div>

          {/* Question breakdown */}
          {interview.questions?.length > 0 && (
            <div className="card">
              <h2 className="font-display font-semibold text-white mb-6">Question Breakdown</h2>
              <div className="space-y-6">
                {interview.questions.map((q, i) => (
                  <div key={i} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-1 rounded-lg bg-brand-600/20 text-brand-400">Q{i + 1}</span>
                        <p className="text-slate-200 font-medium text-sm">{q.question}</p>
                      </div>
                      {q.score != null && (
                        <span className={`text-sm font-display font-bold px-2.5 py-1 rounded-lg border shrink-0 ${scoreBg(q.score)} ${scoreColor(q.score)}`}>
                          {q.score}/10
                        </span>
                      )}
                    </div>

                    {q.userAnswer && (
                      <div className="ml-4 mb-3">
                        <p className="text-xs text-slate-500 mb-1">Your Answer</p>
                        <p className="text-sm text-slate-400 leading-relaxed bg-white/3 rounded-lg p-3">{q.userAnswer}</p>
                      </div>
                    )}

                    {q.aiFeedback && (
                      <div className="ml-4 p-3 rounded-lg bg-brand-600/10 border border-brand-500/10">
                        <p className="text-xs text-brand-400 mb-1 flex items-center gap-1">
                          <MessageSquare size={11} /> AI Feedback
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed">{q.aiFeedback}</p>
                      </div>
                    )}
                    
                    {q.suggestedAnswer && (
                      <div className="ml-4 mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/10">
                        <p className="text-xs text-emerald-400 mb-1 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Suggested Answer
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed">{q.suggestedAnswer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <Link to="/interview" className="btn-primary">
              <RotateCcw size={16} /> New Interview
            </Link>
            <Link to="/interview/history" className="btn-secondary">
              View All Results
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
