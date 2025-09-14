// components/TestSessions/AnswerInputPane.tsx - ALIGNED with actual question structure
import React from 'react';
import { Form, Input, Label, Button } from 'reactstrap';
import { CheckCircle, Square, X } from 'lucide-react';

interface AnswerInputPaneProps {
  // ALIGNED: Using actual question structure from context
  question: {
    questionIndex: number;
    questionData: {
      title: string;
      description: string;
      type: 'multipleChoice' | 'trueFalse' | 'codeChallenge' | 'fillInTheBlank' | 'codeDebugging';
      language?: string;
      category?: 'logic' | 'ui' | 'syntax';
      difficulty: 'easy' | 'medium' | 'hard';
      tags?: string[];
      points: number;
      options?: string[];
      correctAnswer?: any;
      codeTemplate?: string;
      blanks?: Array<{
        id: string;
        hint?: string;
        points: number;
      }>;
      buggyCode?: string;
      testCases?: Array<{
        name?: string;
        args: any[];
        expected: any;
        hidden?: boolean;
      }>;
      codeConfig?: {
        runtime: string;
        entryFunction: string;
        timeoutMs: number;
      };
    };
    [key: string]: any;
  };
  currentAnswer: any;
  updateAnswer: (answer: any) => void;
  onClearAnswer?: () => void;
}

