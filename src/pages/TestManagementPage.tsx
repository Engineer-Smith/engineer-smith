// pages/TestManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Badge,
  Alert,
  Spinner,
  Input,
  InputGroup,
  InputGroupText,
  ButtonGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Archive,
  Users,
  Clock,
  Target,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Globe,
  Building,
  FileText,
  Settings,
  PlayCircle
} from 'lucide-react';
import type { Test, TestStatus } from '../types';

const TestManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isGlobalFilter, setIsGlobalFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  console.log(tests)
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Handle success messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(null), 5000);

      // Clear the location state to prevent message from showing again on refresh
      window.history.replaceState({}, document.title);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    fetchTests();
  }, [statusFilter, typeFilter, isGlobalFilter]);

  const fetchTests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        limit: 50, // Get more tests for management page
        skip: 0
      };

      // Add filters
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (isGlobalFilter !== 'all') {
        params.isGlobal = isGlobalFilter === 'true';
      }

      console.log('TestManagementPage: Fetching tests with params:', params);

      const response = await apiService.getAllTests(params);

      if (response.error || !Array.isArray(response.data)) {
        throw new Error(response.message || 'Failed to fetch tests');
      }

      setTests(response.data);
    } catch (error: any) {
      console.error('Error fetching tests:', error);
      setError(error.message || 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  // Filter tests based on search term and filters
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleCreateTest = () => {
    navigate('/admin/tests/new');
  };

  const handleViewTest = (testId: string) => {
    navigate(`/admin/tests/view/${testId}`);
  };

  const handleEditTest = (testId: string) => {
    navigate(`/admin/tests/edit/${testId}`);
  };

  const handleDeleteTest = (testId: string, testTitle: string) => {
    setTestToDelete({ id: testId, title: testTitle });
    setDeleteModal(true);
  };

  const handlePreviewTest = (testId: string) => {
    navigate(`/admin/tests/preview/${testId}`);
  };

  const confirmDelete = async () => {
    if (!testToDelete) return;

    try {
      setDeleting(true);
      const response = await apiService.deleteTest(testToDelete.id);
      if (response.error) {
        throw new Error(response.message || 'Failed to delete test');
      }

      // Close modal and reset state
      setDeleteModal(false);
      setTestToDelete(null);

      // Refresh the list
      fetchTests();
    } catch (error: any) {
      alert('Error deleting test: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal(false);
    setTestToDelete(null);
  };

  const handleStatusChange = async (testId: string, newStatus: TestStatus) => {
    try {
      const response = await apiService.updateTest(testId, { status: newStatus });
      if (response.error) {
        throw new Error(response.message || 'Failed to update test status');
      }

      // Refresh the list
      fetchTests();
    } catch (error: any) {
      alert('Error updating test status: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'secondary';
      default: return 'light';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="icon-xs" />;
      case 'draft': return <Edit className="icon-xs" />;
      case 'archived': return <Archive className="icon-xs" />;
      default: return <FileText className="icon-xs" />;
    }
  };

  if (!user) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">Loading...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '20px' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <Container>
          <div className="py-3">
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center">
                  <FileText className="me-3 text-primary icon-lg" />
                  <div>
                    <h1 className="h4 mb-0">Test Management</h1>
                    <p className="text-muted mb-0 small">
                      {user?.organization?.isSuperOrg
                        ? "Manage global and organization-specific tests"
                        : `Manage tests for ${user?.organization?.name}`
                      }
                    </p>
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <div className="d-flex gap-2">
                  {user?.organization?.isSuperOrg && (
                    <Badge color="primary" className="d-flex align-items-center">
                      <Globe className="me-1 icon-xs" />
                      Super Admin Access
                    </Badge>
                  )}
                  <Button
                    color="success"
                    onClick={handleCreateTest}
                    className="d-flex align-items-center"
                  >
                    <Plus className="me-2 icon-sm" />
                    Create Test
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {/* Success Message */}
        {successMessage && (
          <Alert
            color="success"
            className="mb-4 d-flex align-items-center"
            dismissible
            onDismiss={() => setSuccessMessage(null)}
          >
            <CheckCircle className="me-2 icon-sm" />
            {successMessage}
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm bg-primary bg-opacity-10">
              <CardBody>
                <div className="d-flex align-items-center">
                  <FileText className="text-primary me-3 icon-lg" />
                  <div>
                    <h3 className="mb-0 fw-bold">{tests.length}</h3>
                    <p className="text-muted mb-0 small">Total Tests</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm bg-success bg-opacity-10">
              <CardBody>
                <div className="d-flex align-items-center">
                  <Play className="text-success me-3 icon-lg" />
                  <div>
                    <h3 className="mb-0 fw-bold">
                      {tests.filter(t => t.status === 'active').length}
                    </h3>
                    <p className="text-muted mb-0 small">Active Tests</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm bg-warning bg-opacity-10">
              <CardBody>
                <div className="d-flex align-items-center">
                  <Edit className="text-warning me-3 icon-lg" />
                  <div>
                    <h3 className="mb-0 fw-bold">
                      {tests.filter(t => t.status === 'draft').length}
                    </h3>
                    <p className="text-muted mb-0 small">Draft Tests</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm bg-info bg-opacity-10">
              <CardBody>
                <div className="d-flex align-items-center">
                  <Users className="text-info me-3 icon-lg" />
                  <div>
                    <h3 className="mb-0 fw-bold">
                      {tests.reduce((sum, test) => sum + (test.stats?.totalAttempts || 0), 0)}
                    </h3>
                    <p className="text-muted mb-0 small">Total Attempts</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <CardBody>
            <Row className="g-3">
              <Col md={4}>
                <InputGroup>
                  <InputGroupText>
                    <Search className="icon-sm" />
                  </InputGroupText>
                  <Input
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>

              <Col md={2}>
                <Input
                  type="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </Input>
              </Col>

              {user?.organization?.isSuperOrg && (
                <Col md={2}>
                  <Input
                    type="select"
                    value={isGlobalFilter}
                    onChange={(e) => setIsGlobalFilter(e.target.value)}
                  >
                    <option value="all">All Scope</option>
                    <option value="true">Global</option>
                    <option value="false">Organization</option>
                  </Input>
                </Col>
              )}

              <Col md={user?.organization?.isSuperOrg ? 4 : 6}>
                <div className="text-muted small d-flex align-items-center">
                  <Filter className="me-2 icon-sm" />
                  {filteredTests.length} tests found
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Error State */}
        {error && (
          <Alert color="danger" className="mb-4">
            <strong>Error:</strong> {error}
            <div className="mt-2">
              <Button color="primary" size="sm" onClick={fetchTests}>
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="border-0 shadow-sm text-center py-5">
            <CardBody>
              <Spinner color="primary" className="mb-3" />
              <p className="text-muted">Loading tests...</p>
            </CardBody>
          </Card>
        )}

        {/* Tests Grid */}
        {!loading && (
          <Row className="g-3">
            {filteredTests.map((test) => (
              <Col key={test._id} lg={6} xl={4}>
                <Card className="h-100 border-0 shadow-sm">
                  <CardBody className="d-flex flex-column">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <Badge color={getStatusColor(test.status)} className="me-2">
                          {getStatusIcon(test.status)}
                          <span className="ms-1">{test.status}</span>
                        </Badge>
                        {test.isGlobal && (
                          <Badge color="primary" size="sm">
                            <Globe className="me-1 icon-xs" />
                            Global
                          </Badge>
                        )}
                      </div>
                      <ButtonGroup size="sm">
                        <Button
                          color="outline-success"
                          onClick={() => handlePreviewTest(test._id)}
                          title="Preview Test"
                        >
                          <PlayCircle className="icon-xs" />
                        </Button>
                        <Button
                          color="outline-primary"
                          onClick={() => handleViewTest(test._id)}
                          title="View Test Details"
                        >
                          <Eye className="icon-xs" />
                        </Button>
                        <Button
                          color="outline-secondary"
                          onClick={() => handleEditTest(test._id)}
                          title="Edit Test"
                        >
                          <Edit className="icon-xs" />
                        </Button>
                        <Button
                          color="outline-danger"
                          onClick={() => handleDeleteTest(test._id, test.title)}
                          title="Delete Test"
                        >
                          <Trash2 className="icon-xs" />
                        </Button>
                      </ButtonGroup>
                    </div>

                    {/* Content */}
                    <div className="flex-grow-1">
                      <CardTitle tag="h6" className="mb-2">
                        {test.title}
                      </CardTitle>

                      <CardText className="text-muted small mb-3">
                        {test.description.length > 100
                          ? test.description.substring(0, 100) + '...'
                          : test.description
                        }
                      </CardText>

                      {/* Test Details */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted d-flex align-items-center">
                            <Clock className="me-1 icon-xs" />
                            Duration
                          </small>
                          <small className="fw-medium">{test.settings?.timeLimit || 0} min</small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted d-flex align-items-center">
                            <Target className="me-1 icon-xs" />
                            Questions
                          </small>
                          <small className="fw-medium">
                            {test.settings?.useSections
                              ? test.sections?.reduce((sum, section) => sum + (section.questions?.length || 0), 0) || 0
                              : test.questions?.length || 0
                            }
                          </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted d-flex align-items-center">
                            <Users className="me-1 icon-xs" />
                            Attempts
                          </small>
                          <small className="fw-medium">{test.stats?.totalAttempts || 0}</small>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          Created {new Date(test.createdAt).toLocaleDateString()}
                        </small>

                        {test.status === 'draft' && (
                          <Button
                            color="success"
                            size="sm"
                            onClick={() => handleStatusChange(test._id, 'active' as TestStatus)}
                            className="d-flex align-items-center"
                          >
                            <Play className="me-1 icon-xs" />
                            Publish
                          </Button>
                        )}

                        {test.status === 'active' && (
                          <Button
                            color="warning"
                            size="sm"
                            onClick={() => handleStatusChange(test._id, 'archived' as TestStatus)}
                            className="d-flex align-items-center"
                          >
                            <Archive className="me-1 icon-xs" />
                            Archive
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Empty State */}
        {!loading && filteredTests.length === 0 && (
          <Card className="border-0 shadow-sm text-center py-5">
            <CardBody>
              <FileText className="text-muted mb-3" size={48} />
              <h5>No tests found</h5>
              <p className="text-muted mb-4">
                {searchTerm || statusFilter !== 'all' || isGlobalFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Start building your test library by creating your first test.'
                }
              </p>
              <Button color="success" onClick={handleCreateTest}>
                <Plus className="me-2 icon-sm" />
                Create Your First Test
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm mt-4">
          <CardBody>
            <h5 className="mb-3">Quick Actions</h5>
            <div className="d-flex flex-wrap gap-2">
              <Button
                color="success"
                size="sm"
                onClick={handleCreateTest}
                className="d-flex align-items-center"
              >
                <Plus className="me-2 icon-sm" />
                Create Test
              </Button>
              <Button
                color="primary"
                size="sm"
                onClick={() => navigate('/admin/test-sessions')}
                className="d-flex align-items-center"
              >
                <Users className="me-2 icon-sm" />
                View Sessions
              </Button>
              <Button
                color="info"
                size="sm"
                onClick={() => navigate('/admin/analytics')}
                className="d-flex align-items-center"
              >
                <BarChart3 className="me-2 icon-sm" />
                View Analytics
              </Button>
            </div>
          </CardBody>
        </Card>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal} toggle={cancelDelete} centered>
        <ModalHeader toggle={cancelDelete} className="border-0 pb-0">
          <div className="d-flex align-items-center">
            <div className="p-2 rounded bg-danger bg-opacity-10 me-3">
              <AlertTriangle className="text-danger icon-md" />
            </div>
            <div>
              <h5 className="mb-0">Delete Test</h5>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pt-2">
          <p className="mb-3">
            Are you sure you want to delete the test:
          </p>
          <div className="p-3 bg-light rounded mb-3">
            <strong>"{testToDelete?.title}"</strong>
          </div>
          <div className="d-flex align-items-start">
            <AlertTriangle className="text-warning me-2 mt-1 icon-sm flex-shrink-0" />
            <small className="text-muted">
              This action cannot be undone. The test and all associated sessions and results will be permanently removed.
            </small>
          </div>
        </ModalBody>
        <ModalFooter className="border-0 pt-0">
          <Button
            color="secondary"
            onClick={cancelDelete}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            onClick={confirmDelete}
            disabled={deleting}
            className="d-flex align-items-center"
          >
            {deleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="me-2 icon-sm" />
                Delete Test
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default TestManagementPage;