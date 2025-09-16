import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Progress,
  Row,
  Spinner,
  Table
} from 'reactstrap';
import apiService from '../services/ApiService';
import type {
  Result,
  ResultQuestion,
  Test,
  TestSettings,
  SessionStatus
} from '../types';

import {
  formatDuration
} from '../types';

// Extended interfaces to handle MongoDB-specific fields and populated references
interface ExtendedResult extends Omit<Result, 'testId'> {
  testId: string | { _id: string; title: string; description: string };
}

interface ExtendedTest extends Test {
  settings: TestSettings & {
    useSections: boolean;
    timeLimit: number;
  };
}

interface SectionSummary {
  sectionIndex: number;
  sectionName: string;
  questions: ResultQuestion[];
  totalPoints: number;
  earnedPoints: number;
  correctAnswers: number;
  totalTime: number;
}

const ResultDetailsPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<ExtendedResult | null>(null);
  const [test, setTest] = useState<ExtendedTest | null>(null);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resultId) {
      fetchData();
    }
  }, [resultId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const resultData = await apiService.getResult(resultId!) as ExtendedResult;

      if (!resultData || !resultData._id) {
        throw new Error('Failed to fetch result');
      }

      const testId = typeof resultData.testId === 'object' ? resultData.testId._id : resultData.testId;
      const testData = await apiService.getTest(testId) as ExtendedTest;

      if (!testData || !testData._id) {
        throw new Error('Failed to fetch test');
      }

      setTest(testData);
      setResult(resultData);

      // Process sections if applicable
      if (testData.settings.useSections && resultData.questions.some(q => q.sectionName)) {
        processSections(resultData.questions);
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const processSections = (questions: ResultQuestion[]) => {
    const sectionMap = new Map<string, ResultQuestion[]>();

    // Group questions by section
    questions.forEach(question => {
      const sectionKey = question.sectionName || 'No Section';
      if (!sectionMap.has(sectionKey)) {
        sectionMap.set(sectionKey, []);
      }
      sectionMap.get(sectionKey)!.push(question);
    });

    // Create section summaries
    const sectionSummaries: SectionSummary[] = [];

    sectionMap.forEach((sectionQuestions, sectionName) => {
      const sectionIndex = sectionQuestions[0]?.sectionIndex ?? 0;
      const totalPoints = sectionQuestions.reduce((sum, q) => sum + (q.pointsPossible || 10), 0);
      const earnedPoints = sectionQuestions.reduce((sum, q) => sum + (getPointsEarned(q)), 0);
      const correctAnswers = sectionQuestions.filter(q => q.isCorrect === true).length;
      const totalTime = sectionQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);

      sectionSummaries.push({
        sectionIndex,
        sectionName,
        questions: sectionQuestions,
        totalPoints,
        earnedPoints,
        correctAnswers,
        totalTime
      });
    });

    // Sort by section index
    sectionSummaries.sort((a, b) => a.sectionIndex - b.sectionIndex);
    setSections(sectionSummaries);
  };

  const formatTime = (seconds: number): string => {
    return formatDuration(seconds);
  };

  // Helper function to get points earned from either field
  const getPointsEarned = (question: ResultQuestion): number => {
    return question.pointsEarned ?? question.pointsAwarded ?? 0;
  };

  const getStatusColor = (status: SessionStatus, passed?: boolean): string => {
    if (status === 'completed') {
      return passed ? 'success' : 'danger';
    }
    const colors: Record<SessionStatus, string> = {
      inProgress: 'primary',
      expired: 'warning',
      abandoned: 'secondary',
      completed: 'success',
      paused: 'info'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '80px' }}>
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <Spinner color="primary" size="lg" />
            <p className="mt-3 text-muted">Loading result details...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !result || !test) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', paddingTop: '80px' }}>
        <Container>
          <Alert color="danger" className="mt-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error || 'Result not found'}
            <div className="mt-2">
              <Button color="outline-danger" size="sm" onClick={() => navigate('/results')}>
                <i className="fas fa-arrow-left me-2"></i>
                Back to Results
              </Button>
            </div>
          </Alert>
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
                  <i className="fas fa-chart-line me-2 text-primary"></i>
                  Test Result Details
                </h1>
                <p className="text-muted mb-0">
                  Detailed breakdown of your test performance
                </p>
              </div>
              <Button color="outline-primary" onClick={() => navigate('/results')}>
                <i className="fas fa-arrow-left me-2"></i>
                Back to Results
              </Button>
            </div>
          </Col>
        </Row>

        {/* Result Summary */}
        <Row className="mb-4">
          <Col lg={12}>
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-trophy me-2 text-warning"></i>
                    {test.title} - Attempt #{result.attemptNumber}
                  </h5>
                  <Badge
                    color={getStatusColor(result.status, result.score.passed)}
                    className="px-3 py-2 fs-6"
                  >
                    {result.status === 'completed'
                      ? (result.score.passed ? 'PASSED' : 'FAILED')
                      : result.status.toUpperCase()
                    }
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={3}>
                    <div className="text-center">
                      <div className="mb-2">
                        <Progress
                          value={result.score.percentage}
                          color={result.score.passed ? 'success' : 'danger'}
                          style={{ height: '12px' }}
                        />
                      </div>
                      <h4 className="mb-1">
                        {result.score.percentage.toFixed(1)}%
                      </h4>
                      <p className="text-muted small mb-0">
                        {result.score.earnedPoints} / {result.score.totalPoints} points
                      </p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <i className="fas fa-clock text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                      <h5 className="mb-1">{formatTime(result.timeSpent)}</h5>
                      <p className="text-muted small mb-0">Time Spent</p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <i className="fas fa-calendar text-info mb-2" style={{ fontSize: '2rem' }}></i>
                      <h6 className="mb-1">{new Date(result.createdAt).toLocaleDateString()}</h6>
                      <p className="text-muted small mb-0">
                        {new Date(result.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <i className="fas fa-question-circle text-secondary mb-2" style={{ fontSize: '2rem' }}></i>
                      <h5 className="mb-1">{result.questions.length}</h5>
                      <p className="text-muted small mb-0">Total Questions</p>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Section Performance (if applicable) */}
        {sections.length > 0 && (
          <Row className="mb-4">
            <Col lg={12}>
              <Card className="shadow-sm border-0">
                <CardHeader className="bg-white">
                  <h5 className="mb-0">
                    <i className="fas fa-layer-group me-2 text-primary"></i>
                    Section Performance
                  </h5>
                </CardHeader>
                <CardBody>
                  <Row>
                    {sections.map((section) => (
                      <Col md={6} lg={4} key={section.sectionIndex} className="mb-3">
                        <Card className="border">
                          <CardBody>
                            <h6 className="mb-2">{section.sectionName}</h6>
                            <div className="mb-2">
                              <Progress
                                value={(section.earnedPoints / section.totalPoints) * 100}
                                color={section.earnedPoints >= section.totalPoints * 0.7 ? 'success' : 'warning'}
                                style={{ height: '8px' }}
                              />
                            </div>
                            <div className="d-flex justify-content-between text-sm">
                              <span>{section.earnedPoints}/{section.totalPoints} pts</span>
                              <span>{section.correctAnswers}/{section.questions.length} correct</span>
                            </div>
                            <small className="text-muted">
                              Time: {formatTime(section.totalTime)}
                            </small>
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* Question Summary Table */}
        <Row>
          <Col lg={12}>
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-list me-2 text-primary"></i>
                  Question Summary
                </h5>
              </CardHeader>
              <CardBody className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Question</th>
                        <th>Result</th>
                        <th>Score</th>
                        <th>Time</th>
                        <th>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.questions.map((question, index) => (
                        <tr key={question.questionId}>
                          <td>
                            <div>
                              <div className="fw-medium text-dark">
                                Question {index + 1}
                              </div>
                              <div className="small text-muted">
                                {question.title}
                              </div>
                              {question.sectionName && (
                                <div className="mt-1">
                                  <Badge color="info" size="sm">{question.sectionName}</Badge>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <Badge
                              color={question.isCorrect === true ? 'success' : question.isCorrect === false ? 'danger' : 'secondary'}
                              className="px-2 py-1"
                            >
                              {question.isCorrect === true ? 'Correct' : question.isCorrect === false ? 'Incorrect' : 'Not Graded'}
                            </Badge>
                          </td>
                          <td>
                            <span className="fw-bold">{getPointsEarned(question)}</span>
                            <span className="text-muted"> / {question.pointsPossible || 10}</span>
                          </td>
                          <td>
                            <span className="text-muted">{formatTime(question.timeSpent || 0)}</span>
                          </td>
                          <td>
                            <div style={{ width: '80px' }}>
                              <Progress
                                value={((getPointsEarned(question)) / (question.pointsPossible || 10)) * 100}
                                color={question.isCorrect === true ? 'success' : question.isCorrect === false ? 'danger' : 'secondary'}
                                style={{ height: '6px' }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResultDetailsPage;