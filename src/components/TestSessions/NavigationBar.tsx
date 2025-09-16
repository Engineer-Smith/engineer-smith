// components/TestSessions/NavigationBar.tsx - FIXED to always use server-driven flow
import React from 'react';
import { Button, Spinner, Badge } from 'reactstrap';
import { ChevronLeft, ChevronRight, Circle, CheckCircle } from 'lucide-react';

interface NavigationBarProps {
    currentQuestion: {
        questionIndex: number;
        questionData: {
            title: string;
            description: string;
            type: string;
            points: number;
            [key: string]: any;
        };
        [key: string]: any;
    };
    currentAnswer: any;
    sectionInfo?: {
        name: string;
        current: number;
        total: number;
        timeLimit?: number;
    };
    canNavigateBackward: boolean;
    canNavigateForward: boolean;
    isNavigating: boolean;
    onSubmitAnswer?: () => Promise<void>;
    onSkip?: () => Promise<void>;
    onSubmitTest?: () => Promise<void>; // Only used when server explicitly requests it
    onClearAnswer?: () => void;
    submitting?: boolean;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
    currentQuestion,
    currentAnswer,
    sectionInfo,
    isNavigating,
    onSubmitAnswer,
    onSkip,
    onClearAnswer,
    submitting = false,
}) => {
    const hasAnswer = currentAnswer !== null && currentAnswer !== undefined && currentAnswer !== '';

    const getAnswerStatus = () => {
        if (hasAnswer) {
            return (
                <span className="text-success d-flex align-items-center">
                    <CheckCircle size={14} className="me-1" />
                    Answered
                </span>
            );
        }
        return (
            <span className="text-muted d-flex align-items-center">
                <Circle size={14} className="me-1" />
                Not answered
            </span>
        );
    };

    const getProgressText = () => {
        if (sectionInfo) {
            return `${sectionInfo.current} / ${sectionInfo.total}`;
        }
        return `Question ${(currentQuestion.questionIndex ?? 0) + 1}`;
    };

    // FIXED: Always show "Submit Answer" button - let server decide what happens next
    const getPrimaryActionButton = () => {
        // Always show submit answer button - the server will handle test completion
        if (onSubmitAnswer) {
            return (
                <Button
                    color="primary"
                    onClick={onSubmitAnswer}
                    disabled={!hasAnswer || isNavigating || submitting}
                    aria-label="Submit answer"
                >
                    {isNavigating || submitting ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            Submit Answer <ChevronRight size={16} className="ms-1" />
                        </>
                    )}
                </Button>
            );
        }

        return null;
    };

    return (
        <div className="border-top bg-light">
            <div className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                    {/* Left: Previous Button - DISABLED since navigation is server-driven */}
                    <div>
                        <Button
                            color="outline-secondary"
                            disabled={true}
                            aria-label="Previous question (not available)"
                        >
                            <ChevronLeft size={16} className="me-1" /> Previous
                        </Button>
                    </div>

                    {/* Center: Question Info and Status */}
                    <div className="text-center">
                        <div className="d-flex align-items-center gap-3 mb-1">
                            <div>
                                <h6 className="mb-0">{currentQuestion.questionData?.title || 'Question'}</h6>
                                {sectionInfo && (
                                    <small className="text-muted">
                                        Section: {sectionInfo.name}
                                    </small>
                                )}
                            </div>
                            <Badge color="primary">{currentQuestion.questionData?.points ?? 0} pts</Badge>
                        </div>
                        <div className="d-flex justify-content-center align-items-center gap-3">
                            <small className="text-muted">
                                {getProgressText()}
                            </small>
                            <small>
                                {getAnswerStatus()}
                            </small>
                        </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="d-flex gap-2 align-items-center">
                        {/* Clear Answer Button */}
                        {hasAnswer && onClearAnswer && (
                            <Button
                                color="outline-warning"
                                size="sm"
                                onClick={onClearAnswer}
                                disabled={isNavigating || submitting}
                                aria-label="Clear answer"
                            >
                                Clear Answer
                            </Button>
                        )}

                        {/* Skip Button - Always available */}
                        {onSkip && (
                            <Button
                                color="outline-warning"
                                size="sm"
                                onClick={onSkip}
                                disabled={isNavigating || submitting}
                                aria-label="Skip question"
                            >
                                {isNavigating || submitting ? <Spinner size="sm" /> : 'Skip'}
                            </Button>
                        )}

                        {/* Primary Action Button - Always "Submit Answer" */}
                        {getPrimaryActionButton()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NavigationBar;