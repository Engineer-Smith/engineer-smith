// Dashboard.tsx - Updated with consolidated RecentActivity component
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import { useSocketConnection, useSocketSession } from '../context/SocketContext';
import { useTestSession } from '../context/TestSessionContext';
import apiService from '../services/ApiService';
import type { Test, TestSession, Result } from '../types';

// Import the separated components
import { DashboardHeader } from '../components/Dashboard/DashboardHeader';
import { StatsCards } from '../components/Dashboard/StatsCards';
import { AvailableTests } from '../components/Dashboard/AvailableTests';
import { RecentActivity } from '../components/Dashboard/RecentActivity'; // UPDATED: Single consolidated component

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Socket and session contexts
  const { isConnected, connectionMessage, networkStatus } = useSocketConnection();
  const { currentSessionId } = useSocketSession();
  const {
    state: sessionState,
    checkExistingSession,
    rejoinSession,
    timerDisplay,
    networkStatus: sessionNetworkStatus,
    connectionStatus: sessionConnectionStatus
  } = useTestSession();

  // Dashboard data state
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [recentSessions, setRecentSessions] = useState<TestSession[]>([]);
  const [myResults, setMyResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTests: 0,
    completedTests: 0,
    passedTests: 0,
    averageScore: 0
  });

  // Session detection and modal state
  const [showActiveSessionModal, setShowActiveSessionModal] = useState(false);
  const [showRejoinModal, setShowRejoinModal] = useState(false);
  const [pendingTestId, setPendingTestId] = useState<string | null>(null);
  const [sessionCheckResult, setSessionCheckResult] = useState<any>(null);

  // Request tracking to prevent duplicate calls
  const isRequestInProgress = useRef(false);
  const hasDataLoaded = useRef(false);

  // Load dashboard data on mount
  useEffect(() => {
    if (!hasDataLoaded.current && !isRequestInProgress.current) {
      fetchDashboardData();
    }
  }, []);

  // Check for existing sessions periodically
  useEffect(() => {
    checkForExistingSessionOnServer();

    // Check every 30 seconds for session changes
    const intervalId = setInterval(() => {
      if (!showRejoinModal && !showActiveSessionModal) {
        checkForExistingSessionOnServer();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    if (isRequestInProgress.current) return;

    isRequestInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      // Fetch available tests
      const tests = await apiService.getAllTests({ status: 'active' });
      if (!Array.isArray(tests)) {
        throw new Error('Failed to fetch tests');
      }

      // Fetch recent sessions
      const sessions = await apiService.getAllTestSessions({
        userId: user?._id,
        limit: 10
      });
      if (!Array.isArray(sessions)) {
        throw new Error('Failed to fetch sessions');
      }

      // Fetch results
      const results = await apiService.getAllResults({
        userId: user?._id,
        limit: 10
      });
      if (!Array.isArray(results)) {
        throw new Error('Failed to fetch results');
      }

      // Update state
      setAvailableTests(tests);
      setRecentSessions(sessions);
      setMyResults(results);

      // Calculate stats from sessions instead of results for better accuracy
      const completedSessions = sessions.filter((s: TestSession) => s.status === 'completed');
      const passedSessions = completedSessions.filter((s: TestSession) => s.finalScore?.passed);
      const avgScore = completedSessions.length > 0
        ? completedSessions.reduce((sum: number, s: TestSession) => sum + (s.finalScore?.percentage || 0), 0) / completedSessions.length
        : 0;

      setStats({
        totalTests: tests.length,
        completedTests: completedSessions.length,
        passedTests: passedSessions.length,
        averageScore: Math.round(avgScore * 10) / 10 // Round to 1 decimal
      });

      hasDataLoaded.current = true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      isRequestInProgress.current = false;
    }
  };

  // Check server for existing sessions
  const checkForExistingSessionOnServer = async () => {
    try {
      console.log('Checking server for existing session...');
      const result = await checkExistingSession();
      console.log('Session check result:', result);

      if (result.success && result.canRejoin && result.sessionId) {
        console.log('Found rejoinable session');
        setSessionCheckResult(result);

        // Only show modal if not already showing one
        if (!showRejoinModal && !showActiveSessionModal) {
          setShowRejoinModal(true);
        }
      } else {
        // Clear stale results
        if (sessionCheckResult && !result.canRejoin) {
          setSessionCheckResult(null);
        }

        if (result.recentlyCompleted || result.wasExpired) {
          refreshDashboard();
        }
      }

    } catch (error) {
      console.log('Session check failed:', error);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    hasDataLoaded.current = false;
    fetchDashboardData();
  };

  // Format time display with fallback handling
  const formatTimeDisplay = (timeRemaining: number, isValid: boolean = true): string => {
    if (!isValid && timeRemaining === 0) {
      return 'Syncing...';
    }

    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get comprehensive session status
  const getSessionStatus = () => {
    const hasValidTimer = timerDisplay.isActive && timerDisplay.timeRemaining > 0;
    const fallbackTime = sessionCheckResult?.timeRemaining || 0; // REMOVED: sessionState.timeRemaining

    return {
      // Status indicators
      isCompleted: sessionState.isCompleted,
      isPaused: timerDisplay.isPaused || !networkStatus.isOnline,
      isConnected: sessionConnectionStatus.isConnected,

      // Timer data - use timerDisplay directly
      timeRemaining: hasValidTimer ? timerDisplay.timeRemaining : fallbackTime,
      hasValidTimer,
      isTimerSynced: hasValidTimer || !sessionState.sessionId,

      // Session data (prefer context, fallback to server result)
      sessionId: sessionState.sessionId || sessionCheckResult?.sessionId,
      sessionInfo: sessionState.sessionInfo || sessionCheckResult?.testInfo,
      questionIndex: sessionState.questionState?.questionIndex ?? sessionCheckResult?.testInfo?.currentQuestionIndex ?? 0,

      // Computed status
      status: sessionState.isCompleted ? 'completed' :
        (timerDisplay.isPaused || !networkStatus.isOnline) ? 'paused' : 'inProgress'
    };
  };
  // Check if we should show the active session banner
  const shouldShowSessionBanner = () => {
    const contextHasActiveSession = sessionState.sessionId && sessionState.initialized && !sessionState.isCompleted;
    const serverHasActiveSession = sessionCheckResult?.canRejoin && sessionCheckResult?.sessionId;

    return contextHasActiveSession || serverHasActiveSession;
  };

  // Handle starting a new test
  const handleStartTest = async (testId: string) => {
    try {
      const existingCheck = await checkExistingSession();
      if (existingCheck.canRejoin) {
        setPendingTestId(testId);
        setSessionCheckResult(existingCheck);
        setShowActiveSessionModal(true);
        return;
      }
    } catch (error) {
      // No existing session, proceed normally
    }

    navigate(`/test-details/${testId}`);
  };

  // Handle resuming a session
  const handleResumeSession = async () => {
    if (!sessionCheckResult?.sessionId) return;

    try {
      setLoading(true);
      await rejoinSession(sessionCheckResult.sessionId);

      setShowRejoinModal(false);
      setShowActiveSessionModal(false);
      navigate(`/test-session/${sessionCheckResult.sessionId}`);

    } catch (error) {
      setError('Failed to rejoin session. Please try again.');
      setLoading(false);
    }
  };

  // Handle abandoning current session and starting new
  const handleAbandonAndStartNew = async () => {
    if (!sessionCheckResult?.sessionId || !pendingTestId) return;

    try {
      setLoading(true);

      const response = await apiService.startTestSession({
        testId: pendingTestId,
        forceNew: true
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to start new session');
      }

      setShowActiveSessionModal(false);
      setSessionCheckResult(null);
      setPendingTestId(null);

      await refreshDashboard();
      navigate(`/test-session/${response.session?.sessionId}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start new session');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '80px' }}>
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <Spinner color="primary" size="lg" />
            <p className="mt-3 text-muted">Loading your dashboard...</p>
          </div>
        </Container>
      </div>
    );
  }

  const sessionStatus = getSessionStatus();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '80px' }}>
      <Container>
        <Row>
          <Col lg={12}>
            <DashboardHeader user={user} onLogout={handleLogout} />

            {/* Connection Status Alert */}
            {connectionMessage && (
              <Alert color={connectionMessage.type} className="mb-4">
                <i className={`fas fa-${connectionMessage.icon} me-2`}></i>
                {connectionMessage.message}
                {!isConnected && (
                  <Button size="sm" color={connectionMessage.type} className="ms-2" onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                )}
              </Alert>
            )}

            {/* Active Session Banner */}
            {shouldShowSessionBanner() && (
              <Alert color={
                sessionStatus.isPaused ? "warning" :
                  sessionStatus.timeRemaining <= 300 ? "danger" : "info"
              } className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="alert-heading mb-2">
                      <i className={`fas fa-${sessionStatus.isPaused ? 'pause-circle' : 'play-circle'} me-2`}></i>
                      {sessionStatus.isPaused ? 'Paused Test Session' : 'Active Test Session'}
                    </h5>

                    {/* Session info */}
                    {sessionStatus.sessionInfo && (
                      <div className="mb-2">
                        <strong>{sessionStatus.sessionInfo.title}</strong>
                        <br />
                        <small className="text-muted">
                          Question {sessionStatus.questionIndex + 1} of {sessionStatus.sessionInfo.totalQuestions}
                        </small>
                      </div>
                    )}

                    {/* Status badges */}
                    <div className="mb-2">
                      <Badge color={sessionStatus.isPaused ? 'warning' : 'primary'} className="me-2">
                        Status: {sessionStatus.status}
                      </Badge>

                      <Badge color={sessionStatus.isConnected ? 'success' : 'danger'} className="me-2">
                        {sessionStatus.isConnected ? 'Connected' : 'Disconnected'}
                      </Badge>

                      {!sessionStatus.isTimerSynced && (
                        <Badge color="warning" className="me-2">
                          Timer Syncing...
                        </Badge>
                      )}
                    </div>

                    {/* Timer display */}
                    <div className="mb-2">
                      <span className={`fw-bold ${!sessionStatus.hasValidTimer ? 'text-muted' :
                          sessionStatus.timeRemaining <= 60 ? 'text-danger' :
                            sessionStatus.timeRemaining <= 300 ? 'text-warning' : 'text-info'
                        }`}>
                        <i className="fas fa-clock me-1"></i>
                        Time Remaining: {formatTimeDisplay(sessionStatus.timeRemaining, sessionStatus.hasValidTimer)}
                      </span>

                      {sessionStatus.isPaused && (
                        <span className="text-warning ms-2">(PAUSED)</span>
                      )}

                      {!sessionStatus.isTimerSynced && (
                        <Spinner size="sm" className="ms-2" />
                      )}
                    </div>

                    {/* Network warnings */}
                    {!networkStatus.isOnline && (
                      <div className="mb-2">
                        <Badge color="warning">
                          <i className="fas fa-wifi me-1"></i>
                          Offline - Timer paused
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Action button */}
                  <div>
                    <Button
                      color={sessionStatus.timeRemaining <= 300 ? "danger" : sessionStatus.isPaused ? "warning" : "info"}
                      onClick={() => navigate(`/test-session/${sessionStatus.sessionId}`)}
                    >
                      <i className={`fas fa-${sessionStatus.isPaused ? 'play' : 'arrow-right'} me-2`}></i>
                      {sessionStatus.isPaused ? 'Resume Test' :
                        sessionStatus.timeRemaining <= 300 ? 'Continue NOW!' : 'Continue Test'}
                    </Button>
                  </div>
                </div>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert color="danger" className="mb-4">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
                <div className="mt-2">
                  <Button color="danger" size="sm" onClick={refreshDashboard}>
                    <i className="fas fa-redo me-2"></i>
                    Retry
                  </Button>
                </div>
              </Alert>
            )}
          </Col>
        </Row>

        {/* Dashboard Content */}
        <StatsCards stats={stats} />

        <Row className="mb-5">
          <Col lg={12}>
            <AvailableTests
              tests={availableTests}
              onStartTest={handleStartTest}
              loading={loading}
            />
          </Col>
        </Row>

        {/* UPDATED: Single RecentActivity component instead of two separate components */}
        <Row>
          <Col lg={12}>
            <RecentActivity sessions={recentSessions} />
          </Col>
        </Row>

        {/* Active Session Conflict Modal */}
        <Modal isOpen={showActiveSessionModal} toggle={() => setShowActiveSessionModal(false)}>
          <ModalHeader toggle={() => setShowActiveSessionModal(false)}>
            Active Test Session Found
          </ModalHeader>
          <ModalBody>
            <div className="text-center mb-3">
              <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
            </div>
            <p className="text-center">
              You have an active test session that can be resumed.
            </p>
            {sessionCheckResult?.testInfo && (
              <div className="text-center mb-3">
                <strong>{sessionCheckResult.testInfo.title}</strong>
                <br />
                <small className="text-muted">
                  Progress: {sessionCheckResult.testInfo.answeredQuestions}/{sessionCheckResult.testInfo.totalQuestions} questions
                </small>
                <br />
                <small className="text-info">
                  Time Remaining: {sessionCheckResult.timeRemaining ?
                    formatTimeDisplay(sessionCheckResult.timeRemaining, true) :
                    'Loading...'
                  }
                </small>
              </div>
            )}
            <p className="text-center text-muted">
              Would you like to resume your current test or start a new one?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowActiveSessionModal(false)}>
              Cancel
            </Button>
            <Button color="info" onClick={handleResumeSession}>
              <i className="fas fa-play me-2"></i>
              Resume Current Test
            </Button>
            <Button color="warning" onClick={handleAbandonAndStartNew}>
              <i className="fas fa-plus me-2"></i>
              Start New Test
            </Button>
          </ModalFooter>
        </Modal>

        {/* Rejoin Session Modal */}
        <Modal isOpen={showRejoinModal} toggle={() => setShowRejoinModal(false)}>
          <ModalHeader toggle={() => setShowRejoinModal(false)}>
            {sessionStatus.isPaused ? 'Resume Paused Session?' : 'Resume Test Session?'}
          </ModalHeader>
          <ModalBody>
            <div className="text-center mb-3">
              <i className={`fas fa-${sessionStatus.isPaused ? 'pause-circle text-warning' : 'play-circle text-info'}`} style={{ fontSize: '3rem' }}></i>
            </div>
            {sessionCheckResult?.testInfo && (
              <div className="text-center">
                <p>You have {sessionStatus.isPaused ? 'a paused' : 'an active'} test session for:</p>
                <h5>{sessionCheckResult.testInfo.title}</h5>
                <div className="mb-3">
                  <Badge color="primary" className="me-2">
                    {sessionCheckResult.testInfo.answeredQuestions}/{sessionCheckResult.testInfo.totalQuestions} questions answered
                  </Badge>
                  <Badge color={sessionStatus.isPaused ? 'warning' : 'info'}>
                    {sessionCheckResult.timeRemaining ?
                      formatTimeDisplay(sessionCheckResult.timeRemaining, true) :
                      'Loading...'
                    } remaining
                  </Badge>
                  {sessionStatus.isPaused && (
                    <Badge color="warning" className="ms-2">PAUSED</Badge>
                  )}
                </div>
                <p className="text-muted">
                  {sessionStatus.isPaused
                    ? 'Your session was paused. You can continue where you left off.'
                    : 'You can continue where you left off.'
                  }
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowRejoinModal(false)}>
              Not Now
            </Button>
            <Button color={sessionStatus.isPaused ? 'warning' : 'primary'} onClick={handleResumeSession}>
              <i className="fas fa-play me-2"></i>
              {sessionStatus.isPaused ? 'Resume Session' : 'Continue Test'}
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default Dashboard;