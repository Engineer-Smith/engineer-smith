import React, { useState, useCallback } from 'react';
import {
    Card,
    CardBody,
    CardTitle,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Alert,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Row,
    Col,
    Container,
    Badge,
    Progress,
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Save,
    X,
    Plus,
    Trash2,
    Code,
    CheckCircle,
    AlertCircle,
    Globe,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import type { Question, Language, Difficulty, Tags } from '../types';

interface QuestionFormComponentProps {
    question?: Partial<Question>;
    onSubmitSuccess?: (question: Question) => void;
    submitLabel?: string;
    showSubmitButton?: boolean;
    compact?: boolean;
    onCancel?: () => void;
}

const PROGRAMMING_LANGUAGES: Array<{ value: Language; label: string }> = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'react', label: 'React/JSX' },
    { value: 'dart', label: 'Dart (Flutter)' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'json', label: 'JSON' },
    { value: 'sql', label: 'SQL' },
    { value: 'python', label: 'Python' },
    { value: 'express', label: 'Express' },
    { value: 'flutter', label: 'Flutter' },
    { value: 'reactNative', label: 'React Native' },
];

const TAGS_OPTIONS: Array<{ value: Tags; label: string; group: string }> = [
    { value: 'html', label: 'HTML', group: 'Web Technologies' },
    { value: 'css', label: 'CSS', group: 'Web Technologies' },
    { value: 'javascript', label: 'JavaScript', group: 'Web Technologies' },
    { value: 'dom', label: 'DOM', group: 'Web Technologies' },
    { value: 'events', label: 'Events', group: 'Web Technologies' },
    { value: 'async-programming', label: 'Async Programming', group: 'Web Technologies' },
    { value: 'promises', label: 'Promises', group: 'Web Technologies' },
    { value: 'async-await', label: 'Async/Await', group: 'Web Technologies' },
    { value: 'es6', label: 'ES6', group: 'Web Technologies' },
    { value: 'closures', label: 'Closures', group: 'Web Technologies' },
    { value: 'scope', label: 'Scope', group: 'Web Technologies' },
    { value: 'hoisting', label: 'Hoisting', group: 'Web Technologies' },
    { value: 'flexbox', label: 'Flexbox', group: 'Web Technologies' },
    { value: 'grid', label: 'Grid', group: 'Web Technologies' },
    { value: 'responsive-design', label: 'Responsive Design', group: 'Web Technologies' },
    { value: 'react', label: 'React', group: 'React' },
    { value: 'components', label: 'Components', group: 'React' },
    { value: 'hooks', label: 'Hooks', group: 'React' },
    { value: 'state-management', label: 'State Management', group: 'React' },
    { value: 'props', label: 'Props', group: 'React' },
    { value: 'context-api', label: 'Context API', group: 'React' },
    { value: 'redux', label: 'Redux', group: 'React' },
    { value: 'react-router', label: 'React Router', group: 'React' },
    { value: 'jsx', label: 'JSX', group: 'React' },
    { value: 'virtual-dom', label: 'Virtual DOM', group: 'React' },
    { value: 'react-native', label: 'React Native', group: 'React Native' },
    { value: 'native-components', label: 'Native Components', group: 'React Native' },
    { value: 'navigation', label: 'Navigation', group: 'React Native' },
    { value: 'flutter', label: 'Flutter', group: 'Flutter' },
    { value: 'widgets', label: 'Widgets', group: 'Flutter' },
    { value: 'state-management-flutter', label: 'State Management (Flutter)', group: 'Flutter' },
    { value: 'dart', label: 'Dart', group: 'Flutter' },
    { value: 'navigation-flutter', label: 'Navigation (Flutter)', group: 'Flutter' },
    { value: 'ui-components', label: 'UI Components', group: 'Flutter' },
    { value: 'express', label: 'Express', group: 'Express' },
    { value: 'nodejs', label: 'Node.js', group: 'Express' },
    { value: 'rest-api', label: 'REST API', group: 'Express' },
    { value: 'middleware', label: 'Middleware', group: 'Express' },
    { value: 'routing', label: 'Routing', group: 'Express' },
    { value: 'authentication', label: 'Authentication', group: 'Express' },
    { value: 'authorization', label: 'Authorization', group: 'Express' },
    { value: 'jwt', label: 'JWT', group: 'Express' },
    { value: 'express-middleware', label: 'Express Middleware', group: 'Express' },
    { value: 'sql', label: 'SQL', group: 'SQL' },
    { value: 'queries', label: 'Queries', group: 'SQL' },
    { value: 'joins', label: 'Joins', group: 'SQL' },
    { value: 'indexes', label: 'Indexes', group: 'SQL' },
    { value: 'transactions', label: 'Transactions', group: 'SQL' },
    { value: 'database-design', label: 'Database Design', group: 'SQL' },
    { value: 'normalization', label: 'Normalization', group: 'SQL' },
    { value: 'python', label: 'Python', group: 'Python' },
    { value: 'functions', label: 'Functions', group: 'Python' },
    { value: 'classes', label: 'Classes', group: 'Python' },
    { value: 'modules', label: 'Modules', group: 'Python' },
    { value: 'list-comprehensions', label: 'List Comprehensions', group: 'Python' },
    { value: 'decorators', label: 'Decorators', group: 'Python' },
    { value: 'generators', label: 'Generators', group: 'Python' },
    { value: 'python-data-structures', label: 'Python Data Structures', group: 'Python' },
    { value: 'variables', label: 'Variables', group: 'General' },
    { value: 'arrays', label: 'Arrays', group: 'General' },
    { value: 'objects', label: 'Objects', group: 'General' },
    { value: 'loops', label: 'Loops', group: 'General' },
    { value: 'conditionals', label: 'Conditionals', group: 'General' },
    { value: 'algorithms', label: 'Algorithms', group: 'General' },
    { value: 'data-structures', label: 'Data Structures', group: 'General' },
    { value: 'error-handling', label: 'Error Handling', group: 'General' },
    { value: 'testing', label: 'Testing', group: 'General' },
];

// Helper to update nested object properties
function setByPath<T extends object>(obj: T, path: string, value: unknown): T {
    const parts = path.split('.');
    const next = { ...obj } as any;
    let cur = next;
    for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...(cur[k] ?? {}) };
        cur = cur[k];
    }
    cur[parts[parts.length - 1]] = value;
    return next;
}

const QuestionFormComponent: React.FC<QuestionFormComponentProps> = ({
    question: initialQuestion = {},
    onSubmitSuccess,
    submitLabel = 'Save Question',
    showSubmitButton = true,
    compact = false,
    onCancel,
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'admin' && user?.organization?.isSuperOrg;
    const [activeStep, setActiveStep] = useState(1);
    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize state with user-based defaults
    const initialState: Partial<Question> = {
        type: undefined,
        title: '',
        description: '',
        difficulty: undefined,
        status: 'draft',
        // FIXED: Super admin logic - explicitly set true/false
        isGlobal: isSuperAdmin ? true : false,
        organizationId: isSuperAdmin ? undefined : user?.organizationId,
        options: [],
        testCases: [],
        correctAnswer: undefined,
        language: 'javascript',
        tags: [],
        usageStats: { timesUsed: 0, totalAttempts: 0, correctAttempts: 0, successRate: 0, averageTime: 0 },
        createdBy: user?.id,
        ...initialQuestion,
    };

    const [question, setQuestion] = useState<Partial<Question>>(initialState);

    const updateQuestion = useCallback((field: string, value: unknown) => {
        setQuestion((prev) => setByPath(prev, field, value));
    }, []);

    const validateStep = (step: number): string[] => {
        const stepErrors: string[] = [];
        if (step === 1) {
            if (!question.title?.trim()) stepErrors.push('Question title is required');
            if (!question.type) stepErrors.push('Question type is required');
            if (!question.language) stepErrors.push('Programming language is required');
            if (!question.difficulty) stepErrors.push('Difficulty is required');
        } else if (step === 2) {
            if (!question.description?.trim()) stepErrors.push('Question text is required');
            if (question.type === 'multipleChoice') {
                if (!question.options || question.options.slice(1).length < 2 || question.options.slice(1).some((opt) => !opt.trim())) {
                    stepErrors.push('At least two multiple choice options must be filled');
                }
                if (question.correctAnswer === undefined || typeof question.correctAnswer !== 'number') {
                    stepErrors.push('A correct answer must be selected');
                }
            }
            if (question.type === 'trueFalse') {
                if (question.correctAnswer === undefined) {
                    stepErrors.push('True or False must be selected');
                }
            }
            if (question.type === 'codeDebugging' && (!question.options?.[0]?.trim())) {
                stepErrors.push('Broken code is required for code debugging questions');
            }
            if ((question.type === 'codeChallenge' || question.type === 'codeDebugging') && (!question.testCases || question.testCases.length === 0)) {
                stepErrors.push('At least one test case is required for code questions');
            }
        }
        return stepErrors;
    };

    const handleNext = () => {
        const stepErrors = validateStep(activeStep);
        setErrors(stepErrors);
        if (stepErrors.length === 0 && activeStep < 3) {
            setActiveStep(activeStep + 1);
        }
    };

    const handlePrevious = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1);
            setErrors([]);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        if (name.startsWith('testCase.')) {
            const [_, index, field] = name.split('.');
            const testCases = [...(question.testCases || [])];
            testCases[parseInt(index)] = {
                ...testCases[parseInt(index)],
                [field]: value,
            };
            updateQuestion('testCases', testCases);
        } else {
            updateQuestion(name, value);
        }
    };

    const handleTagToggle = (tagValue: Tags) => {
        const currentTags = question.tags || [];
        const newTags = currentTags.includes(tagValue)
            ? currentTags.filter((tag) => tag !== tagValue)
            : [...currentTags, tagValue];
        updateQuestion('tags', newTags);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        if (name.startsWith('testCase.')) {
            const [_, index, field] = name.split('.');
            const testCases = [...(question.testCases || [])];
            testCases[parseInt(index)] = {
                ...testCases[parseInt(index)],
                [field]: checked,
            };
            updateQuestion('testCases', testCases);
        }
    };

    const handleCodeChange = (value: string | undefined, field: string) => {
        const newOptions = [...(question.options || [''])];
        newOptions[0] = value || '';
        updateQuestion(field, newOptions);
    };

    const handleTypeChange = (newType: Question['type']) => {
        const updatedQuestion: Partial<Question> = {
            ...question,
            type: newType,
            // FIXED: Super admin logic - explicitly set true/false
            isGlobal: isSuperAdmin ? true : false,
            organizationId: isSuperAdmin ? undefined : user?.organizationId,
        };
        switch (newType) {
            case 'multipleChoice':
                updatedQuestion.options = ['', '', '', ''];
                updatedQuestion.correctAnswer = 0;
                updatedQuestion.testCases = [];
                break;
            case 'trueFalse':
                updatedQuestion.options = ['true', 'false'];
                updatedQuestion.correctAnswer = undefined;
                updatedQuestion.testCases = [];
                break;
            case 'codeChallenge':
                updatedQuestion.testCases = [];
                updatedQuestion.options = [];
                updatedQuestion.correctAnswer = undefined;
                break;
            case 'codeDebugging':
                updatedQuestion.options = [''];
                updatedQuestion.testCases = [];
                updatedQuestion.correctAnswer = undefined;
                break;
        }
        setQuestion(updatedQuestion);
    };

    const addOption = () => {
        const newOptions = [...(question.options || []), ''];
        updateQuestion('options', newOptions);
    };

    const removeOption = (index: number) => {
        const newOptions = (question.options || []).filter((_, i) => i !== index);
        const newCorrectAnswer =
            typeof question.correctAnswer === 'number' && question.correctAnswer >= index
                ? Math.max(0, question.correctAnswer - 1)
                : question.correctAnswer;
        updateQuestion('options', newOptions);
        if (newOptions.length > 0) {
            updateQuestion('correctAnswer', newCorrectAnswer);
        }
    };

    const addTestCase = () => {
        const newTestCases = [
            ...(question.testCases || []),
            {
                input: '',
                output: '',
                hidden: false,
            },
        ];
        updateQuestion('testCases', newTestCases);
    };

    const removeTestCase = (index: number) => {
        const newTestCases = (question.testCases || []).filter((_, i) => i !== index);
        updateQuestion('testCases', newTestCases);
    };

    const getMonacoLanguage = (language: Language | undefined): string => {
        switch (language) {
            case 'react':
            case 'reactNative':
            case 'express':
                return 'javascript';
            case 'flutter':
                return 'dart';
            case 'typescript':
                return 'typescript';
            case 'javascript':
                return 'javascript';
            case 'html':
                return 'html';
            case 'css':
                return 'css';
            case 'json':
                return 'json';
            case 'sql':
                return 'sql';
            case 'python':
                return 'python';
            case 'dart':
                return 'dart';
            default:
                return 'plaintext';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const stepErrors = [...validateStep(1), ...validateStep(2)];
        setErrors(stepErrors);
        if (stepErrors.length > 0) return;

        if (!user?.id) {
            setErrors(['User authentication required to save question']);
            return;
        }

        setIsSubmitting(true);
        try {
            let response;
            const questionData: Partial<Question> = {
                title: question.title,
                description: question.description,
                type: question.type,
                language: question.language,
                difficulty: question.difficulty,
                status: question.status || 'draft',
                tags: Array.isArray(question.tags) ? [...question.tags] : [],
                options: question.type === 'codeDebugging' || question.type === 'multipleChoice' ?
                    (question.options || []) :
                    question.type === 'trueFalse' ? ['true', 'false'] : undefined,
                correctAnswer: question.correctAnswer,
                testCases: question.testCases,
                isGlobal: isSuperAdmin ? true : false,
                // ✅ REMOVED: Don't send organizationId - let backend determine it based on user
                createdBy: user.id,
            };

            console.log('Submitting questionData:', JSON.stringify(questionData, null, 2));
            console.log('User:', user);
            console.log('isSuperAdmin:', isSuperAdmin);
            console.log('Question status before submit:', question.status);

            if (question.id) {
                response = await apiService.updateQuestion(question.id, questionData);
            } else {
                response = await apiService.createQuestion(questionData);
            }

            if (response.error) {
                setErrors([response.message || 'Failed to save question']);
                return;
            }

            if (response.data) {
                onSubmitSuccess?.(response.data);
                navigate('/admin/question-bank');
            }
        } catch (err) {
            console.error('Submission error:', err);
            setErrors(['An unexpected error occurred while saving the question']);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSummary = () => (
        <div>
            <h6 className="mb-3">Basic Information</h6>
            <div><strong>Title:</strong> {question.title || 'Not set'}</div>
            <div><strong>Type:</strong> {question.type || 'Not set'}</div>
            <div><strong>Language:</strong> {PROGRAMMING_LANGUAGES.find((lang) => lang.value === question.language)?.label || 'Not set'}</div>
            <div><strong>Difficulty:</strong> {question.difficulty || 'Not set'}</div>
            <div><strong>Status:</strong> {question.status || 'Not set'}</div>
            <div><strong>Global:</strong> {isSuperAdmin ? 'Yes (Super Admin)' : 'No'}</div>
            <div><strong>Tags:</strong> {question.tags?.length ? question.tags.join(', ') : 'None'}</div>
            <hr />
            <h6 className="mb-3">Question Content</h6>
            <div><strong>Description:</strong> {question.description || 'Not set'}</div>
            {['multipleChoice'].includes(question.type || '') && (
                <>
                    <div><strong>Code Snippet:</strong></div>
                    {question.options?.[0] ? <pre>{question.options[0]}</pre> : <div>None</div>}
                    <div><strong>Options:</strong></div>
                    <ul>
                        {(question.options || []).slice(1).map((opt, index) => (
                            <li key={index}>
                                {String.fromCharCode(65 + index)}: {opt || 'Not set'} {question.correctAnswer === index + 1 ? '(Correct)' : ''}
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {question.type === 'trueFalse' && (
                <div><strong>Correct Answer:</strong> {question.correctAnswer !== undefined ? String(question.correctAnswer) : 'Not set'}</div>
            )}
            {['codeChallenge', 'codeDebugging'].includes(question.type || '') && (
                <>
                    <div><strong>{question.type === 'codeDebugging' ? 'Broken Code' : 'Starter Code'}:</strong></div>
                    {question.options?.[0] ? <pre>{question.options[0]}</pre> : <div>None</div>}
                    <div><strong>Test Cases:</strong></div>
                    {question.testCases?.length ? (
                        <ul>
                            {question.testCases.map((tc, index) => (
                                <li key={index}>
                                    Input: {tc.input || 'Not set'}, Output: {tc.output || 'Not set'}, Hidden: {tc.hidden ? 'Yes' : 'No'}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>None</div>
                    )}
                </>
            )}
        </div>
    );

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', marginTop: '20px' }}>
            <div className="bg-white shadow-sm border-bottom">
                <Container>
                    <div className="py-3">
                        <Row className="align-items-center">
                            <Col>
                                <div className="d-flex align-items-center">
                                    <BookOpen className="me-3 text-success icon-lg" />
                                    <div>
                                        <h1 className="h4 mb-0">
                                            {question.id ? 'Edit Question' : 'Create New Question'}
                                        </h1>
                                        <p className="text-muted mb-0 small">
                                            {question.id ? 'Update an existing question in the question bank' : 'Add a new question to the question bank'}
                                        </p>
                                    </div>
                                </div>
                            </Col>
                            <Col xs="auto">
                                <div className="d-flex align-items-center gap-2">
                                    {isSuperAdmin && (
                                        <Badge color="primary" className="d-flex align-items-center">
                                            <Globe className="me-1 icon-xs" />
                                            Global
                                        </Badge>
                                    )}
                                    {question.status && (
                                        <Badge
                                            color={
                                                question.status === 'active' ? 'success' :
                                                    question.status === 'draft' ? 'warning' : 'secondary'
                                            }
                                            className="d-flex align-items-center"
                                        >
                                            <CheckCircle className="me-1 icon-xs" />
                                            {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                                        </Badge>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>
            <Container className="py-4">
                {errors.length > 0 && (
                    <Alert color="danger" className="mb-4 d-flex align-items-start">
                        <AlertCircle className="me-2 mt-1 icon-sm flex-shrink-0" />
                        <div>
                            <strong>Please fix the following errors:</strong>
                            <ul className="mb-0 mt-2">
                                {errors.map((err, index) => (
                                    <li key={index}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </Alert>
                )}
                <Progress value={(activeStep / 3) * 100} className="mb-4" color="primary">
                    Step {activeStep} of 3
                </Progress>
                <Card className="border-0 shadow-sm mb-4 transition-hover">
                    <CardBody>
                        <Nav tabs className="mb-4">
                            <NavItem>
                                <NavLink active={activeStep === 1} className="cursor-pointer" onClick={() => setActiveStep(1)}>
                                    1. Basic Information
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink active={activeStep === 2} className="cursor-pointer" onClick={() => setActiveStep(2)}>
                                    2. Question Content
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink active={activeStep === 3} className="cursor-pointer" onClick={() => setActiveStep(3)}>
                                    3. Review & Submit
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={activeStep.toString()}>
                            <TabPane tabId="1">
                                <CardTitle tag="h5" className="mb-3 d-flex align-items-center">
                                    <BookOpen className="me-2 text-primary icon-md" />
                                    Basic Information
                                </CardTitle>
                                <Row className="mb-3">
                                    <Col md={compact ? 12 : 8}>
                                        <FormGroup>
                                            <Label for="title" className="fw-medium">Question Title *</Label>
                                            <Input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={question.title || ''}
                                                onChange={handleInputChange}
                                                placeholder="e.g., JavaScript Variable Hoisting"
                                                className="form-control-lg"
                                                bsSize={compact ? 'sm' : undefined}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={compact ? 12 : 4}>
                                        <FormGroup>
                                            <Label for="type" className="fw-medium">Question Type *</Label>
                                            <Input
                                                type="select"
                                                id="type"
                                                name="type"
                                                value={question.type || ''}
                                                onChange={(e) => handleTypeChange(e.target.value as Question['type'])}
                                                className="form-control-lg"
                                                bsSize={compact ? 'sm' : undefined}
                                            >
                                                <option value="">Select type</option>
                                                <option value="trueFalse">True/False</option>
                                                <option value="multipleChoice">Multiple Choice</option>
                                                <option value="codeChallenge">Code Challenge</option>
                                                <option value="codeDebugging">Code Debugging</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col md={compact ? 12 : 6}>
                                        <FormGroup>
                                            <Label for="language" className="fw-medium">Programming Language *</Label>
                                            <Input
                                                type="select"
                                                id="language"
                                                name="language"
                                                value={question.language || ''}
                                                onChange={handleInputChange}
                                                className="form-control-lg"
                                                bsSize={compact ? 'sm' : undefined}
                                            >
                                                <option value="">Select language</option>
                                                {PROGRAMMING_LANGUAGES.map((lang) => (
                                                    <option key={lang.value} value={lang.value}>
                                                        {lang.label}
                                                    </option>
                                                ))}
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md={compact ? 12 : 3}>
                                        <FormGroup>
                                            <Label for="difficulty" className="fw-medium">Difficulty *</Label>
                                            <Input
                                                type="select"
                                                id="difficulty"
                                                name="difficulty"
                                                value={question.difficulty || ''}
                                                onChange={handleInputChange}
                                                className="form-control-lg"
                                                bsSize={compact ? 'sm' : undefined}
                                            >
                                                <option value="">Select difficulty</option>
                                                <option value="easy">Easy</option>
                                                <option value="medium">Medium</option>
                                                <option value="hard">Hard</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                    <Col md={compact ? 12 : 3}>
                                        <FormGroup>
                                            <Label for="status" className="fw-medium">Status</Label>
                                            <Input
                                                type="select"
                                                id="status"
                                                name="status"
                                                value={question.status || 'draft'}
                                                onChange={handleInputChange}
                                                className="form-control-lg"
                                                bsSize={compact ? 'sm' : undefined}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="active">Active</option>
                                                <option value="archived">Archived</option>
                                            </Input>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <FormGroup className="mb-3">
                                    <Label className="fw-medium">Tags</Label>
                                    <div className="mt-2">
                                        {['Web Technologies', 'React', 'React Native', 'Flutter', 'Express', 'SQL', 'Python', 'General'].map((group) => (
                                            <div key={group} className="mb-3">
                                                <h6 className="mb-2">{group}</h6>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {TAGS_OPTIONS.filter((tag) => tag.group === group).map((tag) => (
                                                        <Badge
                                                            key={tag.value}
                                                            color={(question.tags || []).includes(tag.value) ? 'primary' : 'secondary'}
                                                            className="cursor-pointer px-3 py-2"
                                                            onClick={() => handleTagToggle(tag.value)}
                                                            style={{ borderRadius: '12px', fontSize: '0.9rem' }}
                                                        >
                                                            {tag.label}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <small className="text-muted">Click tags to select or deselect</small>
                                </FormGroup>
                            </TabPane>
                            <TabPane tabId="2">
                                <CardTitle tag="h5" className="mb-3 d-flex align-items-center">
                                    <Code className="me-2 text-primary icon-md" />
                                    Question Content
                                </CardTitle>
                                <FormGroup className="mb-3">
                                    <Label for="description" className="fw-medium">Question Text *</Label>
                                    <Input
                                        type="textarea"
                                        id="description"
                                        name="description"
                                        value={question.description || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter the question description..."
                                        rows={compact ? 2 : 4}
                                        className="form-control-lg"
                                        bsSize={compact ? 'sm' : undefined}
                                    />
                                </FormGroup>
                                {question.type === 'multipleChoice' && (
                                    <>
                                        <FormGroup className="mb-3">
                                            <Label for="codeInput" className="fw-medium">Code Snippet (Optional)</Label>
                                            <Editor
                                                height={compact ? '200px' : '400px'}
                                                language={getMonacoLanguage(question.language)}
                                                value={question.options?.[0] || ''}
                                                onChange={(value) => handleCodeChange(value, 'options')}
                                                options={{
                                                    fontSize: 14,
                                                    fontFamily: 'monospace',
                                                    minimap: { enabled: false },
                                                    scrollBeyondLastLine: false,
                                                    lineNumbers: 'on',
                                                    roundedSelection: false,
                                                    padding: { top: 10 },
                                                    automaticLayout: true,
                                                }}
                                                className="border rounded"
                                            />
                                            <small className="text-muted mt-2">Optionally provide code that the question refers to</small>
                                        </FormGroup>
                                        {(question.options || []).slice(1).map((option, index) => (
                                            <div key={index} className="mb-3 p-3 bg-light rounded">
                                                <div className="d-flex align-items-center mb-2">
                                                    <Input
                                                        type="radio"
                                                        name="correctAnswer"
                                                        value={index + 1}
                                                        checked={question.correctAnswer === index + 1}
                                                        onChange={() => updateQuestion('correctAnswer', index + 1)}
                                                        className="me-2"
                                                    />
                                                    <Label className="mb-0 me-2 fw-medium">
                                                        Option {String.fromCharCode(65 + index)}
                                                    </Label>
                                                    {(question.options || []).slice(1).length > 2 && (
                                                        <Button
                                                            type="button"
                                                            color="outline-danger"
                                                            size="sm"
                                                            onClick={() => removeOption(index + 1)}
                                                            className="ms-auto d-flex align-items-center"
                                                        >
                                                            <Trash2 className="icon-xs" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <Input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [...(question.options || [''])];
                                                        newOptions[index + 1] = e.target.value;
                                                        updateQuestion('options', newOptions);
                                                    }}
                                                    placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                                                    className="ms-4 form-control-lg"
                                                    bsSize={compact ? 'sm' : undefined}
                                                />
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            color="success"
                                            size="sm"
                                            onClick={addOption}
                                            className="d-flex align-items-center"
                                        >
                                            <Plus className="me-2 icon-xs" />
                                            Add Option
                                        </Button>
                                    </>
                                )}
                                {question.type === 'trueFalse' && (
                                    <div className="d-flex gap-3">
                                        <Button
                                            type="button"
                                            color={question.correctAnswer === true ? 'success' : 'outline-success'}
                                            onClick={() => updateQuestion('correctAnswer', true)}
                                            size="lg"
                                            className="px-4 d-flex align-items-center"
                                        >
                                            <CheckCircle className="me-2 icon-sm" />
                                            True
                                        </Button>
                                        <Button
                                            type="button"
                                            color={question.correctAnswer === false ? 'danger' : 'outline-danger'}
                                            onClick={() => updateQuestion('correctAnswer', false)}
                                            size="lg"
                                            className="px-4 d-flex align-items-center"
                                        >
                                            <X className="me-2 icon-sm" />
                                            False
                                        </Button>
                                    </div>
                                )}
                                {['codeChallenge', 'codeDebugging'].includes(question.type || '') && (
                                    <>
                                        <FormGroup className="mb-3">
                                            <Label for="codeInput" className="fw-medium">
                                                {question.type === 'codeDebugging' ? 'Broken Code *' : 'Starter Code (Optional)'}
                                            </Label>
                                            <Editor
                                                height={compact ? '200px' : '400px'}
                                                language={getMonacoLanguage(question.language)}
                                                value={question.options?.[0] || ''}
                                                onChange={(value) => handleCodeChange(value, 'options')}
                                                options={{
                                                    fontSize: 14,
                                                    fontFamily: 'monospace',
                                                    minimap: { enabled: false },
                                                    scrollBeyondLastLine: false,
                                                    lineNumbers: 'on',
                                                    roundedSelection: false,
                                                    padding: { top: 10 },
                                                    automaticLayout: true,
                                                }}
                                                className="border rounded"
                                            />
                                            <small className="text-muted mt-2">
                                                {question.type === 'codeDebugging'
                                                    ? 'Provide code with intentional bugs for students to fix'
                                                    : 'Provide a starting point for students to build upon'}
                                            </small>
                                        </FormGroup>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0">Test Cases *</h6>
                                            <Button
                                                type="button"
                                                color="success"
                                                size="sm"
                                                onClick={addTestCase}
                                                className="d-flex align-items-center"
                                            >
                                                <Plus className="me-2 icon-xs" />
                                                Add Test Case
                                            </Button>
                                        </div>
                                        {(question.testCases || []).length === 0 && (
                                            <div className="text-center py-4 text-muted">
                                                <Code className="mb-2 icon-lg" />
                                                <p>No test cases added yet. Click "Add Test Case" to get started.</p>
                                            </div>
                                        )}
                                        {(question.testCases || []).map((testCase, index) => (
                                            <Card key={index} className="mb-3 bg-light border-0">
                                                <CardBody>
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h6 className="mb-0">Test Case {index + 1}</h6>
                                                        <Button
                                                            type="button"
                                                            color="outline-danger"
                                                            size="sm"
                                                            onClick={() => removeTestCase(index)}
                                                            className="d-flex align-items-center"
                                                        >
                                                            <Trash2 className="icon-xs" />
                                                        </Button>
                                                    </div>
                                                    <Row>
                                                        <Col md={compact ? 12 : 6}>
                                                            <FormGroup>
                                                                <Label className="fw-medium">Input</Label>
                                                                <Input
                                                                    type="text"
                                                                    name={`testCase.${index}.input`}
                                                                    value={testCase.input || ''}
                                                                    onChange={handleInputChange}
                                                                    placeholder="e.g., filterArray([1,2,3], x => x > 2)"
                                                                    style={{ fontFamily: 'monospace', fontSize: '13px' }}
                                                                    className="form-control-lg"
                                                                    bsSize={compact ? 'sm' : undefined}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md={compact ? 12 : 6}>
                                                            <FormGroup>
                                                                <Label className="fw-medium">Expected Output</Label>
                                                                <Input
                                                                    type="text"
                                                                    name={`testCase.${index}.output`}
                                                                    value={testCase.output || ''}
                                                                    onChange={handleInputChange}
                                                                    placeholder="e.g., [3]"
                                                                    style={{ fontFamily: 'monospace', fontSize: '13px' }}
                                                                    className="form-control-lg"
                                                                    bsSize={compact ? 'sm' : undefined}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <div className="form-check">
                                                        <Input
                                                            type="checkbox"
                                                            name={`testCase.${index}.hidden`}
                                                            checked={testCase.hidden}
                                                            onChange={handleCheckboxChange}
                                                            className="form-check-input"
                                                            id={`testCase.${index}.hidden`}
                                                        />
                                                        <Label for={`testCase.${index}.hidden`} className="form-check-label">
                                                            Hidden from student
                                                        </Label>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </>
                                )}
                            </TabPane>
                            <TabPane tabId="3">
                                <CardTitle tag="h5" className="mb-3 d-flex align-items-center">
                                    <CheckCircle className="me-2 text-primary icon-md" />
                                    Review & Submit
                                </CardTitle>
                                {renderSummary()}
                            </TabPane>
                        </TabContent>
                        <div className="d-flex justify-content-between pt-3">
                            <Button
                                color="secondary"
                                onClick={handlePrevious}
                                disabled={activeStep === 1 || isSubmitting}
                                className="d-flex align-items-center px-4"
                            >
                                <ChevronLeft className="me-2 icon-sm" />
                                Previous
                            </Button>
                            {activeStep < 3 ? (
                                <Button
                                    color="primary"
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className="d-flex align-items-center px-4"
                                >
                                    Next
                                    <ChevronRight className="ms-2 icon-sm" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    color="primary"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !user?.id}
                                    className="d-flex align-items-center px-4"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="me-2">Saving...</span>
                                            <div
                                                className="spinner-border spinner-border-sm"
                                                role="status"
                                                style={{ width: '16px', height: '16px' }}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Save className="me-2 icon-sm" />
                                            {submitLabel}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                        {showSubmitButton && onCancel && (
                            <Button
                                type="button"
                                color="secondary"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="d-flex align-items-center px-4 mt-2"
                            >
                                <X className="me-2 icon-sm" />
                                Cancel
                            </Button>
                        )}
                    </CardBody>
                </Card>
            </Container>
            <style>{`
        .transition-hover {
          transition: all 0.2s ease-in-out;
        }
        .transition-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        .icon-xs {
          width: 12px;
          height: 12px;
        }
        .icon-sm {
          width: 16px;
          height: 16px;
        }
        .icon-md {
          width: 20px;
          height: 20px;
        }
        .icon-lg {
          width: 24px;
          height: 24px;
        }
        .monaco-editor {
          border: 1px solid #ced4da;
          border-radius: 4px;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .nav-tabs .nav-link {
          color: #495057;
          font-weight: 500;
        }
        .nav-tabs .nav-link.active {
          color: #007bff;
          border-color: #007bff;
        }
      `}</style>
        </div>
    );
};

export default QuestionFormComponent;