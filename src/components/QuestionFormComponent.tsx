// src/components/QuestionFormComponent.tsx - UPDATED WITH EDIT SUPPORT
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QuestionCreationProvider } from '../context/QuestionCreationContext';
import QuestionCreationWizard from './QuestionCreation/QuestionCreationWizard';
import type { Question } from '../types';
import { Container, Alert } from 'reactstrap';

interface QuestionFormComponentProps {
    question?: Partial<Question>;
    onSubmitSuccess?: (question: Question) => void;
    submitLabel?: string;
    showSubmitButton?: boolean;
    compact?: boolean;
    onCancel?: () => void;
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
    const location = useLocation();
    
    // Get edit question data from navigation state
    const editQuestion = location.state?.editQuestion || location.state?.duplicateFrom;
    const isEditMode = !!editQuestion && !location.state?.duplicateFrom;
    const isDuplicateMode = !!location.state?.duplicateFrom;
    
    // Determine which question data to use and mode
    const questionData = editQuestion || initialQuestion;
    const mode = isEditMode ? 'edit' : isDuplicateMode ? 'duplicate' : 'create';

    useEffect(() => {
        console.log('QuestionFormComponent rendered', {
            isEditMode,
            isDuplicateMode,
            mode,
            hasQuestionData: !!questionData,
            questionId: questionData?._id,
            questionTitle: questionData?.title
        });
    });

    const handleComplete = (questionId: string, question: Question) => {
        if (onSubmitSuccess) {
            onSubmitSuccess(question);
        } else {
            // Navigate appropriately based on mode
            if (isEditMode) {
                navigate(`/admin/question-bank/view/${questionId}`, {
                    state: { message: 'Question updated successfully' }
                });
            } else {
                navigate('/admin/question-bank', {
                    state: { 
                        message: `Question ${isDuplicateMode ? 'duplicated' : 'created'} successfully`,
                        highlightQuestionId: questionId
                    }
                });
            }
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            // Navigate back appropriately
            if (isEditMode && questionData?._id) {
                navigate(`/admin/question-bank/view/${questionData._id}`);
            } else {
                navigate('/admin/question-bank');
            }
        }
    };

    return (
        <QuestionCreationProvider 
            initialQuestion={questionData} 
            mode={mode}
        >
            <Container className="py-5">
                {/* Mode indicator */}
                {(isEditMode || isDuplicateMode) && (
                    <Alert color={isEditMode ? "info" : "secondary"} className="mb-4">
                        <strong>
                            {isEditMode ? 'Editing Question:' : 'Duplicating Question:'}
                        </strong> {questionData?.title}
                        {isEditMode && (
                            <div className="small text-muted mt-1">
                                All validation rules will be applied to ensure question integrity.
                            </div>
                        )}
                    </Alert>
                )}
                
                <QuestionCreationWizard
                    onComplete={handleComplete}
                    onCancel={handleCancel}
                />
            </Container>
        </QuestionCreationProvider>
    );
};

export default QuestionFormComponent;