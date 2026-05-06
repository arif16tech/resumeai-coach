import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import { FileText, Code2, Users, Loader2, ChevronRight } from 'lucide-react';

const modes = [
  { id: 'resume', label: 'Resume Based', icon: FileText, desc: 'Questions generated from your resume projects and skills', color: 'brand' },
  { id: 'technical', label: 'Technical', icon: Code2, desc: 'DSA, system design, and coding interview questions', color: 'teal' },
  { id: 'hr', label: 'HR / Behavioral', icon: Users, desc: 'Situational, behavioral, and culture-fit questions', color: 'amber' },
];

const difficulties = [
  { id: 'easy', label: 'Easy', desc: 'Foundational questions', color: 'text-accent-emerald' },
  { id: 'medium', label: 'Medium', desc: 'Scenario-based', color: 'text-accent-amber' },
  { id: 'hard', label: 'Hard', desc: 'Deep & challenging', color: 'text-accent-rose' },
];

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('technical');
  const [difficulty, setDifficulty] = useState('medium');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [role, setRole] = useState('');
  const [resumeId, setResumeId] = useState(location.state?.resumeId || '');
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/resume').then(({ data }) => setResumes(data.resumes)).catch(console.error);
  }, []);

  const handleStart = async () => {
    if (mode === 'resume' && !resumeId) return toast.error('Please select a resume');
    setLoading(true);
    try {
      const { data } = await api.post('/interview/start', {
        mode, difficulty, totalQuestions, role, resumeId,
      });
      navigate(`/interview/${data.interview._id}/session`, {
        state: { interview: data.interview },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const colorMap = {
    brand: { selected: 'border-brand-500 bg-brand-600/20', icon: 'bg-brand-600/20 text-brand-400' },
    teal: { selected: 'border-accent-teal bg-accent-teal/10', icon: 'bg-accent-teal/10 text-accent-teal' },
    amber: { selected: 'border-accent-amber bg-accent-amber/10', icon: 'bg-amber-500/10 text-accent-amber' },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white mb-1">Start Interview</h1>
        <p className="text-slate-400">Configure your mock interview session</p>
      </div>

      {/* Mode selection */}
      <div className="card space-y-4">
        <h2 className="font-display font-semibold text-white">Interview Type</h2>
        <div className="grid gap-3">
          {modes.map(({ id, label, icon: Icon, desc, color }) => {
            const colors = colorMap[color];
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                  mode === id ? colors.selected : 'border-white/5 bg-white/2 hover:bg-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.icon}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-medium text-white">{label}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{desc}</p>
                </div>
                {mode === id && <ChevronRight size={16} className="ml-auto text-slate-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resume selector */}
      {mode === 'resume' && (
        <div className="card space-y-3">
          <h2 className="font-display font-semibold text-white">Select Resume</h2>
          {resumes.length === 0 ? (
            <p className="text-slate-400 text-sm">No resumes found. <Link to="/resume" className="text-brand-400">Upload one first</Link></p>
          ) : (
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="input-field"
            >
              <option value="">Select a resume...</option>
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>{r.fileName}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Role */}
      {mode !== 'resume' && (
        <div className="card space-y-3">
          <h2 className="font-display font-semibold text-white">Role / Domain <span className="text-slate-500 font-body font-normal text-sm">(optional)</span></h2>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Frontend Engineer, Product Manager, Data Scientist..."
            className="input-field"
          />
        </div>
      )}

      {/* Settings */}
      <div className="card space-y-6">
        <div>
          <h2 className="font-display font-semibold text-white mb-3">Difficulty</h2>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map(({ id, label, desc, color }) => (
              <button
                key={id}
                onClick={() => setDifficulty(id)}
                className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                  difficulty === id ? 'border-white/20 bg-white/8' : 'border-white/5 bg-white/2 hover:bg-white/5'
                }`}
              >
                <p className={`font-display font-semibold ${difficulty === id ? color : 'text-slate-400'}`}>{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-display font-semibold text-white">Questions</h2>
            <span className="font-mono font-bold text-brand-400 text-lg">{totalQuestions}</span>
          </div>
          <input
            type="range"
            min={3}
            max={15}
            value={totalQuestions}
            onChange={(e) => setTotalQuestions(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>3</span><span>15</span>
          </div>
        </div>
      </div>

      <button onClick={handleStart} disabled={loading} className="btn-primary w-full justify-center py-4 text-base">
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Generating Questions...
          </>
        ) : (
          <>
            Start Interview <ChevronRight size={20} />
          </>
        )}
      </button>
    </div>
  );
}
