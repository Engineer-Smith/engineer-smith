// src/components/QuestionCreation/components/TestCasesList.tsx - UPDATED
import React from 'react';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Row,
  Col,
  Spinner,
  Alert
} from 'reactstrap';
import { Trash2, Eye, EyeOff, Play, Lock, AlertTriangle } from 'lucide-react';
import type { TestCase } from '../../../types';

interface TestCasesListProps {
  testCases: TestCase[];
  testResults: Array<{
    index: number;
    passed: boolean;
    error?: string;
  }>;
  showHiddenTestCases: boolean;
  onToggleHidden: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onRunTests: () => void;
  onEditSolution: () => void;
  isTesting: boolean;
  hasSolutionCode: boolean;
  // Formatting function prop (optional for backward compatibility)
  formatTestCase?: (testCase: TestCase, index: number) => string;
}

const TestCasesList: React.FC<TestCasesListProps> = ({
  testCases,
  testResults,
  showHiddenTestCases,
  onToggleHidden,
  onEdit,
  onRemove,
  onRunTests,
  onEditSolution,
  isTesting,
  hasSolutionCode,
  formatTestCase
}) => {
  if (testCases.length === 0) {
    return null;
  }

  // Helper function to format test case display
  const getFormattedDisplay = (testCase: TestCase, index: number): string => {
    if (formatTestCase) {
      return formatTestCase(testCase, index);
    }
    // Fallback formatting if no formatter provided
    const args = Array.isArray(testCase.args) 
      ? testCase.args.map((arg: any) => JSON.stringify(arg)).join(', ')
      : JSON.stringify(testCase.args);
    const expected = JSON.stringify(testCase.expected);
    return `Test ${index + 1}: f(${args}) → ${expected}`;
  };

  // Calculate summary statistics
  const visibleCount = testCases.filter(tc => !tc.hidden).length;
  const hiddenCount = testCases.length - visibleCount;
  const passedCount = testResults.filter(r => r.passed).length;

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 className="mb-0">Test Cases ({testCases.length})</h6>
            <div className="small text-muted">
              {visibleCount} visible • {hiddenCount} hidden
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              size="sm"
              color="secondary"
              outline
              onClick={onToggleHidden}
            >
              {showHiddenTestCases ? <EyeOff size={14} /> : <Eye size={14} />}
              {showHiddenTestCases ? 'Hide' : 'Show'} Hidden
            </Button>
            <Button
              size="sm"
              color="success"
              onClick={onRunTests}
              disabled={isTesting || testCases.length === 0}
            >
              {isTesting ? <Spinner size="sm" className="me-1" /> : <Play size={14} className="me-1" />}
              Run Tests
            </Button>
            {!hasSolutionCode ? (
              <Button
                size="sm"
                color="warning"
                outline
                onClick={onEditSolution}
              >
                <Lock size={14} className="me-1" />
                Add Solution
              </Button>
            ) : (
              <Button
                size="sm"
                color="warning"
                outline
                onClick={onEditSolution}
              >
                <Lock size={14} className="me-1" />
                Edit Solution
              </Button>
            )}
          </div>
        </div>

        {/* Test Results Summary */}
        {testResults.length > 0 && (
          <Alert color={passedCount === testCases.length ? "success" : "warning"} className="mb-3">
            <div className="d-flex align-items-center">
              <div className="me-2">
                {passedCount === testCases.length ? "✅" : "⚠️"}
              </div>
              <div>
                <strong>Test Results:</strong> {passedCount} of {testCases.length} tests passing
                {passedCount < testCases.length && (
                  <div className="small mt-1">
                    Review failed tests and update your solution code
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}

        <div className="test-cases-list">
          {testCases.map((testCase, index) => {
            if (testCase.hidden && !showHiddenTestCases) return null;
            
            const testResult = testResults[index];
            
            return (
              <Card key={index} className="mb-3 border">
                <CardBody className="py-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <Badge color={testCase.hidden ? "secondary" : "primary"}>
                        Test {index + 1}
                      </Badge>
                      <h6 className="mb-0">{testCase.name || `Test Case ${index + 1}`}</h6>
                      {testCase.hidden && (
                        <Badge color="outline-secondary" className="small">Hidden</Badge>
                      )}
                      {testResult && (
                        <Badge color={testResult.passed ? "success" : "danger"}>
                          {testResult.passed ? "✓ Pass" : "✗ Fail"}
                        </Badge>
                      )}
                    </div>
                    <div className="d-flex gap-1">
                      <Button
                        size="sm"
                        color="primary"
                        outline
                        onClick={() => onEdit(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        outline
                        onClick={() => onRemove(index)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Show formatted display if available */}
                  {formatTestCase && (
                    <div className="mb-2">
                      <div className="small text-muted">
                        <strong>Function Call:</strong>
                      </div>
                      <code className="bg-light px-2 py-1 rounded d-block small">
                        {getFormattedDisplay(testCase, index)}
                      </code>
                    </div>
                  )}

                  <Row className="small">
                    <Col md={6}>
                      <strong>Input:</strong>
                      <pre className="bg-light p-2 mb-0 mt-1 rounded small">
                        {JSON.stringify(testCase.args, null, 2)}
                      </pre>
                    </Col>
                    <Col md={6}>
                      <strong>Expected:</strong>
                      <pre className="bg-light p-2 mb-0 mt-1 rounded small">
                        {JSON.stringify(testCase.expected, null, 2)}
                      </pre>
                    </Col>
                  </Row>

                  {/* Error display */}
                  {testResult && !testResult.passed && testResult.error && (
                    <div className="mt-2 pt-2 border-top">
                      <div className="d-flex align-items-center text-danger small">
                        <AlertTriangle size={12} className="me-1" />
                        <strong>Error:</strong>
                      </div>
                      <div className="text-muted mt-1 small" style={{ fontSize: '11px' }}>
                        {testResult.error.length > 100 
                          ? `${testResult.error.substring(0, 100)}...` 
                          : testResult.error
                        }
                      </div>
                    </div>
                  )}

                  {/* Test case status */}
                  <div className="mt-2 pt-2 border-top d-flex justify-content-between align-items-center small text-muted">
                    <div>
                      Type: {testCase.hidden ? 'Hidden validation' : 'Visible example'}
                    </div>
                    <div>
                      Status: {testResult ? 
                        (testResult.passed ? 
                          <span className="text-success">Passing</span> : 
                          <span className="text-danger">Failing</span>
                        ) : 
                        <span className="text-muted">Not tested</span>
                      }
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Empty state when all test cases are hidden */}
        {testCases.length > 0 && testCases.every(tc => tc.hidden) && !showHiddenTestCases && (
          <Alert color="info" className="text-center">
            <Eye size={24} className="mb-2" />
            <h6>All test cases are hidden</h6>
            <p className="mb-2">Click "Show Hidden" to view and edit your test cases.</p>
            <Button size="sm" color="info" outline onClick={onToggleHidden}>
              <Eye size={14} className="me-1" />
              Show Hidden Test Cases
            </Button>
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};

export default TestCasesList;