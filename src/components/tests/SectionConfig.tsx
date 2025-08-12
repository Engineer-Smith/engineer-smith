// src/components/tests/SectionConfig.tsx
import React, { useState } from 'react';
import {
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  Badge,
  Alert,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import type { CreateTestData, SectionWithQuestions } from '../../types';

interface SectionConfigProps {
  testData: CreateTestData;
  setTestData: React.Dispatch<React.SetStateAction<CreateTestData>>;
  onNext: () => void;
  onPrevious: () => void;
  setError: (error: string | null) => void;
}

const SECTION_TYPES = [
  {
    value: 'mixed',
    name: 'Mixed Questions',
    description: 'Any question types allowed',
    icon: '🔀',
    suggestedTime: 2
  },
  {
    value: 'multiple_choice',
    name: 'Multiple Choice',
    description: 'Only multiple choice questions',
    icon: '📝',
    suggestedTime: 1.5
  },
  {
    value: 'true_false',
    name: 'True/False',
    description: 'Only true/false questions',
    icon: '✅',
    suggestedTime: 1
  },
  {
    value: 'coding',
    name: 'Coding Challenges',
    description: 'Code challenges and debugging',
    icon: '💻',
    suggestedTime: 8
  },
  {
    value: 'debugging',
    name: 'Code Debugging',
    description: 'Only debug & fix questions',
    icon: '🐛',
    suggestedTime: 10
  },
  {
    value: 'theory',
    name: 'Theory Questions',
    description: 'Multiple choice and true/false only',
    icon: '📚',
    suggestedTime: 1.5
  },
  {
    value: 'practical',
    name: 'Practical Coding',
    description: 'Only hands-on coding questions',
    icon: '⚡',
    suggestedTime: 12
  },
  {
    value: 'custom',
    name: 'Custom Section',
    description: 'Custom question type restrictions',
    icon: '⚙️',
    suggestedTime: 3
  }
];

const SectionConfig: React.FC<SectionConfigProps> = ({
  testData,
  setTestData,
  onNext,
  onPrevious,
  setError
}) => {
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionWithQuestions | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Initialize empty section
  const getEmptySection = (): SectionWithQuestions => ({
    name: '',
    description: '',
    timeLimit: 15,
    order: testData.sections.length + 1,
    instructions: '',
    sectionType: 'mixed',
    allowedQuestionTypes: {
      multiple_choice: true,
      true_false: true,
      code_challenge: true,
      debug_fix: true
    },
    sectionSettings: {
      shuffleQuestions: true,
      shuffleOptions: true,
      showProgressBar: true,
      allowSkipping: false,
      showRemainingTime: true,
      autoSubmitOnTimeUp: true,
      codeEditor: {
        enabled: true,
        language: 'javascript',
        showLineNumbers: true,
        allowReset: true
      }
    },
    questions: [],
    questionPool: {
      enabled: false,
      totalQuestions: 5,
      selectionStrategy: 'balanced',
      availableQuestions: [],
      distribution: {},
      constraints: {
        ensureVariety: true,
        avoidSimilarQuestions: true,
        respectPrerequisites: true
      }
    },
    tempId: `temp-${Date.now()}`
  });

  const handleAddSection = () => {
    setEditingSection(getEmptySection());
    setEditingIndex(null);
    setShowSectionModal(true);
  };

  const handleEditSection = (section: SectionWithQuestions, index: number) => {
    setEditingSection({ ...section });
    setEditingIndex(index);
    setShowSectionModal(true);
  };

  const handleSaveSection = () => {
    if (!editingSection) return;

    // Validation
    if (!editingSection.name.trim()) {
      setError('Section name is required');
      return;
    }

    if (editingSection.timeLimit <= 0) {
      setError('Section time limit must be greater than 0');
      return;
    }

    setTestData(prev => {
      const newSections = [...prev.sections];
      
      if (editingIndex !== null) {
        // Update existing section
        newSections[editingIndex] = editingSection;
      } else {
        // Add new section
        newSections.push(editingSection);
      }

      // Update order for all sections
      newSections.forEach((section, index) => {
        section.order = index + 1;
      });

      return {
        ...prev,
        sections: newSections
      };
    });

    setShowSectionModal(false);
    setEditingSection(null);
    setEditingIndex(null);
    setError(null);
  };

  const handleRemoveSection = (index: number) => {
    if (window.confirm('Are you sure you want to remove this section?')) {
      setTestData(prev => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSectionTypeChange = (sectionType: string) => {
    if (!editingSection) return;

    const typeInfo = SECTION_TYPES.find(t => t.value === sectionType);
    const suggestedTime = typeInfo?.suggestedTime || 5;

    // Auto-configure allowed question types based on section type
    let allowedQuestionTypes = {
      multiple_choice: true,
      true_false: true,
      code_challenge: true,
      debug_fix: true
    };

    switch (sectionType) {
      case 'multiple_choice':
        allowedQuestionTypes = { multiple_choice: true, true_false: false, code_challenge: false, debug_fix: false };
        break;
      case 'true_false':
        allowedQuestionTypes = { multiple_choice: false, true_false: true, code_challenge: false, debug_fix: false };
        break;
      case 'coding':
        allowedQuestionTypes = { multiple_choice: false, true_false: false, code_challenge: true, debug_fix: true };
        break;
      case 'debugging':
        allowedQuestionTypes = { multiple_choice: false, true_false: false, code_challenge: false, debug_fix: true };
        break;
      case 'theory':
        allowedQuestionTypes = { multiple_choice: true, true_false: true, code_challenge: false, debug_fix: false };
        break;
      case 'practical':
        allowedQuestionTypes = { multiple_choice: false, true_false: false, code_challenge: true, debug_fix: false };
        break;
    }

    setEditingSection({
      ...editingSection,
      sectionType: sectionType as any,
      allowedQuestionTypes,
      timeLimit: editingSection.timeLimit || suggestedTime * 5 // Estimate 5 questions
    });
  };

  const handleNext = () => {
    setError(null);

    if (testData.sections.length === 0) {
      setError('Please add at least one section');
      return;
    }

    // Validate all sections have names and time limits
    for (let i = 0; i < testData.sections.length; i++) {
      const section = testData.sections[i];
      if (!section.name.trim()) {
        setError(`Section ${i + 1} is missing a name`);
        return;
      }
      if (section.timeLimit <= 0) {
        setError(`Section ${i + 1} must have a positive time limit`);
        return;
      }
    }

    onNext();
  };

  const getTotalTime = () => {
    return testData.sections.reduce((total, section) => total + section.timeLimit, 0);
  };

  const getSectionTypeInfo = (sectionType: string) => {
    return SECTION_TYPES.find(t => t.value === sectionType) || SECTION_TYPES[0];
  };

  return (
    <div>
      {/* Section Overview */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Test Sections</h5>
          <Button color="success" onClick={handleAddSection}>
            + Add Section
          </Button>
        </div>

        {testData.sections.length > 0 && (
          <Alert color="info" className="mb-3">
            <strong>Total test time:</strong> {getTotalTime()} minutes across {testData.sections.length} section{testData.sections.length !== 1 ? 's' : ''}
          </Alert>
        )}

        {testData.sections.length === 0 ? (
          <Card>
            <CardBody className="text-center py-5">
              <div style={{ fontSize: '3rem' }} className="mb-3">📚</div>
              <h6>No sections added yet</h6>
              <p className="text-muted mb-3">
                Create sections to organize your test into different parts with separate time limits.
              </p>
              <Button color="primary" onClick={handleAddSection}>
                Create Your First Section
              </Button>
            </CardBody>
          </Card>
        ) : (
          <ListGroup>
            {testData.sections.map((section, index) => {
              const typeInfo = getSectionTypeInfo(section.sectionType);
              return (
                <ListGroupItem key={section.tempId || section._id || index} className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <span className="me-2" style={{ fontSize: '1.2rem' }}>{typeInfo.icon}</span>
                      <h6 className="mb-0">{section.name}</h6>
                      <Badge color="outline-secondary" className="ms-2">
                        {section.timeLimit} min
                      </Badge>
                    </div>
                    <div className="small text-muted mb-2">
                      {section.description || typeInfo.description}
                    </div>
                    <div className="d-flex gap-1">
                      <Badge color="info">{typeInfo.name}</Badge>
                      <Badge color="secondary">{section.questions.length} questions</Badge>
                      {section.questionPool.enabled && (
                        <Badge color="warning">Pool: {section.questionPool.totalQuestions}</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Button
                      color="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditSection(section, index)}
                    >
                      Edit
                    </Button>
                    <Button
                      color="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveSection(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </ListGroupItem>
              );
            })}
          </ListGroup>
        )}
      </div>

      {/* Section Modal */}
      <Modal isOpen={showSectionModal} toggle={() => setShowSectionModal(false)} size="lg">
        <ModalHeader toggle={() => setShowSectionModal(false)}>
          {editingIndex !== null ? 'Edit Section' : 'Add New Section'}
        </ModalHeader>
        <ModalBody>
          {editingSection && (
            <div>
              <Row>
                <Col md="8">
                  <FormGroup>
                    <Label for="sectionName">Section Name *</Label>
                    <Input
                      type="text"
                      id="sectionName"
                      value={editingSection.name}
                      onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                      placeholder="e.g., JavaScript Fundamentals"
                    />
                  </FormGroup>
                </Col>
                <Col md="4">
                  <FormGroup>
                    <Label for="sectionTimeLimit">Time Limit (minutes) *</Label>
                    <Input
                      type="number"
                      id="sectionTimeLimit"
                      min="1"
                      max="120"
                      value={editingSection.timeLimit}
                      onChange={(e) => setEditingSection({ ...editingSection, timeLimit: parseInt(e.target.value) || 15 })}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label for="sectionDescription">Description</Label>
                <Input
                  type="textarea"
                  id="sectionDescription"
                  rows={2}
                  value={editingSection.description || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  placeholder="Brief description of what this section covers"
                />
              </FormGroup>

              <FormGroup>
                <Label>Section Type</Label>
                <Row>
                  {SECTION_TYPES.map((type) => (
                    <Col md="6" lg="4" key={type.value} className="mb-2">
                      <Card
                        className={`cursor-pointer ${
                          editingSection.sectionType === type.value ? 'border-primary bg-light' : 'border-light'
                        }`}
                        onClick={() => handleSectionTypeChange(type.value)}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      >
                        <CardBody className="text-center p-2">
                          <div style={{ fontSize: '1.5rem' }}>{type.icon}</div>
                          <div className="small fw-bold">{type.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            ~{type.suggestedTime} min/q
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </FormGroup>

              <FormGroup>
                <Label for="sectionInstructions">Instructions for Students</Label>
                <Input
                  type="textarea"
                  id="sectionInstructions"
                  rows={2}
                  value={editingSection.instructions || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, instructions: e.target.value })}
                  placeholder="Any specific instructions for this section"
                />
              </FormGroup>

              <FormGroup check>
                <Input
                  type="checkbox"
                  id="enableQuestionPool"
                  checked={editingSection.questionPool.enabled}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    questionPool: {
                      ...editingSection.questionPool,
                      enabled: e.target.checked
                    }
                  })}
                />
                <Label check for="enableQuestionPool">
                  Use question pool (randomly select questions)
                </Label>
              </FormGroup>

              {editingSection.questionPool.enabled && (
                <Row className="mt-2">
                  <Col md="6">
                    <FormGroup>
                      <Label for="poolTotalQuestions">Questions to Select</Label>
                      <Input
                        type="number"
                        id="poolTotalQuestions"
                        min="1"
                        max="50"
                        value={editingSection.questionPool.totalQuestions}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          questionPool: {
                            ...editingSection.questionPool,
                            totalQuestions: parseInt(e.target.value) || 5
                          }
                        })}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="poolStrategy">Selection Strategy</Label>
                      <Input
                        type="select"
                        id="poolStrategy"
                        value={editingSection.questionPool.selectionStrategy}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          questionPool: {
                            ...editingSection.questionPool,
                            selectionStrategy: e.target.value as any
                          }
                        })}
                      >
                        <option value="balanced">Balanced (mix of difficulties)</option>
                        <option value="random">Random</option>
                        <option value="progressive">Progressive (easy to hard)</option>
                        <option value="weighted">Weighted by usage</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveSection}>
            {editingIndex !== null ? 'Update Section' : 'Add Section'}
          </Button>
          <Button color="secondary" onClick={() => setShowSectionModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Navigation */}
      <div className="d-flex justify-content-between pt-3 border-top">
        <Button color="secondary" onClick={onPrevious}>
          Previous: Test Structure
        </Button>
        <Button color="primary" onClick={handleNext}>
          Next: Add Questions
        </Button>
      </div>
    </div>
  );
};

export default SectionConfig;