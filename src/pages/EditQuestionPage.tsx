// pages/EditQuestionPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner, Button } from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import QuestionFormComponent from '../components/QuestionFormComponent';
import type { Question } from '../types';

const EditQuestionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're creating a duplicate from location state
  const duplicateData = location.state?.duplicateFrom;

  useEffect(() => {
    if (duplicateData) {
      // We're duplicating a question
      setQuestion(duplicateData);
      setLoading(false);
    } else if (questionId) {
      // We're editing an existing question
      fetchQuestion();
    } else {
      // We're creating a new question
      setLoading(false);
    }
  }, [questionId, duplicateData]);

  const fetchQuestion = async () => {
    if (!questionId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getQuestion(questionId);
      
      if (response.error || !response.data) {
        throw new Error(response.message || 'Failed to fetch question');
      }

      setQuestion(response.data);
    } catch (error: any) {
      console.error('Error fetching question:', error);
      setError(error.message || 'Failed to fetch question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSuccess = (savedQuestion: Question) => {
    console.log('Question saved successfully:', savedQuestion);
    navigate('/admin/question-bank', {
      state: { 
        message: questionId ? 'Question updated successfully' : 'Question created successfully'
      }
    });
  };

  const handleCancel = () => {
    navigate('/admin/question-bank');
  };

  if (loading) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">
              {questionId ? 'Loading question for editing...' : 'Preparing form...'}
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

  return (
    <QuestionFormComponent
      question={question || undefined}
      onSubmitSuccess={handleSubmitSuccess}
      submitLabel={questionId ? 'Update Question' : 'Create Question'}
      onCancel={handleCancel}
    />
  );
};

export default EditQuestionPage;