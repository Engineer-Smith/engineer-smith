// src/components/tests/QuestionBrowser.tsx - Built from scratch
import React, { useState } from 'react';
import {
    Row,
    Col,
    Input,
    InputGroup,
    InputGroupText,
    Button,
    Card,
    CardBody,
    Badge,
    Spinner,
    Alert,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'reactstrap';
import { 
    Search, 
    Filter, 
    CheckSquare, 
    Square, 
    Users, 
    Target,
    Eye
} from 'lucide-react';
import type { 
    Question, 
    QuestionType, 
    Difficulty, 
    Language, 
    Tags, 
    QuestionCategory,
    CreateTestData 
} from '../../types';

interface QuestionBrowserProps {
    loading: boolean;
    questions: Question[];
    filteredQuestions: Question[];
    testData: CreateTestData;
    selectedSectionIndex: number;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterType: QuestionType | '';
    setFilterType: (type: QuestionType | '') => void;
    filterDifficulty: Difficulty | '';
    setFilterDifficulty: (difficulty: Difficulty | '') => void;
    filterLanguage: Language | '';
    setFilterLanguage: (language: Language | '') => void;
    filterCategory: QuestionCategory | '';
    setFilterCategory: (category: QuestionCategory | '') => void;
    filterTag: Tags | '';
    setFilterTag: (tag: Tags | '') => void;
    setSelectedSectionIndex: (index: number) => void;
    onToggleQuestion: (questionId: string) => void;
    onAssignAll: () => void;
    onClear: () => void;
}

const QuestionBrowser: React.FC<QuestionBrowserProps> = ({
    loading,
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
    filterCategory,
    setFilterCategory,
    setSelectedSectionIndex,
    onToggleQuestion,
    onAssignAll,
    onClear
}) => {
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [showModal, setShowModal] = useState(false);

    const isQuestionSelected = (questionId: string): boolean => {
        if (testData.settings.useSections && testData.sections) {
            const section = testData.sections[selectedSectionIndex];
            return section?.questions?.some(q => q.questionId === questionId) || false;
        }
        return testData.questions?.some(q => q.questionId === questionId) || false;
    };

    const getDifficultyColor = (difficulty: Difficulty): string => {
        switch (difficulty) {
            case 'easy': return 'success';
            case 'medium': return 'warning';
            case 'hard': return 'danger';
            default: return 'secondary';
        }
    };

    const getQuestionTypeIcon = (type: QuestionType): string => {
        switch (type) {
            case 'multipleChoice': return '☰';
            case 'trueFalse': return '✓✗';
            case 'codeChallenge': return '💻';
            case 'fillInTheBlank': return '⬜';
            case 'codeDebugging': return '🐛';
            default: return '❓';
        }
    };

    const getQuestionTypeDisplayName = (type: QuestionType): string => {
        switch (type) {
            case 'multipleChoice': return 'Multiple Choice';
            case 'trueFalse': return 'True/False';
            case 'codeChallenge': return 'Code Challenge';
            case 'fillInTheBlank': return 'Fill in the Blank';
            case 'codeDebugging': return 'Code Debugging';
            default: return 'Unknown';
        }
    };

    const handleViewQuestion = (question: Question, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedQuestion(question);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedQuestion(null);
    };

    return (
        <div>
            {/* Filters */}
            <Card className="mb-4">
                <CardBody>
                    <Row className="g-3">
                        <Col md={4}>
                            <InputGroup>
                                <InputGroupText>
                                    <Search size={16} />
                                </InputGroupText>
                                <Input
                                    type="text"
                                    placeholder="Search questions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={2}>
                            <Input
                                type="select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as QuestionType | '')}
                            >
                                <option value="">All Types</option>
                                <option value="multipleChoice">Multiple Choice</option>
                                <option value="trueFalse">True/False</option>
                                <option value="codeChallenge">Code Challenge</option>
                                <option value="fillInTheBlank">Fill in Blank</option>
                                <option value="codeDebugging">Code Debugging</option>
                            </Input>
                        </Col>
                        <Col md={2}>
                            <Input
                                type="select"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value as QuestionCategory | '')}
                            >
                                <option value="">All Categories</option>
                                <option value="logic">Logic</option>
                                <option value="ui">UI</option>
                                <option value="syntax">Syntax</option>
                            </Input>
                        </Col>
                        <Col md={2}>
                            <Input
                                type="select"
                                value={filterDifficulty}
                                onChange={(e) => setFilterDifficulty(e.target.value as Difficulty | '')}
                            >
                                <option value="">All Difficulties</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </Input>
                        </Col>
                        <Col md={2}>
                            <Input
                                type="select"
                                value={filterLanguage}
                                onChange={(e) => setFilterLanguage(e.target.value as Language | '')}
                            >
                                <option value="">All Languages</option>
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="python">Python</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="react">React</option>
                                <option value="sql">SQL</option>
                                <option value="dart">Dart</option>
                                <option value="flutter">Flutter</option>
                                <option value="reactNative">React Native</option>
                                <option value="express">Express</option>
                                <option value="json">JSON</option>
                            </Input>
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex gap-2">
                                    <Button
                                        color="primary"
                                        size="sm"
                                        onClick={onAssignAll}
                                        disabled={filteredQuestions.length === 0}
                                    >
                                        <CheckSquare size={14} className="me-1" />
                                        Select All Visible
                                    </Button>
                                    <Button
                                        color="outline-secondary"
                                        size="sm"
                                        onClick={onClear}
                                    >
                                        Clear Selection
                                    </Button>
                                </div>
                                <div className="text-muted small">
                                    {filteredQuestions.length} questions found
                                </div>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Section Selection */}
            {testData.settings.useSections && testData.sections && (
                <Card className="mb-4">
                    <CardBody>
                        <h6 className="mb-3">
                            <Target size={16} className="me-2" />
                            Assign to Section
                        </h6>
                        <Row>
                            {testData.sections.map((section, index) => (
                                <Col key={index} md={4} className="mb-2">
                                    <Button
                                        color={selectedSectionIndex === index ? 'primary' : 'outline-primary'}
                                        className="w-100"
                                        onClick={() => setSelectedSectionIndex(index)}
                                    >
                                        {section.name}
                                        <Badge 
                                            color="light" 
                                            className="ms-2"
                                            style={{ color: selectedSectionIndex === index ? '#007bff' : '#6c757d' }}
                                        >
                                            {section.questions.length}
                                        </Badge>
                                    </Button>
                                </Col>
                            ))}
                        </Row>
                    </CardBody>
                </Card>
            )}

            {/* Loading */}
            {loading && (
                <Card>
                    <CardBody className="text-center py-5">
                        <Spinner color="primary" className="mb-3" />
                        <p className="text-muted">Loading questions...</p>
                    </CardBody>
                </Card>
            )}

            {/* Empty State */}
            {!loading && filteredQuestions.length === 0 && (
                <Alert color="info">
                    <Filter size={16} className="me-2" />
                    No questions found matching your filters. Try adjusting your search criteria.
                </Alert>
            )}

            {/* Questions Grid */}
            {!loading && filteredQuestions.length > 0 && (
                <Row className="g-3">
                    {filteredQuestions.map((question) => {
                        const isSelected = isQuestionSelected(question._id);
                        
                        return (
                            <Col key={question._id} lg={6} xl={4}>
                                <Card 
                                    className={`h-100 question-card ${isSelected ? 'border-primary' : ''}`}
                                    style={{ 
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? '#f8f9ff' : 'white',
                                        borderWidth: isSelected ? '2px' : '1px'
                                    }}
                                    onClick={() => onToggleQuestion(question._id)}
                                >
                                    <CardBody>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="d-flex align-items-center">
                                                {isSelected ? (
                                                    <CheckSquare size={18} className="text-primary me-2" />
                                                ) : (
                                                    <Square size={18} className="text-muted me-2" />
                                                )}
                                                <span className="me-2">{getQuestionTypeIcon(question.type)}</span>
                                                <Badge color={getDifficultyColor(question.difficulty)} size="sm">
                                                    {question.difficulty}
                                                </Badge>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <Badge color="outline-secondary" size="sm">
                                                    {question.language}
                                                </Badge>
                                                <Button
                                                    color="outline-primary"
                                                    size="sm"
                                                    onClick={(e) => handleViewQuestion(question, e)}
                                                    className="p-1"
                                                >
                                                    <Eye size={14} />
                                                </Button>
                                            </div>
                                        </div>

                                        <h6 className="card-title mb-2">{question.title}</h6>
                                        <p className="card-text text-muted small mb-3">
                                            {question.description.length > 100
                                                ? question.description.substring(0, 100) + '...'
                                                : question.description
                                            }
                                        </p>

                                        <div className="d-flex justify-content-between align-items-center text-muted small">
                                            <div className="d-flex align-items-center">
                                                {question.category && (
                                                    <Badge color="outline-info" size="sm" className="me-2">
                                                        {question.category}
                                                    </Badge>
                                                )}
                                                {question.isGlobal ? (
                                                    <span className="me-2">🌍 Global</span>
                                                ) : (
                                                    <span className="me-2">🏢 Org</span>
                                                )}
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <Users size={12} className="me-1" />
                                                {question.usageStats?.timesUsed || 0}
                                            </div>
                                        </div>

                                        {question.tags && question.tags.length > 0 && (
                                            <div className="mt-2">
                                                {question.tags.slice(0, 3).map((tag, index) => (
                                                    <Badge 
                                                        key={index} 
                                                        color="info" 
                                                        size="sm" 
                                                        className="me-1"
                                                    >
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {question.tags.length > 3 && (
                                                    <Badge color="info" size="sm">
                                                        +{question.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* Question Preview Modal */}
            <Modal isOpen={showModal} toggle={handleCloseModal} size="lg">
                <ModalHeader toggle={handleCloseModal}>
                    Question Preview
                </ModalHeader>
                <ModalBody>
                    {selectedQuestion && (
                        <div>
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <h5 className="mb-0">{selectedQuestion.title}</h5>
                                    <div className="d-flex gap-2">
                                        <Badge color={getDifficultyColor(selectedQuestion.difficulty)}>
                                            {selectedQuestion.difficulty}
                                        </Badge>
                                        <Badge color="outline-secondary">
                                            {selectedQuestion.language}
                                        </Badge>
                                        {selectedQuestion.category && (
                                            <Badge color="outline-info">
                                                {selectedQuestion.category}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="d-flex align-items-center gap-3 text-muted small mb-3">
                                    <span className="d-flex align-items-center">
                                        <span className="me-1">{getQuestionTypeIcon(selectedQuestion.type)}</span>
                                        {getQuestionTypeDisplayName(selectedQuestion.type)}
                                    </span>
                                    <span className="d-flex align-items-center">
                                        <Users size={12} className="me-1" />
                                        Used {selectedQuestion.usageStats?.timesUsed || 0} times
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h6 className="mb-2">Description</h6>
                                <p className="text-muted">{selectedQuestion.description}</p>
                            </div>

                            {/* Multiple Choice Options */}
                            {selectedQuestion.type === 'multipleChoice' && (
                                <div className="mb-4">
                                    <h6 className="mb-2">Answer Options</h6>
                                    {selectedQuestion.options && selectedQuestion.options.length > 0 ? (
                                        <div className="list-group">
                                            {selectedQuestion.options.map((option, index) => {
                                                const isCorrect = selectedQuestion.correctAnswer === index;
                                                return (
                                                    <div 
                                                        key={index} 
                                                        className={`list-group-item d-flex align-items-center ${
                                                            isCorrect ? 'list-group-item-success' : ''
                                                        }`}
                                                    >
                                                        <span className="badge bg-secondary me-2">
                                                            {String.fromCharCode(65 + index)}
                                                        </span>
                                                        <span className={isCorrect ? 'fw-bold' : ''}>
                                                            {option}
                                                        </span>
                                                        {isCorrect && (
                                                            <CheckSquare size={16} className="ms-auto text-success" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <small>No answer options available for this question.</small>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* True/False Options */}
                            {selectedQuestion.type === 'trueFalse' && (
                                <div className="mb-4">
                                    <h6 className="mb-2">Answer Options</h6>
                                    {selectedQuestion.options && selectedQuestion.options.length > 0 ? (
                                        <div className="list-group">
                                            {selectedQuestion.options.map((option, index) => {
                                                const isCorrect = selectedQuestion.correctAnswer === index;
                                                return (
                                                    <div 
                                                        key={index} 
                                                        className={`list-group-item d-flex align-items-center ${
                                                            isCorrect ? 'list-group-item-success' : ''
                                                        }`}
                                                    >
                                                        <span className="badge bg-secondary me-2">
                                                            {option === 'true' || option === 'True' ? 'T' : 'F'}
                                                        </span>
                                                        <span className={isCorrect ? 'fw-bold' : ''}>
                                                            {option}
                                                        </span>
                                                        {isCorrect && (
                                                            <CheckSquare size={16} className="ms-auto text-success" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <small>No answer options available for this question.</small>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Fill in the Blank */}
                            {selectedQuestion.type === 'fillInTheBlank' && selectedQuestion.codeTemplate && (
                                <div className="mb-4">
                                    <h6 className="mb-2">Code Template</h6>
                                    <pre className="bg-light p-3 rounded border">
                                        <code>{selectedQuestion.codeTemplate}</code>
                                    </pre>
                                    
                                    {selectedQuestion.blanks && selectedQuestion.blanks.length > 0 && (
                                        <div className="mt-3">
                                            <h6 className="mb-2">Expected Answers</h6>
                                            {selectedQuestion.blanks.map((blank, index) => (
                                                <div key={blank.id || index} className="mb-2">
                                                    <Badge color="outline-primary" className="me-2">
                                                        Blank {index + 1}
                                                    </Badge>
                                                    <span className="text-muted">
                                                        Accepts: {blank.correctAnswers.join(', ')}
                                                    </span>
                                                    {blank.hint && (
                                                        <div className="text-muted small mt-1">
                                                            Hint: {blank.hint}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Code Challenge Test Cases */}
                            {selectedQuestion.type === 'codeChallenge' && selectedQuestion.testCases && (
                                <div className="mb-4">
                                    <h6 className="mb-2">Test Cases</h6>
                                    <div className="list-group">
                                        {selectedQuestion.testCases.map((testCase, index) => (
                                            <div key={index} className="list-group-item">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <strong>Test {index + 1}</strong>
                                                        {testCase.name && <span className="text-muted ms-2">({testCase.name})</span>}
                                                    </div>
                                                    {testCase.hidden && (
                                                        <Badge color="secondary" size="sm">Hidden</Badge>
                                                    )}
                                                </div>
                                                <div className="mt-2">
                                                    <small className="text-muted">Input:</small>
                                                    <code className="d-block bg-light p-1 rounded">
                                                        {JSON.stringify(testCase.args)}
                                                    </code>
                                                </div>
                                                <div className="mt-1">
                                                    <small className="text-muted">Expected:</small>
                                                    <code className="d-block bg-light p-1 rounded">
                                                        {JSON.stringify(testCase.expected)}
                                                    </code>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Code Debugging */}
                            {selectedQuestion.type === 'codeDebugging' && (
                                <div className="mb-4">
                                    {selectedQuestion.buggyCode && (
                                        <div className="mb-3">
                                            <h6 className="mb-2">Buggy Code</h6>
                                            <pre className="bg-danger-subtle p-3 rounded border border-danger">
                                                <code>{selectedQuestion.buggyCode}</code>
                                            </pre>
                                        </div>
                                    )}
                                    
                                    {selectedQuestion.solutionCode && (
                                        <div className="mb-3">
                                            <h6 className="mb-2">Solution Code</h6>
                                            <pre className="bg-success-subtle p-3 rounded border border-success">
                                                <code>{selectedQuestion.solutionCode}</code>
                                            </pre>
                                        </div>
                                    )}

                                    {selectedQuestion.testCases && selectedQuestion.testCases.length > 0 && (
                                        <div>
                                            <h6 className="mb-2">Test Cases</h6>
                                            <div className="list-group">
                                                {selectedQuestion.testCases.map((testCase, index) => (
                                                    <div key={index} className="list-group-item">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <strong>Test {index + 1}</strong>
                                                                {testCase.name && <span className="text-muted ms-2">({testCase.name})</span>}
                                                            </div>
                                                            {testCase.hidden && (
                                                                <Badge color="secondary" size="sm">Hidden</Badge>
                                                            )}
                                                        </div>
                                                        <div className="mt-2">
                                                            <small className="text-muted">Input:</small>
                                                            <code className="d-block bg-light p-1 rounded">
                                                                {JSON.stringify(testCase.args)}
                                                            </code>
                                                        </div>
                                                        <div className="mt-1">
                                                            <small className="text-muted">Expected:</small>
                                                            <code className="d-block bg-light p-1 rounded">
                                                                {JSON.stringify(testCase.expected)}
                                                            </code>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Code Configuration */}
                            {selectedQuestion.codeConfig && (
                                <div className="mb-4">
                                    <h6 className="mb-2">Execution Configuration</h6>
                                    <div className="bg-light p-3 rounded">
                                        <Row>
                                            <Col md={6}>
                                                <div className="mb-2">
                                                    <small className="text-muted">Runtime:</small>
                                                    <div><Badge color="info">{selectedQuestion.codeConfig.runtime}</Badge></div>
                                                </div>
                                                {selectedQuestion.codeConfig.entryFunction && (
                                                    <div className="mb-2">
                                                        <small className="text-muted">Entry Function:</small>
                                                        <div><code>{selectedQuestion.codeConfig.entryFunction}</code></div>
                                                    </div>
                                                )}
                                            </Col>
                                            <Col md={6}>
                                                <div className="mb-2">
                                                    <small className="text-muted">Timeout:</small>
                                                    <div>{selectedQuestion.codeConfig.timeoutMs || 3000}ms</div>
                                                </div>
                                                {selectedQuestion.codeConfig.allowPreview !== undefined && (
                                                    <div className="mb-2">
                                                        <small className="text-muted">Preview Allowed:</small>
                                                        <div>{selectedQuestion.codeConfig.allowPreview ? 'Yes' : 'No'}</div>
                                                    </div>
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="mb-2">Tags</h6>
                                    <div>
                                        {selectedQuestion.tags.map((tag, index) => (
                                            <Badge key={index} color="info" className="me-1 mb-1">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="border-top pt-3 text-muted small">
                                <div className="d-flex justify-content-between">
                                    <span>Created: {new Date(selectedQuestion.createdAt).toLocaleDateString()}</span>
                                    {selectedQuestion.updatedAt && (
                                        <span>Updated: {new Date(selectedQuestion.updatedAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    {selectedQuestion && (
                        <Button 
                            color="primary" 
                            onClick={() => {
                                onToggleQuestion(selectedQuestion._id);
                                handleCloseModal();
                            }}
                        >
                            {isQuestionSelected(selectedQuestion._id) ? 'Remove from Test' : 'Add to Test'}
                        </Button>
                    )}
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default QuestionBrowser;