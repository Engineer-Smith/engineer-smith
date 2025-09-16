import {
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Edit3,
  Eye,
  Search,
  TrendingUp,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  Table
} from 'reactstrap';
import apiService from '../services/ApiService';
import type { PopulatedResult } from '../types/result';
import DetailedResultScoringPage from './DetailedResultScoringPage'; // Import the scoring page

interface ResultWithTestInfo extends PopulatedResult {
  testTitle: string;
  userName: string;
  userEmail: string;
  organizationName: string;
}

const TestResultsDashboard: React.FC = () => {
  const [results, setResults] = useState<ResultWithTestInfo[]>([]);
  const [filteredResults, setFilteredResults] = useState<ResultWithTestInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<ResultWithTestInfo | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  
  // NEW: State for routing to scoring page
  const [currentView, setCurrentView] = useState<'dashboard' | 'scoring'>('dashboard');
  const [selectedResultForScoring, setSelectedResultForScoring] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const [testFilter, setTestFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, organizationFilter, testFilter, dateRange, results]);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allResults = await apiService.getAllResults({
        limit: 100,
        sort: '-completedAt'
      }) as PopulatedResult[];

      const resultsWithInfo: ResultWithTestInfo[] = allResults.map((result) => {
        const testTitle = result.testId?.title || `Test ${result.testId?._id?.slice(-6) || 'Unknown'}`;
        
        const userName = result.userId ? 
          `${result.userId.firstName || ''} ${result.userId.lastName || ''}`.trim() || 
          result.userId.loginId || 
          `User ${result.userId._id?.slice(-6) || 'Unknown'}` 
          : 'Unknown User';
          
        const userEmail = result.userId?.email || `user-${result.userId?._id?.slice(-6) || 'unknown'}@example.com`;
        
        const organizationName = result.organizationId?.name || 
          (result.organizationId?._id ? `Org ${result.organizationId._id.slice(-6)}` : 'Independent');

        return {
          ...result,
          testTitle,
          userName,
          userEmail,
          organizationName
        };
      });

      setResults(resultsWithInfo);
    } catch (err) {
      console.error('Failed to fetch results:', err);
      setError('Failed to fetch test results');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results];

    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.testTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(result => 
        statusFilter === 'passed' ? result.score.passed : !result.score.passed
      );
    }

    if (organizationFilter !== 'all') {
      filtered = filtered.filter(result => result.organizationId._id === organizationFilter);
    }

    if (testFilter !== 'all') {
      filtered = filtered.filter(result => result.testId._id === testFilter);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      if (dateRange !== 'all') {
        filtered = filtered.filter(result => 
          result.completedAt && new Date(result.completedAt) >= filterDate
        );
      }
    }

    setFilteredResults(filtered);
  };

  // NEW: Navigation functions
  const handleViewResult = (result: ResultWithTestInfo) => {
    setSelectedResult(result);
    setShowResultModal(true);
  };

  const handleManualScoring = (resultId: string) => {
    setSelectedResultForScoring(resultId);
    setCurrentView('scoring');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedResultForScoring(null);
    // Optionally refresh results after scoring
    fetchResults();
  };

  // NEW: Check if result needs manual grading
  const needsManualGrading = (result: ResultWithTestInfo) => {
    return result.manualReviewRequired || 
           result.questions?.some(q => ['essay', 'codeChallenge'].includes(q.type) && !q.manuallyGraded);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getScoreBadge = (score: any) => {
    if (score.passed) {
      return <Badge color="success"><CheckCircle size={14} className="me-1" />Passed</Badge>;
    }
    return <Badge color="danger"><XCircle size={14} className="me-1" />Failed</Badge>;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'danger';
  };

  const handleExportResults = () => {
    const headers = ['Student Name', 'User ID', 'Test', 'Organization', 'Score %', 'Status', 'Completed At', 'Time Spent'];
    const csvData = [
      headers,
      ...filteredResults.map(result => [
        result.userName,
        result.userId._id,
        result.testTitle,
        result.organizationName,
        result.score.percentage,
        result.score.passed ? 'Passed' : 'Failed',
        result.completedAt ? new Date(result.completedAt).toLocaleString() : 'N/A',
        formatDuration(result.timeSpent)
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate stats
  const totalResults = filteredResults.length;
  const passedResults = filteredResults.filter(r => r.score.passed).length;
  const failedResults = totalResults - passedResults;
  const averageScore = totalResults > 0 
    ? Math.round(filteredResults.reduce((sum, r) => sum + r.score.percentage, 0) / totalResults)
    : 0;

  const uniqueOrganizations = [...new Set(results.map(r => ({ 
    id: r.organizationId._id, 
    name: r.organizationName 
  })))];
  const uniqueTests = [...new Set(results.map(r => ({ 
    id: r.testId._id, 
    title: r.testTitle 
  })))];

  // NEW: Conditional rendering based on current view
  if (currentView === 'scoring' && selectedResultForScoring) {
    return (
      <DetailedResultScoringPage 
        resultId={selectedResultForScoring}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 mb-1">Test Results Dashboard</h2>
              <p className="text-muted mb-0">View and analyze completed test results</p>
            </div>
            <div className="d-flex gap-2">
              <Button color="outline-success" onClick={handleExportResults}>
                <Download size={16} className="me-1" />
                Export CSV
              </Button>
              <Button color="primary" onClick={fetchResults} disabled={loading}>
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
                  <BarChart3 className="text-primary" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{totalResults}</h4>
                  <small className="text-muted">Total Results</small>
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
                  <CheckCircle className="text-success" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{passedResults}</h4>
                  <small className="text-muted">Passed Tests</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="p-3 rounded-circle bg-danger bg-opacity-10 me-3">
                  <XCircle className="text-danger" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{failedResults}</h4>
                  <small className="text-muted">Failed Tests</small>
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
                  <TrendingUp className="text-info" size={24} />
                </div>
                <div>
                  <h4 className="mb-0">{averageScore}%</h4>
                  <small className="text-muted">Average Score</small>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert color="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <CardBody>
          <Row className="g-3">
            <Col md={3}>
              <FormGroup>
                <Label for="search">Search</Label>
                <div className="position-relative">
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search students, tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-4"
                  />
                  <Search size={16} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </FormGroup>
            </Col>
            <Col md={2}>
              <FormGroup>
                <Label for="status">Status</Label>
                <Input
                  id="status"
                  type="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={2}>
              <FormGroup>
                <Label for="organization">Organization</Label>
                <Input
                  id="organization"
                  type="select"
                  value={organizationFilter}
                  onChange={(e) => setOrganizationFilter(e.target.value)}
                >
                  <option value="all">All Organizations</option>
                  {uniqueOrganizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="test">Test</Label>
                <Input
                  id="test"
                  type="select"
                  value={testFilter}
                  onChange={(e) => setTestFilter(e.target.value)}
                >
                  <option value="all">All Tests</option>
                  {uniqueTests.map(test => (
                    <option key={test.id} value={test.id}>{test.title}</option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md={2}>
              <FormGroup>
                <Label for="dateRange">Date Range</Label>
                <Input
                  id="dateRange"
                  type="select"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Results Table */}
      <Card className="border-0 shadow-sm">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Test Results ({filteredResults.length})</h5>
          </div>
          
          {loading && results.length === 0 ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2 text-muted">Loading results...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-5">
              <BarChart3 size={48} className="text-muted mb-3" />
              <h6 className="text-muted">No Results Found</h6>
              <p className="text-muted mb-0">No test results match your current filters</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Student</th>
                    <th>Test</th>
                    <th>Organization</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Questions</th>
                    <th>Time Spent</th>
                    <th>Completed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result._id}>
                      <td>
                        <div>
                          <div className="fw-medium">{result.userName}</div>
                          <small className="text-muted">{result.userId._id}</small>
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{result.testTitle}</div>
                        <div className="d-flex gap-1 align-items-center">
                          <small className="text-muted">Attempt #{result.attemptNumber}</small>
                          {needsManualGrading(result) && (
                            <Badge color="warning" className="ms-1">
                              <Edit3 size={10} className="me-1" />
                              Manual Review
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">{result.organizationName}</small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="progress me-2" style={{ width: '60px', height: '6px' }}>
                            <div 
                              className={`progress-bar bg-${getScoreColor(result.score.percentage)}`}
                              style={{ width: `${result.score.percentage}%` }}
                            />
                          </div>
                          <span className="fw-medium">{result.score.percentage}%</span>
                        </div>
                        <small className="text-muted">
                          {result.score.earnedPoints}/{result.score.totalPoints} points
                        </small>
                      </td>
                      <td>
                        {getScoreBadge(result.score)}
                      </td>
                      <td>
                        <div>
                          <span className="text-success">{result.score.correctAnswers}</span> / 
                          <span className="text-danger">{result.score.incorrectAnswers}</span> / 
                          <span className="text-muted">{result.score.unansweredQuestions}</span>
                        </div>
                        <small className="text-muted">C / I / U</small>
                      </td>
                      <td>
                        <small>{formatDuration(result.timeSpent)}</small>
                      </td>
                      <td>
                        <small>{result.completedAt ? new Date(result.completedAt).toLocaleDateString() : 'N/A'}</small>
                        <br />
                        <small className="text-muted">{result.completedAt ? new Date(result.completedAt).toLocaleTimeString() : 'N/A'}</small>
                      </td>
                      <td>
                        <ButtonGroup>
                          <Button 
                            color="outline-primary" 
                            size="sm"
                            onClick={() => handleViewResult(result)}
                            title="View Summary"
                          >
                            <Eye size={14} />
                          </Button>
                          <Button 
                            color="outline-secondary" 
                            size="sm"
                            onClick={() => handleManualScoring(result._id)}
                            title="Manual Scoring"
                          >
                            <Edit3 size={14} />
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Result Detail Modal */}
      <Modal isOpen={showResultModal} toggle={() => setShowResultModal(false)} size="lg">
        <ModalHeader toggle={() => setShowResultModal(false)}>
          Test Result Details
        </ModalHeader>
        <ModalBody>
          {selectedResult && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Student:</strong> {selectedResult.userName}
                </Col>
                <Col md={6}>
                  <strong>User ID:</strong> {selectedResult.userId._id}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Test:</strong> {selectedResult.testTitle}
                </Col>
                <Col md={6}>
                  <strong>Organization:</strong> {selectedResult.organizationName}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Completed:</strong> {selectedResult.completedAt ? new Date(selectedResult.completedAt).toLocaleString() : 'N/A'}
                </Col>
                <Col md={6}>
                  <strong>Time Spent:</strong> {formatDuration(selectedResult.timeSpent)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Score:</strong> {selectedResult.score.percentage}% ({selectedResult.score.earnedPoints}/{selectedResult.score.totalPoints} points)
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> {getScoreBadge(selectedResult.score)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <div className="text-success">
                    <CheckCircle size={16} className="me-1" />
                    <strong>Correct:</strong> {selectedResult.score.correctAnswers}
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-danger">
                    <XCircle size={16} className="me-1" />
                    <strong>Incorrect:</strong> {selectedResult.score.incorrectAnswers}
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-muted">
                    <Clock size={16} className="me-1" />
                    <strong>Unanswered:</strong> {selectedResult.score.unansweredQuestions}
                  </div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Attempt Number:</strong> #{selectedResult.attemptNumber}
                </Col>
                <Col md={6}>
                  <strong>Passing Threshold:</strong> {selectedResult.score.passingThreshold}%
                </Col>
              </Row>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowResultModal(false)}>
            Close
          </Button>
          {selectedResult && (
            <Button 
              color="primary" 
              onClick={() => {
                setShowResultModal(false);
                handleManualScoring(selectedResult._id);
              }}
            >
              <Edit3 size={16} className="me-1" />
              Manual Scoring
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default TestResultsDashboard;