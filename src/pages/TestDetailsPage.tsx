// src/pages/TestDetailsPage.tsx - CORRECTED to handle session conflicts properly
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Clock,
  FileText,
  Info,
  Play,
  RotateCcw,
  Target
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
  Row,
  Spinner
} from 'reactstrap';
import apiService from '../services/ApiService';
import type { Language, Test, TestType } from '../types';


const TestDetailsPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);

  // ADDED: Session conflict handling
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [existingSession, setExistingSession] = useState<any>(null);
  const [conflictLoading, setConflictLoading] = useState(false);

  // Fetch test details on mount
  useEffect(() => {
    if (testId) {
      fetchTestDetails();
    } else {
      setError('No test ID provided');
      setLoading(false);
    }
  }, [testId]);

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // FIXED: getTest() returns Test directly, no .data wrapper
      const test = await apiService.getTest(testId!);

      if (!test || !test._id) {
        throw new Error('Invalid test data received');
      }

      setTest(test);

    } catch (err: any) {
      console.error('Error fetching test details:', err);
      setError(err.message || 'Failed to load test details');
    } finally {
      setLoading(false);
    }
  };

  // CORRECTED: Handle session conflicts properly
  const handleStartTest = async (forceNew = false) => {
    if (!testId) {
      setError('No test ID available');
      return;
    }

    try {
      setStarting(true);
      setError(null);

      // CORRECTED: Use proper API call structure
      const response = await apiService.startTestSession({
        testId,
        forceNew
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to start test session');
      }

      // FIXED: Navigate using TEST ID, not session ID
      navigate(`/test-session/${testId}`);

    } catch (err: any) {
      console.error('Failed to start test session:', err);

      // CORRECTED: Handle session conflict errors properly
      if (err.code === 'EXISTING_SESSION_FOUND' && err.existingSession) {
        setExistingSession(err.existingSession);
        setShowConflictModal(true);
        setShowStartModal(false);
      } else {
        setError(err.message || 'Failed to start test session');
        setShowStartModal(false);
      }
      setStarting(false);
    }
  };

  // ADDED: Handle existing session rejoin
  const handleRejoinSession = async () => {
    if (!existingSession?.sessionId || !testId) return;

    try {
      setConflictLoading(true);

      // Navigate to test session page with TEST ID
      navigate(`/test-session/${testId}`);

    } catch (err: any) {
      console.error('Failed to rejoin session:', err);
      setError(err.message || 'Failed to rejoin session');
    } finally {
      setConflictLoading(false);
      setShowConflictModal(false);
    }
  };

  // ADDED: Handle abandoning existing session
  const handleAbandonAndStartNew = async () => {
    try {
      setConflictLoading(true);

      // Close conflict modal and start new session
      setShowConflictModal(false);
      setShowStartModal(false);

      await handleStartTest(true); // forceNew = true

    } catch (err: any) {
      console.error('Failed to start new session:', err);
      setError(err.message || 'Failed to start new session');
      setConflictLoading(false);
    }
  };

  // Helper functions
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
    return languages && languages.length > 0 ? languages.join(', ') : 'General';
  };

  const formatDuration = (minutes: number): string => {
    if (typeof minutes !== 'number' || isNaN(minutes)) {
      return '0m';
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // CORRECTED: Format time remaining for existing sessions
  const formatTimeRemaining = (seconds: number): string => {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds <= 0) {
      return '0m';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // FIXED: Safe calculation functions to prevent NaN
  const calculateTotalQuestions = (test: Test): number => {
    if (!test) return 0;

    if (test.settings?.useSections && test.sections && Array.isArray(test.sections)) {
      return test.sections.reduce((total, section) => {
        const sectionQuestions = section?.questions?.length || 0;
        return total + sectionQuestions;
      }, 0);
    }

    return test.questions?.length || 0;
  };

  const calculateTotalPoints = (test: Test): number => {
    if (!test) return 0;

    if (test.settings?.useSections && test.sections && Array.isArray(test.sections)) {
      return test.sections.reduce((total, section) => {
        if (!section?.questions || !Array.isArray(section.questions)) return total;

        const sectionPoints = section.questions.reduce((sectionTotal, q) => {
          const questionPoints = typeof q?.points === 'number' ? q.points : 0;
          return sectionTotal + questionPoints;
        }, 0);

        return total + sectionPoints;
      }, 0);
    }

    if (!test.questions || !Array.isArray(test.questions)) return 0;

    return test.questions.reduce((total, q) => {
      const questionPoints = typeof q?.points === 'number' ? q.points : 0;
      return total + questionPoints;
    }, 0);
  };

  // Loading state
  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" size="lg" className="mb-3" />
            <p className="text-muted">Loading test details...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  // Error state
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
                    <div className="fw-bold">{formatDuration(test.settings?.timeLimit || 0)}</div>
                    <small className="text-muted">Time Limit</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <RotateCcw size={24} className="text-info mb-2" />
                    <div className="fw-bold">{test.settings?.attemptsAllowed || 0}</div>
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
                    {test.settings?.shuffleQuestions ? 'Enabled' : 'Disabled'}
                  </p>
                </Col>
              </Row>

              {/* Section Breakdown */}
              {test.settings?.useSections && test.sections && Array.isArray(test.sections) && (
                <div className="mt-4">
                  <h6>Test Sections</h6>
                  <div className="row g-2">
                    {test.sections.map((section, index) => (
                      <div key={index} className="col-md-6">
                        <div className="border rounded p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <div className="fw-medium">{section?.name || `Section ${index + 1}`}</div>
                              <small className="text-muted">
                                {section?.questions?.length || 0} questions • {formatDuration(section?.timeLimit || 0)}
                              </small>
                            </div>
                            <Badge color="outline-primary">
                              {section?.questions?.reduce((sum, q) => sum + (q?.points || 0), 0) || 0} pts
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

          {/* Start Test Section */}
          <Card className="shadow-sm border-0">
            <CardBody className="text-center">
              <Target size={48} className="text-primary mb-3" />
              <h5>Ready to Start?</h5>
              <p className="text-muted mb-4">
                Click below to begin your test session. The timer will start immediately.
              </p>
              <Button
                color="primary"
                size="lg"
                onClick={() => setShowStartModal(true)}
                disabled={starting || test.status !== 'active'}
              >
                {starting ? <Spinner size="sm" className="me-2" /> : <Play size={16} className="me-2" />}
                Start Test
              </Button>
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
            <li>✓ You have <strong>{formatDuration(test.settings?.timeLimit || 0)}</strong> to complete the test</li>
            <li>✓ Your progress will be auto-saved</li>
            <li>✓ You can navigate between questions</li>
            <li>✓ Make sure you have a stable internet connection</li>
          </ul>
          <Alert color="info" className="mt-3 mb-0">
            <Info size={16} className="me-2" />
            This test has {test.settings?.attemptsAllowed || 0} attempt(s) allowed.
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
            onClick={() => handleStartTest(false)}
            disabled={starting}
          >
            {starting ? <Spinner size="sm" className="me-2" /> : <Play size={16} className="me-2" />}
            {starting ? 'Starting...' : 'Start Test Now'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ADDED: Session Conflict Modal */}
      <Modal isOpen={showConflictModal} toggle={() => !conflictLoading && setShowConflictModal(false)}>
        <ModalHeader toggle={() => !conflictLoading && setShowConflictModal(false)}>
          Existing Session Found
        </ModalHeader>
        <ModalBody>
          <div className="text-center mb-3">
            <Clock size={48} className="text-info mb-3" />
          </div>
          <p><strong>You have an active test session in progress.</strong></p>

          {existingSession && (
            <div className="bg-light p-3 rounded mb-3">
              <div className="small text-muted mb-1">Test:</div>
              <div className="fw-medium mb-2">{existingSession.testTitle}</div>

              <div className="small text-muted mb-1">Progress:</div>
              <div className="mb-2">{existingSession.questionProgress}</div>

              {existingSession.timeRemaining > 0 && (
                <>
                  <div className="small text-muted mb-1">Time Remaining:</div>
                  <div className="text-warning fw-medium">{formatTimeRemaining(existingSession.timeRemaining)}</div>
                </>
              )}
            </div>
          )}

          <p className="mb-0">You can either continue your existing session or start a new one (which will abandon your current progress).</p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setShowConflictModal(false)}
            disabled={conflictLoading}
          >
            Cancel
          </Button>
          <Button
            color="warning"
            onClick={handleAbandonAndStartNew}
            disabled={conflictLoading}
          >
            {conflictLoading ? <Spinner size="sm" className="me-2" /> : null}
            Start Fresh
          </Button>
          <Button
            color="primary"
            onClick={handleRejoinSession}
            disabled={conflictLoading}
          >
            {conflictLoading ? <Spinner size="sm" className="me-2" /> : null}
            Continue Session
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default TestDetailsPage;