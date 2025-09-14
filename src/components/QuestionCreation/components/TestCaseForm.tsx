// src/components/QuestionCreation/components/TestCaseForm.tsx - Fixed for backend compatibility
import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  UncontrolledTooltip,
  Alert,
  Spinner,
  Badge,
  ButtonGroup
} from 'reactstrap';
import { Zap, Code, AlertTriangle, Layers, CheckCircle } from 'lucide-react';
import type { TestCase, Language } from '../../../types';
import { TestCaseBuilder } from '../../../utils/testCasesStructure';
import { validateCreateQuestionData } from '../../../services/questionValidationService';

// Updated interface to match backend schema
interface TestCaseFormData {
  name: string;
  args: string;
  expected: string;
  hidden: boolean;
  // Removed: description, points (not in backend schema)
}

interface TestCaseFormProps {
  editingIndex: number | null;
  formData: TestCaseFormData;
  onFormChange: (field: keyof TestCaseFormData, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onGenerateSamples: () => void;
  onGeneratePrompt: () => void;
  validationErrors: string[];
  canGenerateSamples: boolean;
  isGeneratingPrompt: boolean;
  onGenerateTemplates?: () => void;
  canGenerateTemplates?: boolean;
  selectedLanguage?: Language;
  selectedCategory?: string;
  codeConfig?: any;
}

const TestCaseForm: React.FC<TestCaseFormProps> = ({
  editingIndex,
  formData,
  onFormChange,
  onSave,
  onCancel,
  onGenerateSamples,
  onGeneratePrompt,
  validationErrors: externalValidationErrors,
  canGenerateSamples,
  isGeneratingPrompt,
  onGenerateTemplates,
  canGenerateTemplates = false,
  selectedLanguage,
  selectedCategory = 'logic',
  codeConfig
}) => {
  const [localValidationErrors, setLocalValidationErrors] = useState<string[]>([]);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  // Create a test case object for validation (backend compatible)
  const currentTestCase = useMemo((): TestCase | null => {
    if (!formData.name && !formData.args && !formData.expected) {
      return null;
    }

    try {
      let parsedArgs = [];
      if (formData.args.trim()) {
        const parsed = JSON.parse(formData.args);
        parsedArgs = Array.isArray(parsed) ? parsed : [parsed];
      }

      let parsedExpected;
      if (formData.expected.trim()) {
        try {
          parsedExpected = JSON.parse(formData.expected);
        } catch {
          parsedExpected = formData.expected;
        }
      }

      // Return backend-compatible TestCase
      return {
        name: formData.name,
        args: parsedArgs,
        expected: parsedExpected,
        hidden: formData.hidden
        // Removed: id, description, points
      };
    } catch (error) {
      return null;
    }
  }, [formData]);

  // Validation function
  const validateFormData = (): string[] => {
    const errors: string[] = [];

    // Basic required field validation
    if (!formData.name.trim()) {
      errors.push('Test case name is required');
    }

    if (!formData.expected.trim()) {
      errors.push('Expected result is required');
    }

    // JSON validation for arguments
    if (formData.args.trim()) {
      try {
        const parsed = JSON.parse(formData.args);
        JSON.stringify(parsed);
      } catch (e) {
        errors.push('Arguments must be valid JSON (e.g., [1, 2, 3], "hello", or 42)');
      }
    }

    // Use TestCaseBuilder for advanced validation
    if (currentTestCase && selectedLanguage) {
      const testCaseValidation = TestCaseBuilder.validateTestCase(
        currentTestCase,
        0,
        selectedLanguage,
        codeConfig?.entryFunction
      );

      if (!testCaseValidation.isValid) {
        errors.push(...testCaseValidation.errors);
      }

      if (testCaseValidation.warnings.length > 0) {
        testCaseValidation.warnings.forEach(warning => {
          errors.push(`Warning: ${warning}`);
        });
      }
    }

    // Mock question data for comprehensive validation
    if (currentTestCase) {
      const mockQuestionData = {
        title: 'Test Question',
        description: 'Test Description',
        type: 'codeChallenge' as const,
        language: selectedLanguage || 'javascript' as const,
        category: selectedCategory as any,
        difficulty: 'medium' as const,
        testCases: [currentTestCase],
        codeConfig: codeConfig || {
          entryFunction: 'solution',
          runtime: 'node',
          timeoutMs: 3000
        }
      };

      const validationResult = validateCreateQuestionData(mockQuestionData);
      const testCaseErrors = validationResult.errors
        .filter(error => error.field.startsWith('testCases'))
        .map(error => error.message);

      errors.push(...testCaseErrors);
    }

    return errors;
  };

  // Real-time validation
  useEffect(() => {
    if (hasAttemptedSave || (formData.name.trim() && formData.expected.trim())) {
      setValidationState('validating');
      const errors = validateFormData();
      setLocalValidationErrors(errors);
      setValidationState(errors.length === 0 ? 'valid' : 'invalid');
    } else {
      setValidationState('idle');
      setLocalValidationErrors([]);
    }
  }, [formData, currentTestCase, selectedLanguage, hasAttemptedSave]);

  const handleSave = () => {
    setHasAttemptedSave(true);
    const formErrors = validateFormData();

    const actualErrors = formErrors.filter(error => !error.startsWith('Warning:'));

    if (actualErrors.length > 0) {
      setLocalValidationErrors(formErrors);
      setValidationState('invalid');
      return;
    }

    setLocalValidationErrors([]);
    setValidationState('valid');
    onSave();
    setHasAttemptedSave(false);
    setValidationState('idle');
  };

  const handleFormChange = (field: keyof TestCaseFormData, value: any) => {
    onFormChange(field, value);

    if (localValidationErrors.length > 0) {
      setValidationState('idle');
      setLocalValidationErrors([]);
    }
  };

  const errorsToShow = localValidationErrors.length > 0 ? localValidationErrors : [];
  const hasGenerationOptions = canGenerateSamples || canGenerateTemplates;

  const warnings = errorsToShow.filter(error => error.startsWith('Warning:'));
  const actualErrors = errorsToShow.filter(error => !error.startsWith('Warning:'));

  const getValidationIcon = () => {
    switch (validationState) {
      case 'validating':
        return <Spinner size="sm" />;
      case 'valid':
        return <CheckCircle size={16} className="text-success" />;
      case 'invalid':
        return <AlertTriangle size={16} className="text-danger" />;
      default:
        return null;
    }
  };

  return (
    <Card className="mb-4">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <h6 className="mb-0">
              {editingIndex !== null ? 'Edit Test Case' : 'Add Test Case'}
            </h6>
            {getValidationIcon()}
          </div>
          <div className="d-flex gap-2">
            {hasGenerationOptions && (
              <ButtonGroup size="sm">
                {canGenerateSamples && (
                  <Button
                    color="info"
                    outline
                    onClick={onGenerateSamples}
                    title="Generate sample test cases automatically"
                  >
                    <Zap size={14} className="me-1" />
                    Samples
                  </Button>
                )}
                {canGenerateTemplates && onGenerateTemplates && (
                  <Button
                    color="success"
                    outline
                    onClick={onGenerateTemplates}
                    title="Generate test cases from language templates"
                  >
                    <Layers size={14} className="me-1" />
                    Templates
                  </Button>
                )}
              </ButtonGroup>
            )}
            <Button
              size="sm"
              color="secondary"
              outline
              onClick={onGeneratePrompt}
              disabled={isGeneratingPrompt}
            >
              {isGeneratingPrompt ? (
                <Spinner size="sm" className="me-1" />
              ) : (
                <Code size={14} className="me-1" />
              )}
              AI Assist
            </Button>
          </div>
        </div>

        {hasGenerationOptions && (
          <Alert color="light" className="mb-3 small">
            <div className="d-flex align-items-center">
              <div className="me-2">💡</div>
              <div>
                <strong>Need help getting started?</strong> Use the generation buttons above to create test cases automatically:
                <ul className="mb-0 mt-1">
                  {canGenerateSamples && <li><strong>Samples:</strong> Basic test cases based on your function configuration</li>}
                  {canGenerateTemplates && <li><strong>Templates:</strong> Language-specific test patterns</li>}
                  <li><strong>AI Assist:</strong> Generate intelligent test cases using AI</li>
                </ul>
              </div>
            </div>
          </Alert>
        )}

        {/* Show actual errors */}
        {actualErrors.length > 0 && (
          <Alert color="danger" className="mb-3">
            <AlertTriangle size={16} className="me-2" />
            <strong>Please fix the following issues:</strong>
            <ul className="mb-0 mt-2">
              {actualErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Show warnings separately */}
        {warnings.length > 0 && (
          <Alert color="warning" className="mb-3">
            <AlertTriangle size={16} className="me-2" />
            <strong>Suggestions:</strong>
            <ul className="mb-0 mt-2">
              {warnings.map((warning, index) => (
                <li key={index}>{warning.replace('Warning: ', '')}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Form>
          <FormGroup>
            <Label>
              Test Case Name <span className="text-danger">*</span>
            </Label>
            <Input
              type="text"
              placeholder="e.g., Basic functionality test"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              className={validationState === 'invalid' && !formData.name.trim() ? 'is-invalid' : ''}
            />
            <small className="text-muted">
              Give your test case a descriptive name that explains what it validates
            </small>
          </FormGroup>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Function Arguments <span className="text-danger">*</span>
                  <Badge color="info" pill className="ms-1" id="args-help">?</Badge>
                </Label>
                <UncontrolledTooltip target="args-help">
                  <div>
                    <strong>Enter the arguments to pass to your function:</strong>
                    <br />• Single argument: <code>5</code> → <code>myFunction(5)</code>
                    <br />• Array argument: <code>[1, 2, 3]</code> → <code>myFunction([1, 2, 3])</code>
                    <br />• String argument: <code>"hello"</code> → <code>myFunction("hello")</code>
                    <br />• Multiple arguments: <code>[5, 3]</code> → <code>myFunction(5, 3)</code>
                    <br />• Object argument: <code>{`{"name": "test"}`}</code>
                  </div>
                </UncontrolledTooltip>
                <Input
                  type="textarea"
                  rows={3}
                  placeholder='[1, 2, 3, 4] or "hello" or 42'
                  value={formData.args}
                  onChange={(e) => handleFormChange('args', e.target.value)}
                  style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
                  className={validationState === 'invalid' && actualErrors.some(e => e.includes('JSON')) ? 'is-invalid' : ''}
                />
                <small className="text-muted">
                  Use valid JSON format. For single values, just enter the value directly.
                </small>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Expected Result <span className="text-danger">*</span>
                  <Badge color="info" pill className="ms-1" id="expected-help">?</Badge>
                </Label>
                <UncontrolledTooltip target="expected-help">
                  <div>
                    <strong>The expected return value from your function:</strong>
                    <br />• Number: <code>42</code>
                    <br />• String: <code>"result"</code>
                    <br />• Boolean: <code>true</code> or <code>false</code>
                    <br />• Array: <code>[1, 2, 3]</code>
                    <br />• Object: <code>{`{"success": true}`}</code>
                  </div>
                </UncontrolledTooltip>
                <Input
                  type="textarea"
                  rows={3}
                  placeholder='4 or "hello world" or true'
                  value={formData.expected}
                  onChange={(e) => handleFormChange('expected', e.target.value)}
                  style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
                  className={validationState === 'invalid' && !formData.expected.trim() ? 'is-invalid' : ''}
                />
                <small className="text-muted">
                  Enter the exact value your function should return for the given arguments.
                </small>
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="hidden-checkbox"
                checked={formData.hidden}
                onChange={(e) => handleFormChange('hidden', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="hidden-checkbox">
                Hidden from students
                <Badge color="info" pill className="ms-1" id="hidden-help">?</Badge>
              </label>
              <UncontrolledTooltip target="hidden-help">
                <div>
                  <strong>Hidden test cases:</strong>
                  <br />• Used for final validation but not shown to students
                  <br />• Great for edge cases and security testing
                  <br />• Students see "Test passed" but not the details
                  <br />• At least one test case should be visible for guidance
                </div>
              </UncontrolledTooltip>
            </div>
          </FormGroup>

          <div className="d-flex gap-2">
            <Button
              color="primary"
              onClick={handleSave}
              disabled={validationState === 'validating'}
            >
              {validationState === 'validating' && <Spinner size="sm" className="me-1" />}
              {editingIndex !== null ? 'Update Test Case' : 'Add Test Case'}
            </Button>
            {editingIndex !== null && (
              <Button
                color="secondary"
                outline
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default TestCaseForm;