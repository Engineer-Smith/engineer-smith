// src/components/tests/ReviewPublish.tsx
import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Button,
  Card,
  CardBody,
  CardHeader,
  Alert,
  Badge,
  ListGroup,
  ListGroupItem,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress
} from 'reactstrap';
import { useAuth } from '../../context/AuthContext';
import { testAPI, questionAPI } from '../../services/testAPI';
import type { Question, CreateTestData } from '../../types';

interface ReviewPublishProps {
  testData: CreateTestData;
  setTestData: React.Dispatch<React.SetStateAction<CreateTestData>>;
  onPrevious: () => void;
  onComplete: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const ReviewPublish: React.FC<ReviewPublishProps> = ({
  testData,
  setTestData,
  onPrevious,
  onComplete,
  setError,
  setLoading
}) => {
  const { client } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [validation, setValidation] = useState<ValidationResult>({ valid: true, errors: [], warnings: [] });
  const [showPreview, setShowPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [newQuestionIds, setNewQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    loadQuestions();
    validateTest();
  }, [testData]);

  const loadQuestions = async () => {
    try {
      const questionIds = getAllQuestionIds();
      if (questionIds.length === 0) return;

      const response = await client.get(`/questions?ids=${questionIds.join(',')}`);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const getAllQuestionIds = () => {
    const ids = new Set<string>();
    
    if (testData.settings.useSections) {
      testData.sections.forEach(section => {
        section.questions.forEach(q => ids.add(q.questionId));
      });
    } else {
      testData.questions.forEach(q => ids.add(q.questionId));
    }
    
    return Array.from(ids);
  };

  const validateTest = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!testData.title.trim()) errors.push('Test title is required');
    if (!testData.description.trim()) errors.push('Test description is required');
    if (testData.skills.length === 0) errors.push('At least one skill must be selected');

    // Question validation
    const totalQuestions = getTotalQuestions();
    if (totalQuestions === 0) {
      errors.push('Test must have at least one question');
    } else if (totalQuestions < 5) {
      warnings.push('Consider adding more questions for a comprehensive assessment');
    }

    // Section validation (if using sections)
    if (testData.settings.useSections) {
      if (testData.sections.length === 0) {
        errors.push('Section-based test must have at least one section');
      }

      testData.sections.forEach((section, index) => {
        if (!section.name.trim()) {
          errors.push(`Section ${index + 1} must have a name`);
        }
        if (section.timeLimit <= 0) {
          errors.push(`Section ${index + 1} must have a positive time limit`);
        }
        if (!section.questionPool.enabled && section.questions.length === 0) {
          warnings.push(`Section "${section.name}" has no questions assigned`);
        }
      });

      const totalTime = testData.sections.reduce((sum, s) => sum + s.timeLimit, 0);
      if (totalTime > 240) {
        warnings.push('Total test time exceeds 4 hours - consider breaking into multiple tests');
      }
    } else {
      // Simple test validation
      if (testData.settings.timeLimit <= 0) {
        errors.push('Test time limit must be positive');
      }
      if (testData.settings.timeLimit > 240) {
        warnings.push('Test time limit exceeds 4 hours');
      }
    }

    // Score validation
    if (testData.settings.passingScore < 0 || testData.settings.passingScore > 100) {
      errors.push('Passing score must be between 0 and 100');
    }

    // Time estimation
    const estimatedTime = getEstimatedTime();
    const allocatedTime = testData.settings.useSections 
      ? testData.sections.reduce((sum, s) => sum + s.timeLimit, 0)
      : testData.settings.timeLimit;
    
    if (estimatedTime > allocatedTime * 1.2) {
      warnings.push('Allocated time may be insufficient based on question complexity');
    }

    setValidation({
      valid: errors.length === 0,
      errors,
      warnings
    });
  };

  const getTotalQuestions = () => {
    if (testData.settings.useSections) {
      return testData.sections.reduce((total, section) => {
        if (section.questionPool.enabled) {
          return total + (section.questionPool.totalQuestions || 0);
        }
        return total + section.questions.length;
      }, 0);
    }
    return testData.questions.length;
  };

  const getTotalPoints = () => {
    if (testData.settings.useSections) {
      return testData.sections.reduce((total, section) => {
        if (section.questionPool.enabled) {
          return total + (section.questionPool.totalQuestions || 0) * 2; // Estimate
        }
        return total + section.questions.reduce((sectionTotal, q) => {
          const question = questions.find(qq => qq._id === q.questionId);
          return sectionTotal + (question?.points || q.points || 1);
        }, 0);
      }, 0);
    } else {
      return testData.questions.reduce((total, q) => {
        const question = questions.find(qq => qq._id === q.questionId);
        return total + (question?.points || q.points || 1);
      }, 0);
    }
  };

  const getEstimatedTime = () => {
    if (testData.settings.useSections) {
      return testData.sections.reduce((total, section) => {
        if (section.questionPool.enabled) {
          return total + (section.questionPool.totalQuestions || 0) * 2; // 2 min average
        }
        return total + section.questions.reduce((sectionTotal, q) => {
          const question = questions.find(qq => qq._id === q.questionId);
          return sectionTotal + (question?.timeEstimate || 120) / 60; // Convert to minutes
        }, 0);
      }, 0);
    } else {
      return testData.questions.reduce((total, q) => {
        const question = questions.find(qq => qq._id === q.questionId);
        return total + (question?.timeEstimate || 120) / 60;
      }, 0);
    }
  };

  const getQuestionsByType = () => {
    const counts = {
      multiple_choice: 0,
      true_false: 0,
      code_challenge: 0,
      debug_fix: 0
    };

    const questionIds = getAllQuestionIds();
    questionIds.forEach(id => {
      const question = questions.find(q => q._id === id);
      if (question && counts.hasOwnProperty(question.type)) {
        counts[question.type as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const getQuestionsByDifficulty = () => {
    const counts = { beginner: 0, intermediate: 0, advanced: 0 };

    const questionIds = getAllQuestionIds();
    questionIds.forEach(id => {
      const question = questions.find(q => q._id === id);
      if (question && counts.hasOwnProperty(question.difficulty)) {
        counts[question.difficulty as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create the test as draft
      const response = await testAPI.createTest(testData);

      if (response.success) {
        onComplete();
      } else {
        setError(response.message || 'Failed to save test');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save test');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validation.valid) {
      setError('Please fix validation errors before publishing');
      return;
    }

    try {
      setPublishing(true);
      setError(null);

      // First create the test
      const createResponse = await testAPI.createTest(testData);

      if (createResponse.success) {
        // Then publish it
        const publishResponse = await testAPI.publishTest(createResponse.test._id);
        
        if (publishResponse.success) {
          onComplete();
        } else {
          setError(publishResponse.message || 'Failed to publish test');
        }
      } else {
        setError(createResponse.message || 'Failed to create test');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to publish test');
    } finally {
      setPublishing(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const questionsByType = getQuestionsByType();
  const questionsByDifficulty = getQuestionsByDifficulty();

  return (
    <div>
      {/* Validation Summary */}
      {!validation.valid && (
        <Alert color="danger" className="mb-4">
          <h6>⚠️ Validation Errors</h6>
          <ul className="mb-0">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert color="warning" className="mb-4">
          <h6>⚠️ Warnings</h6>
          <ul className="mb-0">
            {validation.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}

      {validation.valid && (
        <Alert color="success" className="mb-4">
          <h6>✅ Test Ready</h6>
          <p className="mb-0">Your test has passed validation and is ready to publish!</p>
        </Alert>
      )}

      <Row>
        {/* Test Overview */}
        <Col lg="8">
          <Card className="mb-4">
            <CardHeader>
              <h5 className="mb-0">Test Overview</h5>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="6">
                  <div className="mb-3">
                    <strong>Title:</strong> {testData.title}
                  </div>
                  <div className="mb-3">
                    <strong>Type:</strong> {testData.testType.replace('_', ' ')}
                  </div>
                  <div className="mb-3">
                    <strong>Skills:</strong>
                    <div className="mt-1">
                      {testData.skills.map(skill => (
                        <Badge key={skill} color="info" className="me-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Col>
                <Col md="6">
                  <div className="mb-3">
                    <strong>Structure:</strong> {testData.settings.useSections ? 'Section-based' : 'Simple'}
                  </div>
                  <div className="mb-3">
                    <strong>Questions:</strong> {getTotalQuestions()}
                  </div>
                  <div className="mb-3">
                    <strong>Total Points:</strong> {getTotalPoints()}
                  </div>
                </Col>
              </Row>
              
              <div className="mb-3">
                <strong>Description:</strong>
                <p className="text-muted mb-0 mt-1">{testData.description}</p>
              </div>

              {testData.instructions && (
                <div className="mb-3">
                  <strong>Instructions:</strong>
                  <p className="text-muted mb-0 mt-1">{testData.instructions}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Sections (if using sections) */}
          {testData.settings.useSections && (
            <Card className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Sections ({testData.sections.length})</h5>
              </CardHeader>
              <CardBody className="p-0">
                <ListGroup flush>
                  {testData.sections.map((section, index) => (
                    <ListGroupItem key={section.tempId || section._id || index}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{section.name}</h6>
                          <p className="text-muted small mb-2">
                            {section.description || `${section.sectionType} section`}
                          </p>
                          <div>
                            <Badge color="secondary" className="me-2">
                              {section.timeLimit} minutes
                            </Badge>
                            <Badge color="info" className="me-2">
                              {section.questionPool.enabled 
                                ? `${section.questionPool.totalQuestions} questions (pool)`
                                : `${section.questions.length} questions`
                              }
                            </Badge>
                            <Badge color="outline-primary">
                              {section.sectionType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </CardBody>
            </Card>
          )}

          {/* Question Preview */}
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Question Distribution</h5>
              <Button color="outline-primary" size="sm" onClick={() => setShowPreview(true)}>
                Preview Questions
              </Button>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md="6">
                  <h6>By Type</h6>
                  <Table size="sm" className="mb-3">
                    <tbody>
                      <tr>
                        <td>Multiple Choice</td>
                        <td>{questionsByType.multiple_choice}</td>
                      </tr>
                      <tr>
                        <td>True/False</td>
                        <td>{questionsByType.true_false}</td>
                      </tr>
                      <tr>
                        <td>Code Challenge</td>
                        <td>{questionsByType.code_challenge}</td>
                      </tr>
                      <tr>
                        <td>Debug & Fix</td>
                        <td>{questionsByType.debug_fix}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md="6">
                  <h6>By Difficulty</h6>
                  <Table size="sm" className="mb-3">
                    <tbody>
                      <tr>
                        <td>Beginner</td>
                        <td>{questionsByDifficulty.beginner}</td>
                      </tr>
                      <tr>
                        <td>Intermediate</td>
                        <td>{questionsByDifficulty.intermediate}</td>
                      </tr>
                      <tr>
                        <td>Advanced</td>
                        <td>{questionsByDifficulty.advanced}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>

        {/* Summary Sidebar */}
        <Col lg="4">
          <Card className="mb-4">
            <CardHeader>
              <h6 className="mb-0">Test Summary</h6>
            </CardHeader>
            <CardBody>
              <div className="text-center mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Questions</span>
                  <strong>{getTotalQuestions()}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Total Points</span>
                  <strong>{getTotalPoints()}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Estimated Time</span>
                  <strong>{formatTime(getEstimatedTime())}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Allocated Time</span>
                  <strong>
                    {testData.settings.useSections 
                      ? formatTime(testData.sections.reduce((sum, s) => sum + s.timeLimit, 0))
                      : formatTime(testData.settings.timeLimit)
                    }
                  </strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center">
                  <span>Passing Score</span>
                  <strong>{testData.settings.passingScore}%</strong>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader>
              <h6 className="mb-0">Settings</h6>
            </CardHeader>
            <CardBody>
              <div className="small">
                <div className="mb-2">
                  <strong>Attempts:</strong> {testData.settings.attemptsAllowed}
                </div>
                <div className="mb-2">
                  <strong>Shuffle Questions:</strong> {testData.settings.shuffleQuestions ? 'Yes' : 'No'}
                </div>
                <div className="mb-2">
                  <strong>Shuffle Options:</strong> {testData.settings.shuffleOptions ? 'Yes' : 'No'}
                </div>
                <div className="mb-2">
                  <strong>Show Results:</strong> {testData.settings.showResults ? 'Yes' : 'No'}
                </div>
                <div className="mb-2">
                  <strong>Show Correct Answers:</strong> {testData.settings.showCorrectAnswers ? 'Yes' : 'No'}
                </div>
                {testData.settings.availableFrom && (
                  <div className="mb-2">
                    <strong>Available From:</strong><br />
                    <small>{new Date(testData.settings.availableFrom).toLocaleString()}</small>
                  </div>
                )}
                {testData.settings.availableUntil && (
                  <div className="mb-2">
                    <strong>Available Until:</strong><br />
                    <small>{new Date(testData.settings.availableUntil).toLocaleString()}</small>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <div className="d-grid gap-2">
            <Button 
              color="success" 
              size="lg"
              onClick={handlePublish}
              disabled={!validation.valid || publishing}
            >
              {publishing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Publishing...
                </>
              ) : (
                '🚀 Publish Test'
              )}
            </Button>
            
            <Button 
              color="outline-primary"
              onClick={handleSaveDraft}
              disabled={publishing}
            >
              💾 Save as Draft
            </Button>
          </div>

          <div className="mt-3 small text-muted text-center">
            <p className="mb-1">
              <strong>Published tests</strong> will be immediately available to students.
            </p>
            <p className="mb-0">
              <strong>Draft tests</strong> can be edited later before publishing.
            </p>
          </div>
        </Col>
      </Row>

      {/* Question Preview Modal */}
      <Modal isOpen={showPreview} toggle={() => setShowPreview(false)} size="xl">
        <ModalHeader toggle={() => setShowPreview(false)}>
          Question Preview
        </ModalHeader>
        <ModalBody style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {testData.settings.useSections ? (
            // Section-based preview
            testData.sections.map((section, sectionIndex) => (
              <div key={section.tempId || section._id || sectionIndex} className="mb-4">
                <h6 className="border-bottom pb-2">
                  Section {sectionIndex + 1}: {section.name}
                  <Badge color="info" className="ms-2">
                    {section.timeLimit} minutes
                  </Badge>
                </h6>
                
                {section.questionPool.enabled ? (
                  <Alert color="info">
                    <strong>Question Pool:</strong> {section.questionPool.totalQuestions} questions 
                    will be randomly selected using {section.questionPool.selectionStrategy} strategy.
                  </Alert>
                ) : (
                  <div className="ms-3">
                    {section.questions.map((q, qIndex) => {
                      const question = questions.find(qq => qq._id === q.questionId);
                      return question ? (
                        <div key={qIndex} className="mb-2 p-2 border-start border-3 border-light">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong>{question.title}</strong>
                              <div className="small text-muted">{question.description.substring(0, 100)}...</div>
                            </div>
                            <div className="text-end">
                              <Badge color="secondary">{question.type}</Badge>
                              <div className="small text-muted">{q.points} pts</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div key={qIndex} className="mb-2 p-2 bg-light text-muted">
                          Question not found (ID: {q.questionId})
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            // Simple test preview
            <div>
              <h6 className="mb-3">All Questions ({testData.questions.length})</h6>
              {testData.questions.map((q, index) => {
                const question = questions.find(qq => qq._id === q.questionId);
                return question ? (
                  <div key={index} className="mb-3 p-3 border rounded">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6>{question.title}</h6>
                        <p className="text-muted mb-2">{question.description}</p>
                        <div>
                          <Badge color="info" className="me-2">{question.type}</Badge>
                          <Badge color="secondary" className="me-2">{question.skill}</Badge>
                          <Badge color="outline-primary">{question.difficulty}</Badge>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{q.points} pts</div>
                        <div className="small text-muted">~{Math.ceil((question.timeEstimate || 120) / 60)} min</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={index} className="mb-2 p-2 bg-light text-muted">
                    Question not found (ID: {q.questionId})
                  </div>
                );
              })}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Navigation */}
      <div className="d-flex justify-content-between pt-3 border-top">
        <Button color="secondary" onClick={onPrevious}>
          Previous: Add Questions
        </Button>
        <div>
          <Button color="outline-primary" className="me-2" onClick={handleSaveDraft}>
            Save as Draft
          </Button>
          <Button 
            color="success" 
            onClick={handlePublish}
            disabled={!validation.valid}
          >
            Publish Test
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPublish;