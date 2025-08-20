import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Badge,
  Collapse,
  InputGroup,
  InputGroupText,
  Spinner
} from 'reactstrap';
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Users,
  RotateCcw,
  Eye,
  CheckCircle,
  Layers,
  FileText,
  Timer,
  Settings,
  AlertTriangle,
  Info,
  Zap,
  Target,
  BookOpen,
  TrendingUp,
  Shield,
  HelpCircle
} from 'lucide-react';

// Import types and services
import type { WizardStepProps } from '../../types/createTest';
import type { TestType, Language, Tags } from '../../types';
import apiService from '../../services/ApiService';

// Interfaces for component state
interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

interface TimeSuggestion {
  type: 'success' | 'warning' | 'info';
  message: string;
}

interface TestRecommendations {
  timeLimit: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  useSections: boolean;
}

interface QuestionStats {
  byLanguage: Array<{
    language: string;
    count: number;
    difficultyBreakdown: {
      easy: number;
      medium: number;
      hard: number;
    };
  }>;
  totals: {
    totalQuestions: number;
    difficultyBreakdown: {
      easy: number;
      medium: number;
      hard: number;
    };
    typeBreakdown: {
      multipleChoice: number;
      trueFalse: number;
      codeChallenge: number;
      codeDebugging: number;
    };
  };
}

