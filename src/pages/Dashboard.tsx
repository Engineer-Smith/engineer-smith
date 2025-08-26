import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
  Badge,
  Alert,
  Table,
  Progress,
  Spinner,
  CardHeader
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import type { Test, TestSession, Result, TestType, Language } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  // Add request tracking to prevent double calls in React Strict Mode
  const isRequestInProgress = useRef(false);
  const hasDataLoaded = useRef(false);

  useEffect(() => {
    // Only fetch if we haven't loaded data and no request is in progress
    if (!hasDataLoaded.current && !isRequestInProgress.current) {
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    // Prevent concurrent requests (React Strict Mode issue)
    if (isRequestInProgress.current) {
      console.log('Dashboard: Request already in progress, skipping...');
      return;
    }

    // If we already have data, don't fetch again unless explicitly refreshing
    if (hasDataLoaded.current && availableTests.length > 0) {
      console.log('Dashboard: Data already loaded, skipping...');
      return;
    }

    isRequestInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('Dashboard: Starting data fetch...');

      // Fetch available tests (only active tests for students)
      const testsResponse = await apiService.getAllTests({ status: 'active' });
      if (testsResponse.error) {
        throw new Error(testsResponse.message || 'Failed to fetch tests');
      }

      // Fetch student's test sessions
      const sessionsResponse = await apiService.getAllTestSessions({ 
        userId: user?.id,
        limit: 10 
      });
      if (sessionsResponse.error) {
        throw new Error(sessionsResponse.message || 'Failed to fetch sessions');
      }

      // Fetch student's results
      const resultsResponse = await apiService.getAllResults({ 
        userId: user?.id,
        limit: 10 
      });
      if (resultsResponse.error) {
        throw new Error(resultsResponse.message || 'Failed to fetch results');
      }

      const tests = testsResponse.data || [];
      const sessions = sessionsResponse.data || [];
      const results = resultsResponse.data || [];

      setAvailableTests(tests);
      setRecentSessions(sessions);
      setMyResults(results);

      // Calculate stats
      const completedResults = results.filter(r => r.status === 'completed');
      const passedResults = completedResults.filter(r => r.score.passed);
      const averageScore = completedResults.length > 0 
        ? completedResults.reduce((sum, r) => sum + r.score.earnedPoints, 0) / completedResults.length
        : 0;

      setStats({
        totalTests: tests.length,
        completedTests: completedResults.length,
        passedTests: passedResults.length,
        averageScore: Math.round(averageScore)
      });

      hasDataLoaded.current = true;
      console.log('Dashboard: Data fetch completed successfully');

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      isRequestInProgress.current = false;
    }
  };

  // Manual refresh function (for retry button)
  const refreshDashboard = () => {
    hasDataLoaded.current = false;
    fetchDashboardData();
  };

  const handleStartTest = async (testId: string) => {
    // Navigate to test details page instead of directly starting
    navigate(`/test-details/${testId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      completed: 'success',
      inProgress: 'warning',
      abandoned: 'danger',
      expired: 'secondary'
    };
    return colors[status] || 'secondary';
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatLanguages = (languages: Language[]): string => {
    return languages.length > 0 ? languages.join(', ') : 'General';
  };

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '80px' }}>
      <Container>
        {/* Header */}
        <Row>
          <Col lg={12}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h3 mb-1">
                  Welcome back, <span className="text-primary">{user?.loginId}</span>!
                </h1>
                <p className="text-muted mb-0">
                  Ready to take some assessments today?
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <Badge color="primary" className="px-3 py-2 fs-6">
                  <i className="fas fa-user-graduate me-2"></i>
                  Student
                </Badge>
                <Button color="outline-secondary" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </Button>
              </div>
            </div>

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

        {/* Stats Cards */}
        <Row className="g-4 mb-5">
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
                <h4 className="mb-1">{stats.totalTests}</h4>
                <p className="text-muted small mb-0">Available Tests</p>
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
                  <i className="fas fa-check-circle text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <h4 className="mb-1">{stats.completedTests}</h4>
                <p className="text-muted small mb-0">Completed</p>
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
                  <i className="fas fa-trophy text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <h4 className="mb-1">{stats.passedTests}</h4>
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
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    width: '60px',
                    height: '60px'
                  }}
                >
                  <i className="fas fa-chart-line text-white" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <h4 className="mb-1">{stats.averageScore}</h4>
                <p className="text-muted small mb-0">Avg Score</p>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Available Tests */}
        <Row className="mb-5">
          <Col lg={12}>
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-clipboard-list me-2 text-primary"></i>
                    Available Tests
                  </h5>
                  <Badge color="info">{availableTests.length} tests</Badge>
                </div>
              </CardHeader>
              <CardBody>
                {availableTests.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-clipboard text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted">No tests available at the moment</p>
                    <p className="small text-muted">Check back later for new assessments</p>
                  </div>
                ) : (
                  <Row>
                    {availableTests.slice(0, 6).map((test) => (
                      <Col md={6} lg={4} key={test._id} className="mb-3">
                        <Card className="h-100 border">
                          <CardBody>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <Badge color={getTestTypeColor(test.testType)} className="mb-2">
                                {test.testType.replace('_', ' ')}
                              </Badge>
                              <small className="text-muted">
                                {test.settings.timeLimit}min
                              </small>
                            </div>
                            <CardTitle tag="h6" className="mb-2">
                              {test.title}
                            </CardTitle>
                            <p className="text-muted small mb-3" style={{ height: '40px', overflow: 'hidden' }}>
                              {test.description}
                            </p>
                            <div className="mb-3">
                              <small className="text-muted d-block">
                                <strong>Languages:</strong> {formatLanguages(test.languages)}
                              </small>
                              <small className="text-muted d-block">
                                <strong>Attempts:</strong> {test.settings.attemptsAllowed}
                              </small>
                            </div>
                            <Button 
                              color="primary" 
                              size="sm" 
                              block
                              onClick={() => handleStartTest(test._id)}
                            >
                              <i className="fas fa-play me-2"></i>
                              Start Test
                            </Button>
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity */}
        <Row>
          <Col lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <CardHeader className="bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-clock me-2 text-warning"></i>
                  Recent Sessions
                </h5>
              </CardHeader>
              <CardBody>
                {recentSessions.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-history text-muted mb-3" style={{ fontSize: '2rem' }}></i>
                    <p className="text-muted">No recent sessions</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>Test</th>
                          <th>Status</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSessions.slice(0, 5).map((session) => (
                          <tr key={session.id}>
                            <td>
                              <small>Attempt #{session.attemptNumber}</small>
                            </td>
                            <td>
                              <Badge color={getStatusColor(session.status)} size="sm">
                                {session.status}
                              </Badge>
                            </td>
                            <td>
                              <small>{formatDuration(session.timeSpent)}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <CardHeader className="bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-chart-bar me-2 text-success"></i>
                  Recent Results
                </h5>
              </CardHeader>
              <CardBody>
                {myResults.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-chart-bar text-muted mb-3" style={{ fontSize: '2rem' }}></i>
                    <p className="text-muted">No results yet</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>Score</th>
                          <th>Result</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myResults.slice(0, 5).map((result) => (
                          <tr key={result.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div style={{ width: '60px' }}>
                                  <Progress 
                                    value={(result.score.earnedPoints / result.score.totalPoints) * 100}
                                    color={result.score.passed ? 'success' : 'danger'}
                                    style={{ height: '8px' }}
                                  />
                                </div>
                                <small className="ms-2">
                                  {result.score.earnedPoints}/{result.score.totalPoints}
                                </small>
                              </div>
                            </td>
                            <td>
                              <Badge 
                                color={result.score.passed ? 'success' : 'danger'} 
                                size="sm"
                              >
                                {result.score.passed ? 'Pass' : 'Fail'}
                              </Badge>
                            </td>
                            <td>
                              <small>
                                {new Date(result.createdAt).toLocaleDateString()}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;