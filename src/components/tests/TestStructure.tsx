// src/components/tests/TestStructure.tsx
import React from 'react';
import {
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  Alert,
  Badge
} from 'reactstrap';
import type { CreateTestData } from '../../types';

interface TestStructureProps {
  testData: CreateTestData;
  setTestData: React.Dispatch<React.SetStateAction<CreateTestData>>;
  onNext: () => void;
  onPrevious: () => void;
  setError: (error: string | null) => void;
}

const TestStructure: React.FC<TestStructureProps> = ({
  testData,
  setTestData,
  onNext,
  onPrevious,
  setError
}) => {

  const handleStructureTypeChange = (useSections: boolean) => {
    setTestData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        useSections
      },
      // Reset sections if switching to simple
      sections: useSections ? prev.sections : []
    }));
  };

  const handleSettingChange = (key: string, value: any) => {
    setTestData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const handleNext = () => {
    setError(null);
    
    // Validation
    if (testData.settings.timeLimit <= 0) {
      setError('Time limit must be greater than 0');
      return;
    }
    
    if (testData.settings.passingScore < 0 || testData.settings.passingScore > 100) {
      setError('Passing score must be between 0 and 100');
      return;
    }
    
    if (testData.settings.attemptsAllowed <= 0) {
      setError('Number of attempts must be greater than 0');
      return;
    }
    
    onNext();
  };

  return (
    <div>
      {/* Test Structure Type */}
      <div className="mb-4">
        <h5>Test Structure</h5>
        <p className="text-muted">Choose how you want to organize your test.</p>
        
        <Row>
          <Col md="6">
            <Card
              className={`h-100 cursor-pointer ${
                !testData.settings.useSections ? 'border-primary bg-light' : 'border-light'
              }`}
              onClick={() => handleStructureTypeChange(false)}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              <CardBody className="text-center">
                <div style={{ fontSize: '2rem' }} className="mb-3">📝</div>
                <h6 className="mb-2">Simple Test</h6>
                <p className="text-muted small mb-3">
                  All questions in one section with a single time limit. Best for quick assessments.
                </p>
                <div className="mb-2">
                  <Badge color="success" className="me-2">Easy to setup</Badge>
                  <Badge color="info">Single timer</Badge>
                </div>
                {!testData.settings.useSections && (
                  <Badge color="primary" className="mt-2">Selected</Badge>
                )}
              </CardBody>
            </Card>
          </Col>
          
          <Col md="6">
            <Card
              className={`h-100 cursor-pointer ${
                testData.settings.useSections ? 'border-primary bg-light' : 'border-light'
              }`}
              onClick={() => handleStructureTypeChange(true)}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              <CardBody className="text-center">
                <div style={{ fontSize: '2rem' }} className="mb-3">📚</div>
                <h6 className="mb-2">Section-Based Test</h6>
                <p className="text-muted small mb-3">
                  Multiple timed sections with different question types. Perfect for comprehensive assessments.
                </p>
                <div className="mb-2">
                  <Badge color="warning" className="me-2">More setup</Badge>
                  <Badge color="success">More control</Badge>
                </div>
                {testData.settings.useSections && (
                  <Badge color="primary" className="mt-2">Selected</Badge>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Test Settings */}
      <div className="mb-4">
        <h5>Test Settings</h5>
        
        <Row>
          {/* Only show overall time limit for simple tests */}
          {!testData.settings.useSections && (
            <Col md="6">
              <FormGroup>
                <Label for="timeLimit">Total Time Limit (minutes) *</Label>
                <Input
                  type="number"
                  id="timeLimit"
                  min="1"
                  max="480"
                  value={testData.settings.timeLimit}
                  onChange={(e) => handleSettingChange('timeLimit', parseInt(e.target.value) || 60)}
                />
                <div className="form-text">
                  How long students have to complete the entire test
                </div>
              </FormGroup>
            </Col>
          )}
          
          <Col md="6">
            <FormGroup>
              <Label for="attemptsAllowed">Attempts Allowed *</Label>
              <Input
                type="number"
                id="attemptsAllowed"
                min="1"
                max="10"
                value={testData.settings.attemptsAllowed}
                onChange={(e) => handleSettingChange('attemptsAllowed', parseInt(e.target.value) || 1)}
              />
              <div className="form-text">
                How many times a student can take this test
              </div>
            </FormGroup>
          </Col>
          
          <Col md="6">
            <FormGroup>
              <Label for="passingScore">Passing Score (%) *</Label>
              <Input
                type="number"
                id="passingScore"
                min="0"
                max="100"
                value={testData.settings.passingScore}
                onChange={(e) => handleSettingChange('passingScore', parseInt(e.target.value) || 70)}
              />
              <div className="form-text">
                Minimum score required to pass the test
              </div>
            </FormGroup>
          </Col>
        </Row>
      </div>

      {/* Question Behavior */}
      <div className="mb-4">
        <h5>Question Behavior</h5>
        <Row>
          <Col md="6">
            <FormGroup check className="mb-3">
              <Input
                type="checkbox"
                id="shuffleQuestions"
                checked={testData.settings.shuffleQuestions}
                onChange={(e) => handleSettingChange('shuffleQuestions', e.target.checked)}
              />
              <Label check for="shuffleQuestions">
                Shuffle question order
              </Label>
              <div className="form-text">
                Randomize the order of questions for each student
              </div>
            </FormGroup>
            
            <FormGroup check className="mb-3">
              <Input
                type="checkbox"
                id="shuffleOptions"
                checked={testData.settings.shuffleOptions}
                onChange={(e) => handleSettingChange('shuffleOptions', e.target.checked)}
              />
              <Label check for="shuffleOptions">
                Shuffle answer options
              </Label>
              <div className="form-text">
                Randomize multiple choice answer options
              </div>
            </FormGroup>
          </Col>
          
          <Col md="6">
            <FormGroup check className="mb-3">
              <Input
                type="checkbox"
                id="showResults"
                checked={testData.settings.showResults}
                onChange={(e) => handleSettingChange('showResults', e.target.checked)}
              />
              <Label check for="showResults">
                Show results to students
              </Label>
              <div className="form-text">
                Students can see their score after completing the test
              </div>
            </FormGroup>
            
            <FormGroup check className="mb-3">
              <Input
                type="checkbox"
                id="showCorrectAnswers"
                checked={testData.settings.showCorrectAnswers}
                onChange={(e) => handleSettingChange('showCorrectAnswers', e.target.checked)}
              />
              <Label check for="showCorrectAnswers">
                Show correct answers
              </Label>
              <div className="form-text">
                Students can see correct answers after submission
              </div>
            </FormGroup>
          </Col>
        </Row>
      </div>

      {/* Availability Settings */}
      <div className="mb-4">
        <h5>Availability (Optional)</h5>
        <Row>
          <Col md="6">
            <FormGroup>
              <Label for="availableFrom">Available From</Label>
              <Input
                type="datetime-local"
                id="availableFrom"
                value={testData.settings.availableFrom || ''}
                onChange={(e) => handleSettingChange('availableFrom', e.target.value || undefined)}
              />
              <div className="form-text">
                When students can start taking this test
              </div>
            </FormGroup>
          </Col>
          
          <Col md="6">
            <FormGroup>
              <Label for="availableUntil">Available Until</Label>
              <Input
                type="datetime-local"
                id="availableUntil"
                value={testData.settings.availableUntil || ''}
                onChange={(e) => handleSettingChange('availableUntil', e.target.value || undefined)}
              />
              <div className="form-text">
                When the test becomes unavailable
              </div>
            </FormGroup>
          </Col>
        </Row>
      </div>

      {/* Summary */}
      {testData.settings.useSections && (
        <Alert color="info">
          <h6>Next: Configure Sections</h6>
          <p className="mb-0">
            You've chosen a section-based test. In the next step, you'll be able to create and configure 
            individual sections with their own time limits, question types, and settings.
          </p>
        </Alert>
      )}

      {!testData.settings.useSections && (
        <Alert color="info">
          <h6>Next: Add Questions</h6>
          <p className="mb-0">
            You've chosen a simple test structure. In the next step, you'll add questions to your test 
            from the question bank or create new ones.
          </p>
        </Alert>
      )}

      {/* Navigation */}
      <div className="d-flex justify-content-between pt-3 border-top">
        <Button color="secondary" onClick={onPrevious}>
          Previous: Test Basics
        </Button>
        <Button color="primary" onClick={handleNext}>
          {testData.settings.useSections ? 'Next: Configure Sections' : 'Next: Add Questions'}
        </Button>
      </div>
    </div>
  );
};

export default TestStructure;