const TestStructure: React.FC<WizardStepProps> = ({
  testData,
  setTestData,
  onNext,
  onPrevious,
  setError
}) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [availableQuestions, setAvailableQuestions] = useState<number>(0);
  const [difficultyDistribution, setDifficultyDistribution] = useState<DifficultyDistribution>({
    easy: 40,
    medium: 40, 
    hard: 20
  });
  const [questionStats, setQuestionStats] = useState<QuestionStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Fetch real question statistics
  useEffect(() => {
    const fetchQuestionStats = async () => {
      try {
        setLoadingStats(true);
        const response = await apiService.getQuestionStats();
        
        if (response.error || !response.data) {
          console.error('Failed to fetch question stats:', response.message);
          return;
        }

        setQuestionStats(response.data);
        
        // Update difficulty distribution based on real data
        const { difficultyBreakdown } = response.data.totals;
        const total = difficultyBreakdown.easy + difficultyBreakdown.medium + difficultyBreakdown.hard;
        
        if (total > 0) {
          setDifficultyDistribution({
            easy: Math.round((difficultyBreakdown.easy / total) * 100),
            medium: Math.round((difficultyBreakdown.medium / total) * 100),
            hard: Math.round((difficultyBreakdown.hard / total) * 100)
          });
        }
      } catch (error) {
        console.error('Error fetching question stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchQuestionStats();
  }, []);

  // Calculate available questions and estimated duration based on test configuration
  useEffect(() => {
    const calculateAvailableQuestions = async () => {
      if (!testData.languages?.length && !testData.tags?.length) {
        setAvailableQuestions(0);
        setEstimatedDuration(0);
        return;
      }

      try {
        // Build query parameters based on test configuration
        const params: Record<string, string> = {
          status: 'active'
        };

        // If we have specific languages selected, count questions for those languages
        if (testData.languages?.length > 0) {
          // For now, we'll estimate by getting count for primary language
          // TODO: Backend could support multiple language filtering
          params.language = testData.languages[0];
        }

        const response = await apiService.getPaginatedQuestions(params);
        
        if (!response.error && response.data) {
          const questionCount = response.data.totalCount || 0;
          setAvailableQuestions(questionCount);
          
          // Calculate estimated duration based on real question count and difficulty
          const baseTimePerQuestion = 2; // minutes
          const difficultyMultipliers = {
            easy: 1,
            medium: 1.5,
            hard: 2.5
          };
          
          const weightedTime = questionCount * (
            (difficultyDistribution.easy / 100 * baseTimePerQuestion * difficultyMultipliers.easy) +
            (difficultyDistribution.medium / 100 * baseTimePerQuestion * difficultyMultipliers.medium) +
            (difficultyDistribution.hard / 100 * baseTimePerQuestion * difficultyMultipliers.hard)
          );
          
          setEstimatedDuration(Math.ceil(weightedTime));
        }
      } catch (error) {
        console.error('Error calculating available questions:', error);
      }
    };

    calculateAvailableQuestions();
  }, [testData.languages, testData.tags, difficultyDistribution]);

  const handleSettingChange = (field: keyof typeof testData.settings, value: boolean | number): void => {
    const newSettings = {
      ...testData.settings,
      [field]: value
    };

    // Auto-adjust time limit based on structure change
    if (field === 'useSections' && value === true && newSettings.timeLimit) {
      // When switching to sections, suggest distributing time across sections
      newSettings.timeLimit = Math.ceil(newSettings.timeLimit * 0.8);
    }

    setTestData({
      ...testData,
      settings: newSettings,
      // Clear existing sections/questions when switching types
      sections: value === true ? [] : testData.sections,
      questions: value === false ? [] : testData.questions
    });
  };

  const handleTestTypeChange = (useSections: boolean): void => {
    handleSettingChange('useSections', useSections);
  };

  const applyRecommendedSettings = (): void => {
    const template = testData.testType;
    
    // Base recommendations on real available questions
    const baseTimeLimit = availableQuestions > 0 ? 
      Math.max(30, Math.min(120, availableQuestions * 2.5)) : 
      45;

    const recommendations: Record<TestType, TestRecommendations> = {
      'frontend_basics': {
        timeLimit: Math.max(45, baseTimeLimit),
        attemptsAllowed: 2,
        shuffleQuestions: true,
        useSections: true
      },
      'react_developer': {
        timeLimit: Math.max(60, baseTimeLimit),
        attemptsAllowed: 2,
        shuffleQuestions: true,
        useSections: true
      },
      'fullstack_js': {
        timeLimit: Math.max(90, baseTimeLimit),
        attemptsAllowed: 1,
        shuffleQuestions: true,
        useSections: true
      },
      'mobile_development': {
        timeLimit: Math.max(75, baseTimeLimit),
        attemptsAllowed: 2,
        shuffleQuestions: true,
        useSections: true
      },
      'python_developer': {
        timeLimit: Math.max(60, baseTimeLimit),
        attemptsAllowed: 2,
        shuffleQuestions: false,
        useSections: false
      },
      'custom': {
        timeLimit: estimatedDuration || baseTimeLimit,
        attemptsAllowed: 1,
        shuffleQuestions: false,
        useSections: false
      }
    };

    const recommended = recommendations[template] || recommendations.custom;
    
    setTestData({
      ...testData,
      settings: {
        ...testData.settings,
        ...recommended
      }
    });
  };

  const validateStep = (): boolean => {
    if (testData.settings?.useSections === undefined) {
      setError('Please choose a test structure (Single Test or Sectioned Test)');
      return false;
    }

    if (!testData.settings?.timeLimit || testData.settings.timeLimit <= 0) {
      setError('Time limit must be greater than 0');
      return false;
    }

    if (!testData.settings?.attemptsAllowed || testData.settings.attemptsAllowed <= 0) {
      setError('Attempts allowed must be greater than 0');
      return false;
    }

    if (testData.settings.attemptsAllowed > 10) {
      setError('Maximum 10 attempts allowed');
      return false;
    }

    if (testData.settings.timeLimit > 480) {
      setError('Time limit cannot exceed 8 hours (480 minutes)');
      return false;
    }

    if (testData.settings.timeLimit < 5) {
      setError('Time limit should be at least 5 minutes');
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = (): void => {
    if (validateStep()) {
      onNext?.();
    }
  };

  const getTimeLimitSuggestion = (): TimeSuggestion => {
    const timeLimit = testData.settings?.timeLimit || 0;
    const estimated = estimatedDuration;
    
    if (estimated === 0) {
      return { type: 'info', message: 'Configure test content first' };
    }
    
    if (timeLimit < estimated * 0.8) {
      return { type: 'warning', message: 'May be too short for thorough completion' };
    } else if (timeLimit > estimated * 1.5) {
      return { type: 'info', message: 'Generous time allowance' };
    } else {
      return { type: 'success', message: 'Good time balance' };
    }
  };

  const getQuestionAvailability = (): string => {
    if (loadingStats) return 'Loading...';
    if (!testData.languages?.length && !testData.tags?.length) {
      return 'Select languages/topics first';
    }
    if (availableQuestions === 0) {
      return 'No questions available for this configuration';
    }
    return `${availableQuestions} questions available`;
  };

  const timeSuggestion = getTimeLimitSuggestion();

  return (
    <div>
      <Row>
        <Col lg={8}>
          {/* Quick Setup Card */}
          <Card className="border-0 shadow-sm mb-4 bg-light">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1 d-flex align-items-center">
                    <Zap size={20} className="me-2 text-warning" />
                    Quick Setup
                  </h6>
                  <small className="text-muted">
                    Apply recommended settings for {testData.testType?.replace('_', ' ') || 'your test type'}
                  </small>
                </div>
                <Button
                  color="warning"
                  outline
                  onClick={applyRecommendedSettings}
                  className="d-flex align-items-center"
                >
                  <Settings size={16} className="me-1" />
                  Apply Recommended
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Available Questions Alert */}
          {(testData.languages?.length > 0 || testData.tags?.length > 0) && (
            <Alert color={availableQuestions > 0 ? "success" : "warning"} className="mb-4">
              <div className="d-flex align-items-center">
                <Target size={16} className="me-2" />
                <div>
                  <strong>Question Availability:</strong>
                  <div className="mt-1 small">
                    {loadingStats ? (
                      <span className="d-flex align-items-center">
                        <Spinner size="sm" className="me-2" />
                        Checking available questions...
                      </span>
                    ) : (
                      <>
                        {getQuestionAvailability()}
                        {estimatedDuration > 0 && (
                          <span className="ms-3">
                            • Estimated test duration: <strong>{estimatedDuration} minutes</strong>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Alert>
          )}

          {/* Test Structure Selection */}
          <Card className="border-0 shadow-sm mb-4">
            <CardBody>
              <CardTitle tag="h6" className="d-flex align-items-center mb-3">
                <Layers size={20} className="me-2" />
                Test Structure
              </CardTitle>

              <FormGroup>
                <Label className="fw-bold mb-3">Choose your test structure:</Label>
                
                <Row className="g-3">
                  {/* Single Section Option */}
                  <Col md={6}>
                    <Card 
                      className={`border-2 h-100 cursor-pointer ${
                        testData.settings?.useSections === false ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                      }`}
                      onClick={() => handleTestTypeChange(false)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      <CardBody className="text-center">
                        <div className="mb-3">
                          <FileText 
                            size={48} 
                            className={testData.settings?.useSections === false ? 'text-primary' : 'text-muted'} 
                          />
                        </div>
                        <h6 className="mb-2">Single Test</h6>
                        <p className="text-muted small mb-3">
                          One continuous test with a single timer for all questions
                        </p>
                        <div className="d-flex flex-column gap-2">
                          <Badge color="info" className="d-flex align-items-center justify-content-center">
                            <Timer size={12} className="me-1" />
                            One timer for entire test
                          </Badge>
                          <Badge color="secondary" className="d-flex align-items-center justify-content-center">
                            <Target size={12} className="me-1" />
                            Simple navigation
                          </Badge>
                          <Badge color="success" className="d-flex align-items-center justify-content-center">
                            <BookOpen size={12} className="me-1" />
                            Best for linear tests
                          </Badge>
                        </div>
                        {testData.settings?.useSections === false && (
                          <div className="mt-2">
                            <Badge color="primary">
                              <CheckCircle size={12} className="me-1" />
                              Selected
                            </Badge>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </Col>

                  {/* Multiple Sections Option */}
                  <Col md={6}>
                    <Card 
                      className={`border-2 h-100 cursor-pointer ${
                        testData.settings?.useSections === true ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                      }`}
                      onClick={() => handleTestTypeChange(true)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      <CardBody className="text-center">
                        <div className="mb-3">
                          <Layers 
                            size={48} 
                            className={testData.settings?.useSections === true ? 'text-primary' : 'text-muted'} 
                          />
                        </div>
                        <h6 className="mb-2">Sectioned Test</h6>
                        <p className="text-muted small mb-3">
                          Multiple sections, each with its own timer and questions
                        </p>
                        <div className="d-flex flex-column gap-2">
                          <Badge color="warning" className="d-flex align-items-center justify-content-center">
                            <Timer size={12} className="me-1" />
                            Individual section timers
                          </Badge>
                          <Badge color="info" className="d-flex align-items-center justify-content-center">
                            <Layers size={12} className="me-1" />
                            Organized by topics
                          </Badge>
                          <Badge color="success" className="d-flex align-items-center justify-content-center">
                            <TrendingUp size={12} className="me-1" />
                            Better analytics
                          </Badge>
                        </div>
                        {testData.settings?.useSections === true && (
                          <div className="mt-2">
                            <Badge color="primary">
                              <CheckCircle size={12} className="me-1" />
                              Selected
                            </Badge>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </FormGroup>

              {/* Structure Explanation */}
              {testData.settings?.useSections !== undefined ? (
                <Alert color="info" className="mt-3">
                  <div className="d-flex align-items-start">
                    <div className="me-2">
                      {testData.settings.useSections ? <Layers size={16} /> : <FileText size={16} />}
                    </div>
                    <div>
                      <strong>
                        {testData.settings.useSections ? 'Sectioned Test Selected' : 'Single Test Selected'}
                      </strong>
                      <div className="mt-1 small">
                        {testData.settings.useSections 
                          ? 'You can create multiple sections (e.g., "JavaScript Basics", "React Components") with different time limits for each section. Students will see progress through sections and can\'t go back to previous sections once time expires.'
                          : 'All questions will be in one continuous test with a single timer. Students can navigate freely between questions within the time limit.'
                        }
                      </div>
                    </div>
                  </div>
                </Alert>
              ) : (
                <Alert color="warning" className="mt-3">
                  <div className="d-flex align-items-start">
                    <div className="me-2">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <strong>Choose Your Test Structure</strong>
                      <div className="mt-1 small">
                        Please select either a Single Test or Sectioned Test to continue. This choice will determine how questions are organized and timed.
                      </div>
                    </div>
                  </div>
                </Alert>
              )}
            </CardBody>
          </Card>

          {/* Core Settings */}
          <Card className="border-0 shadow-sm mb-4">
            <CardBody>
              <CardTitle tag="h6" className="d-flex align-items-center mb-3">
                <Settings size={20} className="me-2" />
                Core Settings
              </CardTitle>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label htmlFor="timeLimit" className="fw-bold">
                      <Clock size={16} className="me-1" />
                      {testData.settings?.useSections ? 'Default Section Time (minutes)' : 'Total Time Limit (minutes)'}
                      <span className="text-danger">*</span>
                    </Label>
                    <InputGroup>
                      <Input
                        type="number"
                        id="timeLimit"
                        min="5"
                        max="480"
                        value={testData.settings?.timeLimit || ''}
                        onChange={(e) => handleSettingChange('timeLimit', parseInt(e.target.value) || 0)}
                        placeholder="Enter time in minutes"
                      />
                      <InputGroupText>
                        <Clock size={14} />
                      </InputGroupText>
                    </InputGroup>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <small className="text-muted">
                        {testData.settings?.useSections 
                          ? 'Default time limit for new sections (can be customized per section)'
                          : 'Total time students have to complete the entire test'
                        }
                      </small>
                      {timeSuggestion && (
                        <Badge color={timeSuggestion.type} size="sm">
                          {timeSuggestion.message}
                        </Badge>
                      )}
                    </div>
                    {estimatedDuration > 0 && (
                      <small className="text-info">
                        <Info size={12} className="me-1" />
                        Estimated duration: {estimatedDuration} minutes
                      </small>
                    )}
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label htmlFor="attemptsAllowed" className="fw-bold">
                      <RotateCcw size={16} className="me-1" />
                      Attempts Allowed
                      <span className="text-danger">*</span>
                    </Label>
                    <InputGroup>
                      <Input
                        type="number"
                        id="attemptsAllowed"
                        min="1"
                        max="10"
                        value={testData.settings?.attemptsAllowed || ''}
                        onChange={(e) => handleSettingChange('attemptsAllowed', parseInt(e.target.value) || 0)}
                        placeholder="How many attempts?"
                      />
                      <InputGroupText>
                        <Users size={14} />
                      </InputGroupText>
                    </InputGroup>
                    <small className="text-muted">
                      How many times students can take this test (1-10)
                    </small>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Additional Settings */}
          <Card className="border-0 shadow-sm mb-4">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <CardTitle tag="h6" className="mb-0 d-flex align-items-center">
                  <Shield size={20} className="me-2" />
                  Test Behavior
                </CardTitle>
                <Button
                  color="outline-secondary"
                  size="sm"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                >
                  {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
                </Button>
              </div>

              <Row>
                <Col md={6}>
                  <FormGroup check className="mb-3">
                    <Input
                      type="checkbox"
                      id="shuffleQuestions"
                      checked={testData.settings?.shuffleQuestions || false}
                      onChange={(e) => handleSettingChange('shuffleQuestions', e.target.checked)}
                    />
                    <Label check htmlFor="shuffleQuestions" className="fw-bold">
                      <RotateCcw size={16} className="me-1" />
                      Shuffle Questions
                    </Label>
                    <div className="text-muted small">
                      {testData.settings?.useSections 
                        ? 'Randomize question order within each section'
                        : 'Randomize the order of all questions'
                      }
                    </div>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center">
                    <HelpCircle size={16} className="me-2 text-muted" />
                    <small className="text-muted">
                      Shuffling helps prevent cheating and ensures fair assessment
                    </small>
                  </div>
                </Col>
              </Row>

              {/* Advanced Settings Collapse */}
              <Collapse isOpen={showAdvancedSettings}>
                <hr />
                <Row>
                  <Col md={12}>
                    <h6 className="mb-3">Question Distribution Insights</h6>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    {questionStats && (
                      <div>
                        <Label className="fw-bold">Available Question Distribution</Label>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="small">Easy Questions</span>
                            <span className="small">{questionStats.totals.difficultyBreakdown.easy} ({difficultyDistribution.easy}%)</span>
                          </div>
                          <div className="progress mb-2" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${difficultyDistribution.easy}%` }}
                            />
                          </div>
                          
                          <div className="d-flex justify-content-between mb-1">
                            <span className="small">Medium Questions</span>
                            <span className="small">{questionStats.totals.difficultyBreakdown.medium} ({difficultyDistribution.medium}%)</span>
                          </div>
                          <div className="progress mb-2" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-warning" 
                              style={{ width: `${difficultyDistribution.medium}%` }}
                            />
                          </div>
                          
                          <div className="d-flex justify-content-between mb-1">
                            <span className="small">Hard Questions</span>
                            <span className="small">{questionStats.totals.difficultyBreakdown.hard} ({difficultyDistribution.hard}%)</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-danger" 
                              style={{ width: `${difficultyDistribution.hard}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </Col>
                  <Col md={6}>
                    <Alert color="info" className="mb-0">
                      <Info size={16} className="me-2" />
                      <strong>Question Distribution</strong>
                      <div className="mt-1 small">
                        This shows the actual distribution of questions available in your question bank. 
                        Time estimates are based on these real numbers.
                      </div>
                    </Alert>
                  </Col>
                </Row>
              </Collapse>
            </CardBody>
          </Card>
        </Col>

        {/* Enhanced Settings Summary Sidebar */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm sticky-top">
            <CardBody>
              <CardTitle tag="h6" className="d-flex align-items-center mb-3">
                <Eye size={20} className="me-2" />
                Configuration Summary
              </CardTitle>

              {/* Test Overview */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">Test Type:</span>
                  <Badge color="info">
                    {testData.testType?.replace('_', ' ').toUpperCase() || 'CUSTOM'}
                  </Badge>
                </div>
                
                {testData.settings?.useSections !== undefined ? (
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Structure:</span>
                    <Badge color={testData.settings.useSections ? "primary" : "success"}>
                      {testData.settings.useSections ? (
                        <>
                          <Layers size={12} className="me-1" />
                          Sectioned
                        </>
                      ) : (
                        <>
                          <FileText size={12} className="me-1" />
                          Single
                        </>
                      )}
                    </Badge>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Structure:</span>
                    <Badge color="warning">Not Selected</Badge>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">Languages:</span>
                  <Badge color="secondary" pill>
                    {testData.languages?.length || 0}
                  </Badge>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">Topics:</span>
                  <Badge color="secondary" pill>
                    {testData.tags?.length || 0}
                  </Badge>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Available Questions:</span>
                  <Badge color={availableQuestions > 0 ? "success" : "warning"} pill>
                    {loadingStats ? <Spinner size="sm" /> : availableQuestions}
                  </Badge>
                </div>
              </div>

              <hr />

              {/* Settings Details */}
              <div className="mb-3">
                <Label className="fw-bold mb-2">Settings:</Label>
                <div className="small">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Time Limit:</span>
                    <div className="text-end">
                      <Badge color="warning">
                        <Clock size={12} className="me-1" />
                        {testData.settings?.timeLimit || 0} min
                      </Badge>
                      {timeSuggestion && (
                        <div className="mt-1">
                          <Badge color={timeSuggestion.type} size="sm">
                            {timeSuggestion.type === 'success' ? '✓' : timeSuggestion.type === 'warning' ? '⚠' : 'ℹ'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Attempts:</span>
                    <Badge color="info">
                      <Users size={12} className="me-1" />
                      {testData.settings?.attemptsAllowed || 1}
                    </Badge>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Shuffle Questions:</span>
                    <Badge color={testData.settings?.shuffleQuestions ? "success" : "secondary"}>
                      {testData.settings?.shuffleQuestions ? "Yes" : "No"}
                    </Badge>
                  </div>

                  {estimatedDuration > 0 && (
                    <div className="d-flex justify-content-between">
                      <span>Est. Duration:</span>
                      <Badge color="info" outline>
                        ~{estimatedDuration} min
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <hr />

              {/* Real-time Stats */}
              {questionStats && (
                <div className="mb-3">
                  <Label className="fw-bold mb-2">Question Bank Stats:</Label>
                  <div className="small">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Total Questions:</span>
                      <Badge color="primary" pill>
                        {questionStats.totals.totalQuestions}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Multiple Choice:</span>
                      <Badge color="secondary" outline pill>
                        {questionStats.totals.typeBreakdown.multipleChoice}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Code Challenges:</span>
                      <Badge color="secondary" outline pill>
                        {questionStats.totals.typeBreakdown.codeChallenge}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Languages Covered:</span>
                      <Badge color="info" pill>
                        {questionStats.byLanguage.length}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <hr />

              {/* Recommendations */}
              <div className="mb-3">
                <Label className="fw-bold mb-2">Recommendations:</Label>
                <div className="small">
                  {testData.testType && testData.testType !== 'custom' && (
                    <Alert color="success" className="py-2 mb-2">
                      <CheckCircle size={14} className="me-1" />
                      Template-based recommendations available
                    </Alert>
                  )}
                  
                  {testData.settings?.useSections === true && (
                    <Alert color="info" className="py-2 mb-2">
                      <Layers size={14} className="me-1" />
                      Sectioned tests provide better analytics
                    </Alert>
                  )}

                  {(testData.settings?.timeLimit || 0) < 30 && (
                    <Alert color="warning" className="py-2 mb-2">
                      <AlertTriangle size={14} className="me-1" />
                      Consider longer time for thorough assessment
                    </Alert>
                  )}

                  {(testData.settings?.attemptsAllowed || 0) > 3 && (
                    <Alert color="info" className="py-2 mb-2">
                      <Info size={14} className="me-1" />
                      Multiple attempts may reduce assessment value
                    </Alert>
                  )}

                  {availableQuestions === 0 && (testData.languages?.length > 0 || testData.tags?.length > 0) && (
                    <Alert color="warning" className="py-2 mb-2">
                      <AlertTriangle size={14} className="me-1" />
                      No questions available for current selection
                    </Alert>
                  )}

                  {availableQuestions > 0 && availableQuestions < 10 && (
                    <Alert color="warning" className="py-2 mb-2">
                      <AlertTriangle size={14} className="me-1" />
                      Limited questions available ({availableQuestions})
                    </Alert>
                  )}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mb-3">
                <Label className="fw-bold mb-2">Setup Progress:</Label>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ 
                      width: `${testData.settings?.useSections !== undefined ? 50 : 25}%` 
                    }}
                  ></div>
                </div>
                <small className="text-muted">
                  Structure: {testData.settings?.useSections !== undefined ? '✓' : '○'} | 
                  Settings: {testData.settings?.timeLimit && testData.settings?.attemptsAllowed ? '✓' : '○'}
                </small>
              </div>

              {/* Next Steps */}
              <Alert color="light" className="mb-3">
                <strong>Next Step:</strong>
                <div className="mt-1 small">
                  {testData.settings?.useSections 
                    ? 'Configure your test sections with names and individual time limits'
                    : 'Add questions directly to your test'
                  }
                </div>
              </Alert>

              {/* Quick Actions */}
              <div className="d-grid gap-2">
                <Button
                  color="outline-warning"
                  size="sm"
                  onClick={applyRecommendedSettings}
                  className="d-flex align-items-center justify-content-center"
                  disabled={loadingStats}
                >
                  <Zap size={14} className="me-1" />
                  Apply Recommended Settings
                </Button>
                
                {testData.settings?.useSections !== undefined && (
                  <small className="text-center text-muted">
                    {testData.settings.useSections 
                      ? `Ready for ${Math.ceil((testData.settings?.timeLimit || 45) / 15)} sections`
                      : 'Ready for question assignment'
                    }
                  </small>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Validation Alerts */}
      {testData.settings?.timeLimit && testData.settings?.attemptsAllowed && (
        <Row className="mt-3">
          <Col>
            <Alert color="success" className="d-flex align-items-center">
              <CheckCircle size={16} className="me-2" />
              <div>
                <strong>Configuration Complete!</strong>
                <div className="small mt-1">
                  Your test is configured for {testData.settings.useSections ? 'sectioned' : 'single'} delivery 
                  with {testData.settings.timeLimit} minutes and {testData.settings.attemptsAllowed} attempt(s) allowed.
                  {availableQuestions > 0 && (
                    <span className="ms-2">
                      {availableQuestions} questions ready for assignment.
                    </span>
                  )}
                </div>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Navigation */}
      <div className="d-flex justify-content-between mt-4">
        <Button
          color="secondary"
          onClick={onPrevious}
          className="d-flex align-items-center"
        >
          <ArrowLeft size={16} className="me-1" />
          Previous: Test Basics
        </Button>
        <Button
          color="primary"
          onClick={handleNext}
          className="d-flex align-items-center"
          disabled={testData.settings?.useSections === undefined}
        >
          Next: {testData.settings?.useSections ? 'Configure Sections' : 'Add Questions'}
          <ArrowRight size={16} className="ms-1" />
        </Button>
      </div>
    </div>
  );
};

export default TestStructure;