// pages/ViewQuestionPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import Editor from '@monaco-editor/react';
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
  Table,
  Progress,
  CardHeader,
  Input,
  FormGroup,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  Eye,
  Code,
  CheckCircle,
  XCircle,
  Globe,
  Building,
  Calendar,
  User,
  BarChart3,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Activity,
  PieChart,
  Play,
  TestTube,
  Bug,
  FileCode,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import type { Question, Language, QuestionType, Difficulty } from '../types';

const ViewQuestionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [studentViewMode, setStudentViewMode] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);

  // Student answer simulation states
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);
  const [blankAnswers, setBlankAnswers] = useState<{ [key: string]: string }>({});
  const [studentCode, setStudentCode] = useState('');

  useEffect(() => {
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  const fetchQuestion = async () => {
    if (!questionId) return;

    try {
      setLoading(true);
      setError(null);

      // FIXED: getQuestion returns Question directly, no wrapper
      const question = await apiService.getQuestion(questionId);

      if (!question || !question._id) {
        throw new Error('Failed to fetch question');
      }

      setQuestion(question);

      // Initialize student code based on question type
      if (question.type === 'codeChallenge') {
        setStudentCode(question.codeTemplate || '');
      } else if (question.type === 'codeDebugging') {
        setStudentCode(question.buggyCode || '');
      }

      // Initialize blank answers
      if (question.type === 'fillInTheBlank' && question.blanks) {
        const initialBlanks: { [key: string]: string } = {};
        question.blanks.forEach((blank: {
          id?: string;
          correctAnswers: string[];
          caseSensitive?: boolean;
          hint?: string;
          points?: number;
        }) => {
          if (blank.id) {
            initialBlanks[blank.id] = '';
          }
        });
        setBlankAnswers(initialBlanks);
      }

    } catch (error: any) {
      console.error('Error fetching question:', error);
      setError(error.message || 'Failed to fetch question');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/question-bank/edit/${questionId}`);
  };

  const handleDelete = () => {
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!question || !questionId) return;

    try {
      setDeleting(true);
      // FIXED: deleteQuestion returns { message: string } directly
      const response = await apiService.deleteQuestion(questionId);

      // FIXED: No error property, response IS the success object
      if (!response || !response.message) {
        throw new Error('Failed to delete question');
      }

      navigate('/admin/question-bank', {
        state: { message: 'Question deleted successfully' }
      });
    } catch (error: any) {
      alert('Error deleting question: ' + error.message);
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal(false);
  };

  const handleDuplicate = () => {
    if (!question) return;

    navigate('/admin/question-bank/add', {
      state: {
        duplicateFrom: {
          ...question,
          title: `Copy of ${question.title}`,
          _id: undefined,
          status: 'draft'
        }
      }
    });
  };

  const getMonacoLanguage = (language: Language | undefined): string => {
    switch (language) {
      case 'react':
      case 'reactNative':
      case 'express':
      case 'javascript':
        return 'javascript';
      case 'flutter':
      case 'dart':
        return 'dart';
      case 'typescript':
        return 'typescript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'sql':
        return 'sql';
      case 'python':
        return 'python';
      default:
        return 'plaintext';
    }
  };

  const getDifficultyColor = (difficulty: Difficulty | undefined) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'secondary';
    }
  };

  const getTypeDisplay = (type: QuestionType | undefined) => {
    switch (type) {
      case 'multipleChoice': return 'Multiple Choice';
      case 'trueFalse': return 'True/False';
      case 'codeChallenge': return 'Code Challenge';
      case 'fillInTheBlank': return 'Fill in the Blank';
      case 'codeDebugging': return 'Code Debugging';
      default: return type || 'Unknown';
    }
  };

  const getCategoryDisplay = (category: string | undefined) => {
    switch (category) {
      case 'logic': return 'Logic';
      case 'ui': return 'UI/UX';
      case 'syntax': return 'Syntax';
      default: return category || '';
    }
  };

  const renderStudentView = () => {
    if (!question) return null;

    return (
      <Card className="border-0 shadow-sm mb-4">
        <CardBody>
          <CardTitle tag="h5" className="mb-3 d-flex align-items-center">
            <Eye className="me-2 text-primary" />
            Student View
          </CardTitle>

          {/* Question Description */}
          <div className="mb-4">
            <p className="lead">{question.description}</p>
          </div>

          {/* Multiple Choice */}
          {question.type === 'multipleChoice' && question.options && (
            <div className="mb-4">
              {/* Show code if first option contains code */}
              {question.options[0] && question.options[0].includes('\n') && (
                <div className="mb-3">
                  <h6>Code:</h6>
                  <div className="border rounded" style={{ minHeight: '200px' }}>
                    <Editor
                      height="200px"
                      language={getMonacoLanguage(question.language)}
                      value={question.options[0]}
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        theme: 'vs-light'
                      }}
                    />
                  </div>
                </div>
              )}

              <h6>Choose the correct answer:</h6>
              {question.options.slice(question.options[0].includes('\n') ? 1 : 0).map((option, index) => (
                <FormGroup check key={index} className="mb-2">
                  <Label check className="d-flex align-items-center">
                    <Input
                      type="radio"
                      name="mcAnswer"
                      checked={selectedAnswer === index}
                      onChange={() => setSelectedAnswer(index)}
                      className="me-2"
                    />
                    <span className="fw-medium me-2">
                      {String.fromCharCode(65 + index)}:
                    </span>
                    {option}
                  </Label>
                </FormGroup>
              ))}
            </div>
          )}

          {/* True/False */}
          {question.type === 'trueFalse' && (
            <div className="mb-4">
              <h6>Select True or False:</h6>
              <FormGroup check className="mb-2">
                <Label check className="d-flex align-items-center">
                  <Input
                    type="radio"
                    name="tfAnswer"
                    checked={trueFalseAnswer === true}
                    onChange={() => setTrueFalseAnswer(true)}
                    className="me-2"
                  />
                  True
                </Label>
              </FormGroup>
              <FormGroup check className="mb-2">
                <Label check className="d-flex align-items-center">
                  <Input
                    type="radio"
                    name="tfAnswer"
                    checked={trueFalseAnswer === false}
                    onChange={() => setTrueFalseAnswer(false)}
                    className="me-2"
                  />
                  False
                </Label>
              </FormGroup>
            </div>
          )}

          {/* Fill in the Blank */}
          {question.type === 'fillInTheBlank' && question.codeTemplate && (
            <div className="mb-4">
              <h6>Complete the code by filling in the blanks:</h6>
              <div className="border rounded mb-3">
                <Editor
                  height="300px"
                  language={getMonacoLanguage(question.language)}
                  value={question.codeTemplate}
                  options={{
                    readOnly: true,
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    theme: 'vs-light'
                  }}
                />
              </div>

              {question.blanks && (
                <div>
                  <h6>Fill in the blanks:</h6>
                  {question.blanks.map((blank: {
                    id?: string;
                    correctAnswers: string[];
                    caseSensitive?: boolean;
                    hint?: string;
                    points?: number;
                  }, index: number) => (
                    <FormGroup key={blank.id || index} className="mb-3">
                      <Label>
                        Blank {blank.id || (index + 1)}:
                        {blank.hint && (
                          <small className="text-muted ms-2">
                            <Lightbulb className="icon-xs me-1" />
                            {blank.hint}
                          </small>
                        )}
                      </Label>
                      <Input
                        type="text"
                        value={blankAnswers[blank.id || index] || ''}
                        onChange={(e) => setBlankAnswers(prev => ({
                          ...prev,
                          [blank.id || index]: e.target.value
                        }))}
                        placeholder="Enter your answer..."
                      />
                    </FormGroup>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Code Challenge */}
          {question.type === 'codeChallenge' && (
            <div className="mb-4">
              <h6>Write your solution:</h6>
              <div className="border rounded mb-3">
                <Editor
                  height="400px"
                  language={getMonacoLanguage(question.language)}
                  value={studentCode}
                  onChange={(value) => setStudentCode(value || '')}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    theme: 'vs-light'
                  }}
                />
              </div>
              {question.category === 'logic' && (
                <Button color="success" size="sm" className="d-flex align-items-center">
                  <Play className="me-2 icon-sm" />
                  Run Tests
                </Button>
              )}
            </div>
          )}

          {/* Code Debugging */}
          {question.type === 'codeDebugging' && question.buggyCode && (
            <div className="mb-4">
              <h6>Fix the bugs in this code:</h6>
              <div className="border rounded mb-3">
                <Editor
                  height="400px"
                  language={getMonacoLanguage(question.language)}
                  value={studentCode}
                  onChange={(value) => setStudentCode(value || '')}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    theme: 'vs-light'
                  }}
                />
              </div>
              {question.category === 'logic' && (
                <Button color="success" size="sm" className="d-flex align-items-center">
                  <Bug className="me-2 icon-sm" />
                  Test Fix
                </Button>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  const renderAdminView = () => {
    if (!question) return null;

    return (
      <Card className="border-0 shadow-sm mb-4">
        <CardBody>
          <CardTitle tag="h5" className="mb-3 d-flex align-items-center">
            <Code className="me-2 text-primary" />
            Admin View - Question Details & Answers
          </CardTitle>

          {/* Question Description - The actual question */}
          <div className="mb-4 p-3 bg-info bg-opacity-10 rounded border-start border-4 border-info">
            <h6 className="text-info mb-2">Question Asked:</h6>
            <p className="mb-0">{question.description}</p>
          </div>

          {/* Multiple Choice Answers */}
          {question.type === 'multipleChoice' && question.options && (
            <div className="mb-4">
              {/* Show code if first option contains code */}
              {question.options[0] && question.options[0].includes('\n') && (
                <div className="mb-3">
                  <h6>Code Provided to Students:</h6>
                  <div className="border rounded" style={{ minHeight: '200px' }}>
                    <Editor
                      height="200px"
                      language={getMonacoLanguage(question.language)}
                      value={question.options[0]}
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        theme: 'vs-light'
                      }}
                    />
                  </div>
                </div>
              )}

              <h6>All Options with Correct Answer:</h6>
              {question.options.slice(question.options[0].includes('\n') ? 1 : 0).map((option, index) => (
                <div key={index} className="d-flex align-items-center mb-2 p-2 rounded bg-light">
                  {question.correctAnswer === index ? (
                    <CheckCircle className="text-success me-2 icon-sm" />
                  ) : (
                    <XCircle className="text-muted me-2 icon-sm" />
                  )}
                  <span className="fw-medium me-2">
                    {String.fromCharCode(65 + index)}:
                  </span>
                  <span className={question.correctAnswer === index ? 'text-success fw-medium' : ''}>
                    {option}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* True/False Answer */}
          {question.type === 'trueFalse' && (
            <div className="mb-4">
              <h6>Correct Answer:</h6>
              <div className="d-flex align-items-center">
                {question.correctAnswer ? (
                  <Badge color="success" className="d-flex align-items-center">
                    <CheckCircle className="me-2 icon-sm" />
                    True
                  </Badge>
                ) : (
                  <Badge color="danger" className="d-flex align-items-center">
                    <XCircle className="me-2 icon-sm" />
                    False
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Fill in the Blank - Show Template and Answers */}
          {question.type === 'fillInTheBlank' && (
            <div className="mb-4">
              {question.codeTemplate && (
                <div className="mb-4">
                  <h6>Code Template (with blanks):</h6>
                  <div className="border rounded" style={{ minHeight: '200px' }}>
                    <Editor
                      height="200px"
                      language={getMonacoLanguage(question.language)}
                      value={question.codeTemplate}
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        theme: 'vs-light'
                      }}
                    />
                  </div>
                </div>
              )}

              {question.blanks && (
                <div className="mb-4">
                  <h6>Blank Answers:</h6>
                  <Table striped size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th>Blank ID</th>
                        <th>Correct Answers</th>
                        <th>Case Sensitive</th>
                        <th>Points</th>
                        <th>Hint</th>
                      </tr>
                    </thead>
                    <tbody>
                      {question.blanks.map((blank, index) => (
                        <tr key={index}>
                          <td><code>{blank.id || (index + 1)}</code></td>
                          <td>
                            {blank.correctAnswers.map((answer, i) => (
                              <Badge key={i} color="success" className="me-1">
                                {answer}
                              </Badge>
                            ))}
                          </td>
                          <td>
                            <Badge color={blank.caseSensitive ? 'warning' : 'info'}>
                              {blank.caseSensitive ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td>{blank.points || 1}</td>
                          <td>
                            {blank.hint ? (
                              <small className="text-muted">{blank.hint}</small>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Code Challenge - Show Template */}
          {question.type === 'codeChallenge' && (
            <div className="mb-4">
              {question.codeTemplate && (
                <div className="mb-4">
                  <h6>Starting Code Template:</h6>
                  <div className="border rounded" style={{ minHeight: '200px' }}>
                    <Editor
                      height="200px"
                      language={getMonacoLanguage(question.language)}
                      value={question.codeTemplate}
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        theme: 'vs-light'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Code Debugging - Show Buggy Code and Solution */}
          {question.type === 'codeDebugging' && (
            <div className="mb-4">
              {question.buggyCode && (
                <div className="mb-4">
                  <h6>Buggy Code (Given to Students):</h6>
                  <div className="border rounded border-warning" style={{ minHeight: '200px' }}>
                    <Editor
                      height="200px"
                      language={getMonacoLanguage(question.language)}
                      value={question.buggyCode}
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        theme: 'vs-light'
                      }}
                    />
                  </div>
                </div>
              )}

              {question.solutionCode && (
                <div className="mb-4">
                  <h6>Solution Code (Correct Version):</h6>
                  <div className="border rounded border-success" style={{ minHeight: '200px' }}>
                    <Editor
                      height="200px"
                      language={getMonacoLanguage(question.language)}
                      value={question.solutionCode}
                      options={{
                        readOnly: true,
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        theme: 'vs-light'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Code Configuration (for logic questions) */}
          {['codeChallenge', 'codeDebugging'].includes(question.type) && question.category === 'logic' && question.codeConfig && (
            <div className="mb-4">
              <h6>Code Execution Configuration:</h6>
              <div className="p-3 bg-light rounded">
                <Row>
                  <Col md={6}>
                    <strong>Runtime:</strong> {question.codeConfig.runtime || 'node'}
                  </Col>
                  <Col md={6}>
                    <strong>Entry Function:</strong> {question.codeConfig.entryFunction || 'N/A'}
                  </Col>
                  <Col md={6}>
                    <strong>Timeout:</strong> {question.codeConfig.timeoutMs || 5000}ms
                  </Col>
                  <Col md={6}>
                    <strong>Allow Preview:</strong> {question.codeConfig.allowPreview ? 'Yes' : 'No'}
                  </Col>
                </Row>
              </div>
            </div>
          )}

          {/* Test Cases (for logic questions) */}
          {['codeChallenge', 'codeDebugging'].includes(question.type) && question.category === 'logic' && question.testCases && (
            <div className="mb-4">
              <h6>Test Cases:</h6>
              <Table striped size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Arguments</th>
                    <th>Expected Output</th>
                    <th>Visibility</th>
                  </tr>
                </thead>
                <tbody>
                  {question.testCases.map((testCase, index) => (
                    <tr key={index}>
                      <td>{testCase.name || `Test ${index + 1}`}</td>
                      <td>
                        <code style={{ fontSize: '12px' }}>
                          {Array.isArray(testCase.args) ?
                            JSON.stringify(testCase.args) :
                            String(testCase.args)
                          }
                        </code>
                      </td>
                      <td>
                        <code style={{ fontSize: '12px' }}>
                          {JSON.stringify(testCase.expected)}
                        </code>
                      </td>
                      <td>
                        <Badge color={testCase.hidden ? 'warning' : 'success'} size="sm">
                          {testCase.hidden ? 'Hidden' : 'Visible'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">Loading question details...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error || !question) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert color="danger" className="text-center">
              <strong>Error:</strong> {error || 'Question not found'}
              <div className="mt-3">
                <Button color="primary" onClick={() => navigate('/admin/question-bank')}>
                  Back to Question Bank
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  const canEdit = user?.role === 'admin' || user?.role === 'instructor';
  const canDelete = user?.role === 'admin' ||
    (user?.role === 'instructor' && question.createdBy === user._id);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '20px' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <Container>
          <div className="py-3">
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center">
                  <Button
                    color="link"
                    className="p-0 me-3 text-muted"
                    onClick={() => navigate('/admin/question-bank')}
                  >
                    <ArrowLeft className="icon-md" />
                  </Button>
                  <Eye className="me-3 text-primary icon-lg" />
                  <div>
                    <h1 className="h4 mb-0">Question Details</h1>
                    <p className="text-muted mb-0 small">
                      View and manage question information
                    </p>
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <div className="d-flex gap-2 align-items-center">
                  <FormGroup check className="me-3">
                    <Label check className="d-flex align-items-center">
                      <Input
                        type="checkbox"
                        checked={studentViewMode}
                        onChange={(e) => setStudentViewMode(e.target.checked)}
                        className="me-2"
                      />
                      Student View
                    </Label>
                  </FormGroup>

                  <Button
                    color="secondary"
                    size="sm"
                    onClick={handleDuplicate}
                    className="d-flex align-items-center"
                  >
                    <Copy className="me-2 icon-sm" />
                    Duplicate
                  </Button>
                  {canEdit && (
                    <Button
                      color="primary"
                      size="sm"
                      onClick={handleEdit}
                      className="d-flex align-items-center"
                    >
                      <Edit className="me-2 icon-sm" />
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      color="danger"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="d-flex align-items-center"
                    >
                      <Trash2 className="me-2 icon-sm" />
                      Delete
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <Row>
          {/* Main Content */}
          <Col lg={8}>
            {/* Question Header */}
            <Card className="border-0 shadow-sm mb-4">
              <CardBody>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1">
                    <h2 className="h4 mb-2">{question.title}</h2>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <Badge color={getDifficultyColor(question.difficulty)}>
                        {question.difficulty || 'Unknown'}
                      </Badge>
                      <Badge color="info">
                        {getTypeDisplay(question.type)}
                      </Badge>
                      <Badge color="secondary">
                        {question.language || 'Unknown'}
                      </Badge>
                      {question.category && (
                        <Badge color="dark">
                          {getCategoryDisplay(question.category)}
                        </Badge>
                      )}
                      <Badge color={question.status === 'active' ? 'success' :
                        question.status === 'draft' ? 'warning' : 'secondary'}>
                        {question.status || 'Unknown'}
                      </Badge>
                      {question.isGlobal && (
                        <Badge color="primary">
                          <Globe className="me-1 icon-xs" />
                          Global
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {question.tags && question.tags.length > 0 && (
                  <div className="mb-3">
                    <small className="text-muted d-block mb-2">Tags:</small>
                    <div className="d-flex flex-wrap gap-1">
                      {question.tags.map(tag => (
                        <Badge key={tag} color="secondary" className="text-white small">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Question Content - Toggle between student and admin view */}
            {studentViewMode ? renderStudentView() : renderAdminView()}
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Metadata */}
            <Card className="border-0 shadow-sm mb-4">
              <CardBody>
                <CardTitle tag="h6" className="mb-3 d-flex align-items-center">
                  <BarChart3 className="me-2 text-primary" />
                  Question Info
                </CardTitle>

                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <User className="me-2 text-muted icon-sm" />
                    <small className="text-muted">Created by</small>
                  </div>
                  <div className="ps-4">
                    <span>{question.createdBy || 'Unknown'}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <Calendar className="me-2 text-muted icon-sm" />
                    <small className="text-muted">Created</small>
                  </div>
                  <div className="ps-4">
                    <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {question.updatedAt && question.updatedAt !== question.createdAt && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Calendar className="me-2 text-muted icon-sm" />
                      <small className="text-muted">Updated</small>
                    </div>
                    <div className="ps-4">
                      <span>{new Date(question.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <Building className="me-2 text-muted icon-sm" />
                    <small className="text-muted">Scope</small>
                  </div>
                  <div className="ps-4">
                    {question.isGlobal ? (
                      <Badge color="primary">
                        <Globe className="me-1 icon-xs" />
                        Global
                      </Badge>
                    ) : (
                      <Badge color="secondary">Organization</Badge>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Usage Statistics */}
            {question.usageStats && (
              <Card className="border-0 shadow-sm mb-4">
                <CardBody>
                  <CardTitle tag="h6" className="mb-3 d-flex align-items-center">
                    <Target className="me-2 text-primary" />
                    Usage Statistics
                  </CardTitle>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Times Used</small>
                      <Badge color="info">{question.usageStats.timesUsed || 0}</Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Total Attempts</small>
                      <Badge color="secondary">{question.usageStats.totalAttempts || 0}</Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Success Rate</small>
                      <Badge color={
                        (question.usageStats.successRate || 0) >= 0.7 ? 'success' :
                          (question.usageStats.successRate || 0) >= 0.5 ? 'warning' : 'danger'
                      }>
                        {((question.usageStats.successRate || 0) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress
                      value={(question.usageStats.successRate || 0) * 100}
                      color={
                        (question.usageStats.successRate || 0) >= 0.7 ? 'success' :
                          (question.usageStats.successRate || 0) >= 0.5 ? 'warning' : 'danger'
                      }
                      className="mt-1"
                      style={{ height: '6px' }}
                    />
                  </div>

                  <div className="mb-0">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <small className="text-muted">Avg. Time</small>
                      <div className="d-flex align-items-center">
                        <Clock className="me-1 icon-xs text-muted" />
                        <span className="small">{Math.round(question.usageStats.averageTime || 0)}s</span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Question Analytics */}
            <Card className="border-0 shadow-sm mb-4">
              <CardHeader className="bg-white border-0 pb-0">
                <CardTitle tag="h6" className="mb-0 d-flex align-items-center">
                  <BarChart3 className="me-2 text-primary" />
                  Question Analytics
                </CardTitle>
              </CardHeader>
              <CardBody className="pt-3">
                <Row className="g-3">
                  <Col md={4}>
                    <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                      <Users className="text-primary mb-2 icon-lg" />
                      <div className="fw-bold h5 mb-0">{question.usageStats?.timesUsed || 0}</div>
                      <small className="text-muted">Times Used in Tests</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                      <Target className="text-success mb-2 icon-lg" />
                      <div className="fw-bold h5 mb-0">
                        {question.usageStats?.totalAttempts ?
                          Math.round((question.usageStats.correctAttempts / question.usageStats.totalAttempts) * 100) : 0}%
                      </div>
                      <small className="text-muted">Success Rate</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                      <Clock className="text-info mb-2 icon-lg" />
                      <div className="fw-bold h5 mb-0">
                        {Math.round((question.usageStats?.averageTime || 0) / 60)}m
                      </div>
                      <small className="text-muted">Avg. Completion Time</small>
                    </div>
                  </Col>
                </Row>

                {/* Recommendations */}
                {(question.usageStats?.totalAttempts || 0) > 5 && (
                  <div className="mt-4">
                    <h6 className="mb-3">Recommendations</h6>
                    <div className="alert alert-light border-start border-4 border-info">
                      {(question.usageStats?.successRate || 0) < 0.3 ? (
                        <div className="d-flex align-items-start">
                          <TrendingDown className="text-danger me-2 mt-1 icon-sm" />
                          <div>
                            <strong className="text-danger">Low Success Rate</strong>
                            <p className="mb-0 small text-muted">
                              This question has a very low success rate. Consider reviewing the question difficulty,
                              clarity, or providing additional learning materials.
                            </p>
                          </div>
                        </div>
                      ) : (question.usageStats?.successRate || 0) > 0.9 ? (
                        <div className="d-flex align-items-start">
                          <TrendingUp className="text-success me-2 mt-1 icon-sm" />
                          <div>
                            <strong className="text-success">High Success Rate</strong>
                            <p className="mb-0 small text-muted">
                              This question has a very high success rate. It might be too easy for the intended difficulty level.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex align-items-start">
                          <Target className="text-success me-2 mt-1 icon-sm" />
                          <div>
                            <strong className="text-success">Good Performance</strong>
                            <p className="mb-0 small text-muted">
                              This question has a balanced success rate and appears to be well-calibrated.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal} toggle={cancelDelete} centered>
        <ModalHeader toggle={cancelDelete} className="border-0 pb-0">
          <div className="d-flex align-items-center">
            <div className="p-2 rounded bg-danger bg-opacity-10 me-3">
              <AlertTriangle className="text-danger icon-md" />
            </div>
            <div>
              <h5 className="mb-0">Delete Question</h5>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pt-2">
          <p className="mb-3">
            Are you sure you want to delete this question? This action cannot be undone.
          </p>
          <div className="p-3 bg-light rounded mb-3">
            <strong>"{question?.title}"</strong>
          </div>
          <div className="d-flex align-items-start">
            <AlertTriangle className="text-warning me-2 mt-1 icon-sm flex-shrink-0" />
            <small className="text-muted">
              This will permanently remove the question from the question bank. Any tests using this question may be affected.
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
                Delete Question
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Styles */}
      <style>{`
        .icon-xs { width: 12px; height: 12px; }
        .icon-sm { width: 16px; height: 16px; }
        .icon-md { width: 20px; height: 20px; }
        .icon-lg { width: 24px; height: 24px; }
      `}</style>
    </div>
  );
};

export default ViewQuestionPage;