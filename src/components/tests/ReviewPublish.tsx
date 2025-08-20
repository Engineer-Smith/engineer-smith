import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    CardBody,
    CardTitle,
    Button,
    Alert,
    Badge,
    Table,
    FormGroup,
    Label,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Progress,
    ButtonGroup,
    Collapse
} from 'reactstrap';
import {
    ArrowLeft,
    CheckCircle,
    AlertTriangle,
    Globe,
    Building,
    Clock,
    Users,
    Target,
    FileText,
    Settings,
    Eye,
    Send,
    Edit3,
    Info,
    X,
    BarChart3,
    Layers,
    TrendingUp,
    Shield
} from 'lucide-react';
import apiService from '../../services/ApiService';
import { createTestPayload } from '../../types/createTest';
import type { WizardStepProps, CreateTestData } from '../../types/createTest';
import type { ValidationItem, TestStatus } from '../../types';
import type { ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

// Interface for estimated metrics
interface EstimatedMetrics {
    avgTimePerQuestion: number;
    estimatedCompletionRate: number;
    estimatedPassRate: number;
    difficultyScore: number;
    totalQuestions: number;
    totalPoints: number;
    avgPointsPerQuestion: number;
}

const ReviewPublish: React.FC<WizardStepProps> = ({
    testData,
    setTestData,
    onPrevious,
    onComplete,
    setError,
    setLoading
}) => {
    const { user, isAuthenticated } = useAuth();
    const [publishModal, setPublishModal] = useState(false);
    const [publishStatus, setPublishStatus] = useState<TestStatus>('draft');
    const [showDetailedPreview, setShowDetailedPreview] = useState(false);
    const [validationDetails, setValidationDetails] = useState<ValidationItem[]>([]);
    const [estimatedMetrics, setEstimatedMetrics] = useState<EstimatedMetrics>({
        avgTimePerQuestion: 0,
        estimatedCompletionRate: 0,
        estimatedPassRate: 0,
        difficultyScore: 0,
        totalQuestions: 0,
        totalPoints: 0,
        avgPointsPerQuestion: 0
    });

    useEffect(() => {
        calculateEstimatedMetrics();
        performDetailedValidation();
    }, [testData]);

    const calculateEstimatedMetrics = () => {
        const totalQuestions = getTotalQuestions();
        const totalPoints = getTotalPoints();
        const timeLimit = testData.settings.timeLimit;

        const avgTimePerQuestion = timeLimit / Math.max(totalQuestions, 1);
        const difficultyScore = calculateDifficultyScore();
        const completionRate = Math.max(0.6, Math.min(0.95, 1 - (difficultyScore * 0.2)));

        setEstimatedMetrics({
            avgTimePerQuestion: Math.round(avgTimePerQuestion * 10) / 10,
            estimatedCompletionRate: Math.round(completionRate * 100),
            estimatedPassRate: Math.round((completionRate * 0.75) * 100),
            difficultyScore: Math.round(difficultyScore * 100) / 100,
            totalQuestions,
            totalPoints,
            avgPointsPerQuestion: Math.round((totalPoints / Math.max(totalQuestions, 1)) * 10) / 10
        });
    };

    const calculateDifficultyScore = () => {
        const languages = testData.languages.length;
        const tags = testData.tags.length;
        const sectioned = testData.settings.useSections ? 0.1 : 0;

        return Math.min(5, (languages * 0.2) + (tags * 0.1) + sectioned + 1.5) / 5;
    };

    const performDetailedValidation = () => {
        const issues: ValidationItem[] = [];
        const warnings: ValidationItem[] = [];
        const suggestions: ValidationItem[] = [];

        // Required field validation
        if (!testData.title.trim()) {
            issues.push({ type: 'error', field: 'title', message: 'Test title is required' });
        }
        if (!testData.description.trim()) {
            issues.push({ type: 'error', field: 'description', message: 'Test description is required' });
        }
        if (!testData.languages.length) {
            issues.push({ type: 'error', field: 'languages', message: 'At least one programming language must be selected' });
        }
        if (!testData.tags.length) {
            issues.push({ type: 'error', field: 'tags', message: 'At least one topic/tag must be selected' });
        }

        // Structure validation
        if (testData.settings.useSections) {
            if (!testData.sections.length) {
                issues.push({ type: 'error', field: 'sections', message: 'At least one section is required' });
            } else {
                testData.sections.forEach((section, index) => {
                    if (!section.name.trim()) {
                        issues.push({ type: 'error', field: `section-${index}`, message: `Section ${index + 1} needs a name` });
                    }
                    if (!section.questions.length) {
                        issues.push({ type: 'error', field: `section-${index}`, message: `Section "${section.name}" needs questions` });
                    }
                });
            }
        } else {
            if (!testData.questions.length) {
                issues.push({ type: 'error', field: 'questions', message: 'At least one question is required' });
            }
        }

        // Settings validation
        if (testData.settings.timeLimit <= 0) {
            issues.push({ type: 'error', field: 'timeLimit', message: 'Time limit must be greater than 0' });
        }
        if (testData.settings.attemptsAllowed <= 0) {
            issues.push({ type: 'error', field: 'attemptsAllowed', message: 'Attempts allowed must be greater than 0' });
        }

        // Warnings for best practices
        if (testData.settings.timeLimit > 180) {
            warnings.push({ type: 'warning', field: 'timeLimit', message: 'Very long tests may lead to fatigue' });
        }
        if (testData.settings.attemptsAllowed > 3) {
            warnings.push({ type: 'warning', field: 'attemptsAllowed', message: 'Many attempts may reduce assessment value' });
        }
        if (getTotalQuestions() < 5) {
            warnings.push({ type: 'warning', field: 'questions', message: 'Consider adding more questions for thorough assessment' });
        }

        // Suggestions for optimization
        if (!testData.settings.shuffleQuestions) {
            suggestions.push({ type: 'suggestion', field: 'shuffle', message: 'Consider enabling question shuffling to prevent cheating' });
        }
        if (testData.testType === 'custom' && testData.languages.length > 1) {
            suggestions.push({ type: 'suggestion', field: 'structure', message: 'Multi-language tests work well with sections' });
        }

        setValidationDetails([...issues, ...warnings, ...suggestions]);
    };

    const getTotalQuestions = () => {
        if (testData.settings.useSections) {
            return testData.sections.reduce((sum, section) => sum + section.questions.length, 0);
        }
        return testData.questions.length;
    };

    const getTotalPoints = () => {
        if (testData.settings.useSections) {
            return testData.sections.reduce((sum, section) =>
                sum + section.questions.reduce((sectionSum, q) => sectionSum + q.points, 0), 0
            );
        }
        return testData.questions.reduce((sum, q) => sum + q.points, 0);
    };

    const getValidationIssues = () => {
        return validationDetails.filter(item => item.type === 'error');
    };

    const handlePublish = async () => {
        if (!isAuthenticated || !user || !['admin', 'instructor'].includes(user.role)) {
            setError('Unauthorized: Only admins or instructors can publish tests');
            return;
        }

        const issues = getValidationIssues();
        if (issues.length > 0) {
            setError(`Cannot publish test with validation issues: ${issues.map(i => i.message).join(', ')}`);
            return;
        }

        setLoading?.(true);
        try {
            const payload = createTestPayload({ ...testData, status: publishStatus });
            const response = await apiService.createTest(payload);

            if (response.error) {
                setError(response.message || 'Failed to create test');
                return;
            }

            setPublishModal(false);
            onComplete?.();
        } catch (error) {
            console.error('Error creating test:', error);
            setError(error instanceof Error ? error.message : 'Failed to create test');
        } finally {
            setLoading?.(false);
        }
    };

    const handlePreview = () => {
        console.log('Preview Test Data:', {
            title: testData.title,
            description: testData.description,
            testType: testData.testType,
            languages: testData.languages,
            tags: testData.tags,
            settings: testData.settings,
            sections: testData.settings.useSections ? testData.sections : undefined,
            questions: !testData.settings.useSections ? testData.questions : undefined
        });
        alert('Previewing test in console. Check developer tools for details.');
    };

    const getStatusColor = (status: TestStatus) => {
        switch (status) {
            case 'draft': return 'warning';
            case 'active': return 'success';
            case 'archived': return 'secondary';
            default: return 'secondary';
        }
    };

    const getValidationIcon = () => {
        const errors = validationDetails.filter(v => v.type === 'error').length;
        const warnings = validationDetails.filter(v => v.type === 'warning').length;

        if (errors > 0) return { icon: AlertTriangle, color: 'danger', text: `${errors} issues` };
        if (warnings > 0) return { icon: AlertTriangle, color: 'warning', text: `${warnings} warnings` };
        return { icon: CheckCircle, color: 'success', text: 'Ready to publish' };
    };

    const validationIcon = getValidationIcon();
    const ValidationIcon = validationIcon.icon;

    const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setPublishStatus(e.target.value as TestStatus);
    };

    return (
        <div>
            {isAuthenticated && user && ['admin', 'instructor'].includes(user.role) ? (
                <Row>
                    <Col lg={8}>
                        {/* Validation Status */}
                        <Card className="border-0 shadow-sm mb-4">
                            <CardBody>
                                <CardTitle tag="h6" className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="d-flex align-items-center">
                                        <ValidationIcon size={20} className={`me-2 text-${validationIcon.color}`} />
                                        Validation Status
                                    </div>
                                    <Button
                                        color="outline-info"
                                        size="sm"
                                        onClick={() => setShowDetailedPreview(!showDetailedPreview)}
                                    >
                                        {showDetailedPreview ? <Eye size={14} /> : <Eye size={14} />}
                                        {showDetailedPreview ? ' Hide Details' : ' Show Details'}
                                    </Button>
                                </CardTitle>

                                <Alert color={validationIcon.color} className="mb-3">
                                    <ValidationIcon size={16} className="me-2" />
                                    <strong>{validationIcon.text}</strong>
                                    <div className="mt-1 small">
                                        {getValidationIssues().length === 0
                                            ? 'Your test passes all validation checks and is ready to publish!'
                                            : 'Please fix the validation issues below before publishing.'
                                        }
                                    </div>
                                </Alert>

                                <Collapse isOpen={showDetailedPreview}>
                                    {validationDetails.map((item, index) => (
                                        <Alert
                                            key={index}
                                            color={item.type === 'error' ? 'danger' : item.type === 'warning' ? 'warning' : 'info'}
                                            className="py-2 mb-2"
                                        >
                                            <div className="d-flex align-items-center">
                                                {item.type === 'error' ? <X size={14} className="me-2" /> :
                                                    item.type === 'warning' ? <AlertTriangle size={14} className="me-2" /> :
                                                        <Info size={14} className="me-2" />}
                                                <div>
                                                    <strong>{item.field}:</strong> {item.message}
                                                </div>
                                            </div>
                                        </Alert>
                                    ))}
                                </Collapse>
                            </CardBody>
                        </Card>

                        {/* Test Overview */}
                        <Card className="border-0 shadow-sm mb-4">
                            <CardBody>
                                <CardTitle tag="h6" className="d-flex align-items-center mb-3">
                                    <FileText size={20} className="me-2" />
                                    Test Overview
                                </CardTitle>

                                <Row>
                                    <Col md={8}>
                                        <Table borderless className="mb-0">
                                            <tbody>
                                                <tr>
                                                    <td width="30%" className="fw-bold">Title:</td>
                                                    <td>{testData.title || <em className="text-muted">Not set</em>}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold">Description:</td>
                                                    <td>{testData.description || <em className="text-muted">Not set</em>}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold">Template:</td>
                                                    <td>
                                                        <Badge color="info">
                                                            {testData.testType ? testData.testType.replace('_', ' ').toUpperCase() : 'CUSTOM'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold">Structure:</td>
                                                    <td>
                                                        <Badge color="primary">
                                                            {testData.settings.useSections ? (
                                                                <>
                                                                    <Layers size={12} className="me-1" />
                                                                    Sectioned Test
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FileText size={12} className="me-1" />
                                                                    Single Test
                                                                </>
                                                            )}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold">Visibility:</td>
                                                    <td>
                                                        <Badge color={testData.isGlobal ? 'primary' : 'secondary'}>
                                                            {testData.isGlobal ? (
                                                                <>
                                                                    <Globe size={12} className="me-1" />
                                                                    Global
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Building size={12} className="me-1" />
                                                                    Organization
                                                                </>
                                                            )}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                    <Col md={4}>
                                        <Card className="bg-light border-0">
                                            <CardBody className="text-center">
                                                <h6 className="mb-3">Quick Stats</h6>
                                                <div className="d-flex justify-content-around">
                                                    <div>
                                                        <div className="h5 mb-0 text-primary">{getTotalQuestions()}</div>
                                                        <small className="text-muted">Questions</small>
                                                    </div>
                                                    <div>
                                                        <div className="h5 mb-0 text-success">{getTotalPoints()}</div>
                                                        <small className="text-muted">Points</small>
                                                    </div>
                                                    <div>
                                                        <div className="h5 mb-0 text-warning">{testData.settings.timeLimit}</div>
                                                        <small className="text-muted">Minutes</small>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>

                        {/* Languages and Topics */}
                        <Card className="border-0 shadow-sm mb-4">
                            <CardBody>
                                <CardTitle tag="h6" className="d-flex align-items-center mb-3">
                                    <Target size={20} className="me-2" />
                                    Languages & Topics
                                </CardTitle>

                                <Row>
                                    <Col md={6}>
                                        <Label className="fw-bold">Programming Languages ({testData.languages.length}):</Label>
                                        <div className="mb-3">
                                            {testData.languages.length > 0 ? (
                                                testData.languages.map((lang) => (
                                                    <Badge key={lang} color="secondary" className="me-2 mb-1">
                                                        {lang}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <em className="text-muted">None selected</em>
                                            )}
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <Label className="fw-bold">Topics & Skills ({testData.tags.length}):</Label>
                                        <div>
                                            {testData.tags.length > 0 ? (
                                                <div>
                                                    {testData.tags.slice(0, 8).map((tag) => (
                                                        <Badge key={tag} color="light" className="me-1 mb-1">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {testData.tags.length > 8 && (
                                                        <Badge color="info" className="mb-1">
                                                            +{testData.tags.length - 8} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <em className="text-muted">None selected</em>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>

                        {/* Test Settings */}
                        <Card className="border-0 shadow-sm mb-4">
                            <CardBody>
                                <CardTitle tag="h6" className="d-flex align-items-center mb-3">
                                    <Settings size={20} className="me-2" />
                                    Test Configuration
                                </CardTitle>

                                <Row>
                                    <Col md={6}>
                                        <Table borderless size="sm">
                                            <tbody>
                                                <tr>
                                                    <td className="fw-bold">Time Limit:</td>
                                                    <td>
                                                        <Badge color="warning">
                                                            <Clock size={12} className="me-1" />
                                                            {testData.settings.timeLimit} minutes
                                                        </Badge>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold">Attempts Allowed:</td>
                                                    <td>
                                                        <Badge color="info">
                                                            <Users size={12} className="me-1" />
                                                            {testData.settings.attemptsAllowed}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-bold">Shuffle Questions:</td>
                                                    <td>
                                                        <Badge color={testData.settings.shuffleQuestions ? 'success' : 'secondary'}>
                                                            {testData.settings.shuffleQuestions ? 'Yes' : 'No'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Col>
                                    <Col md={6}>
                                        <Alert color="info" className="mb-0">
                                            <BarChart3 size={16} className="me-2" />
                                            <strong>Estimated Metrics</strong>
                                            <ul className="mb-0 mt-2 small">
                                                <li>Avg. time per question: {estimatedMetrics.avgTimePerQuestion} min</li>
                                                <li>Estimated completion rate: {estimatedMetrics.estimatedCompletionRate}%</li>
                                                <li>Difficulty score: {estimatedMetrics.difficultyScore}/5</li>
                                            </ul>
                                        </Alert>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>

                        {/* Questions/Sections Overview */}
                        <Card className="border-0 shadow-sm mb-4">
                            <CardBody>
                                <CardTitle tag="h6" className="d-flex align-items-center mb-3">
                                    <FileText size={20} className="me-2" />
                                    {testData.settings.useSections ? 'Sections Overview' : 'Questions Overview'}
                                </CardTitle>

                                {testData.settings.useSections ? (
                                    testData.sections.length > 0 ? (
                                        <Table responsive>
                                            <thead>
                                                <tr>
                                                    <th>Section</th>
                                                    <th>Questions</th>
                                                    <th>Points</th>
                                                    <th>Time Limit</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {testData.sections.map((section, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <Badge color="primary" className="me-2">{index + 1}</Badge>
                                                                {section.name}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Badge color="info">{section.questions.length}</Badge>
                                                        </td>
                                                        <td>
                                                            <Badge color="success">
                                                                {section.questions.reduce((sum, q) => sum + q.points, 0)}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Badge color="warning">{section.timeLimit} min</Badge>
                                                        </td>
                                                        <td>
                                                            {section.questions.length > 0 ? (
                                                                <Badge color="success">
                                                                    <CheckCircle size={12} className="me-1" />
                                                                    Ready
                                                                </Badge>
                                                            ) : (
                                                                <Badge color="danger">
                                                                    <AlertTriangle size={12} className="me-1" />
                                                                    Empty
                                                                </Badge>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <Alert color="warning">
                                            <AlertTriangle size={16} className="me-2" />
                                            No sections defined. Please add at least one section.
                                        </Alert>
                                    )
                                ) : (
                                    <Alert color="info" className="mb-0">
                                        <FileText size={16} className="me-2" />
                                        This test contains <strong>{getTotalQuestions()}</strong> questions worth a total of{' '}
                                        <strong>{getTotalPoints()}</strong> points.
                                        <div className="mt-1 small">
                                            Average points per question: <strong>{estimatedMetrics.avgPointsPerQuestion}</strong>
                                        </div>
                                    </Alert>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Enhanced Summary Sidebar */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm sticky-top">
                            <CardBody>
                                <CardTitle tag="h6" className="d-flex align-items-center mb-3">
                                    <TrendingUp size={20} className="me-2" />
                                    Publication Summary
                                </CardTitle>

                                {/* Key Metrics */}
                                <div className="mb-4">
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <div className="text-center p-2 bg-primary bg-opacity-10 rounded">
                                                <div className="h4 mb-0 text-primary">{getTotalQuestions()}</div>
                                                <small className="text-muted">Questions</small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-center p-2 bg-success bg-opacity-10 rounded">
                                                <div className="h4 mb-0 text-success">{getTotalPoints()}</div>
                                                <small className="text-muted">Points</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <div className="text-center p-2 bg-warning bg-opacity-10 rounded">
                                                <div className="h5 mb-0 text-warning">{testData.settings.timeLimit}</div>
                                                <small className="text-muted">Minutes</small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-center p-2 bg-info bg-opacity-10 rounded">
                                                <div className="h5 mb-0 text-info">{testData.languages.length}</div>
                                                <small className="text-muted">Languages</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Configuration Summary */}
                                <div className="mb-4">
                                    <Label className="fw-bold mb-2">Configuration:</Label>
                                    <div className="d-flex flex-wrap gap-1 mb-2">
                                        <Badge color={testData.isGlobal ? "primary" : "secondary"}>
                                            {testData.isGlobal ? "Global" : "Organization"}
                                        </Badge>
                                        <Badge color={testData.settings.useSections ? "info" : "success"}>
                                            {testData.settings.useSections ? "Sectioned" : "Single"}
                                        </Badge>
                                        <Badge color={getStatusColor(testData.status)}>
                                            {testData.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    {testData.settings.shuffleQuestions && (
                                        <div className="small text-muted">
                                            <Shield size={12} className="me-1" />
                                            Question shuffling enabled
                                        </div>
                                    )}
                                </div>

                                {/* Validation Summary */}
                                <div className="mb-4">
                                    <Label className="fw-bold mb-2">Validation:</Label>
                                    <div className="mb-2">
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span>Issues:</span>
                                            <Badge color="danger">
                                                {validationDetails.filter(v => v.type === 'error').length}
                                            </Badge>
                                        </div>
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span>Warnings:</span>
                                            <Badge color="warning">
                                                {validationDetails.filter(v => v.type === 'warning').length}
                                            </Badge>
                                        </div>
                                        <div className="d-flex justify-content-between small">
                                            <span>Suggestions:</span>
                                            <Badge color="info">
                                                {validationDetails.filter(v => v.type === 'suggestion').length}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Progress
                                        value={getValidationIssues().length === 0 ? 100 : 50}
                                        color={getValidationIssues().length === 0 ? "success" : "danger"}
                                        className="mb-2"
                                        style={{ height: '6px' }}
                                    />
                                </div>

                                {testData.settings.useSections && (
                                    <div className="mb-4">
                                        <Label className="fw-bold mb-2">Sections ({testData.sections.length}):</Label>
                                        {testData.sections.length > 0 ? (
                                            testData.sections.map((section, index) => (
                                                <div key={index} className="d-flex justify-content-between align-items-center mb-1 p-2 bg-light rounded">
                                                    <small className="text-truncate me-2" style={{ maxWidth: '120px' }}>
                                                        {index + 1}. {section.name}
                                                    </small>
                                                    <div>
                                                        <Badge color="info" className="me-1">
                                                            {section.questions.length} Q
                                                        </Badge>
                                                        <Badge color="success">
                                                            {section.questions.reduce((sum, q) => sum + q.points, 0)} pts
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <em className="text-muted">No sections defined</em>
                                        )}
                                    </div>
                                )}

                                {/* Estimated Performance */}
                                <div className="mb-4">
                                    <Label className="fw-bold mb-2">Estimated Performance:</Label>
                                    <Alert color="light" className="py-2 mb-2">
                                        <div className="small">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span>Completion Rate:</span>
                                                <Badge color="info">{estimatedMetrics.estimatedCompletionRate}%</Badge>
                                            </div>
                                            <div className="d-flex justify-content-between mb-1">
                                                <span>Pass Rate:</span>
                                                <Badge color="success">{estimatedMetrics.estimatedPassRate}%</Badge>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span>Difficulty:</span>
                                                <Badge color={estimatedMetrics.difficultyScore > 3.5 ? "danger" : estimatedMetrics.difficultyScore > 2.5 ? "warning" : "success"}>
                                                    {estimatedMetrics.difficultyScore}/5
                                                </Badge>
                                            </div>
                                        </div>
                                    </Alert>
                                </div>

                                {/* Publication Actions */}
                                <div className="d-grid gap-2">
                                    <Button
                                        color="primary"
                                        size="lg"
                                        onClick={() => setPublishModal(true)}
                                        disabled={getValidationIssues().length > 0}
                                        className="d-flex align-items-center justify-content-center"
                                    >
                                        <Send size={16} className="me-2" />
                                        {getValidationIssues().length > 0 ? 'Fix Issues to Publish' : 'Publish Test'}
                                    </Button>

                                    {getValidationIssues().length === 0 && (
                                        <ButtonGroup>
                                            <Button
                                                color="outline-secondary"
                                                size="sm"
                                                onClick={() => {
                                                    setPublishStatus('draft');
                                                    setPublishModal(true);
                                                }}
                                            >
                                                <Edit3 size={14} className="me-1" />
                                                Save Draft
                                            </Button>
                                            <Button
                                                color="outline-info"
                                                size="sm"
                                                onClick={handlePreview}
                                            >
                                                <Eye size={14} className="me-1" />
                                                Preview
                                            </Button>
                                        </ButtonGroup>
                                    )}

                                    {getValidationIssues().length > 0 && (
                                        <small className="text-muted text-center">
                                            <AlertTriangle size={12} className="me-1" />
                                            Fix {getValidationIssues().length} validation issue(s) to publish
                                        </small>
                                    )}
                                </div>

                                {/* Backend Alignment Notice */}
                                <Alert color="light" className="mt-3 mb-0">
                                    <Info size={14} className="me-2" />
                                    <small>
                                        <strong>Backend Ready:</strong> This test configuration fully leverages your backend model's capabilities including template types, language filtering, tag-based categorization, and flexible section/question structures.
                                    </small>
                                </Alert>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            ) : (
                <Alert color="danger">
                    <AlertTriangle size={16} className="me-2" />
                    Unauthorized: Only admins or instructors can access this page.
                </Alert>
            )}

            {/* Publish Modal */}
            <Modal isOpen={publishModal} toggle={() => setPublishModal(false)} size="lg">
                <ModalHeader toggle={() => setPublishModal(false)}>
                    <div className="d-flex align-items-center">
                        <Send size={20} className="me-2" />
                        Publish Test
                    </div>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col md={8}>
                            <FormGroup>
                                <Label for="publishStatus" className="fw-bold">
                                    Publication Status
                                </Label>
                                <Input
                                    type="select"
                                    id="publishStatus"
                                    value={publishStatus}
                                    onChange={handleStatusChange as any}
                                >
                                    <option value="draft">Save as Draft</option>
                                    <option value="active">Publish Active</option>
                                </Input>
                                <small className="text-muted">
                                    {publishStatus === 'draft'
                                        ? 'Save the test as a draft. Students cannot access draft tests.'
                                        : 'Publish the test as active. Students will be able to take this test immediately.'}
                                </small>
                            </FormGroup>

                            <Alert color={publishStatus === 'active' ? 'warning' : 'info'} className="mt-3">
                                <div className="d-flex align-items-start">
                                    {publishStatus === 'active' ? (
                                        <AlertTriangle size={16} className="me-2 mt-1" />
                                    ) : (
                                        <Info size={16} className="me-2 mt-1" />
                                    )}
                                    <div>
                                        <strong>
                                            {publishStatus === 'active' ? 'Publishing Active Test' : 'Saving as Draft'}
                                        </strong>
                                        <div className="mt-1 small">
                                            {publishStatus === 'active'
                                                ? 'Once published as active, students will immediately be able to access and take this test. Make sure all settings are correct.'
                                                : 'The test will be saved but not visible to students. You can edit and publish it later from the test management interface.'}
                                        </div>
                                    </div>
                                </div>
                            </Alert>
                        </Col>
                        <Col md={4}>
                            <Card className="bg-light border-0">
                                <CardBody>
                                    <h6 className="mb-3">Final Summary</h6>
                                    <div className="small">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Questions:</span>
                                            <strong>{getTotalQuestions()}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Points:</span>
                                            <strong>{getTotalPoints()}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Time Limit:</span>
                                            <strong>{testData.settings.timeLimit} min</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Attempts:</span>
                                            <strong>{testData.settings.attemptsAllowed}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Languages:</span>
                                            <strong>{testData.languages.length}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Topics:</span>
                                            <strong>{testData.tags.length}</strong>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="d-flex justify-content-between">
                                            <span>Visibility:</span>
                                            <Badge color={testData.isGlobal ? "primary" : "secondary"}>
                                                {testData.isGlobal ? "Global" : "Organization"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setPublishModal(false)}>
                        Cancel
                    </Button>
                    <Button color="primary" onClick={handlePublish}>
                        <Send size={16} className="me-2" />
                        {publishStatus === 'draft' ? 'Save Draft' : 'Publish Test'}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Navigation */}
            <div className="d-flex justify-content-between mt-4">
                <Button color="secondary" onClick={onPrevious} className="d-flex align-items-center">
                    <ArrowLeft size={16} className="me-1" />
                    Previous: Questions
                </Button>
                <div className="text-end">
                    <div className="text-muted small mb-1">Ready to launch your test?</div>
                    <Badge color={getValidationIssues().length === 0 ? "success" : "danger"}>
                        {getValidationIssues().length === 0 ? "All systems go!" : `${getValidationIssues().length} issues remaining`}
                    </Badge>
                </div>
            </div>
        </div>
    );
};

export default ReviewPublish;