// src/components/tests/CreateTestWizard.tsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, CardBody, Progress, Alert } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

// Import stage components
import TestBasics from './TestBasics';
import TestStructure from './TestStructure';
import SectionConfig from './SectionConfig';
import QuestionAssignment from './QuestionAssignment';
import ReviewPublish from './ReviewPublish';

// Import types
import type { CreateTestData } from '../../types';

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
    description: 'Name, type, and skills'
  },
  {
    id: 2,
    name: 'structure',
    title: 'Test Structure',
    description: 'Settings and sections'
  },
  {
    id: 3,
    name: 'sections',
    title: 'Configure Sections',
    description: 'Section details and timing'
  },
  {
    id: 4,
    name: 'questions',
    title: 'Add Questions',
    description: 'Assign and create questions'
  },
  {
    id: 5,
    name: 'review',
    title: 'Review & Publish',
    description: 'Final review and publish'
  }
];

const CreateTestWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize test data
  const [testData, setTestData] = useState<CreateTestData>({
    title: '',
    description: '',
    instructions: '',
    skills: [],
    testType: 'single_skill',
    settings: {
      timeLimit: 60,
      attemptsAllowed: 1,
      shuffleQuestions: true,
      shuffleOptions: true,
      showResults: true,
      showCorrectAnswers: false,
      passingScore: 70,
      useSections: false,
      useQuestionPool: false
    },
    questions: [],
    sections: [],
    questionPool: { enabled: false },
    category: '',
    tags: []
  });

  const currentStepData = WIZARD_STEPS.find(step => step.id === currentStep);
  const progressPercentage = (currentStep / WIZARD_STEPS.length) * 100;

  const handleNext = () => {
    setError(null);
    
    // Skip section config step if not using sections
    if (currentStep === 2 && !testData.settings.useSections) {
      setCurrentStep(4); // Skip to questions
    } else if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setError(null);
    
    // Skip section config step if not using sections (going backwards)
    if (currentStep === 4 && !testData.settings.useSections) {
      setCurrentStep(2); // Go back to structure
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Only allow clicking on completed or adjacent steps
    if (stepId <= currentStep + 1) {
      setCurrentStep(stepId);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
      navigate('/admin/tests');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TestBasics
            testData={testData}
            setTestData={setTestData}
            onNext={handleNext}
            onCancel={handleCancel}
            setError={setError}
          />
        );
      case 2:
        return (
          <TestStructure
            testData={testData}
            setTestData={setTestData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            setError={setError}
          />
        );
      case 3:
        return (
          <SectionConfig
            testData={testData}
            setTestData={setTestData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            setError={setError}
          />
        );
      case 4:
        return (
          <QuestionAssignment
            testData={testData}
            setTestData={setTestData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            setError={setError}
          />
        );
      case 5:
        return (
          <ReviewPublish
            testData={testData}
            setTestData={setTestData}
            onPrevious={handlePrevious}
            onComplete={() => navigate('/admin/tests')}
            setError={setError}
            setLoading={setLoading}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col lg="3">
          {/* Progress Sidebar */}
          <Card className="position-sticky" style={{ top: '20px' }}>
            <CardBody>
              <h5 className="mb-4">Create Test</h5>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="d-flex justify-content-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} color="primary" className="mb-3" />
              </div>

              {/* Step List */}
              <div className="wizard-steps">
                {WIZARD_STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`wizard-step ${step.id === currentStep ? 'active' : ''} ${
                      step.id < currentStep ? 'completed' : ''
                    } ${step.id > currentStep + 1 ? 'disabled' : ''}`}
                    onClick={() => handleStepClick(step.id)}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '6px',
                      cursor: step.id <= currentStep + 1 ? 'pointer' : 'not-allowed',
                      backgroundColor: step.id === currentStep ? '#007bff' : 
                                     step.id < currentStep ? '#28a745' : '#f8f9fa',
                      color: step.id === currentStep || step.id < currentStep ? 'white' : '#6c757d',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="wizard-step-number"
                        style={{
                          width: '24px',
                          height: '24px',
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
                        {step.id < currentStep ? '✓' : step.id}
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: '14px' }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Step Info */}
              <div className="mt-4 p-3 bg-light rounded">
                <div className="fw-bold mb-1">{currentStepData?.title}</div>
                <div className="text-muted small">{currentStepData?.description}</div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col lg="9">
          {/* Main Content */}
          <Card>
            <CardBody>
              {error && (
                <Alert color="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {/* Step Header */}
              <div className="mb-4">
                <h3 className="mb-1">
                  Step {currentStep}: {currentStepData?.title}
                </h3>
                <p className="text-muted mb-0">{currentStepData?.description}</p>
              </div>

              {/* Current Step Component */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-2">Creating test...</p>
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