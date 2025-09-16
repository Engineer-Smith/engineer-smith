// src/components/QuestionCreation/components/QuestionTypeSelectionStep.tsx - UPDATED

import React, { useMemo } from 'react';
import { Row, Col, Card, CardBody, Badge, Button, Alert } from 'reactstrap';
import { 
  ArrowLeft, 
  ArrowRight,
  Bug,
  Square,
  List,
  CheckSquare,
  Code,
  AlertTriangle
} from 'lucide-react';
import { 
  getAllowedQuestionTypes,
  isValidQuestionTypeForLanguageAndCategory
} from '../../../types';
import type { QuestionCategory, QuestionType, Language } from '../../../types';

interface QuestionTypeOption {
  value: QuestionType;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  difficulty: string;
  autoGradeable: boolean;
}

interface QuestionTypeSelectionStepProps {
  selectedLanguage: Language;
  languageLabel: string;
  selectedCategory: QuestionCategory;
  categoryLabel: string;
  onQuestionTypeSelect: (type: QuestionType) => void;
  onResetToCategory: () => void;
}

const QuestionTypeSelectionStep: React.FC<QuestionTypeSelectionStepProps> = ({
  selectedLanguage,
  languageLabel,
  selectedCategory,
  categoryLabel,
  onQuestionTypeSelect,
  onResetToCategory
}) => {

  const questionTypeOptions: QuestionTypeOption[] = [
    {
      value: 'multipleChoice' as QuestionType,
      label: 'Multiple Choice',
      description: 'Question with multiple options, one correct answer',
      icon: List,
      color: 'primary',
      difficulty: 'Easy to create',
      autoGradeable: true
    },
    {
      value: 'trueFalse' as QuestionType,
      label: 'True/False',
      description: 'Simple true or false question',
      icon: CheckSquare,
      color: 'success',
      difficulty: 'Very easy',
      autoGradeable: true
    },
    {
      value: 'fillInTheBlank' as QuestionType,
      label: 'Fill in the Blank',
      description: 'Complete missing parts of code or text',
      icon: Square,
      color: 'warning',
      difficulty: 'Moderate',
      autoGradeable: true
    },
    {
      value: 'codeChallenge' as QuestionType,
      label: 'Code Challenge',
      description: 'Write code to solve a programming problem',
      icon: Code,
      color: 'info',
      difficulty: 'Advanced',
      autoGradeable: true
    },
    {
      value: 'codeDebugging' as QuestionType,
      label: 'Code Debugging',
      description: 'Find and fix bugs in provided code',
      icon: Bug,
      color: 'danger',
      difficulty: 'Advanced',
      autoGradeable: true
    }
  ];

  // Get allowed types using the new validation system
  const allowedTypes = useMemo(() => {
    return getAllowedQuestionTypes(selectedLanguage, selectedCategory);
  }, [selectedLanguage, selectedCategory]);

  // Get available options (those that are allowed)
  const availableOptions = useMemo(() => {
    return questionTypeOptions.filter(option => 
      allowedTypes.includes(option.value)
    );
  }, [questionTypeOptions, allowedTypes]);

  // Get restricted options (those that are not allowed)
  const restrictedOptions = useMemo(() => {
    return questionTypeOptions.filter(option => 
      !allowedTypes.includes(option.value)
    );
  }, [questionTypeOptions, allowedTypes]);

  // Get restriction reason based on language and category
  const getRestrictionReason = () => {
    if (selectedCategory === 'ui') {
      return `UI questions for ${languageLabel} should focus on visual components and layouts. Use Fill-in-the-Blank for code completion exercises.`;
    }
    if (selectedCategory === 'logic') {
      return `Logic questions for ${languageLabel} require algorithmic problem-solving. Use Code Challenge or Code Debugging for computational problems.`;
    }
    if (selectedCategory === 'syntax') {
      return `Syntax questions test language-specific knowledge. Multiple choice and Fill-in-the-Blank work well for syntax concepts.`;
    }
    return `Some question types are not suitable for ${languageLabel} ${categoryLabel} questions.`;
  };

  // Handle type selection with validation
  const handleTypeSelection = (type: QuestionType) => {
    // Double-check validation before selection
    if (!isValidQuestionTypeForLanguageAndCategory(type, selectedLanguage, selectedCategory)) {
      console.warn(`Invalid selection: ${type} not allowed for ${selectedLanguage} ${selectedCategory}`);
      return;
    }
    
    onQuestionTypeSelect(type);
  };

  return (
    <div className="question-type-selection-step">
      {/* Breadcrumb navigation */}
      <div className="mb-4">
        <div className="d-flex align-items-center text-muted small mb-2">
          <span className="text-success me-2">{languageLabel}</span>
          <ArrowRight size={14} className="me-2" />
          <span className="text-success me-2">{categoryLabel}</span>
          <ArrowRight size={14} className="me-2" />
          <span>Question Type</span>
          <Button
            color="link" 
            size="sm" 
            className="ms-auto p-0"
            onClick={onResetToCategory}
          >
            <ArrowLeft size={14} className="me-1" />
            Change Category
          </Button>
        </div>
      </div>

      {/* Available question types */}
      <h5 className="mb-3">Choose Question Type</h5>
      
      {availableOptions.length > 0 ? (
        <Row className="g-3 mb-4">
          {availableOptions.map((option) => {
            const IconComponent = option.icon;
            
            return (
              <Col md={6} lg={4} key={option.value}>
                <Card 
                  className="question-type-card h-100 border-hover"
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleTypeSelection(option.value)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <CardBody className="text-center p-4">
                    <div 
                      className={`icon-circle mx-auto mb-3 d-flex align-items-center justify-content-center`}
                      style={{ 
                        width: '60px', 
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: `var(--bs-${option.color})`,
                        color: 'white'
                      }}
                    >
                      <IconComponent size={28} />
                    </div>
                    
                    <h6 className="mb-2">{option.label}</h6>
                    <p className="text-muted small mb-3">{option.description}</p>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <Badge color="light" className="text-muted">
                        {option.difficulty}
                      </Badge>
                      <Badge color="success" outline>
                        Auto-gradeable
                      </Badge>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Alert color="danger" className="mb-4">
          <AlertTriangle size={16} className="me-2" />
          <strong>No question types available</strong>
          <p className="mb-0">
            The combination of {languageLabel} and {categoryLabel} doesn't support any question types. 
            Please select a different category.
          </p>
        </Alert>
      )}

      {/* Restricted types info (if any) */}
      {restrictedOptions.length > 0 && availableOptions.length > 0 && (
        <Alert color="info" className="mb-4">
          <div className="d-flex">
            <AlertTriangle size={16} className="me-2 mt-1 flex-shrink-0" />
            <div>
              <strong>Not Available for {languageLabel} {categoryLabel} Questions</strong>
              <p className="mb-2">{getRestrictionReason()}</p>
              
              <div className="d-flex flex-wrap gap-2">
                {restrictedOptions.map((option) => {
                  const IconComponent = option.icon;
                  
                  return (
                    <Badge 
                      key={option.value}
                      color="secondary" 
                      className="d-flex align-items-center gap-1 p-2"
                      style={{ fontSize: '0.75rem', opacity: 0.7 }}
                    >
                      <IconComponent size={14} />
                      {option.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </Alert>
      )}

      {/* Help text */}
      <div className="text-muted small">
        <p className="mb-0">
          Available types: <strong>{allowedTypes.join(', ')}</strong>
        </p>
      </div>
    </div>
  );
};

export default QuestionTypeSelectionStep;