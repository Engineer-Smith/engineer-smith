import React, { useState } from 'react';
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
  Plus
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
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('recommended');
  const [bulkSelection, setBulkSelection] = useState<QuestionId[]>([]);

  const noop = () => {};
  const handleToggle = onToggleQuestion ?? noop;
  const handleAssignAll = onAssignAll ?? noop;
  const handleClear = onClear ?? noop;

  const selectedCount = testData.settings.useSections
    ? testData.sections[selectedSectionIndex]?.questions.length || 0
    : testData.questions.length;

  const getDifficultyColor = (difficulty?: Difficulty): string => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'secondary';
    }
  };

  const getLanguageColor = (language?: Language): string => {
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
  };

  const getTypeColor = (type?: QuestionType): string => {
    switch (type) {
      case 'multipleChoice': return 'primary';
      case 'trueFalse': return 'info';
      case 'codeChallenge': return 'success';
      case 'codeDebugging': return 'warning';
      default: return 'secondary';
    }
  };

  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 0.8) return 'success';
    if (rate >= 0.6) return 'warning';
    return 'danger';
  };

  const clearAllFilters = (): void => {
    setSearchTerm('');
    setFilterType('');
    setFilterDifficulty('');
    setFilterLanguage('');
    setFilterTag('');
    setQuickFilter('all');
  };

  const addBulkQuestions = (): void => {
    if (!isAuthenticated || !user || !['admin', 'instructor'].includes(user.role)) {
      return;
    }
    bulkSelection.forEach(questionId => {
      handleToggle(questionId);
    });
    setBulkSelection([]);
  };

  const isQuestionSelected = (questionId: string): boolean => {
    if (testData.settings.useSections) {
      return testData.sections.some(
        (s, index) =>
          index === selectedSectionIndex &&
          s.questions.some(q => q.questionId === questionId)
      );
    }
    return testData.questions.some(q => q.questionId === questionId);
  };

  const handleSectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSectionIndex(parseInt(e.target.value));
  };

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterLanguage(e.target.value as Language | '');
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value as QuestionType | '');
  };

  const handleDifficultyChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterDifficulty(e.target.value as Difficulty | '');
  };

  const handleTagChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilterTag(e.target.value as Tags | '');
  };

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
                  onChange={handleSectionChange as any} // TODO: Replace with SelectInputProps for type safety
                  disabled={testData.sections.length === 0}
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

            {/* Quick Filters */}
            <div className="mb-3">
              <Label className="fw-bold mb-2">Quick Filters:</Label>
              <ButtonGroup className="d-flex flex-wrap">
                <Button
                  color={quickFilter === 'recommended' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setQuickFilter('recommended')}
                >
                  <Zap size={14} className="me-1" />
                  Recommended
                </Button>
                <Button
                  color={quickFilter === 'popular' ? 'info' : 'outline-info'}
                  size="sm"
                  onClick={() => setQuickFilter('popular')}
                >
                  <BarChart3 size={14} className="me-1" />
                  Popular
                </Button>
                <Button
                  color={quickFilter === 'high-success' ? 'success' : 'outline-success'}
                  size="sm"
                  onClick={() => setQuickFilter('high-success')}
                >
                  <Target size={14} className="me-1" />
                  High Success
                </Button>
                <Button
                  color={quickFilter === 'all' ? 'secondary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setQuickFilter('all')}
                >
                  All Questions
                </Button>
              </ButtonGroup>
            </div>

            {/* Search and Filter Controls */}
            <Row className="mb-3">
              <Col md="6">
                <InputGroup>
                  <InputGroupText>
                    <Search size={16} />
                  </InputGroupText>
                  <Input
                    type="text"
                    placeholder="Search questions, descriptions, tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md="3">
                <Button
                  color="outline-secondary"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-100"
                >
                  <Filter size={16} className="me-1" />
                  Filters
                  {showAdvancedFilters ? <ChevronUp size={16} className="ms-1" /> : <ChevronDown size={16} className="ms-1" />}
                </Button>
              </Col>
              <Col md="3">
                <Button
                  color="outline-secondary"
                  onClick={clearAllFilters}
                  className="w-100"
                >
                  <RotateCcw size={16} className="me-1" />
                  Clear
                </Button>
              </Col>
            </Row>

            {/* Advanced Filters */}
            <Collapse isOpen={showAdvancedFilters}>
              <Card className="mb-3">
                <CardBody>
                  <Row>
                    <Col md="3">
                      <FormGroup>
                        <Label>Language:</Label>
                        <Input
                          type="select"
                          value={filterLanguage}
                          onChange={handleLanguageChange as any} // TODO: Replace with SelectInputProps for type safety
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
                          onChange={handleTypeChange as any} // TODO: Replace with SelectInputProps for type safety
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
                          onChange={handleDifficultyChange as any} // TODO: Replace with SelectInputProps for type safety
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
                          onChange={handleTagChange as any} // TODO: Replace with SelectInputProps for type safety
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

            {/* Bulk Selection Controls */}
            {bulkSelection.length > 0 && (
              <Alert color="info" className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    <CheckCircle size={16} className="me-2" />
                    {bulkSelection.length} questions selected
                  </span>
                  <div>
                    <Button
                      color="success"
                      size="sm"
                      onClick={addBulkQuestions}
                      className="me-2"
                    >
                      Add Selected
                    </Button>
                    <Button
                      color="outline-secondary"
                      size="sm"
                      onClick={() => setBulkSelection([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </Alert>
            )}

            {/* Results Summary */}
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">
                  {filteredQuestions.length} questions found • {selectedCount} selected
                  {quickFilter === 'recommended' && (
                    <Badge color="success" className="ms-2">
                      <Zap size={12} className="me-1" />
                      Matched to test
                    </Badge>
                  )}
                </small>
              </div>
              <div>
                <Button size="sm" color="outline-primary" className="me-2" onClick={handleAssignAll}>
                  Select All Visible
                </Button>
                <Button size="sm" color="outline-secondary" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div style={{ height: 'calc(100vh - 450px)', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center p-4">
                <Spinner color="primary" />
                <p className="mt-2 text-muted">Loading questions...</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center p-4">
                <Alert color="warning" className="mb-0">
                  {testData.languages.length === 0 && testData.tags.length === 0
                    ? 'Select languages and tags first to see available questions'
                    : 'No questions found for selected criteria. Try adjusting your filters.'
                  }
                </Alert>
              </div>
            ) : (
              <ListGroup flush>
                {filteredQuestions.map((question) => {
                  const isSelected = isQuestionSelected(question.id);
                  const isBulkSelected = bulkSelection.includes(question.id);

                  return (
                    <ListGroupItem
                      key={question.id}
                      className={`border-0 border-bottom ${isSelected ? 'bg-light' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggle(question.id)}
                    >
                      <div className="d-flex align-items-start">
                        {/* Bulk Selection Checkbox */}
                        <Input
                          type="checkbox"
                          checked={isBulkSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setBulkSelection([...bulkSelection, question.id]);
                            } else {
                              setBulkSelection(bulkSelection.filter(id => id !== question.id));
                            }
                          }}
                          className="me-2 mt-1"
                          style={{ transform: 'scale(0.9)' }}
                        />

                        {/* Main Selection Checkbox */}
                        <Input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggle(question.id)}
                          className="me-3 mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />

                        <div className="flex-grow-1">
                          {/* Question Title */}
                          <div className="fw-bold mb-1">{question.title}</div>
                          
                          {/* Question Description */}
                          <div className="small text-muted mb-2">
                            {question.description?.slice(0, 150) || 'No description available'}
                            {question.description && question.description.length > 150 && '...'}
                          </div>

                          {/* Badges Row */}
                          <div className="d-flex gap-1 flex-wrap mb-2">
                            <Badge color={getTypeColor(question.type)}>
                              {question.type.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                            
                            {question.language && (
                              <Badge color={getLanguageColor(question.language)}>
                                {question.language}
                              </Badge>
                            )}
                            
                            {question.difficulty && (
                              <Badge color={getDifficultyColor(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                            )}

                            {question.isGlobal ? (
                              <Badge color="primary">
                                <Globe size={10} className="me-1" />
                                Global
                              </Badge>
                            ) : (
                              <Badge color="secondary">
                                <Building size={10} className="me-1" />
                                Organization
                              </Badge>
                            )}
                          </div>

                          {/* Tags */}
                          {question.tags && question.tags.length > 0 && (
                            <div className="d-flex gap-1 flex-wrap mb-2">
                              {question.tags.slice(0, 3).map((tag: Tags) => (
                                <Badge key={tag} color="light" className="text-dark" style={{ fontSize: '0.7em' }}>
                                  {tag}
                                </Badge>
                              ))}
                              {question.tags.length > 3 && (
                                <Badge color="light" className="text-dark" style={{ fontSize: '0.7em' }}>
                                  +{question.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Usage Stats */}
                          {question.usageStats && (
                            <div className="small text-muted">
                              Used {question.usageStats.timesUsed} times • 
                              <span className={`ms-1 fw-bold text-${getSuccessRateColor(question.usageStats.successRate)}`}>
                                {Math.round(question.usageStats.successRate * 100)}% success rate
                              </span>
                              {question.usageStats.averageTime > 0 && (
                                <span className="ms-2">
                                  Avg: {Math.round(question.usageStats.averageTime / 60)}min
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quick Add Button */}
                        <div className="ms-2">
                          <Button
                            color={isSelected ? 'success' : 'outline-success'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(question.id);
                            }}
                            className="d-flex align-items-center"
                          >
                            {isSelected ? (
                              <CheckCircle size={14} className="me-1" />
                            ) : (
                              <Plus size={14} className="me-1" />
                            )}
                            {isSelected ? 'Added' : 'Add'}
                          </Button>
                        </div>
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
          <CheckCircle size={16} className="me-2" />
          Unauthorized: Only admins or instructors can browse questions.
        </Alert>
      )}
    </div>
  );
};

export default QuestionBrowser;