// src/components/tests/CreateTestWizard.tsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, CardBody, Progress, Alert } from 'reactstrap';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Import stage components
import TestBasics from './TestBasics';
import TestStructure from './TestStructure';
import SectionConfig from './SectionConfig';
import QuestionAssignment from './QuestionAssignment';
import ReviewPublish from './ReviewPublish';

// Import types
import type { CreateTestData } from '../../types/createTest';

interface WizardStep {
  id: number;
  name: string;
  title: string;
  description: string;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    name: 'basics',
    title: 'Test Basics',
    description: 'Title, description, and settings'
  },
  {
    id: 2,
    name: 'structure',
    title: 'Test Structure',
    description: 'Configure sections and timing'
  },
  {
    id: 3,
    name: 'sections',
    title: 'Section Setup',
    description: 'Define section details'
  },
  {
    id: 4,
    name: 'questions',
    title: 'Question Assignment',
    description: 'Add and assign questions'
  },
  {
    id: 5,
    name: 'review',
    title: 'Review & Publish',
    description: 'Final review and publish'
  }
];

interface CreateTestWizardProps {
  onCancel?: () => void;
  onComplete?: () => void;
}

const CreateTestWizard: React.FC<CreateTestWizardProps> = ({ 
  onCancel, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize test data with backend-aligned structure
  const [testData, setTestData] = useState<CreateTestData>({
    // Required backend fields
    title: '',
    description: '',
    testType: 'custom',
    languages: [], // Backend expects array of Language enum values
    tags: [], // Backend expects array of Tags enum values
    
    // Settings object - matches backend exactly
    settings: {
      timeLimit: 0, // Required - user must set
      attemptsAllowed: 0, // Required - user must set  
      shuffleQuestions: false, // Default false
      useSections: false, // Initialize as false instead of undefined
    },
    
    // Questions/sections - used based on useSections setting
    questions: [], // Array of {questionId, points}
    sections: [], // Array of sections with questions
    
    // Backend flags
    isGlobal: false, // Default false
    status: 'draft', // Default to draft
    
    // Frontend-only helper fields
    instructions: '', // Not sent to backend
  });

  const currentStepData = WIZARD_STEPS.find(step => step.id === currentStep);
  const progressPercentage = (currentStep / WIZARD_STEPS.length) * 100;

  // Determine which steps should be shown based on test configuration
  const getValidSteps = (): number[] => {
    const steps = [1, 2]; // Always show basics and structure
    
    if (testData.settings.useSections) {
      steps.push(3); // Show section config if using sections
    }
    
    steps.push(4, 5); // Always show questions and review
    return steps;
  };

  const getNextValidStep = (currentStep: number): number => {
    const validSteps = getValidSteps();
    const currentIndex = validSteps.indexOf(currentStep);
    return currentIndex < validSteps.length - 1 ? validSteps[currentIndex + 1] : currentStep;
  };

  const getPreviousValidStep = (currentStep: number): number => {
    const validSteps = getValidSteps();
    const currentIndex = validSteps.indexOf(currentStep);
    return currentIndex > 0 ? validSteps[currentIndex - 1] : currentStep;
  };

  const handleNext = (): void => {
    setError(null);
    const nextStep = getNextValidStep(currentStep);
    if (nextStep !== currentStep) {
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = (): void => {
    setError(null);
    const prevStep = getPreviousValidStep(currentStep);
    if (prevStep !== currentStep) {
      setCurrentStep(prevStep);
    }
  };

  const handleStepClick = (stepId: number): void => {
    const validSteps = getValidSteps();
    
    // Only allow clicking on valid steps that are accessible
    if (validSteps.includes(stepId) && stepId <= currentStep + 1) {
      setCurrentStep(stepId);
      setError(null);
    }
  };

  const handleCancel = (): void => {
    if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
      onCancel?.();
    }
  };

  const isStepCompleted = (stepId: number): boolean => {
    switch (stepId) {
      case 1:
        return !!(testData.title && testData.description && testData.languages.length > 0 && testData.tags.length > 0);
      case 2:
        return !!(typeof testData.settings.useSections === 'boolean' && 
                 testData.settings.timeLimit > 0 && 
                 testData.settings.attemptsAllowed > 0);
      case 3:
        return !testData.settings.useSections || testData.sections.length > 0;
      case 4:
        if (testData.settings.useSections) {
          return testData.sections.every(section => section.questions.length > 0);
        }
        return testData.questions.length > 0;
      case 5:
        return false; // Review step is never "completed" until published
      default:
        return false;
    }
  };

  const isStepAccessible = (stepId: number): boolean => {
    const validSteps = getValidSteps();
    if (!validSteps.includes(stepId)) return false;
    
    // Can access current step, completed steps, or next incomplete step
    if (stepId <= currentStep) return true;
    if (stepId === currentStep + 1) return true;
    
    return false;
  };

  const renderCurrentStep = (): React.ReactNode => {
    const commonProps = {
      testData,
      setTestData,
      onNext: handleNext,
      onPrevious: handlePrevious,
      setError,
      setLoading
    };

    switch (currentStep) {
      case 1:
        return (
          <TestBasics
            {...commonProps}
            onCancel={handleCancel}
          />
        );
      case 2:
        return (
          <TestStructure
            {...commonProps}
          />
        );
      case 3:
        return (
          <SectionConfig
            {...commonProps}
          />
        );
      case 4:
        return (
          <QuestionAssignment
            {...commonProps}
          />
        );
      case 5:
        return (
          <ReviewPublish
            {...commonProps}
            onComplete={onComplete}
          />
        );
      default:
        return (
          <Alert color="danger">
            <AlertCircle size={16} className="me-2" />
            Unknown step. Please refresh and try again.
          </Alert>
        );
    }
  };

  const validSteps = getValidSteps();

  return (
    <Container fluid className="py-4">
      <Row>
        <Col lg="3">
          {/* Progress Sidebar */}
          <Card className="position-sticky shadow-sm" style={{ top: '20px' }}>
            <CardBody>
              <h5 className="mb-4 d-flex align-items-center">
                <CheckCircle size={20} className="me-2 text-primary" />
                Create Test
              </h5>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="d-flex justify-content-between text-sm mb-2">
                  <span>Progress</span>
                  <span className="fw-bold">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  color="primary" 
                  className="mb-3"
                  style={{ height: '8px' }}
                />
              </div>

              {/* Step List */}
              <div className="wizard-steps">
                {WIZARD_STEPS.map((step) => {
                  const isValid = validSteps.includes(step.id);
                  const isCompleted = isStepCompleted(step.id);
                  const isAccessible = isStepAccessible(step.id);
                  const isCurrent = step.id === currentStep;
                  
                  if (!isValid) return null;

                  return (
                    <div
                      key={step.id}
                      className={`wizard-step ${isCurrent ? 'active' : ''} ${
                        isCompleted ? 'completed' : ''
                      } ${!isAccessible ? 'disabled' : ''}`}
                      onClick={() => handleStepClick(step.id)}
                      style={{
                        padding: '12px',
                        marginBottom: '8px',
                        borderRadius: '8px',
                        cursor: isAccessible ? 'pointer' : 'not-allowed',
                        backgroundColor: isCurrent ? '#007bff' : 
                                       isCompleted ? '#28a745' : 
                                       isAccessible ? '#f8f9fa' : '#e9ecef',
                        color: isCurrent || isCompleted ? 'white' : 
                               isAccessible ? '#495057' : '#6c757d',
                        transition: 'all 0.2s ease',
                        border: isCurrent ? '2px solid #0056b3' : '2px solid transparent',
                        opacity: isAccessible ? 1 : 0.6
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="wizard-step-number"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            marginRight: '12px'
                          }}
                        >
                          {isCompleted ? '✓' : step.id}
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: '14px' }}>
                            {step.title}
                          </div>
                          <div style={{ fontSize: '12px', opacity: 0.9 }}>
                            {step.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current Step Info */}
              <div className="mt-4 p-3 bg-light rounded border">
                <div className="fw-bold mb-1 text-primary">
                  {currentStepData?.title}
                </div>
                <div className="text-muted small">
                  {currentStepData?.description}
                </div>
                
                {/* Step completion status */}
                <div className="mt-2">
                  {isStepCompleted(currentStep) ? (
                    <small className="text-success">
                      <CheckCircle size={12} className="me-1" />
                      Step completed
                    </small>
                  ) : (
                    <small className="text-warning">
                      <AlertCircle size={12} className="me-1" />
                      In progress
                    </small>
                  )}
                </div>
              </div>

              {/* Test Summary */}
              {testData.title && (
                <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded border border-primary border-opacity-25">
                  <div className="fw-bold mb-1 text-primary">Test Summary</div>
                  <div className="small text-muted">
                    <div className="mb-1">
                      <strong>Title:</strong> {testData.title}
                    </div>
                    {testData.settings.useSections ? (
                      <div className="mb-1">
                        <strong>Sections:</strong> {testData.sections.length}
                      </div>
                    ) : (
                      <div className="mb-1">
                        <strong>Questions:</strong> {testData.questions.length}
                      </div>
                    )}
                    <div>
                      <strong>Time Limit:</strong> {testData.settings.timeLimit} min
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        <Col lg="9">
          {/* Main Content */}
          <Card className="shadow-sm">
            <CardBody>
              {error && (
                <Alert color="danger" className="mb-4">
                  <AlertCircle size={16} className="me-2" />
                  {error}
                </Alert>
              )}

              {/* Step Header */}
              <div className="mb-4 pb-3 border-bottom">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="mb-1 text-primary">
                      Step {currentStep}: {currentStepData?.title}
                    </h3>
                    <p className="text-muted mb-0">{currentStepData?.description}</p>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">
                      Step {validSteps.indexOf(currentStep) + 1} of {validSteps.length}
                    </small>
                  </div>
                </div>
              </div>

              {/* Current Step Component */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Creating test...</p>
                </div>
              ) : (
                renderCurrentStep()
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateTestWizard;