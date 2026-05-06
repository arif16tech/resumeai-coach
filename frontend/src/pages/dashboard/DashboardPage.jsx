import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.js';
import {
  FileText, Mic2, TrendingUp, Target, ArrowRight, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const StatCard = ({ icon: Icon, label, value, color = 'text-brand-400', sub }) => (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="font-display font-bold text-3xl text-white mb-1">{value ?? '-'}</p>
      <p className="text-slate-400 text-sm">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );

  const radarData = stats?.stats?.topWeakAreas?.map(area => ({
    subject: area.length > 12 ? area.substring(0, 12) + '…' : area,
    A: Math.floor(Math.random() * 50) + 30,
  })) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-white mb-1">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400">Here's your career preparation overview</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/resume" className="card hover:bg-white/8 transition-all duration-200 group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center group-hover:bg-brand-600/30 transition-colors">
            <FileText size={22} className="text-brand-400" />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-white">Analyze Resume</p>
            <p className="text-sm text-slate-400">Upload and get ATS score</p>
          </div>
          <ArrowRight size={18} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
        </Link>

        <Link to="/interview" className="card hover:bg-white/8 transition-all duration-200 group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center group-hover:bg-accent-teal/20 transition-colors">
            <Mic2 size={22} className="text-accent-teal" />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-white">Start Interview</p>
            <p className="text-sm text-slate-400">Practice mock interviews</p>
          </div>
          <ArrowRight size={18} className="text-slate-500 group-hover:text-accent-teal transition-colors" />
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-32 shimmer-bg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Resumes Uploaded" value={stats?.stats?.totalResumes} color="text-brand-400" />
          <StatCard icon={Mic2} label="Total Interviews" value={stats?.stats?.totalInterviews} color="text-accent-teal" />
          <StatCard icon={CheckCircle2} label="Completed" value={stats?.stats?.completedInterviews} color="text-accent-emerald" />
          <StatCard icon={TrendingUp} label="Avg Score" value={stats?.stats?.avgInterviewScore ? `${stats.stats.avgInterviewScore}%` : 'N/A'} color="text-accent-amber" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Resumes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">Recent Resumes</h2>
            <Link to="/resume" className="text-xs text-brand-400 hover:text-brand-300">View all</Link>
          </div>
          {stats?.recentResumes?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentResumes.map((r) => (
                <Link key={r._id} to={`/resume/${r._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-brand-600/20 flex items-center justify-center">
                    <FileText size={16} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{r.fileName}</p>
                    <p className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  {r.analysis?.atsScore != null && (
                    <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                      r.analysis.atsScore >= 80 ? 'text-accent-emerald bg-emerald-500/10' :
                      r.analysis.atsScore >= 60 ? 'text-accent-amber bg-amber-500/10' : 'text-accent-rose bg-rose-500/10'
                    }`}>
                      {r.analysis.atsScore}%
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No resumes yet</p>
              <Link to="/resume" className="text-brand-400 text-sm hover:text-brand-300 mt-1 inline-block">Upload your first resume</Link>
            </div>
          )}
        </div>

        {/* Recent Interviews */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">Recent Interviews</h2>
            <Link to="/interview/history" className="text-xs text-brand-400 hover:text-brand-300">View all</Link>
          </div>
          {stats?.recentInterviews?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentInterviews.map((i) => (
                <Link key={i._id} to={`/interview/${i._id}/result`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-accent-teal/10 flex items-center justify-center">
                    <Mic2 size={16} className="text-accent-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 capitalize">{i.mode} Interview</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={11} /> {new Date(i.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {i.status === 'completed' ? (
                      <>
                        <CheckCircle2 size={14} className="text-accent-emerald" />
                        {i.finalScore != null && (
                          <span className="text-xs font-mono font-bold text-accent-emerald">{i.finalScore}%</span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-accent-amber flex items-center gap-1">
                        <AlertCircle size={12} /> Active
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mic2 size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No interviews yet</p>
              <Link to="/interview" className="text-brand-400 text-sm hover:text-brand-300 mt-1 inline-block">Start your first interview</Link>
            </div>
          )}
        </div>
      </div>

      {/* Weak areas */}
      {stats?.stats?.topWeakAreas?.length > 0 && (
        <div className="card">
          <h2 className="font-display font-semibold text-white mb-4">Areas to Improve</h2>
          <div className="flex flex-wrap gap-2">
            {stats.stats.topWeakAreas.map((area) => (
              <span key={area} className="px-3 py-1.5 rounded-lg bg-accent-rose/10 border border-rose-500/20 text-rose-400 text-sm">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
