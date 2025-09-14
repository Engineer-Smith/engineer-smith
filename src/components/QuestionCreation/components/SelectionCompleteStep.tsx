// src/components/QuestionCreation/components/SelectionCompleteStep.tsx
import React from 'react';
import { Badge, Button, Alert } from 'reactstrap';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Language, QuestionCategory, QuestionType } from '../../../types';

interface SelectionCompleteStepProps {
  selectedLanguage: Language;
  languageLabel: string;
  selectedCategory: QuestionCategory;
  categoryLabel: string;
  selectedQuestionType: QuestionType;
  questionTypeLabel: string;
  onResetToQuestionType: () => void;
}

const SelectionCompleteStep: React.FC<SelectionCompleteStepProps> = ({
  selectedLanguage,
  languageLabel,
  selectedCategory,
  categoryLabel,
  selectedQuestionType,
  questionTypeLabel,
  onResetToQuestionType
}) => {

  return (
    <>
      <div className="text-center mb-4">
        <div className="d-flex align-items-center justify-content-center mb-3">
          <Badge color="primary" className="me-2 px-3 py-2">
            <CheckCircle size={14} className="me-1" />
            {languageLabel}
          </Badge>
          <ArrowRight size={14} className="text-muted mx-2" />
          <Badge color="success" className="me-2 px-3 py-2">
            <CheckCircle size={14} className="me-1" />
            {categoryLabel}
          </Badge>
          <ArrowRight size={14} className="text-muted mx-2" />
          <Badge color="warning" className="me-2 px-3 py-2">
            <CheckCircle size={14} className="me-1" />
            {questionTypeLabel}
          </Badge>
        </div>
        
        <Button 
          size="sm" 
          color="link" 
          className="text-muted"
          onClick={() => {
            onResetToQuestionType();
          }}
        >
          <ArrowLeft size={14} className="me-1" />
          Make Changes
        </Button>
      </div>

      <Alert color="success" className="mb-0">
        <CheckCircle size={16} className="me-2" />
        <strong>Configuration Complete!</strong> Ready to create your question content.
      </Alert>
    </>
  );
};

export default SelectionCompleteStep;