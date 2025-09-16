// src/pages/PendingRequests.tsx - Enhanced with slide-out student details panel

import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  User,
  X,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  Row,
  Spinner,
  Table
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ApiService from '../services/ApiService';
import type {
  UserDetailsDashboard,
  User as UserType
} from '../types';
import type {
  AttemptRequest,
  ReviewAttemptRequestData
} from '../types/notifications';

const PendingRequests: React.FC = () => {
  const { user } = useAuth();
  const { reviewAttemptRequest } = useNotifications();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState<AttemptRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AttemptRequest | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected'>('approved');
  const [submitting, setSubmitting] = useState(false);
  
  // Student details panel state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDashboard, setStudentDashboard] = useState<UserDetailsDashboard | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  const typedUser = user as UserType | null;

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const pendingRequests = await ApiService.getPendingAttemptRequests();
      setRequests(pendingRequests);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch student dashboard data
  const fetchStudentDetails = async (studentId: string) => {
    try {
      setStudentLoading(true);
      setStudentError(null);
      const dashboardData = await ApiService.getUserDetailsDashboard(studentId);
      setStudentDashboard(dashboardData);
    } catch (err) {
      console.error('Error fetching student details:', err);
      setStudentError(err instanceof Error ? err.message : 'Failed to fetch student details');
    } finally {
      setStudentLoading(false);
    }
  };

  // Handle student selection
  const handleStudentSelect = (studentId: string) => {
    if (selectedStudentId === studentId) {
      // Close if same student clicked
      setSelectedStudentId(null);
      setStudentDashboard(null);
    } else {
      setSelectedStudentId(studentId);
      fetchStudentDetails(studentId);
    }
  };

  useEffect(() => {
    if (typedUser && (typedUser.role === 'admin' || typedUser.role === 'instructor')) {
      fetchPendingRequests();
    } else {
      navigate('/dashboard');
    }
  }, [typedUser, navigate]);

  // Handle review modal (existing code)
  const openReviewModal = (request: AttemptRequest, decision: 'approved' | 'rejected') => {
    setSelectedRequest(request);
    setReviewDecision(decision);
    setReviewNotes('');
    setReviewModal(true);
  };

  const closeReviewModal = () => {
    setReviewModal(false);
    setSelectedRequest(null);
    setReviewNotes('');
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      
      const reviewData: ReviewAttemptRequestData = {
        requestId: selectedRequest._id,
        decision: reviewDecision,
        reviewNotes: reviewNotes.trim() || undefined
      };

      await reviewAttemptRequest(reviewData);
      setRequests(prev => prev.filter(r => r._id !== selectedRequest._id));
      closeReviewModal();
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'instructor': return 'warning';
      case 'student': return 'primary';
      default: return 'secondary';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  // Loading and error states (existing code)
  if (loading) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '80px' }}>
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={6} className="text-center">
              <Spinner color="primary" className="mb-3" />
              <p className="text-muted">Loading pending requests...</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '80px' }}>
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={8}>
              <Alert color="danger" className="text-center">
                <h5>Error Loading Requests</h5>
                <p>{error}</p>
                <div className="mt-3">
                  <Button color="primary" onClick={fetchPendingRequests} className="me-2">
                    <RefreshCw size={16} className="me-1" />
                    Retry
                  </Button>
                  <Button color="secondary" outline onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} className="me-1" />
                    Back to Dashboard
                  </Button>
                </div>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '80px' }}>
      <Container fluid>
        <Row>
          {/* Main Content Area */}
          <Col lg={selectedStudentId ? 7 : 12}>
            {/* Header */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h2 className="h3 mb-1">Pending Attempt Requests</h2>
                  <p className="text-muted mb-0">
                    Review and approve student requests for additional test attempts
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <Button 
                    color="secondary" 
                    outline 
                    onClick={fetchPendingRequests}
                    disabled={loading}
                  >
                    <RefreshCw size={16} className="me-1" />
                    Refresh
                  </Button>
                  <Button 
                    color="primary" 
                    outline 
                    onClick={() => navigate('/dashboard')}
                  >
                    <ArrowLeft size={16} className="me-1" />
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <Row className="mb-4">
              <Col md={4}>
                <Card className="border-0 shadow-sm">
                  <CardBody className="text-center">
                    <Clock size={32} className="text-warning mb-2" />
                    <h4 className="mb-1">{requests.length}</h4>
                    <small className="text-muted">Pending Requests</small>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Requests List */}
            {requests.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardBody className="text-center py-5">
                  <CheckCircle size={48} className="text-success mb-3" />
                  <h5>No Pending Requests</h5>
                  <p className="text-muted">All attempt requests have been reviewed.</p>
                </CardBody>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardHeader className="bg-white border-bottom">
                  <h5 className="mb-0 d-flex align-items-center">
                    <Clock size={20} className="me-2" />
                    Requests Awaiting Review
                    {selectedStudentId && (
                      <Badge color="info" className="ms-2">
                        Student details panel open →
                      </Badge>
                    )}
                  </h5>
                </CardHeader>
                <CardBody className="p-0">
                  <Table responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Student</th>
                        <th>Test</th>
                        <th>Requested</th>
                        <th>Reason</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => (
                        <tr 
                          key={request._id} 
                          className={selectedStudentId === request.user?._id ? 'table-active' : ''}
                        >
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                                   style={{ width: '32px', height: '32px' }}>
                                <User size={16} className="text-white" />
                              </div>
                              <div>
                                <Button
                                  color="link"
                                  className="p-0 text-start fw-medium text-decoration-none"
                                  onClick={() => handleStudentSelect(request.user?._id || request.userId)}
                                >
                                  {request.user?.fullName || `${request.user?.firstName} ${request.user?.lastName}`}
                                  <ChevronRight size={14} className="ms-1" />
                                </Button>
                                <div>
                                  <small className="text-muted">{request.user?.email}</small>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FileText size={16} className="text-info me-2" />
                              <div>
                                <div className="fw-medium">{request.test?.title}</div>
                                {request.test?.description && (
                                  <small className="text-muted">{request.test.description}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge color="warning" className="d-flex align-items-center justify-content-center" 
                                   style={{ width: 'fit-content' }}>
                              {request.requestedAttempts} attempt{request.requestedAttempts !== 1 ? 's' : ''}
                            </Badge>
                          </td>
                          <td>
                            <div style={{ maxWidth: '200px' }}>
                              <small className="text-muted">
                                {request.reason.length > 50 
                                  ? `${request.reason.substring(0, 50)}...`
                                  : request.reason
                                }
                              </small>
                            </div>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(request.createdAt)}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                color="success"
                                size="sm"
                                onClick={() => openReviewModal(request, 'approved')}
                              >
                                <CheckCircle size={14} className="me-1" />
                                Approve
                              </Button>
                              <Button
                                color="danger"
                                size="sm"
                                outline
                                onClick={() => openReviewModal(request, 'rejected')}
                              >
                                <XCircle size={14} className="me-1" />
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            )}
          </Col>

          {/* Student Details Side Panel */}
          {selectedStudentId && (
            <Col lg={5}>
              <div className="position-sticky" style={{ top: '90px' }}>
                <Card className="border-0 shadow-sm">
                  <CardHeader className="bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Student Details</h6>
                    <Button
                      color="link"
                      size="sm"
                      className="p-0"
                      onClick={() => {
                        setSelectedStudentId(null);
                        setStudentDashboard(null);
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </CardHeader>
                  <CardBody style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    {studentLoading && (
                      <div className="text-center py-4">
                        <Spinner color="primary" className="mb-3" />
                        <p className="text-muted">Loading student details...</p>
                      </div>
                    )}

                    {studentError && (
                      <Alert color="danger">
                        {studentError}
                      </Alert>
                    )}

                    {studentDashboard && (
                      <div>
                        {/* Student Profile */}
                        <div className="text-center mb-4">
                          <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                               style={{ width: '60px', height: '60px' }}>
                            <User size={24} className="text-white" />
                          </div>
                          <h5 className="mb-1">{studentDashboard.user.fullName}</h5>
                          <Badge color={getRoleBadgeColor(studentDashboard.user.role)} className="mb-2">
                            {studentDashboard.user.role.charAt(0).toUpperCase() + studentDashboard.user.role.slice(1)}
                          </Badge>
                        </div>

                        {/* Basic Info */}
                        <div className="mb-4">
                          <div className="d-flex align-items-center mb-2">
                            <Mail size={14} className="me-2 text-muted" />
                            <small>{studentDashboard.user.email || studentDashboard.user.loginId}</small>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <Building size={14} className="me-2 text-muted" />
                            <small>{studentDashboard.user.organization.name}</small>
                          </div>
                          <div className="d-flex align-items-center">
                            <Calendar size={14} className="me-2 text-muted" />
                            <small>Member since {new Date(studentDashboard.user.createdAt).toLocaleDateString()}</small>
                          </div>
                        </div>

                        {/* Performance Overview */}
                        <div className="mb-4">
                          <h6 className="mb-3">Performance Overview</h6>
                          <Row className="text-center mb-3">
                            <Col xs={6}>
                              <div>
                                <h5 className="mb-0">{studentDashboard.performance.overview.completedTests}</h5>
                                <small className="text-muted">Completed Tests</small>
                              </div>
                            </Col>
                            <Col xs={6}>
                              <div>
                                <h5 className="mb-0">{studentDashboard.performance.overview.averageScore.toFixed(1)}%</h5>
                                <small className="text-muted">Average Score</small>
                              </div>
                            </Col>
                          </Row>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">Pass Rate</small>
                              <small className="fw-semibold">{studentDashboard.performance.overview.passRate}%</small>
                            </div>
                            <Progress 
                              value={studentDashboard.performance.overview.passRate} 
                              color={getPerformanceColor(studentDashboard.performance.overview.passRate)}
                              className="progress-sm"
                            />
                          </div>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">Recent Trend</small>
                              <div className="d-flex align-items-center">
                                {studentDashboard.performance.trends.isImproving ? (
                                  <TrendingUp size={14} className="text-success me-1" />
                                ) : (
                                  <TrendingUp size={14} className="text-danger me-1" style={{transform: 'rotate(180deg)'}} />
                                )}
                                <small className="fw-semibold">
                                  {Math.abs(studentDashboard.performance.trends.scoreChange).toFixed(1)}% change
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                          <h6 className="mb-3">Recent Test Activity</h6>
                          {studentDashboard.activity.recent.length === 0 ? (
                            <p className="text-muted">No recent test activity</p>
                          ) : (
                            <div className="space-y-3">
                              {studentDashboard.activity.recent.slice(0, 5).map((test, index) => (
                                <div key={index} className="p-3 border rounded-3">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                      <div className="fw-medium">{test.testTitle}</div>
                                      <small className="text-muted">Attempt #{test.attemptNumber}</small>
                                    </div>
                                    <div className="text-end">
                                      <Badge color={test.score.passed ? 'success' : 'danger'}>
                                        {test.score.percentage.toFixed(1)}%
                                      </Badge>
                                      <div>
                                        <small className="text-muted">
                                          {test.completedAt ? new Date(test.completedAt).toLocaleDateString() : 'In Progress'}
                                        </small>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            </Col>
          )}
        </Row>

        {/* Review Modal (existing code) */}
        <Modal isOpen={reviewModal} toggle={closeReviewModal} size="lg">
          <ModalHeader toggle={closeReviewModal}>
            {reviewDecision === 'approved' ? 'Approve' : 'Reject'} Attempt Request
          </ModalHeader>
          <ModalBody>
            {selectedRequest && (
              <>
                <div className="mb-4 p-3 bg-light rounded">
                  <Row>
                    <Col md={6}>
                      <strong>Student:</strong> {selectedRequest.user?.fullName}<br />
                      <strong>Email:</strong> {selectedRequest.user?.email}<br />
                      <strong>Test:</strong> {selectedRequest.test?.title}
                    </Col>
                    <Col md={6}>
                      <strong>Requested Attempts:</strong> {selectedRequest.requestedAttempts}<br />
                      <strong>Submitted:</strong> {formatDate(selectedRequest.createdAt)}<br />
                      <strong>Request ID:</strong> {selectedRequest._id.slice(0, 8)}...
                    </Col>
                  </Row>
                  <div className="mt-2">
                    <strong>Reason:</strong>
                    <div className="mt-1 p-2 bg-white rounded border">
                      {selectedRequest.reason}
                    </div>
                  </div>
                </div>

                <Form>
                  <FormGroup>
                    <Label for="reviewNotes" className="d-flex align-items-center">
                      <MessageSquare size={16} className="me-1" />
                      Review Notes {reviewDecision === 'rejected' && <span className="text-danger">*</span>}
                    </Label>
                    <Input
                      type="textarea"
                      id="reviewNotes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder={
                        reviewDecision === 'approved' 
                          ? "Optional: Add any notes about this approval..."
                          : "Required: Please explain why this request is being rejected..."
                      }
                      rows={3}
                      required={reviewDecision === 'rejected'}
                    />
                  </FormGroup>
                </Form>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={closeReviewModal} disabled={submitting}>
              Cancel
            </Button>
            <Button 
              color={reviewDecision === 'approved' ? 'success' : 'danger'}
              onClick={handleSubmitReview}
              disabled={submitting || (reviewDecision === 'rejected' && reviewNotes.trim() === '')}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Processing...
                </>
              ) : (
                <>
                  {reviewDecision === 'approved' ? (
                    <CheckCircle size={16} className="me-1" />
                  ) : (
                    <XCircle size={16} className="me-1" />
                  )}
                  {reviewDecision === 'approved' ? 'Approve Request' : 'Reject Request'}
                </>
              )}
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default PendingRequests;