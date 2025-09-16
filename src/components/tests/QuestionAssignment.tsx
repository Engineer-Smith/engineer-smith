// src/components/tests/QuestionAssignment.tsx - Updated with pagination

import {
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Plus,
    RefreshCw,
    Target
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    CardBody,
    Col,
    Pagination,
    PaginationItem,
    PaginationLink,
    Progress,
    Row
} from 'reactstrap';
import apiService from '../../services/ApiService';
import type {
    Difficulty,
    Language, Question, QuestionCategory, QuestionType, Tags, TestQuestionReference, WizardStepProps
} from '../../types';
import QuestionBrowser from './QuestionBrowser';

const ITEMS_PER_PAGE = 20;

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
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Question filtering states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<QuestionType | ''>('');
    const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | ''>('');
    const [filterLanguage, setFilterLanguage] = useState<Language | ''>('');
    const [filterCategory, setFilterCategory] = useState<QuestionCategory | ''>('');
    const [filterTag, setFilterTag] = useState<Tags | ''>('');
    const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);

    // Debounced search term
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [
        testData.languages,
        testData.tags,
        debouncedSearchTerm,
        filterType,
        filterDifficulty,
        filterLanguage,
        filterCategory,
        filterTag
    ]);

    // Load questions when filters or page changes
    useEffect(() => {
        fetchQuestions();
    }, [
        testData.languages,
        testData.tags,
        debouncedSearchTerm,
        filterType,
        filterDifficulty,
        filterLanguage,
        filterCategory,
        filterTag,
        currentPage
    ]);

    const fetchQuestions = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const skip = (currentPage - 1) * ITEMS_PER_PAGE;
            const params: Record<string, string | number | boolean> = {
                status: 'active',
                limit: ITEMS_PER_PAGE,
                skip,
                includeTotalCount: true
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

            if (debouncedSearchTerm) params.search = debouncedSearchTerm;
            if (filterType) params.type = filterType;
            if (filterDifficulty) params.difficulty = filterDifficulty;
            if (filterCategory) params.category = filterCategory;

            // With improved ApiService, always get consistent format
            const response = await apiService.getAllQuestions(params, true);

            // Now we can safely access response.questions and pagination info
            setQuestions(response.questions || []);
            setTotalQuestions(response.pagination?.totalCount || 0);
            setTotalPages(Math.ceil((response.pagination?.totalCount || 0) / ITEMS_PER_PAGE));
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

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Get pagination range for display
    const getPaginationRange = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    // Since we're using server-side pagination, we don't need client-side filtering
    // All filtering is now handled by the server
    const filteredQuestions = questions;

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
    const getTotalSelectedQuestions = () => {
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

        const totalSelectedQuestions = getTotalSelectedQuestions();

        if (totalSelectedQuestions === 0) {
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
                                <h4 className="mb-1 text-primary">{getTotalSelectedQuestions()}</h4>
                                <small className="text-muted">Selected Questions</small>
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
                                <h4 className="mb-1 text-secondary">{totalQuestions}</h4>
                                <small className="text-muted">Total Available</small>
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
                                {totalQuestions > 0 && (
                                    <span> - Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalQuestions)} of {totalQuestions}</span>
                                )}
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

            {/* Pagination */}
            {totalPages > 1 && (
                <Card className="mt-4">
                    <CardBody>
                        <div className="d-flex justify-content-center align-items-center">
                            <Pagination className="mb-0">
                                <PaginationItem disabled={currentPage === 1}>
                                    <PaginationLink
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className="d-flex align-items-center"
                                    >
                                        <ChevronLeft size={16} />
                                    </PaginationLink>
                                </PaginationItem>

                                {getPaginationRange().map((page, index) => (
                                    <PaginationItem key={index} active={page === currentPage} disabled={page === '...'}>
                                        <PaginationLink
                                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                                            style={{ cursor: page === '...' ? 'default' : 'pointer' }}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem disabled={currentPage === totalPages}>
                                    <PaginationLink
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className="d-flex align-items-center"
                                    >
                                        <ChevronRight size={16} />
                                    </PaginationLink>
                                </PaginationItem>
                            </Pagination>

                            <div className="ms-3 text-muted small">
                                Page {currentPage} of {totalPages}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

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
                    disabled={getTotalSelectedQuestions() === 0}
                >
                    Next: Review & Publish
                    <ArrowRight size={16} className="ms-1" />
                </Button>
            </div>

            {/* Styles */}
            <style>{`
                .rotating {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default QuestionAssignment;