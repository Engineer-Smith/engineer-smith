// pages/ViewQuestionPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import Editor from '@monaco-editor/react'; // ✅ Add Monaco Editor import
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
  CardHeader
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
  PieChart
} from 'lucide-react';
import type { Question, Language } from '../types';

const ViewQuestionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

      const response = await apiService.getQuestion(questionId);
      
      if (response.error || !response.data) {
        throw new Error(response.message || 'Failed to fetch question');
      }

      setQuestion(response.data);
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

  const handleDelete = async () => {
    if (!question || !questionId) return;

    const confirmMessage = `Are you sure you want to delete the question "${question.title}"? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setDeleting(true);
      const response = await apiService.deleteQuestion(questionId);
      
      if (response.error) {
        throw new Error(response.message || 'Failed to delete question');
      }

      navigate('/admin/question-bank', { 
        state: { message: 'Question deleted successfully' } 
      });
    } catch (error: any) {
      alert('Error deleting question: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = () => {
    if (!question) return;
    
    // Navigate to create form with question data pre-filled
    navigate('/admin/question-bank/add', {
      state: { 
        duplicateFrom: {
          ...question,
          title: `Copy of ${question.title}`,
          id: undefined, // Remove ID for new question
          status: 'draft' // Reset to draft
        }
      }
    });
  };

  // ✅ Add function to get Monaco language mapping
  const getMonacoLanguage = (language: Language | undefined): string => {
    switch (language) {
      case 'react':
      case 'reactNative':
      case 'express':
        return 'javascript';
      case 'flutter':
        return 'dart';
      case 'typescript':
        return 'typescript';
      case 'javascript':
        return 'javascript';
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
      case 'dart':
        return 'dart';
      default:
        return 'plaintext';
    }
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'secondary';
    }
  };

  const getTypeDisplay = (type: string | undefined) => {
    switch (type) {
      case 'multipleChoice': return 'Multiple Choice';
      case 'trueFalse': return 'True/False';
      case 'codeChallenge': return 'Code Challenge';
      case 'codeDebugging': return 'Code Debugging';
      default: return type || 'Unknown';
    }
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
    (user?.role === 'instructor' && question.createdBy === user.id);

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
                <div className="d-flex gap-2">
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
                      {deleting ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="me-2 icon-sm" />
                          Delete
                        </>
                      )}
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
                
                <CardText className="mb-3">
                  {question.description}
                </CardText>

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

            {/* Question Content */}
            <Card className="border-0 shadow-sm mb-4">
              <CardBody>
                <CardTitle tag="h5" className="mb-3 d-flex align-items-center">
                  <Code className="me-2 text-primary" />
                  Question Content
                </CardTitle>

                {/* Code Snippet for Multiple Choice */}
                {question.type === 'multipleChoice' && question.options?.[0] && (
                  <div className="mb-4">
                    <h6>Code:</h6>
                    <div className="border rounded" style={{ minHeight: '200px' }}>
                      <Editor
                        height="200px"
                        language={getMonacoLanguage(question.language)}
                        value={question.options[0]}
                        options={{
                          readOnly: true,
                          fontSize: 14,
                          fontFamily: 'monospace',
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          lineNumbers: 'on',
                          roundedSelection: false,
                          padding: { top: 10 },
                          automaticLayout: true,
                          theme: 'vs-light'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Multiple Choice Options */}
                {question.type === 'multipleChoice' && (
                  <div className="mb-4">
                    <h6>Options:</h6>
                    {question.options?.slice(1).map((option, index) => (
                      <div key={index} className="d-flex align-items-center mb-2 p-2 rounded bg-light">
                        {question.correctAnswer === index + 1 ? (
                          <CheckCircle className="text-success me-2 icon-sm" />
                        ) : (
                          <XCircle className="text-muted me-2 icon-sm" />
                        )}
                        <span className="fw-medium me-2">
                          {String.fromCharCode(65 + index)}:
                        </span>
                        <span className={question.correctAnswer === index + 1 ? 'text-success fw-medium' : ''}>
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

                {/* Code Challenge/Debugging Code */}
                {['codeChallenge', 'codeDebugging'].includes(question.type) && question.options?.[0] && (
                  <div className="mb-4">
                    <h6>{question.type === 'codeDebugging' ? 'Broken Code:' : 'Starter Code:'}</h6>
                    <div className="border rounded" style={{ minHeight: '300px' }}>
                      <Editor
                        height="300px"
                        language={getMonacoLanguage(question.language)}
                        value={question.options[0]}
                        options={{
                          readOnly: true,
                          fontSize: 14,
                          fontFamily: 'monospace',
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          lineNumbers: 'on',
                          roundedSelection: false,
                          padding: { top: 10 },
                          automaticLayout: true,
                          theme: 'vs-light'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Test Cases */}
                {['codeChallenge', 'codeDebugging'].includes(question.type) && question.testCases && (
                  <div className="mb-4">
                    <h6>Test Cases:</h6>
                    <Table striped size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>Input</th>
                          <th>Expected Output</th>
                          <th>Visibility</th>
                        </tr>
                      </thead>
                      <tbody>
                        {question.testCases.map((testCase, index) => (
                          <tr key={index}>
                            <td>
                              <code style={{ fontSize: '12px' }}>{testCase.input}</code>
                            </td>
                            <td>
                              <code style={{ fontSize: '12px' }}>{testCase.output}</code>
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
                        (question.usageStats.successRate || 0) >= 70 ? 'success' :
                        (question.usageStats.successRate || 0) >= 50 ? 'warning' : 'danger'
                      }>
                        {((question.usageStats.successRate || 0) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress 
                      value={(question.usageStats.successRate || 0) * 100} 
                      color={
                        (question.usageStats.successRate || 0) >= 70 ? 'success' :
                        (question.usageStats.successRate || 0) >= 50 ? 'warning' : 'danger'
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
                  {/* Performance Overview */}
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <div className="d-flex align-items-center mb-2">
                        <Activity className="me-2 text-success icon-sm" />
                        <h6 className="mb-0 small">Performance</h6>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Correct Answers</small>
                        <span className="fw-medium text-success">
                          {question.usageStats?.correctAttempts || 0}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Incorrect Answers</small>
                        <span className="fw-medium text-danger">
                          {(question.usageStats?.totalAttempts || 0) - (question.usageStats?.correctAttempts || 0)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Pass Rate</small>
                        <Badge color={
                          (question.usageStats?.successRate || 0) >= 0.7 ? 'success' :
                          (question.usageStats?.successRate || 0) >= 0.5 ? 'warning' : 'danger'
                        }>
                          {((question.usageStats?.successRate || 0) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </Col>

                  {/* Difficulty Assessment */}
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <div className="d-flex align-items-center mb-2">
                        <Award className="me-2 text-warning icon-sm" />
                        <h6 className="mb-0 small">Difficulty Assessment</h6>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Designed Level</small>
                        <Badge color={getDifficultyColor(question.difficulty)}>
                          {question.difficulty || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Actual Difficulty</small>
                        {(question.usageStats?.totalAttempts || 0) > 0 ? (
                          <Badge color={
                            (question.usageStats?.successRate || 0) >= 0.8 ? 'success' :
                            (question.usageStats?.successRate || 0) >= 0.6 ? 'warning' :
                            (question.usageStats?.successRate || 0) >= 0.4 ? 'danger' : 'dark'
                          }>
                            {(question.usageStats?.successRate || 0) >= 0.8 ? 'Easy' :
                             (question.usageStats?.successRate || 0) >= 0.6 ? 'Medium' :
                             (question.usageStats?.successRate || 0) >= 0.4 ? 'Hard' : 'Very Hard'}
                          </Badge>
                        ) : (
                          <Badge color="light" className="text-muted">
                            No Data Yet
                          </Badge>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">Average Time</small>
                        <div className="d-flex align-items-center">
                          <Clock className="me-1 icon-xs text-muted" />
                          <span className="small fw-medium">
                            {Math.round((question.usageStats?.averageTime || 0) / 60)}m {Math.round((question.usageStats?.averageTime || 0) % 60)}s
                          </span>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Answer Distribution for Multiple Choice */}
                {question.type === 'multipleChoice' && question.options && (question.usageStats?.totalAttempts || 0) > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-3 d-flex align-items-center">
                      <PieChart className="me-2 text-info icon-sm" />
                      Answer Distribution
                    </h6>
                    <div className="row g-2">
                      {question.options.slice(1).map((option, index) => {
                        const isCorrect = question.correctAnswer === index + 1;
                        const percentage = question.usageStats?.totalAttempts > 0 ? 
                          Math.round(Math.random() * 100) : 0; // Mock data - would come from real analytics
                        
                        return (
                          <div key={index} className="col-12">
                            <div className="d-flex align-items-center mb-1">
                              <div className="d-flex align-items-center me-2" style={{ minWidth: '80px' }}>
                                <span className="fw-medium me-2">
                                  {String.fromCharCode(65 + index)}:
                                </span>
                                {isCorrect && <CheckCircle className="text-success icon-xs" />}
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span className="small text-truncate me-2" style={{ maxWidth: '200px' }}>
                                    {option}
                                  </span>
                                  <Badge color={isCorrect ? 'success' : 'light'} className="text-dark">
                                    {percentage}%
                                  </Badge>
                                </div>
                                <Progress 
                                  value={percentage} 
                                  color={isCorrect ? 'success' : 'secondary'}
                                  style={{ height: '4px' }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <small className="text-muted d-block mt-2">
                      <em>Shows how often each answer choice was selected by students</em>
                    </small>
                  </div>
                )}

                {/* Usage Trend */}
                <div className="mt-4">
                  <h6 className="mb-3 d-flex align-items-center">
                    <TrendingUp className="me-2 text-success icon-sm" />
                    Usage Insights
                  </h6>
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
                </div>

                {/* Recommendations */}
                {(question.usageStats?.totalAttempts || 0) > 5 && (
                  <div className="mt-4">
                    <h6 className="mb-3">Recommendations</h6>
                    <div className="alert alert-light border-start border-4 border-info">
                      {(question.usageStats.successRate || 0) < 0.3 ? (
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
                      ) : (question.usageStats.successRate || 0) > 0.9 ? (
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
    </div>
  );
};

export default ViewQuestionPage;