import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, FileText, Mic2, History, LogOut, Menu, X,
  Bot, ChevronRight, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import AIAssistant from './AIAssistant.jsx';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/resume', label: 'Resume', icon: FileText },
  { path: '/interview', label: 'Interview', icon: Mic2 },
  { path: '/interview/history', label: 'History', icon: History },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-30 h-full w-64 flex flex-col glass-dark border-r border-white/5 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-500 to-accent-teal flex items-center justify-center">
              <span className="text-white font-display font-bold text-base">R</span>
            </div>
            <span className="font-display font-semibold text-white text-lg">ResumeAI</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={active ? 'text-brand-400' : ''} />
                <span className="font-body font-medium text-sm">{label}</span>
                {active && <ChevronRight size={14} className="ml-auto text-brand-400" />}
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant btn */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => setShowAI(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-linear-to-r from-brand-600/20 to-accent-teal/10 border border-brand-500/20 text-brand-400 hover:bg-brand-600/30 transition-all duration-200"
          >
            <Bot size={18} />
            <span className="font-body font-medium text-sm">AI Assistant</span>
          </button>
        </div>

        {/* User */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={14} className="text-brand-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 glass-dark border-b border-white/5">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={22} />
          </button>
          <span className="font-display font-semibold text-white">ResumeAI</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>

      {/* AI Assistant modal */}
      {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
    </div>
  );
}
