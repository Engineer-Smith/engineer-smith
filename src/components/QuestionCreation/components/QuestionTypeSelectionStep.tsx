// src/components/QuestionCreation/components/QuestionTypeSelectionStep.tsx - SIMPLIFIED

import React from 'react';
import { Row, Col, Card, CardBody, Badge, Button, Alert } from 'reactstrap';
import { 
  ArrowLeft, 
  ArrowRight,
  Bug,
  Square,
  List,
  CheckSquare,
  Code,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  getAllowedQuestionTypesForCategory,
  getRestrictedQuestionTypesForCategory,
  validateQuestionTypeCategory
} from '../../../utils/questionBusinessRules';
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

  // Get business rules for this category
  const allowedTypes = getAllowedQuestionTypesForCategory(selectedCategory);
  const restrictedInfo = getRestrictedQuestionTypesForCategory(selectedCategory);

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

  // Get available types (non-restricted)
  const getAvailableQuestionTypes = (): QuestionTypeOption[] => {
    return questionTypeOptions.filter(option => 
      allowedTypes.includes(option.value)
    );
  };

  // Get restricted types with reasons
  const getRestrictedQuestionTypes = (): QuestionTypeOption[] => {
    return questionTypeOptions.filter(option => 
      restrictedInfo.types.includes(option.value)
    );
  };

  const availableTypes = getAvailableQuestionTypes();
  const restrictedTypes = getRestrictedQuestionTypes();

  // Handle type selection with validation
  const handleTypeSelection = (type: QuestionType) => {
    const violations = validateQuestionTypeCategory(type, selectedCategory);
    
    if (violations.some(v => v.severity === 'error')) {
      // Don't allow selection of error-level violations
      console.warn('Cannot select question type due to business rule violations:', violations);
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
      <Row className="g-3 mb-4">
        {availableTypes.map((option) => {
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

      {/* Restricted types warning (if any) */}
      {restrictedTypes.length > 0 && (
        <Alert color="warning" className="mb-4">
          <div className="d-flex">
            <AlertTriangle size={16} className="me-2 mt-1 flex-shrink-0" />
            <div>
              <strong>Not Available for {categoryLabel} Questions</strong>
              <p className="mb-2">{restrictedInfo.reason}</p>
              
              <div className="d-flex flex-wrap gap-2">
                {restrictedTypes.map((option) => {
                  const IconComponent = option.icon;
                  
                  return (
                    <Badge 
                      key={option.value}
                      color="warning" 
                      className="d-flex align-items-center gap-1 p-2"
                      style={{ fontSize: '0.75rem' }}
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
    </div>
  );
};

export default QuestionTypeSelectionStep;