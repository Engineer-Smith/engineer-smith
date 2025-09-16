// src/components/QuestionFormComponent.tsx - UPDATED WITH EDIT SUPPORT
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Container } from 'reactstrap';
import { QuestionCreationProvider } from '../context/QuestionCreationContext';
import type { Question } from '../types';
import QuestionCreationWizard from './QuestionCreation/QuestionCreationWizard';

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