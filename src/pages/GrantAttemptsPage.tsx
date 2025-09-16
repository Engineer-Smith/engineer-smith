import {
  AlertCircle,
  Award,
  CheckCircle,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User as UserIcon,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
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
  Row,
  Spinner
} from 'reactstrap';
import { useNotifications } from '../context/NotificationContext';
import ApiService from '../services/ApiService';
import type { UserListItem } from '../types'; // Using dashboard user type
import type { Test } from '../types/test';

// Local type for API response
interface OverrideResponse {
  _id: string;
  userId: string;
  testId: string;
  organizationId: string;
  extraAttempts: number;
  reason: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  };
  test?: {
    _id: string;
    title: string;
  };
  granter?: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
}

interface StudentWithAttempts extends UserListItem {
  testAttempts?: Array<{
    testId: string;
    testTitle: string;
    totalAttempts: number;
    usedAttempts: number;
    remainingAttempts: number;
    hasOverride: boolean;
    overrideAttempts?: number;
  }>;
}

export default function GrantAttemptsPage() {
  const { grantAttemptsDirectly, loading, error } = useNotifications();
  
  // State management
  const [students, setStudents] = useState<StudentWithAttempts[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [overrides, setOverrides] = useState<OverrideResponse[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithAttempts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantForm, setGrantForm] = useState({
    testId: '',
    extraAttempts: 1,
    reason: ''
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (showRefreshSpinner = false) => {
    try {
      if (showRefreshSpinner) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const [dashboardData, testsData, overridesData] = await Promise.all([
        ApiService.getUserDashboard({ role: 'student', limit: 100 }), // Get students via dashboard
        ApiService.getAllTests(),
        ApiService.getStudentOverrides()
      ]);
      
      // Extract students from dashboard response
      const studentUsers = dashboardData.users.list;
      setStudents(studentUsers);
      setTests(testsData as Test[]);
      setOverrides(overridesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle student selection
  const handleSelectStudent = async (student: StudentWithAttempts) => {
    setSelectedStudent(student);
    
    // Load student's test attempt data
    try {
      const testAttempts = await Promise.all(
        tests.map(async (test) => {
          try {
            const status = await ApiService.getAttemptStatus(test._id, student._id);
            return {
              testId: test._id,
              testTitle: test.title,
              totalAttempts: status.attempts.total,
              usedAttempts: status.attempts.used,
              remainingAttempts: status.attempts.remaining,
              hasOverride: !!status.override,
              overrideAttempts: status.override?.extraAttempts
            };
          } catch (error) {
            return {
              testId: test._id,
              testTitle: test.title,
              totalAttempts: 0,
              usedAttempts: 0,
              remainingAttempts: 0,
              hasOverride: false
            };
          }
        })
      );
      
      setSelectedStudent({
        ...student,
        testAttempts
      });
    } catch (error) {
      console.error('Error loading student test data:', error);
    }
  };

  // Handle grant attempts
  const handleGrantAttempts = async () => {
    if (!selectedStudent || !grantForm.testId || !grantForm.reason.trim()) {
      alert('Please select a test and provide a reason');
      return;
    }

    try {
      await grantAttemptsDirectly({
        userId: selectedStudent._id,
        testId: grantForm.testId,
        extraAttempts: grantForm.extraAttempts,
        reason: grantForm.reason
      });
      
      // Reset form and reload data
      setGrantForm({ testId: '', extraAttempts: 1, reason: '' });
      setShowGrantModal(false);
      await loadData(true);
      
      // Refresh selected student data
      if (selectedStudent) {
        await handleSelectStudent(selectedStudent);
      }
    } catch (error) {
      console.error('Error granting attempts:', error);
    }
  };

  // Handle override deletion
  const handleDeleteOverride = async (overrideId: string) => {
    if (!window.confirm('Are you sure you want to delete this override?')) return;

    try {
      await ApiService.deleteStudentOverride(overrideId);
      await loadData(true);
      
      // Refresh selected student data
      if (selectedStudent) {
        await handleSelectStudent(selectedStudent);
      }
    } catch (error) {
      console.error('Error deleting override:', error);
    }
  };

  // Helper function to get user's display name (works with dashboard user structure)
  const getUserDisplayName = (user: any) => {
    // Dashboard users have fullName already computed
    if (user.fullName) {
      return user.fullName;
    }
    // Fallback for other user structures
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    // Final fallbacks
    return user.loginId || user.email || user._id || 'Unknown User';
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const displayName = getUserDisplayName(student);
    return (
      displayName.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.loginId?.toLowerCase().includes(searchLower)
    );
  });

  // Get student's overrides
  const getStudentOverrides = (studentId: string) => {
    return overrides.filter(override => override.userId === studentId);
  };

  if (isLoading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">Loading students and test data...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 mb-1">
                <Award className="me-2" size={28} />
                Grant Test Attempts
              </h2>
              <p className="text-muted mb-0">Select a student to view and manage their test attempts</p>
            </div>
            <Button 
              color="outline-secondary" 
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={`me-1 ${refreshing ? 'spinning' : ''}`} />
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      {/* Error Display */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert color="danger" className="d-flex align-items-center">
              <AlertCircle className="me-2" size={20} />
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      <Row style={{ height: 'calc(100vh - 200px)' }}>
        {/* Left Panel - Student List */}
        <Col md={4} className="h-100">
          <Card className="h-100 border-0 shadow-sm">
            <CardHeader className="bg-white border-bottom">
              <h6 className="mb-0">Students ({filteredStudents.length})</h6>
            </CardHeader>
            <CardBody className="p-0">
              {/* Search */}
              <div className="p-3 border-bottom">
                <div className="position-relative">
                  <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                  <Input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-4"
                  />
                </div>
              </div>

              {/* Student List */}
              <div style={{ height: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                {filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <Users size={48} className="mb-3 opacity-50" />
                    <p className="mb-0">No students found</p>
                  </div>
                ) : (
                  <div>
                    {filteredStudents.map(student => {
                      const studentOverrides = getStudentOverrides(student._id);
                      const isSelected = selectedStudent?._id === student._id;
                      
                      return (
                        <div
                          key={student._id}
                          onClick={() => handleSelectStudent(student)}
                          className={`p-3 border-bottom cursor-pointer ${
                            isSelected ? 'bg-primary bg-opacity-10 border-end border-primary border-3' : ''
                          }`}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                          onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = '')}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="fw-semibold text-dark">
                                {getUserDisplayName(student)}
                              </div>
                              <div className="small text-muted">{student.email || student.loginId || 'No email'}</div>
                              {studentOverrides.length > 0 && (
                                <div className="d-flex align-items-center mt-1">
                                  <Award size={12} className="text-warning me-1" />
                                  <Badge color="warning" className="small">
                                    {studentOverrides.length} override{studentOverrides.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <CheckCircle size={20} className="text-primary" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>

        {/* Right Panel - Student Details */}
        <Col md={8} className="h-100">
          {!selectedStudent ? (
            <Card className="h-100 border-0 shadow-sm">
              <CardBody className="d-flex align-items-center justify-content-center text-muted">
                <div className="text-center">
                  <UserIcon size={64} className="mb-4 opacity-50" />
                  <h4 className="mb-2">Select a Student</h4>
                  <p className="mb-0">Choose a student from the left panel to view and manage their test attempts</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="h-100 border-0 shadow-sm">
              <CardHeader className="bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">{getUserDisplayName(selectedStudent)}</h5>
                    <small className="text-muted">{selectedStudent.email || selectedStudent.loginId || 'No contact info'}</small>
                  </div>
                  <Button
                    color="primary"
                    onClick={() => setShowGrantModal(true)}
                    className="d-flex align-items-center"
                  >
                    <Plus size={16} className="me-1" />
                    Grant Attempts
                  </Button>
                </div>
              </CardHeader>
              
              <CardBody>
                {/* Stats Row */}
                <Row className="mb-4">
                  <Col md={4}>
                    <Card className="border-0 bg-light">
                      <CardBody className="text-center py-3">
                        <h4 className="mb-0">{selectedStudent.testAttempts?.length || 0}</h4>
                        <small className="text-muted">Available Tests</small>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 bg-warning bg-opacity-10">
                      <CardBody className="text-center py-3">
                        <h4 className="mb-0 text-warning">{getStudentOverrides(selectedStudent._id).length}</h4>
                        <small className="text-muted">Active Overrides</small>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 bg-success bg-opacity-10">
                      <CardBody className="text-center py-3">
                        <h4 className="mb-0 text-success">
                          {selectedStudent.testAttempts?.reduce((sum, test) => sum + test.remainingAttempts, 0) || 0}
                        </h4>
                        <small className="text-muted">Total Remaining</small>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                {/* Test Attempts */}
                <h6 className="mb-3">Test Attempts</h6>
                <div style={{ height: 'calc(100vh - 450px)', overflowY: 'auto' }}>
                  {!selectedStudent.testAttempts || selectedStudent.testAttempts.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <FileText size={48} className="mb-3 opacity-50" />
                      <p className="mb-0">No test data available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedStudent.testAttempts.map(testAttempt => (
                        <Card key={testAttempt.testId} className="border">
                          <CardBody>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-2">{testAttempt.testTitle}</h6>
                                
                                <Row className="g-3">
                                  <Col md={3}>
                                    <div className="small">
                                      <div className="text-muted">Total</div>
                                      <div className="fw-semibold">{testAttempt.totalAttempts}</div>
                                    </div>
                                  </Col>
                                  <Col md={3}>
                                    <div className="small">
                                      <div className="text-muted">Used</div>
                                      <div className="fw-semibold">{testAttempt.usedAttempts}</div>
                                    </div>
                                  </Col>
                                  <Col md={3}>
                                    <div className="small">
                                      <div className="text-muted">Remaining</div>
                                      <div className={`fw-semibold ${
                                        testAttempt.remainingAttempts > 0 ? 'text-success' : 'text-danger'
                                      }`}>
                                        {testAttempt.remainingAttempts}
                                      </div>
                                    </div>
                                  </Col>
                                  <Col md={3}>
                                    {testAttempt.hasOverride && (
                                      <div className="small">
                                        <Badge color="warning" className="d-flex align-items-center">
                                          <Award size={12} className="me-1" />
                                          +{testAttempt.overrideAttempts}
                                        </Badge>
                                      </div>
                                    )}
                                  </Col>
                                </Row>
                              </div>

                              {testAttempt.hasOverride && (
                                <Button
                                  color="outline-danger"
                                  size="sm"
                                  onClick={() => {
                                    const override = getStudentOverrides(selectedStudent._id)
                                      .find(o => o.testId === testAttempt.testId);
                                    if (override) {
                                      handleDeleteOverride(override._id);
                                    }
                                  }}
                                  title="Remove override"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>

      {/* Grant Modal */}
      <Modal isOpen={showGrantModal} toggle={() => setShowGrantModal(false)}>
        <ModalHeader toggle={() => setShowGrantModal(false)}>
          Grant Attempts to {selectedStudent ? getUserDisplayName(selectedStudent) : 'Student'}
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label className="form-label">Select Test *</label>
            <Input
              type="select"
              value={grantForm.testId}
              onChange={(e) => setGrantForm({ ...grantForm, testId: e.target.value })}
              required
            >
              <option value="">Choose a test...</option>
              {tests.map(test => (
                <option key={test._id} value={test._id}>
                  {test.title}
                </option>
              ))}
            </Input>
          </div>

          <div className="mb-3">
            <label className="form-label">Extra Attempts *</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={grantForm.extraAttempts}
              onChange={(e) => setGrantForm({ ...grantForm, extraAttempts: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Reason *</label>
            <Input
              type="textarea"
              rows={3}
              value={grantForm.reason}
              onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
              placeholder="Explain why this student needs additional attempts..."
              required
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="secondary" 
            onClick={() => {
              setShowGrantModal(false);
              setGrantForm({ testId: '', extraAttempts: 1, reason: '' });
            }}
          >
            Cancel
          </Button>
          <Button 
            color="primary" 
            onClick={handleGrantAttempts}
            disabled={loading}
          >
            {loading ? 'Granting...' : 'Grant Attempts'}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
}