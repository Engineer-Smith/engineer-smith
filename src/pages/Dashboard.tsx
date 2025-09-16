import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Play,
  RotateCcw,
  Target,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  Row,
  Spinner
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ApiService from '../services/ApiService';

// [Types remain the same...]
interface StudentDashboardStats {
  testsAvailable: number;
  testsCompleted: number;
  averageScore: number;
  passedTests: number;
  totalTimeSpent: number;
}

interface TestAttempts {
  total: number;
  used: number;
  remaining: number;
}

interface StudentTest {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  passingScore: number;
  questionCount: number;
  attempts: TestAttempts;
  canTakeTest: boolean;
  hasOverride: boolean;
}

interface StudentActivity {
  id: string;
  testTitle: string;
  status: 'completed' | 'in_progress' | 'abandoned';
  score?: number;
  timestamp: string;
}

interface StudentDashboard {
  stats: StudentDashboardStats;
  tests: StudentTest[];
  recentActivity: StudentActivity[];
  requests: any[];
  overrides: any[];
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'in_progress';
  score?: number;
  icon: React.ReactNode;
}

export default function ModernStudentDashboard() {
  
  const { user } = useAuth();
  
  // ADD DEBUG LOGGING for notifications
  const notificationContext = useNotifications();
  const { submitAttemptRequest } = notificationContext;

  // State management
  const [dashboardData, setDashboardData] = useState<StudentDashboard | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Request attempts modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<StudentTest | null>(null);
  const [requestForm, setRequestForm] = useState({
    attempts: 1,
    reason: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Use the new student dashboard API endpoint
      const data = await ApiService.getStudentDashboard();
      setDashboardData(data);
      
      // Convert activity to display format
      const activity: ActivityItem[] = data.recentActivity.map(item => ({
        id: item.id,
        title: item.testTitle,
        description: item.status === 'completed' ? 
          `Completed with ${item.score ? Math.round(item.score) : 0}%` : 
          item.status === 'in_progress' ? 'In Progress' : 'Abandoned',
        timestamp: item.timestamp,
        status: item.status as ActivityItem['status'],
        score: item.score,
        icon: item.status === 'completed' ? 
          <CheckCircle size={16} /> : 
          item.status === 'in_progress' ? 
          <BookOpen size={16} /> : 
          <AlertCircle size={16} />
      }));
      
      setRecentActivity(activity);

    } catch (err) {
      console.error('🏠 StudentDashboard: Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAttempts = async () => {
    
    if (!selectedTest || !requestForm.reason.trim()) {
      alert('Please provide a reason for the request');
      return;
    }

    try {
      await submitAttemptRequest({
        testId: selectedTest._id,
        requestedAttempts: requestForm.attempts,
        reason: requestForm.reason
      });
      
      setShowRequestModal(false);
      setRequestForm({ attempts: 1, reason: '' });
      setSelectedTest(null);
      alert('Request submitted successfully');
      
      // Reload dashboard to reflect any changes
      await loadDashboardData();
    } catch (error) {
      console.error('🏠 StudentDashboard: Failed to submit request:', error);
      alert('Failed to submit request');
    }
  };

  const navigateToPath = (path: string) => {
    window.location.href = path;
  };

  if (isLoading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">Loading your dashboard...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Alert color="warning">No dashboard data available</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  const { stats, tests } = dashboardData;

  return (
    <Container fluid className="py-4" style={{ maxWidth: '1200px' }}>
      {/* Header Section */}
      <Row className="mb-5">
        <Col>
          <div className="text-center">
            <h1 className="display-5 mb-2">Welcome back, {user?.firstName || 'Student'}!</h1>
            <p className="lead text-muted">Ready to continue your learning journey?</p>
          </div>
        </Col>
      </Row>

      {/* Stats Section */}
      <Row className="mb-5">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="text-center p-4">
              <BookOpen size={32} className="text-primary mb-3" />
              <h3 className="mb-1">{stats.testsCompleted}</h3>
              <p className="text-muted mb-0">Tests Completed</p>
            </CardBody>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="text-center p-4">
              <Target size={32} className="text-success mb-3" />
              <h3 className="mb-1">{stats.averageScore}%</h3>
              <p className="text-muted mb-0">Average Score</p>
            </CardBody>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="text-center p-4">
              <Award size={32} className="text-warning mb-3" />
              <h3 className="mb-1">{stats.passedTests}</h3>
              <p className="text-muted mb-0">Tests Passed</p>
            </CardBody>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="text-center p-4">
              <Clock size={32} className="text-info mb-3" />
              <h3 className="mb-1">{stats.testsAvailable}</h3>
              <p className="text-muted mb-0">Available Tests</p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Main Content Area */}
      <Row>
        {/* Available Tests Section */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white border-bottom-0 pb-0">
              <h5 className="mb-0">Available Tests</h5>
            </CardHeader>
            <CardBody>
              {tests.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
                  <h6>No Tests Available</h6>
                  <p>Check back later for new assessments</p>
                </div>
              ) : (
                <Row>
                  {tests.slice(0, 6).map(test => {
                    const hasRemainingAttempts = test.attempts.remaining > 0;
                    
                    return (
                      <Col md={6} key={test._id} className="mb-4">
                        <Card className="border h-100">
                          <CardBody>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h6 className="mb-0">{test.title}</h6>
                              <div className="d-flex gap-2">
                                <Badge color="primary">{test.difficulty}</Badge>
                                {test.hasOverride && (
                                  <Badge color="warning">Override</Badge>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-muted small mb-3">
                              {test.description?.substring(0, 80)}...
                            </p>
                            
                            <div className="d-flex justify-content-between text-sm text-muted mb-2">
                              <span>{test.questionCount} Questions</span>
                              <span>{test.timeLimit} min</span>
                            </div>

                            {/* Attempt Information */}
                            <div className="d-flex justify-content-between text-sm mb-3">
                              <span className={`${hasRemainingAttempts ? 'text-success' : 'text-danger'}`}>
                                Attempts: {test.attempts.used}/{test.attempts.total}
                              </span>
                              <span className="text-muted">
                                {hasRemainingAttempts ? 
                                  `${test.attempts.remaining} remaining` : 
                                  'No attempts left'
                                }
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <Progress 
                                value={(test.attempts.used / test.attempts.total) * 100} 
                                color={hasRemainingAttempts ? 'primary' : 'danger'}
                                className="progress-sm"
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex gap-2">
                              {hasRemainingAttempts && test.canTakeTest ? (
                                <Button 
                                  color="primary" 
                                  size="sm" 
                                  className="flex-grow-1"
                                  onClick={() => navigateToPath(`/test-details/${test._id}`)}
                                >
                                  <Play size={16} className="me-1" />
                                  Start Test
                                </Button>
                              ) : (
                                <Button 
                                  color="outline-secondary" 
                                  size="sm" 
                                  className="flex-grow-1"
                                  disabled
                                >
                                  No Attempts Left
                                </Button>
                              )}
                              
                              {!hasRemainingAttempts && (
                                <Button 
                                  color="warning" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTest(test);
                                    setShowRequestModal(true);
                                  }}
                                  title="Request more attempts"
                                >
                                  <RotateCcw size={16} className="me-1" />
                                  Request
                                </Button>
                              )}
                              
                              {hasRemainingAttempts && (
                                <Button 
                                  color="outline-secondary" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTest(test);
                                    setShowRequestModal(true);
                                  }}
                                  title="Request additional attempts"
                                >
                                  <RotateCcw size={16} />
                                </Button>
                              )}
                            </div>

                            {/* Status Indicators */}
                            {!hasRemainingAttempts && (
                              <div className="mt-2">
                                <Badge color="danger" className="small">
                                  <AlertCircle size={12} className="me-1" />
                                  Exhausted
                                </Badge>
                              </div>
                            )}
                          </CardBody>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Recent Activity */}
          <Card className="border-0 shadow-sm mb-4">
            <CardHeader className="bg-white border-bottom-0">
              <h6 className="mb-0">Recent Activity</h6>
            </CardHeader>
            <CardBody>
              {recentActivity.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <Clock size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="small mb-0">No recent activity</p>
                </div>
              ) : (
                <div>
                  {recentActivity.map(item => (
                    <div key={item.id} className="d-flex align-items-start mb-3 pb-3 border-bottom">
                      <div className={`me-3 mt-1 text-${
                        item.status === 'completed' ? 'success' : 
                        item.status === 'failed' ? 'danger' : 
                        'primary'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1 small">{item.title}</h6>
                        <p className="text-muted small mb-1">{item.description}</p>
                        <small className="text-muted">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </small>
                      </div>
                      {item.score && (
                        <Badge color={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'danger'}>
                          {Math.round(item.score)}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* My Requests */}
          {dashboardData.requests.length > 0 && (
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="bg-white border-bottom-0">
                <h6 className="mb-0">My Requests</h6>
              </CardHeader>
              <CardBody>
                {dashboardData.requests.map(request => (
                  <div key={request.id} className="mb-3 p-2 border rounded">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="small mb-1">{request.testTitle}</h6>
                        <small className="text-muted">{request.requestedAttempts} attempts requested</small>
                      </div>
                      <Badge color={
                        request.status === 'approved' ? 'success' : 
                        request.status === 'rejected' ? 'danger' : 
                        'warning'
                      }>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-white border-bottom-0">
              <h6 className="mb-0">Quick Actions</h6>
            </CardHeader>
            <CardBody>
              <div className="d-grid gap-2">
                <Button color="outline-primary" onClick={() => navigateToPath('/progress')}>
                  <BarChart3 size={16} className="me-2" />
                  View Progress
                </Button>
                <Button color="outline-secondary" onClick={() => navigateToPath('/schedule')} disabled>
                  <Calendar size={16} className="me-2" />
                  Schedule (Soon)
                </Button>
                <Button color="outline-info" onClick={() => navigateToPath('/profile')}>
                  <User size={16} className="me-2" />
                  Edit Profile
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Request Attempts Modal */}
      <Modal isOpen={showRequestModal} toggle={() => setShowRequestModal(false)}>
        <ModalHeader toggle={() => setShowRequestModal(false)}>
          Request Additional Attempts
        </ModalHeader>
        <ModalBody>
          {selectedTest && (
            <div className="mb-3">
              <h6>{selectedTest.title}</h6>
              <p className="text-muted small">{selectedTest.description}</p>
              <div className="small">
                <span className="text-muted">Current attempts: </span>
                <span className={selectedTest.attempts.remaining > 0 ? 'text-success' : 'text-danger'}>
                  {selectedTest.attempts.used}/{selectedTest.attempts.total}
                </span>
              </div>
            </div>
          )}
          
          <div className="mb-3">
            <label className="form-label">Additional attempts needed</label>
            <Input
              type="select"
              value={requestForm.attempts}
              onChange={(e) => setRequestForm({ ...requestForm, attempts: parseInt(e.target.value) })}
            >
              <option value={1}>1 additional attempt</option>
              <option value={2}>2 additional attempts</option>
              <option value={3}>3 additional attempts</option>
            </Input>
          </div>

          <div className="mb-3">
            <label className="form-label">Reason for request *</label>
            <Input
              type="textarea"
              rows={3}
              placeholder="Please explain why you need additional attempts..."
              value={requestForm.reason}
              onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
            />
          </div>

          <Alert color="info" className="small mb-0">
            <AlertCircle size={16} className="me-2" />
            Your request will be reviewed by an instructor. You'll be notified of the decision.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowRequestModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleRequestAttempts}>
            Submit Request
          </Button>
        </ModalFooter>
      </Modal>

      {/* Error Alert */}
      {error && (
        <Alert color="danger" className="position-fixed" style={{ top: '20px', right: '20px', zIndex: 1050 }}>
          <AlertCircle size={16} className="me-2" />
          {error}
        </Alert>
      )}
    </Container>
  );
}