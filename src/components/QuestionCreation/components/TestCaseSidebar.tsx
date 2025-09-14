// src/components/QuestionCreation/components/TestCaseSidebar.tsx - ENHANCED
import React from 'react';
import { Card, CardBody, Badge, Col, Alert, Progress } from 'reactstrap';
import { CheckCircle, AlertTriangle, Clock, Zap } from 'lucide-react';
import type { Language } from '../../../types';

interface CodeConfig {
  entryFunction?: string;
  runtime?: string;
  timeoutMs?: number;
}

interface TestResult {
  index: number;
  passed: boolean;
  error?: string;
}

// ✅ NEW: Test suite validation interface
interface TestSuiteValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface TestCaseSidebarProps {
  selectedLanguage?: Language;
  codeConfig?: CodeConfig;
  testResults: TestResult[];
  allTestsPassed: boolean;
  hasTestResults: boolean;
  // ✅ NEW: Enhanced props from TestCasesStep
  testSuiteValidation?: TestSuiteValidation;
  requiresRuntime?: boolean;
}

const TestCaseSidebar: React.FC<TestCaseSidebarProps> = ({
  selectedLanguage,
  codeConfig,
  testResults,
  allTestsPassed,
  hasTestResults,
  testSuiteValidation,
  requiresRuntime = false
}) => {
  // Calculate test results summary
  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testResults.length;
  const passPercentage = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  return (
    <Col lg={4}>
      {/* Function Context */}
      <Card className="mb-4 border-primary">
        <CardBody>
          <div className="d-flex align-items-center mb-3">
            <h6 className="text-primary mb-0 me-2">Function Context</h6>
            {requiresRuntime && (
              <Badge color="info" className="small">
                Runtime Required
              </Badge>
            )}
          </div>
          <div className="small">
            <div className="mb-2">
              <strong>Language:</strong> 
              <span className="ms-1 text-capitalize">{selectedLanguage || 'Not selected'}</span>
            </div>
            {codeConfig?.entryFunction && (
              <div className="mb-2">
                <strong>Function:</strong>
                <code className="ms-1 bg-light px-1 rounded">{codeConfig.entryFunction}</code>
              </div>
            )}
            <div className="mb-2">
              <strong>Runtime:</strong> 
              <span className="ms-1">{codeConfig?.runtime || 'node'}</span>
              {!codeConfig?.runtime && requiresRuntime && (
                <Badge color="warning" className="ms-2 small">Not Set</Badge>
              )}
            </div>
            <div className="mb-2">
              <strong>Timeout:</strong> 
              <span className="ms-1">{codeConfig?.timeoutMs || 3000}ms</span>
              <Clock size={12} className="ms-1 text-muted" />
            </div>
            
            {/* ✅ NEW: Configuration Status */}
            <div className="mt-3 pt-2 border-top">
              <div className="d-flex align-items-center">
                <strong className="me-2">Status:</strong>
                {codeConfig?.entryFunction && (requiresRuntime ? codeConfig?.runtime : true) ? (
                  <Badge color="success" className="d-flex align-items-center">
                    <CheckCircle size={12} className="me-1" />
                    Ready
                  </Badge>
                ) : (
                  <Badge color="warning" className="d-flex align-items-center">
                    <AlertTriangle size={12} className="me-1" />
                    Setup Needed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ✅ NEW: Test Suite Validation */}
      {testSuiteValidation && (
        <Card className="mb-4">
          <CardBody>
            <div className="d-flex align-items-center mb-3">
              <h6 className="mb-0 me-2">Test Suite Validation</h6>
              <Badge color={testSuiteValidation.isValid ? "success" : "warning"}>
                {testSuiteValidation.isValid ? "Valid" : "Issues"}
              </Badge>
            </div>
            
            {!testSuiteValidation.isValid && testSuiteValidation.errors.length > 0 && (
              <Alert color="danger" className="small mb-2">
                <AlertTriangle size={14} className="me-1" />
                <strong>Errors:</strong>
                <ul className="mb-0 mt-1">
                  {testSuiteValidation.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {testSuiteValidation.errors.length > 3 && (
                    <li>... and {testSuiteValidation.errors.length - 3} more</li>
                  )}
                </ul>
              </Alert>
            )}
            
            {testSuiteValidation.warnings.length > 0 && (
              <Alert color="warning" className="small mb-0">
                <AlertTriangle size={14} className="me-1" />
                <strong>Warnings:</strong>
                <ul className="mb-0 mt-1">
                  {testSuiteValidation.warnings.slice(0, 2).map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                  {testSuiteValidation.warnings.length > 2 && (
                    <li>... and {testSuiteValidation.warnings.length - 2} more</li>
                  )}
                </ul>
              </Alert>
            )}
          </CardBody>
        </Card>
      )}

      {/* Test Results - Enhanced */}
      {hasTestResults && (
        <Card className="mb-4">
          <CardBody>
            <h6 className="mb-3">Test Results</h6>
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Badge color={allTestsPassed ? "success" : passPercentage >= 50 ? "warning" : "danger"}>
                  {passedCount} / {totalCount} Passed
                </Badge>
                <span className="small text-muted">
                  {Math.round(passPercentage)}%
                </span>
              </div>
              <Progress 
                value={passPercentage} 
                color={allTestsPassed ? "success" : passPercentage >= 50 ? "warning" : "danger"}
                className="mb-2"
                style={{ height: '6px' }}
              />
              <div className="small text-muted">
                {allTestsPassed ? 'All tests passing!' : 
                 passPercentage >= 50 ? 'Most tests passing' : 'Many tests failing'}
              </div>
            </div>

            {/* Individual Test Results */}
            <div className="test-results-list">
              {testResults.map((result, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center py-1">
                  <span className="small">Test {index + 1}</span>
                  <div className="d-flex align-items-center">
                    <Badge color={result.passed ? "success" : "danger"} className="small">
                      {result.passed ? "Pass" : "Fail"}
                    </Badge>
                    {result.error && (
                      <span title={result.error} className="d-inline-flex">
                        <AlertTriangle size={12} className="ms-1 text-danger" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            {totalCount > 0 && (
              <div className="mt-3 pt-2 border-top small text-muted">
                <div className="d-flex justify-content-between">
                  <span>Success Rate:</span>
                  <span className={allTestsPassed ? 'text-success' : passPercentage >= 50 ? 'text-warning' : 'text-danger'}>
                    {Math.round(passPercentage)}%
                  </span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Enhanced Help Card */}
      <Card className="border-info">
        <CardBody>
          <div className="d-flex align-items-center mb-3">
            <h6 className="text-info mb-0 me-2">Test Case Tips</h6>
            <Zap size={16} className="text-info" />
          </div>
          
          <div className="small">
            <div className="mb-3">
              <strong>Essential Test Types:</strong>
              <ul className="mb-0 mt-1">
                <li className="mb-1">✅ <strong>Basic cases:</strong> Normal, expected inputs</li>
                <li className="mb-1">🔍 <strong>Edge cases:</strong> Empty arrays, null values, boundaries</li>
                <li className="mb-1">🔒 <strong>Hidden cases:</strong> Comprehensive validation</li>
                <li className="mb-1">⚡ <strong>Performance:</strong> Large inputs, timeouts</li>
              </ul>
            </div>
            
            <div className="mb-3">
              <strong>Best Practices:</strong>
              <ul className="mb-0 mt-1">
                <li className="mb-1">Start with 3-5 test cases</li>
                <li className="mb-1">Make at least one visible to students</li>
                <li className="mb-1">Test both success and error paths</li>
                <li className="mb-1">Use descriptive names and descriptions</li>
              </ul>
            </div>

            {/* ✅ NEW: Language-specific tips */}
            {selectedLanguage && (
              <div>
                <strong>Tips for {selectedLanguage}:</strong>
                <ul className="mb-0 mt-1">
                  {selectedLanguage === 'javascript' && (
                    <>
                      <li className="mb-1">Test with different data types</li>
                      <li className="mb-1">Consider undefined/null handling</li>
                    </>
                  )}
                  {selectedLanguage === 'python' && (
                    <>
                      <li className="mb-1">Test with different iterable types</li>
                      <li className="mb-1">Consider None value handling</li>
                    </>
                  )}
                  {selectedLanguage === 'sql' && (
                    <>
                      <li className="mb-1">Test with empty result sets</li>
                      <li className="mb-1">Validate column names and types</li>
                    </>
                  )}
                  {!['javascript', 'python', 'sql'].includes(selectedLanguage) && (
                    <li className="mb-1">Consider language-specific edge cases</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default TestCaseSidebar;