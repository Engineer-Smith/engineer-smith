import React, { useState, useEffect, useMemo } from 'react';
import {
    Row,
    Col,
    Button,
    Card,
    CardBody,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Alert,
    Progress,
    Badge
} from 'reactstrap';
import { ArrowLeft, ArrowRight, Target, AlertCircle } from 'lucide-react';
import apiService from '../../services/ApiService';
import type { WizardStepProps, CreateTestData } from '../../types/createTest';
import type { Question, QuestionType, Difficulty, Language, Tags } from '../../types';
import QuestionBrowser from './QuestionBrowser';
import QuestionCreator from './QuestionCreator';

const QuestionAssignment: React.FC<WizardStepProps> = ({
    testData,
    setTestData,
    onNext,
    onPrevious,
    setError
}) => {
    const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);

    // Question filtering states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<QuestionType | ''>('');
    const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | ''>('');
    const [filterLanguage, setFilterLanguage] = useState<Language | ''>('');
    const [filterTag, setFilterTag] = useState<Tags | ''>('');
    const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);

    // New questions created in this session
    const [newQuestions, setNewQuestions] = useState<Question[]>([]);

    // Load questions when languages/tags/filters change
    useEffect(() => {
        if (testData.languages.length > 0 || testData.tags.length > 0) {
            fetchQuestions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        testData.languages,
        testData.tags,
        searchTerm,
        filterType,
        filterDifficulty,
        filterLanguage,
        filterTag
    ]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const params: Record<string, string | number | boolean> = {
                status: 'active',
                limit: 200
            };

            if (testData.languages.length > 0) {
                params.language = testData.languages.join(',');
            }
            if (testData.tags.length > 0) {
                params.tag = testData.tags.join(',');
            }
            if (searchTerm) {
                params.search = searchTerm;
            }
            if (filterType) {
                params.type = filterType;
            }
            if (filterDifficulty) {
                params.difficulty = filterDifficulty;
            }
            if (filterLanguage) {
                params.language = filterLanguage;
            }
            if (filterTag) {
                params.tag = filterTag;
            }

            const response = await apiService.getAllQuestions(params, false);
            if (response.error) {
                throw new Error(response.message || 'Failed to fetch questions');
            }

            const data: Question[] = Array.isArray(response.data)
                ? response.data
                : response.data?.questions || [];

            // Merge with locally created questions so they remain visible in the list
            setQuestions([...data, ...newQuestions]);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            setError(error instanceof Error ? error.message : 'Failed to load questions');
        } finally {
            setLoading(false);
        }
    };
    const setTestDataCompat: React.Dispatch<React.SetStateAction<CreateTestData>> = (next) => {
        if (typeof next === 'function') {
            const compute = next as (prev: CreateTestData) => CreateTestData;
            setTestData(compute(testData)); // your current (data) => void
        } else {
            setTestData(next);
        }
    };

    // Compute filtered list the browser expects
    const filteredQuestions = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return questions.filter((q) => {
            if (filterType && q.type !== filterType) return false;
            if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
            if (filterLanguage && q.language !== filterLanguage) return false;
            if (filterTag && !(q.tags || []).includes(filterTag)) return false;

            if (!term) return true;

            const inTitle = q.title?.toLowerCase().includes(term);
            const inDesc = q.description?.toLowerCase().includes(term);
            const inTags = (q.tags || []).some((t) => t.toLowerCase().includes(term));
            return inTitle || inDesc || inTags;
        });
    }, [questions, searchTerm, filterType, filterDifficulty, filterLanguage, filterTag]);

    const getTotalQuestions = () => {
        if (testData.settings.useSections) {
            return testData.sections.reduce((total, section) => total + section.questions.length, 0);
        }
        // Note: this includes newQuestions count as in your original logic.
        return testData.questions.length + newQuestions.length;
    };

    const getTotalPoints = () => {
        if (testData.settings.useSections) {
            return testData.sections.reduce(
                (total, section) =>
                    total + section.questions.reduce((sectionTotal, q) => sectionTotal + q.points, 0),
                0
            );
        }
        const existingPoints = testData.questions.reduce((total, q) => total + q.points, 0);
        const newPoints = newQuestions.reduce((total) => total + 10, 0); // Assume 10 points default
        return existingPoints + newPoints;
    };

    const getSelectedQuestionCount = () => {
        if (testData.settings.useSections) {
            if (!testData.sections[selectedSectionIndex]) {
                return 0;
            }
            return testData.sections[selectedSectionIndex].questions.length;
        }
        return testData.questions.length;
    };

    const handleNext = () => {
        setError(null);

        const totalQuestions = getTotalQuestions();

        if (totalQuestions === 0) {
            setError('Please add at least one question to the test');
            return;
        }

        if (testData.settings.useSections) {
            const emptySections = testData.sections.filter((section) => section.questions.length === 0);
            if (emptySections.length > 0) {
                setError(`Please add questions to all sections. ${emptySections.length} section(s) are empty.`);
                return;
            }
        }

        onNext?.();
    };

    return (
        <div>
            {/* Progress Summary */}
            <div className="mb-4">
                <Card className="bg-light border-0">
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
                                        {testData.settings.useSections ? testData.sections.length : 0}
                                    </h4>
                                    <small className="text-muted">Sections</small>
                                </div>
                            </Col>
                            <Col md="3">
                                <div className="text-center">
                                    <h4 className="mb-1 text-warning">{newQuestions.length}</h4>
                                    <small className="text-muted">New Questions</small>
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </div>

            {/* Section Progress (for section-based tests) */}
            {testData.settings.useSections && (
                <div className="mb-4">
                    <h6 className="d-flex align-items-center mb-3">
                        <Target size={16} className="me-2" />
                        Section Progress
                    </h6>
                    {testData.sections.length > 0 ? (
                        testData.sections.map((section, index) => (
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
                        ))
                    ) : (
                        <Alert color="warning">
                            <AlertCircle size={16} className="me-2" />
                            No sections defined. Add sections in the previous step.
                        </Alert>
                    )}
                </div>
            )}

            {/* Tab Navigation */}
            <Nav tabs className="mb-3">
                <NavItem>
                    <NavLink
                        className={activeTab === 'browse' ? 'active' : ''}
                        onClick={() => setActiveTab('browse')}
                        style={{ cursor: 'pointer' }}
                    >
                        Browse Questions
                        <Badge color="secondary" className="ms-2">
                            {questions.length}
                        </Badge>
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={activeTab === 'create' ? 'active' : ''}
                        onClick={() => setActiveTab('create')}
                        style={{ cursor: 'pointer' }}
                    >
                        Create New
                        <Badge color="success" className="ms-2">
                            {newQuestions.length}
                        </Badge>
                    </NavLink>
                </NavItem>
            </Nav>

            {/* Tab Content */}
            <TabContent activeTab={activeTab}>
                <TabPane tabId="browse">
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
                        filterTag={filterTag}
                        setFilterTag={setFilterTag}
                        setSelectedSectionIndex={setSelectedSectionIndex}
                    /* no setTestData prop here */
                    />
                </TabPane>

                <TabPane tabId="create">
                    <QuestionCreator
                        newQuestions={newQuestions}
                        setNewQuestions={setNewQuestions}
                        selectedSectionIndex={selectedSectionIndex}
                        setSelectedSectionIndex={setSelectedSectionIndex}
                        testData={testData}
                        setTestData={setTestDataCompat}
                    />
                </TabPane>
            </TabContent>

            {/* Navigation */}
            <div className="d-flex justify-content-between pt-3 border-top mt-4">
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
