import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import {
  Upload, FileText, Trash2, Eye, Loader2, Plus, RefreshCw, ExternalLink
} from 'lucide-react';

export default function ResumePage() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [jobDesc, setJobDesc] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    try {
      const { data } = await api.get('/resume');
      setResumes(data.resumes);
    } catch { toast.error('Failed to load resumes'); }
    finally { setLoading(false); }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Only PDF files are allowed');
    if (file.size > 10 * 1024 * 1024) return toast.error('File too large (max 10MB)');

    setUploading(true);
    const form = new FormData();
    form.append('resume', file);
    if (jobDesc) form.append('jobDescription', jobDesc);

    try {
      const { data } = await api.post('/resume/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resume analyzed successfully!');
      setJobDesc('');
      navigate(`/resume/${data.resume._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this resume?')) return;
    try {
      await api.delete(`/resume/${id}`);
      setResumes(resumes.filter(r => r._id !== id));
      toast.success('Resume deleted');
    } catch { toast.error('Delete failed'); }
  };

  const scoreColor = (s) => s >= 80 ? 'text-accent-emerald' : s >= 60 ? 'text-accent-amber' : 'text-accent-rose';
  const scoreBg = (s) => s >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : s >= 60 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white mb-1">Resume Analyzer</h1>
        <p className="text-slate-400">Upload your resume to get an ATS score and detailed feedback</p>
      </div>

      {/* Upload zone */}
      <div className="card space-y-4">
        <h2 className="font-display font-semibold text-white">Upload Resume</h2>

        <div
          onClick={() => !uploading && fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleUpload(file);
          }}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${dragOver ? 'border-brand-500 bg-brand-500/5' : 'border-white/10 hover:border-brand-500/40 hover:bg-white/2'
            } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files[0])}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="text-brand-400 animate-spin" />
              <p className="text-slate-300 font-medium">Analyzing your resume with AI...</p>
              <p className="text-slate-500 text-sm">This may take 15-30 seconds</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center">
                <Upload size={24} className="text-brand-400" />
              </div>
              <div>
                <p className="text-slate-200 font-medium">Drop your PDF here or click to browse</p>
                <p className="text-slate-500 text-sm mt-1">PDF only, max 10MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Optional JD */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Job Description <span className="text-slate-500">(optional — for keyword gap analysis)</span>
          </label>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the job description here for keyword matching..."
            rows={3}
            className="input-field resize-none"
          />
        </div>
      </div>

      {/* Resume list */}
      <div>
        <h2 className="font-display font-semibold text-white mb-4">
          Your Resumes <span className="text-slate-500 font-body font-normal text-base">({resumes.length})</span>
        </h2>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(2)].map((_, i) => <div key={i} className="card h-24 shimmer-bg" />)}
          </div>
        ) : resumes.length === 0 ? (
          <div className="card text-center py-12">
            <FileText size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No resumes uploaded yet</p>
            <p className="text-slate-500 text-sm mt-1">Upload your first resume above to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resumes.map((r) => (
              <Link
                key={r._id}
                to={`/resume/${r._id}`}
                className="card hover:bg-white/8 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group p-4 sm:p-5"
              >
                {/* Top/Left Section: Icon and File Info grouped in a row */}
                <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center shrink-0">
                    <FileText className="text-brand-400 w-5 h-5 sm:w-22px sm:h-22px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate text-sm sm:text-base">{r.fileName}</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Bottom/Right Section: Score and Actions grouped together */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t border-slate-700/50 sm:border-t-0 pt-3 sm:pt-0">
                  {r.analysis?.atsScore != null && (
                    <div className={`w-fit px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border text-xs sm:text-sm font-mono font-bold ${scoreBg(r.analysis.atsScore)} ${scoreColor(r.analysis.atsScore)}`}>
                      ATS: {r.analysis.atsScore}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="btn-secondary py-1.5 px-3 text-xs sm:text-sm opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                      <Eye size={14} /> <span className="hidden sm:inline">View</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Prevent Link navigation when deleting
                        handleDelete(r._id, e);
                      }}
                      className="p-1.5 sm:p-2 text-slate-500 hover:text-accent-rose transition-colors rounded-lg hover:bg-rose-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
