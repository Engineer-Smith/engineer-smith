import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
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
import FeaturesPage from './pages/FeaturesPage';
import LanguagesPage from './pages/LanguagesPage';
import ForOrganizationsPage from './pages/ForOrganizationsPage';
import ForIndividualsPage from './pages/ForIndividualsPage';

// ✅ NEW: Import test-related components
import TestPreviewPage from './pages/TestPreviewPage';
// import EditTestPage from './pages/EditTestPage'; // You'll need to create this
// import ViewTestPage from './pages/ViewTestPage';   // You'll need to create this

// ✅ NEW: Import student test flow components
import TestDetailsPage from './pages/TestDetailsPage';
import TestSessionPage from './pages/TestSessionPage';
import { TestSessionProvider } from './context/TestSessionContext';
import TestResultsPage from './pages/TestResultsPage';
import ResultDetailsPage from './pages/ResultDetailsPage';
import { SocketProvider } from './context/SocketContext';

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

// ✅ NEW: PublicRoute - Redirects authenticated users away from auth pages
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and trying to access auth pages, redirect them to appropriate dashboard
  if (isAuthenticated && ['/login', '/register'].includes(location.pathname)) {
    const defaultRoute = user?.role === 'admin' || user?.role === 'instructor'
      ? '/admin'
      : '/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

// ✅ UPDATED: ProtectedRoute - Enhanced to remember where user was trying to go
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate
      to="/login"
      state={{ from: location }}
      replace
    />
  );
};

// ✅ NEW: SmartDashboardRoute - Redirects to role-appropriate dashboard
const SmartDashboardRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Redirect based on user role
  switch (user?.role) {
    case 'admin':
    case 'instructor':
      return <Navigate to="/admin" replace />;
    case 'student':
    default:
      return <Navigate to="/student-dashboard" replace />;
  }
};

// ✅ UPDATED: AdminRoute - Enhanced with better role checking
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (user?.role !== 'admin' && user?.role !== 'instructor') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// StudentRoute component - only allows students
const StudentRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (user?.role !== 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ✅ UPDATED: SSO Callback component - Uses smart dashboard route
const SSOCallback = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'true') {
      // SSO successful, navigate to smart dashboard route
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
        {/* Public Routes with Smart Redirects */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />
        <Route path="/auth/callback" element={<SSOCallback />} />

        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/languages" element={<LanguagesPage />} />
        <Route path="/for-organizations" element={<ForOrganizationsPage />} />
        <Route path="/for-individuals" element={<ForIndividualsPage />} />

        {/* ✅ NEW: Smart Dashboard Route - Redirects based on role */}
        <Route path="/dashboard" element={<SmartDashboardRoute />} />

        {/* ✅ NEW: Specific Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <StudentRoute>
              <Dashboard />
            </StudentRoute>
          }
        />

        {/* ✅ UPDATED: Student Test Flow Routes - All use StudentRoute */}
        <Route
          path="/test-details/:testId"
          element={
            <StudentRoute>
              <TestDetailsPage />
            </StudentRoute>
          }
        />
        <Route
          path="/test-session/:testId"
          element={
            <StudentRoute>
              <TestSessionPage />
            </StudentRoute>
          }
        />
        <Route
          path="/test-results/:sessionId"
          element={
            <StudentRoute>
              <PlaceholderPage title="Test Results Summary" />
            </StudentRoute>
          }
        />

        {/* ✅ UPDATED: Student Routes - Use StudentRoute guard */}
        <Route
          path="/tests"
          element={
            <StudentRoute>
              <PlaceholderPage title="Available Tests" />
            </StudentRoute>
          }
        />
        <Route
          path="/results"
          element={
            <StudentRoute>
              <TestResultsPage />
            </StudentRoute>
          }
        />
        <Route
          path="/result-details/:resultId"
          element={
            <StudentRoute>
              <ResultDetailsPage />
            </StudentRoute>
          }
        />

        {/* Admin Management Routes - All use AdminRoute */}
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

        {/* ✅ UPDATED: Test Management Routes */}
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
        {/* ✅ NEW: Test-specific routes - ORDER MATTERS! Put specific routes first */}
        <Route
          path="/admin/tests/preview/:testId"
          element={
            <AdminRoute>
              <TestPreviewPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tests/edit/:testId"
          element={
            <AdminRoute>
              <PlaceholderPage title="Edit Test" />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tests/view/:testId"
          element={
            <AdminRoute>
              <PlaceholderPage title="View Test Details" />
            </AdminRoute>
          }
        />

        {/* Other Admin Routes */}
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

        {/* ✅ UPDATED: Profile/Settings - Use ProtectedRoute for all roles */}
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
    <Router>
      <AuthProvider>
        <SocketProvider>
          <TestSessionProvider>
            <div>
              <AppNavbar />
              <AppRoutes />
            </div>
          </TestSessionProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;