import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  CardBody, 
  CardTitle, 
  CardText,
  Button,
  Badge,
  Alert,
  Spinner
} from 'reactstrap';
import { 
  Users, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Settings, 
  Activity, 
  Building, 
  Globe, 
  Monitor,
  ChevronRight,
  AlertCircle,
  Loader
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  independentStudents: number;
  orgAffiliatedUsers: number;
  globalQuestions: number;
  orgSpecificQuestions: number;
  totalQuestions: number;
  activeTests: number;
  totalTests: number;
  activeSessions: number;
  organizationsCount: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats
  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const isSuperOrgAdmin = user.organization?.isSuperOrg && user.role === 'admin';
      
      console.log('Dashboard: Fetching stats for user:', {
        loginId: user.loginId,
        role: user.role,
        organizationId: user.organizationId,
        isSuperOrg: user.organization?.isSuperOrg,
        isSuperOrgAdmin
      });

      const [usersResponse, questionsResponse, testsResponse, sessionsResponse] = await Promise.all([
        apiService.getAllUsers(isSuperOrgAdmin ? {} : { orgId: user.organizationId }),
        apiService.getAllQuestions(isSuperOrgAdmin ? {} : { orgId: user.organizationId }),
        apiService.getAllTests(isSuperOrgAdmin ? {} : { orgId: user.organizationId }),
        apiService.getAllTestSessions(isSuperOrgAdmin ? {} : { orgId: user.organizationId })
      ]);

      // Handle API errors
      if (usersResponse.error) {
        throw new Error(`Users API error: ${usersResponse.message}`);
      }
      if (questionsResponse.error) {
        throw new Error(`Questions API error: ${questionsResponse.message}`);
      }
      if (testsResponse.error) {
        throw new Error(`Tests API error: ${testsResponse.message}`);
      }
      if (sessionsResponse.error) {
        throw new Error(`Sessions API error: ${sessionsResponse.message}`);
      }

      // Ensure data is an array
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      const questions = Array.isArray(questionsResponse.data) ? questionsResponse.data : [];
      const tests = Array.isArray(testsResponse.data) ? testsResponse.data : [];
      const sessions = Array.isArray(sessionsResponse.data) ? sessionsResponse.data : [];

      console.log('Dashboard: Processed data:', {
        usersCount: users.length,
        questionsCount: questions.length,
        testsCount: tests.length,
        sessionsCount: sessions.length
      });

      // Calculate stats
      const independentStudents = isSuperOrgAdmin ? users.filter(u => u.role === 'student').length : 0;
      const orgAffiliatedUsers = isSuperOrgAdmin ? users.filter(u => u.organizationId !== user.organizationId).length : users.length;
      const globalQuestions = questions.filter(q => q.isGlobal).length;
      const orgSpecificQuestions = questions.filter(q => !q.isGlobal).length;
      const activeSessions = sessions.filter(s => s.status === 'inProgress').length;
      const activeTests = tests.filter(t => t.status === 'active').length;

      // Get organizations count if super admin
      let organizationsCount = 0;
      if (isSuperOrgAdmin) {
        try {
          organizationsCount = 2; // EngineerSmith + TestOrg
        } catch (error) {
          console.warn('Could not fetch organizations count:', error);
        }
      }

      const calculatedStats = {
        totalUsers: users.length,
        independentStudents,
        orgAffiliatedUsers,
        globalQuestions,
        orgSpecificQuestions,
        totalQuestions: questions.length,
        activeTests,
        totalTests: tests.length,
        activeSessions,
        organizationsCount
      };

      console.log('Dashboard: Calculated stats:', calculatedStats);
      setStats(calculatedStats);

    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Initialize dashboard when user is available
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  // Define features based on actual user role and organization
  const getFeatures = () => {
    if (!user) return [];

    const isSuperOrgAdmin = user.organization?.isSuperOrg && user.role === 'admin';
    const isSuperOrgInstructor = user.organization?.isSuperOrg && user.role === 'instructor';
    
    const baseFeatures = [
      {
        title: "User Management",
        description: isSuperOrgAdmin 
          ? "Manage all users across organizations and independent students"
          : "View and manage users in your organization",
        path: "/admin/users",
        icon: Users,
        color: "primary",
        stats: stats ? `${stats.totalUsers} total users` : 'Loading...',
        access: ['admin', 'instructor']
      },
      {
        title: "Question Bank",
        description: isSuperOrgAdmin || isSuperOrgInstructor
          ? "Manage global and organization-specific questions"
          : "Review and manage your organization's questions",
        path: "/admin/question-bank",
        icon: BookOpen,
        color: "success",
        stats: stats ? `${stats.totalQuestions} questions` : 'Loading...',
        access: ['admin', 'instructor']
      },
      {
        title: "Manage Tests",
        description: isSuperOrgAdmin || isSuperOrgInstructor
          ? "Create global tests and manage all organization tests"
          : "Create and organize tests for your organization",
        path: "/admin/tests",
        icon: FileText,
        color: "info",
        stats: stats ? `${stats.activeTests} active tests` : 'Loading...',
        access: ['admin', 'instructor']
      },
      {
        title: "Test Sessions",
        description: "Monitor active test sessions and review results",
        path: "/admin/test-sessions",
        icon: Monitor,
        color: "warning",
        stats: stats ? `${stats.activeSessions} active sessions` : 'Loading...',
        access: ['admin', 'instructor']
      },
      {
        title: "Analytics",
        description: isSuperOrgAdmin
          ? "Platform-wide analytics and organization comparisons"
          : "Performance metrics for your organization",
        path: "/admin/analytics",
        icon: BarChart3,
        color: "secondary",
        stats: stats ? "View detailed reports" : 'Loading...',
        access: ['admin', 'instructor']
      }
    ];

    // Super org admin exclusive features
    if (isSuperOrgAdmin) {
      baseFeatures.push(
        {
          title: "Organization Management",
          description: "Create and manage organizations, invite codes, and permissions",
          path: "/admin/organizations",
          icon: Building,
          color: "danger",
          stats: stats ? `${stats.organizationsCount} organizations` : 'Loading...',
          access: ['admin']
        },
        {
          title: "Global Content",
          description: "Manage global questions and tests available to all users",
          path: "/admin/global-content",
          icon: Globe,
          color: "dark",
          stats: stats ? `${stats.globalQuestions} global questions` : 'Loading...',
          access: ['admin']
        }
      );
    }

    // Common features for admins and some for instructors
    if (user.role === 'admin') {
      baseFeatures.push(
        {
          title: "System Health",
          description: "Monitor server performance and system statistics",
          path: "/admin/system-health",
          icon: Activity,
          color: "success",
          stats: "Check status",
          access: ['admin']
        },
        {
          title: "Settings",
          description: isSuperOrgAdmin
            ? "Platform-wide configuration and permissions"
            : "Organization settings and preferences",
          path: "/admin/settings",
          icon: Settings,
          color: "secondary",
          stats: "Configuration",
          access: ['admin']
        }
      );
    }

    // Filter features based on user role
    return baseFeatures.filter(feature => feature.access.includes(user.role));
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }: {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }) => (
    <Card className="h-100 border-0 shadow-sm">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted mb-1 small">{title}</p>
            <h3 className="mb-0 fw-bold">{value}</h3>
            {subtitle && <small className="text-muted">{subtitle}</small>}
          </div>
          <div className={`p-2 rounded bg-${color} bg-opacity-10`}>
            <Icon className={`text-${color} icon-lg`} />
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const FeatureCard = ({ feature, onClick }: {
    feature: {
      title: string;
      description: string;
      path: string;
      icon: React.ComponentType<{ className?: string }>;
      color: string;
      stats: string;
      access: string[];
    };
    onClick: (path: string) => void;
  }) => (
    <Card 
      className="h-100 border-0 shadow-sm transition-hover"
      style={{ cursor: 'pointer' }}
      onClick={() => onClick(feature.path)}
    >
      <CardBody className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className={`p-3 rounded bg-${feature.color} bg-opacity-10`}>
            <feature.icon className={`text-${feature.color} icon-lg`} />
          </div>
          <ChevronRight className="text-muted icon-md" />
        </div>
        
        <div className="flex-grow-1">
          <CardTitle tag="h5" className="mb-2">
            {feature.title}
          </CardTitle>
          <CardText className="text-muted mb-3">
            {feature.description}
          </CardText>
        </div>
        
        <div className="mt-auto">
          <small className="text-muted fw-medium">{feature.stats}</small>
        </div>
      </CardBody>
    </Card>
  );

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'addUser':
        navigate('/admin/users/new');
        break;
      case 'createQuestion':
        navigate('/admin/question-bank/new');
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
  if (!user || loading) {
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
                <Button color="primary" onClick={fetchStats}>
                  Retry
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  const features = getFeatures();

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', marginTop: '20px' }}>
      <div className="bg-white shadow-sm border-bottom">
        <Container>
          <div className="py-3">
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center">
                  <h1 className="h4 mb-0 me-3">EngineerSmith Admin</h1>
                  {user?.organization?.isSuperOrg && (
                    <Badge color="primary" className="d-flex align-items-center">
                      <Globe className="me-1 icon-xs" />
                      Super Admin
                    </Badge>
                  )}
                </div>
              </Col>
              <Col xs="auto">
                <div className="d-flex align-items-center">
                  <div 
                    className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <span className="text-white small fw-bold">
                      {user?.loginId?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="d-none d-sm-block">
                    <p className="mb-0 small fw-medium">
                      {user?.loginId || 'Admin User'}
                    </p>
                    <small className="text-muted">{user?.organization?.name}</small>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2 className="h3 mb-2">
              Welcome back, {user?.loginId || 'Admin'}!
            </h2>
            <p className="text-muted mb-0">
              {user?.organization?.isSuperOrg 
                ? "Manage the entire EngineerSmith platform, including all organizations and independent students."
                : `Manage your ${user?.organization?.name} organization and access global platform features.`
              }
            </p>
          </Col>
        </Row>

        {stats && (
          <Row className="g-3 mb-4">
            <Col md={6} lg={3}>
              <StatCard 
                title="Total Users" 
                value={stats.totalUsers} 
                subtitle={user?.organization?.isSuperOrg ? `${stats.independentStudents} independent students` : undefined}
                icon={Users} 
                color="primary" 
              />
            </Col>
            <Col md={6} lg={3}>
              <StatCard 
                title="Question Bank" 
                value={stats.totalQuestions} 
                subtitle={user?.organization?.isSuperOrg ? `${stats.globalQuestions} global questions` : undefined}
                icon={BookOpen} 
                color="success" 
              />
            </Col>
            <Col md={6} lg={3}>
              <StatCard 
                title="Active Tests" 
                value={stats.activeTests} 
                subtitle={`${stats.totalTests} total tests`}
                icon={FileText} 
                color="info" 
              />
            </Col>
            <Col md={6} lg={3}>
              <StatCard 
                title="Active Sessions" 
                value={stats.activeSessions} 
                subtitle="Users taking tests now"
                icon={Monitor} 
                color="warning" 
              />
            </Col>
          </Row>
        )}

        <Row className="g-3 mb-4">
          {features.map((feature, index) => (
            <Col key={index} md={6} lg={4}>
              <FeatureCard 
                feature={feature} 
                onClick={handleNavigation}
              />
            </Col>
          ))}
        </Row>

        <Card className="border-0 shadow-sm">
          <CardBody>
            <h5 className="mb-3">Quick Actions</h5>
            <div className="d-flex flex-wrap gap-2">
              {(user?.role === 'admin' || user?.role === 'instructor') && (
                <Button 
                  color="primary"
                  size="sm"
                  onClick={() => handleQuickAction('addUser')}
                  className="d-flex align-items-center"
                >
                  <Users className="me-2 icon-sm" />
                  Add New User
                </Button>
              )}
              <Button 
                color="success"
                size="sm"
                onClick={() => handleQuickAction('createQuestion')}
                className="d-flex align-items-center"
              >
                <BookOpen className="me-2 icon-sm" />
                Create Question
              </Button>
              <Button 
                color="info"
                size="sm"
                onClick={() => handleQuickAction('createTest')}
                className="d-flex align-items-center"
              >
                <FileText className="me-2 icon-sm" />
                Create Test
              </Button>
              {user?.organization?.isSuperOrg && user?.role === 'admin' && (
                <Button 
                  color="danger"
                  size="sm"
                  onClick={() => handleQuickAction('addOrganization')}
                  className="d-flex align-items-center"
                >
                  <Building className="me-2 icon-sm" />
                  Add Organization
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </Container>

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