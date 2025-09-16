// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import apiService from '../services/ApiService';
import {
  Container,
  Row,
  Col,
  Alert,
  Spinner
} from 'reactstrap';
import { AlertCircle, Activity, BarChart3 } from 'lucide-react';

// Modular Components
import DashboardHeader from '../components/admin/dashboard/DashboardHeader';
import WelcomeSection from '../components/admin/dashboard/WelcomeSection';
import StatsSection from '../components/admin/dashboard/StatsSection';
import FeatureSection from '../components/admin/dashboard/FeatureSection';
import StudentRequestsSection from '../components/admin/dashboard/StudentRequestsSection';
import QuickActions from '../components/admin/dashboard/QuickActions';

// Utils and Types
import { getDashboardFeatures } from '../components/admin/dashboard/utils';
import type {
  DashboardStats,
  QuickActionType,
  User,
  TestSession,
  Test,
  QuestionStatsResponse,
  DashboardFeature
} from '../types';

// Updated calculateStats function to use question stats data and correct interfaces
const calculateStats = (
  users: User[],
  questionStats: QuestionStatsResponse | null,
  tests: Test[],
  sessions: TestSession[],
  currentUser: User
): DashboardStats => {
  const isSuperOrgAdmin = currentUser.organization?.isSuperOrg && currentUser.role === 'admin';

  // Filter data based on user permissions
  const relevantUsers = isSuperOrgAdmin ? users : users.filter(u => u.organizationId === currentUser.organizationId);
  const relevantTests = isSuperOrgAdmin ? tests : tests.filter(t => t.organizationId === currentUser.organizationId);
  const relevantSessions = isSuperOrgAdmin ? sessions : sessions.filter(s =>
    relevantTests.some(t => t._id === s.testId)
  );

  // Calculate user stats
  const totalUsers = relevantUsers.length;
  const independentStudents = isSuperOrgAdmin
    ? users.filter(u => !u.organizationId || u.organizationId === null).length
    : 0;
  const orgAffiliatedUsers = isSuperOrgAdmin
    ? users.filter(u => u.organizationId && u.organizationId !== null).length
    : totalUsers;

  // Calculate question stats from the stats endpoint
  const totalQuestions = questionStats?.totals?.totalQuestions || 0;
  const globalQuestions = isSuperOrgAdmin ? totalQuestions : 0;
  const orgSpecificQuestions = isSuperOrgAdmin ? 0 : totalQuestions;

  // Calculate test stats
  const activeTests = relevantTests.filter(t => t.status === 'active').length;
  const totalTests = relevantTests.length;

  // Session stats
  const activeSessions = relevantSessions.filter(s => s.status === 'inProgress').length;
  const completedSessions = relevantSessions.filter(s => s.status === 'completed').length;

  const organizationsCount = 0;

  return {
    totalUsers,
    independentStudents,
    orgAffiliatedUsers,
    globalQuestions,
    orgSpecificQuestions,
    totalQuestions,
    activeTests,
    totalTests,
    activeSessions,
    completedSessions,
    organizationsCount
  };
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const typedUser = user as User | null;

  // Fetch dashboard stats with proper typing
  const fetchStats = async (): Promise<void> => {
    if (!typedUser) return;

    try {
      setLoading(true);
      setError(null);

      const isSuperOrgAdmin = typedUser.organization?.isSuperOrg && typedUser.role === 'admin';

      const [users, questionStats, tests, sessions] = await Promise.all([
        apiService.getAllUsers(isSuperOrgAdmin ? {} : { orgId: typedUser.organizationId }),
        apiService.getQuestionStats(),
        apiService.getAllTests(isSuperOrgAdmin ? {} : { orgId: typedUser.organizationId }),
        apiService.getAllTestSessions(isSuperOrgAdmin ? {} : { orgId: typedUser.organizationId })
      ]);

      if (!Array.isArray(users) || !questionStats || !Array.isArray(tests) || !Array.isArray(sessions)) {
        throw new Error('Failed to fetch dashboard data');
      }

      const calculatedStats = calculateStats(users, questionStats, tests, sessions, typedUser);
      setStats(calculatedStats);

    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typedUser) {
      fetchStats();
    }
  }, [typedUser]);

  // Handle navigation with proper typing
  const handleNavigation = (path: string): void => {
    navigate(path);
  };

  // Handle quick actions with proper typing
  const handleQuickAction = (action: QuickActionType): void => {
    switch (action) {
      case 'addUser':
        navigate('/admin/users/new');
        break;
      case 'createQuestion':
        navigate('/admin/question-bank/add');
        break;
      case 'createTest':
        navigate('/admin/tests/new');
        break;
      case 'addOrganization':
        navigate('/admin/organizations/new');
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  // Loading state
  if (!typedUser || loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">Loading dashboard...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert color="danger" className="text-center">
              <AlertCircle className="me-2 icon-md" />
              <strong>Dashboard Error:</strong> {error}
              <div className="mt-3">
                <button
                  className="btn btn-primary"
                  onClick={fetchStats}
                  type="button"
                >
                  Retry
                </button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // Get base features from utility function
  const baseFeatures = getDashboardFeatures(typedUser, stats);
  const isSuperOrgAdmin = Boolean(typedUser.organization?.isSuperOrg && typedUser.role === 'admin');

  // Organize features into logical, task-based sections
  
  // 1. USER MANAGEMENT - Everything related to managing people
  const userManagementFeatures: DashboardFeature[] = baseFeatures.filter(feature => 
    ['Users', 'User Management', 'Organizations', 'Organization Management', 'Students', 'Instructors'].some(keyword => 
      feature.title.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  // 2. CONTENT MANAGEMENT - Questions and Tests
  const contentManagementFeatures: DashboardFeature[] = baseFeatures.filter(feature => 
    ['Question Bank', 'Questions', 'Tests', 'Test Management', 'Content'].some(keyword => 
      feature.title.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  // 3. ANALYTICS & LIVE SESSIONS - Real-time monitoring and analytics
  const analyticsAndMonitoringFeatures: DashboardFeature[] = [
    // Custom real-time monitoring features
    {
      title: 'Live Session Monitor',
      description: 'Real-time view of students currently taking tests',
      path: '/admin/sessions/active',
      icon: Activity,
      color: 'warning',
      stats: `${stats?.activeSessions || 0} students testing now`,
      access: ['admin', 'instructor']
    },
    {
      title: 'Results & Analytics',
      description: 'View completed test results and performance analytics',
      path: '/admin/results',
      icon: BarChart3,
      color: 'success',
      stats: `${stats?.completedSessions || 0} tests completed`,
      access: ['admin', 'instructor']
    },
    // Analytics features from base features
    ...baseFeatures.filter(feature => 
      ['Analytics', 'Reports', 'Performance', 'Insights', 'Statistics', 'Dashboard'].some(keyword => 
        feature.title.toLowerCase().includes(keyword.toLowerCase())
      )
    )
  ];

  // 4. SYSTEM & CONFIGURATION - Platform settings and admin tools
  const systemConfigFeatures: DashboardFeature[] = baseFeatures.filter(feature => 
    ['System', 'Settings', 'Configuration', 'Admin', 'Platform', 'Setup'].some(keyword => 
      feature.title.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', marginTop: '20px' }}>
      <DashboardHeader user={typedUser} />

      <Container className="py-4">
        {/* Welcome Section */}
        <WelcomeSection user={typedUser} />

        {/* Stats Cards */}
        {stats && (
          <StatsSection 
            user={typedUser} 
            stats={stats} 
            onNavigate={handleNavigation} 
          />
        )}

        {/* Feature Cards - Organized by Logical Task-Based Sections */}
        
        {/* 1. USER MANAGEMENT SECTION */}
        <FeatureSection
          title="User Management"
          subtitle="Manage students, instructors, and organizations"
          features={userManagementFeatures}
          onNavigate={handleNavigation}
          sectionKey="users"
        />

        {/* 2. CONTENT MANAGEMENT SECTION */}
        <FeatureSection
          title="Content Management"
          subtitle="Create and manage questions, tests, and learning materials"
          features={contentManagementFeatures}
          onNavigate={handleNavigation}
          sectionKey="content"
        />

        {/* 3. STUDENT REQUESTS & APPROVALS SECTION */}
        {stats && (
          <StudentRequestsSection
            stats={stats}
            notifications={notifications}
            onNavigate={handleNavigation}
          />
        )}

        {/* 4. ANALYTICS & LIVE SESSIONS SECTION */}
        <FeatureSection
          title="Analytics & Live Sessions"
          subtitle="Monitor active sessions, view results, and analyze performance"
          features={analyticsAndMonitoringFeatures}
          onNavigate={handleNavigation}
          sectionKey="analytics"
        />

        {/* 5. SYSTEM & CONFIGURATION SECTION */}
        <FeatureSection
          title="System & Configuration"
          subtitle="Platform settings, system administration, and configuration"
          features={systemConfigFeatures}
          onNavigate={handleNavigation}
          sectionKey="system"
        />

        {/* Quick Actions */}
        <QuickActions
          onAction={handleQuickAction}
          userRole={typedUser.role}
          isSuperOrgAdmin={isSuperOrgAdmin}
        />
      </Container>

      {/* Styles */}
      <style>{`
        .transition-hover {
          transition: all 0.2s ease-in-out;
        }
        .transition-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        .icon-xs {
          width: 12px;
          height: 12px;
        }
        .icon-sm {
          width: 16px;
          height: 16px;
        }
        .icon-md {
          width: 20px;
          height: 20px;
        }
        .icon-lg {
          width: 24px;
          height: 24px;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;