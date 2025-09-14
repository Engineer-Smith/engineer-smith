// components/TestSessions/QuestionLayoutManager.tsx - ALIGNED with TestSessionPage props
import React from 'react';
import QuestionDetailsPane from './QuestionDetailsPane';
import CodeEditorPane from './CodeEditorPane';
import AnswerInputPane from './AnswerInputPane';
import TestResultsPane from './TestResultsPane';
import NavigationBar from './NavigationBar';

interface QuestionLayoutManagerProps {
  // ALIGNED: Current question state from TestSessionContext
  currentQuestion: {
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
    currentAnswer: any;
    status: string;
    timeSpent: number;
    viewCount: number;
    isReviewPhase?: boolean;
    skippedQuestionsRemaining?: number;
  };

  currentAnswer: any;
  updateAnswer: (answer: any) => void;

  // Section info from TestSessionPage
  sectionInfo?: {
    name: string;
    current: number;
    total: number;
    timeLimit?: number;
  };

  // Navigation capabilities from NavigationContext
  canNavigateBackward: boolean;
  canNavigateForward: boolean;
  isNavigating: boolean;

  // ALIGNED: Actions that match TestSessionPage handlers
  onSubmitAnswer?: () => Promise<void>;
  onSkip?: () => Promise<void>;
  onSubmitTest?: () => Promise<void>;
  onClearAnswer?: () => void;
  
  // Submission state
  submitting?: boolean;
}

const QuestionLayoutManager: React.FC<QuestionLayoutManagerProps> = ({
  currentQuestion,
  currentAnswer,
  updateAnswer,
  sectionInfo,
  canNavigateBackward,
  canNavigateForward,
  isNavigating,
  onSubmitAnswer,
  onSkip,
  onSubmitTest,
  onClearAnswer,
  submitting = false,
}) => {
  const questionType = currentQuestion.questionData?.type;
  const isCodeQuestion = questionType === 'codeChallenge' || questionType === 'codeDebugging';
  const isFillInBlank = questionType === 'fillInTheBlank';

  // Handle code reset for code questions
  const handleResetCode = () => {
    if (currentQuestion.questionData) {
      const questionData = currentQuestion.questionData;
      let initialCode = '';

      if (questionData.type === 'codeDebugging' && questionData.buggyCode) {
        initialCode = questionData.buggyCode;
      } else if (questionData.type === 'codeChallenge' && questionData.codeTemplate) {
        initialCode = questionData.codeTemplate;
      }

      if (initialCode) {
        updateAnswer(initialCode);
      }
    }
  };

  // Common NavigationBar props
  const navigationBarProps = {
    currentQuestion,
    currentAnswer,
    sectionInfo,
    canNavigateBackward,
    canNavigateForward,
    isNavigating,
    onSubmitAnswer,
    onSkip,
    onSubmitTest,
    onClearAnswer,
    submitting,
  };

  // For code questions: 3-pane layout (Details | Editor | Results)
  if (isCodeQuestion) {
    return (
      <div className="h-100 d-flex flex-column">
        {/* 3-Pane Layout */}
        <div className="d-flex" style={{ flex: 1, overflow: 'hidden' }}>
          {/* Left Pane: Question Details */}
          <div className="border-end" style={{ width: '33.333%', minWidth: '300px' }}>
            <QuestionDetailsPane
              question={currentQuestion}
              sectionInfo={sectionInfo}
              showTestCases={true}
            />
          </div>

          {/* Middle Pane: Code Editor */}
          <div className="border-end" style={{ width: '33.333%', minWidth: '350px' }}>
            <CodeEditorPane
              question={currentQuestion}
              currentAnswer={currentAnswer || ''}
              updateAnswer={updateAnswer}
              onReset={handleResetCode}
            />
          </div>

          {/* Right Pane: Test Results */}
          <div style={{ width: '33.333%', minWidth: '300px' }}>
            <TestResultsPane
              question={currentQuestion}
              studentCode={currentAnswer || ''}
            />
          </div>
        </div>

        {/* Navigation Bar */}
        <NavigationBar {...navigationBarProps} />
      </div>
    );
  }

  // For fill-in-blank: 2-pane layout
  if (isFillInBlank) {
    return (
      <div className="h-100 d-flex flex-column">
        {/* 2-Pane Layout */}
        <div className="d-flex" style={{ flex: 1, overflow: 'hidden' }}>
          {/* Left: Question Details (smaller) */}
          <div className="border-end" style={{ width: '30%', minWidth: '250px' }}>
            <QuestionDetailsPane
              question={currentQuestion}
              sectionInfo={sectionInfo}
              showTestCases={false}
            />
          </div>

          {/* Right: Fill-in-blank input (larger) */}
          <div style={{ width: '70%', minWidth: '400px' }}>
            <AnswerInputPane
              question={currentQuestion}
              currentAnswer={currentAnswer}
              updateAnswer={updateAnswer}
              onClearAnswer={onClearAnswer}
            />
          </div>
        </div>

        {/* Navigation Bar */}
        <NavigationBar {...navigationBarProps} />
      </div>
    );
  }

  // For other questions (multiple choice, true/false): 2-pane layout
  return (
    <div className="h-100 d-flex flex-column">
      {/* 2-Pane Layout */}
      <div className="d-flex" style={{ flex: 1, overflow: 'hidden' }}>
        {/* Left Pane: Question Details */}
        <div className="border-end" style={{ width: '50%', minWidth: '300px' }}>
          <QuestionDetailsPane
            question={currentQuestion}
            sectionInfo={sectionInfo}
            showTestCases={false}
          />
        </div>

        {/* Right Pane: Answer Input */}
        <div style={{ width: '50%', minWidth: '300px' }}>
          <AnswerInputPane
            question={currentQuestion}
            currentAnswer={currentAnswer}
            updateAnswer={updateAnswer}
            onClearAnswer={onClearAnswer}
          />
        </div>
      </div>

      {/* Navigation Bar */}
      <NavigationBar {...navigationBarProps} />
    </div>
  );
};

export default QuestionLayoutManager;