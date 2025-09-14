import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
  Progress,
  Spinner,
  Input,
  InputGroup,
  InputGroupText,
  Collapse
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import type { Result, TestType } from '../types';

interface ResultsStats {
  totalAttempts: number;
  passedAttempts: number;
  averageScore: number;
  bestScore: number;
}

interface TestGroup {
  testId: string;
  testTitle: string;
  results: Result[];
  bestScore: number;
  bestAttempt: Result;
  totalAttempts: number;
  passedAttempts: number;
}

const TestResultsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<Result[]>([]);
  const [testGroups, setTestGroups] = useState<TestGroup[]>([]);
  const [tests, setTests] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<ResultsStats>({
    totalAttempts: 0,
    passedAttempts: 0,
    averageScore: 0,
    bestScore: 0
  });

  const isRequestInProgress = useRef(false);

  useEffect(() => {
    if (!isRequestInProgress.current) {
      fetchResults();
    }
  }, []);

  useEffect(() => {
    groupResultsByTest();
  }, [results, tests, searchTerm, statusFilter]);

  const fetchResults = async () => {
    if (isRequestInProgress.current) return;

    isRequestInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      // FIXED: API service returns Result[] directly, no wrapper
      const fetchedResults = await apiService.getAllResults({ 
        userId: user?._id,
        sort: '-createdAt'
      });

      // FIXED: Handle direct array response
      if (!Array.isArray(fetchedResults)) {
        throw new Error('Invalid results format received');
      }

      setResults(fetchedResults);
      calculateStats(fetchedResults);

      // Fetch test details for each unique test
      const uniqueTestIds = [...new Set(fetchedResults.map(r => r.testId))];
      const testPromises = uniqueTestIds.map(async (testId) => {
        try {
          // FIXED: getTest returns Test directly, no .data wrapper
          const test = await apiService.getTest(testId);
          return { testId, test };
        } catch (err) {
          // Fallback for failed test fetches
          return { testId, test: { title: `Test ${testId.slice(-6)}`, description: '' } };
        }
      });

      const testResults = await Promise.all(testPromises);
      const testsMap = testResults.reduce((acc, { testId, test }) => {
        acc[testId] = test;
        return acc;
      }, {} as Record<string, any>);

      setTests(testsMap);

    } catch (err) {
      console.error('Results fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
      isRequestInProgress.current = false;
    }
  };

  const calculateStats = (results: Result[]) => {
    if (results.length === 0) {
      setStats({
        totalAttempts: 0,
        passedAttempts: 0,
        averageScore: 0,
        bestScore: 0
      });
      return;
    }

    const completedResults = results.filter(r => r.status === 'completed');
    const passedResults = completedResults.filter(r => r.score.passed);
    const scores = completedResults.map(r => (r.score.earnedPoints / r.score.totalPoints) * 100);

    setStats({
      totalAttempts: results.length,
      passedAttempts: passedResults.length,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      bestScore: scores.length > 0 ? Math.round(Math.max(...scores)) : 0
    });
  };

  const groupResultsByTest = () => {
    // Group results by testId
    const groupedResults = results.reduce((acc, result) => {
      if (!acc[result.testId]) {
        acc[result.testId] = [];
      }
      acc[result.testId].push(result);
      return acc;
    }, {} as Record<string, Result[]>);

    // Create test groups with metadata
    const groups: TestGroup[] = Object.entries(groupedResults).map(([testId, testResults]) => {
      const completedResults = testResults.filter(r => r.status === 'completed');
      const passedResults = completedResults.filter(r => r.score.passed);
      const scores = completedResults.map(r => (r.score.earnedPoints / r.score.totalPoints) * 100);
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const bestAttempt = completedResults.find(r => 
        (r.score.earnedPoints / r.score.totalPoints) * 100 === bestScore
      ) || testResults[0];

      return {
        testId,
        testTitle: tests[testId]?.title || `Test ${testId.slice(-6)}`,
        results: testResults.sort((a, b) => b.attemptNumber - a.attemptNumber), // Latest first
        bestScore: Math.round(bestScore),
        bestAttempt,
        totalAttempts: testResults.length,
        passedAttempts: passedResults.length
      };
    });

    // Apply filters
    let filteredGroups = groups;

    if (searchTerm) {
      filteredGroups = groups.filter(group => 
        group.testTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.testId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'passed') {
        filteredGroups = filteredGroups.filter(group => group.passedAttempts > 0);
      } else if (statusFilter === 'failed') {
        filteredGroups = filteredGroups.filter(group => 
          group.totalAttempts > 0 && group.passedAttempts === 0
        );
      } else {
        filteredGroups = filteredGroups.filter(group =>
          group.results.some(r => r.status === statusFilter)
        );
      }
    }

    // Sort by most recent attempt
    filteredGroups.sort((a, b) => {
      const aLatest = new Date(a.results[0]?.createdAt || 0).getTime();
      const bLatest = new Date(b.results[0]?.createdAt || 0).getTime();
      return bLatest - aLatest;
    });

    setTestGroups(filteredGroups);
  };

  const toggleTestExpansion = (testId: string) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId);
    } else {
      newExpanded.add(testId);
    }
    setExpandedTests(newExpanded);
  };

  const handleViewDetails = (resultId: string) => {
    navigate(`/result-details/${resultId}`);
  };

  const getStatusColor = (status: string, passed?: boolean): string => {
    if (status === 'completed') {
      return passed ? 'success' : 'danger';
    }
    const colors: Record<string, string> = {
      expired: 'warning',
      abandoned: 'secondary'
    };
    return colors[status] || 'secondary';
  };

  const getStatusText = (result: Result): string => {
    if (result.status === 'completed') {
      return result.score.passed ? 'Passed' : 'Failed';
    }
    return result.status.charAt(0).toUpperCase() + result.status.slice(1);
  };

  const formatScore = (result: Result): string => {
    const percentage = ((result.score.earnedPoints / result.score.totalPoints) * 100).toFixed(1);
    return `${result.score.earnedPoints}/${result.score.totalPoints} (${percentage}%)`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '80px' }}>
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <Spinner color="primary" size="lg" />
            <p className="mt-3 text-muted">Loading your test results...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '80px' }}>
      <Container>
        {/* Header */}
        <Row>
          <Col lg={12}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h3 mb-1">
                  <i className="fas fa-chart-bar me-2 text-primary"></i>
                  My Test Results
                </h1>
                <p className="text-muted mb-0">
                  View your assessment history organized by test
                </p>
              </div>
              <Button color="outline-primary" onClick={() => navigate('/dashboard')}>
                <i className="fas fa-arrow-left me-2"></i>
                Back to Dashboard
              </Button>
            </div>

            {error && (
              <Alert color="danger" className="mb-4">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
                <div className="mt-2">
                  <Button color="danger" size="sm" onClick={fetchResults}>
                    <i className="fas fa-redo me-2"></i>
                    Retry
                  </Button>
                </div>
              </Alert>
            )}
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="h-100 shadow-sm border-0">
              <CardBody className="text-center">
                <div 
                  className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: '60px',
                    height: '60px'
                  }}
                >
                  <i className="fas fa-clipboard-list text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <h4 className="mb-1">{stats.totalAttempts}</h4>
                <p className="text-muted small mb-0">Total Attempts</p>
              </CardBody>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="h-100 shadow-sm border-0">
              <CardBody className="text-center">
                <div 
                  className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    width: '60px',
                    height: '60px'
                  }}
                >
                  <i className="fas fa-trophy text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <h4 className="mb-1">{stats.passedAttempts}</h4>
                <p className="text-muted small mb-0">Passed</p>
              </CardBody>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="h-100 shadow-sm border-0">
              <CardBody className="text-center">
                <div 
                  className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    width: '60px',
                    height: '60px'
                  }}
                >
                  <i className="fas fa-percentage text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <h4 className="mb-1">{stats.bestScore}%</h4>
                <p className="text-muted small mb-0">Best Score</p>
              </CardBody>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="h-100 shadow-sm border-0">
              <CardBody className="text-center">
                <div 
                  className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    width: '60px',
                    height: '60px'
                  }}
                >
                  <i className="fas fa-list-alt text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <h4 className="mb-1">{testGroups.length}</h4>
                <p className="text-muted small mb-0">Tests Taken</p>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-4">
          <Col lg={12}>
            <Card className="shadow-sm border-0">
              <CardBody>
                <Row className="g-3">
                  <Col md={6}>
                    <InputGroup>
                      <InputGroupText>
                        <i className="fas fa-search"></i>
                      </InputGroupText>
                      <Input
                        type="text"
                        placeholder="Search tests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                    <Input
                      type="select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Results</option>
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="expired">Expired</option>
                      <option value="abandoned">Abandoned</option>
                    </Input>
                  </Col>
                  <Col md={3}>
                    <div className="text-muted small">
                      Showing {testGroups.length} tests
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Test Groups */}
        <Row>
          <Col lg={12}>
            {testGroups.length === 0 ? (
              <Card className="shadow-sm border-0">
                <CardBody>
                  <div className="text-center py-5">
                    <i className="fas fa-chart-bar text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h5>No Results Found</h5>
                    <p className="text-muted">
                      {results.length === 0 
                        ? "You haven't taken any tests yet"
                        : "No results match your current filters"
                      }
                    </p>
                    {results.length === 0 && (
                      <Button color="primary" onClick={() => navigate('/dashboard')}>
                        <i className="fas fa-play me-2"></i>
                        Take Your First Test
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ) : (
              <div className="mb-4">
                {testGroups.map((group) => (
                  <Card key={group.testId} className="shadow-sm border-0 mb-3">
                    <CardHeader 
                      className="bg-white cursor-pointer"
                      onClick={() => toggleTestExpansion(group.testId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <i className={`fas fa-chevron-${expandedTests.has(group.testId) ? 'down' : 'right'} me-3 text-muted`}></i>
                          <div>
                            <h5 className="mb-1">{group.testTitle}</h5>
                            <div className="d-flex gap-2 flex-wrap">
                              <Badge color="info" className="small">
                                {group.totalAttempts} attempt{group.totalAttempts !== 1 ? 's' : ''}
                              </Badge>
                              {group.passedAttempts > 0 && (
                                <Badge color="success" className="small">
                                  {group.passedAttempts} passed
                                </Badge>
                              )}
                              <Badge color="warning" className="small">
                                Best: {group.bestScore}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-end">
                          <div style={{ width: '100px' }}>
                            <Progress 
                              value={group.bestScore}
                              color={group.passedAttempts > 0 ? 'success' : 'warning'}
                              style={{ height: '6px' }}
                            />
                          </div>
                          <small className="text-muted">
                            Latest: {new Date(group.results[0].createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </CardHeader>

                    <Collapse isOpen={expandedTests.has(group.testId)}>
                      <CardBody className="p-0">
                        <div className="table-responsive">
                          <Table hover className="mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Attempt</th>
                                <th>Score</th>
                                <th>Result</th>
                                <th>Date</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.results.map((result) => (
                                <tr key={result._id}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <strong>#{result.attemptNumber}</strong>
                                      {result._id === group.bestAttempt._id && (
                                        <Badge color="warning" size="sm" className="ms-2">
                                          <i className="fas fa-crown me-1"></i>
                                          Best
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    <div>
                                      <div className="d-flex align-items-center mb-1">
                                        <div style={{ width: '80px', marginRight: '10px' }}>
                                          <Progress 
                                            value={(result.score.earnedPoints / result.score.totalPoints) * 100}
                                            color={result.score.passed ? 'success' : 'danger'}
                                            style={{ height: '8px' }}
                                          />
                                        </div>
                                        <small className="fw-bold">
                                          {((result.score.earnedPoints / result.score.totalPoints) * 100).toFixed(1)}%
                                        </small>
                                      </div>
                                      <small className="text-muted">
                                        {formatScore(result)}
                                      </small>
                                    </div>
                                  </td>
                                  <td>
                                    <Badge 
                                      color={getStatusColor(result.status, result.score.passed)}
                                      className="px-2 py-1"
                                    >
                                      {getStatusText(result)}
                                    </Badge>
                                  </td>
                                  <td>
                                    <div>
                                      <small>
                                        {new Date(result.createdAt).toLocaleDateString()}
                                      </small>
                                      <br />
                                      <small className="text-muted">
                                        {new Date(result.createdAt).toLocaleTimeString()}
                                      </small>
                                    </div>
                                  </td>
                                  <td>
                                    <Button
                                      color="outline-primary"
                                      size="sm"
                                      onClick={() => handleViewDetails(result._id)}
                                    >
                                      <i className="fas fa-eye me-1"></i>
                                      Details
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </CardBody>
                    </Collapse>
                  </Card>
                ))}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TestResultsPage;