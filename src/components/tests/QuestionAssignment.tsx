// src/components/tests/QuestionAssignment.tsx - Updated to use QuestionBrowser

import React, { useState, useEffect, useMemo } from 'react';
import {
    Row,
    Col,
    Button,
    Card,
    CardBody,
    Progress,
    Badge
} from 'reactstrap';
import {
    ArrowLeft,
    ArrowRight,
    Target,
    RefreshCw,
    Plus,
    ExternalLink
} from 'lucide-react';
import apiService from '../../services/ApiService';
import QuestionBrowser from './QuestionBrowser';
import type { WizardStepProps, CreateTestData, TestQuestionReference } from '../../types';
import type {
    Question,
    QuestionType,
    Difficulty,
    Language,
    Tags,
    QuestionCategory
} from '../../types';

const QuestionAssignment: React.FC<WizardStepProps> = ({
    testData,
    setTestData,
    onNext,
    onPrevious,
    setError
}) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Question filtering states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<QuestionType | ''>('');
    const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | ''>('');
    const [filterLanguage, setFilterLanguage] = useState<Language | ''>('');
    const [filterCategory, setFilterCategory] = useState<QuestionCategory | ''>('');
    const [filterTag, setFilterTag] = useState<Tags | ''>('');
    const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);

    // Load questions when filters change
    useEffect(() => {
        fetchQuestions();
    }, [
        testData.languages,
        testData.tags,
        searchTerm,
        filterType,
        filterDifficulty,
        filterLanguage,
        filterCategory,
        filterTag
    ]);

    const fetchQuestions = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const params: Record<string, string | number | boolean> = {
                status: 'active',
                limit: 200
            };

            // Build query parameters
            if (filterLanguage) {
                params.language = filterLanguage;
            } else if (testData.languages.length > 0) {
                params.language = testData.languages[0];
            }

            if (filterTag) {
                params.tag = filterTag;
            } else if (testData.tags.length > 0) {
                params.tag = testData.tags[0];
            }

            if (searchTerm) params.search = searchTerm;
            if (filterType) params.type = filterType;
            if (filterDifficulty) params.difficulty = filterDifficulty;
            if (filterCategory) params.category = filterCategory;

            console.log('QuestionAssignment: Fetching questions with params:', params);

            // FIXED: getAllQuestions returns Question[] directly, no wrapper
            const questions = await apiService.getAllQuestions(params, false);

            if (!Array.isArray(questions)) {
                throw new Error('Failed to fetch questions - invalid response format');
            }

            setQuestions(questions);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            setError?.(error instanceof Error ? error.message : 'Failed to load questions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchQuestions(true);
    };

    const handleCreateQuestion = () => {
        // Open question creation in new tab
        const url = 'http://localhost:5173/admin/question-bank/add';
        window.open(url, '_blank');
    };

    // Compute filtered list
    const filteredQuestions = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return questions.filter((q) => {
            if (filterType && q.type !== filterType) return false;
            if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
            if (filterLanguage && q.language !== filterLanguage) return false;
            if (filterCategory && q.category !== filterCategory) return false;
            if (filterTag && !(q.tags || []).includes(filterTag)) return false;

            if (!term) return true;

            const inTitle = q.title?.toLowerCase().includes(term);
            const inDesc = q.description?.toLowerCase().includes(term);
            const inTags = (q.tags || []).some((t) => t.toLowerCase().includes(term));
            return inTitle || inDesc || inTags;
        });
    }, [questions, searchTerm, filterType, filterDifficulty, filterLanguage, filterCategory, filterTag]);

    // Question selection handlers
    const handleToggleQuestion = (questionId: string) => {
        if (testData.settings.useSections && testData.sections) {
            const updatedSections = [...testData.sections];
            const section = updatedSections[selectedSectionIndex];

            if (!section) return;

            const isSelected = section.questions.some(q => q.questionId === questionId);

            if (isSelected) {
                section.questions = section.questions.filter(q => q.questionId !== questionId);
            } else {
                section.questions.push({
                    questionId: questionId,
                    points: 10
                });
            }

            setTestData({
                ...testData,
                sections: updatedSections
            });
        } else {
            const isSelected = testData.questions?.some(q => q.questionId === questionId) || false;

            if (isSelected) {
                setTestData({
                    ...testData,
                    questions: testData.questions?.filter(q => q.questionId !== questionId) || []
                });
            } else {
                setTestData({
                    ...testData,
                    questions: [...(testData.questions || []), {
                        questionId: questionId,
                        points: 10
                    }]
                });
            }
        }
    };

    const handleSelectAllVisible = () => {
        if (testData.settings.useSections && testData.sections) {
            const updatedSections = [...testData.sections];
            const section = updatedSections[selectedSectionIndex];

            if (!section) return;

            filteredQuestions.forEach(question => {
                const isAlreadySelected = section.questions.some(q => q.questionId === question._id);
                if (!isAlreadySelected) {
                    section.questions.push({
                        questionId: question._id,
                        points: 10
                    });
                }
            });

            setTestData({
                ...testData,
                sections: updatedSections
            });
        } else {
            const newQuestionRefs: TestQuestionReference[] = [];

            filteredQuestions.forEach(question => {
                const isAlreadySelected = testData.questions?.some(q => q.questionId === question._id) || false;
                if (!isAlreadySelected) {
                    newQuestionRefs.push({
                        questionId: question._id,
                        points: 10
                    });
                }
            });

            if (newQuestionRefs.length > 0) {
                setTestData({
                    ...testData,
                    questions: [...(testData.questions || []), ...newQuestionRefs]
                });
            }
        }
    };

    const handleClearSelection = () => {
        if (testData.settings.useSections && testData.sections) {
            const updatedSections = [...testData.sections];
            if (updatedSections[selectedSectionIndex]) {
                updatedSections[selectedSectionIndex].questions = [];
            }

            setTestData({
                ...testData,
                sections: updatedSections
            });
        } else {
            setTestData({
                ...testData,
                questions: []
            });
        }
    };

    // Helper functions for display
    const getTotalQuestions = () => {
        if (testData.settings.useSections && testData.sections) {
            return testData.sections.reduce((total, section) => total + section.questions.length, 0);
        }
        return testData.questions?.length || 0;
    };

    const getTotalPoints = () => {
        if (testData.settings.useSections && testData.sections) {
            return testData.sections.reduce(
                (total, section) =>
                    total + section.questions.reduce((sectionTotal, q) => sectionTotal + q.points, 0),
                0
            );
        }
        return testData.questions?.reduce((total, q) => total + q.points, 0) || 0;
    };

    const handleNext = () => {
        setError?.(null);

        const totalQuestions = getTotalQuestions();

        if (totalQuestions === 0) {
            setError?.('Please add at least one question to the test');
            return;
        }

        if (testData.settings.useSections && testData.sections) {
            const emptySections = testData.sections.filter((section) => section.questions.length === 0);
            if (emptySections.length > 0) {
                setError?.(`Please add questions to all sections. ${emptySections.length} section(s) are empty.`);
                return;
            }
        }

        onNext?.();
    };

    return (
        <div>
            {/* Progress Summary */}
            <Card className="bg-light border-0 mb-4">
                <CardBody>
                    <Row>
                        <Col md="3">
                            <div className="text-center">
                                <h4 className="mb-1 text-primary">{getTotalQuestions()}</h4>
                                <small className="text-muted">Total Questions</small>
                            </div>
                        </Col>
                        <Col md="3">
                            <div className="text-center">
                                <h4 className="mb-1 text-success">{getTotalPoints()}</h4>
                                <small className="text-muted">Total Points</small>
                            </div>
                        </Col>
                        <Col md="3">
                            <div className="text-center">
                                <h4 className="mb-1 text-info">
                                    {testData.settings.useSections ? testData.sections?.length || 0 : 0}
                                </h4>
                                <small className="text-muted">Sections</small>
                            </div>
                        </Col>
                        <Col md="3">
                            <div className="text-center">
                                <h4 className="mb-1 text-secondary">{questions.length}</h4>
                                <small className="text-muted">Available</small>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Section Progress (for section-based tests) */}
            {testData.settings.useSections && testData.sections && (
                <Card className="mb-4">
                    <CardBody>
                        <h6 className="d-flex align-items-center mb-3">
                            <Target size={16} className="me-2" />
                            Section Progress
                        </h6>
                        {testData.sections.map((section, index) => (
                            <div key={index} className="mb-2">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small fw-medium">{section.name}</span>
                                    <span className="small text-muted">{section.questions.length} questions</span>
                                </div>
                                <Progress
                                    value={section.questions.length ? 100 : 0}
                                    color={section.questions.length ? 'success' : 'secondary'}
                                    style={{ height: '4px' }}
                                />
                            </div>
                        ))}
                    </CardBody>
                </Card>
            )}

            {/* Header Actions */}
            <Card className="mb-4">
                <CardBody>
                    <Row className="align-items-center">
                        <Col>
                            <h6 className="mb-0">Question Library</h6>
                            <small className="text-muted">
                                Browse and select questions for your test
                            </small>
                        </Col>
                        <Col xs="auto">
                            <div className="d-flex gap-2">
                                <Button
                                    color="outline-primary"
                                    size="sm"
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                >
                                    <RefreshCw size={14} className={`me-1 ${refreshing ? 'rotating' : ''}`} />
                                    {refreshing ? 'Refreshing...' : 'Refresh'}
                                </Button>
                                <Button
                                    color="success"
                                    size="sm"
                                    onClick={handleCreateQuestion}
                                >
                                    <Plus size={14} className="me-1" />
                                    Create Question
                                    <ExternalLink size={12} className="ms-1" />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* Question Browser Component */}
            <QuestionBrowser
                loading={loading}
                questions={questions}
                filteredQuestions={filteredQuestions}
                testData={testData}
                selectedSectionIndex={selectedSectionIndex}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterType={filterType}
                setFilterType={setFilterType}
                filterDifficulty={filterDifficulty}
                setFilterDifficulty={setFilterDifficulty}
                filterLanguage={filterLanguage}
                setFilterLanguage={setFilterLanguage}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                filterTag={filterTag}
                setFilterTag={setFilterTag}
                setSelectedSectionIndex={setSelectedSectionIndex}
                onToggleQuestion={handleToggleQuestion}
                onAssignAll={handleSelectAllVisible}
                onClear={handleClearSelection}
            />

            {/* Navigation */}
            <div className="d-flex justify-content-between pt-3 border-top">
                <Button color="secondary" onClick={onPrevious} className="d-flex align-items-center">
                    <ArrowLeft size={16} className="me-1" />
                    {testData.settings.useSections ? 'Previous: Configure Sections' : 'Previous: Test Structure'}
                </Button>
                <Button
                    color="primary"
                    onClick={handleNext}
                    className="d-flex align-items-center"
                    disabled={getTotalQuestions() === 0}
                >
                    Next: Review & Publish
                    <ArrowRight size={16} className="ms-1" />
                </Button>
            </div>
        </div>
    );
};

export default QuestionAssignment;