import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import ScoreRing from '../../components/ScoreRing.jsx';
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Lightbulb,
  Tag, Loader2, RefreshCw, ExternalLink, Mic2
} from 'lucide-react';

export default function ResumeDetailPage() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [jobDesc, setJobDesc] = useState('');

  useEffect(() => {
    api.get(`/resume/${id}`)
      .then(({ data }) => { setResume(data.resume); setJobDesc(data.resume.jobDescription || ''); })
      .catch(() => toast.error('Failed to load resume'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const { data } = await api.post(`/resume/${id}/reanalyze`, { jobDescription: jobDesc });
      setResume(data.resume);
      toast.success('Resume reanalyzed!');
    } catch { toast.error('Reanalysis failed'); }
    finally { setReanalyzing(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="text-brand-400 animate-spin" />
    </div>
  );

  if (!resume) return <div className="text-slate-400 text-center py-20">Resume not found</div>;

  const a = resume.analysis || {};
  const scoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#f43f5e';
  const sections = a.sections || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">

        {/* Left Section: Back Button & Title */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <Link
            to="/resume"
            className="text-slate-400 hover:text-white transition-colors mt-1 sm:mt-0 shrink-0"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1
              className="font-display font-bold text-xl sm:text-2xl text-white truncate"
              title={resume.fileName}
            >
              {resume.fileName}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              {new Date(resume.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-700/50 sm:border-t-0">
          <a
            href={resume.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm py-2 flex-1 sm:flex-none justify-center"
          >
            <ExternalLink size={14} className="shrink-0" />
            <span className="truncate">View PDF</span>
          </a>
          <Link
            to="/interview"
            state={{ resumeId: resume._id }}
            className="btn-primary text-sm py-2 flex-1 sm:flex-none justify-center"
          >
            <Mic2 size={14} className="shrink-0" />
            <span className="truncate">Practice Interview</span>
          </Link>
        </div>

      </div>

      {/* Score overview */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex gap-8">
            <ScoreRing score={a.atsScore || 0} label="ATS Score" />
            <ScoreRing score={a.overallScore || 0} label="Content Quality" size={100} strokeWidth={7} />
          </div>
          <div className="flex-1 space-y-4">
            {/* Section scores */}
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">Section Breakdown</h3>
            {Object.entries(sections).map(([key, val]) => val && (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 capitalize">{key}</span>
                  <span className="font-mono font-bold" style={{ color: scoreColor(val.score || 0) }}>{val.score || 0}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${val.score || 0}%`, backgroundColor: scoreColor(val.score || 0) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="card">
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-accent-emerald" /> Strengths
          </h2>
          <ul className="space-y-2">
            {(a.strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-accent-emerald mt-0.5 shrink-0">✓</span> {s}
              </li>
            ))}
            {!a.strengths?.length && <li className="text-slate-500 text-sm">No data</li>}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="card">
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <XCircle size={18} className="text-accent-rose" /> Weaknesses
          </h2>
          <ul className="space-y-2">
            {(a.weaknesses || []).map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-accent-rose mt-0.5 shrink-0">✗</span> {w}
              </li>
            ))}
            {!a.weaknesses?.length && <li className="text-slate-500 text-sm">No data</li>}
          </ul>
        </div>

        {/* Suggestions */}
        <div className="card">
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-accent-amber" /> Suggestions
          </h2>
          <ul className="space-y-2">
            {(a.suggestions || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-accent-amber mt-0.5 shrink-0">→</span> {s}
              </li>
            ))}
            {!a.suggestions?.length && <li className="text-slate-500 text-sm">No suggestions</li>}
          </ul>
        </div>

        {/* Keywords */}
        <div className="card">
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Tag size={18} className="text-brand-400" /> Keyword Analysis
          </h2>
          {a.matchedKeywords?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-accent-emerald uppercase tracking-wider mb-2">Matched</p>
              <div className="flex flex-wrap gap-2">
                {a.matchedKeywords.map((k, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-accent-emerald text-xs">{k}</span>
                ))}
              </div>
            </div>
          )}
          {a.keywordGaps?.length > 0 && (
            <div>
              <p className="text-xs text-accent-rose uppercase tracking-wider mb-2">Missing</p>
              <div className="flex flex-wrap gap-2">
                {a.keywordGaps.map((k, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-accent-rose text-xs">{k}</span>
                ))}
              </div>
            </div>
          )}
          {!a.keywordGaps?.length && !a.matchedKeywords?.length && (
            <p className="text-slate-500 text-sm">Add a job description to see keyword analysis</p>
          )}
        </div>
      </div>

      {/* Section feedback */}
      {Object.entries(sections).some(([, v]) => v?.feedback) && (
        <div className="card">
          <h2 className="font-display font-semibold text-white mb-4">Section Feedback</h2>
          <div className="space-y-4">
            {Object.entries(sections).map(([key, val]) => val?.feedback && (
              <div key={key} className="p-4 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-200 capitalize">{key}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-white/5" style={{ color: scoreColor(val.score) }}>{val.score}%</span>
                </div>
                <p className="text-sm text-slate-400">{val.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Re-analyze */}
      <div className="card">
        <h2 className="font-display font-semibold text-white mb-3">Re-analyze with Job Description</h2>
        <textarea
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          placeholder="Paste a job description for targeted keyword gap analysis..."
          rows={4}
          className="input-field resize-none mb-3"
        />
        <button onClick={handleReanalyze} disabled={reanalyzing} className="btn-primary">
          {reanalyzing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Re-analyze
        </button>
      </div>
    </div>
  );
}
