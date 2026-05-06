import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

// Pages
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import ResumePage from './pages/resume/ResumePage.jsx';
import ResumeDetailPage from './pages/resume/ResumeDetailPage.jsx';
import InterviewSetupPage from './pages/interview/InterviewSetupPage.jsx';
import InterviewSessionPage from './pages/interview/InterviewSessionPage.jsx';
import InterviewResultPage from './pages/interview/InterviewResultPage.jsx';
import InterviewHistoryPage from './pages/interview/InterviewHistoryPage.jsx';
import LandingPage from './pages/LandingPage.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route
      path="/dashboard"
      element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>}
    />
    <Route
      path="/resume"
      element={<ProtectedRoute><Layout><ResumePage /></Layout></ProtectedRoute>}
    />
    <Route
      path="/resume/:id"
      element={<ProtectedRoute><Layout><ResumeDetailPage /></Layout></ProtectedRoute>}
    />
    <Route
      path="/interview"
      element={<ProtectedRoute><Layout><InterviewSetupPage /></Layout></ProtectedRoute>}
    />
    <Route
      path="/interview/:id/session"
      element={<ProtectedRoute><InterviewSessionPage /></ProtectedRoute>}
    />
    <Route
      path="/interview/:id/result"
      element={<ProtectedRoute><Layout><InterviewResultPage /></Layout></ProtectedRoute>}
    />
    <Route
      path="/interview/history"
      element={<ProtectedRoute><Layout><InterviewHistoryPage /></Layout></ProtectedRoute>}
    />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontFamily: 'Satoshi, sans-serif',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#1e293b' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
