// TestSessionPage.tsx - Complete implementation with proper abandon functionality
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner, Button, Badge, Progress } from 'reactstrap';
import { AlertTriangle, Clock, WifiOff, Menu, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { useTestSession } from '../context/TestSessionContext';
import QuestionLayoutManager from '../components/TestSessions/QuestionLayoutManager';
import QuestionOverviewModal from '../components/TestSessions/QuestionOverviewModal';

// Browser navigation protection hook
const useTestSessionNavigation = (sessionId: string | null, hasUnsavedChanges: boolean = false) => {
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isLeavingRef.current) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    const handleUnload = () => {
      if (!isLeavingRef.current) {
        isLeavingRef.current = true;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload, { passive: false });
    window.addEventListener('unload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [sessionId, hasUnsavedChanges]);

  const manualLeave = useCallback(() => {
    if (sessionId && !isLeavingRef.current) {
      isLeavingRef.current = true;
    }
  }, [sessionId]);

  return { manualLeave };
};

// Connection status alert component
const ConnectionStatus: React.FC<{ isOnline: boolean }> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <Alert color="danger" className="mb-3">
      <WifiOff size={20} className="me-2" />
      <strong>No Internet Connection:</strong> You are offline. Your session will be paused until you reconnect.
    </Alert>
  );
};

// Session restoration alert component
const SessionRestorationAlert: React.FC<{
  show: boolean;
  onRejoin: () => void;
  onNewSession: () => void;
  loading?: boolean;
  sessionData?: any;
}> = ({ show, onRejoin, onNewSession, loading = false, sessionData }) => {
  if (!show) return null;

  return (
    <Alert color="info" className="mb-3">
      <Clock size={20} className="me-2" />
      <strong>Existing Session Found:</strong> You have an active test session that can be resumed.
      {sessionData && (
        <div className="mt-2 mb-2">
          <small className="text-muted">
            Test: {sessionData.testTitle} • Progress: {sessionData.currentQuestionIndex + 1} of {sessionData.totalQuestions}
          </small>
        </div>
      )}
      <div className="mt-2">
        <Button
          color="primary"
          size="sm"
          onClick={onRejoin}
          className="me-2"
          disabled={loading}
        >
          {loading ? <Spinner size="sm" className="me-1" /> : null}
          Resume Session
        </Button>
        <Button
          color="secondary"
          size="sm"
          onClick={onNewSession}
          disabled={loading}
        >
          Start Fresh
        </Button>
      </div>
    </Alert>
  );
};

const TestSessionContent: React.FC = React.memo(() => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get everything we need from test session context
  const {
    state,
    startSession,
    rejoinSession,
    updateAnswer,
    submitAnswer,
    skipQuestion,
    submitTest,
    abandonTest,
    resetSession,
    timerDisplay,
    networkStatus,
    connectionStatus
  } = useTestSession();

  // Local UI state
  const [initializationState, setInitializationState] = useState<'idle' | 'starting' | 'completed' | 'error'>('idle');
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [showRestorationAlert, setShowRestorationAlert] = useState(false);
  const [restorationLoading, setRestorationLoading] = useState(false);
  const [existingSessionData, setExistingSessionData] = useState<any>(null);

  // Refs for state management
  const initializationAttempted = useRef(false);
  const mountedRef = useRef(true);

  // Navigation protection hook
  const { manualLeave } = useTestSessionNavigation(
    state.sessionId,
    state.hasUnsavedChanges
  );

  // Component mount/unmount tracking
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Main initialization effect
  useEffect(() => {
    // Guard conditions
    if (!testId || !user || user.role !== 'student') {
      return;
    }

    if (initializationState !== 'idle' || initializationAttempted.current) {
      return;
    }

    // Mark as attempting initialization
    initializationAttempted.current = true;
    setInitializationState('starting');

    const performInitialization = async () => {
      try {
        // Start the session - backend handles existing session conflicts
        await startSession(testId);

        if (mountedRef.current) {
          setInitializationState('completed');
        }

      } catch (error: any) {
        // Handle session conflict
        if (error.type === 'EXISTING_SESSION_CONFLICT' && error.data && error.data.existingSession) {
          // Try auto-rejoin first
          try {
            const sessionId = error.data.existingSession.sessionId;
            await rejoinSession(sessionId);
            
            if (mountedRef.current) {
              setInitializationState('completed');
            }
            return;

          } catch (rejoinError: any) {
            // Auto-rejoin failed, show manual options
            setExistingSessionData(error.data.existingSession);
            setShowRestorationAlert(true);
            setInitializationState('completed');
            return;
          }
        }

        if (mountedRef.current) {
          setInitializationState('error');
        }
      }
    };

    // Use timeout to prevent blocking
    const timeoutId = setTimeout(performInitialization, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [testId, user?.role, startSession, rejoinSession]);

  // Session restoration handlers
  const handleRejoinSession = useCallback(async () => {
    if (!existingSessionData?.sessionId) return;

    setRestorationLoading(true);

    try {
      await rejoinSession(existingSessionData.sessionId);
      setShowRestorationAlert(false);
      setInitializationState('completed');
      toast.success('Successfully rejoined your test session!');
    } catch (error) {
      toast.error('Failed to rejoin session. Please try starting fresh.');
      setInitializationState('error');
    } finally {
      setRestorationLoading(false);
    }
  }, [existingSessionData?.sessionId, rejoinSession]);

  const handleNewSession = useCallback(async () => {
    if (!testId) return;

    setRestorationLoading(true);

    try {
      setShowRestorationAlert(false);
      await startSession(testId, true); // forceNew = true
      setInitializationState('completed');
      toast.info('Started fresh test session');
    } catch (error) {
      toast.error('Failed to start new session');
      setInitializationState('error');
    } finally {
      setRestorationLoading(false);
    }
  }, [testId, startSession]);

  // Abandon test handler - only for explicit button clicks with confirmation
  const handleAbandonTest = useCallback(async () => {
    try {
      // Show confirmation dialog for abandon action
      const confirmed = window.confirm(
        'Are you sure you want to abandon this test? Your progress will be lost and you cannot continue this attempt.'
      );
      
      if (!confirmed) {
        return; // User cancelled
      }

      manualLeave(); // Mark as manual leave for navigation protection
      await abandonTest(); // This handles server abandon + navigation
    } catch (error: any) {
      toast.error(error.message || 'Failed to abandon test');
    }
  }, [abandonTest, manualLeave]);

  // Safe navigation handler for disconnection scenarios - does NOT abandon
  const handleSafeNavigate = useCallback(() => {
    // This is for disconnection scenarios where we want to preserve the session
    // Just navigate without calling abandonTest - session remains active for rejoin
    manualLeave();
    navigate('/dashboard');
  }, [navigate, manualLeave]);

  const handleRetry = useCallback(() => {
    initializationAttempted.current = false;
    setInitializationState('idle');
    setShowRestorationAlert(false);
    setExistingSessionData(null);
  }, []);

  // Question handlers
  const handleSubmitAnswer = useCallback(async () => {
    try {
      await submitAnswer();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit answer');
    }
  }, [submitAnswer]);

  const handleSkipQuestion = useCallback(async () => {
    try {
      await skipQuestion();
    } catch (error: any) {
      toast.error(error.message || 'Failed to skip question');
    }
  }, [skipQuestion]);

  const handleSubmitTest = useCallback(async () => {
    try {
      await submitTest();
      toast.success('Test submitted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit test');
    }
  }, [submitTest]);

  // Computed values
  const overallProgressPercentage = state.sessionInfo?.totalQuestions
    ? (((state.questionState?.questionIndex ?? 0) + 1) / state.sessionInfo.totalQuestions) * 100
    : 0;
  const displayProgress = Math.round(overallProgressPercentage);

  const sectionInfo = useMemo(() => {
    const currentSection = state.navigationContext?.currentSection;
    if (!state.sessionInfo?.useSections || !currentSection) return null;

    return {
      name: currentSection.name || `Section ${currentSection.index + 1}`,
      current: currentSection.questionInSection || 1,
      total: currentSection.questionsInSection || 0,
      timeLimit: currentSection.timeLimit,
    };
  }, [state.navigationContext?.currentSection, state.sessionInfo?.useSections]);

  // State calculations
  const isLoading = initializationState === 'starting' || state.loading;
  const hasError = initializationState === 'error' || state.error;
  const isInitialized = initializationState === 'completed' && state.initialized;

  // LOADING STATE
  if (isLoading && !showRestorationAlert) {
    return (
      <Container className="py-5">
        <ToastContainer position="top-right" autoClose={3000} />
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" size="lg" className="mb-3" />
            <h5>
              {initializationState === 'starting' && 'Starting test session...'}
              {state.loading && 'Loading test session...'}
            </h5>
            <p className="text-muted">Please wait while we prepare your test.</p>
            <small className="text-muted">Test ID: {testId}</small>
          </Col>
        </Row>
      </Container>
    );
  }

  // ERROR STATE
  if (hasError && !showRestorationAlert) {
    return (
      <Container className="py-5">
        <ToastContainer position="top-right" autoClose={3000} />
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert color="danger">
              <AlertTriangle size={20} className="me-2" />
              <strong>Error Loading Session:</strong> {state.error || 'Failed to initialize session'}
            </Alert>
            <p className="text-muted mb-3">
              Test ID: <code>{testId}</code>
            </p>
            <div className="d-flex gap-2">
              <Button color="primary" onClick={handleRetry}>Retry</Button>
              <Button color="outline-danger" onClick={handleAbandonTest}>
                <X size={16} className="me-1" />
                Cancel & Return to Dashboard
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  // SESSION RESTORATION STATE
  if (showRestorationAlert) {
    return (
      <Container className="py-5">
        <ToastContainer position="top-right" autoClose={3000} />
        <Row className="justify-content-center">
          <Col md={8}>
            <SessionRestorationAlert
              show={showRestorationAlert}
              onRejoin={handleRejoinSession}
              onNewSession={handleNewSession}
              loading={restorationLoading}
              sessionData={existingSessionData}
            />
            <div className="text-center mt-3">
              <Button color="outline-danger" onClick={handleAbandonTest}>
                <X size={16} className="me-1" />
                Cancel & Return to Dashboard
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  // MAIN TEST INTERFACE
  if (isInitialized && state.sessionInfo && state.questionState) {
    return (
      <div
        style={{
          height: 'calc(100vh - 110px)',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '30px',
        }}
      >
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Connection status */}
        <ConnectionStatus isOnline={networkStatus.isOnline} />

        {/* Header */}
        <div className="bg-white border-bottom shadow-sm">
          <Container fluid>
            <div className="py-3">
              <Row className="align-items-center">
                <Col md={3}>
                  <div className="d-flex align-items-center">
                    <Button 
                      color="outline-danger" 
                      size="sm" 
                      onClick={handleAbandonTest} 
                      className="me-3"
                      title="Abandon test and return to dashboard"
                    >
                      <X size={16} className="me-1" />
                      Abandon Test
                    </Button>
                    <div>
                      <h6 className="mb-0">{state.sessionInfo.title}</h6>
                      <small className="text-muted">Taking Test</small>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center">
                    <div className="mb-1">
                      <small className="text-muted">
                        {state.sessionInfo.useSections && sectionInfo ? (
                          <>
                            Section: <strong>{sectionInfo.name}</strong> • Question {sectionInfo.current} of {sectionInfo.total}
                          </>
                        ) : (
                          <>
                            Question {(state.questionState.questionIndex ?? 0) + 1} of {state.sessionInfo.totalQuestions}
                          </>
                        )}
                      </small>
                    </div>
                    <Progress value={displayProgress} color="primary" style={{ height: '6px' }} />
                  </div>
                </Col>
                <Col md={3} className="text-end">
                  <div className="d-flex align-items-center justify-content-end gap-2">
                    <Button
                      color="outline-info"
                      size="sm"
                      onClick={() => setIsOverviewOpen(true)}
                      disabled={!state.navigationContext}
                      aria-label="View question overview"
                      title="View question overview and progress"
                      className="d-flex align-items-center"
                    >
                      <Menu size={16} className="me-1" />
                      <span className="d-none d-md-inline">Overview</span>
                    </Button>
                    <div className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <Clock size={16} className="me-1 text-muted" />
                        <span className="fw-bold" aria-live="polite">
                          {timerDisplay.formatTimeRemaining()}
                        </span>
                        {!networkStatus.isOnline && (
                          <Badge color="warning" className="ms-1">Offline</Badge>
                        )}
                        {!connectionStatus.isConnected && (
                          <Badge color="danger" className="ms-1">Disconnected</Badge>
                        )}
                      </div>
                      <small className="text-muted">
                        {state.sessionInfo.useSections ? 'Section time' : 'Test time'}
                      </small>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Container>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Container fluid style={{ height: '100%' }}>
            <QuestionLayoutManager
              currentQuestion={state.questionState}
              currentAnswer={state.currentAnswer}
              updateAnswer={updateAnswer}
              sectionInfo={sectionInfo || undefined}
              canNavigateBackward={false}
              canNavigateForward={false}
              isNavigating={state.submitting}
              onSubmitAnswer={handleSubmitAnswer}
              onSkip={handleSkipQuestion}
              onSubmitTest={handleSubmitTest}
              submitting={state.submitting}
              onClearAnswer={() => updateAnswer(null)}
            />
          </Container>
        </div>

        {/* Question Overview Modal */}
        {state.navigationContext && (
          <QuestionOverviewModal
            isOpen={isOverviewOpen}
            toggle={() => setIsOverviewOpen(false)}
            navigation={state.navigationContext}
          />
        )}
      </div>
    );
  }

  // FALLBACK STATE
  return (
    <Container className="py-5">
      <ToastContainer position="top-right" autoClose={3000} />
      <Row className="justify-content-center">
        <Col md={8}>
          <Alert color="warning">
            <AlertTriangle size={20} className="me-2" />
            <strong>Session Not Ready:</strong> The test session is not yet available.
          </Alert>
          <Button color="primary" onClick={handleRetry} className="me-2">
            Try Again
          </Button>
          <Button color="outline-secondary" onClick={handleSafeNavigate}>
            <X size={16} className="me-1" />
            Return to Dashboard
          </Button>
        </Col>
      </Row>
    </Container>
  );
});

const TestSessionPage: React.FC = () => {
  return <TestSessionContent />;
};

export default TestSessionPage;