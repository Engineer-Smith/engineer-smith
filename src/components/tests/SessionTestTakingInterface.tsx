import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Badge,
  Progress,
  Alert,
  Input,
  Label,
  ButtonGroup,
  Spinner
} from 'reactstrap';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  CheckCircle,
  Circle,
  Flag,
  RotateCcw,
  Eye,
  Grid,
  Square,
  WifiOff,
  Wifi,
  Save,
  AlertTriangle
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import MonacoErrorBoundary from '../MonacoErrorBoundary';
import SafeMonacoEditor from '../SafeMonacoEditor';
import type { Test, TestSession, Question, Language } from '../../types';

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

interface FlattenedQuestion {
  _id: string;
  title: string;
  description: string;
  type: string;
  language?: Language;
  options?: string[];
  correctAnswer?: number | boolean;
  testCases?: { input: string; output: string; hidden: boolean }[];
  difficulty?: string;
  points: number;
  sectionIndex?: number;
  sectionName?: string;
  questionIndex: number;
  sectionQuestionIndex?: number;
}

interface SessionTestTakingInterfaceProps {
  test: Test;
  testSession?: TestSession;
  currentQuestionIndex: number;
  currentSectionIndex: number; // ADDED: Current section index
  answers: Record<string, any>;
  flaggedQuestions: Set<number>;
  timeRemaining: number;
  sectionTimeRemaining?: number;
  onAnswerChange: (questionId: string, answer: any) => void;
  onQuestionNavigation: (index: number) => void;
  onFlagToggle: (index: number) => void;
  mode?: 'taking' | 'preview';
  // Optional offline-related props
  isOffline?: boolean;
  isPaused?: boolean;
  queuedChanges?: number;
  lastSaved?: Date;
}

