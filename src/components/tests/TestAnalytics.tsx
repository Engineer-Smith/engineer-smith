// src/components/tests/TestAnalytics.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Row,
  Col,
  Table,
  Badge,
  Progress,
  Alert,
  Button,
  ButtonGroup,
  Spinner
} from 'reactstrap';
import { useAuth } from '../../context/AuthContext';
import type { Test } from '../../types';

interface TestAnalyticsProps {
  test: Test;
}

interface AnalyticsData {
  attemptHistory: any[];
  questionPerformance: any[];
  sectionPerformance: any[];
  timeAnalysis: any;
  difficultyBreakdown: any;
  recentActivity: any[];
}

const TestAnalytics: React.FC<TestAnalyticsProps> = ({ test }) => {
  const { client } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [test._id, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await client.get(`/tests/${test._id}/analytics?timeframe=${timeframe}`);
      setAnalytics(response.data);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.error || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <CardBody className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2 text-muted">Loading analytics data...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <CardBody>
          <Alert color="danger">
            <h6>Error Loading Analytics</h6>
            <p className="mb-0">{error}</p>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (!analytics || (test.stats?.totalAttempts || 0) === 0) {
    return (
      <Card className="mb-4">
        <CardBody>
          <Alert color="info">
            <h5 className="alert-heading">📊 No Analytics Data Available</h5>
            <p>
              This test hasn't been taken by any students yet. Analytics will appear here once 
              students start taking the test.
            </p>
            <hr />
            <p className="mb-0">
              <strong>Current Status:</strong> {test.status} • 
              <strong> Total Attempts:</strong> {test.stats?.totalAttempts || 0}
            </p>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div>
      {/* Analytics Header */}
      <Card className="mb-4">
        <CardBody>
          <Row className="align-items-center">
            <Col>
              <CardTitle tag="h5" className="mb-0">
                📊 Test Analytics
              </CardTitle>
              <small className="text-muted">
                Performance insights and statistical analysis
              </small>
            </Col>
            <Col xs="auto">
              <ButtonGroup size="sm">
                <Button 
                  color={timeframe === 'all' ? 'primary' : 'outline-primary'}
                  onClick={() => setTimeframe('all')}
                >
                  All Time
                </Button>
                <Button 
                  color={timeframe === '30d' ? 'primary' : 'outline-primary'}
                  onClick={() => setTimeframe('30d')}
                >
                  Last 30 Days
                </Button>
                <Button 
                  color={timeframe === '7d' ? 'primary' : 'outline-primary'}
                  onClick={() => setTimeframe('7d')}
                >
                  Last 7 Days
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col md="3">
          <Card className="text-center">
            <CardBody>
              <h3 className="text-primary mb-1">{test.stats?.totalAttempts || 0}</h3>
              <small className="text-muted">Total Attempts</small>
              <div className="mt-2">
                <small className="text-success">
                  +{analytics.recentActivity?.length || 0} this week
                </small>
              </div>
            </CardBody>
          </Card>
        </Col>
        
        <Col md="3">
          <Card className="text-center">
            <CardBody>
              <h3 className="text-success mb-1">{test.stats?.completedAttempts || 0}</h3>
              <small className="text-muted">Completed</small>
              <div className="mt-2">
                <Progress 
                  value={((test.stats?.completedAttempts || 0) / (test.stats?.totalAttempts || 1)) * 100}
                  color="success"
                  size="sm"
                />
              </div>
            </CardBody>
          </Card>
        </Col>
        
        <Col md="3">
          <Card className="text-center">
            <CardBody>
              <h3 className={`mb-1 text-${getPerformanceColor(test.stats?.averageScore || 0)}`}>
                {test.stats?.averageScore?.toFixed(1) || 0}%
              </h3>
              <small className="text-muted">Average Score</small>
              <div className="mt-2">
                <small className="text-muted">
                  Median: {analytics.timeAnalysis?.medianScore?.toFixed(1) || 0}%
                </small>
              </div>
            </CardBody>
          </Card>
        </Col>
        
        <Col md="3">
          <Card className="text-center">
            <CardBody>
              <h3 className={`mb-1 text-${getPerformanceColor(test.stats?.passRate || 0)}`}>
                {test.stats?.passRate?.toFixed(1) || 0}%
              </h3>
              <small className="text-muted">Pass Rate</small>
              <div className="mt-2">
                <small className="text-muted">
                  Target: {test.settings?.passingScore || 70}%
                </small>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Time Analysis */}
      <Card className="mb-4">
        <CardBody>
          <CardTitle tag="h6">⏱️ Time Analysis</CardTitle>
          
          <Row>
            <Col md="6">
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <td><strong>Average Time:</strong></td>
                    <td>{analytics.timeAnalysis?.averageTime || 0} minutes</td>
                  </tr>
                  <tr>
                    <td><strong>Median Time:</strong></td>
                    <td>{analytics.timeAnalysis?.medianTime || 0} minutes</td>
                  </tr>
                  <tr>
                    <td><strong>Fastest Completion:</strong></td>
                    <td>{analytics.timeAnalysis?.fastestTime || 0} minutes</td>
                  </tr>
                  <tr>
                    <td><strong>Slowest Completion:</strong></td>
                    <td>{analytics.timeAnalysis?.slowestTime || 0} minutes</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            
            <Col md="6">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Time Utilization</small>
                  <small>
                    {((analytics.timeAnalysis?.averageTime || 0) / (test.totalTime || 1) * 100).toFixed(0)}%
                  </small>
                </div>
                <Progress 
                  value={(analytics.timeAnalysis?.averageTime || 0) / (test.totalTime || 1) * 100}
                  color="info"
                />
                <small className="text-muted">
                  Average time vs allocated time ({test.totalTime} minutes)
                </small>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Question Performance */}
      {analytics.questionPerformance && analytics.questionPerformance.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <CardTitle tag="h6">📝 Question Performance</CardTitle>
            
            <Table responsive size="sm">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Type</th>
                  <th>Correct %</th>
                  <th>Avg Time</th>
                  <th>Difficulty</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {analytics.questionPerformance.slice(0, 10).map((question, index) => (
                  <tr key={index}>
                    <td>
                      <div>
                        <strong className="d-block">
                          {question.title || `Question ${index + 1}`}
                        </strong>
                        <small className="text-muted">
                          {question.attempts} attempts
                        </small>
                      </div>
                    </td>
                    <td>
                      <Badge color="light" size="sm">
                        {question.type?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <Badge 
                        color={getPerformanceColor(question.correctPercentage)}
                        pill
                      >
                        {question.correctPercentage?.toFixed(1)}%
                      </Badge>
                    </td>
                    <td>{question.averageTime?.toFixed(1)}min</td>
                    <td>
                      <Badge 
                        color={question.difficulty === 'advanced' ? 'danger' : 
                               question.difficulty === 'intermediate' ? 'warning' : 'success'}
                        size="sm"
                      >
                        {question.difficulty}
                      </Badge>
                    </td>
                    <td>
                      <Progress 
                        value={question.correctPercentage}
                        color={getPerformanceColor(question.correctPercentage)}
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
            {analytics.questionPerformance.length > 10 && (
              <div className="text-center mt-3">
                <small className="text-muted">
                  Showing top 10 questions. View full report for complete analysis.
                </small>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Section Performance (for section-based tests) */}
      {test.settings?.useSections && analytics.sectionPerformance && analytics.sectionPerformance.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <CardTitle tag="h6">🏗️ Section Performance</CardTitle>
            
            <Table responsive>
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Avg Score</th>
                  <th>Completion Rate</th>
                  <th>Avg Time</th>
                  <th>Performance Trend</th>
                </tr>
              </thead>
              <tbody>
                {analytics.sectionPerformance.map((section, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{section.name}</strong>
                      <br />
                      <small className="text-muted">
                        {section.questionCount} questions
                      </small>
                    </td>
                    <td>
                      <Badge 
                        color={getPerformanceColor(section.averageScore)}
                        pill
                      >
                        {section.averageScore?.toFixed(1)}%
                      </Badge>
                    </td>
                    <td>
                      <div>
                        {section.completionRate?.toFixed(1)}%
                        <Progress 
                          value={section.completionRate}
                          color="info"
                          size="sm"
                          className="mt-1"
                        />
                      </div>
                    </td>
                    <td>
                      {section.averageTime?.toFixed(1)} min
                      <br />
                      <small className="text-muted">
                        of {section.timeLimit} allocated
                      </small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {section.trend === 'improving' && (
                          <Badge color="success" size="sm">📈 Improving</Badge>
                        )}
                        {section.trend === 'declining' && (
                          <Badge color="warning" size="sm">📉 Declining</Badge>
                        )}
                        {section.trend === 'stable' && (
                          <Badge color="info" size="sm">➡️ Stable</Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Difficulty Breakdown */}
      {analytics.difficultyBreakdown && (
        <Card className="mb-4">
          <CardBody>
            <CardTitle tag="h6">🎯 Performance by Difficulty</CardTitle>
            
            <Row>
              {Object.entries(analytics.difficultyBreakdown).map(([difficulty, data]: [string, any]) => (
                <Col md="4" key={difficulty}>
                  <div className="text-center p-3 border rounded">
                    <h6 className="text-capitalize">{difficulty}</h6>
                    <h4 className={`text-${getPerformanceColor(data.averageScore)}`}>
                      {data.averageScore?.toFixed(1)}%
                    </h4>
                    <Progress 
                      value={data.averageScore}
                      color={getPerformanceColor(data.averageScore)}
                      className="mb-2"
                    />
                    <small className="text-muted">
                      {data.questionCount} questions • {data.attempts} attempts
                    </small>
                  </div>
                </Col>
              ))}
            </Row>
          </CardBody>
        </Card>
      )}

      {/* Recent Activity */}
      {analytics.recentActivity && analytics.recentActivity.length > 0 && (
        <Card className="mb-4">
          <CardBody>
            <CardTitle tag="h6">🔔 Recent Activity</CardTitle>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {analytics.recentActivity.slice(0, 20).map((activity, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <strong>{activity.studentName}</strong>
                    <small className="text-muted d-block">
                      {activity.action} • {new Date(activity.timestamp).toLocaleString()}
                    </small>
                  </div>
                  <div className="text-end">
                    {activity.score !== undefined && (
                      <Badge 
                        color={getPerformanceColor(activity.score)}
                        pill
                      >
                        {activity.score}%
                      </Badge>
                    )}
                    {activity.duration && (
                      <small className="text-muted d-block">
                        {activity.duration} min
                      </small>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {analytics.recentActivity.length > 20 && (
              <div className="text-center mt-3">
                <Button color="outline-primary" size="sm">
                  View All Activity
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Export and Actions */}
      <Card>
        <CardBody>
          <CardTitle tag="h6">📊 Export & Actions</CardTitle>
          
          <Row>
            <Col md="8">
              <p className="mb-3">
                Export detailed analytics data for further analysis or reporting.
              </p>
            </Col>
            <Col md="4" className="text-end">
              <ButtonGroup>
                <Button 
                  color="outline-primary" 
                  size="sm"
                  onClick={() => window.open(`/admin/tests/${test._id}/export/analytics`, '_blank')}
                >
                  📊 Export Analytics
                </Button>
                <Button 
                  color="outline-secondary" 
                  size="sm"
                  onClick={() => window.open(`/admin/tests/${test._id}/results`, '_blank')}
                >
                  📋 View All Results
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          
          <hr />
          
          <Row className="text-center">
            <Col md="3">
              <div className="p-2">
                <h6 className="text-muted mb-1">Data Freshness</h6>
                <small>Last updated: {new Date().toLocaleTimeString()}</small>
              </div>
            </Col>
            <Col md="3">
              <div className="p-2">
                <h6 className="text-muted mb-1">Coverage</h6>
                <small>{timeframe === 'all' ? 'All time data' : `Last ${timeframe}`}</small>
              </div>
            </Col>
            <Col md="3">
              <div className="p-2">
                <h6 className="text-muted mb-1">Sample Size</h6>
                <small>{test.stats?.totalAttempts || 0} total attempts</small>
              </div>
            </Col>
            <Col md="3">
              <div className="p-2">
                <h6 className="text-muted mb-1">Reliability</h6>
                <small>
                  {(test.stats?.totalAttempts || 0) >= 30 ? 'High' : 
                   (test.stats?.totalAttempts || 0) >= 10 ? 'Medium' : 'Low'}
                </small>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default TestAnalytics;