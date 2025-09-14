// components/TestSessions/TestResultsPane.tsx - ALIGNED with actual question structure
import React from 'react';
import CodeTestingComponent from './CodeTestingComponent';

interface TestResultsPaneProps {
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
  studentCode: string;
}

const TestResultsPane: React.FC<TestResultsPaneProps> = ({
  question,
  studentCode,
}) => {
  // Only show for code questions
  const isCodeQuestion = question.questionData?.type === 'codeChallenge' || 
                        question.questionData?.type === 'codeDebugging';

  if (!isCodeQuestion) {
    return (
      <div className="h-100 d-flex flex-column">
        <div className="p-3 border-bottom bg-light">
          <h6 className="mb-0">Test Results</h6>
          <small className="text-muted">
            Test results are only available for code questions
          </small>
        </div>
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center text-muted">
            <p>This question type does not support automated testing.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-100 d-flex flex-column">
      {/* Header */}
      <div className="p-3 border-bottom bg-light">
        <h6 className="mb-0">Test Results</h6>
        <small className="text-muted">
          Run tests to validate your solution
        </small>
      </div>

      {/* CodeTestingComponent Content */}
      <div className="flex-grow-1 overflow-auto">
        <CodeTestingComponent
          question={question}
          studentCode={studentCode}
        />
      </div>
    </div>
  );
};

export default TestResultsPane;