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
    FormGroup,
    Label,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ButtonGroup
} from 'reactstrap';
import {
    ArrowLeft,
    CheckCircle,
    AlertTriangle,
    Globe,
    Building,
    Eye,
    Send,
    Edit3,
    Info,
    Bookmark
} from 'lucide-react';
import apiService from '../../services/ApiService';
import { createTestPayload, getTestScopeText, canCreateGlobalTests } from '../../types/createTest';
import type { WizardStepProps } from '../../types/createTest';
import type { TestStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ValidationIssue {
    type: 'error' | 'warning' | 'suggestion';
    field: string;
    message: string;
}

const ReviewPublish: React.FC<WizardStepProps> = ({
    testData,
    setTestData,
    onPrevious,
    onComplete,
    setError,
    setLoading
}) => {
    const { user } = useAuth();
    const [publishModal, setPublishModal] = useState(false);
    const [publishStatus, setPublishStatus] = useState<'draft' | 'active'>('active');

    // Determine test scope based on user's organization
    const isGlobalTest = canCreateGlobalTests(user?.organization);
    const testScopeText = getTestScopeText(user?.organization);

    const getValidationIssues = (): ValidationIssue[] => {
        const issues: ValidationIssue[] = [];

        // Basic validation
        if (!testData.title?.trim()) {
            issues.push({ type: 'error', field: 'title', message: 'Test title is required' });
        }
        if (!testData.description?.trim()) {
            issues.push({ type: 'error', field: 'description', message: 'Test description is required' });
        }

        // Settings validation
        if (!testData.settings?.timeLimit || testData.settings.timeLimit <= 0) {
            issues.push({ type: 'error', field: 'settings', message: 'Valid time limit is required' });
        }
        if (!testData.settings?.attemptsAllowed || testData.settings.attemptsAllowed <= 0) {
            issues.push({ type: 'error', field: 'settings', message: 'Valid attempts allowed is required' });
        }

        // Structure validation
        if (testData.settings?.useSections) {
            if (!testData.sections || testData.sections.length === 0) {
                issues.push({ type: 'error', field: 'sections', message: 'At least one section is required' });
            } else {
                testData.sections.forEach((section, index) => {
                    if (!section.name?.trim()) {
                        issues.push({ type: 'error', field: 'sections', message: `Section ${index + 1} name is required` });
                    }
                    if (!section.questions || section.questions.length === 0) {
                        issues.push({ type: 'error', field: 'sections', message: `Section ${index + 1} must have at least one question` });
                    }
                });
            }
        } else {
            if (!testData.questions || testData.questions.length === 0) {
                issues.push({ type: 'error', field: 'questions', message: 'At least one question is required' });
            }
        }

        // Warnings and suggestions
        if (testData.languages.length === 0) {
            issues.push({ type: 'suggestion', field: 'languages', message: 'Consider adding language tags to help categorize your test' });
        }
        if (testData.tags.length === 0) {
            issues.push({ type: 'suggestion', field: 'tags', message: 'Consider adding topic tags to improve discoverability' });
        }

        if (testData.settings?.timeLimit && testData.settings.timeLimit > 180) {
            issues.push({ type: 'warning', field: 'settings', message: 'Tests longer than 3 hours may lead to student fatigue' });
        }

        return issues;
    };

    const validationIssues = getValidationIssues();
    const hasErrors = validationIssues.some(issue => issue.type === 'error');

    const handlePublish = async () => {
        console.log('=== DEBUG: handlePublish START ===');
        console.log('publishStatus:', publishStatus);
        console.log('testData.status before merge:', testData.status);

        if (!user || !['admin', 'instructor'].includes(user.role)) {
            console.log('DEBUG: User permission check failed');
            setError('Unauthorized: Only admins or instructors can publish tests');
            return;
        }

        if (hasErrors) {
            console.log('DEBUG: Validation errors exist:', validationIssues);
            setError('Please fix all validation errors before publishing');
            return;
        }

        setPublishModal(false);
        setLoading?.(true);

        try {
            console.log('=== DEBUG: Creating payload ===');

            // Merge publishStatus into testData
            const testDataWithStatus = { ...testData, status: publishStatus };
            console.log('testDataWithStatus:', JSON.stringify(testDataWithStatus, null, 2));
            console.log('testDataWithStatus.status:', testDataWithStatus.status);

            const payload = createTestPayload(testDataWithStatus);
            console.log('=== DEBUG: Final payload ===');
            console.log('payload:', JSON.stringify(payload, null, 2));
            console.log('payload.status:', payload.status);

            console.log('=== DEBUG: Calling API ===');
            // FIXED: createTest returns Test directly, no wrapper
            const createdTest = await apiService.createTest(payload);
            console.log('=== DEBUG: API Response ===');
            console.log('createdTest:', createdTest);

            if (!createdTest || !createdTest._id) {
                console.log('DEBUG: API returned invalid data');
                throw new Error('Failed to create test - invalid response');
            }

            console.log('=== DEBUG: Success! ===');
            console.log('Created test:', createdTest);
            console.log('Created test status:', createdTest.status);

            setError(null);
            onComplete?.();
        } catch (error) {
            console.error('=== DEBUG: Error in handlePublish ===');
            console.error('Error:', error);
            setError(error instanceof Error ? error.message : 'Failed to create test');
        } finally {
            setLoading?.(false);
            console.log('=== DEBUG: handlePublish END ===');
        }
    };

    const handlePreview = () => {
        if (hasErrors) {
            setError('Please fix validation errors before previewing');
            return;
        }

        console.log('Preview Test Data:', {
            title: testData.title,
            description: testData.description,
            testType: testData.testType,
            languages: testData.languages,
            tags: testData.tags,
            settings: testData.settings,
            sections: testData.settings.useSections ? testData.sections : undefined,
            questions: !testData.settings.useSections ? testData.questions : undefined,
            scope: testScopeText
        });
        alert('Test data logged to console. Check developer tools for details.');
    };

    const getTotalQuestions = (): number => {
        if (testData.settings?.useSections) {
            return testData.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || 0;
        }
        return testData.questions?.length || 0;
    };

    const getTotalPoints = (): number => {
        if (testData.settings?.useSections) {
            return testData.sections?.reduce((total, section) =>
                total + (section.questions?.reduce((sectionTotal, q) => sectionTotal + (q.points || 0), 0) || 0), 0
            ) || 0;
        }
        return testData.questions?.reduce((total, q) => total + (q.points || 0), 0) || 0;
    };

    return (
        <div>
            {/* Test Overview */}
            <Row className="mb-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm">
                        <CardBody>
                            <CardTitle tag="h5" className="d-flex align-items-center mb-4">
                                <CheckCircle size={24} className="me-2 text-primary" />
                                Review & Publish Test
                            </CardTitle>

                            {/* Test Overview */}
                            <div className="mb-4">
                                <h6 className="fw-bold mb-3">Test Overview</h6>
                                <Row>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <strong>Title:</strong>
                                            <div className="mt-1">{testData.title || <em>Not set</em>}</div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Type:</strong>
                                            <div className="mt-1">
                                                <Badge color="info" className="me-2">
                                                    {testData.testType?.replace('_', ' ').toUpperCase() || 'CUSTOM'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Structure:</strong>
                                            <div className="mt-1">
                                                <Badge color={testData.settings?.useSections ? "primary" : "success"}>
                                                    {testData.settings?.useSections ? 'Sectioned Test' : 'Single Test'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="mb-3">
                                            <strong>Questions:</strong>
                                            <div className="mt-1">{getTotalQuestions()} total questions</div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Total Points:</strong>
                                            <div className="mt-1">{getTotalPoints()} points</div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Time Limit:</strong>
                                            <div className="mt-1">{testData.settings?.timeLimit || 0} minutes</div>
                                        </div>
                                    </Col>
                                </Row>
                                <div className="mb-3">
                                    <strong>Description:</strong>
                                    <div className="mt-1 text-muted">{testData.description || <em>Not set</em>}</div>
                                </div>
                            </div>

                            {/* Test Scope - Shows automatic global/org setting */}
                            <div className="mb-4">
                                <h6 className="fw-bold mb-3">Test Scope</h6>
                                <Alert color={isGlobalTest ? "info" : "light"} className="mb-0">
                                    <div className="d-flex align-items-center">
                                        {isGlobalTest ? (
                                            <Globe size={20} className="me-2 text-info" />
                                        ) : (
                                            <Building size={20} className="me-2 text-muted" />
                                        )}
                                        <div>
                                            <strong>{testScopeText}</strong>
                                            <div className="small text-muted mt-1">
                                                {isGlobalTest ? (
                                                    <>
                                                        As a member of {user?.organization?.name}, your tests are automatically made available to all organizations and students globally.
                                                    </>
                                                ) : (
                                                    <>
                                                        This test will only be available to members of {user?.organization?.name}.
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Alert>
                            </div>

                            {/* Languages and Tags */}
                            {(testData.languages.length > 0 || testData.tags.length > 0) && (
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-3">Categorization</h6>
                                    {testData.languages.length > 0 && (
                                        <div className="mb-2">
                                            <strong className="small">Languages:</strong>
                                            <div className="mt-1">
                                                {testData.languages.map(lang => (
                                                    <Badge key={lang} color="secondary" className="me-1 mb-1">
                                                        {lang}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {testData.tags.length > 0 && (
                                        <div>
                                            <strong className="small">Topics:</strong>
                                            <div className="mt-1">
                                                {testData.tags.map(tag => (
                                                    <Badge key={tag} color="outline-secondary" className="me-1 mb-1">
                                                        {tag.replace(/-/g, ' ')}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Validation Issues */}
                            {validationIssues.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-3">
                                        <AlertTriangle size={16} className="me-2" />
                                        Review Items
                                    </h6>
                                    {validationIssues.map((issue, index) => (
                                        <Alert
                                            key={index}
                                            color={
                                                issue.type === 'error' ? 'danger' :
                                                    issue.type === 'warning' ? 'warning' : 'info'
                                            }
                                            className="py-2 px-3 mb-2"
                                        >
                                            <div className="d-flex align-items-center">
                                                <AlertTriangle size={14} className="me-2" />
                                                <strong className="me-2">{issue.field}:</strong>
                                                {issue.message}
                                            </div>
                                        </Alert>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Col>

                {/* Actions Sidebar */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm">
                        <CardBody>
                            <CardTitle tag="h6" className="mb-3">Actions</CardTitle>

                            <div className="d-grid gap-2">
                                <Button
                                    color="primary"
                                    size="lg"
                                    disabled={hasErrors}
                                    onClick={() => {
                                        setPublishStatus('active');
                                        setPublishModal(true);
                                    }}
                                >
                                    {hasErrors ? 'Fix Issues to Publish' : 'Publish Test'}
                                </Button>

                                {!hasErrors && (
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

                                <Button
                                    color="outline-secondary"
                                    onClick={onPrevious}
                                >
                                    ← Previous Step
                                </Button>

                                {hasErrors && (
                                    <small className="text-muted text-center">
                                        <AlertTriangle size={12} className="me-1" />
                                        Fix {validationIssues.filter(i => i.type === 'error').length} validation issue(s) to publish
                                    </small>
                                )}
                            </div>

                            {/* Backend Alignment Notice */}
                            <Alert color="light" className="mt-3 mb-0">
                                <Info size={14} className="me-2" />
                                <small>
                                    <strong>Auto-Configuration:</strong> Test scope is automatically determined based on your organization. Global tests are created for EngineerSmith, organization-specific tests for all others.
                                </small>
                            </Alert>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Publish Confirmation Modal */}
            <Modal isOpen={publishModal} toggle={() => setPublishModal(false)} centered>
                <ModalHeader toggle={() => setPublishModal(false)}>
                    Confirm Publication
                </ModalHeader>
                <ModalBody>
                    <div className="mb-3">
                        <p>You are about to {publishStatus === 'active' ? 'publish' : 'save as draft'} this test:</p>
                        <div className="bg-light p-3 rounded">
                            <strong>{testData.title}</strong>
                            <div className="small text-muted mt-1">{testScopeText}</div>
                        </div>
                    </div>

                    {publishStatus === 'active' && (
                        <Alert color="warning" className="mb-3">
                            <strong>Publishing Notice:</strong> Once published, this test will be {isGlobalTest ? 'available globally to all organizations' : 'available to your organization members'}.
                        </Alert>
                    )}

                    <div className="small text-muted">
                        • {getTotalQuestions()} questions
                        • {getTotalPoints()} total points
                        • {testData.settings?.timeLimit} minute time limit
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setPublishModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        color={publishStatus === 'active' ? 'primary' : 'success'}
                        onClick={handlePublish}
                    >
                        {publishStatus === 'active' ? (
                            <>
                                <Send size={14} className="me-1" />
                                Publish Test
                            </>
                        ) : (
                            <>
                                <Bookmark size={14} className="me-1" />
                                Save Draft
                            </>
                        )}
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default ReviewPublish;