const SessionTestTakingInterface: React.FC<SessionTestTakingInterfaceProps> = ({
  test,
  testSession,
  currentQuestionIndex,
  currentSectionIndex, // ADDED: Accept current section index
  answers,
  flaggedQuestions,
  timeRemaining,
  sectionTimeRemaining,
  onAnswerChange,
  onQuestionNavigation,
  onFlagToggle,
  mode = 'taking',
  isOffline = false,
  isPaused = false,
  queuedChanges = 0,
  lastSaved
}) => {
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [localChanges, setLocalChanges] = useState<Record<string, any>>({});

  const isPreviewMode = mode === 'preview';
  const isDisabled = isPreviewMode || isPaused;

  // Enhanced answer change handler with local state tracking
  const handleAnswerChange = (questionId: string, answer: any) => {
    if (isDisabled) return;
    
    // Track local changes for visual feedback
    setLocalChanges(prev => ({
      ...prev,
      [questionId]: { value: answer, timestamp: new Date() }
    }));
    
    // Call the original handler
    onAnswerChange(questionId, answer);
  };

  // Clear local change tracking when answer is saved
  useEffect(() => {
    if (!isOffline && queuedChanges === 0) {
      setLocalChanges({});
    }
  }, [isOffline, queuedChanges]);

  // FIXED: Filter questions by current section when sections are enabled
  const flattenedQuestions: FlattenedQuestion[] = React.useMemo(() => {
    if (!test) return [];

    const flattened: FlattenedQuestion[] = [];

    if (test.settings?.useSections && test.sections) {
      // Only show questions from the current section
      const currentSection = test.sections[currentSectionIndex];
      if (currentSection) {
        currentSection.questions?.forEach((questionRef, sectionQuestionIndex) => {
          const question = (questionRef as any).questionData;
          if (question) {
            flattened.push({
              ...question,
              _id: question._id,
              points: questionRef.points,
              sectionIndex: currentSectionIndex,
              sectionName: currentSection.name,
              questionIndex: sectionQuestionIndex, // Use section-relative index
              sectionQuestionIndex
            });
          }
        });
      }
    } else if (test.questions) {
      // Non-sectioned tests - show all questions
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
  }, [test, currentSectionIndex]); // FIXED: Added currentSectionIndex dependency

  const currentQuestion = flattenedQuestions[currentQuestionIndex];
  const totalQuestions = flattenedQuestions.length;

  // Navigation functions
  const goToNextQuestion = () => {
    if (isDisabled || currentQuestionIndex >= totalQuestions - 1) return;
    onQuestionNavigation(currentQuestionIndex + 1);
  };

  const goToPreviousQuestion = () => {
    if (isDisabled || currentQuestionIndex <= 0) return;
    onQuestionNavigation(currentQuestionIndex - 1);
  };

  // Get current section info
  const getCurrentSectionInfo = () => {
    if (!currentQuestion || !test?.settings?.useSections) {
      return null;
    }
    
    const section = test.sections?.[currentSectionIndex];
    
    return {
      name: section?.name || 'Section',
      current: currentQuestionIndex + 1, // Section-relative question number
      total: totalQuestions, // Total questions in current section
      timeLimit: section?.timeLimit || 0
    };
  };

  const sectionInfo = getCurrentSectionInfo();

  // Progress calculation - based on current section only
  const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  
  // Count answers only for current section questions
  const answeredCount = flattenedQuestions.filter(q => answers[q._id] !== undefined).length;
  const flaggedCount = Array.from(flaggedQuestions).filter(index => index < totalQuestions).length;

  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if current question has unsaved changes
  const hasUnsavedChanges = (questionId: string) => {
    return localChanges[questionId] !== undefined;
  };

  if (!currentQuestion) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <FileText size={48} className="text-muted mb-3" />
            <h5>No questions available</h5>
            <p className="text-muted">
              {test?.settings?.useSections 
                ? `No questions found in this section or the section couldn't be loaded.`
                : `This test doesn't have any questions yet or the questions couldn't be loaded.`
              }
            </p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      opacity: isPaused ? 0.7 : 1,
      pointerEvents: isPaused ? 'none' : 'auto'
    }}>
      {/* Offline Status Alert */}
      {isOffline && (
        <Alert color="warning" className="mb-0 rounded-0">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <WifiOff size={16} className="me-2" />
              <span>You're offline - answers are being saved locally</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              {queuedChanges > 0 && (
                <Badge color="info">{queuedChanges} changes queued</Badge>
              )}
              {lastSaved && (
                <small className="text-muted">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </small>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Paused State Alert */}
      {isPaused && (
        <Alert color="warning" className="mb-0 rounded-0">
          <div className="d-flex align-items-center justify-content-center">
            <WifiOff size={16} className="me-2" />
            <strong>Test Paused - Connection Lost</strong>
          </div>
        </Alert>
      )}

      {/* Header with progress and controls */}
      <div className="bg-white border-bottom p-3">
        <Container fluid>
          <Row className="align-items-center">
            <Col md={4}>
              <div className="d-flex align-items-center gap-3">
                <div>
                  <h6 className="mb-0">Question {currentQuestionIndex + 1} of {totalQuestions}</h6>
                  <small className="text-muted">
                    {sectionInfo ? `${sectionInfo.name}` : `Progress: ${currentQuestionIndex + 1}/${totalQuestions}`}
                    {timeRemaining > 0 && !sectionInfo && ` • Time: ${formatTime(timeRemaining)}`}
                  </small>
                </div>
              </div>
            </Col>

            <Col md={4} className="text-center">
              <div>
                <div className="mb-1">
                  <small className="text-muted">
                    {test?.settings?.useSections ? 'Section Progress' : 'Test Progress'}
                  </small>
                </div>
                <Progress value={progressPercentage} color="primary" style={{ height: '8px' }} />
                <div className="mt-1">
                  <small className="text-muted">
                    {answeredCount} answered • {flaggedCount} flagged
                  </small>
                </div>
              </div>
            </Col>

            <Col md={4} className="text-end">
              <div className="d-flex align-items-center justify-content-end gap-2">
                <Button
                  color={flaggedQuestions.has(currentQuestionIndex) ? 'warning' : 'outline-secondary'}
                  size="sm"
                  onClick={() => onFlagToggle(currentQuestionIndex)}
                  disabled={isDisabled}
                >
                  <Flag size={16} />
                </Button>
                <Button
                  color="outline-secondary"
                  size="sm"
                  onClick={() => setShowQuestionPanel(!showQuestionPanel)}
                >
                  <Grid size={16} />
                </Button>
                {sectionTimeRemaining !== undefined && (
                  <div className="d-flex align-items-center ms-2">
                    <Clock size={14} className="me-1 text-warning" />
                    <small className={`fw-bold ${sectionTimeRemaining < 120 ? 'text-danger' : 'text-warning'}`}>
                      {formatTime(sectionTimeRemaining)}
                    </small>
                  </div>
                )}
                {isPreviewMode && (
                  <Badge color="info" className="d-flex align-items-center">
                    <Eye size={12} className="me-1" />
                    Preview
                  </Badge>
                )}
                {/* Connection status indicator */}
                {!isPreviewMode && (
                  <div className="d-flex align-items-center ms-2">
                    {isOffline ? (
                      <WifiOff size={14} className="text-warning" />
                    ) : (
                      <Wifi size={14} className="text-success" />
                    )}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Container fluid style={{ height: '100%' }}>
          <Row style={{ height: '100%' }} className="g-0">
            {/* Question Panel (collapsible on mobile) - Only shows current section questions */}
            {showQuestionPanel && (
              <Col md={3} className="border-end bg-light">
                <div className="p-3 border-bottom">
                  <h6 className="mb-0 d-flex justify-content-between align-items-center">
                    {test?.settings?.useSections ? 'Section Questions' : 'Questions'} 
                    <Button 
                      color="outline-secondary" 
                      size="sm"
                      onClick={() => setShowQuestionPanel(false)}
                    >
                      ×
                    </Button>
                  </h6>
                  {sectionInfo && (
                    <small className="text-muted">{sectionInfo.name}</small>
                  )}
                </div>
                <div className="p-2" style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
                  {flattenedQuestions.map((question, index) => {
                    const hasUnsaved = hasUnsavedChanges(question._id);
                    
                    return (
                      <Button
                        key={question._id}
                        color={index === currentQuestionIndex ? 'primary' : 'outline-secondary'}
                        size="sm"
                        className="mb-2 w-100 d-flex justify-content-between align-items-center position-relative"
                        onClick={() => onQuestionNavigation(index)}
                        disabled={isPaused}
                      >
                        <span>Q{index + 1}</span>
                        <div className="d-flex gap-1 align-items-center">
                          {answers[question._id] !== undefined && (
                            <CheckCircle size={12} className="text-success" />
                          )}
                          {flaggedQuestions.has(index) && (
                            <Flag size={12} className="text-warning" />
                          )}
                          {hasUnsaved && (
                            <Save size={10} className="text-info" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </Col>
            )}

            {/* Left Panel - Question */}
            <Col md={showQuestionPanel ? 4 : 6} className="d-flex flex-column border-end">
              <div className="p-4 flex-grow-1 overflow-auto">
                {/* Question Header */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">{currentQuestion.title}</h5>
                    <div className="d-flex align-items-center gap-2">
                      <Badge color="primary">{currentQuestion.points} pts</Badge>
                      {hasUnsavedChanges(currentQuestion._id) && (
                        <Badge color="info" className="d-flex align-items-center">
                          <Save size={10} className="me-1" />
                          Unsaved
                        </Badge>
                      )}
                    </div>
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
                    <MonacoErrorBoundary
                      fallback={
                        <div className="border rounded p-3" style={{ height: '300px', backgroundColor: '#f8f9fa' }}>
                          <Alert color="warning" className="mb-2">
                            <AlertTriangle size={16} className="me-2" />
                            Code editor failed to load
                          </Alert>
                          <pre style={{ 
                            fontSize: '14px', 
                            fontFamily: 'Monaco, "Courier New", monospace',
                            whiteSpace: 'pre-wrap',
                            overflow: 'auto',
                            height: 'calc(100% - 60px)'
                          }}>
                            {currentQuestion.options[0]}
                          </pre>
                        </div>
                      }
                    >
                      <div className="border rounded" style={{ height: '300px' }}>
                        <Editor
                          height="300px"
                          language={getMonacoLanguage(currentQuestion.language)}
                          value={currentQuestion.options[0]}
                          options={{
                            readOnly: true,
                            fontSize: 14,
                            fontFamily: 'Monaco, "Courier New", monospace',
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            lineNumbers: 'on',
                            roundedSelection: false,
                            padding: { top: 10 },
                            automaticLayout: true,
                            theme: 'vs-light',
                            contextmenu: false,
                            smoothScrolling: false
                          }}
                          onMount={(editor, monaco) => {
                            try {
                              console.log('Multiple choice code editor mounted');
                            } catch (error) {
                              console.warn('Monaco setup warning:', error);
                            }
                          }}
                        />
                      </div>
                    </MonacoErrorBoundary>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="p-3 border-top bg-light">
                <div className="d-flex justify-content-between">
                  <Button
                    color="outline-secondary"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0 || isPaused}
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
                    disabled={currentQuestionIndex === totalQuestions - 1 || isPaused}
                  >
                    Next
                    <ChevronRight size={16} className="ms-1" />
                  </Button>
                </div>
              </div>
            </Col>

            {/* Right Panel - Answer Interface */}
            <Col md={showQuestionPanel ? 5 : 6} className="d-flex flex-column">
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
                            backgroundColor: !isDisabled && answers[currentQuestion._id] === index + 1 ? '#e3f2fd' : 'transparent',
                            borderColor: !isDisabled && answers[currentQuestion._id] === index + 1 ? '#1976d2' : '#dee2e6',
                            opacity: isDisabled ? 0.6 : 1
                          }}
                        >
                          <Input
                            type="radio"
                            name={`question-${currentQuestion._id}`}
                            value={index + 1}
                            checked={!isDisabled ? answers[currentQuestion._id] === index + 1 : false}
                            onChange={() => handleAnswerChange(currentQuestion._id, index + 1)}
                            disabled={isDisabled}
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
                          backgroundColor: !isDisabled && answers[currentQuestion._id] === true ? '#e8f5e8' : 'transparent',
                          borderColor: !isDisabled && answers[currentQuestion._id] === true ? '#4caf50' : '#dee2e6',
                          opacity: isDisabled ? 0.6 : 1
                        }}
                      >
                        <Input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          checked={!isDisabled ? answers[currentQuestion._id] === true : false}
                          onChange={() => handleAnswerChange(currentQuestion._id, true)}
                          disabled={isDisabled}
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
                          backgroundColor: !isDisabled && answers[currentQuestion._id] === false ? '#ffebee' : 'transparent',
                          borderColor: !isDisabled && answers[currentQuestion._id] === false ? '#f44336' : '#dee2e6',
                          opacity: isDisabled ? 0.6 : 1
                        }}
                      >
                        <Input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          checked={!isDisabled ? answers[currentQuestion._id] === false : false}
                          onChange={() => handleAnswerChange(currentQuestion._id, false)}
                          disabled={isDisabled}
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
                      {!isDisabled && (
                        <Button 
                          color="outline-secondary" 
                          size="sm" 
                          onClick={() => handleAnswerChange(currentQuestion._id, '')}
                        >
                          <RotateCcw size={14} className="me-1" />
                          Reset
                        </Button>
                      )}
                    </div>
                    
                    <SafeMonacoEditor
                      height="400px"
                      language={getMonacoLanguage(currentQuestion.language)}
                      value={
                        isDisabled 
                          ? currentQuestion.options?.[0] || `// ${currentQuestion.type === 'codeDebugging' ? 'Fix this code' : 'Write your solution here'}`
                          : answers[currentQuestion._id] || currentQuestion.options?.[0] || ''
                      }
                      onChange={(value) => !isDisabled && handleAnswerChange(currentQuestion._id, value || '')}
                      readOnly={isDisabled}
                      placeholder={`// ${currentQuestion.type === 'codeDebugging' ? 'Fix this code' : 'Write your solution here'}`}
                      options={{
                        fontSize: 14,
                        fontFamily: 'Monaco, "Courier New", monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        padding: { top: 10 },
                        automaticLayout: true,
                        theme: 'vs-light',
                        readOnly: isDisabled,
                        wordWrap: 'on',
                        acceptSuggestionOnCommitCharacter: false,
                        acceptSuggestionOnEnter: 'off',
                        quickSuggestions: false,
                        suggestOnTriggerCharacters: false,
                        parameterHints: { enabled: false },
                        contextmenu: false,
                        smoothScrolling: false,
                        cursorBlinking: 'solid',
                        renderLineHighlight: 'none'
                      }}
                      onMount={(editor, monaco) => {
                        try {
                          console.log('Code challenge editor mounted');
                          // Set up additional error handling if needed
                          editor.onDidChangeModelContent(() => {
                            // Handle content changes safely
                          });
                        } catch (error) {
                          console.warn('Monaco Editor setup warning:', error);
                        }
                      }}
                    />
                    
                    {isDisabled && (
                      <Alert color={isPaused ? "warning" : "info"} className="mt-2 mb-0">
                        <Eye size={16} className="me-2" />
                        {isPaused ? 'Test paused - editor disabled' : 'Preview mode - code editor is read-only'}
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
                            {hasUnsavedChanges(currentQuestion._id) && (
                              <span className="text-info ms-1">(unsaved)</span>
                            )}
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
                  
                  {!isDisabled && (
                    <div className="d-flex gap-2">
                      <Button 
                        color="outline-warning" 
                        size="sm" 
                        onClick={() => handleAnswerChange(currentQuestion._id, undefined)}
                      >
                        Clear Answer
                      </Button>
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

export default SessionTestTakingInterface;