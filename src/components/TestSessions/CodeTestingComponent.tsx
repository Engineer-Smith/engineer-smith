// components/TestSessions/CodeTestingComponent.tsx - FIXED to reset on question change
import React, { useState, useEffect } from 'react';
import { Button, Alert, Spinner, Badge, Progress, Card, CardBody, Collapse } from 'reactstrap';
import { Play, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight, Clock, Code } from 'lucide-react';
import apiService from '../../services/ApiService';
import type { QuestionTestResult } from '../../types';

interface CodeTestingComponentProps {
    // ALIGNED: Using actual question structure from current context
    question: {
        questionIndex: number;
        questionData: {
            title: string;
            description: string;
            type: 'multipleChoice' | 'trueFalse' | 'codeChallenge' | 'fillInTheBlank' | 'codeDebugging';
            language?: string;
            category?: 'logic' | 'ui' | 'syntax';
            difficulty: 'easy' | 'medium' | 'hard';
            tags?: string[];
            points: number;
            options?: string[];
            correctAnswer?: any;
            codeTemplate?: string;
            blanks?: Array<{
                id: string;
                hint?: string;
                points: number;
            }>;
            buggyCode?: string;
            testCases?: Array<{
                name?: string;
                args: any[];
                expected: any;
                hidden?: boolean;
            }>;
            codeConfig?: {
                runtime: string;
                entryFunction: string;
                timeoutMs: number;
            };
        };
        [key: string]: any;
    };
    studentCode: string;
}

