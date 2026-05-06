import { Link } from 'react-router-dom';
import { FileText, Mic2, Brain, ArrowRight, Sparkles, Target, TrendingUp } from 'lucide-react';

const features = [
  { 
    icon: FileText, 
    title: 'ATS Resume Analysis', 
    desc: 'Analyze your resume with ATS scoring, keyword insights, and improvement suggestions.', 
    color: 'text-brand-400' 
  },
  { 
    icon: Mic2, 
    title: 'Mock Interview Coach', 
    desc: 'Practice with AI-generated questions tailored to your resume, role, and difficulty level.', 
    color: 'text-accent-teal' 
  },
  { 
    icon: Brain, 
    title: 'Smart Feedback', 
    desc: 'Receive detailed, actionable feedback on every answer to improve your interview skills.', 
    color: 'text-accent-amber' 
  },
  { 
    icon: Target, 
    title: 'Keyword Gap Analysis', 
    desc: 'Compare your resume against job descriptions and find missing keywords.', 
    color: 'text-accent-rose' 
  },
  { 
    icon: TrendingUp, 
    title: 'Progress Tracking', 
    desc: 'Monitor your improvement over time with detailed analytics and score history.', 
    color: 'text-accent-emerald' 
  },
  { 
    icon: Sparkles, 
    title: 'AI Career Assistant (Coming Soon)', 
    desc: 'Your personal AI coach for guidance and answer improvements. Currently in development.', 
    color: 'text-purple-400' 
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 overflow-hidden">
      
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-10 flex items-center justify-between px-6 py-4 glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-brand-500 to-accent-teal flex items-center justify-center">
            <span className="text-white font-display font-bold">R</span>
          </div>
          <span className="font-display font-semibold text-white">ResumeAI Coach</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/register" className="btn-primary text-sm py-2 px-4">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full bg-brand-600/5 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-sm text-brand-400 border border-brand-500/20 mb-6">
            <Sparkles size={14} />
            <span>AI Resume Analyzer & Interview Coach</span>
          </div>

          {/* Heading */}
          <h1 className="font-display font-bold text-5xl md:text-7xl text-white mb-6 leading-tight">
            Analyze Your Resume.<br />
            <span className="text-brand-400">
              Practice Mock Interviews.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Get ATS score, identify missing keywords, practice real interview questions, and receive AI-powered feedback to improve your performance.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base py-3 px-8 justify-center">
              Start for Free <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white text-center mb-4">
            Everything You Need to Improve
          </h2>

          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            A complete AI-powered platform to analyze resumes and prepare for interviews
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card hover:bg-white/5 transition-all duration-300 group">
                <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-display font-semibold text-white mb-2">
                  {title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center card">
          
          <h2 className="font-display font-bold text-3xl text-white mb-4">
            Ready to Improve Your Resume & Interviews?
          </h2>

          <p className="text-slate-400 mb-8">
            Start analyzing your resume and practicing interviews with AI today.
          </p>

          <Link to="/register" className="btn-primary text-base py-3 px-8 justify-center inline-flex">
            Get Started Free <ArrowRight size={18} />
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 text-center text-slate-500 text-sm">
        © 2025 ResumeAI Coach. AI-powered career preparation platform.
      </footer>

    </div>
  );
}