import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Alert,
  Spinner,
  Progress,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import {
  ArrowLeft,
  Clock,
  FileText,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Info,
  Award,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import type { Test, TestSession, TestType, Language, Tags } from '../types';

const TestDetailsPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [test, setTest] = useState<Test | null>(null);
  const [previousAttempts, setPreviousAttempts] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);

  // Fetch test details and user's previous attempts
  useEffect(() => {
    if (testId) {
      fetchTestDetails();
    }
  }, [testId]);

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get test details
      const testResponse = await apiService.getTest(testId!);
      if (testResponse.error) {
        throw new Error(testResponse.message || 'Failed to fetch test');
      }

      setTest(testResponse.data!);

      // Get user's previous attempts
      const sessionsResponse = await apiService.getAllTestSessions({ 
        testId: testId!,
        userId: user?.id 
      });
      
      if (sessionsResponse.error) {
        console.warn('Could not fetch previous attempts:', sessionsResponse.message);
      } else {
        setPreviousAttempts(sessionsResponse.data || []);
      }

    } catch (err: any) {
      console.error('Error fetching test details:', err);
      setError(err.message || 'Failed to load test details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    try {
      setStarting(true);
      setError(null);

      const response = await apiService.startTestSession({ testId: testId! });
      
      if (response.error) {
        throw new Error(response.message || 'Failed to start test session');
      }

      // Navigate to test session
      navigate(`/test-session/${response.data?.id}`);

    } catch (err: any) {
      console.error('Start test error:', err);
      setError(err.message || 'Failed to start test');
      setStarting(false);
    }
  };

  const getTestTypeIcon = (testType: TestType) => {
    const icons = {
      frontend_basics: '🌐',
      react_developer: '⚛️',
      fullstack_js: '🔧',
      mobile_development: '📱',
      python_developer: '🐍',
      custom: '📝'
    };
    return icons[testType] || '📝';
  };

  const getTestTypeColor = (testType: TestType): string => {
    const colors = {
      frontend_basics: 'primary',
      react_developer: 'info',
      fullstack_js: 'success',
      mobile_development: 'warning',
      python_developer: 'secondary',
      custom: 'dark'
    };
    return colors[testType] || 'secondary';
  };

  const formatLanguages = (languages: Language[]): string => {
    return languages.length > 0 ? languages.join(', ') : 'General';
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateTotalQuestions = (test: Test): number => {
    if (test.settings.useSections && test.sections) {
      return test.sections.reduce((total, section) => total + section.questions.length, 0);
    }
    return test.questions?.length || 0;
  };

  const calculateTotalPoints = (test: Test): number => {
    if (test.settings.useSections && test.sections) {
      return test.sections.reduce((total, section) => 
        total + section.questions.reduce((sectionTotal, q) => sectionTotal + q.points, 0), 0
      );
    }
    return test.questions?.reduce((total, q) => total + q.points, 0) || 0;
  };

  const canStartTest = (): boolean => {
    if (!test) return false;
    return previousAttempts.length < test.settings.attemptsAllowed;
  };

  const getAttemptStatus = (attempt: TestSession) => {
    switch (attempt.status) {
      case 'completed':
        return { color: 'success', icon: CheckCircle, text: 'Completed' };
      case 'abandoned':
        return { color: 'warning', icon: XCircle, text: 'Abandoned' };
      case 'expired':
        return { color: 'danger', icon: Clock, text: 'Expired' };
      case 'inProgress':
        return { color: 'info', icon: Play, text: 'In Progress' };
      default:
        return { color: 'secondary', icon: Info, text: 'Unknown' };
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">Loading test details...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error || !test) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert color="danger">
              <AlertTriangle size={20} className="me-2" />
              <strong>Error:</strong> {error || 'Test not found'}
            </Alert>
            <Button color="secondary" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={16} className="me-1" />
              Back to Dashboard
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <Button 
              color="outline-secondary" 
              className="me-3"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h3 className="mb-1">Test Details</h3>
              <p className="text-muted mb-0">Review the test information before starting</p>
            </div>
          </div>

          {error && (
            <Alert color="danger" className="mb-4">
              <AlertTriangle size={16} className="me-2" />
              {error}
            </Alert>
          )}

          {/* Test Overview Card */}
          <Card className="shadow-sm border-0 mb-4">
            <CardHeader className="bg-white">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h4 className="mb-2 d-flex align-items-center">
                    <span className="me-2">{getTestTypeIcon(test.testType)}</span>
                    {test.title}
                  </h4>
                  <div className="d-flex gap-2 mb-2">
                    <Badge color={getTestTypeColor(test.testType)}>
                      {test.testType.replace('_', ' ')}
                    </Badge>
                    <Badge color="outline-secondary">
                      {test.isGlobal ? 'Global Test' : 'Organization Test'}
                    </Badge>
                  </div>
                </div>
                <Badge 
                  color={test.status === 'active' ? 'success' : 'secondary'}
                  className="fs-6"
                >
                  {test.status}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <p className="mb-4">{test.description}</p>

              {/* Test Statistics Grid */}
              <Row className="g-3 mb-4">
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <FileText size={24} className="text-primary mb-2" />
                    <div className="fw-bold">{calculateTotalQuestions(test)}</div>
                    <small className="text-muted">Questions</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <Clock size={24} className="text-warning mb-2" />
                    <div className="fw-bold">{formatDuration(test.settings.timeLimit)}</div>
                    <small className="text-muted">Time Limit</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <RotateCcw size={24} className="text-info mb-2" />
                    <div className="fw-bold">{test.settings.attemptsAllowed}</div>
                    <small className="text-muted">Attempts</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <Award size={24} className="text-success mb-2" />
                    <div className="fw-bold">{calculateTotalPoints(test)}</div>
                    <small className="text-muted">Total Points</small>
                  </div>
                </Col>
              </Row>

              {/* Additional Details */}
              <Row>
                <Col md={6}>
                  <h6>Languages/Technologies</h6>
                  <p className="text-muted">{formatLanguages(test.languages)}</p>
                </Col>
                <Col md={6}>
                  <h6>Question Shuffling</h6>
                  <p className="text-muted">
                    {test.settings.shuffleQuestions ? 'Enabled' : 'Disabled'}
                  </p>
                </Col>
              </Row>

              {/* Section Breakdown */}
              {test.settings.useSections && test.sections && (
                <div className="mt-4">
                  <h6>Test Sections</h6>
                  <div className="row g-2">
                    {test.sections.map((section, index) => (
                      <div key={index} className="col-md-6">
                        <div className="border rounded p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <div className="fw-medium">{section.name}</div>
                              <small className="text-muted">
                                {section.questions.length} questions • {formatDuration(section.timeLimit)}
                              </small>
                            </div>
                            <Badge color="outline-primary">
                              {section.questions.reduce((sum, q) => sum + q.points, 0)} pts
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Previous Attempts */}
          {previousAttempts.length > 0 && (
            <Card className="shadow-sm border-0 mb-4">
              <CardHeader className="bg-white">
                <h5 className="mb-0">Your Previous Attempts</h5>
              </CardHeader>
              <CardBody>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Attempt</th>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Date</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previousAttempts.map((attempt) => {
                        const status = getAttemptStatus(attempt);
                        const StatusIcon = status.icon;
                        return (
                          <tr key={attempt.id}>
                            <td>#{attempt.attemptNumber}</td>
                            <td>
                              <Badge color={status.color} className="d-flex align-items-center w-fit">
                                <StatusIcon size={12} className="me-1" />
                                {status.text}
                              </Badge>
                            </td>
                            <td>
                              {attempt.score.earnedPoints}/{attempt.score.totalPoints}
                              {attempt.status === 'completed' && (
                                <span className={`ms-2 ${attempt.score.passed ? 'text-success' : 'text-danger'}`}>
                                  ({attempt.score.passed ? 'Pass' : 'Fail'})
                                </span>
                              )}
                            </td>
                            <td>
                              {new Date(attempt.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              {attempt.timeSpent ? formatDuration(Math.floor(attempt.timeSpent / 60)) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Start Test Section */}
          <Card className="shadow-sm border-0">
            <CardBody className="text-center">
              {canStartTest() ? (
                <>
                  <Target size={48} className="text-primary mb-3" />
                  <h5>Ready to Start?</h5>
                  <p className="text-muted mb-4">
                    Attempt {previousAttempts.length + 1} of {test.settings.attemptsAllowed}
                  </p>
                  <Button 
                    color="primary" 
                    size="lg"
                    onClick={() => setShowStartModal(true)}
                    disabled={starting}
                  >
                    {starting ? <Spinner size="sm" className="me-2" /> : <Play size={16} className="me-2" />}
                    Start Test
                  </Button>
                </>
              ) : (
                <>
                  <XCircle size={48} className="text-danger mb-3" />
                  <h5>Maximum Attempts Reached</h5>
                  <p className="text-muted mb-4">
                    You have used all {test.settings.attemptsAllowed} attempts for this test.
                  </p>
                  <Button color="secondary" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                  </Button>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Start Confirmation Modal */}
      <Modal isOpen={showStartModal} toggle={() => !starting && setShowStartModal(false)}>
        <ModalHeader toggle={() => !starting && setShowStartModal(false)}>
          Start Test Confirmation
        </ModalHeader>
        <ModalBody>
          <div className="text-center mb-3">
            <AlertTriangle size={48} className="text-warning mb-3" />
          </div>
          <p><strong>Important:</strong> Once you start this test, the timer will begin immediately.</p>
          <ul className="list-unstyled">
            <li>✓ You have <strong>{formatDuration(test.settings.timeLimit)}</strong> to complete the test</li>
            <li>✓ Your progress will be auto-saved every 30 seconds</li>
            <li>✓ You can navigate between questions freely</li>
            <li>✓ Make sure you have a stable internet connection</li>
          </ul>
          <Alert color="info" className="mt-3 mb-0">
            <Info size={16} className="me-2" />
            This is attempt {previousAttempts.length + 1} of {test.settings.attemptsAllowed}.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="secondary" 
            onClick={() => setShowStartModal(false)}
            disabled={starting}
          >
            Cancel
          </Button>
          <Button 
            color="primary" 
            onClick={handleStartTest}
            disabled={starting}
          >
            {starting ? <Spinner size="sm" className="me-2" /> : <Play size={16} className="me-2" />}
            {starting ? 'Starting...' : 'Start Test Now'}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default TestDetailsPage;