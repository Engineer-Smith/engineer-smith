// pages/EditQuestionPage.tsx - FIXED FOR EDIT MODE SUPPORT
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner, Button } from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import { QuestionCreationProvider } from '../context/QuestionCreationContext';
import QuestionCreationWizard from '../components/QuestionCreation/QuestionCreationWizard';
import type { Question } from '../types';

const EditQuestionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the mode and data source
  const editQuestionFromState = location.state?.editQuestion;
  const duplicateData = location.state?.duplicateFrom;

  const isEditMode = !!questionId && !duplicateData;
  const isDuplicateMode = !!duplicateData;
  const mode = isEditMode ? 'edit' : isDuplicateMode ? 'duplicate' : 'create';

  useEffect(() => {
    if (editQuestionFromState) {
      // Use question data from navigation state (from ViewQuestionPage)
      console.log('Using question from navigation state:', editQuestionFromState);
      setQuestion(editQuestionFromState);
      setLoading(false);
    } else if (duplicateData) {
      // We're duplicating a question
      console.log('Using duplicate data:', duplicateData);
      setQuestion(duplicateData);
      setLoading(false);
    } else if (questionId) {
      // We're editing but don't have state data - fetch from API
      console.log('Fetching question from API for edit mode');
      fetchQuestion();
    } else {
      // We're creating a new question
      console.log('Creating new question');
      setLoading(false);
    }
  }, [questionId, editQuestionFromState, duplicateData]);

  const fetchQuestion = async () => {
    if (!questionId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching question:', questionId);
      // FIXED: getQuestion returns Question directly, no wrapper
      const question = await apiService.getQuestion(questionId);

      if (!question || !question._id) {
        throw new Error('Failed to fetch question');
      }

      console.log('Fetched question data:', question);
      setQuestion(question);
    } catch (error: any) {
      console.error('Error fetching question:', error);
      setError(error.message || 'Failed to fetch question');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (questionId: string, savedQuestion: Question) => {
    console.log('Question operation completed:', { mode, questionId, savedQuestion });

    if (isEditMode) {
      // Navigate back to view page for edits
      navigate(`/admin/question-bank/view/${questionId}`, {
        state: { message: 'Question updated successfully' }
      });
    } else {
      // Navigate to question bank for new/duplicate questions
      navigate('/admin/question-bank', {
        state: {
          message: `Question ${isDuplicateMode ? 'duplicated' : 'created'} successfully`,
          highlightQuestionId: questionId
        }
      });
    }
  };

  const handleCancel = () => {
    if (isEditMode && question?._id) {
      // Go back to view page for edits
      navigate(`/admin/question-bank/view/${question._id}`);
    } else {
      // Go back to question bank
      navigate('/admin/question-bank');
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">
              {isEditMode ? 'Loading question for editing...' :
                isDuplicateMode ? 'Preparing question for duplication...' :
                  'Preparing form...'}
            </p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert color="danger" className="text-center">
              <strong>Error:</strong> {error}
              <div className="mt-3">
                <Button color="primary" onClick={() => navigate('/admin/question-bank')}>
                  Back to Question Bank
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // Debug logging
  console.log('EditQuestionPage render:', {
    mode,
    hasQuestion: !!question,
    questionId: question?._id,
    questionTitle: question?.title,
    questionType: question?.type,
    questionLanguage: question?.language
  });

  return (
    <QuestionCreationProvider
      initialQuestion={question || undefined}
      mode={mode}
    >
      <Container className="py-5">
        {/* Mode indicator */}
        {(isEditMode || isDuplicateMode) && question && (
          <Alert color={isEditMode ? "info" : "secondary"} className="mb-4">
            <strong>
              {isEditMode ? 'Editing Question:' : 'Duplicating Question:'}
            </strong> {question.title}
            {isEditMode && (
              <div className="small text-muted mt-1">
                All validation rules will be applied to ensure question integrity.
              </div>
            )}
            <div className="small mt-2">
              <strong>Details:</strong> {question.type} • {question.language}
              {question.category && ` • ${question.category}`} • {question.difficulty}
            </div>
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

export default EditQuestionPage;