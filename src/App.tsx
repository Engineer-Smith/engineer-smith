import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AppNavbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ✅ CORRECTED: Import the proper components
import QuestionBankPage from './pages/QuestionBankPage';
import SkillQuestionsPage from './pages/SkillQuestionsPage';
import EditQuestionPage from './pages/EditQuestionPage';
import ViewQuestionPage from './pages/ViewQuestionPage';
import QuestionFormComponent from './components/QuestionFormComponent';
import TestManagementPage from './pages/TestManagementPage';
import CreateTestPage from './pages/CreateTestPage';

// Placeholder components for missing pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8 text-center">
          <div className="card shadow-sm border-0">
            <div className="card-body py-5">
              <i className="fas fa-hammer text-primary mb-4" style={{ fontSize: '4rem' }}></i>
              <h2 className="h3 mb-3">{title}</h2>
              <p className="text-muted mb-4">This page is under construction and will be available soon.</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.history.back()}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin Route component - only allows admin and instructor roles
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin' && user?.role !== 'instructor') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// SSO Callback component
const SSOCallback = () => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success === 'true') {
      // SSO successful, navigate to dashboard without page reload
      navigate('/dashboard', { replace: true });
    } else if (error) {
      // SSO failed, navigate to login with error parameter
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
    } else {
      // No success or error parameter, redirect to login
      navigate('/login', { replace: true });
    }
  }, [navigate]);
  
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Processing...</span>
        </div>
        <p className="text-muted">Processing SSO authentication...</p>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/auth/callback" element={<SSOCallback />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Dashboard - Main admin landing page */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        
        {/* Admin Management Routes */}
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <PlaceholderPage title="User Management" />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users/new" 
          element={
            <AdminRoute>
              <PlaceholderPage title="Add New User" />
            </AdminRoute>
          } 
        />
        
        {/* ✅ CORRECTED: Question Bank Routes */}
        <Route 
          path="/admin/question-bank" 
          element={
            <AdminRoute>
              <QuestionBankPage />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/question-bank/add" 
          element={
            <AdminRoute>
              <QuestionFormComponent />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/question-bank/edit/:questionId" 
          element={
            <AdminRoute>
              <EditQuestionPage />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/question-bank/view/:questionId" 
          element={
            <AdminRoute>
              <ViewQuestionPage />
            </AdminRoute>
          } 
        />
        {/* ✅ IMPORTANT: This must come AFTER the specific routes above */}
        <Route 
          path="/admin/question-bank/:skillName" 
          element={
            <AdminRoute>
              <SkillQuestionsPage />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/question-bank/import" 
          element={
            <AdminRoute>
              <PlaceholderPage title="Import Questions" />
            </AdminRoute>
          } 
        />
        
        {/* Test Management Routes */}
        <Route 
          path="/admin/tests" 
          element={
            <AdminRoute>
              <TestManagementPage />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/tests/new" 
          element={
            <AdminRoute>
              <CreateTestPage />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/test-sessions" 
          element={
            <AdminRoute>
              <PlaceholderPage title="Test Sessions Monitor" />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <AdminRoute>
              <PlaceholderPage title="Analytics Dashboard" />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/organizations" 
          element={
            <AdminRoute>
              <PlaceholderPage title="Organization Management" />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/organizations/new" 
          element={
            <AdminRoute>
              <PlaceholderPage title="Add New Organization" />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/global-content" 
          element={
            <AdminRoute>
              <PlaceholderPage title="Global Content Management" />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/system-health" 
          element={
            <AdminRoute>
              <PlaceholderPage title="System Health Monitor" />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <AdminRoute>
              <PlaceholderPage title="Admin Settings" />
            </AdminRoute>
          } 
        />
        
        {/* Student Routes - Keep existing ones */}
        <Route 
          path="/tests" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Available Tests" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/results" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="My Test Results" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="User Profile" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <PlaceholderPage title="User Settings" />
            </ProtectedRoute>
          } 
        />
        
        {/* Legacy routes for backward compatibility */}
        <Route 
          path="/questions" 
          element={<Navigate to="/admin/question-bank" replace />}
        />
        <Route 
          path="/users" 
          element={<Navigate to="/admin/users" replace />}
        />
        <Route 
          path="/analytics" 
          element={<Navigate to="/admin/analytics" replace />}
        />
        
        {/* Catch all route - redirect to dashboard if authenticated, otherwise to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <AppNavbar />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;