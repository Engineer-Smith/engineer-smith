import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Progress,
  Spinner,
  Table,
  Collapse
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';

// Updated interfaces based on actual MongoDB document structure
interface ResultData {
  _id: string;
  sessionId: string;
  testId: string;
  userId: string;
  organizationId: string;
  attemptNumber: number;
  status: string;
  completedAt?: string;
  timeSpent: number;
  questions: QuestionResult[];
  score: {
    totalPoints: number;
    earnedPoints: number;
    percentage: number;
    passed: boolean;
    passingThreshold: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unansweredQuestions: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface QuestionResult {
  questionId: string;
  questionNumber: number;
  sectionIndex?: number;
  sectionName?: string;

  // Direct fields from MongoDB structure
  title: string;
  type: string;
  language: string;
  category?: string;
  difficulty: string;

  // Answer fields - try both names for compatibility
  answer?: any;
  studentAnswer?: any;
  correctAnswer?: any;

  // Results
  isCorrect?: boolean;
  pointsAwarded?: number;
  pointsEarned?: number;
  pointsPossible?: number;

  // Timing
  timeSpent?: number;
  viewCount?: number;

  // Details object from MongoDB
  details?: {
    options?: string[];
    selectedOption?: number;
    correctOption?: number;
    blanks?: Array<{
      id: string;
      studentAnswer: string;
      correctAnswers: string[];
      isCorrect: boolean;
      hint?: string;
      _id?: string;
    }>;
    codeResults?: {
      executed: boolean;
      passed: boolean;
      totalTests: number;
      passedTests: number;
      executionTime: number;
      error?: string | null;
      codeLength?: number;
    };
  };

  codeSubmissions?: CodeSubmission[];
  _id?: string;
}

interface CodeSubmission {
  code: string;
  submittedAt: string;
  passed: boolean;
  error?: string;
  _id?: string;
}

interface TestData {
  _id: string;
  title: string;
  description: string;
  settings: {
    useSections: boolean;
    timeLimit: number;
  };
}

interface SectionSummary {
  sectionIndex: number;
  sectionName: string;
  questions: QuestionResult[];
  totalPoints: number;
  earnedPoints: number;
  correctAnswers: number;
  totalTime: number;
}

const ResultDetailsPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<ResultData | null>(null);
  const [test, setTest] = useState<TestData | null>(null);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  console.log(result)

  useEffect(() => {
    if (resultId) {
      fetchData();
    }
  }, [resultId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const resultData = await apiService.getResult(resultId!) as ResultData;

      if (!resultData || !resultData._id) {
        throw new Error('Failed to fetch result');
      }

      console.log('Result data received:', resultData);
      console.log('First question:', resultData.questions[0]);

      const testData = await apiService.getTest(resultData.testId) as TestData;

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

  const processSections = (questions: QuestionResult[]) => {
    const sectionMap = new Map<string, QuestionResult[]>();

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

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Helper function to get the answer from either field
  const getAnswer = (question: QuestionResult): any => {
    return question.answer ?? question.studentAnswer;
  };

  // Helper function to get points earned from either field
  const getPointsEarned = (question: QuestionResult): number => {
    return question.pointsAwarded ?? question.pointsEarned ?? 0;
  };

  const formatAnswer = (question: QuestionResult): string => {
    const answer = getAnswer(question);

    if (answer === undefined || answer === null || answer === '') {
      return 'No answer provided';
    }

    // Handle multiple choice - show the actual option text instead of index
    if (question.type === 'multipleChoice' && question.details?.options) {
      const selectedIndex = typeof answer === 'number' ? answer : parseInt(answer);
      if (selectedIndex >= 0 && selectedIndex < question.details.options.length) {
        const optionLetter = String.fromCharCode(65 + selectedIndex); // A, B, C, D
        return `${optionLetter}. ${question.details.options[selectedIndex]}`;
      }
      return `Option ${selectedIndex + 1}`;
    }

    // Handle true/false - could be boolean or index
    if (question.type === 'trueFalse') {
      if (typeof answer === 'boolean') {
        return answer ? 'True' : 'False';
      }
      // Handle index-based true/false (0 = False, 1 = True)
      if (typeof answer === 'number') {
        return answer === 1 ? 'True' : 'False';
      }
      // Handle string representations
      if (typeof answer === 'string') {
        const lowerAnswer = answer.toLowerCase();
        if (lowerAnswer === 'true' || lowerAnswer === '1') return 'True';
        if (lowerAnswer === 'false' || lowerAnswer === '0') return 'False';
      }
      return String(answer); // Fallback
    }

    if (typeof answer === 'boolean') {
      return answer ? 'True' : 'False';
    }

    if (typeof answer === 'object' && !Array.isArray(answer)) {
      // Handle fill-in-the-blank answers
      return Object.entries(answer)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }

    return String(answer);
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

  const getQuestionTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      'multipleChoice': 'Multiple Choice',
      'trueFalse': 'True/False',
      'codeChallenge': 'Code Challenge',
      'fillInTheBlank': 'Fill in the Blank',
      'codeDebugging': 'Code Debugging'
    };
    return typeLabels[type] || type.replace(/([A-Z])/g, ' $1').trim();
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'secondary';
    }
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

        {/* Question Details */}
        <Row>
          <Col lg={12}>
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-list me-2 text-primary"></i>
                    Question Breakdown
                  </h5>
                  <small className="text-muted">
                    Click on questions to view details
                  </small>
                </div>
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
                        <React.Fragment key={question.questionId}>
                          {/* Question Row - IMPROVED UI */}
                          <tr
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleQuestion(question.questionId)}
                            className="user-select-none"
                          >
                            <td>
                              <div className="d-flex align-items-center">
                                <div
                                  className="me-3 d-flex align-items-center justify-content-center bg-light rounded-circle"
                                  style={{ width: '24px', height: '24px', minWidth: '24px' }}
                                >
                                  <i className={`fas fa-chevron-${expandedQuestions.has(question.questionId) ? 'down' : 'right'} text-muted`} style={{ fontSize: '10px' }}></i>
                                </div>
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

                          {/* Expanded Question Details */}
                          <tr>
                            <td colSpan={5} style={{ padding: 0, border: 'none' }}>
                              <Collapse isOpen={expandedQuestions.has(question.questionId)}>
                                <div className="border-top bg-light">
                                  <Card className="m-3 shadow-sm">
                                    <CardBody>
                                      <h6 className="mb-3 text-primary">
                                        <i className="fas fa-info-circle me-2"></i>
                                        Question {index + 1} Details
                                      </h6>

                                      {/* Question Content */}
                                      <div className="mb-4">
                                        <h6 className="text-dark">{question.title}</h6>

                                        {/* Question Type & Language Badges */}
                                        <div className="mb-3">
                                          <Badge color="info" className="me-2">{getQuestionTypeLabel(question.type)}</Badge>
                                          <Badge color="secondary" className="me-2">{question.language}</Badge>
                                          <Badge color={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                                          {question.category && (
                                            <Badge color="outline-secondary" className="ms-2">{question.category}</Badge>
                                          )}
                                        </div>

                                        {/* Multiple Choice Options */}
                                        {question.type === 'multipleChoice' && question.details?.options && (
                                          <div className="mb-3">
                                            <strong className="text-dark">Options:</strong>
                                            <div className="mt-2">
                                              {question.details.options.map((option: string, optionIndex: number) => {
                                                const isSelected = getAnswer(question) === optionIndex;
                                                const isCorrect = question.details?.correctOption === optionIndex;
                                                return (
                                                  <div
                                                    key={optionIndex}
                                                    className={`p-2 rounded mb-2 border ${isSelected
                                                      ? isCorrect
                                                        ? 'bg-success bg-opacity-10 border-success'
                                                        : 'bg-danger bg-opacity-10 border-danger'
                                                      : isCorrect
                                                        ? 'bg-warning bg-opacity-10 border-warning'
                                                        : 'bg-light border-light'
                                                      }`}
                                                  >
                                                    <div className="d-flex align-items-center">
                                                      <span className="fw-bold me-2">
                                                        {String.fromCharCode(65 + optionIndex)}.
                                                      </span>
                                                      <span className={isSelected ? 'fw-bold' : ''}>{option}</span>
                                                      {isSelected && (
                                                        <i className="fas fa-arrow-left text-primary ms-2" title="Your answer"></i>
                                                      )}
                                                      {isCorrect && (
                                                        <i className="fas fa-check text-success ms-2" title="Correct answer"></i>
                                                      )}
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* User Answer */}
                                      <div className="mb-3">
                                        <strong className="text-dark">Your Answer:</strong>
                                        <div className="mt-2 p-3 bg-light border rounded">
                                          {getAnswer(question) && typeof getAnswer(question) === 'string' && getAnswer(question).includes('function') ? (
                                            <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '14px' }}>
                                              <code>{getAnswer(question)}</code>
                                            </pre>
                                          ) : (
                                            <span className="text-dark">{formatAnswer(question)}</span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Fill-in-blank breakdown */}
                                      {question.type === 'fillInTheBlank' && question.details?.blanks && question.details.blanks.length > 0 && (
                                        <div className="mb-3">
                                          <strong className="text-dark">Fill-in-the-blank Results:</strong>
                                          <div className="mt-2">
                                            {question.details.blanks.map((blank, blankIndex) => (
                                              <div key={blank.id} className="mb-2 p-2 border rounded">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                  <strong className="text-dark">Blank {blankIndex + 1}: {blank.id}</strong>
                                                  <Badge color={blank.isCorrect ? 'success' : 'danger'}>
                                                    {blank.isCorrect ? 'Correct' : 'Incorrect'}
                                                  </Badge>
                                                </div>
                                                <div className="small">
                                                  <div><strong>Your answer:</strong> "{blank.studentAnswer}"</div>
                                                  {/* FIXED: Handle missing correctAnswers field */}
                                                  {blank.correctAnswers && blank.correctAnswers.length > 0 ? (
                                                    <div><strong>Accepted answers:</strong> {blank.correctAnswers.join(', ')}</div>
                                                  ) : (
                                                    <div><strong>Status:</strong> {blank.isCorrect ? 'Correct' : 'Incorrect'}</div>
                                                  )}
                                                  {blank.hint && <div><strong>Hint:</strong> {blank.hint}</div>}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Code execution results */}
                                      {(question.type === 'codeChallenge' || question.type === 'codeDebugging') && question.details?.codeResults && (
                                        <div className="mb-3">
                                          <strong className="text-dark">Code Execution Results:</strong>
                                          <div className="mt-2 p-3 border rounded">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                              <Badge color={question.details.codeResults.passed ? 'success' : 'danger'} className="px-3 py-2">
                                                {question.details.codeResults.passed ? 'All Tests Passed' : 'Some Tests Failed'}
                                              </Badge>
                                              <small className="text-muted">
                                                {question.details.codeResults.passedTests}/{question.details.codeResults.totalTests} tests passed
                                              </small>
                                            </div>
                                            {question.details.codeResults.error && (
                                              <Alert color="danger" className="mt-2 mb-0">
                                                <small>Error: {question.details.codeResults.error}</small>
                                              </Alert>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Performance Summary */}
                                      <div className="mt-4 pt-3 border-top">
                                        <Row>
                                          <Col md={4}>
                                            <div className="text-center">
                                              <div className="text-muted small">Time Spent</div>
                                              <div className="fw-bold">{formatTime(question.timeSpent || 0)}</div>
                                            </div>
                                          </Col>
                                          <Col md={4}>
                                            <div className="text-center">
                                              <div className="text-muted small">Points Earned</div>
                                              <div className="fw-bold">{getPointsEarned(question)} / {question.pointsPossible || 10}</div>
                                            </div>
                                          </Col>
                                          <Col md={4}>
                                            <div className="text-center">
                                              <div className="text-muted small">Result</div>
                                              <div>
                                                <Badge color={question.isCorrect === true ? 'success' : 'danger'} className="px-3 py-1">
                                                  {question.isCorrect === true ? 'Correct' : 'Incorrect'}
                                                </Badge>
                                              </div>
                                            </div>
                                          </Col>
                                        </Row>
                                      </div>
                                    </CardBody>
                                  </Card>
                                </div>
                              </Collapse>
                            </td>
                          </tr>
                        </React.Fragment>
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