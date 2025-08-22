import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import {
    ArrowLeft,
    AlertTriangle,
    Clock,
    Save,
    Send,
    AlertCircle,
    WifiOff,
    Wifi
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import type { Test, TestSession } from '../types';
import SessionTestTakingInterface from '../components/tests/SessionTestTakingInterface';
import { useOfflineTestManager } from '../components/OfflineTestManager';
import type { SessionStatus } from '../types';

interface TestSessionState {
    currentQuestionIndex: number;
    answers: Record<string, any>;
    flaggedQuestions: Set<number>;
    timeSpent: number;
    lastSaved: number;
    sectionProgress?: Record<number, boolean>;
    completedSections: number[];
    sectionStartTimes: Record<number, number>;
    pausedTime: number;
}

const TestSessionPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    // Core state
    const [testSession, setTestSession] = useState<TestSession | null>(null);
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Session state with persistence
    const [sessionState, setSessionState] = useState<TestSessionState>({
        currentQuestionIndex: 0,
        answers: {},
        flaggedQuestions: new Set(),
        timeSpent: 0,
        lastSaved: Date.now(),
        completedSections: [],
        sectionStartTimes: {},
        pausedTime: 0
    });

    // Timer and auto-save
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [sectionTimeRemaining, setSectionTimeRemaining] = useState<number>(0);
    const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

    const timerRef = useRef<number | null>(null);
    const sectionTimerRef = useRef<number | null>(null);
    const autoSaveRef = useRef<number | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    // Modals
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showTimeWarningModal, setShowTimeWarningModal] = useState(false);
    const [showSectionTimeWarningModal, setShowSectionTimeWarningModal] = useState(false);
    const [showSectionCompleteModal, setShowSectionCompleteModal] = useState(false);

    // Initialize offline manager
    const {
        OfflineTestManager,
        isTestPaused,
        queueOfflineAction,
        offlineQueue
    } = useOfflineTestManager(sessionId || '');

    // Session storage keys
    const getStorageKey = (key: string) => `test_session_${sessionId}_${key}`;

    // Enhanced auto-save with offline support
    const autoSaveAnswers = useCallback(async () => {
        if (!sessionId || !testSession || autoSaveStatus === 'saving') return;

        try {
            setAutoSaveStatus('saving');

            const questionsData = Object.entries(sessionState.answers).map(([questionId, answer]) => ({
                questionId,
                answer,
                timeSpent: Math.floor((Date.now() - sessionState.lastSaved) / 1000)
            }));

            const saveData = {
                questions: questionsData,
                status: 'inProgress' as SessionStatus,
                pausedTime: sessionState.pausedTime
            };

            // Check if online - if offline, queue the action
            if (!navigator.onLine) {
                queueOfflineAction({
                    type: 'autosave',
                    data: saveData
                });
                setAutoSaveStatus('saved');
                console.log('Auto-save queued for offline sync');
                return;
            }

            const response = await apiService.submitTestSession(sessionId, saveData);

            if (response.error) {
                throw new Error(response.message || 'Auto-save failed');
            }

            setAutoSaveStatus('saved');
            setSessionState(prev => ({ ...prev, lastSaved: Date.now() }));

        } catch (error) {
            console.error('TestSession: Auto-save error:', error);

            // If save failed due to network, queue it for offline sync
            if (error instanceof TypeError && error.message.includes('fetch')) {
                queueOfflineAction({
                    type: 'autosave',
                    data: {
                        questions: Object.entries(sessionState.answers).map(([questionId, answer]) => ({
                            questionId,
                            answer,
                            timeSpent: Math.floor((Date.now() - sessionState.lastSaved) / 1000)
                        })),
                        status: 'inProgress' as SessionStatus,
                        pausedTime: sessionState.pausedTime
                    }
                });
                setAutoSaveStatus('saved');
            } else {
                setAutoSaveStatus('error');
            }
        }
    }, [sessionId, testSession, sessionState.answers, sessionState.lastSaved, sessionState.pausedTime, autoSaveStatus, queueOfflineAction]);

    // Load session state from storage
    const loadSessionState = useCallback(() => {
        if (!sessionId) return;

        try {
            const savedState = localStorage.getItem(getStorageKey('state'));
            if (savedState) {
                const parsed = JSON.parse(savedState);
                setSessionState(prev => ({
                    ...prev,
                    ...parsed,
                    flaggedQuestions: new Set(parsed.flaggedQuestions || []),
                    pausedTime: parsed.pausedTime || 0
                }));
            }

            // Check for offline test state
            const offlineState = localStorage.getItem(`offline_test_${sessionId}`);
            if (offlineState) {
                const parsed = JSON.parse(offlineState);
                if (parsed.paused) {
                    console.log('Found paused offline test - will resume when connection restored');
                }
            }
        } catch (error) {
            console.error('TestSession: Error loading session state:', error);
        }
    }, [sessionId]);

    // Save session state to storage
    const saveSessionState = useCallback((state: TestSessionState) => {
        if (!sessionId) return;

        try {
            const stateToSave = {
                ...state,
                flaggedQuestions: Array.from(state.flaggedQuestions)
            };
            localStorage.setItem(getStorageKey('state'), JSON.stringify(stateToSave));
        } catch (error) {
            console.error('TestSession: Error saving session state:', error);
        }
    }, [sessionId]);

    // Fetch session and test data
    const fetchSessionData = useCallback(async () => {
        if (!sessionId) return;

        try {
            setLoading(true);
            setError(null);

            const sessionResponse = await apiService.getTestSession(sessionId);
            if (sessionResponse.error) {
                throw new Error(sessionResponse.message || 'Failed to fetch session');
            }

            const session = sessionResponse.data!;
            setTestSession(session);

            const testResponse = await apiService.getTestWithQuestions(session.testId);
            if (testResponse.error) {
                throw new Error(testResponse.message || 'Failed to fetch test');
            }

            setTest(testResponse.data!);

            // Calculate time remaining (accounting for paused time)
            const startTime = new Date(session.startedAt).getTime();
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const adjustedElapsed = elapsed - Math.floor(sessionState.pausedTime / 1000);
            const timeLimit = testResponse.data!.settings.timeLimit * 60;
            setTimeRemaining(Math.max(0, timeLimit - adjustedElapsed));

            console.log('TestSession: Loaded session and test data');

        } catch (error: any) {
            console.error('TestSession: Error fetching data:', error);
            setError(error.message || 'Failed to load test session');
        } finally {
            setLoading(false);
        }
    }, [sessionId, sessionState.pausedTime]);

    // Initialize session
    useEffect(() => {
        if (!isAuthenticated || !user || user.role !== 'student') {
            setError('Only students can take tests');
            return;
        }

        fetchSessionData();
        loadSessionState();
    }, [isAuthenticated, user, fetchSessionData, loadSessionState]);

    // Timer effects with pause support
    useEffect(() => {
        if (timeRemaining > 0 && !loading && !isTestPaused) {
            timerRef.current = window.setInterval(() => {
                setTimeRemaining(prev => {
                    const newTime = prev - 1;

                    if (newTime === 300 && !showTimeWarningModal) {
                        setShowTimeWarningModal(true);
                    }

                    if (newTime <= 0) {
                        handleAutoSubmit();
                        return 0;
                    }

                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeRemaining, loading, isTestPaused, showTimeWarningModal]);

    // Section timer with pause support
    useEffect(() => {
        if (test?.settings.useSections && sectionTimeRemaining > 0 && !loading && !isTestPaused) {
            sectionTimerRef.current = window.setInterval(() => {
                setSectionTimeRemaining(prev => {
                    const newTime = prev - 1;

                    if (newTime === 120 && !showSectionTimeWarningModal) {
                        setShowSectionTimeWarningModal(true);
                    }

                    if (newTime <= 0) {
                        handleSectionTimeExpired();
                        return 0;
                    }

                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (sectionTimerRef.current) clearInterval(sectionTimerRef.current);
        };
    }, [sectionTimeRemaining, loading, isTestPaused, showSectionTimeWarningModal, test?.settings.useSections]);

    // Auto-save effect
    useEffect(() => {
        if (Object.keys(sessionState.answers).length > 0 && !isTestPaused) {
            saveSessionState(sessionState);

            if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
            autoSaveRef.current = window.setTimeout(autoSaveAnswers, 30000);
        }

        return () => {
            if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
        };
    }, [sessionState, saveSessionState, autoSaveAnswers, isTestPaused]);

    // Handlers
    const handleStateChange = useCallback((newState: Partial<TestSessionState>) => {
        setSessionState(prev => ({ ...prev, ...newState }));
        lastActivityRef.current = Date.now();
    }, []);

    const handleAnswerChange = useCallback((questionId: string, answer: any) => {
        handleStateChange({
            answers: { ...sessionState.answers, [questionId]: answer }
        });

        // Queue action for offline sync if needed
        queueOfflineAction({
            type: 'answer',
            data: { questionId, answer, timestamp: Date.now() }
        });
    }, [sessionState.answers, handleStateChange, queueOfflineAction]);

    const handleQuestionNavigation = useCallback((questionIndex: number) => {
        handleStateChange({ currentQuestionIndex: questionIndex });
    }, [handleStateChange]);

    const handleFlagToggle = useCallback((questionIndex: number) => {
        const newFlagged = new Set(sessionState.flaggedQuestions);
        if (newFlagged.has(questionIndex)) {
            newFlagged.delete(questionIndex);
        } else {
            newFlagged.add(questionIndex);
        }
        handleStateChange({ flaggedQuestions: newFlagged });
    }, [sessionState.flaggedQuestions, handleStateChange]);

    const handleManualSave = async () => {
        await autoSaveAnswers();
    };

    const handleAutoSubmit = async () => {
        await handleSubmitTest(true);
    };

    const handleSectionTimeExpired = async () => {
        console.log('Section time expired');
    };

    const handleSubmitTest = async (isAutoSubmit = false) => {
        if (submitting) return;

        try {
            setSubmitting(true);

            const questionsData = Object.entries(sessionState.answers).map(([questionId, answer]) => ({
                questionId,
                answer,
                timeSpent: Math.floor((Date.now() - sessionState.lastSaved) / 1000)
            }));

            const submitData = {
                questions: questionsData,
                status: (isAutoSubmit ? 'expired' : 'completed') as SessionStatus
            };

            // If offline, queue for sync and show warning
            if (!navigator.onLine) {
                queueOfflineAction({
                    type: 'submit',
                    data: submitData
                });
                setError('Test submission queued - will sync when connection restored');
                return;
            }

            const response = await apiService.submitTestSession(sessionId!, submitData);

            if (response.error) {
                throw new Error(response.message || 'Submission failed');
            }

            localStorage.removeItem(getStorageKey('state'));
            localStorage.removeItem(`offline_test_${sessionId}`);
            navigate(`/test-results/${sessionId}`);

        } catch (error: any) {
            console.error('TestSession: Submission error:', error);

            // If submission failed due to network, queue it
            if (error instanceof TypeError && error.message.includes('fetch')) {
                queueOfflineAction({
                    type: 'submit',
                    data: {
                        questions: Object.entries(sessionState.answers).map(([questionId, answer]) => ({
                            questionId,
                            answer,
                            timeSpent: Math.floor((Date.now() - sessionState.lastSaved) / 1000)
                        })),
                        status: (isAutoSubmit ? 'expired' : 'completed') as SessionStatus
                    }
                });
                setError('Test submission queued - will sync when connection restored');
            } else {
                setError(error.message || 'Failed to submit test');
            }
        } finally {
            setSubmitting(false);
            setShowSubmitModal(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    // Loading state
    if (loading) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6} className="text-center">
                        <Spinner color="primary" className="mb-3" />
                        <p className="text-muted">Loading your test session...</p>
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
                        <Alert color="danger">
                            <AlertTriangle size={20} className="me-2" />
                            <strong>Error:</strong> {error}
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

    if (!testSession || !test) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6} className="text-center">
                        <AlertTriangle size={48} className="text-muted mb-3" />
                        <h5>Session not found</h5>
                        <p className="text-muted">The test session could not be found or has expired.</p>
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
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Offline Test Manager Component */}
            <OfflineTestManager isTestActive={!loading && !!testSession} />

            {/* Header with timer and controls */}
            <div className="bg-white border-bottom shadow-sm">
                <Container fluid>
                    <div className="py-2">
                        <Row className="align-items-center">
                            <Col md={3}>
                                <div className="d-flex align-items-center">
                                    <h6 className="mb-0">{test.title}</h6>
                                    <Badge color="primary" className="ms-2">Attempt #{testSession.attemptNumber}</Badge>
                                </div>
                            </Col>

                            <Col md={6} className="text-center">
                                <div className="d-flex align-items-center justify-content-center gap-3">
                                    <div className="d-flex align-items-center">
                                        <Clock size={16} className="me-1 text-danger" />
                                        <span className={`fw-bold ${timeRemaining < 300 ? 'text-danger' : 'text-dark'}`}>
                                            {formatTime(timeRemaining)}
                                        </span>
                                        {isTestPaused && (
                                            <Badge color="warning" className="ms-2">PAUSED</Badge>
                                        )}
                                    </div>

                                    {test?.settings.useSections && (
                                        <div className="d-flex align-items-center">
                                            <Clock size={14} className="me-1 text-warning" />
                                            <span className={`small ${sectionTimeRemaining < 120 ? 'text-danger' : 'text-warning'}`}>
                                                Section: {formatTime(sectionTimeRemaining)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="d-flex align-items-center">
                                        <Save size={14} className="me-1" />
                                        <span className={`small ${autoSaveStatus === 'saved' ? 'text-success' :
                                                autoSaveStatus === 'saving' ? 'text-warning' : 'text-danger'
                                            }`}>
                                            {autoSaveStatus === 'saved' ? 'Saved' :
                                                autoSaveStatus === 'saving' ? 'Saving...' : 'Error'}
                                        </span>
                                        {offlineQueue.length > 0 && (
                                            <Badge color="info" className="ms-1">{offlineQueue.length} queued</Badge>
                                        )}
                                    </div>
                                </div>
                            </Col>

                            <Col md={3} className="text-end">
                                <div className="d-flex gap-2 justify-content-end">
                                    <Button
                                        color="outline-secondary"
                                        size="sm"
                                        onClick={handleManualSave}
                                        disabled={isTestPaused}
                                    >
                                        <Save size={14} className="me-1" />
                                        Save
                                    </Button>
                                    <Button
                                        color="success"
                                        size="sm"
                                        onClick={() => setShowSubmitModal(true)}
                                        disabled={isTestPaused}
                                    >
                                        <Send size={14} className="me-1" />
                                        Submit
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>

            {/* Test Interface */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                {!isTestPaused ? (
                    <SessionTestTakingInterface
                        mode="taking"
                        test={test}
                        testSession={testSession}
                        currentQuestionIndex={sessionState.currentQuestionIndex}
                        answers={sessionState.answers}
                        flaggedQuestions={sessionState.flaggedQuestions}
                        onAnswerChange={handleAnswerChange}
                        onQuestionNavigation={handleQuestionNavigation}
                        onFlagToggle={handleFlagToggle}
                        timeRemaining={timeRemaining}
                        sectionTimeRemaining={sectionTimeRemaining}
                    />
                ) : (
                    <div className="d-flex align-items-center justify-content-center h-100">
                        <div className="text-center">
                            <AlertCircle size={48} className="text-warning mb-3" />
                            <h5 className="text-muted">Test Paused</h5>
                            <p className="text-muted">
                                Your test is paused due to connection issues.<br />
                                It will resume automatically when connection is restored.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Submit Confirmation Modal */}
            <Modal isOpen={showSubmitModal} toggle={() => setShowSubmitModal(false)}>
                <ModalHeader toggle={() => setShowSubmitModal(false)}>
                    Submit Test
                </ModalHeader>
                <ModalBody>
                    <p>Are you sure you want to submit your test?</p>
                    <div className="bg-light p-3 rounded">
                        <div className="d-flex justify-content-between mb-2">
                            <span>Questions answered:</span>
                            <span>{Object.keys(sessionState.answers).length}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                            <span>Flagged questions:</span>
                            <span>{sessionState.flaggedQuestions.size}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Time remaining:</span>
                            <span className="fw-bold">{formatTime(timeRemaining)}</span>
                        </div>
                        {offlineQueue.length > 0 && (
                            <div className="d-flex justify-content-between mt-2">
                                <span>Queued actions:</span>
                                <span className="text-warning fw-bold">{offlineQueue.length}</span>
                            </div>
                        )}
                    </div>
                    {!navigator.onLine && (
                        <Alert color="warning" className="mt-3 mb-0">
                            <WifiOff size={16} className="me-2" />
                            You're currently offline. Your submission will be queued and sent when connection is restored.
                        </Alert>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowSubmitModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        color="success"
                        onClick={() => handleSubmitTest(false)}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Spinner size="sm" className="me-1" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send size={16} className="me-1" />
                                Submit Test
                            </>
                        )}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Time Warning Modal */}
            <Modal
                isOpen={showTimeWarningModal}
                toggle={() => setShowTimeWarningModal(false)}
                centered
            >
                <ModalHeader toggle={() => setShowTimeWarningModal(false)}>
                    <AlertTriangle size={24} className="me-2 text-warning" />
                    Time Warning
                </ModalHeader>
                <ModalBody>
                    <Alert color="warning">
                        <strong>5 minutes remaining!</strong>
                        <br />
                        Make sure to submit your test before time runs out.
                    </Alert>
                </ModalBody>
                <ModalFooter>
                    <Button color="warning" onClick={() => setShowTimeWarningModal(false)}>
                        Continue
                    </Button>
                    <Button color="success" onClick={() => {
                        setShowTimeWarningModal(false);
                        setShowSubmitModal(true);
                    }}>
                        Submit Now
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default TestSessionPage;