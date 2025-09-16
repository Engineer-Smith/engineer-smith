// src/components/QuestionCreation/steps/ReviewStep.tsx - FIXED PROPS
import React from 'react';
import { Row, Col, Alert } from 'reactstrap';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

// Import the new components
import QuestionStatusCard from '../components/QuestionStatusCard';
import DuplicateCheckCard from '../components/DuplicateCheckCard';
import QuestionSummaryCard from '../components/QuestionSummaryCard';
import SaveActionCard from '../components/SaveActionCard';
import QuickActionsCard from '../components/QuickActionsCard';
import VisibilitySettingsCard from '../components/VisibilitySettingsCard';

const ReviewStep: React.FC = () => {
  const { 
    state,
    getSaveValidationErrors,
    canSaveQuestion,
    isCompleted,
    completedQuestion,
    isSaving
  } = useQuestionCreation();

  const {
    error,
    testSuccess,
    creationSuccess
  } = state;

  // Use centralized validation
  const finalValidation = getSaveValidationErrors();
  const canSave = canSaveQuestion();

  return (
    <div className="review-step">
      {/* Validation Errors */}
      {finalValidation.length > 0 && !isCompleted && (
        <Alert color="danger" className="mb-4">
          <AlertTriangle size={16} className="me-2" />
          <strong>Please fix the following issues before saving:</strong>
          <ul className="mb-0 mt-2">
            {finalValidation.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* API Errors */}
      {error && !isCompleted && (
        <Alert color="danger" className="mb-4">
          <AlertTriangle size={16} className="me-2" />
          {error}
        </Alert>
      )}

      {/* Success Messages */}
      {testSuccess && !creationSuccess && (
        <Alert color="info" className="mb-4">
          <CheckCircle size={16} className="me-2" />
          <strong>Test Validation:</strong> {testSuccess}
        </Alert>
      )}

      {creationSuccess && (
        <Alert color="success" className="mb-4">
          <CheckCircle size={16} className="me-2" />
          <strong>Success:</strong> {creationSuccess}
        </Alert>
      )}

      {/* Completion Status */}
      {isCompleted && completedQuestion && (
        <Alert color="success" className="mb-4">
          <CheckCircle size={16} className="me-2" />
          <strong>Question Saved:</strong> "{completedQuestion.title}" has been successfully created!
          <div className="mt-2 small">
            <strong>Question ID:</strong> {completedQuestion._id}
          </div>
        </Alert>
      )}

      {/* Save in progress indicator */}
      {isSaving && (
        <Alert color="info" className="mb-4">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Saving...</span>
            </div>
            <strong>Saving question...</strong> Please wait while we create your question.
          </div>
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          {/* Main Question Summary */}
          <QuestionSummaryCard />
        </Col>

        <Col lg={4}>
          {/* ✅ FIXED: Question Status Card - only pass finalValidation */}
          <QuestionStatusCard 
            finalValidation={finalValidation}
          />
          
          {/* Duplicate Check */}
          <DuplicateCheckCard />
          
          {/* ✅ FIXED: Save Action Card - pass the props it expects */}
          <SaveActionCard
            finalValidation={finalValidation}
            canSave={canSave}
            isCompleted={isCompleted}
            isSaving={isSaving}
          />
          
          {/* Quick Actions */}
          <QuickActionsCard />
          
          {/* Visibility Settings */}
          <VisibilitySettingsCard />

          {/* Completion Summary */}
          {isCompleted && completedQuestion && (
            <div className="card mt-3 border-success">
              <div className="card-body">
                <h6 className="card-title text-success">
                  <CheckCircle size={16} className="me-2" />
                  Question Created Successfully
                </h6>
                <div className="small">
                  <div><strong>ID:</strong> {completedQuestion._id}</div>
                  <div><strong>Title:</strong> {completedQuestion.title}</div>
                  <div><strong>Type:</strong> {completedQuestion.type}</div>
                  <div><strong>Language:</strong> {completedQuestion.language}</div>
                  <div><strong>Scope:</strong> {completedQuestion.isGlobal ? 'Global' : 'Organization'}</div>
                  <div><strong>Status:</strong> {completedQuestion.status}</div>
                  {completedQuestion.testCases && (
                    <div><strong>Test Cases:</strong> {completedQuestion.testCases.length}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ReviewStep;