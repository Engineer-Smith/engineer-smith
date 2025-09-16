import {
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    Eye,
    Pause,
    Play,
    Users,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Badge,
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner,
    Table
} from 'reactstrap';
import apiService from '../services/ApiService';
import type { SessionStatus } from '../types';

// Define the populated session interface that matches server response
export interface PopulatedSession {
    _id: string;
    testId: string;
    testTitle: string;
    userId: string;
    userName: string;
    userEmail: string;
    organizationId: string;
    organizationName: string;
    attemptNumber: number;
    status: SessionStatus;
    startedAt: string;
    completedAt?: string;
    finalScore?: any;
    isConnected: boolean;
    lastConnectedAt?: string;
    currentQuestionIndex: number;
    answeredQuestions: number[];
    completedSections: number[];
    currentSectionIndex: number;
    testSnapshot: any;
}

interface SessionWithTestInfo extends PopulatedSession {
    progress: number;
    lastActivity: Date;
}

const LiveSessionMonitor: React.FC = () => {
    const [sessions, setSessions] = useState<SessionWithTestInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSession, setSelectedSession] = useState<SessionWithTestInfo | null>(null);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        fetchActiveSessions();
    }, []);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchActiveSessions();
        }, 30000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const fetchActiveSessions = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get active sessions using the actual API service
            const allSessions = await apiService.getPopulatedTestSessions({
                status: 'inProgress',
                limit: 100
            }) as PopulatedSession[];

            // The sessions already come with populated user/test/org data from the server
            const sessionsWithInfo: SessionWithTestInfo[] = allSessions.map(session => {
                // Calculate progress using current question vs total
                const totalQuestions = session.testSnapshot?.totalQuestions || 0;
                const currentQuestionIndex = session.currentQuestionIndex || 0;
                const answeredQuestions = session.answeredQuestions?.length || 0;
                const questionsProgressed = Math.max(currentQuestionIndex, answeredQuestions);
                const progress = totalQuestions > 0 ? Math.round((questionsProgressed / totalQuestions) * 100) : 0;

                return {
                    ...session,
                    progress,
                    lastActivity: new Date(session.lastConnectedAt || session.startedAt)
                };
            });

            setSessions(sessionsWithInfo);
        } catch (err) {
            console.error('Failed to fetch active sessions:', err);
            setError('Failed to fetch active sessions');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: SessionStatus, lastActivity: Date) => {
        const minutesSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / 60000);

        if (status === 'paused') {
            return <Badge color="warning"><Pause size={14} className="me-1" />Paused</Badge>;
        }

        if (minutesSinceActivity > 5) {
            return <Badge color="danger"><AlertCircle size={14} className="me-1" />Inactive</Badge>;
        }

        return <Badge color="success"><Play size={14} className="me-1" />Active</Badge>;
    };

    const getProgressColor = (progress: number) => {
        if (progress < 30) return 'danger';
        if (progress < 70) return 'warning';
        return 'success';
    };

    const handleViewSession = (session: SessionWithTestInfo) => {
        setSelectedSession(session);
        setShowSessionModal(true);
    };

    const handleForceComplete = async (sessionId: string) => {
        if (!confirm('Are you sure you want to force complete this session? This action cannot be undone.')) {
            return;
        }

        try {
            // Use the submit endpoint with forceSubmit flag
            await apiService.submitTestSession(sessionId, { forceSubmit: true });
            alert(`Session ${sessionId} has been force completed`);
            fetchActiveSessions(); // Refresh the list
        } catch (err) {
            console.error('Failed to force complete session:', err);
            setError('Failed to force complete session');
        }
    };

    const activeSessions = sessions.filter(s => s.status === 'inProgress');
    const pausedSessions = sessions.filter(s => s.status === 'paused');
    const totalStudents = sessions.length;

    // Calculate average session time
    const averageSessionTime = sessions.length > 0
        ? Math.round(sessions.reduce((acc, s) => {
            const sessionDuration = Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000);
            return acc + sessionDuration;
        }, 0) / sessions.length / 60)
        : 0;

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="h3 mb-1">Live Session Monitor</h2>
                            <p className="text-muted mb-0">Real-time monitoring of active testing sessions</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                color="outline-primary"
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={autoRefresh ? 'active' : ''}
                            >
                                <Activity size={16} className="me-1" />
                                Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
                            </Button>
                            <Button color="primary" onClick={fetchActiveSessions} disabled={loading}>
                                {loading ? <Spinner size="sm" className="me-1" /> : null}
                                Refresh
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <CardBody>
                            <div className="d-flex align-items-center">
                                <div className="p-3 rounded-circle bg-primary bg-opacity-10 me-3">
                                    <Users className="text-primary" size={24} />
                                </div>
                                <div>
                                    <h4 className="mb-0">{totalStudents}</h4>
                                    <small className="text-muted">Total Students</small>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <CardBody>
                            <div className="d-flex align-items-center">
                                <div className="p-3 rounded-circle bg-success bg-opacity-10 me-3">
                                    <Activity className="text-success" size={24} />
                                </div>
                                <div>
                                    <h4 className="mb-0">{activeSessions.length}</h4>
                                    <small className="text-muted">Active Sessions</small>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <CardBody>
                            <div className="d-flex align-items-center">
                                <div className="p-3 rounded-circle bg-warning bg-opacity-10 me-3">
                                    <Pause className="text-warning" size={24} />
                                </div>
                                <div>
                                    <h4 className="mb-0">{pausedSessions.length}</h4>
                                    <small className="text-muted">Paused Sessions</small>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm">
                        <CardBody>
                            <div className="d-flex align-items-center">
                                <div className="p-3 rounded-circle bg-info bg-opacity-10 me-3">
                                    <Clock className="text-info" size={24} />
                                </div>
                                <div>
                                    <h4 className="mb-0">{averageSessionTime}m</h4>
                                    <small className="text-muted">Avg Session Time</small>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {error && (
                <Alert color="danger" className="mb-4">
                    <AlertCircle size={16} className="me-2" />
                    {error}
                </Alert>
            )}

            {/* Sessions Table */}
            <Card className="border-0 shadow-sm">
                <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Current Testing Sessions</h5>
                        <small className="text-muted">
                            Last updated: {new Date().toLocaleTimeString()}
                        </small>
                    </div>

                    {loading && sessions.length === 0 ? (
                        <div className="text-center py-5">
                            <Spinner color="primary" />
                            <p className="mt-2 text-muted">Loading sessions...</p>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-5">
                            <CheckCircle size={48} className="text-muted mb-3" />
                            <h6 className="text-muted">No Active Sessions</h6>
                            <p className="text-muted mb-0">All students have completed their tests</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Student</th>
                                        <th>Test</th>
                                        <th>Organization</th>
                                        <th>Status</th>
                                        <th>Progress</th>
                                        <th>Started</th>
                                        <th>Last Activity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map((session) => {
                                        const minutesSinceActivity = Math.floor(
                                            (Date.now() - session.lastActivity.getTime()) / 60000
                                        );

                                        return (
                                            <tr key={session._id}>
                                                <td>
                                                    <div>
                                                        <div className="fw-medium">{session.userName}</div>
                                                        <small className="text-muted">{session.userEmail}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-medium">{session.testTitle}</div>
                                                    <small className="text-muted">
                                                        Question {session.currentQuestionIndex + 1}/{session.testSnapshot?.totalQuestions || 0}
                                                    </small>
                                                </td>
                                                <td>
                                                    <small className="text-muted">{session.organizationName}</small>
                                                </td>
                                                <td>
                                                    {getStatusBadge(session.status, session.lastActivity)}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                                                            <div
                                                                className={`progress-bar bg-${getProgressColor(session.progress)}`}
                                                                style={{ width: `${session.progress}%` }}
                                                            />
                                                        </div>
                                                        <small className="text-muted">{session.progress}%</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <small>{new Date(session.startedAt).toLocaleDateString()}</small>
                                                    <br />
                                                    <small className="text-muted">{new Date(session.startedAt).toLocaleTimeString()}</small>
                                                </td>
                                                <td>
                                                    <small className={minutesSinceActivity > 5 ? 'text-danger' : 'text-muted'}>
                                                        {minutesSinceActivity < 1 ? 'Just now' : `${minutesSinceActivity}m ago`}
                                                    </small>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            color="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleViewSession(session)}
                                                        >
                                                            <Eye size={14} />
                                                        </Button>
                                                        <Button
                                                            color="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleForceComplete(session._id)}
                                                        >
                                                            <XCircle size={14} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Session Detail Modal */}
            <Modal isOpen={showSessionModal} toggle={() => setShowSessionModal(false)} size="lg">
                <ModalHeader toggle={() => setShowSessionModal(false)}>
                    Session Details
                </ModalHeader>
                <ModalBody>
                    {selectedSession && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Student:</strong> {selectedSession.userName}
                                </Col>
                                <Col md={6}>
                                    <strong>User ID:</strong> {selectedSession.userId}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Test:</strong> {selectedSession.testTitle}
                                </Col>
                                <Col md={6}>
                                    <strong>Organization:</strong> {selectedSession.organizationName}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Started:</strong> {new Date(selectedSession.startedAt).toLocaleString()}
                                </Col>
                                <Col md={6}>
                                    <strong>Attempt:</strong> #{selectedSession.attemptNumber}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Progress:</strong> {selectedSession.currentQuestionIndex + 1}/{selectedSession.testSnapshot?.totalQuestions || 0} questions
                                </Col>
                                <Col md={6}>
                                    <strong>Status:</strong> {getStatusBadge(selectedSession.status, selectedSession.lastActivity)}
                                </Col>
                            </Row>
                            {selectedSession.testSnapshot?.sections && (
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <strong>Section:</strong> {selectedSession.currentSectionIndex + 1}
                                    </Col>
                                    <Col md={6}>
                                        <strong>Completed Sections:</strong> {selectedSession.completedSections?.length || 0}
                                    </Col>
                                </Row>
                            )}
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Answered Questions:</strong> {selectedSession.answeredQuestions?.length || 0}
                                </Col>
                                <Col md={6}>
                                    <strong>Connection Status:</strong> {selectedSession.isConnected ? 'Connected' : 'Disconnected'}
                                </Col>
                            </Row>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowSessionModal(false)}>
                        Close
                    </Button>
                    {selectedSession && (
                        <Button color="danger" onClick={() => {
                            handleForceComplete(selectedSession._id);
                            setShowSessionModal(false);
                        }}>
                            Force Complete
                        </Button>
                    )}
                </ModalFooter>
            </Modal>
        </Container>
    );
};

export default LiveSessionMonitor;