import React, { useState, useMemo, useCallback } from 'react';
import {
  Row,
  Col,
  InputGroup,
  Input,
  Button,
  ListGroup,
  ListGroupItem,
  Badge,
  Spinner,
  FormGroup,
  Label,
  ButtonGroup,
  Card,
  CardBody,
  Collapse,
  Alert,
  InputGroupText
} from 'reactstrap';

import type { InputProps } from 'reactstrap';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Zap,
  BarChart3,
  Target,
  Globe,
  Building,
  CheckCircle,
  Plus,
  CheckSquare,
  Square
} from 'lucide-react';
import type { Question, QuestionType, Difficulty, Language, Tags } from '../../types';
import type { CreateTestData } from '../../types/createTest';
import type { ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

type QuickFilter = 'recommended' | 'popular' | 'high-success' | 'all';
type QuestionId = string;

interface QuestionBrowserProps {
  loading: boolean;
  questions: Question[];
  filteredQuestions: Question[];
  testData: CreateTestData;
  selectedSectionIndex: number;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filterType: QuestionType | '';
  setFilterType: React.Dispatch<React.SetStateAction<QuestionType | ''>>;
  filterDifficulty: Difficulty | '';
  setFilterDifficulty: React.Dispatch<React.SetStateAction<Difficulty | ''>>;
  filterLanguage: Language | '';
  setFilterLanguage: React.Dispatch<React.SetStateAction<Language | ''>>;
  filterTag: Tags | '';
  setFilterTag: React.Dispatch<React.SetStateAction<Tags | ''>>;
  setSelectedSectionIndex: React.Dispatch<React.SetStateAction<number>>;
  onToggleQuestion?: (questionId: QuestionId) => void;
  onAssignAll?: () => void;
  onClear?: () => void;
}

const QuestionBrowser: React.FC<QuestionBrowserProps> = ({
  loading,
  questions,
  filteredQuestions,
  testData,
  selectedSectionIndex,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterDifficulty,
  setFilterDifficulty,
  filterLanguage,
  setFilterLanguage,
  filterTag,
  setFilterTag,
  setSelectedSectionIndex,
  onToggleQuestion,
  onAssignAll,
  onClear,
}) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [bulkSelection, setBulkSelection] = useState<QuestionId[]>([]);

  const noop = () => {};
  const handleToggle = onToggleQuestion ?? noop;
  const handleAssignAll = onAssignAll ?? noop;
  const handleClear = onClear ?? noop;

  const selectedCount = testData.settings.useSections
    ? testData.sections[selectedSectionIndex]?.questions.length || 0
    : testData.questions.length;

  // Memoized color functions for better performance
  const getDifficultyColor = useCallback((difficulty?: Difficulty): string => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'secondary';
    }
  }, []);

  const getLanguageColor = useCallback((language?: Language): string => {
    const colors: Record<Language, string> = {
      javascript: 'warning',
      react: 'info',
      css: 'primary',
      html: 'danger',
      python: 'success',
      typescript: 'dark',
      dart: 'info',
      flutter: 'primary',
      express: 'secondary',
      reactNative: 'info',
      sql: 'warning',
      json: 'light'
    };
    return colors[language || 'javascript'] || 'secondary';
  }, []);

  const getTypeColor = useCallback((type?: QuestionType): string => {
    switch (type) {
      case 'multipleChoice': return 'primary';
      case 'trueFalse': return 'info';
      case 'codeChallenge': return 'success';
      case 'codeDebugging': return 'warning';
      default: return 'secondary';
    }
  }, []);

  const getSuccessRateColor = useCallback((rate: number): string => {
    if (rate >= 0.8) return 'success';
    if (rate >= 0.6) return 'warning';
    return 'danger';
  }, []);

  // Fixed clear function to clear all filters properly
  const clearAllFilters = useCallback((): void => {
    setSearchTerm('');
    setFilterType('');
    setFilterDifficulty('');
    setFilterLanguage('');
    setFilterTag('');
    setQuickFilter('all');
    setBulkSelection([]);
  }, [setSearchTerm, setFilterType, setFilterDifficulty, setFilterLanguage, setFilterTag]);

  // Implement quick filter logic that was missing
  const applyQuickFilter = useCallback((question: Question): boolean => {
    switch (quickFilter) {
      case 'recommended':
        // Very lenient recommended filter - basically show all questions that could be relevant
        // If no languages/tags are selected for the test, show all questions
        if (!testData.languages.length && !testData.tags.length) {
          return true;
        }
        
        // If question has no language or tags, still include it (it could be universal)
        const matchesLanguage = !testData.languages.length || 
          !question.language || 
          testData.languages.includes(question.language);
        const matchesTags = !testData.tags.length || 
          !question.tags?.length ||
          question.tags.some(tag => testData.tags.includes(tag));
        
        return matchesLanguage || matchesTags; // Use OR instead of AND to be more inclusive
      
      case 'popular':
        // Popular questions: used more than 5 times
        return (question.usageStats?.timesUsed ?? 0) >= 5;
      
      case 'high-success':
        // High success rate: 70% or higher success rate
        return (question.usageStats?.successRate ?? 0) >= 0.7;
      
      case 'all':
      default:
        return true;
    }
  }, [quickFilter, testData.languages, testData.tags]);

  // Apply quick filter to the questions - work with the parent's filtered results
  const quickFilteredQuestions = useMemo(() => {
    if (quickFilter === 'all') {
      // For 'all', just return the filtered questions from parent
      return filteredQuestions;
    }
    
    // For other quick filters, apply additional filtering on top of parent filters
    return filteredQuestions.filter(applyQuickFilter);
  }, [filteredQuestions, quickFilter, applyQuickFilter]);

  // Bulk selection functions
  const handleBulkToggle = useCallback((questionId: string, isChecked: boolean) => {
    setBulkSelection(prev => 
      isChecked 
        ? [...prev, questionId]
        : prev.filter(id => id !== questionId)
    );
  }, []);

  const handleSelectAllVisible = useCallback(() => {
    const visibleIds = quickFilteredQuestions.map(q => q.id);
    setBulkSelection(visibleIds);
  }, [quickFilteredQuestions]);

  const handleClearBulkSelection = useCallback(() => {
    setBulkSelection([]);
  }, []);

  // Check if question is selected anywhere in the test (any section or main questions)
  const isQuestionSelected = useCallback((questionId: string): boolean => {
    if (testData.settings.useSections) {
      // Check ALL sections, not just the current one
      return testData.sections.some(section =>
        section.questions.some(q => q.questionId === questionId)
      );
    }
    return testData.questions.some(q => q.questionId === questionId);
  }, [testData]);

  // Check if question is in the currently selected section specifically
  const isQuestionInCurrentSection = useCallback((questionId: string): boolean => {
    if (!testData.settings.useSections) {
      return isQuestionSelected(questionId);
    }
    
    const currentSection = testData.sections[selectedSectionIndex];
    return currentSection?.questions.some(q => q.questionId === questionId) || false;
  }, [testData, selectedSectionIndex, isQuestionSelected]);

  // Enhanced bulk selection to prevent duplicates
  const handleAssignBulkQuestions = useCallback(() => {
    if (!isAuthenticated || !user || !['admin', 'instructor'].includes(user.role)) {
      return;
    }
    
    // Filter out questions that are already in the test
    const questionsToAdd = bulkSelection.filter(questionId => !isQuestionSelected(questionId));
    
    questionsToAdd.forEach(questionId => {
      handleToggle(questionId);
    });
    
    // Show feedback if some questions were skipped
    if (questionsToAdd.length < bulkSelection.length) {
      const skippedCount = bulkSelection.length - questionsToAdd.length;
      console.warn(`Skipped ${skippedCount} question(s) already in test`);
    }
    
    setBulkSelection([]);
  }, [isAuthenticated, user, bulkSelection, handleToggle, isQuestionSelected]);

  // Fixed event handlers with proper typing
  const handleSectionChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSelectedSectionIndex(parseInt(e.target.value));
  }, [setSelectedSectionIndex]);

  const handleLanguageChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilterLanguage(e.target.value as Language | '');
  }, [setFilterLanguage]);

  const handleTypeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilterType(e.target.value as QuestionType | '');
  }, [setFilterType]);

  const handleDifficultyChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilterDifficulty(e.target.value as Difficulty | '');
  }, [setFilterDifficulty]);

  const handleTagChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilterTag(e.target.value as Tags | '');
  }, [setFilterTag]);

  return (
    <div>
      {authLoading ? (
        <div className="text-center p-4">
          <Spinner color="primary" />
          <p className="mt-2 text-muted">Checking authentication...</p>
        </div>
      ) : isAuthenticated && user && ['admin', 'instructor'].includes(user.role) ? (
        <>
          <div className="p-3 border-bottom bg-light">
            {/* Section Selector for sectioned tests */}
            {testData.settings.useSections && (
              <FormGroup className="mb-3">
                <Label htmlFor="sectionSelect" className="fw-bold">
                  Assign to Section
                </Label>
                <Input
                  type="select"
                  id="sectionSelect"
                  value={selectedSectionIndex}
                  onChange={handleSectionChange}
                  disabled={testData.sections.length === 0}
                  aria-label="Select section to assign questions to"
                >
                  {testData.sections.length > 0 ? (
                    testData.sections.map((section, index) => (
                      <option key={index} value={index}>
                        {section.name} ({section.questions.length} questions)
                      </option>
                    ))
                  ) : (
                    <option value={-1} disabled>No sections available</option>
                  )}
                </Input>
              </FormGroup>
            )}

            {/* Quick Filters - Now with working filter logic */}
            <div className="mb-3">
              <Label className="fw-bold mb-2">Quick Filters:</Label>
              <ButtonGroup className="d-flex flex-wrap" role="group" aria-label="Quick filter options">
                <Button
                  color={quickFilter === 'all' ? 'secondary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setQuickFilter('all')}
                  aria-pressed={quickFilter === 'all'}
                >
                  All Questions
                </Button>
                <Button
                  color={quickFilter === 'recommended' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setQuickFilter('recommended')}
                  aria-pressed={quickFilter === 'recommended'}
                >
                  <Zap size={14} className="me-1" />
                  Recommended
                </Button>
                <Button
                  color={quickFilter === 'popular' ? 'info' : 'outline-info'}
                  size="sm"
                  onClick={() => setQuickFilter('popular')}
                  aria-pressed={quickFilter === 'popular'}
                >
                  <BarChart3 size={14} className="me-1" />
                  Popular
                </Button>
                <Button
                  color={quickFilter === 'high-success' ? 'success' : 'outline-success'}
                  size="sm"
                  onClick={() => setQuickFilter('high-success')}
                  aria-pressed={quickFilter === 'high-success'}
                >
                  <Target size={14} className="me-1" />
                  High Success
                </Button>
              </ButtonGroup>
            </div>

            {/* Search and Filter Controls */}
            <Row className="mb-3">
              <Col md="6">
                <InputGroup>
                  <InputGroupText>
                    <Search size={16} aria-hidden="true" />
                  </InputGroupText>
                  <Input
                    type="text"
                    placeholder="Search questions, descriptions, tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search questions"
                  />
                </InputGroup>
              </Col>
              <Col md="3">
                <Button
                  color="outline-secondary"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-100"
                  aria-expanded={showAdvancedFilters}
                  aria-controls="advanced-filters"
                >
                  <Filter size={16} className="me-1" aria-hidden="true" />
                  Filters
                  {showAdvancedFilters ? 
                    <ChevronUp size={16} className="ms-1" aria-hidden="true" /> : 
                    <ChevronDown size={16} className="ms-1" aria-hidden="true" />
                  }
                </Button>
              </Col>
              <Col md="3">
                <Button
                  color="outline-secondary"
                  onClick={clearAllFilters}
                  className="w-100"
                  aria-label="Clear all filters"
                >
                  <RotateCcw size={16} className="me-1" aria-hidden="true" />
                  Clear Filters
                </Button>
              </Col>
            </Row>

            {/* Advanced Filters */}
            <Collapse isOpen={showAdvancedFilters} id="advanced-filters">
              <Card className="mb-3">
                <CardBody>
                  <Row>
                    <Col md="3">
                      <FormGroup>
                        <Label>Language:</Label>
                        <Input
                          type="select"
                          value={filterLanguage}
                          onChange={handleLanguageChange}
                          aria-label="Filter by programming language"
                        >
                          <option value="">All Languages</option>
                          {testData.languages.length > 0 ? (
                            testData.languages.map((lang: Language) => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))
                          ) : (
                            <option value="" disabled>No languages available</option>
                          )}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label>Question Type:</Label>
                        <Input
                          type="select"
                          value={filterType}
                          onChange={handleTypeChange}
                          aria-label="Filter by question type"
                        >
                          <option value="">All Types</option>
                          <option value="multipleChoice">Multiple Choice</option>
                          <option value="trueFalse">True/False</option>
                          <option value="codeChallenge">Code Challenge</option>
                          <option value="codeDebugging">Code Debugging</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label>Difficulty:</Label>
                        <Input
                          type="select"
                          value={filterDifficulty}
                          onChange={handleDifficultyChange}
                          aria-label="Filter by difficulty level"
                        >
                          <option value="">All Difficulties</option>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label>Tag:</Label>
                        <Input
                          type="select"
                          value={filterTag}
                          onChange={handleTagChange}
                          aria-label="Filter by topic tag"
                        >
                          <option value="">All Tags</option>
                          {testData.tags.length > 0 ? (
                            testData.tags.map((tag: Tags) => (
                              <option key={tag} value={tag}>{tag}</option>
                            ))
                          ) : (
                            <option value="" disabled>No tags available</option>
                          )}
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Collapse>

            {/* Results Summary and Actions */}
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">
                  {quickFilteredQuestions.length} questions found • {selectedCount} assigned to {testData.settings.useSections ? 'current section' : 'test'}
                  {testData.settings.useSections && (
                    <>
                      {' • '}
                      {testData.sections.reduce((total, section) => total + section.questions.length, 0)} total in test
                    </>
                  )}
                  {quickFilter !== 'all' && (
                    <Badge color="info" className="ms-2">
                      <Target size={12} className="me-1" aria-hidden="true" />
                      {quickFilter} filter active
                    </Badge>
                  )}
                  {(searchTerm || filterType || filterDifficulty || filterLanguage || filterTag) && (
                    <Badge color="warning" className="ms-2">
                      <Filter size={12} className="me-1" aria-hidden="true" />
                      Advanced filters active
                    </Badge>
                  )}
                </small>
              </div>
              <div>
                <Button 
                  size="sm" 
                  color="outline-primary" 
                  className="me-2" 
                  onClick={handleSelectAllVisible}
                  disabled={quickFilteredQuestions.length === 0}
                  aria-label={`Select all ${quickFilteredQuestions.length} visible questions`}
                >
                  <CheckSquare size={14} className="me-1" aria-hidden="true" />
                  Select All Visible
                </Button>
                <Button 
                  size="sm" 
                  color="outline-secondary" 
                  onClick={handleClear}
                  aria-label={testData.settings.useSections ? "Clear all assigned questions from test" : "Clear all assigned questions"}
                >
                  {testData.settings.useSections ? 'Clear All Test Questions' : 'Clear Assigned'}
                </Button>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div style={{ height: 'calc(100vh - 450px)', overflowY: 'auto' }} role="main" aria-label="Questions list">
            {loading ? (
              <div className="text-center p-4">
                <Spinner color="primary" />
                <p className="mt-2 text-muted">Loading questions...</p>
              </div>
            ) : quickFilteredQuestions.length === 0 ? (
              <div className="text-center p-4">
                <Alert color="warning" className="mb-0">
                  {testData.languages.length === 0 && testData.tags.length === 0
                    ? 'Select languages and tags first to see available questions'
                    : `No questions found for selected criteria. ${quickFilter !== 'all' ? 'Try a different quick filter or ' : ''}Try adjusting your filters.`
                  }
                </Alert>
              </div>
            ) : (
              <ListGroup flush>
                {quickFilteredQuestions.map((question) => {
                  const isSelected = isQuestionSelected(question.id);
                  const isInCurrentSection = isQuestionInCurrentSection(question.id);
                  const isBulkSelected = bulkSelection.includes(question.id);
                  const isDuplicate = testData.settings.useSections && isSelected && !isInCurrentSection;

                  return (
                    <ListGroupItem
                      key={question.id}
                      className={`border-0 border-bottom ${isInCurrentSection ? 'bg-light' : ''} ${isDuplicate ? 'bg-warning-subtle' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggle(question.id)}
                      role="article"
                      aria-label={`Question: ${question.title}${isDuplicate ? ' (already in another section)' : ''}`}
                    >
                      <div className="d-flex align-items-start">
                        {/* Assignment Checkbox */}
                        <div className="me-3 mt-1">
                          <Input
                            type="checkbox"
                            checked={isInCurrentSection}
                            onChange={() => handleToggle(question.id)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={isDuplicate}
                            aria-label={`${isInCurrentSection ? 'Remove' : 'Add'} question from current section: ${question.title}${isDuplicate ? ' (disabled - already in another section)' : ''}`}
                          />
                        </div>

                        <div className="flex-grow-1">
                          {/* Duplicate Warning */}
                          {isDuplicate && (
                            <div className="small text-warning mb-1 fw-bold">
                              <Target size={12} className="me-1" aria-hidden="true" />
                              Already assigned to another section
                            </div>
                          )}

                          {/* Question Title */}
                          <div className="fw-bold mb-1">{question.title}</div>
                          
                          {/* Question Description */}
                          <div className="small text-muted mb-2">
                            {question.description?.slice(0, 150) || 'No description available'}
                            {question.description && question.description.length > 150 && '...'}
                          </div>

                          {/* Badges Row */}
                          <div className="d-flex gap-1 flex-wrap mb-2" role="list" aria-label="Question attributes">
                            <Badge color={getTypeColor(question.type)} role="listitem">
                              {question.type.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                            
                            {question.language && (
                              <Badge color={getLanguageColor(question.language)} role="listitem">
                                {question.language}
                              </Badge>
                            )}
                            
                            {question.difficulty && (
                              <Badge color={getDifficultyColor(question.difficulty)} role="listitem">
                                {question.difficulty}
                              </Badge>
                            )}

                            {question.isGlobal ? (
                              <Badge color="info" outline role="listitem">
                                <Globe size={10} className="me-1" aria-hidden="true" />
                                Global
                              </Badge>
                            ) : (
                              <Badge color="secondary" outline role="listitem">
                                <Building size={10} className="me-1" aria-hidden="true" />
                                Organization
                              </Badge>
                            )}

                            {/* Section indicator for sectioned tests */}
                            {testData.settings.useSections && isSelected && (
                              <Badge 
                                color={isInCurrentSection ? "success" : "warning"} 
                                outline={!isInCurrentSection}
                                role="listitem"
                              >
                                {isInCurrentSection ? "Current Section" : "Other Section"}
                              </Badge>
                            )}
                          </div>

                          {/* Tags */}
                          {question.tags && question.tags.length > 0 && (
                            <div className="d-flex gap-1 flex-wrap mb-2" role="list" aria-label="Question tags">
                              {question.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} color="secondary" size="sm" role="listitem">
                                  {tag.replace(/-/g, ' ')}
                                </Badge>
                              ))}
                              {question.tags.length > 4 && (
                                <Badge color="secondary" size="sm" role="listitem">
                                  +{question.tags.length - 4} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Usage Stats */}
                          {question.usageStats && (
                            <div className="d-flex gap-3 small text-muted" role="list" aria-label="Question usage statistics">
                              <span role="listitem">Used: {question.usageStats.timesUsed || 0} times</span>
                              {question.usageStats.successRate !== undefined && (
                                <span role="listitem">
                                  Success: 
                                  <Badge 
                                    color={getSuccessRateColor(question.usageStats.successRate)} 
                                    size="sm" 
                                    className="ms-1"
                                  >
                                    {Math.round(question.usageStats.successRate * 100)}%
                                  </Badge>
                                </span>
                              )}
                              {question.usageStats.averageTime && (
                                <span role="listitem">Avg Time: {Math.round(question.usageStats.averageTime)}s</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        {isInCurrentSection && (
                          <div className="ms-2" aria-hidden="true">
                            <CheckCircle size={20} className="text-success" />
                          </div>
                        )}
                        
                        {/* Duplicate Indicator */}
                        {isDuplicate && (
                          <div className="ms-2" aria-hidden="true">
                            <Target size={20} className="text-warning" />
                          </div>
                        )}
                      </div>
                    </ListGroupItem>
                  );
                })}
              </ListGroup>
            )}
          </div>
        </>
      ) : (
        <Alert color="danger">
          <div className="d-flex align-items-center">
            <Target size={16} className="me-2" aria-hidden="true" />
            <div>
              <strong>Access Denied</strong>
              <div className="small mt-1">
                Only administrators and instructors can browse and assign questions to tests.
              </div>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default QuestionBrowser;