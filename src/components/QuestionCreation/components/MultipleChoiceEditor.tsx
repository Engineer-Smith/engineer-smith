// src/components/QuestionCreation/components/MultipleChoiceEditor.tsx - CONTEXT INTEGRATED

import { AlertTriangle, CheckCircle, Info, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { Alert, Badge, Button, Card, CardBody, Input, Label } from 'reactstrap';
import type { CreateQuestionData } from '../../../types';

// ✅ NEW: Enhanced props with context validation integration
interface MultipleChoiceEditorProps {
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

const MultipleChoiceEditor: React.FC<MultipleChoiceEditorProps> = ({
  questionData,
  onInputChange,
  // ✅ NEW: Context validation props with defaults
  validation,
  isFieldRequired = () => false,
  getValidationWarnings = () => []
}) => {
  // ✅ NEW: Check field requirements using context
  const isOptionsRequired = isFieldRequired('options');
  const isCorrectAnswerRequired = isFieldRequired('correctAnswer');
  const contextWarnings = getValidationWarnings();

  // ✅ NEW: Get context-specific validation errors for fields
  const getFieldErrors = (fieldName: string): string[] => {
    if (!validation?.errors) return [];
    return validation.errors.filter(error => 
      error.toLowerCase().includes(fieldName.toLowerCase())
    );
  };

  const optionsErrors = getFieldErrors('option');
  const correctAnswerErrors = getFieldErrors('correct') || getFieldErrors('answer');

  // ✅ NEW: Validate current state
  const hasValidOptions = questionData.options && questionData.options.length >= 2 && 
                         questionData.options.every(opt => opt.trim().length > 0);
  const hasCorrectAnswer = typeof questionData.correctAnswer === 'number';
  const isFormValid = hasValidOptions && hasCorrectAnswer;

  const addOption = () => {
    const options = [...(questionData.options || []), ''];
    onInputChange('options', options);
  };

  const updateOption = (index: number, value: string) => {
    const options = [...(questionData.options || [])];
    options[index] = value;
    onInputChange('options', options);
  };

  const removeOption = (index: number) => {
    if ((questionData.options?.length || 0) <= 2) return;
    const options = questionData.options?.filter((_, i) => i !== index) || [];
    onInputChange('options', options);
    
    if (questionData.correctAnswer === index) {
      onInputChange('correctAnswer', undefined);
    } else if (typeof questionData.correctAnswer === 'number' && questionData.correctAnswer > index) {
      onInputChange('correctAnswer', questionData.correctAnswer - 1);
    }
  };

  // ✅ NEW: Check if option is empty
  const isOptionEmpty = (option: string): boolean => {
    return !option || option.trim().length === 0;
  };

  // ✅ NEW: Get validation status for visual indicators
  const getValidationStatus = (): 'valid' | 'invalid' | 'warning' => {
    if (validation && !validation.isValid) return 'invalid';
    if (!isFormValid) return 'warning';
    return 'valid';
  };

  const validationStatus = getValidationStatus();

  return (
    <>
      {/* ✅ NEW: Context Validation Summary */}
      {validation && (!validation.isValid || contextWarnings.length > 0) && (
        <Alert color={validation.isValid ? 'warning' : 'danger'} className="mt-3">
          <div className="d-flex">
            <AlertTriangle size={16} className="me-2 mt-1 flex-shrink-0" />
            <div>
              <strong>
                {validation.isValid ? 'Multiple Choice Warnings' : 'Multiple Choice Validation Errors'}
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
              <h6 className="mb-0">Answer Options</h6>
              {/* ✅ NEW: Required field indicators */}
              {isOptionsRequired && (
                <Badge color="info" className="small">Required</Badge>
              )}
              {/* ✅ NEW: Validation status indicator */}
              {validationStatus === 'valid' && (
                <Badge color="success" className="small">
                  <CheckCircle size={10} className="me-1" />
                  Valid
                </Badge>
              )}
              {validationStatus === 'warning' && (
                <Badge color="warning" className="small">
                  <AlertTriangle size={10} className="me-1" />
                  Incomplete
                </Badge>
              )}
              {validationStatus === 'invalid' && (
                <Badge color="danger" className="small">
                  <AlertTriangle size={10} className="me-1" />
                  Issues Found
                </Badge>
              )}
            </div>
            <Button size="sm" color="primary" outline onClick={addOption}>
              <Plus size={16} className="me-1" />
              Add Option
            </Button>
          </div>

          {/* ✅ NEW: Field-specific validation errors */}
          {optionsErrors.length > 0 && (
            <Alert color="danger" className="mb-3">
              <AlertTriangle size={16} className="me-1" />
              <strong>Options Issues:</strong>
              <ul className="mb-0 mt-1">
                {optionsErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* ✅ NEW: Requirement guidance */}
          {(!questionData.options || questionData.options.length === 0) && (
            <Alert color="info" className="mb-3">
              <Info size={16} className="me-1" />
              <strong>Getting Started:</strong> Add at least 2 answer options for your multiple choice question.
              {isOptionsRequired && (
                <div className="mt-1 text-warning">
                  <AlertTriangle size={12} className="me-1" />
                  Answer options are required for this question type.
                </div>
              )}
            </Alert>
          )}

          {/* ✅ Enhanced Options List */}
          {questionData.options?.map((option, index) => (
            <div key={index} className="mb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="correctAnswer"
                    checked={questionData.correctAnswer === index}
                    onChange={() => onInputChange('correctAnswer', index)}
                  />
                  <label className="form-check-label fw-bold">
                    {String.fromCharCode(65 + index)}
                  </label>
                </div>
                
                <Input
                  type="text"
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className={`flex-grow-1 ${isOptionEmpty(option) ? 'border-warning' : ''}`}
                />
                
                {/* ✅ NEW: Option status indicators */}
                <div className="d-flex align-items-center gap-1">
                  {questionData.correctAnswer === index && (
                    <Badge color="success" className="small">
                      <CheckCircle size={10} className="me-1" />
                      Correct
                    </Badge>
                  )}
                  {isOptionEmpty(option) && (
                    <Badge color="warning" className="small">
                      <AlertTriangle size={10} className="me-1" />
                      Empty
                    </Badge>
                  )}
                  
                  {(questionData.options?.length || 0) > 2 && (
                    <Button
                      size="sm"
                      color="danger"
                      outline
                      onClick={() => removeOption(index)}
                      title="Remove this option"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* ✅ NEW: Individual option validation */}
              {isOptionEmpty(option) && (
                <div className="small text-warning mt-1 ms-4">
                  <AlertTriangle size={12} className="me-1" />
                  This option needs text content
                </div>
              )}
            </div>
          ))}

          {/* ✅ Enhanced Correct Answer Validation */}
          {questionData.options && questionData.options.length >= 2 && (
            <div className="mt-3 pt-3 border-top">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Label className="mb-0 fw-bold">
                  Correct Answer Selection
                  {/* ✅ NEW: Dynamic required indicator */}
                  {isCorrectAnswerRequired && <span className="text-danger">*</span>}
                </Label>
                <div className="d-flex gap-1">
                  {hasCorrectAnswer ? (
                    <Badge color="success">
                      <CheckCircle size={10} className="me-1" />
                      Answer: {String.fromCharCode(65 + (questionData.correctAnswer as number))}
                    </Badge>
                  ) : (
                    <Badge color="warning">
                      <AlertTriangle size={10} className="me-1" />
                      Not Selected
                    </Badge>
                  )}
                </div>
              </div>

              {/* ✅ NEW: Correct answer validation errors */}
              {correctAnswerErrors.length > 0 && (
                <Alert color="danger" className="small mb-2">
                  <AlertTriangle size={16} className="me-1" />
                  <strong>Correct Answer Issues:</strong>
                  <ul className="mb-0 mt-1">
                    {correctAnswerErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {!hasCorrectAnswer && (
                <Alert color="warning" className="small mb-0">
                  <AlertTriangle size={16} className="me-1" />
                  Please select the correct answer by clicking a radio button next to the right option.
                  {isCorrectAnswerRequired && (
                    <div className="mt-1">
                      <strong>Required:</strong> You must select a correct answer to proceed.
                    </div>
                  )}
                </Alert>
              )}
            </div>
          )}

          {/* ✅ NEW: Progress Summary */}
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex justify-content-between align-items-center">
              <div className="small text-muted">
                <strong>Progress:</strong> {questionData.options?.length || 0} options, 
                {hasCorrectAnswer ? ' correct answer selected' : ' no correct answer'}
              </div>
              <div className="d-flex gap-2">
                <Badge color={hasValidOptions ? 'success' : 'secondary'}>
                  Options: {hasValidOptions ? 'Complete' : 'Incomplete'}
                </Badge>
                <Badge color={hasCorrectAnswer ? 'success' : 'secondary'}>
                  Answer: {hasCorrectAnswer ? 'Selected' : 'Not Set'}
                </Badge>
                {/* ✅ NEW: Context validation status */}
                {validation && (
                  <Badge color={validation.isValid ? 'success' : 'danger'}>
                    Validation: {validation.isValid ? 'Passed' : 'Failed'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* ✅ NEW: Best Practices Guidance */}
          <Alert color="light" className="mt-3 small">
            <Info size={14} className="me-2" />
            <strong>Best Practices:</strong>
            <ul className="mb-0 mt-1">
              <li>Use 3-4 options for optimal difficulty (currently: {questionData.options?.length || 0})</li>
              <li>Make incorrect options plausible but clearly wrong</li>
              <li>Keep option length similar to avoid giving hints</li>
              <li>Avoid "all of the above" or "none of the above" unless necessary</li>
            </ul>
          </Alert>
        </CardBody>
      </Card>
    </>
  );
};

export default MultipleChoiceEditor;