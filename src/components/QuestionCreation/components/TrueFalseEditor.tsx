// src/components/QuestionCreation/components/TrueFalseEditor.tsx - CONTEXT INTEGRATED

import React from 'react';
import { Card, CardBody, Alert, Badge } from 'reactstrap';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { CreateQuestionData } from '../../../types';

// ✅ NEW: Enhanced props with context validation integration
interface TrueFalseEditorProps {
  questionData: Partial<CreateQuestionData>;
  onInputChange: (field: keyof CreateQuestionData, value: any) => void;
  // ✅ NEW: Context validation props
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    hasErrors: boolean;
    hasWarnings: boolean;
  };
  isFieldRequired?: (field: string) => boolean;
  getValidationWarnings?: () => string[];
}

const TrueFalseEditor: React.FC<TrueFalseEditorProps> = ({
  questionData,
  onInputChange,
  // ✅ NEW: Context validation props with defaults
  validation,
  isFieldRequired = () => false,
  getValidationWarnings = () => []
}) => {
  // ✅ NEW: Check field requirements using context
  const isCorrectAnswerRequired = isFieldRequired('correctAnswer');
  const contextWarnings = getValidationWarnings();

  // ✅ NEW: Get context-specific validation errors
  const getFieldErrors = (fieldName: string): string[] => {
    if (!validation?.errors) return [];
    return validation.errors.filter(error => 
      error.toLowerCase().includes(fieldName.toLowerCase())
    );
  };

  const correctAnswerErrors = getFieldErrors('correct') || getFieldErrors('answer');

  // ✅ NEW: Check current validation state
  const hasCorrectAnswer = (questionData.correctAnswer === 0 || questionData.correctAnswer === 1);
  const needsSelection = questionData.title && questionData.description && !hasCorrectAnswer;

  return (
    <>
      {/* ✅ NEW: Context Validation Summary */}
      {validation && (!validation.isValid || contextWarnings.length > 0) && (
        <Alert color={validation.isValid ? 'warning' : 'danger'} className="mt-3">
          <div className="d-flex">
            <AlertTriangle size={16} className="me-2 mt-1 flex-shrink-0" />
            <div>
              <strong>
                {validation.isValid ? 'True/False Warnings' : 'True/False Validation Errors'}
              </strong>
              {validation.errors.length > 0 && (
                <ul className="mb-1 mt-1">
                  {validation.errors.map((error, index) => (
                    <li key={`error-${index}`} className="text-danger">{error}</li>
                  ))}
                </ul>
              )}
              {contextWarnings.length > 0 && (
                <ul className="mb-0 mt-1">
                  {contextWarnings.map((warning, index) => (
                    <li key={`warning-${index}`} className="text-warning">{warning}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Alert>
      )}

      <Card className="mt-4">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <h6 className="mb-0">Correct Answer</h6>
              {/* ✅ NEW: Required field indicator */}
              {isCorrectAnswerRequired && (
                <Badge color="info" className="small">Required</Badge>
              )}
              {/* ✅ NEW: Selection status indicator */}
              {(questionData.correctAnswer === 0 || questionData.correctAnswer === 1) ? (
                <Badge color="success" className="small">
                  <CheckCircle size={10} className="me-1" />
                  Selected: {questionData.correctAnswer === 0 ? 'True' : 'False'}
                </Badge>
              ) : (
                <Badge color="warning" className="small">
                  <AlertTriangle size={10} className="me-1" />
                  Not Selected
                </Badge>
              )}
            </div>
          </div>

          {/* ✅ NEW: Field-specific validation errors */}
          {correctAnswerErrors.length > 0 && (
            <Alert color="danger" className="mb-3">
              <AlertTriangle size={16} className="me-1" />
              <strong>Answer Selection Issues:</strong>
              <ul className="mb-0 mt-1">
                {correctAnswerErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* ✅ NEW: Guidance for incomplete questions */}
          {!questionData.title && !questionData.description && (
            <Alert color="info" className="mb-3">
              <Info size={16} className="me-1" />
              <strong>Getting Started:</strong> Complete the question title and description above, then select the correct answer below.
            </Alert>
          )}

          <div className="d-flex gap-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="trueFalse"
                id="true-option"
                checked={questionData.correctAnswer === 0}
                onChange={() => onInputChange('correctAnswer', 0)}
              />
              <label className="form-check-label fw-bold text-success" htmlFor="true-option">
                True
              </label>
              {questionData.correctAnswer === 0 && (
                <CheckCircle size={16} className="ms-2 text-success" />
              )}
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="trueFalse"
                id="false-option"
                checked={questionData.correctAnswer === 1}
                onChange={() => onInputChange('correctAnswer', 1)}
              />
              <label className="form-check-label fw-bold text-danger" htmlFor="false-option">
                False
              </label>
              {questionData.correctAnswer === 1 && (
                <CheckCircle size={16} className="ms-2 text-success" />
              )}
            </div>
          </div>
          
          {/* ✅ Enhanced validation message */}
          {needsSelection && (
            <Alert color="warning" className="small mt-3">
              <AlertTriangle size={16} className="me-1" />
              Please select True or False as the correct answer.
              {isCorrectAnswerRequired && (
                <div className="mt-1">
                  <strong>Required:</strong> You must select an answer to proceed.
                </div>
              )}
            </Alert>
          )}

          {/* ✅ Enhanced completion status */}
          {hasCorrectAnswer && (
            <Alert color="success" className="small mt-3 mb-0">
              <CheckCircle size={16} className="me-1" />
              Correct answer selected: <strong>{questionData.correctAnswer === 0 ? 'True' : 'False'}</strong>
            </Alert>
          )}

          {/* ✅ NEW: Best practices tip */}
          <Alert color="light" className="small mt-3 mb-0">
            <Info size={14} className="me-2" />
            <strong>Tip:</strong> Make sure your question statement is clear and unambiguous so students can definitively determine if it's true or false.
          </Alert>
        </CardBody>
      </Card>
    </>
  );
};

export default TrueFalseEditor;