const CodeTestingComponent: React.FC<CodeTestingComponentProps> = ({
    question,
    studentCode
}) => {
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<QuestionTestResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedTests, setExpandedTests] = useState<Set<number>>(new Set());

    // ADDED: Reset state when question changes
    useEffect(() => {
        console.log('CodeTestingComponent: Question changed, resetting state');
        setTestResult(null);
        setError(null);
        setExpandedTests(new Set());
        setTesting(false);
    }, [question.questionIndex, question.questionData.title]); // Reset when question index or title changes

    // ADDED: Reset when student code is cleared or question type changes
    useEffect(() => {
        if (!studentCode.trim()) {
            setTestResult(null);
            setError(null);
            setExpandedTests(new Set());
        }
    }, [question.questionData.type]); // Reset when question type changes

    const handleTestCode = async () => {
        if (!studentCode.trim()) {
            setError('Please write some code before testing');
            return;
        }

        // Check if this is a logic code question that can be tested
        if (question.questionData.category !== 'logic') {
            setError('Only logic code questions support automated testing');
            return;
        }

        if (!question.questionData.codeConfig) {
            setError('This question is missing code configuration for testing');
            return;
        }

        // FIXED: Add proper null/undefined checks for testCases
        if (!question.questionData.testCases || question.questionData.testCases.length === 0) {
            setError('This question has no test cases defined');
            return;
        }

        try {
            setTesting(true);
            setError(null);

            console.log('Testing code with question data:', {
                questionIndex: question.questionIndex,
                type: question.questionData.type,
                language: question.questionData.language,
                category: question.questionData.category,
                testCases: question.questionData.testCases.length,
                codeConfig: question.questionData.codeConfig
            });

            // Use the existing testQuestion API
            const result = await apiService.testQuestion({
                questionData: {
                    type: question.questionData.type,
                    language: question.questionData.language || 'javascript',
                    category: question.questionData.category,
                    testCases: question.questionData.testCases,
                    codeConfig: question.questionData.codeConfig
                },
                testCode: studentCode
            });

            console.log('Test result received:', result);
            setTestResult(result);
            
            // Auto-expand failed tests for debugging
            if (result.testResults) {
                const failedTests = new Set<number>(
                    result.testResults
                        .map((test, index) => !test.passed ? index : -1)
                        .filter(index => index !== -1)
                );
                setExpandedTests(failedTests);
            }

        } catch (err: any) {
            console.error('Code testing failed:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to test code';
            setError(errorMessage);
        } finally {
            setTesting(false);
        }
    };

    const toggleTestExpansion = (index: number) => {
        const newExpanded = new Set(expandedTests);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedTests(newExpanded);
    };

    const getSuccessRate = () => {
        if (!testResult || testResult.totalTests === 0) return 0;
        return (testResult.totalTestsPassed / testResult.totalTests) * 100;
    };

    const getSuccessColor = () => {
        const rate = getSuccessRate();
        if (rate >= 80) return 'success';
        if (rate >= 50) return 'warning';
        return 'danger';
    };

    const formatTestCaseArgs = (args: any[]): string => {
        if (!args || args.length === 0) return '()';
        return `(${args.map(arg => 
            typeof arg === 'string' ? `"${arg}"` : JSON.stringify(arg)
        ).join(', ')})`;
    };

    const formatExpected = (expected: any): string => {
        if (typeof expected === 'string') return `"${expected}"`;
        return JSON.stringify(expected);
    };

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit'
        });
    };

    // Get test result for a specific test case
    const getTestCaseResult = (index: number) => {
        if (!testResult || !testResult.testResults) return null;
        return testResult.testResults[index];
    };

    // Show test cases from question data, enhanced with results if available
    const renderTestCases = () => {
        // FIXED: Add proper null/undefined checks
        const testCases = question.questionData.testCases || [];
        
        if (testCases.length === 0) {
            return (
                <div className="text-center text-muted py-4">
                    <Code className="mb-2" style={{ width: '20px', height: '20px' }} />
                    <div className="small">No test cases defined for this question</div>
                </div>
            );
        }

        return testCases.map((testCase, index: number) => {
            const result = getTestCaseResult(index);
            const isExpanded = expandedTests.has(index);
            const hasRun = !!result;
            
            return (
                <Card 
                    key={index} 
                    className={`mb-2 border ${
                        hasRun 
                            ? result.passed 
                                ? 'border-success border-opacity-50' 
                                : 'border-danger border-opacity-50'
                            : 'border-secondary border-opacity-25'
                    }`}
                >
                    <CardBody className="p-3">
                        <div 
                            className="d-flex justify-content-between align-items-center cursor-pointer"
                            onClick={() => toggleTestExpansion(index)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="d-flex align-items-center gap-2">
                                {isExpanded ? (
                                    <ChevronDown size={14} className="text-muted" />
                                ) : (
                                    <ChevronRight size={14} className="text-muted" />
                                )}
                                <div className="fw-medium">
                                    {testCase.name || `Test Case ${index + 1}`}
                                </div>
                                
                                {/* Status indicator */}
                                {hasRun ? (
                                    result.passed ? (
                                        <CheckCircle className="text-success" size={16} />
                                    ) : (
                                        <XCircle className="text-danger" size={16} />
                                    )
                                ) : (
                                    <div className="bg-secondary rounded-circle" style={{ width: '16px', height: '16px' }}></div>
                                )}
                            </div>
                            
                            <div className="d-flex align-items-center gap-2">
                                {hasRun && (
                                    <>
                                        <small className="text-muted d-flex align-items-center gap-1">
                                            <Clock size={12} />
                                            {result.executionTime || 0}ms
                                        </small>
                                        <Badge 
                                            color={result.passed ? 'success' : 'danger'} 
                                            className="small"
                                        >
                                            {result.passed ? 'PASS' : 'FAIL'}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <Collapse isOpen={isExpanded}>
                            <div className="mt-3 pt-3 border-top">
                                {/* Test case parameters */}
                                <div className="mb-3">
                                    <div className="small mb-2">
                                        <span className="text-muted fw-medium">Input:</span>{' '}
                                        <code className="bg-secondary bg-opacity-10 px-2 py-1 rounded">
                                            {formatTestCaseArgs(testCase.args)}
                                        </code>
                                    </div>
                                    <div className="small">
                                        <span className="text-muted fw-medium">Expected Output:</span>{' '}
                                        <code className="bg-info bg-opacity-10 px-2 py-1 rounded text-info">
                                            {formatExpected(testCase.expected)}
                                        </code>
                                    </div>
                                </div>
                                
                                {/* Results if test has run */}
                                {hasRun && (
                                    <div className="mb-3">
                                        <div className="small mb-2">
                                            <span className="text-muted fw-medium">Actual Output:</span>{' '}
                                            <code className={`px-2 py-1 rounded ${
                                                result.passed 
                                                    ? 'bg-success bg-opacity-10 text-success' 
                                                    : 'bg-danger bg-opacity-10 text-danger'
                                            }`}>
                                                {result.error ? `Error: ${result.error}` : result.actualOutput}
                                            </code>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Console output for this specific test */}
                                {hasRun && result.consoleLogs && result.consoleLogs.length > 0 && (
                                    <div className="mt-3">
                                        <div className="small fw-medium text-muted mb-2">Console Output:</div>
                                        <div className="bg-dark text-light p-2 rounded font-monospace" style={{ fontSize: '11px' }}>
                                            {result.consoleLogs.map((log, logIndex: number) => (
                                                <div key={logIndex} className="py-1">
                                                    <span className="text-secondary">[{formatTimestamp(log.timestamp)}]</span>{' '}
                                                    <span className="text-light">{log.message}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Collapse>
                    </CardBody>
                </Card>
            );
        });
    };

    // FIXED: Add proper null/undefined checks for canTest calculation
    const canTest = question.questionData.category === 'logic' && 
                    question.questionData.codeConfig && 
                    question.questionData.testCases && 
                    question.questionData.testCases.length > 0;

    return (
        <div className="p-3">
            {/* Run Tests Button */}
            <div className="mb-3">
                <Button
                    color="primary"
                    onClick={handleTestCode}
                    disabled={testing || !studentCode.trim() || !canTest}
                    className="w-100 d-flex align-items-center justify-content-center"
                    size="sm"
                >
                    {testing ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Testing...
                        </>
                    ) : (
                        <>
                            <Play className="me-2" style={{ width: '16px', height: '16px' }} />
                            Run Tests
                        </>
                    )}
                </Button>
                
                {/* Help text for disabled state */}
                {!canTest && (
                    <small className="text-muted d-block mt-1 text-center">
                        {question.questionData.category !== 'logic' && 'Only logic questions support testing'}
                        {question.questionData.category === 'logic' && !question.questionData.codeConfig && 'Missing code configuration'}
                        {question.questionData.category === 'logic' && question.questionData.codeConfig && (!question.questionData.testCases || question.questionData.testCases.length === 0) && 'No test cases available'}
                    </small>
                )}
            </div>

            {/* Overall Results Summary */}
            {testResult && (
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="fw-bold text-muted">OVERALL RESULT</small>
                        <Badge 
                            color={testResult.overallPassed ? 'success' : 'danger'}
                            className="d-flex align-items-center"
                        >
                            {testResult.overallPassed ? (
                                <CheckCircle className="me-1" style={{ width: '10px', height: '10px' }} />
                            ) : (
                                <XCircle className="me-1" style={{ width: '10px', height: '10px' }} />
                            )}
                            <small>{testResult.overallPassed ? 'ALL PASSED' : 'SOME FAILED'}</small>
                        </Badge>
                    </div>
                    <Progress 
                        value={getSuccessRate()} 
                        color={getSuccessColor()}
                        className="mb-2"
                        style={{ height: '6px' }}
                    />
                    <div className="d-flex justify-content-between">
                        <small className="text-muted">
                            {testResult.totalTestsPassed}/{testResult.totalTests} passed
                        </small>
                        <small className="text-muted">
                            {getSuccessRate().toFixed(0)}%
                        </small>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <Alert color="danger" className="mb-3 p-2">
                    <AlertTriangle className="me-2" style={{ width: '14px', height: '14px' }} />
                    <small>{error}</small>
                </Alert>
            )}

            {/* Compilation/Execution Errors */}
            {testResult && (testResult.compilationError || testResult.executionError) && (
                <Alert color="warning" className="mb-3 p-2">
                    <div className="small">
                        <strong>Error:</strong>
                        <div className="font-monospace text-break">
                            {testResult.compilationError || testResult.executionError}
                        </div>
                    </div>
                </Alert>
            )}

            {/* Test Cases */}
            <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Test Cases</h6>
                    <Badge color="info" className="small">
                        {/* FIXED: Add proper null/undefined check */}
                        {question.questionData.testCases?.length || 0} total
                    </Badge>
                </div>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {renderTestCases()}
                </div>
            </div>

            {/* Instructions */}
            {!testResult && canTest && (
                <div className="text-center text-muted py-3">
                    <div className="small mb-2">
                        Click test cases above to preview inputs and expected outputs
                    </div>
                    <div className="small">
                        Run tests to see actual results and debugging information
                    </div>
                </div>
            )}

            {/* Info about question type */}
            {!canTest && (
                <div className="text-center text-muted py-3">
                    <div className="small">
                        This question type ({question.questionData.category || 'unknown'}) does not support automated testing
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeTestingComponent;