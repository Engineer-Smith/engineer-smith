// src/pages/UserDetails.tsx - Enhanced with dashboard functionality
import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Mail,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
  User as UserIcon
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Progress,
  Row,
  Spinner,
  TabContent,
  Table,
  TabPane
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';

import type {
  User,
  UserDetailsDashboard
} from '../types';

const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [dashboard, setDashboard] = useState<UserDetailsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const typedUser = user as User | null;

  // Fetch user dashboard data
  const fetchUserDashboard = async (showRefreshSpinner = false) => {
    if (!userId || !typedUser) return;

    try {
      if (showRefreshSpinner) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const dashboardData = await apiService.getUserDetailsDashboard(userId);
      setDashboard(dashboardData);

    } catch (err) {
      console.error('Error fetching user dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId && typedUser) {
      fetchUserDashboard();
    }
  }, [userId, typedUser]);

  // Handle user actions
  const handleDeleteUser = async () => {
    if (!userId) return;

    try {
      await apiService.deleteUser(userId);
      navigate('/admin/users');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
    setDeleteModalOpen(false);
  };

  // Helper functions
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'instructor': return 'warning';
      case 'student': return 'primary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  if (!typedUser) {
    return <div>Please log in to access this page.</div>;
  }

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">Loading user dashboard...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error || !dashboard) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert color="danger" className="text-center">
              <div className="mb-3">
                {error || 'User not found'}
              </div>
              <Button color="primary" onClick={() => navigate('/admin/users')}>
                Back to Users
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  const { user: userDetails, performance, activity, content } = dashboard;

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Button
              color="outline-secondary"
              size="sm"
              onClick={() => navigate('/admin/users')}
              className="me-3"
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h2 className="h3 mb-1">{userDetails.fullName}</h2>
              <p className="text-muted mb-0">
                {userDetails.email || userDetails.loginId} • {userDetails.organization.name}
              </p>
            </div>
          </div>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button
              color="outline-secondary"
              size="sm"
              onClick={() => fetchUserDashboard(true)}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={`me-1 ${refreshing ? 'spinning' : ''}`} />
              Refresh
            </Button>
            <Button
              color="primary"
              size="sm"
              onClick={() => navigate(`/admin/users/${userId}/edit`)}
            >
              <Edit size={16} className="me-1" />
              Edit
            </Button>
            <Button
              color="danger"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 size={16} className="me-1" />
              Delete
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert color="danger">
              {error}
              <Button 
                color="link" 
                size="sm" 
                className="ms-auto p-0"
                onClick={() => setError(null)}
              >
                ×
              </Button>
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        {/* User Profile Card */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="text-center mb-4">
                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px' }}>
                  <UserIcon size={36} className="text-white" />
                </div>
                <h4 className="mb-1">{userDetails.fullName}</h4>
                <Badge color={getRoleBadgeColor(userDetails.role)} className="mb-2">
                  {userDetails.role.charAt(0).toUpperCase() + userDetails.role.slice(1)}
                </Badge>
                <br />
                <Badge color={userDetails.isSSO ? 'info' : 'secondary'}>
                  {userDetails.isSSO ? 'SSO Account' : 'Regular Account'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="d-flex align-items-center">
                  <UserIcon size={16} className="me-2 text-muted" />
                  <div>
                    <small className="text-muted d-block">Login ID</small>
                    <span>{userDetails.loginId}</span>
                  </div>
                </div>

                {userDetails.email && (
                  <div className="d-flex align-items-center mt-3">
                    <Mail size={16} className="me-2 text-muted" />
                    <div>
                      <small className="text-muted d-block">Email</small>
                      <span>{userDetails.email}</span>
                    </div>
                  </div>
                )}

                <div className="d-flex align-items-center mt-3">
                  <Building size={16} className="me-2 text-muted" />
                  <div>
                    <small className="text-muted d-block">Organization</small>
                    <span>{userDetails.organization.name}</span>
                    {userDetails.organization.isSuperOrg && (
                      <Badge color="warning" className="ms-2">Super</Badge>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-center mt-3">
                  <Calendar size={16} className="me-2 text-muted" />
                  <div>
                    <small className="text-muted d-block">Member Since</small>
                    <span>{new Date(userDetails.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Performance Overview */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white border-bottom-0">
              <h6 className="mb-0">Performance Overview</h6>
            </CardHeader>
            <CardBody>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Average Score</small>
                  <small className="fw-semibold">{performance.overview.averageScore.toFixed(1)}%</small>
                </div>
                <Progress 
                  value={performance.overview.averageScore} 
                  color={getPerformanceColor(performance.overview.averageScore)}
                  className="progress-sm"
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Pass Rate</small>
                  <small className="fw-semibold">{performance.overview.passRate}%</small>
                </div>
                <Progress 
                  value={performance.overview.passRate} 
                  color={getPerformanceColor(performance.overview.passRate)}
                  className="progress-sm"
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Efficiency</small>
                  <small className="fw-semibold">{performance.overview.efficiency}%</small>
                </div>
                <Progress 
                  value={performance.overview.efficiency} 
                  color={getPerformanceColor(performance.overview.efficiency)}
                  className="progress-sm"
                />
              </div>

              <Row className="text-center">
                <Col>
                  <div>
                    <h5 className="mb-0">{performance.overview.totalTests}</h5>
                    <small className="text-muted">Total Tests</small>
                  </div>
                </Col>
                <Col>
                  <div>
                    <h5 className="mb-0">{formatDuration(performance.overview.totalTimeSpent)}</h5>
                    <small className="text-muted">Time Spent</small>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>

        {/* Main Content */}
        <Col lg={8}>
          {/* Performance Stats Cards */}
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card className="border-0 bg-primary text-white">
                <CardBody className="text-center">
                  <FileText size={24} className="mb-2" />
                  <h4 className="mb-0">{performance.overview.completedTests}</h4>
                  <small>Completed</small>
                </CardBody>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-0 bg-success text-white">
                <CardBody className="text-center">
                  <CheckCircle size={24} className="mb-2" />
                  <h4 className="mb-0">{performance.overview.passRate}%</h4>
                  <small>Pass Rate</small>
                </CardBody>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-0 bg-info text-white">
                <CardBody className="text-center">
                  {performance.trends.isImproving ? (
                    <TrendingUp size={24} className="mb-2" />
                  ) : (
                    <TrendingDown size={24} className="mb-2" />
                  )}
                  <h4 className="mb-0">{Math.abs(performance.trends.scoreChange).toFixed(1)}</h4>
                  <small>Score Change</small>
                </CardBody>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-0 bg-warning text-white">
                <CardBody className="text-center">
                  <Clock size={24} className="mb-2" />
                  <h4 className="mb-0">{Object.values(activity.sessions).reduce((sum, s) => sum + s.count, 0)}</h4>
                  <small>Total Sessions</small>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Tabs */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white border-bottom">
              <Nav tabs className="card-header-tabs">
                <NavItem>
                  <NavLink 
                    className={activeTab === 'activity' ? 'active' : ''}
                    onClick={() => setActiveTab('activity')}
                    style={{ cursor: 'pointer' }}
                  >
                    <Activity size={16} className="me-1" />
                    Recent Activity
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    className={activeTab === 'performance' ? 'active' : ''}
                    onClick={() => setActiveTab('performance')}
                    style={{ cursor: 'pointer' }}
                  >
                    <BarChart3 size={16} className="me-1" />
                    Performance
                  </NavLink>
                </NavItem>
                {content && (
                  <NavItem>
                    <NavLink 
                      className={activeTab === 'content' ? 'active' : ''}
                      onClick={() => setActiveTab('content')}
                      style={{ cursor: 'pointer' }}
                    >
                      <BookOpen size={16} className="me-1" />
                      Created Content
                    </NavLink>
                  </NavItem>
                )}
              </Nav>
            </CardHeader>

            <TabContent activeTab={activeTab}>
              {/* Activity Tab */}
              <TabPane tabId="activity">
                <CardBody className="p-0">
                  {activity.recent.length === 0 ? (
                    <div className="text-center py-5">
                      <Activity size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">No recent activity</h5>
                      <p className="text-muted mb-0">This user hasn't taken any tests yet</p>
                    </div>
                  ) : (
                    <Table responsive hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Test</th>
                          <th>Type</th>
                          <th>Score</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activity.recent.map((test, index) => (
                          <tr key={index}>
                            <td>
                              <div>
                                <div className="fw-semibold">{test.testTitle}</div>
                                <small className="text-muted">Attempt #{test.attemptNumber}</small>
                              </div>
                            </td>
                            <td>
                              <Badge color="secondary">
                                {test.testType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            </td>
                            <td>
                              <div>
                                <span className="fw-semibold">{test.score.percentage.toFixed(1)}%</span>
                                <br />
                                <small className="text-muted">
                                  {test.score.earnedPoints}/{test.score.totalPoints} pts
                                </small>
                              </div>
                            </td>
                            <td>
                              <Badge color={test.score.passed ? 'success' : 'danger'}>
                                {test.score.passed ? 'Passed' : 'Failed'}
                              </Badge>
                            </td>
                            <td>
                              <small>
                                {test.completedAt ? formatDate(test.completedAt) : 'In Progress'}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </CardBody>
              </TabPane>

              {/* Performance Tab */}
              <TabPane tabId="performance">
                <CardBody>
                  <Row>
                    <Col md={6}>
                      <h6>Performance by Question Type</h6>
                      <div className="space-y-3">
                        {Object.entries(performance.breakdown.byType).map(([type, metrics]) => (
                          <div key={type}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</small>
                              <small className="fw-semibold">
                                {metrics.length > 0 ? 
                                  `${(metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length).toFixed(1)}%` 
                                  : 'N/A'
                                }
                              </small>
                            </div>
                            <Progress 
                              value={metrics.length > 0 ? 
                                metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length 
                                : 0
                              } 
                              color={getPerformanceColor(
                                metrics.length > 0 ? 
                                  metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length 
                                  : 0
                              )}
                              className="progress-sm mb-2"
                            />
                          </div>
                        ))}
                      </div>
                    </Col>
                    <Col md={6}>
                      <h6>Performance by Difficulty</h6>
                      <div className="space-y-3">
                        {Object.entries(performance.breakdown.byDifficulty).map(([difficulty, metrics]) => (
                          <div key={difficulty}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-capitalize">{difficulty}</small>
                              <small className="fw-semibold">
                                {metrics.length > 0 ? 
                                  `${(metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length).toFixed(1)}%` 
                                  : 'N/A'
                                }
                              </small>
                            </div>
                            <Progress 
                              value={metrics.length > 0 ? 
                                metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length 
                                : 0
                              } 
                              color={getPerformanceColor(
                                metrics.length > 0 ? 
                                  metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length 
                                  : 0
                              )}
                              className="progress-sm mb-2"
                            />
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </TabPane>

              {/* Content Tab */}
              {content && (
                <TabPane tabId="content">
                  <CardBody>
                    <Row>
                      <Col md={6}>
                        <h6>Created Questions ({content.questions.length})</h6>
                        {content.questions.length === 0 ? (
                          <p className="text-muted">No questions created</p>
                        ) : (
                          <div className="space-y-3">
                            {content.questions.slice(0, 5).map((question) => (
                              <div key={question._id} className="p-3 border rounded">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <div className="fw-semibold">{question.title}</div>
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                      <Badge color="secondary">{question.language}</Badge>
                                      <Badge color="outline-secondary">{question.difficulty}</Badge>
                                      <Badge color={question.status === 'active' ? 'success' : 'warning'}>
                                        {question.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-end">
                                    <small className="text-muted d-block">Used {question.timesUsed} times</small>
                                    <small className="text-muted">{question.successRate.toFixed(1)}% success</small>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Col>
                      <Col md={6}>
                        <h6>Created Tests ({content.tests.length})</h6>
                        {content.tests.length === 0 ? (
                          <p className="text-muted">No tests created</p>
                        ) : (
                          <div className="space-y-3">
                            {content.tests.slice(0, 5).map((test) => (
                              <div key={test._id} className="p-3 border rounded">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <div className="fw-semibold">{test.title}</div>
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                      <Badge color="secondary">{test.testType.replace('_', ' ')}</Badge>
                                      <Badge color={test.status === 'active' ? 'success' : 'warning'}>
                                        {test.status}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-end">
                                    <small className="text-muted d-block">{test.totalAttempts} attempts</small>
                                    <small className="text-muted">{test.averageScore.toFixed(1)}% avg</small>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Col>
                    </Row>
                  </CardBody>
                </TabPane>
              )}
            </TabContent>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(false)}>
        <ModalHeader toggle={() => setDeleteModalOpen(false)}>
          Confirm User Deletion
        </ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to delete user <strong>{userDetails.fullName}</strong>?
          </p>
          <Alert color="warning" className="mb-0">
            <strong>Warning:</strong> This action cannot be undone. All user data, test sessions, 
            and results will be permanently removed.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default UserDetailsPage;