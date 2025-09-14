import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Button,
  ButtonGroup,
  Badge,
  Progress,
  Alert,
  Spinner,
  Form,
  FormGroup,
  Input,
  Label
} from 'reactstrap';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  CheckCircle,
  Circle,
  Play,
  Square,
  Code,
  List,
  Eye,
  EyeOff,
  Flag,
  RotateCcw
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/ApiService';
import type { Test, Question, TestSession, TestSessionQuestion, Language, QuestionType } from '../../types';

// Monaco language mapping
const getMonacoLanguage = (language?: Language): string => {
  const languageMap: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    python: 'python',
    sql: 'sql',
    dart: 'dart',
    react: 'javascript',
    reactNative: 'javascript',
    flutter: 'dart',
    express: 'javascript'
  };
  return languageMap[language || 'javascript'] || 'javascript';
};

interface TestTakingInterfaceProps {
  testSession?: TestSession;
  test?: Test;
  mode?: 'taking' | 'preview';
  onBack?: () => void;
  title?: string;
}

interface FlattenedQuestion extends Question {
  points: number;
  sectionIndex?: number;
  sectionName?: string;
  questionIndex: number;
  sectionQuestionIndex?: number;
}

const TestTakingInterface: React.FC<TestTakingInterfaceProps> = ({
  testSession,
  test,
  mode = 'taking',
  onBack,
  title
}) => {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  const isPreviewMode = mode === 'preview';

  // Flatten questions with section information from the populated test object
  const flattenedQuestions: FlattenedQuestion[] = React.useMemo(() => {
    if (!test) return [];

    const flattened: FlattenedQuestion[] = [];
    let overallIndex = 0;

    if (test.settings?.useSections && test.sections) {
      test.sections.forEach((section, sectionIndex) => {
        section.questions?.forEach((questionRef, sectionQuestionIndex) => {
          const question = (questionRef as any).questionData;
          if (question) {
            flattened.push({
              ...question,
              _id: question._id,
              points: questionRef.points,
              sectionIndex,
              sectionName: section.name,
              questionIndex: overallIndex,
              sectionQuestionIndex
            });
            overallIndex++;
          }
        });
      });
    } else if (test.questions) {
      test.questions.forEach((questionRef, index) => {
        const question = (questionRef as any).questionData;
        if (question) {
          flattened.push({
            ...question,
            _id: question._id,
            points: questionRef.points,
            questionIndex: index
          });
        }
      });
    }

    return flattened;
  }, [test]);

  const currentQuestion = flattenedQuestions[currentQuestionIndex];
  const totalQuestions = flattenedQuestions.length;

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  // Answer handling
  const handleAnswerChange = (questionId: string, answer: any) => {
    if (!isPreviewMode) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
    }
  };

  const handleCodeChange = (code: string) => {
    if (!isPreviewMode && currentQuestion) {
      handleAnswerChange(currentQuestion._id, code);
    }
  };

  const toggleFlag = (questionIndex: number) => {
    if (!isPreviewMode) {
      setFlaggedQuestions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(questionIndex)) {
          newSet.delete(questionIndex);
        } else {
          newSet.add(questionIndex);
        }
        return newSet;
      });
    }
  };

  // Get current section info
  const getCurrentSectionInfo = () => {
    if (!currentQuestion || !test?.settings?.useSections) {
      return null;
    }
    
    const section = test.sections?.[currentQuestion.sectionIndex!];
    const sectionQuestions = flattenedQuestions.filter(q => q.sectionIndex === currentQuestion.sectionIndex);
    const currentInSection = sectionQuestions.findIndex(q => q.questionIndex === currentQuestionIndex);
    
    return {
      name: section?.name || 'Section',
      current: currentInSection + 1,
      total: sectionQuestions.length,
      timeLimit: section?.timeLimit || 0
    };
  };

  const sectionInfo = getCurrentSectionInfo();

  // Progress calculation
  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Debug logging
  useEffect(() => {
    console.log('TestTakingInterface: Component mounted/updated');
    console.log('TestTakingInterface: Test data:', test);
    console.log('TestTakingInterface: Flattened questions:', flattenedQuestions);
    console.log('TestTakingInterface: Current question:', currentQuestion);
    console.log('TestTakingInterface: Total questions:', totalQuestions);
  }, [test, flattenedQuestions, currentQuestion, totalQuestions]);

  if (!test) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">Loading test...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!currentQuestion) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FileText size={48} className="text-muted mb-3" />
            <h5>No questions available</h5>
            <p className="text-muted">
              This test doesn't have any questions yet or the questions couldn't be loaded.
            </p>
            <div className="mt-3">
              <small className="text-muted d-block mb-2">Debug info:</small>
              <small className="text-muted d-block">Test _id: {test._id}</small>
              <small className="text-muted d-block">Use Sections: {test.settings?.useSections ? 'Yes' : 'No'}</small>
              <small className="text-muted d-block">Sections Count: {test.sections?.length || 0}</small>
              <small className="text-muted d-block">Questions Count: {test.questions?.length || 0}</small>
              <small className="text-muted d-block">Flattened Questions: {flattenedQuestions.length}</small>
            </div>
            {onBack && (
              <Button color="secondary" onClick={onBack} className="mt-3">
                <ChevronLeft size={16} className="me-1" />
                Back
              </Button>
            )}
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div style={{ 
      height: '100%', // Use full height of parent
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div className="bg-white border-bottom shadow-sm">
        <Container fluid>
          <div className="py-3">
            <Row className="align-items-center">
              <Col md={3}>
                <div className="d-flex align-items-center">
                  {onBack && (
                    <Button color="outline-secondary" size="sm" onClick={onBack} className="me-3">
                      <ChevronLeft size={16} />
                    </Button>
                  )}
                  <div>
                    <h6 className="mb-0">{title || test?.title || 'Test'}</h6>
                    <small className="text-muted">
                      {isPreviewMode ? 'Preview Mode' : 'Taking Test'}
                    </small>
                  </div>
                </div>
              </Col>
              
              <Col md={6}>
                {/* Progress Bar */}
                <div className="text-center">
                  <div className="mb-1">
                    <small className="text-muted">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                      {sectionInfo && (
                        <> • {sectionInfo.name} ({sectionInfo.current}/{sectionInfo.total})</>
                      )}
                    </small>
                  </div>
                  <Progress value={progressPercentage} color="primary" className="mb-1" style={{ height: '6px' }} />
                </div>
              </Col>
              
              <Col md={3} className="text-end">
                {!isPreviewMode && (
                  <div className="d-flex align-items-center justify-content-end gap-2">
                    <Button
                      color={flaggedQuestions.has(currentQuestionIndex) ? 'warning' : 'outline-secondary'}
                      size="sm"
                      onClick={() => toggleFlag(currentQuestionIndex)}
                    >
                      <Flag size={16} />
                    </Button>
                    <div className="d-flex align-items-center">
                      <Clock size={16} className="me-1 text-muted" />
                      <span className="fw-bold">45:30</span>
                    </div>
                  </div>
                )}
                {isPreviewMode && (
                  <Badge color="info" className="d-flex align-items-center">
                    <Eye size={12} className="me-1" />
                    Preview
                  </Badge>
                )}
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        overflow: 'hidden'
      }}>
        <Container fluid style={{ height: '100%' }}>
          <Row style={{ height: '100%' }} className="g-0">
            {/* Left Panel - Question */}
            <Col md={6} className="d-flex flex-column border-end">
              <div className="p-4 flex-grow-1 overflow-auto">
                {/* Question Header */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">{currentQuestion.title}</h5>
                    <Badge color="primary">{currentQuestion.points} pts</Badge>
                  </div>
                  
                  {/* Question Metadata */}
                  <div className="d-flex gap-2 mb-3">
                    <Badge color="secondary">
                      {currentQuestion.type.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                    {currentQuestion.difficulty && (
                      <Badge color={
                        currentQuestion.difficulty === 'easy' ? 'success' :
                        currentQuestion.difficulty === 'medium' ? 'warning' : 'danger'
                      }>
                        {currentQuestion.difficulty}
                      </Badge>
                    )}
                    {currentQuestion.language && (
                      <Badge color="info">{currentQuestion.language}</Badge>
                    )}
                  </div>
                </div>

                {/* Question Description */}
                <div className="mb-4">
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {currentQuestion.description}
                  </p>
                </div>

                {/* Code Snippet for Multiple Choice (if present) */}
                {currentQuestion.type === 'multipleChoice' && currentQuestion.options?.[0] && (
                  <div className="mb-4">
                    <h6 className="mb-2">Code:</h6>
                    <div className="border rounded" style={{ height: '300px' }}>
                      <Editor
                        height="300px"
                        language={getMonacoLanguage(currentQuestion.language)}
                        value={currentQuestion.options[0]}
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
              </div>

              {/* Navigation */}
              <div className="p-3 border-top bg-light">
                <div className="d-flex justify-content-between">
                  <Button
                    color="outline-secondary"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft size={16} className="me-1" />
                    Previous
                  </Button>
                  
                  <div className="text-center">
                    <small className="text-muted">
                      {currentQuestionIndex + 1} / {totalQuestions}
                    </small>
                  </div>
                  
                  <Button
                    color="primary"
                    onClick={goToNextQuestion}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                  >
                    Next
                    <ChevronRight size={16} className="ms-1" />
                  </Button>
                </div>
              </div>
            </Col>

            {/* Right Panel - Answer Interface */}
            <Col md={6} className="d-flex flex-column">
              <div className="p-4 flex-grow-1 overflow-auto">
                <h6 className="mb-3">Your Answer:</h6>
                
                {/* Multiple Choice Options */}
                {currentQuestion.type === 'multipleChoice' && (
                  <div>
                    {currentQuestion.options?.slice(1).map((option, index) => (
                      <div key={index} className="mb-3">
                        <Label 
                          check 
                          className="d-flex align-items-start p-3 border rounded cursor-pointer hover-bg-light"
                          style={{ 
                            backgroundColor: !isPreviewMode && answers[currentQuestion._id] === index + 1 ? '#e3f2fd' : 'transparent',
                            borderColor: !isPreviewMode && answers[currentQuestion._id] === index + 1 ? '#1976d2' : '#dee2e6'
                          }}
                        >
                          <Input
                            type="radio"
                            name={`question-${currentQuestion._id}`}
                            value={index + 1}
                            checked={!isPreviewMode ? answers[currentQuestion._id] === index + 1 : false}
                            onChange={() => handleAnswerChange(currentQuestion._id, index + 1)}
                            disabled={isPreviewMode}
                            className="me-3 mt-1"
                          />
                          <div>
                            <div className="fw-medium mb-1">
                              {String.fromCharCode(65 + index)}. {option}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                {/* True/False Options */}
                {currentQuestion.type === 'trueFalse' && (
                  <div>
                    <div className="mb-3">
                      <Label 
                        check 
                        className="d-flex align-items-center p-3 border rounded cursor-pointer hover-bg-light"
                        style={{ 
                          backgroundColor: !isPreviewMode && answers[currentQuestion._id] === true ? '#e8f5e8' : 'transparent',
                          borderColor: !isPreviewMode && answers[currentQuestion._id] === true ? '#4caf50' : '#dee2e6'
                        }}
                      >
                        <Input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          checked={!isPreviewMode ? answers[currentQuestion._id] === true : false}
                          onChange={() => handleAnswerChange(currentQuestion._id, true)}
                          disabled={isPreviewMode}
                          className="me-3"
                        />
                        <div className="d-flex align-items-center">
                          <CheckCircle size={20} className="me-2 text-success" />
                          <span className="fw-medium">True</span>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="mb-3">
                      <Label 
                        check 
                        className="d-flex align-items-center p-3 border rounded cursor-pointer hover-bg-light"
                        style={{ 
                          backgroundColor: !isPreviewMode && answers[currentQuestion._id] === false ? '#ffebee' : 'transparent',
                          borderColor: !isPreviewMode && answers[currentQuestion._id] === false ? '#f44336' : '#dee2e6'
                        }}
                      >
                        <Input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          checked={!isPreviewMode ? answers[currentQuestion._id] === false : false}
                          onChange={() => handleAnswerChange(currentQuestion._id, false)}
                          disabled={isPreviewMode}
                          className="me-3"
                        />
                        <div className="d-flex align-items-center">
                          <Square size={20} className="me-2 text-danger" />
                          <span className="fw-medium">False</span>
                        </div>
                      </Label>
                    </div>
                  </div>
                )}

                {/* Code Editor for Code Questions */}
                {(currentQuestion.type === 'codeChallenge' || currentQuestion.type === 'codeDebugging') && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">
                        {currentQuestion.type === 'codeDebugging' ? 'Fix the code:' : 'Write your solution:'}
                      </h6>
                      {!isPreviewMode && (
                        <Button color="outline-secondary" size="sm" onClick={() => handleCodeChange('')}>
                          <RotateCcw size={14} className="me-1" />
                          Reset
                        </Button>
                      )}
                    </div>
                    
                    <div className="border rounded" style={{ height: '400px' }}>
                      <Editor
                        height="400px"
                        language={getMonacoLanguage(currentQuestion.language)}
                        value={
                          isPreviewMode 
                            ? currentQuestion.options?.[0] || `// ${currentQuestion.type === 'codeDebugging' ? 'Fix this code' : 'Write your solution here'}`
                            : answers[currentQuestion._id] || currentQuestion.options?.[0] || ''
                        }
                        onChange={(value) => handleCodeChange(value || '')}
                        options={{
                          fontSize: 14,
                          fontFamily: 'monospace',
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          lineNumbers: 'on',
                          roundedSelection: false,
                          padding: { top: 10 },
                          automaticLayout: true,
                          theme: 'vs-light',
                          readOnly: isPreviewMode
                        }}
                      />
                    </div>
                    
                    {isPreviewMode && (
                      <Alert color="info" className="mt-2 mb-0">
                        <Eye size={16} className="me-2" />
                        Preview mode - code editor is read-only
                      </Alert>
                    )}
                  </div>
                )}
              </div>

              {/* Answer Status */}
              <div className="p-3 border-top bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {!isPreviewMode && (
                      <span className="text-muted small">
                        {answers[currentQuestion._id] !== undefined ? (
                          <span className="text-success">
                            <CheckCircle size={14} className="me-1" />
                            Answered
                          </span>
                        ) : (
                          <span className="text-muted">
                            <Circle size={14} className="me-1" />
                            Not answered
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  
                  {!isPreviewMode && (
                    <div className="d-flex gap-2">
                      <Button color="outline-warning" size="sm" onClick={() => handleAnswerChange(currentQuestion._id, undefined)}>
                        Clear Answer
                      </Button>
                      {currentQuestionIndex === totalQuestions - 1 && (
                        <Button color="success" size="sm">
                          Submit Test
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default TestTakingInterface;