import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import TestTakingInterface from '../components/tests/TestTakingInterface';
import {
    Container,
    Row,
    Col,
    Alert,
    Spinner,
    Button
} from 'reactstrap';
import {
    ArrowLeft,
    AlertTriangle,
    FileText
} from 'lucide-react';
import type { Test } from '../types';

const TestPreviewPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (testId) {
            fetchTestWithQuestions();
        }
    }, [testId]);

    const fetchTestWithQuestions = async () => {
        if (!testId) return;

        try {
            setLoading(true);
            setError(null);

            console.log('TestPreviewPage: Fetching test with questions for ID:', testId);
            console.log('TestPreviewPage: User role:', user?.role);

            // FIXED: getTestWithQuestions returns Test directly, no wrapper
            const test = await apiService.getTestWithQuestions(testId);

            console.log('TestPreviewPage: Test data received:', test);
            console.log('TestPreviewPage: Test has sections?', test?.settings?.useSections);
            console.log('TestPreviewPage: Sections:', test?.sections);
            console.log('TestPreviewPage: Questions:', test?.questions);

            if (!test || !test._id) {
                throw new Error('No test data received');
            }

            setTest(test);

        } catch (error: any) {
            console.error('TestPreviewPage: Error fetching test:', error);
            setError(error.message || 'Failed to load test preview');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/tests');
    };

    // Check authorization
    if (!isAuthenticated || !user || !['admin', 'instructor'].includes(user.role)) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Alert color="danger">
                            <AlertTriangle size={20} className="me-2" />
                            <strong>Access Denied</strong>
                            <div className="mt-1">
                                Only administrators and instructors can preview tests.
                            </div>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6} className="text-center">
                        <Spinner color="primary" className="mb-3" />
                        <p className="text-muted">Loading test preview...</p>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Alert color="danger">
                            <AlertTriangle size={20} className="me-2" />
                            <strong>Error:</strong> {error}
                        </Alert>
                        <Button color="secondary" onClick={handleBack}>
                            <ArrowLeft size={16} className="me-1" />
                            Back to Tests
                        </Button>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (!test) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6} className="text-center">
                        <FileText size={48} className="text-muted mb-3" />
                        <h5>Test not found</h5>
                        <p className="text-muted">The requested test could not be found.</p>
                        <Button color="secondary" onClick={handleBack}>
                            <ArrowLeft size={16} className="me-1" />
                            Back to Tests
                        </Button>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <div
            style={{
                backgroundColor: '#f8f9fa',
                minHeight: 'calc(100vh - 70px)', // Adjust for navbar height
                paddingTop: '30px', // Offset for fixed navbar
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <TestTakingInterface
                mode="preview"
                test={test}
                onBack={handleBack}
                title={`Preview: ${test.title}`}
            />
        </div>
    );
};

export default TestPreviewPage;