const AnswerInputPane: React.FC<AnswerInputPaneProps> = ({
  question,
  currentAnswer,
  updateAnswer,
  onClearAnswer
}) => {
  const hasAnswer = currentAnswer !== null && currentAnswer !== undefined;

  // Helper function to render fill-in-blank template with input fields
  const renderFillInBlankTemplate = () => {
    if (!question.questionData?.codeTemplate || !question.questionData?.blanks) {
      return <div className="text-muted">No template available</div>;
    }

    const template = question.questionData.codeTemplate;
    const blanks = question.questionData.blanks;
    const answers = currentAnswer || {};

    const blankPattern = /___\w*\d*___/g;
    const elements: React.ReactElement[] = [];
    let lastIndex = 0;
    let blankIndex = 0;
    let match;
    
    while ((match = blankPattern.exec(template)) !== null && blankIndex < blanks.length) {
      if (match.index > lastIndex) {
        const textBefore = template.substring(lastIndex, match.index);
        elements.push(
          <span key={`text-${blankIndex}-before`} style={{ whiteSpace: 'pre' }}>
            {textBefore}
          </span>
        );
      }

      const blank = blanks[blankIndex];
      const blankId = blank.id || `blank-${blankIndex}`;
      const value = answers[blankId] || '';

      elements.push(
        <Input
          key={`blank-${blankIndex}`}
          type="text"
          value={value}
          onChange={(e) => {
            const newAnswers = { ...answers };
            newAnswers[blankId] = e.target.value;
            updateAnswer(newAnswers);
          }}
          placeholder=""
          className="d-inline-block mx-1"
          style={{
            width: `${Math.max(80, Math.min(200, (value.length + 2) * 8 + 20))}px`,
            minWidth: '80px',
            maxWidth: '200px',
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '4px 8px',
            border: '2px solid #007bff',
            borderRadius: '4px',
            backgroundColor: value ? '#f0f8ff' : '#ffffff',
            outline: 'none',
            boxShadow: value ? '0 0 0 1px rgba(0,123,255,0.25)' : 'none'
          }}
          aria-label={`Blank ${blankIndex + 1}: ${blank.hint || 'Fill in the blank'}`}
        />
      );

      lastIndex = match.index + match[0].length;
      blankIndex++;
    }

    if (lastIndex < template.length) {
      const textAfter = template.substring(lastIndex);
      elements.push(
        <span key={`text-after`} style={{ whiteSpace: 'pre' }}>
          {textAfter}
        </span>
      );
    }

    return (
      <div 
        className="border rounded p-4"
        style={{
          fontFamily: 'monospace',
          fontSize: '16px',
          lineHeight: '1.8',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto'
        }}
      >
        {elements}
      </div>
    );
  };

  const renderAnswerContent = () => {
    switch (question.questionData?.type) {
      case 'multipleChoice':
        return (
          <Form role="form" aria-labelledby="question-title">
            {question.questionData.options?.map((option: string, index: number) => (
              <div key={index} className="mb-3">
                <Label
                  check
                  className="d-flex align-items-start p-3 border rounded cursor-pointer hover-bg-light"
                  style={{
                    backgroundColor: currentAnswer === index ? '#e3f2fd' : 'transparent',
                    borderColor: currentAnswer === index ? '#1976d2' : '#dee2e6',
                    cursor: 'pointer'
                  }}
                >
                  <Input
                    type="radio"
                    name="answer"
                    id={`option-${index}`}
                    value={index}
                    checked={currentAnswer === index}
                    onChange={(e) => updateAnswer(parseInt(e.target.value))}
                    aria-label={`Radio option ${index + 1}: ${option}`}
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
          </Form>
        );

      case 'trueFalse':
        return (
          <Form role="form" aria-labelledby="question-title">
            <div className="mb-3">
              <Label
                check
                className="d-flex align-items-center p-3 border rounded cursor-pointer hover-bg-light"
                style={{
                  backgroundColor: currentAnswer === true ? '#e8f5e8' : 'transparent',
                  borderColor: currentAnswer === true ? '#4caf50' : '#dee2e6',
                  cursor: 'pointer'
                }}
              >
                <Input
                  type="radio"
                  name="answer"
                  id="true"
                  checked={currentAnswer === true}
                  onChange={() => updateAnswer(true)}
                  className="me-3"
                  aria-label="True"
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
                  backgroundColor: currentAnswer === false ? '#ffebee' : 'transparent',
                  borderColor: currentAnswer === false ? '#f44336' : '#dee2e6',
                  cursor: 'pointer'
                }}
              >
                <Input
                  type="radio"
                  name="answer"
                  id="false"
                  checked={currentAnswer === false}
                  onChange={() => updateAnswer(false)}
                  className="me-3"
                  aria-label="False"
                />
                <div className="d-flex align-items-center">
                  <Square size={20} className="me-2 text-danger" />
                  <span className="fw-medium">False</span>
                </div>
              </Label>
            </div>
          </Form>
        );

      case 'fillInTheBlank':
        return (
          <div>
            <h6 className="mb-3">Complete the code by filling in the blanks:</h6>
            
            {renderFillInBlankTemplate()}
            
            {/* Blank Information Panel */}
            {question.questionData?.blanks && question.questionData.blanks.length > 0 && (
              <div className="mt-4">
                <div className="bg-info bg-opacity-10 border border-info border-opacity-25 rounded p-3">
                  <h6 className="text-info mb-3">
                    Blank Information
                  </h6>
                  <div className="row">
                    {question.questionData.blanks.map((blank, index: number) => {
                      const blankId = blank.id || `blank-${index}`;
                      const currentValue = (currentAnswer && currentAnswer[blankId]) || '';
                      
                      return (
                        <div key={blankId} className="col-md-6 mb-3">
                          <div className="card border-0 bg-white">
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <strong className="text-primary">Blank {index + 1}</strong>
                                {blank.points && (
                                  <span className="badge bg-success">{blank.points} pts</span>
                                )}
                              </div>
                              {blank.hint && (
                                <p className="text-muted small mb-2">
                                  Hint: {blank.hint}
                                </p>
                              )}
                              <div className="small">
                                <span className="text-muted">Current: </span>
                                <code className="bg-light px-2 py-1 rounded">
                                  {currentValue || '<empty>'}
                                </code>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center mt-2">
                    <small className="text-muted">
                      {question.questionData.blanks.filter((_, index: number) => {
                        const blankId = question.questionData?.blanks![index].id || `blank-${index}`;
                        return currentAnswer && currentAnswer[blankId] && currentAnswer[blankId].trim();
                      }).length} of {question.questionData.blanks.length} blanks filled
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'codeChallenge':
      case 'codeDebugging':
        return (
          <div className="text-center text-muted py-4">
            <p>Code editor is in a separate pane for this question type.</p>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted py-4">
            <p>Unsupported question type: {question.questionData?.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="h-100 d-flex flex-column">
      {/* Header */}
      <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Your Answer</h6>
        {hasAnswer && onClearAnswer && (
          <Button
            color="outline-danger"
            size="sm"
            onClick={onClearAnswer}
            aria-label="Clear answer"
          >
            <X size={14} className="me-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Answer Input Content */}
      <div className="flex-grow-1 p-3 overflow-auto">
        {renderAnswerContent()}
      </div>

      {/* Footer Status */}
      <div className="p-3 border-top bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted small">
            {hasAnswer ? (
              <span className="text-success">
                <CheckCircle size={14} className="me-1" />
                Answered
              </span>
            ) : (
              <span className="text-muted">
                <Square size={14} className="me-1" />
                Not answered
              </span>
            )}
          </span>

          {/* Question-specific footer info */}
          <small className="text-muted">
            {question.questionData?.type === 'fillInTheBlank' && question.questionData?.blanks && (
              <>
                {Object.keys(currentAnswer || {}).filter(key => 
                  currentAnswer[key] && currentAnswer[key].trim()
                ).length} / {question.questionData.blanks.length} completed
              </>
            )}
          </small>
        </div>
      </div>
    </div>
  );
};

export default AnswerInputPane;