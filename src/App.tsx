import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, cloneElement } from 'react';
import Login from './component/Login';
import LoginPrompt from './component/LoginPrompt';
import Home from './component/Home';
import Profile from './component/Profile';
import AdminHome from './component/AdminHome';
import ResumeBuilder from './component/ResumeBuilder';
import DynamicResumeBuilder from './component/DynamicResumeBuilder';
import DynamicResumeEditor from './component/dynamicResume/DynamicResumeEditor';
import TwoSideResume from './component/dynamicResume/TwoSideResume';
import ResumePreview from './component/ResumePreview';
import ResumeView from './component/ResumeView';
import EmailVerification from './component/EmailVerification';
import EmailConfirmation from './component/EmailConfirmation';
import SetPassword from './component/SetPassword';
import GooglePasswordSetup from './component/GooglePasswordSetup';
import ForgotPassword from './component/ForgotPassword';
import About from './component/About';
import Privacy from './component/Privacy';
import Terms from './component/Terms';
import Contact from './component/Contact';
import JobSearch from './component/JobSearch';
import { initSessionTimeout, AuthProvider, useAuth } from './service/authService';
import './App.css';

// Protected Route wrapper using Auth context
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();
  // While checking auth status, don't redirect — avoid flicker.
  if (isLoading) return null;
  
  if (!isAuthenticated) {
    return (
      <>
        {cloneElement(children, { isPreviewMode: true } as any)}
        <LoginPrompt />
      </>
    );
  }
  
  return children;
};

// Auth Route wrapper (redirects to / if already logged in)
const AuthRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  useEffect(() => {
    // Initialize session timeout monitoring
    initSessionTimeout();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/login/token" element={<EmailConfirmation />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/google-set-password" element={<GooglePasswordSetup />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin-home" element={<ProtectedRoute><AdminHome /></ProtectedRoute>} />
        <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/dynamic-resume-builder" element={<ProtectedRoute><DynamicResumeBuilder /></ProtectedRoute>} />
        <Route path="/dynamic-resume-editor" element={<ProtectedRoute><DynamicResumeEditor /></ProtectedRoute>} />
        <Route path="/two-side-resume" element={<ProtectedRoute><TwoSideResume /></ProtectedRoute>} />
        <Route path="/preview" element={<ProtectedRoute><ResumePreview /></ProtectedRoute>} />
        <Route path="/resume-view/:resumeId" element={<ProtectedRoute><ResumeView /></ProtectedRoute>} />
        <Route path="/job-search" element={<ProtectedRoute><JobSearch /></ProtectedRoute>} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
