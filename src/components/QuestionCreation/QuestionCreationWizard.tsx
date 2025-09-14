// src/components/QuestionCreation/QuestionCreationWizard.tsx - FINAL VERSION
import React, { useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, CardBody, Alert, Spinner } from 'reactstrap';
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useQuestionCreation } from '../../context/QuestionCreationContext';
import type { Question } from '../../types';

// Import step components
import QuestionBasicsStep from './steps/QuestionBasicsStep';
import QuestionContentStep from './steps/QuestionContentStep';
import TestCasesStep from './steps/TestCasesStep';
import ReviewStep from './steps/ReviewStep';

// Import duplicate detection components
import DuplicateWarningModal from './components/DuplicateWarningModal';
import PromptGenerationModal from './components/PromptGenerationModal';

// Import CSS
import './QuestionWizard.css';

interface QuestionCreationWizardProps {
  onCancel?: () => void;
  onComplete?: (questionId: string, question: Question) => void;
}

const QuestionCreationWizard: React.FC<QuestionCreationWizardProps> = ({
  onCancel,
  onComplete
}) => {
  const {
    state,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,
    isStepAccessible,
    clearErrors,
    resetWizard,
    // ✅ Use new centralized save methods from context
    saveQuestionWithCallback,
    canSaveQuestion,
    getSaveValidationErrors,
    registerCompletionCallback,
    isCompleted,
    completedQuestion,
    isSaving
  } = useQuestionCreation();

  const {
    currentStep,
    steps,
    canNavigateBack,
    canNavigateForward,
    loading,
    error,
    testSuccess,
    creationSuccess,
    showDuplicateWarning,
    promptGeneration,
    selectedLanguage,
    selectedCategory,
    selectedQuestionType,
    questionData,
    testCases,
    testCaseValidation,
    stepErrors
  } = state;

  // ✅ Register completion callback once
  useEffect(() => {
    if (onComplete) {
      registerCompletionCallback(onComplete);
    }
    return () => {
      registerCompletionCallback(null);
    };
  }, [onComplete, registerCompletionCallback]);

  // ✅ Validate current step on relevant changes
  useEffect(() => {
    const timer = setTimeout(() => {
      validateCurrentStep();
    }, 300);
    return () => clearTimeout(timer);
  }, [
    selectedLanguage,
    selectedCategory,
    selectedQuestionType,
    questionData.title,
    questionData.description,
    questionData.options,
    questionData.correctAnswer,
    questionData.codeTemplate,
    questionData.blanks,
    questionData.buggyCode,
    questionData.solutionCode,
    questionData.codeConfig,
    testCases.length,
    testCaseValidation.allPassed,
    currentStep,
    validateCurrentStep
  ]);

  const wizardSteps = steps;
  const currentStepData = wizardSteps.find(step => step.id === currentStep);
  const progressPercentage = Math.round(((currentStep - 1) / (wizardSteps.length - 1)) * 100);

  // ✅ Enhanced step status messages using centralized validation
  const getStepStatusMessage = (): string => {
    const currentStepErrors = stepErrors[currentStep];

    if (currentStepErrors && currentStepErrors.length > 0) {
      return currentStepErrors[0];
    }

    if (isCompleted) {
      return 'Question saved successfully!';
    }

    switch (currentStep) {
      case 1:
        if (!selectedLanguage) return 'Select a programming language';
        if (!selectedCategory) return 'Choose a question category';
        if (!selectedQuestionType) return 'Pick a question type';
        return 'All selections complete';

      case 2:
        if (!questionData.title) return 'Add a question title';
        if (!questionData.description) return 'Add a question description';

        switch (selectedQuestionType) {
          case 'multipleChoice':
            if (!questionData.options || questionData.options.length < 2) return 'Add answer options';
            if (typeof questionData.correctAnswer !== 'number') return 'Select correct answer';
            return 'Question content complete';
          case 'trueFalse':
            if (typeof questionData.correctAnswer !== 'boolean') return 'Select True or False';
            return 'Question content complete';
          case 'fillInTheBlank':
            if (!questionData.codeTemplate) return 'Add code template';
            if (!questionData.blanks || questionData.blanks.length === 0) return 'Configure blanks';
            return 'Question content complete';
          case 'codeChallenge':
            if (selectedCategory === 'logic' && !questionData.codeConfig?.entryFunction) {
              return 'Set entry function name';
            }
            return 'Question content complete';
          case 'codeDebugging':
            if (!questionData.buggyCode) return 'Add buggy code';
            if (!questionData.solutionCode) return 'Add solution code';
            return 'Question content complete';
        }
        return 'Complete question content';

      case 3:
        if (selectedQuestionType === 'codeChallenge' && selectedCategory === 'logic') {
          if (testCases.length === 0) return 'Add test cases';
          if (testCaseValidation.results.length === 0) return 'Run test validation';
          if (!testCaseValidation.allPassed) return 'Fix failing test cases';
          return 'Test cases validated';
        }
        return 'Test cases configured';

      case 4:
        if (isSaving) return 'Saving question...';
        if (creationSuccess) return 'Question saved successfully!';
        const saveErrors = getSaveValidationErrors();
        if (saveErrors.length > 0) return saveErrors[0];
        return 'Ready to save';

      default:
        return 'Required';
    }
  };

  const handleStepClick = useCallback((stepId: number) => {
    if (isStepAccessible(stepId)) {
      clearErrors();
      goToStep(stepId);
    }
  }, [clearErrors, goToStep, isStepAccessible]);

  // ✅ Handle navigation with centralized save
  const handleNext = useCallback(() => {
    clearErrors();

    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep === wizardSteps.length) {
      handleSaveQuestion();
    } else {
      nextStep();
    }
  }, [clearErrors, validateCurrentStep, currentStep, wizardSteps.length, nextStep]);

  // ✅ Use centralized save method
  const handleSaveQuestion = useCallback(async () => {
    try {
      await saveQuestionWithCallback();
    } catch (error) {
      console.error('Failed to save question:', error);
    }
  }, [saveQuestionWithCallback]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else {
      resetWizard();
    }
  }, [onCancel, resetWizard]);

  const renderCurrentStep = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner color="primary" />
          <div className="mt-2 text-muted">Loading...</div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return <QuestionBasicsStep />;
      case 2:
        return <QuestionContentStep />;
      case 3:
        return <TestCasesStep />;
      case 4:
        return <ReviewStep />;
      default:
        return <div>Step not found</div>;
    }
  };

  // ✅ Button configuration with centralized validation
  const getNextButtonConfig = () => {
    if (currentStep === wizardSteps.length) {
      const canSave = canSaveQuestion();
      return {
        text: isSaving ? 'Saving...' : 'Save Question',
        variant: 'success',
        icon: isSaving ? null : <CheckCircle size={16} className="ms-1" />,
        action: handleSaveQuestion,
        disabled: !canSave || isCompleted
      };
    } else {
      return {
        text: 'Next',
        variant: 'primary',
        icon: <ArrowRight size={16} className="ms-1" />,
        action: () => nextStep(),
        disabled: !canNavigateForward
      };
    }
  };

  const nextButtonConfig = getNextButtonConfig();

  return (
    <div className="question-creation-wizard">
      <Container fluid>
        <Row>
          {/* Sidebar Navigation */}
          <Col lg="3" className="mb-4">
            <Card className="shadow-sm h-100">
              <CardBody className="bg-primary text-white">
                <div className="mb-4">
                  <h6 className="mb-2">Question Creation</h6>
                  <small className="d-block">Step {currentStep} of {wizardSteps.length}</small>
                  <small className="d-block">{progressPercentage}% Complete</small>
                </div>

                <div className="steps-list">
                  {wizardSteps.map((step) => {
                    const isAccessible = isStepAccessible(step.id);
                    const isCurrent = step.id === currentStep;
                    const isCompleted = step.isCompleted;
                    const isValid = step.isValid;
                    const hasErrors = stepErrors[step.id] && stepErrors[step.id].length > 0;

                    return (
                      <div
                        key={step.id}
                        className={`step-item mb-3 p-2 rounded ${isCurrent ? 'bg-white bg-opacity-25' : ''}`}
                        onClick={() => isAccessible && handleStepClick(step.id)}
                        style={{
                          cursor: isAccessible ? 'pointer' : 'default',
                          opacity: isAccessible || isCurrent ? 1 : 0.6
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="step-number rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{
                              width: '30px',
                              height: '30px',
                              backgroundColor: isCurrent ? '#fff' :
                                isCompleted ? '#28a745' :
                                  isValid ? '#17a2b8' :
                                    hasErrors ? '#dc3545' : 'rgba(255,255,255,0.3)',
                              color: isCurrent ? '#007bff' : '#fff',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}
                          >
                            {isCompleted ? '✓' : hasErrors ? '!' : isValid ? '●' : step.id}
                          </div>
                          <div>
                            <div className="fw-bold small">{step.title}</div>
                            <div className="small opacity-75">{step.description}</div>
                            {isCurrent && hasErrors && (
                              <div className="small text-warning mt-1">
                                {stepErrors[step.id][0]}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-2 bg-white bg-opacity-10 rounded">
                  <div className="fw-bold small mb-1">Status</div>
                  <div className="small">{getStepStatusMessage()}</div>
                </div>

                {questionData.title && (
                  <div className="mt-3 p-2 bg-white bg-opacity-10 rounded">
                    <div className="fw-bold small mb-1">Progress</div>
                    <div className="small">
                      <div>Language: {selectedLanguage}</div>
                      {selectedCategory && <div>Category: {selectedCategory}</div>}
                      {selectedQuestionType && <div>Type: {selectedQuestionType}</div>}
                      {currentStep === 3 && selectedQuestionType === 'codeChallenge' && selectedCategory === 'logic' && (
                        <div className="mt-1">
                          <div>Test Cases: {testCases.length}</div>
                          {testCaseValidation.results.length > 0 && (
                            <div>Status: {testCaseValidation.allPassed ? '✓ Passed' : '✗ Failed'}</div>
                          )}
                        </div>
                      )}
                      {isCompleted && (
                        <div className="mt-1 text-success">
                          <CheckCircle size={12} className="me-1" />
                          Saved: {completedQuestion?.title}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Main Content */}
          <Col lg="9">
            <Card className="shadow-sm">
              <CardBody>
                <div className="mb-4 pb-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h3 className="mb-1 text-primary">{currentStepData?.title}</h3>
                      <p className="text-muted mb-0">{currentStepData?.description}</p>
                      {currentStepData?.isValid && (
                        <small className="text-success">
                          <CheckCircle size={14} className="me-1" />
                          Step completed
                        </small>
                      )}
                    </div>
                    <div className="text-end">
                      <small className="text-muted">Step {currentStep} of {wizardSteps.length}</small>
                      <div className="mt-1">
                        <small className={`badge ${canNavigateForward || isCompleted ? 'bg-success' : 'bg-secondary'}`}>
                          {isCompleted ? 'Question saved' : 
                           canNavigateForward ? 'Can proceed' : 
                           'Complete required fields'}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error and Success Messages */}
                {error && (
                  <Alert color="danger" className="mb-4">
                    <AlertCircle size={16} className="me-2" />
                    <strong>Error:</strong> {error}
                  </Alert>
                )}

                {testSuccess && !creationSuccess && (
                  <Alert color="info" className="mb-4">
                    <CheckCircle size={16} className="me-2" />
                    <strong>Test Validation:</strong> {testSuccess}
                  </Alert>
                )}

                {creationSuccess && (
                  <Alert color="success" className="mb-4">
                    <CheckCircle size={16} className="me-2" />
                    <strong>Success:</strong> {creationSuccess}
                  </Alert>
                )}

                {stepErrors[currentStep] && stepErrors[currentStep].length > 0 && !isCompleted && (
                  <Alert color="warning" className="mb-4">
                    <AlertCircle size={16} className="me-2" />
                    <strong>Please complete the following:</strong>
                    <ul className="mb-0 mt-2">
                      {stepErrors[currentStep].map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Alert>
                )}

                {/* Step Content */}
                <div className="wizard-step-content">
                  {renderCurrentStep()}
                </div>

                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <div>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="d-flex gap-2">
                    {canNavigateBack && !isCompleted && (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={prevStep}
                        disabled={loading || isSaving}
                      >
                        <ArrowLeft size={16} className="me-1" />
                        Previous
                      </button>
                    )}

                    {!isCompleted && (
                      <button
                        type="button"
                        className={`btn btn-${nextButtonConfig.variant}`}
                        onClick={nextButtonConfig.action}
                        disabled={nextButtonConfig.disabled || loading || isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Spinner size="sm" className="me-1" />
                            Saving...
                          </>
                        ) : (
                          <>
                            {nextButtonConfig.text}
                            {nextButtonConfig.icon}
                          </>
                        )}
                      </button>
                    )}

                    {isCompleted && (
                      <div className="d-flex align-items-center text-success">
                        <CheckCircle size={16} className="me-2" />
                        <span>Question saved successfully!</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Modals */}
        {showDuplicateWarning && <DuplicateWarningModal />}
        {promptGeneration.showModal && <PromptGenerationModal />}
      </Container>
    </div>
  );
};

export default QuestionCreationWizard;