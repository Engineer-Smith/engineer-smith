import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  CardTitle,
  Badge,
  Alert,
  Progress,
  InputGroup,
  InputGroupText,
  ButtonGroup,
  Collapse
} from 'reactstrap';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  Move,
  CheckCircle,
  Settings,
  Zap,
  Info,
  Target,
  BarChart3,
  Copy
} from 'lucide-react';

// Import types
import type { WizardStepProps } from '../../types/createTest';
import type { TestSection } from '../../types';

// Interface for recommendations
interface SectionRecommendation {
  type: 'warning' | 'suggestion' | 'info';
  message: string;
}

// Interface for section templates
interface SectionTemplate {
  name: string;
  timeLimit: number;
  questions?: never[]; // Always empty for templates
}

// Template type
type TemplateType = 'frontend' | 'react' | 'fullstack';

const SectionConfig: React.FC<WizardStepProps> = ({
  testData,
  setTestData,
  onNext,
  onPrevious,
  setError
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const addSection = (): void => {
    const currentSections = testData.sections || [];
    const suggestedTime = Math.max(10, Math.floor((testData.settings?.timeLimit || 45) / (currentSections.length + 2)));
    const newSection: TestSection = {
      name: `Section ${currentSections.length + 1}`,
      timeLimit: suggestedTime,
      questions: []
    };

    setTestData({
      ...testData,
      sections: [...currentSections, newSection]
    });
  };

  const removeSection = (index: number): void => {
    const currentSections = testData.sections || [];
    if (currentSections.length <= 1) {
      setError('At least one section is required');
      return;
    }

    const newSections = currentSections.filter((_, i) => i !== index);
    setTestData({
      ...testData,
      sections: newSections
    });
    setError(null);
  };

  const updateSection = (index: number, field: keyof TestSection, value: string | number): void => {
    const currentSections = testData.sections || [];
    const newSections = [...currentSections];
    newSections[index] = {
      ...newSections[index],
      [field]: value
    };

    setTestData({
      ...testData,
      sections: newSections
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down'): void => {
    const sections = testData.sections || [];
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];

    setTestData({
      ...testData,
      sections: newSections
    });
  };

  const duplicateSection = (index: number): void => {
    const sections = testData.sections || [];
    const sectionToDupe = sections[index];
    const newSection: TestSection = {
      ...sectionToDupe,
      name: `${sectionToDupe.name} (Copy)`,
      questions: [] // Don't duplicate questions, just the structure
    };

    const newSections = [...sections];
    newSections.splice(index + 1, 0, newSection);
    
    setTestData({
      ...testData,
      sections: newSections
    });
  };

  const autoDistributeTime = (): void => {
    const sections = testData.sections || [];
    if (sections.length === 0) return;

    const totalTime = testData.settings?.timeLimit || 0;
    const timePerSection = Math.floor(totalTime / sections.length);
    const remainder = totalTime % sections.length;

    const newSections = sections.map((section, index) => ({
      ...section,
      timeLimit: timePerSection + (index < remainder ? 1 : 0)
    }));

    setTestData({
      ...testData,
      sections: newSections
    });
  };

  const applySectionTemplate = (template: TemplateType): void => {
    const templates: Record<TemplateType, SectionTemplate[]> = {
      'frontend': [
        { name: 'HTML & CSS Fundamentals', timeLimit: 15 },
        { name: 'JavaScript Basics', timeLimit: 20 },
        { name: 'DOM Manipulation', timeLimit: 15 }
      ],
      'react': [
        { name: 'React Components', timeLimit: 20 },
        { name: 'State & Props', timeLimit: 15 },
        { name: 'Hooks & Effects', timeLimit: 20 }
      ],
      'fullstack': [
        { name: 'Frontend Development', timeLimit: 25 },
        { name: 'Backend APIs', timeLimit: 25 },
        { name: 'Database Integration', timeLimit: 20 }
      ]
    };

    const templateSections = templates[template] || [];
    const sectionsWithQuestions: TestSection[] = templateSections.map(section => ({
      ...section,
      questions: []
    }));

    setTestData({
      ...testData,
      sections: sectionsWithQuestions
    });
  };

  const validateStep = (): boolean => {
    const sections = testData.sections || [];
    
    if (sections.length === 0) {
      setError('At least one section is required');
      return false;
    }

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section.name?.trim()) {
        setError(`Section ${i + 1} name is required`);
        return false;
      }
      if (section.timeLimit < 1) {
        setError(`Section ${i + 1} must have a time limit of at least 1 minute`);
        return false;
      }
    }

    const totalSectionTime = sections.reduce((sum, section) => sum + section.timeLimit, 0);
    const testTimeLimit = testData.settings?.timeLimit || 0;
    
    if (totalSectionTime > testTimeLimit) {
      setError(`Total section time (${totalSectionTime} min) cannot exceed test time limit (${testTimeLimit} min)`);
      return false;
    }

    if (totalSectionTime < testTimeLimit * 0.5) {
      setError(`Total section time (${totalSectionTime} min) is very low compared to test limit (${testTimeLimit} min). Consider adding more time.`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = (): void => {
    if (validateStep()) {
      onNext?.();
    }
  };

  const handleSectionNameChange = (index: number, e: React.ChangeEvent<HTMLInputElement>): void => {
    updateSection(index, 'name', e.target.value);
  };

  const handleSectionTimeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>): void => {
    updateSection(index, 'timeLimit', parseInt(e.target.value) || 1);
  };

  const getSectionRecommendations = (): SectionRecommendation[] => {
    const sections = testData.sections || [];
    const totalSectionTime = sections.reduce((sum, section) => sum + section.timeLimit, 0);
    const testTimeLimit = testData.settings?.timeLimit || 0;
    const timeUtilization = testTimeLimit > 0 ? (totalSectionTime / testTimeLimit) * 100 : 0;
    
    const recommendations: SectionRecommendation[] = [];
    
    if (sections.length < 3 && (testData.languages?.length || 0) > 1) {
      recommendations.push({
        type: 'suggestion',
        message: 'Consider creating separate sections for different programming languages'
      });
    }
    
    if (timeUtilization < 80) {
      recommendations.push({
        type: 'warning',
        message: 'You\'re only using ' + Math.round(timeUtilization) + '% of available time'
      });
    }
    
    if (sections.some(s => s.timeLimit < 5)) {
      recommendations.push({
        type: 'warning',
        message: 'Some sections have very short time limits (< 5 minutes)'
      });
    }

    return recommendations;
  };

  const sections = testData.sections || [];
  const totalSectionTime = sections.reduce((sum, section) => sum + section.timeLimit, 0);
  const testTimeLimit = testData.settings?.timeLimit || 0;
  const remainingTime = testTimeLimit - totalSectionTime;
  const timeUtilization = testTimeLimit > 0 ? (totalSectionTime / testTimeLimit) * 100 : 0;
  const recommendations = getSectionRecommendations();

  // Initialize with one section if none exist
  useEffect(() => {
    if (sections.length === 0) {
      addSection();
    }
  }, []);

  return (
    <div>
      <Row>
        <Col lg={8}>
          {/* Header Card with Templates */}
          <Card className="border-0 shadow-sm mb-4 bg-light">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="mb-1 d-flex align-items-center">
                    <Zap size={20} className="me-2 text-warning" />
                    Quick Section Templates
                  </h6>
                  <small className="text-muted">
                    Apply pre-configured sections based on your test type
                  </small>
                </div>
                <Button
                  color="outline-secondary"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <Settings size={14} className="me-1" />
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </Button>
              </div>

              <ButtonGroup className="w-100">
                <Button
                  color="outline-primary"
                  onClick={() => applySectionTemplate('frontend')}
                  className="flex-fill"
                >
                  Frontend Template
                </Button>
                <Button
                  color="outline-info"
                  onClick={() => applySectionTemplate('react')}
                  className="flex-fill"
                >
                  React Template
                </Button>
                <Button
                  color="outline-success"
                  onClick={() => applySectionTemplate('fullstack')}
                  className="flex-fill"
                >
                  Full Stack Template
                </Button>
              </ButtonGroup>

              <Collapse isOpen={showAdvanced}>
                <div className="mt-3 pt-3 border-top">
                  <div className="d-flex gap-2">
                    <Button
                      color="outline-warning"
                      size="sm"
                      onClick={autoDistributeTime}
                      disabled={sections.length === 0}
                    >
                      <BarChart3 size={14} className="me-1" />
                      Auto-distribute Time
                    </Button>
                    <small className="text-muted align-self-center">
                      Evenly distribute {testTimeLimit} minutes across {sections.length} sections
                    </small>
                  </div>
                </div>
              </Collapse>
            </CardBody>
          </Card>

          {/* Main Configuration Card */}
          <Card className="border-0 shadow-sm mb-4">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <CardTitle tag="h6" className="mb-0 d-flex align-items-center">
                  <Layers size={20} className="me-2 text-primary" />
                  Configure Sections
                </CardTitle>
                <Button 
                  color="success" 
                  size="sm" 
                  onClick={addSection}
                  className="d-flex align-items-center"
                >
                  <Plus size={16} className="me-2" />
                  Add Section
                </Button>
              </div>

              <p className="text-muted mb-4">
                Create timed sections to organize your test. Each section can have its own time limit and questions.
              </p>

              {/* Time Budget Alert */}
              <Alert 
                color={remainingTime < 0 ? 'danger' : remainingTime === 0 ? 'success' : timeUtilization < 80 ? 'warning' : 'info'} 
                className="mb-4"
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <AlertCircle size={16} className="me-2" />
                    <div>
                      <strong>Time Budget:</strong> {totalSectionTime} / {testTimeLimit} minutes used
                      {remainingTime > 0 && ` (${remainingTime} minutes remaining)`}
                      {remainingTime < 0 && ` (${Math.abs(remainingTime)} minutes over limit!)`}
                    </div>
                  </div>
                  <Badge color={timeUtilization >= 80 ? "success" : "warning"}>
                    {Math.round(timeUtilization)}%
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(timeUtilization, 100)} 
                  color={remainingTime < 0 ? 'danger' : timeUtilization >= 80 ? 'success' : 'warning'}
                  className="mt-2"
                  style={{ height: '6px' }}
                />
              </Alert>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="mb-4">
                  {recommendations.map((rec, index) => (
                    <Alert key={index} color={rec.type === 'warning' ? 'warning' : 'info'} className="py-2 mb-2">
                      <div className="d-flex align-items-center">
                        {rec.type === 'warning' ? (
                          <AlertCircle size={14} className="me-2" />
                        ) : (
                          <Info size={14} className="me-2" />
                        )}
                        <small>{rec.message}</small>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Sections List */}
              <div className="sections-list">
                {sections.map((section, index) => (
                  <Card key={index} className="border mb-3">
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h6 className="mb-0 d-flex align-items-center">
                          <Badge color="primary" className="me-2">
                            {index + 1}
                          </Badge>
                          Section {index + 1}
                          {(section.questions?.length || 0) > 0 && (
                            <Badge color="success" size="sm" className="ms-2">
                              <CheckCircle size={10} className="me-1" />
                              {section.questions?.length || 0} questions
                            </Badge>
                          )}
                        </h6>
                        
                        <div className="d-flex gap-1">
                          <Button
                            color="outline-secondary"
                            size="sm"
                            onClick={() => duplicateSection(index)}
                            title="Duplicate Section"
                          >
                            <Copy size={14} />
                          </Button>
                          <Button
                            color="outline-secondary"
                            size="sm"
                            onClick={() => moveSection(index, 'up')}
                            disabled={index === 0}
                            title="Move Up"
                          >
                            <Move size={14} style={{ transform: 'rotate(-90deg)' }} />
                          </Button>
                          <Button
                            color="outline-secondary"
                            size="sm"
                            onClick={() => moveSection(index, 'down')}
                            disabled={index === sections.length - 1}
                            title="Move Down"
                          >
                            <Move size={14} style={{ transform: 'rotate(90deg)' }} />
                          </Button>
                          <Button
                            color="outline-danger"
                            size="sm"
                            onClick={() => removeSection(index)}
                            disabled={sections.length <= 1}
                            title="Remove Section"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      <Row>
                        <Col md={8}>
                          <FormGroup className="mb-3">
                            <Label className="fw-medium">Section Name *</Label>
                            <Input
                              type="text"
                              placeholder="e.g., JavaScript Basics"
                              value={section.name}
                              onChange={(e) => handleSectionNameChange(index, e)}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup className="mb-3">
                            <Label className="fw-medium d-flex align-items-center">
                              <Clock size={14} className="me-1" />
                              Time Limit (min) *
                            </Label>
                            <InputGroup>
                              <Input
                                type="number"
                                min="1"
                                max={testTimeLimit}
                                value={section.timeLimit}
                                onChange={(e) => handleSectionTimeChange(index, e)}
                              />
                              <InputGroupText>
                                <Clock size={12} />
                              </InputGroupText>
                            </InputGroup>
                          </FormGroup>
                        </Col>
                      </Row>

                      <div className="p-2 bg-light rounded">
                        <Row className="align-items-center">
                          <Col>
                            <small className="text-muted">
                              Questions will be assigned to this section in the next step.
                              Time limit: <strong>{section.timeLimit} minutes</strong>
                            </small>
                          </Col>
                          <Col xs="auto">
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-muted">Progress:</small>
                              <Badge color={(section.questions?.length || 0) > 0 ? "success" : "warning"} size="sm">
                                {(section.questions?.length || 0) > 0 ? "Ready" : "Pending"}
                              </Badge>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {sections.length === 0 && (
                <div className="text-center py-5">
                  <Layers className="text-muted mb-3" size={48} />
                  <h6>No sections configured</h6>
                  <p className="text-muted mb-3">Add your first section to get started.</p>
                  <Button color="primary" onClick={addSection}>
                    <Plus size={16} className="me-2" />
                    Add First Section
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm position-sticky" style={{ top: '20px' }}>
            <CardBody>
              <h6 className="mb-3 d-flex align-items-center">
                <Target size={20} className="me-2 text-info" />
                Sections Summary
              </h6>
              
              {/* Quick Stats */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div className="text-center p-2 bg-primary bg-opacity-10 rounded">
                    <div className="h5 mb-0 text-primary">{sections.length}</div>
                    <small className="text-muted">Sections</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-2 bg-warning bg-opacity-10 rounded">
                    <div className="h5 mb-0 text-warning">{totalSectionTime}</div>
                    <small className="text-muted">Minutes</small>
                  </div>
                </div>
              </div>

              {/* Time Analysis */}
              <div className="mb-3">
                <Label className="fw-bold mb-2">Time Distribution:</Label>
                <div className="mb-2">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Used:</span>
                    <span>{totalSectionTime} / {testTimeLimit} min</span>
                  </div>
                  <Progress 
                    value={timeUtilization} 
                    color={timeUtilization >= 80 ? "success" : "warning"}
                    style={{ height: '6px' }}
                  />
                </div>
                {remainingTime > 0 && (
                  <small className="text-info">
                    <Info size={12} className="me-1" />
                    {remainingTime} minutes available
                  </small>
                )}
                {remainingTime < 0 && (
                  <small className="text-danger">
                    <AlertCircle size={12} className="me-1" />
                    {Math.abs(remainingTime)} minutes over limit
                  </small>
                )}
              </div>

              {/* Sections List */}
              <div className="mb-4">
                <Label className="fw-bold mb-2">Sections ({sections.length}):</Label>
                <div className="mt-2">
                  {sections.map((section, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                      <div>
                        <small className="text-truncate d-block" style={{ maxWidth: '120px' }}>
                          {index + 1}. {section.name}
                        </small>
                        <div className="d-flex gap-1">
                          <Badge color="info" size="sm">
                            {section.timeLimit}m
                          </Badge>
                          <Badge color={(section.questions?.length || 0) > 0 ? "success" : "secondary"} size="sm">
                            {section.questions?.length || 0} Q
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <Alert color="light" className="mb-0">
                <strong>Next Step:</strong>
                <div className="mt-1 small">
                  Assign questions to each section and set point values. Each section should have at least one question.
                </div>
              </Alert>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Navigation */}
      <div className="d-flex justify-content-between pt-4 border-top">
        <Button color="secondary" onClick={onPrevious} className="d-flex align-items-center">
          <ArrowLeft size={16} className="me-2" />
          Previous: Test Structure
        </Button>
        <Button 
          color="primary" 
          onClick={handleNext} 
          className="d-flex align-items-center"
          disabled={sections.length === 0}
        >
          Next: Add Questions
          <ArrowRight size={16} className="ms-2" />
        </Button>
      </div>
    </div>
  );
};

export default SectionConfig;