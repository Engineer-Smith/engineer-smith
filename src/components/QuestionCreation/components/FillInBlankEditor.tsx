// src/components/QuestionCreation/components/FillInBlankEditor.tsx - CONTEXT INTEGRATED

import React, { useState, useEffect } from 'react';
import { 
  Card, CardBody, FormGroup, Label, Input, Button, Badge, Alert, 
  Row, Col, UncontrolledTooltip 
} from 'reactstrap';
import { Plus, Trash2, Eye, EyeOff, HelpCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { CreateQuestionData } from '../../../types';
import { 
  validateFillInBlankStructure,
  validateTemplateFormat,
  cleanFillInBlankStructure,
  createProperBlankStructure,
  ensureBlankIds
} from '../../../utils/fillInBlankValidation';

// ✅ NEW: Enhanced props with context validation integration
interface FillInBlankEditorProps {
  questionData: Partial<CreateQuestionData>;
  onInputChange: (field: keyof CreateQuestionData, value: any) => void;
  // ✅ NEW: Context validation props
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  isFieldRequired?: (field: string) => boolean;
  getValidationWarnings?: () => string[];
}

const FillInBlankEditor: React.FC<FillInBlankEditorProps> = ({
  questionData,
  onInputChange,
  // ✅ NEW: Context validation props with defaults
  validation,
  isFieldRequired = () => false,
  getValidationWarnings = () => []
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [templateValidation, setTemplateValidation] = useState<{isValid: boolean, errors: string[], suggestions: string[]} | null>(null);

  // ✅ NEW: Check field requirements using context
  const isTemplateRequired = isFieldRequired('codeTemplate');
  const isBlanksRequired = isFieldRequired('blanks');
  const contextWarnings = getValidationWarnings();

  // ✅ Validate template whenever it changes
  useEffect(() => {
    if (questionData.codeTemplate) {
      const validation = validateTemplateFormat(questionData.codeTemplate);
      setTemplateValidation(validation);
      
      // Auto-adjust blanks based on template
      const templateBlankCount = (questionData.codeTemplate.match(/_____/g) || []).length;
      const currentBlanks = questionData.blanks || [];
      
      if (templateBlankCount !== currentBlanks.length && templateBlankCount > 0) {
        const adjustedBlanks = adjustBlanksToTemplate(currentBlanks, templateBlankCount);
        onInputChange('blanks', adjustedBlanks);
      }
    }
  }, [questionData.codeTemplate]);

  // ✅ Adjust blanks array to match template placeholders
  const adjustBlanksToTemplate = (currentBlanks: any[], templateBlankCount: number): any[] => {
    if (templateBlankCount === currentBlanks.length) return currentBlanks;
    
    if (templateBlankCount > currentBlanks.length) {
      // Add missing blanks
      const newBlanks = [...currentBlanks];
      for (let i = currentBlanks.length; i < templateBlankCount; i++) {
        newBlanks.push(createProperBlankStructure(`blank${i + 1}`, [''], false, '', 1));
      }
      return newBlanks;
    } else {
      // Remove extra blanks
      return currentBlanks.slice(0, templateBlankCount);
    }
  };

  // ✅ Add blank with proper structure
  const addBlank = () => {
    const blanks = [...(questionData.blanks || [])];
    const newBlank = createProperBlankStructure(
      `blank${blanks.length + 1}`,
      [''], // Start with one empty answer
      false,
      '',
      1
    );
    blanks.push(newBlank);
    onInputChange('blanks', blanks);
  };

  // ✅ Remove blank with validation
  const removeBlank = (index: number) => {
    if ((questionData.blanks?.length || 0) <= 1) return;
    const blanks = questionData.blanks?.filter((_, i) => i !== index) || [];
    // Re-index blank IDs to match position
    const reIndexedBlanks = blanks.map((blank, i) => ({
      ...blank,
      id: `blank${i + 1}`
    }));
    onInputChange('blanks', reIndexedBlanks);
  };

  // ✅ Update blank with proper validation
  const updateBlank = (index: number, field: string, value: any) => {
    const blanks = [...(questionData.blanks || [])];
    
    // Ensure the blank has proper structure
    if (!blanks[index].id) {
      blanks[index].id = `blank${index + 1}`;
    }
    
    blanks[index] = { ...blanks[index], [field]: value };
    onInputChange('blanks', blanks);
  };

  // ✅ Answer management with validation
  const addAnswerToBlank = (blankIndex: number) => {
    const blanks = [...(questionData.blanks || [])];
    if (!blanks[blankIndex].correctAnswers) {
      blanks[blankIndex].correctAnswers = [];
    }
    blanks[blankIndex].correctAnswers.push('');
    onInputChange('blanks', blanks);
  };

  const removeAnswerFromBlank = (blankIndex: number, answerIndex: number) => {
    const blanks = [...(questionData.blanks || [])];
    if ((blanks[blankIndex]?.correctAnswers?.length || 0) <= 1) return; // Keep at least one answer
    
    blanks[blankIndex].correctAnswers = blanks[blankIndex].correctAnswers.filter((_, i) => i !== answerIndex);
    onInputChange('blanks', blanks);
  };

  const updateBlankAnswer = (blankIndex: number, answerIndex: number, value: string) => {
    const blanks = [...(questionData.blanks || [])];
    blanks[blankIndex].correctAnswers[answerIndex] = value;
    onInputChange('blanks', blanks);
  };

  // ✅ Get comprehensive validation (combines local + context validation)
  const getValidationStatus = () => {
    const localValidation = validateFillInBlankStructure(questionData);
    
    // ✅ NEW: Merge with context validation
    if (validation) {
      return {
        isValid: localValidation.isValid && validation.isValid,
        errors: [...localValidation.errors, ...validation.errors],
        warnings: [...localValidation.warnings, ...validation.warnings, ...contextWarnings]
      };
    }
    
    return {
      ...localValidation,
      warnings: [...localValidation.warnings, ...contextWarnings]
    };
  };

  const combinedValidation = getValidationStatus();

  // ✅ NEW: Get context-specific validation errors for fields
  const getFieldErrors = (fieldName: string): string[] => {
    if (!validation?.errors) return [];
    return validation.errors.filter(error => 
      error.toLowerCase().includes(fieldName.toLowerCase())
    );
  };

  const templateErrors = getFieldErrors('template');
  const blanksErrors = getFieldErrors('blank');

  return (
    <>
      {/* ✅ NEW: Context Validation Summary */}
      {validation && (!validation.isValid || contextWarnings.length > 0) && (
        <Alert color={validation.isValid ? 'warning' : 'danger'} className="mt-3">
          <div className="d-flex">
            <AlertTriangle size={16} className="me-2 mt-1 flex-shrink-0" />
            <div>
              <strong>
                {validation.isValid ? 'Form Validation Warnings' : 'Form Validation Errors'}
              </strong>
              <ul className="mb-0 mt-1">
                {validation.errors.map((error, index) => (
                  <li key={`context-error-${index}`} className="text-danger">{error}</li>
                ))}
                {contextWarnings.map((warning, index) => (
                  <li key={`context-warning-${index}`} className="text-warning">{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </Alert>
      )}

      {/* ✅ Template Section with Enhanced Validation */}
      <Card className="mt-4">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="mb-0">Code Template</h6>
              {/* ✅ NEW: Show required indicator from context */}
              {isTemplateRequired && (
                <Badge color="warning" className="ms-2 small">
                  Required Field
                </Badge>
              )}
            </div>
            <div className="d-flex gap-2">
              {combinedValidation.isValid && (
                <Badge color="success">
                  <CheckCircle size={12} className="me-1" />
                  Valid Structure
                </Badge>
              )}
              <Button
                size="sm"
                color="secondary"
                outline
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPreview ? 'Hide Preview' : 'Preview'}
              </Button>
            </div>
          </div>

          <FormGroup>
            <Label>
              Template Code 
              {/* ✅ NEW: Dynamic required indicator */}
              {isTemplateRequired && <span className="text-danger">*</span>}
              <HelpCircle size={14} className="ms-1" id="template-help" />
            </Label>
            <UncontrolledTooltip target="template-help">
              Use exactly 5 underscores (_____) to mark blanks that students will fill in. Each _____ represents one blank that needs to be configured below.
            </UncontrolledTooltip>
            <Input
              type="textarea"
              rows={8}
              placeholder={`// Example template:
// Declare a variable that can be reassigned
_____ age = 25;

// Declare a constant
_____ PI = 3.14159;

// Access array element
console.log(colors[_____]);`}
              value={questionData.codeTemplate || ''}
              onChange={(e) => onInputChange('codeTemplate', e.target.value)}
              style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
              className={
                (templateValidation?.isValid === false || templateErrors.length > 0) 
                  ? 'is-invalid' 
                  : ''
              }
            />
            
            {/* ✅ Enhanced Template Validation Feedback */}
            {(templateValidation && !templateValidation.isValid) || templateErrors.length > 0 && (
              <div className="invalid-feedback d-block">
                {templateValidation?.errors.map((error, index) => (
                  <div key={`local-${index}`}>{error}</div>
                ))}
                {templateErrors.map((error, index) => (
                  <div key={`context-${index}`}>{error}</div>
                ))}
              </div>
            )}
            
            {templateValidation?.suggestions && templateValidation.suggestions.length > 0 && (
              <div className="form-text text-warning">
                <AlertTriangle size={12} className="me-1" />
                {templateValidation.suggestions.join(' ')}
              </div>
            )}

            <div className="form-text">
              <strong>Tip:</strong> Each _____ (5 underscores) creates one blank. You'll configure the accepted answers for each blank below.
            </div>
          </FormGroup>

          {/* ✅ Template Preview */}
          {showPreview && questionData.codeTemplate && (
            <Card className="mt-3 border-info">
              <CardBody className="py-3">
                <h6 className="small text-info mb-2">Preview (Student View)</h6>
                <pre 
                  className="bg-light p-3 rounded mb-0 small"
                  style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
                >
                  {questionData.codeTemplate.replace(/_____/g, '[INPUT_FIELD]')}
                </pre>
                <div className="small text-muted mt-2">
                  Students will see input fields where [INPUT_FIELD] is shown.
                </div>
              </CardBody>
            </Card>
          )}
        </CardBody>
      </Card>

      {/* ✅ Enhanced Validation Feedback */}
      {(!combinedValidation.isValid || combinedValidation.warnings.length > 0) && (
        <Alert color={combinedValidation.isValid ? 'warning' : 'danger'} className="mt-3">
          <div className="d-flex">
            <AlertTriangle size={16} className="me-2 mt-1 flex-shrink-0" />
            <div>
              <strong>{combinedValidation.isValid ? 'Validation Warnings' : 'Validation Errors'}</strong>
              <ul className="mb-0 mt-1">
                {combinedValidation.errors.map((error, index) => (
                  <li key={`error-${index}`} className="text-danger">{error}</li>
                ))}
                {combinedValidation.warnings.map((warning, index) => (
                  <li key={`warning-${index}`} className="text-warning">{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </Alert>
      )}

      {/* ✅ Blank Configurations Section with Enhanced Validation */}
      <Card className="mt-4">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="mb-0">Blank Configurations</h6>
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted">Configure each blank (_____ in your template)</small>
                {/* ✅ NEW: Show required indicator from context */}
                {isBlanksRequired && (
                  <Badge color="warning" className="small">
                    Required
                  </Badge>
                )}
              </div>
            </div>
            <Button size="sm" color="primary" outline onClick={addBlank}>
              <Plus size={16} className="me-1" />
              Add Blank
            </Button>
          </div>

          {/* ✅ NEW: Show context validation errors for blanks */}
          {blanksErrors.length > 0 && (
            <Alert color="danger" className="mb-3">
              <AlertTriangle size={16} className="me-1" />
              <strong>Blank Configuration Issues:</strong>
              <ul className="mb-0 mt-1">
                {blanksErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {(!questionData.blanks || questionData.blanks.length === 0) && (
            <Alert color="info" className="small">
              <Info size={16} className="me-1" />
              Add blanks to match the _____ placeholders in your code template above.
              {isBlanksRequired && (
                <div className="mt-1 text-warning">
                  <AlertTriangle size={12} className="me-1" />
                  <strong>This field is required for question completion.</strong>
                </div>
              )}
            </Alert>
          )}

          {questionData.blanks?.map((blank, blankIndex) => (
            <Card key={blank.id || blankIndex} className="mb-3 border">
              <CardBody className="py-3">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <Badge color="primary">Blank {blankIndex + 1}</Badge>
                    <small className="text-muted ms-2">ID: {blank.id}</small>
                    {/* ✅ NEW: Show validation status per blank */}
                    {blank.correctAnswers?.some((a: string) => a.trim()) ? (
                      <Badge color="success" className="ms-2 small">
                        <CheckCircle size={10} className="me-1" />
                        Configured
                      </Badge>
                    ) : (
                      <Badge color="warning" className="ms-2 small">
                        <AlertTriangle size={10} className="me-1" />
                        Needs Setup
                      </Badge>
                    )}
                  </div>
                  {(questionData.blanks?.length || 0) > 1 && (
                    <Button
                      size="sm"
                      color="danger"
                      outline
                      onClick={() => removeBlank(blankIndex)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>

                {/* ✅ Correct Answers - Backend Compliant Structure */}
                <FormGroup>
                  <Label className="small fw-bold">
                    Correct Answers 
                    {/* ✅ NEW: Dynamic required indicator */}
                    {(isBlanksRequired || isFieldRequired(`blanks.${blankIndex}.correctAnswers`)) && (
                      <span className="text-danger">*</span>
                    )}
                    <Badge color="success" className="ms-2">
                      {blank.correctAnswers?.filter((a: string) => a.trim()).length || 0} answer{(blank.correctAnswers?.filter((a: string) => a.trim()).length || 0) !== 1 ? 's' : ''}
                    </Badge>
                  </Label>
                  <div className="small text-muted mb-2">
                    Add all acceptable answers for this blank. Students only need to match one of these answers.
                  </div>
                  
                  {blank.correctAnswers?.map((answer: string, answerIndex: number) => (
                    <div key={answerIndex} className="d-flex gap-2 mb-2">
                      <div className="flex-shrink-0 d-flex align-items-center">
                        <Badge color="outline-secondary" className="small">
                          {answerIndex + 1}
                        </Badge>
                      </div>
                      <Input
                        type="text"
                        placeholder={answerIndex === 0 ? "Primary answer (required)" : "Alternative answer (optional)"}
                        value={answer}
                        onChange={(e) => updateBlankAnswer(blankIndex, answerIndex, e.target.value)}
                        className={!answer.trim() && answerIndex === 0 ? 'is-invalid' : ''}
                      />
                      {blank.correctAnswers && blank.correctAnswers.length > 1 && (
                        <Button
                          size="sm"
                          color="danger"
                          outline
                          onClick={() => removeAnswerFromBlank(blankIndex, answerIndex)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    size="sm"
                    color="success"
                    outline
                    onClick={() => addAnswerToBlank(blankIndex)}
                    className="mt-1"
                  >
                    <Plus size={14} className="me-1" />
                    Add Alternative Answer
                  </Button>
                </FormGroup>

                {/* ✅ Optional Configuration Fields */}
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label className="small">
                        Points
                        <HelpCircle size={12} className="ms-1" id={`points-help-${blankIndex}`} />
                      </Label>
                      <UncontrolledTooltip target={`points-help-${blankIndex}`}>
                        Points awarded when student answers this blank correctly
                      </UncontrolledTooltip>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={blank.points || 1}
                        onChange={(e) => updateBlank(blankIndex, 'points', parseInt(e.target.value) || 1)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <div className="d-flex align-items-center">
                        <Input
                          type="checkbox"
                          checked={blank.caseSensitive || false}
                          onChange={(e) => updateBlank(blankIndex, 'caseSensitive', e.target.checked)}
                          className="me-2"
                        />
                        <Label className="small mb-0">
                          Case Sensitive
                          <HelpCircle size={12} className="ms-1" id={`case-help-${blankIndex}`} />
                        </Label>
                        <UncontrolledTooltip target={`case-help-${blankIndex}`}>
                          When enabled: "Let" ≠ "let"<br/>
                          When disabled: "Let" = "let"
                        </UncontrolledTooltip>
                      </div>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label className="small">
                        Hint (optional)
                        <HelpCircle size={12} className="ms-1" id={`hint-help-${blankIndex}`} />
                      </Label>
                      <UncontrolledTooltip target={`hint-help-${blankIndex}`}>
                        Helpful hint shown to students when they're stuck
                      </UncontrolledTooltip>
                      <Input
                        type="text"
                        placeholder="e.g., Think about variable keywords"
                        value={blank.hint || ''}
                        onChange={(e) => updateBlank(blankIndex, 'hint', e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {/* ✅ Individual Blank Validation */}
                {(!blank.correctAnswers || blank.correctAnswers.filter((a: string) => a.trim()).length === 0) && (
                  <Alert color="danger" className="small mt-2 mb-0">
                    <AlertTriangle size={14} className="me-1" />
                    This blank needs at least one correct answer
                    {isBlanksRequired && (
                      <div className="mt-1">
                        <strong>Required:</strong> Complete this blank to proceed.
                      </div>
                    )}
                  </Alert>
                )}
              </CardBody>
            </Card>
          ))}

          {/* ✅ Enhanced Summary Card */}
          {questionData.blanks && questionData.blanks.length > 0 && (
            <Card className="mt-3 bg-light border-0">
              <CardBody className="py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <small className="fw-bold text-muted">Summary:</small>
                    <div className="small text-muted">
                      {questionData.blanks.length} blank{questionData.blanks.length !== 1 ? 's' : ''} • {' '}
                      {questionData.blanks.reduce((sum, blank) => sum + (blank.points || 1), 0)} total points
                    </div>
                    {/* ✅ NEW: Context validation status */}
                    {validation && (
                      <div className="small mt-1">
                        Context Status: 
                        <Badge color={validation.isValid ? 'success' : 'danger'} className="ms-1 small">
                          {validation.isValid ? 'Valid' : 'Issues Found'}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="text-end">
                    <Badge color={combinedValidation.isValid ? 'success' : 'warning'}>
                      {questionData.blanks.filter((b: any) => b.correctAnswers?.some((a: string) => a.trim())).length}/{questionData.blanks.length} configured
                    </Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default FillInBlankEditor;