// components/TestSessions/QuestionDetailsPane.tsx - ALIGNED with actual question structure
import React from 'react';
import { Badge } from 'reactstrap';

interface QuestionDetailsPaneProps {
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
  sectionInfo?: {
    name: string;
    current: number;
    total: number;
    timeLimit?: number;
  };
  showTestCases?: boolean;
}

const QuestionDetailsPane: React.FC<QuestionDetailsPaneProps> = ({ 
  question, 
  sectionInfo,
  showTestCases = true
}) => {
  const formatTestCaseArgs = (args: any[]): string => {
    if (!args || args.length === 0) return '()';
    return `(${args.map(arg => 
      typeof arg === 'string' ? `"${arg}"` : JSON.stringify(arg)
    ).join(', ')})`;
  };

  const formatExpected = (expected: any): string => {
    if (typeof expected === 'string') return `"${expected}"`;
    return JSON.stringify(expected);
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

  return (
    <div className="h-100 d-flex flex-column">
      {/* Header */}
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="mb-0">{question.questionData?.title || 'Question'}</h6>
          <Badge color="primary">{question.questionData?.points ?? 0} pts</Badge>
        </div>
        
        <div className="d-flex flex-wrap gap-2">
          <Badge color="secondary">
            {getQuestionTypeLabel(question.questionData?.type || 'unknown')}
          </Badge>
          
          {question.questionData?.difficulty && (
            <Badge color={getDifficultyColor(question.questionData.difficulty)}>
              {question.questionData.difficulty}
            </Badge>
          )}
          
          {question.questionData?.language && (
            <Badge color="info">{question.questionData.language}</Badge>
          )}
          
          {question.questionData?.category && (
            <Badge color="outline-secondary">{question.questionData.category}</Badge>
          )}
        </div>

        {sectionInfo && (
          <div className="mt-2">
            <small className="text-muted">
              Section: <strong>{sectionInfo.name}</strong> • 
              Question {sectionInfo.current} of {sectionInfo.total}
            </small>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-grow-1 p-3 overflow-auto">
        {/* Description */}
        <div className="mb-4">
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {question.questionData?.description || 'No description available'}
          </p>
        </div>
        
        {/* Example Test Case for Code Questions */}
        {showTestCases && question.questionData?.testCases && question.questionData.testCases.length > 0 && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Example Test Case</h6>
              <Badge color="info" className="small">
                {question.questionData.testCases.length} total test cases
              </Badge>
            </div>
            
            <div className="border rounded p-3 bg-light">
              {(() => {
                const exampleTestCase = question.questionData.testCases[0];
                return (
                  <div className="p-3 rounded bg-white border">
                    <div className="fw-medium small text-dark mb-2">
                      {exampleTestCase.name || 'Example Test Case'}
                    </div>
                    
                    <div className="font-monospace small">
                      <div className="mb-1">
                        <span className="text-muted fw-medium">Input:</span>{' '}
                        <code className="bg-secondary bg-opacity-10 px-2 py-1 rounded">
                          {formatTestCaseArgs(exampleTestCase.args)}
                        </code>
                      </div>
                      <div>
                        <span className="text-muted fw-medium">Expected:</span>{' '}
                        <code className="bg-success bg-opacity-10 px-2 py-1 rounded text-success">
                          {formatExpected(exampleTestCase.expected)}
                        </code>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="mt-3 p-2 bg-info bg-opacity-10 border border-info border-opacity-25 rounded">
                <small className="text-info fw-medium">
                  This is one example of {question.questionData.testCases.length} test cases. Your solution will be tested against all cases when you run or submit your code.
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Multiple Choice Options Preview */}
        {question.questionData?.type === 'multipleChoice' && question.questionData?.options && (
          <div className="mt-4">
            <h6 className="mb-2">Answer Options</h6>
            <div className="bg-light p-3 rounded">
              {question.questionData.options.map((option: string, index: number) => (
                <div key={index} className="mb-2">
                  <span className="fw-medium">{String.fromCharCode(65 + index)}.</span> {option}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Instructions or Hints */}
        {question.questionData?.codeTemplate && question.questionData.type === 'codeDebugging' && (
          <div className="mt-4">
            <div className="alert alert-info">
              <strong>Instructions:</strong> Fix the bugs in the provided code to make all test cases pass.
            </div>
          </div>
        )}

        {question.questionData?.type === 'codeChallenge' && (
          <div className="mt-4">
            <div className="alert alert-primary">
              <strong>Instructions:</strong> Implement a solution that passes all test cases. 
              {question.questionData?.codeTemplate && (
                <span> Use the provided template as a starting point.</span>
              )}
            </div>
          </div>
        )}

        {question.questionData?.type === 'fillInTheBlank' && question.questionData?.blanks && (
          <div className="mt-4">
            <div className="alert alert-info">
              <strong>Instructions:</strong> Fill in the blanks to complete the code. 
              There are {question.questionData.blanks.length} blank(s) to complete.
            </div>
          </div>
        )}

        {/* Language-specific information for code questions */}
        {(question.questionData?.type === 'codeChallenge' || question.questionData?.type === 'codeDebugging') && 
         question.questionData?.codeConfig && (
          <div className="mt-4">
            <div className="bg-secondary bg-opacity-10 p-3 rounded">
              <small className="text-muted">
                <strong>Runtime:</strong> {question.questionData.codeConfig.runtime}<br/>
                <strong>Entry Function:</strong> {question.questionData.codeConfig.entryFunction}<br/>
                <strong>Timeout:</strong> {question.questionData.codeConfig.timeoutMs}ms
              </small>
            </div>
          </div>
        )}

        {/* Tags */}
        {question.questionData?.tags && question.questionData.tags.length > 0 && (
          <div className="mt-4">
            <div className="d-flex flex-wrap gap-1">
              <small className="text-muted me-2">Tags:</small>
              {question.questionData.tags.map((tag: string, index: number) => (
                <Badge key={index} color="outline-secondary" className="small">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailsPane;