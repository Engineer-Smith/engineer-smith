import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Edit3,
    RotateCcw,
    Save,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    FormGroup,
    Input,
    InputGroup,
    InputGroupText,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Spinner
} from 'reactstrap';
import ApiService from '../services/ApiService';

interface QuestionScore {
    questionIndex: number;
    pointsEarned: number;
    pointsPossible: number;
    isCorrect: boolean;
    feedback?: string;
}

interface DetailedResultScoringProps {
    resultId: string;
    onBack?: () => void;
}

const DetailedResultScoringPage: React.FC<DetailedResultScoringProps> = ({ resultId, onBack }) => {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editedScores, setEditedScores] = useState<Map<number, QuestionScore>>(new Map());
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [generalFeedback, setGeneralFeedback] = useState('');

    useEffect(() => {
        if (resultId) {
            fetchResultDetails();
        }
    }, [resultId]);

    const fetchResultDetails = async () => {
        try {
            setLoading(true);
            const resultData = await ApiService.getResult(resultId);
            setResult(resultData);
            setGeneralFeedback(resultData.instructorFeedback || '');
        } catch (error) {
            setError('Failed to load test result details');
            console.error('Error fetching result:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (questionIndex: number, field: keyof QuestionScore, value: any) => {
        if (!result) return;

        const question = result.questions[questionIndex];
        if (!question) return;

        const currentEdit = editedScores.get(questionIndex) || {
            questionIndex,
            pointsEarned: question.pointsEarned,
            pointsPossible: question.pointsPossible,
            isCorrect: question.isCorrect,
            feedback: question.feedback || ''
        };

        const updatedScore = { ...currentEdit, [field]: value };

        // Auto-determine correctness based on points
        if (field === 'pointsEarned') {
            updatedScore.isCorrect = value > 0;
        }

        setEditedScores(new Map(editedScores.set(questionIndex, updatedScore)));
        setHasUnsavedChanges(true);
    };

    const calculateNewTotalScore = () => {
        if (!result) return result?.score;

        let totalEarned = 0;
        let totalPossible = 0;

        result.questions.forEach((question: any, index: number) => {
            const editedScore = editedScores.get(index);
            if (editedScore) {
                totalEarned += editedScore.pointsEarned;
                totalPossible += editedScore.pointsPossible;
            } else {
                totalEarned += question.pointsEarned;
                totalPossible += question.pointsPossible;
            }
        });

        const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
        const passed = percentage >= (result.score.passingThreshold || 70);

        return {
            ...result.score,
            earnedPoints: totalEarned,
            totalPoints: totalPossible,
            percentage,
            passed,
            correctAnswers: result.questions.filter((q: any, i: number) => {
                const edited = editedScores.get(i);
                return edited ? edited.isCorrect : q.isCorrect;
            }).length
        };
    };

    const handleSaveChanges = async () => {
        if (!result || editedScores.size === 0) return;

        try {
            setSaving(true);

            const updates = Array.from(editedScores.values()).map(score => ({
                questionIndex: score.questionIndex,
                pointsEarned: score.pointsEarned,
                isCorrect: score.isCorrect,
                feedback: score.feedback
            }));

            await ApiService.bulkUpdateQuestionScores(result._id, {
                updates,
                feedback: generalFeedback
            });

            await fetchResultDetails();
            setEditedScores(new Map());
            setHasUnsavedChanges(false);
            setShowSaveModal(false);

        } catch (error) {
            setError('Failed to save score changes');
            console.error('Error saving scores:', error);
        } finally {
            setSaving(false);
        }
    };

    const resetChanges = () => {
        setEditedScores(new Map());
        setHasUnsavedChanges(false);
        setGeneralFeedback(result?.instructorFeedback || '');
    };

    const getQuestionTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            multipleChoice: 'primary',
            trueFalse: 'info',
            fillInTheBlank: 'warning',
            essay: 'danger',
            codeChallenge: 'dark',
            codeDebugging: 'secondary'
        };
        return colors[type] || 'secondary';
    };

    const formatStudentAnswer = (question: any) => {
        if (!question.studentAnswer && question.studentAnswer !== 0 && question.studentAnswer !== false) {
            return 'No answer provided';
        }

        switch (question.type) {
            case 'multipleChoice':
                if (question.details?.options && typeof question.studentAnswer === 'number') {
                    const selectedIndex = question.studentAnswer;
                    const selectedText = question.details.options[selectedIndex];
                    return selectedText ? `${selectedIndex}: ${selectedText}` : `Option ${selectedIndex}`;
                }
                return question.studentAnswer?.toString() || 'No answer';

            case 'trueFalse':
                if (typeof question.studentAnswer === 'boolean') {
                    return question.studentAnswer ? 'True' : 'False';
                }
                return question.studentAnswer?.toString() || 'No answer';

            case 'fillInTheBlank':
                if (typeof question.studentAnswer === 'object' && question.studentAnswer !== null) {
                    return Object.entries(question.studentAnswer)
                        .map(([key, value]) => `${key}: "${value}"`)
                        .join('\n');
                }
                return question.studentAnswer?.toString() || 'No answer';

            case 'codeChallenge':
            case 'codeDebugging':
                return question.studentAnswer?.toString() || 'No code provided';

            default:
                if (typeof question.studentAnswer === 'object') {
                    return JSON.stringify(question.studentAnswer, null, 2);
                }
                return question.studentAnswer?.toString() || 'No answer';
        }
    };

    const formatCorrectAnswer = (question: any) => {
        if (!question.correctAnswer && question.correctAnswer !== 0 && question.correctAnswer !== false) {
            switch (question.type) {
                case 'multipleChoice':
                    if (question.details?.options && typeof question.details?.correctOption === 'number') {
                        const correctIndex = question.details.correctOption;
                        const correctText = question.details.options[correctIndex];
                        return correctText ? `${correctIndex}: ${correctText}` : `Option ${correctIndex}`;
                    }
                    break;
                case 'fillInTheBlank':
                    if (question.details?.blanks) {
                        return question.details.blanks
                            .map((blank: any) => `${blank.id}: ${blank.correctAnswers?.join(' OR ') || 'N/A'}`)
                            .join('\n');
                    }
                    break;
            }
            return 'Not specified';
        }

        switch (question.type) {
            case 'multipleChoice':
                if (question.details?.options && typeof question.correctAnswer === 'number') {
                    const correctIndex = question.correctAnswer;
                    const correctText = question.details.options[correctIndex];
                    return correctText ? `${correctIndex}: ${correctText}` : `Option ${correctIndex}`;
                }
                return question.correctAnswer?.toString() || 'Not specified';

            case 'trueFalse':
                if (typeof question.correctAnswer === 'boolean') {
                    return question.correctAnswer ? 'True' : 'False';
                }
                if (question.correctAnswer === 1) return 'True';
                if (question.correctAnswer === 0) return 'False';
                return question.correctAnswer?.toString() || 'Not specified';

            case 'fillInTheBlank':
                if (Array.isArray(question.correctAnswer)) {
                    return question.correctAnswer
                        .map((answer: any) => `${answer.id}: ${answer.correctAnswers?.join(' OR ') || 'N/A'}`)
                        .join('\n');
                }
                break;

            case 'codeChallenge':
            case 'codeDebugging':
                return question.correctAnswer?.toString() || 'Various solutions possible';

            default:
                if (typeof question.correctAnswer === 'object') {
                    return JSON.stringify(question.correctAnswer, null, 2);
                }
                return question.correctAnswer?.toString() || 'Not specified';
        }
    };

    const newTotalScore = calculateNewTotalScore();

    if (loading) {
        return (
            <Container className="py-4">
                <div className="text-center">
                    <Spinner color="primary" size="lg" />
                    <p className="mt-3">Loading test result...</p>
                </div>
            </Container>
        );
    }

    if (!result) {
        return (
            <Container className="py-4">
                <Alert color="danger">
                    <AlertTriangle size={16} className="me-2" />
                    Test result not found
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <Button
                                color="outline-secondary"
                                size="sm"
                                onClick={onBack}
                                className="mb-3"
                            >
                                <ArrowLeft size={16} className="me-1" />
                                Back to Results
                            </Button>
                            <h2 className="h3 mb-1">Manual Score Review</h2>
                            <p className="text-muted mb-0">
                                {result.userId?.firstName} {result.userId?.lastName} • {result.testId?.title}
                            </p>
                        </div>
                        <div className="text-end">
                            <div className="mb-2">
                                <Badge color={hasUnsavedChanges ? (newTotalScore?.passed ? 'success' : 'danger') : (result.score.passed ? 'success' : 'danger')} className="fs-6">
                                    {hasUnsavedChanges ? newTotalScore?.percentage : result.score.percentage}%
                                    {hasUnsavedChanges && ' (New)'}
                                </Badge>
                            </div>
                            {hasUnsavedChanges && (
                                <div className="d-flex gap-2">
                                    <Button
                                        color="outline-secondary"
                                        size="sm"
                                        onClick={resetChanges}
                                        disabled={saving}
                                    >
                                        <RotateCcw size={16} className="me-1" />
                                        Reset
                                    </Button>
                                    <Button
                                        color="success"
                                        size="sm"
                                        onClick={() => setShowSaveModal(true)}
                                        disabled={saving}
                                    >
                                        <Save size={16} className="me-1" />
                                        Save ({editedScores.size})
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            {error && (
                <Alert color="danger" className="mb-4">
                    <AlertTriangle size={16} className="me-2" />
                    {error}
                </Alert>
            )}

            {/* Questions */}
            <Row>
                <Col>
                    {result.questions.map((question: any, index: number) => {
                        const editedScore = editedScores.get(index);
                        const currentScore = editedScore || {
                            pointsEarned: question.pointsEarned,
                            pointsPossible: question.pointsPossible,
                            isCorrect: question.isCorrect,
                            feedback: question.feedback || ''
                        };

                        return (
                            <Card key={index} className={`mb-3 ${editedScore ? 'border-warning' : ''}`}>
                                <CardHeader className="bg-white">
                                    <Row className="align-items-center">
                                        <Col>
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <h6 className="mb-0">
                                                    Question {index + 1}: {question.title}
                                                </h6>
                                                <Badge color={getQuestionTypeColor(question.type)} size="sm">
                                                    {question.type}
                                                </Badge>
                                                {editedScore && (
                                                    <Badge color="warning" size="sm">
                                                        <Edit3 size={12} className="me-1" />
                                                        Modified
                                                    </Badge>
                                                )}
                                            </div>
                                            {question.description && (
                                                <p className="text-muted small mb-0">{question.description}</p>
                                            )}
                                        </Col>
                                        <Col xs="auto">
                                            <Badge color={currentScore.isCorrect ? 'success' : 'danger'}>
                                                {currentScore.pointsEarned} / {question.pointsPossible} pts
                                            </Badge>
                                        </Col>
                                    </Row>
                                </CardHeader>
                                <CardBody>
                                    <Row>
                                        <Col lg={8}>
                                            {/* Student Answer */}
                                            <div className="mb-3">
                                                <Label className="small fw-medium text-muted">Student Answer:</Label>
                                                <div className="p-3 bg-light border rounded">
                                                    <pre className="small mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                                        {formatStudentAnswer(question)}
                                                    </pre>
                                                </div>
                                            </div>

                                            {/* Correct Answer */}
                                            <div className="mb-3">
                                                <Label className="small fw-medium text-muted">Expected Answer:</Label>
                                                <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded">
                                                    <pre className="small mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                                        {formatCorrectAnswer(question)}
                                                    </pre>
                                                </div>
                                            </div>
                                        </Col>

                                        <Col lg={4}>
                                            <Card className="border-0 bg-light">
                                                <CardBody>
                                                    <h6 className="mb-3">Scoring</h6>

                                                    {/* Points Earned */}
                                                    <FormGroup>
                                                        <Label className="small fw-medium">Points</Label>
                                                        <InputGroup>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max={question.pointsPossible}
                                                                step="0.5"
                                                                value={currentScore.pointsEarned}
                                                                onChange={(e) => handleScoreChange(index, 'pointsEarned', parseFloat(e.target.value) || 0)}
                                                            />
                                                            <InputGroupText>/ {question.pointsPossible}</InputGroupText>
                                                        </InputGroup>
                                                    </FormGroup>

                                                    {/* Correct/Incorrect */}
                                                    <FormGroup>
                                                        <Label className="small fw-medium">Status</Label>
                                                        <div>
                                                            <FormGroup check inline>
                                                                <Input
                                                                    type="radio"
                                                                    name={`correct-${index}`}
                                                                    checked={currentScore.isCorrect}
                                                                    onChange={() => handleScoreChange(index, 'isCorrect', true)}
                                                                />
                                                                <Label check className="small">
                                                                    <CheckCircle size={14} className="text-success me-1" />
                                                                    Correct
                                                                </Label>
                                                            </FormGroup>
                                                            <FormGroup check inline>
                                                                <Input
                                                                    type="radio"
                                                                    name={`correct-${index}`}
                                                                    checked={!currentScore.isCorrect}
                                                                    onChange={() => handleScoreChange(index, 'isCorrect', false)}
                                                                />
                                                                <Label check className="small">
                                                                    <XCircle size={14} className="text-danger me-1" />
                                                                    Incorrect
                                                                </Label>
                                                            </FormGroup>
                                                        </div>
                                                    </FormGroup>

                                                    {/* Feedback */}
                                                    <FormGroup>
                                                        <Label className="small fw-medium">Feedback</Label>
                                                        <Input
                                                            type="textarea"
                                                            rows={3}
                                                            value={currentScore.feedback}
                                                            onChange={(e) => handleScoreChange(index, 'feedback', e.target.value)}
                                                            placeholder="Optional feedback..."
                                                        />
                                                    </FormGroup>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        );
                    })}
                </Col>
            </Row>

            {/* General Feedback */}
            {hasUnsavedChanges && (
                <Row className="mt-4">
                    <Col>
                        <Card className="border-0 shadow-sm">
                            <CardBody>
                                <h6 className="mb-3">General Feedback</h6>
                                <Input
                                    type="textarea"
                                    rows={3}
                                    value={generalFeedback}
                                    onChange={(e) => setGeneralFeedback(e.target.value)}
                                    placeholder="Optional general feedback for this test attempt..."
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Save Modal */}
            <Modal isOpen={showSaveModal} toggle={() => setShowSaveModal(false)}>
                <ModalHeader toggle={() => setShowSaveModal(false)}>
                    Save Score Changes
                </ModalHeader>
                <ModalBody>
                    <p>You are about to save changes to <strong>{editedScores.size}</strong> question(s).</p>
                    {newTotalScore && (
                        <div className="bg-light p-3 rounded">
                            <h6>Score Summary:</h6>
                            <div className="d-flex justify-content-between">
                                <span>Total Score:</span>
                                <span className="fw-bold">
                                    {result.score.percentage}% → {newTotalScore.percentage}%
                                </span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Status:</span>
                                <span>
                                    <Badge color={result.score.passed ? 'success' : 'danger'}>
                                        {result.score.passed ? 'Pass' : 'Fail'}
                                    </Badge>
                                    {' → '}
                                    <Badge color={newTotalScore.passed ? 'success' : 'danger'}>
                                        {newTotalScore.passed ? 'Pass' : 'Fail'}
                                    </Badge>
                                </span>
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setShowSaveModal(false)}>
                        Cancel
                    </Button>
                    <Button color="success" onClick={handleSaveChanges} disabled={saving}>
                        {saving ? (
                            <>
                                <Spinner size="sm" className="me-1" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} className="me-1" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </ModalFooter>
            </Modal>
        </Container>
    );
};

export default DetailedResultScoringPage;