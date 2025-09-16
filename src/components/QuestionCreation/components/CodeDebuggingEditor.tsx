// src/components/QuestionCreation/components/CodeDebuggingEditor.tsx - Fixed with Auto Runtime
import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Input, Alert, Row, Col, Button, Collapse } from 'reactstrap';
import { Bug, Shield, Info, AlertTriangle, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import SafeMonacoEditor from '../../SafeMonacoEditor';
import type { CreateQuestionData } from '../../../types';

interface CodeDebuggingEditorProps {
  questionData: Partial<CreateQuestionData>;
  onInputChange: (field: keyof CreateQuestionData, value: any) => void;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  isFieldRequired?: (field: string) => boolean;
  availableRuntimes?: Array<{
    id: string;
    name: string;
    description: string;
    language: string;
    defaultTimeout: number;
  }>;
  functionSignatures?: Array<{
    name: string;
    description: string;
    example?: string;
  }>;
  securityRecommendations?: string[];
  selectedLanguage: string;
  selectedCategory: string;
}

const CodeDebuggingEditor: React.FC<CodeDebuggingEditorProps> = ({
  questionData,
  onInputChange,
  validation,
  isFieldRequired = () => false,
  functionSignatures = [],
  securityRecommendations = [],
  selectedLanguage,
  selectedCategory
}) => {
  const requiresTestCases = selectedCategory === 'logic';
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-determine runtime based on selected language
  const getAutoRuntime = (language: string): string => {
    const languageRuntimeMap: Record<string, string> = {
      'javascript': 'node',
      'typescript': 'node',
      'react': 'node',
      'reactNative': 'node',
      'express': 'node',
      'python': 'python',
      'sql': 'sql',
      'dart': 'dart',
      'flutter': 'dart'
    };
    
    return languageRuntimeMap[language] || 'node';
  };

  // Get recommended timeout based on language
  const getRecommendedTimeout = (language: string): number => {
    const timeouts: Record<string, number> = {
      'javascript': 3000,
      'typescript': 3500,
      'react': 3000,
      'reactNative': 4000,
      'express': 5000,
      'python': 3000,
      'sql': 2000,
      'dart': 3000,
      'flutter': 4000
    };
    
    return timeouts[language] || 3000;
  };

  // Auto-set runtime and timeout when language changes
  useEffect(() => {
    if (selectedLanguage && requiresTestCases) {
      const autoRuntime = getAutoRuntime(selectedLanguage);
      const recommendedTimeout = getRecommendedTimeout(selectedLanguage);
      
      // Only update if not already set or different
      const currentConfig = questionData.codeConfig;
      const needsRuntimeUpdate = !currentConfig?.runtime || currentConfig.runtime !== autoRuntime;
      const needsTimeoutUpdate = !currentConfig?.timeoutMs || currentConfig.timeoutMs === 3000; // Update if default
      
      if (needsRuntimeUpdate || needsTimeoutUpdate) {
        onInputChange('codeConfig', {
          ...currentConfig,
          ...(needsRuntimeUpdate && { runtime: autoRuntime }),
          ...(needsTimeoutUpdate && { timeoutMs: recommendedTimeout })
        });
      }
    }
  }, [selectedLanguage, requiresTestCases]);
  
  const handleCodeConfigChange = (field: string, value: any) => {
    onInputChange('codeConfig', {
      ...questionData.codeConfig,
      [field]: value
    });
  };

  const getLanguageForMonaco = (language: string): string => {
    const mapping: Record<string, string> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'csharp': 'csharp',
      'cpp': 'cpp',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'dart': 'dart'
    };
    return mapping[language] || 'javascript';
  };

  // Get display name for runtime
  const getRuntimeDisplayName = (runtimeId: string, language: string): string => {
    const displayNames: Record<string, string> = {
      'node': 'Node.js',
      'python': 'Python',
      'sql': 'SQL Engine',
      'dart': 'Dart VM'
    };
    
    return displayNames[runtimeId] || `${language} Runtime`;
  };

  return (
    <div className="code-debugging-editor">
      {/* Info Alert */}
      <Alert color="warning" className="mb-4">
        <Bug size={16} className="me-2" />
        <strong>Code Debugging Question</strong>
        <div className="mt-2">
          Students will be given buggy code and must identify and fix the issues to make it work correctly.
          {requiresTestCases && (
            <> Test cases will verify their fixes are correct.</>
          )}
        </div>
      </Alert>

      {/* Logic Category Configuration */}
      {requiresTestCases && (
        <>
          <Row>
            <Col md={8}>
              <FormGroup>
                <Label for="entryFunction">
                  Entry Function Name {isFieldRequired('codeConfig.entryFunction') && <span className="text-danger">*</span>}
                </Label>
                <Input
                  type="text"
                  id="entryFunction"
                  value={questionData.codeConfig?.entryFunction || ''}
                  onChange={(e) => handleCodeConfigChange('entryFunction', e.target.value)}
                  placeholder="e.g., solution, calculate, process"
                  invalid={validation?.errors.some(e => e.includes('entryFunction')) || false}
                />
                <small className="text-muted">
                  The main function that will be tested
                </small>
              </FormGroup>
            </Col>
            
            <Col md={4}>
              <FormGroup>
                <Label>Question Category</Label>
                <Input type="text" value={selectedCategory} disabled />
                <small className="text-muted">Logic questions require test cases</small>
              </FormGroup>
            </Col>
          </Row>

          {/* Advanced Settings */}
          <div className="mb-4">
            <Button
              color="secondary"
              outline
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="d-flex align-items-center"
            >
              <Settings size={14} className="me-2" />
              Advanced Settings
              {showAdvanced ? <ChevronUp size={14} className="ms-2" /> : <ChevronDown size={14} className="ms-2" />}
            </Button>
            
            <Collapse isOpen={showAdvanced}>
              <div className="border rounded p-3 mt-3 bg-light">
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="runtime">Runtime Environment</Label>
                      <Input
                        type="select"
                        id="runtime"
                        value={questionData.codeConfig?.runtime || getAutoRuntime(selectedLanguage)}
                        onChange={(e) => handleCodeConfigChange('runtime', e.target.value)}
                      >
                        <option value="node">Node.js - JavaScript/TypeScript runtime</option>
                        <option value="python">Python - Python runtime</option>
                        <option value="sql">SQL Engine - Database queries</option>
                        <option value="dart">Dart VM - Dart/Flutter runtime</option>
                      </Input>
                      <small className="text-muted">
                        Auto-selected based on language: {getRuntimeDisplayName(questionData.codeConfig?.runtime || getAutoRuntime(selectedLanguage), selectedLanguage)}
                      </small>
                    </FormGroup>
                  </Col>
                  
                  <Col md={6}>
                    <FormGroup>
                      <Label for="timeout">Execution Timeout (ms)</Label>
                      <Input
                        type="number"
                        id="timeout"
                        value={questionData.codeConfig?.timeoutMs || getRecommendedTimeout(selectedLanguage)}
                        onChange={(e) => handleCodeConfigChange('timeoutMs', parseInt(e.target.value) || 3000)}
                        min={100}
                        max={30000}
                        step={500}
                      />
                      <small className="text-muted">
                        Recommended for {selectedLanguage}: {getRecommendedTimeout(selectedLanguage)}ms
                      </small>
                    </FormGroup>
                  </Col>
                </Row>
                
                <Alert color="info" className="mt-3 mb-0" size="sm">
                  <Info size={14} className="me-2" />
                  <strong>Note:</strong> Runtime and timeout are automatically configured based on your selected language. 
                  You can adjust these settings if needed for specific debugging scenarios.
                </Alert>
              </div>
            </Collapse>
          </div>
        </>
      )}

      {/* Buggy Code */}
      <FormGroup>
        <Label for="buggyCode">
          Buggy Code {isFieldRequired('buggyCode') && <span className="text-danger">*</span>}
        </Label>
        <SafeMonacoEditor
          height="300px"
          language={getLanguageForMonaco(selectedLanguage)}
          value={questionData.buggyCode || ''}
          onChange={(value) => onInputChange('buggyCode', value || '')}
          placeholder={`// Write buggy ${selectedLanguage} code that students must fix\n// Include common mistakes, logic errors, or syntax issues\n\n${requiresTestCases ? `function ${questionData.codeConfig?.entryFunction || 'solution'}(input) {\n    // Buggy implementation here\n    // Example: off-by-one error, incorrect logic, etc.\n    return input + 1; // This might be wrong!\n}` : '// Provide buggy code here'}`}
          options={{
            lineNumbers: 'on',
            minimap: { enabled: false },
            wordWrap: 'on'
          }}
        />
        <small className="text-muted">
          Code that contains bugs for students to find and fix. Make the bugs realistic and educational.
        </small>
      </FormGroup>

      {/* Solution Code */}
      <FormGroup>
        <Label for="solutionCode">
          Correct Solution {isFieldRequired('solutionCode') && <span className="text-danger">*</span>}
        </Label>
        <SafeMonacoEditor
          height="300px"
          language={getLanguageForMonaco(selectedLanguage)}
          value={questionData.solutionCode || ''}
          onChange={(value) => onInputChange('solutionCode', value || '')}
          placeholder={`// Write the correct ${selectedLanguage} solution\n// This is what the buggy code should look like when fixed\n\n${requiresTestCases ? `function ${questionData.codeConfig?.entryFunction || 'solution'}(input) {\n    // Correct implementation here\n    return input * 2; // Correct logic\n}` : '// Provide correct solution here'}`}
          options={{
            lineNumbers: 'on',
            minimap: { enabled: false },
            wordWrap: 'on'
          }}
        />
        <small className="text-muted">
          The corrected version of the buggy code. This will be used for grading and reference.
        </small>
      </FormGroup>

      {/* Function Signatures Help */}
      {functionSignatures.length > 0 && (
        <Alert color="light" className="mb-4">
          <Info size={16} className="me-2" />
          <strong>Common {selectedLanguage} Patterns:</strong>
          <div className="mt-2">
            {functionSignatures.slice(0, 3).map((sig, index) => (
              <div key={index} className="mb-1">
                <code className="text-primary">{sig.name}</code>: {sig.description}
                {sig.example && <div className="text-muted small mt-1">{sig.example}</div>}
              </div>
            ))}
          </div>
        </Alert>
      )}

      {/* Security Recommendations */}
      {securityRecommendations.length > 0 && (
        <Alert color="info" className="mt-3">
          <Shield size={16} className="me-2" />
          <strong>Security Best Practices for {selectedLanguage}:</strong>
          <ul className="mb-0 mt-2">
            {securityRecommendations.slice(0, 3).map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Common Bug Types */}
      <Alert color="light" className="mt-3">
        <AlertTriangle size={16} className="me-2" />
        <strong>Common Bug Types to Include:</strong>
        <ul className="mb-0 mt-2">
          <li><strong>Logic Errors:</strong> Off-by-one errors, incorrect conditions</li>
          <li><strong>Type Issues:</strong> Wrong data types, type conversion problems</li>
          <li><strong>Edge Cases:</strong> Missing handling for null, empty, or boundary values</li>
          <li><strong>Algorithm Issues:</strong> Inefficient or incorrect algorithms</li>
        </ul>
      </Alert>

      {/* Next Step Preview */}
      {requiresTestCases && (
        <Alert color="primary" className="mt-4">
          <Info size={16} className="me-2" />
          <strong>Next Step:</strong> Add test cases to verify that student fixes work correctly. 
          Test cases will run against both the buggy code (should fail) and the solution (should pass).
        </Alert>
      )}

      {/* Validation Warnings */}
      {validation?.warnings && validation.warnings.length > 0 && (
        <Alert color="warning" className="mt-3">
          <AlertTriangle size={16} className="me-2" />
          <strong>Recommendations:</strong>
          <ul className="mb-0 mt-2">
            {validation.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
};

export default CodeDebuggingEditor;