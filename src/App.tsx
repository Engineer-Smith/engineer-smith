
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import RequireAdmin from "./components/RequireAdmin";
import QuestionBankPage from "./pages/QuestionBankPage";
import QuestionListPage from "./pages/QuestionListPage";
import AppNavbar from "./components/Navbar";
import AddQuestionPage from "./pages/AddQuestionPage";
import SystemHealthPage from "./pages/SystemHealthPage";
import UserManagementPage from "./pages/UserManagementPage";
import TestManagementPage from "./pages/TestManagementPage";
import CreateTestPage from "./pages/CreateTestPage";

function RootRoute() {
  const { loading } = useAuth();

  if (loading) return <div className="container py-5 text-center">Loading...</div>;
  return <LandingPage />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppNavbar />
        <Routes>
          {/* Root always routes to LandingPage */}
          <Route path="/" element={<RootRoute />} />

          {/* Login route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Dashboard - must be admin */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboardPage />
              </RequireAdmin>
            }
          />

          {/* Question Bank - must be admin */}
          <Route
            path="/admin/question-bank"
            element={
              <RequireAdmin>
                <QuestionBankPage />
              </RequireAdmin>
            }
          />

          {/* Add Question - must be admin */}
          <Route
            path="/admin/question-bank/add"
            element={
              <RequireAdmin>
                <AddQuestionPage />
              </RequireAdmin>
            }
          />

          {/* Question List by Skill - must be admin */}
          <Route
            path="/admin/question-bank/:skill"
            element={
              <RequireAdmin>
                <QuestionListPage />
              </RequireAdmin>
            }
          />

          {/* System Health - must be admin */}
          <Route
            path="/admin/system-health"
            element={
              <RequireAdmin>
                <SystemHealthPage />
              </RequireAdmin>
            }
          />

          {/* User Management - must be admin */}
          <Route
            path="/admin/users"
            element={
              <RequireAdmin>
                <UserManagementPage />
              </RequireAdmin>
            }
          />

          {/* Test Management Routes - must be admin */}
          <Route
            path="/admin/tests"
            element={
              <RequireAdmin>
                <TestManagementPage />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/tests/create"
            element={
              <RequireAdmin>
                <CreateTestPage />
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/tests/:id"
            element={
              <RequireAdmin>
                <div className="container py-4">
                  <h1>Test Details</h1>
                  <p>Test detail view - Coming Soon!</p>
                </div>
              </RequireAdmin>
            }
          />

          <Route
            path="/admin/tests/:id/edit"
            element={
              <RequireAdmin>
                <div className="container py-4">
                  <h1>Edit Test</h1>
                  <p>Test editing - Coming Soon!</p>
                </div>
              </RequireAdmin>
            }
          />

          {/* Test Sessions - must be admin */}
          <Route
            path="/admin/test-sessions"
            element={
              <RequireAdmin>
                <div className="container py-4">
                  <h1>Test Sessions</h1>
                  <p>Monitor active test sessions and results - Coming Soon!</p>
                </div>
              </RequireAdmin>
            }
          />

          {/* Analytics - must be admin */}
          <Route
            path="/admin/analytics"
            element={
              <RequireAdmin>
                <div className="container py-4">
                  <h1>Analytics</h1>
                  <p>Performance metrics and usage analytics - Coming Soon!</p>
                </div>
              </RequireAdmin>
            }
          />

          {/* Settings - must be admin */}
          <Route
            path="/admin/settings"
            element={
              <RequireAdmin>
                <div className="container py-4">
                  <h1>Settings</h1>
                  <p>Application configuration and permissions - Coming Soon!</p>
                </div>
              </RequireAdmin>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


//   email admin@engineersmith.com
//   password admin123456