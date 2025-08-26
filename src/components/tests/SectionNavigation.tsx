// src/components/tests/SectionNavigation.tsx
import React from 'react';
import { Button, ButtonGroup, Alert } from 'reactstrap';
import { ArrowLeft, ArrowRight, Send, Lock } from 'lucide-react';
import { useTestSession } from '../../context/TestSessionContext';

interface SectionNavigationProps {
  onSubmitSection: () => void;
}

export const SectionNavigation: React.FC<SectionNavigationProps> = ({ onSubmitSection }) => {
  const { state, actions } = useTestSession();

  // Early return with proper type checking
  if (!state.test?.settings.useSections || !state.test.sections || state.test.sections.length === 0) {
    return null;
  }

  const canGoToNextSection = () => {
    const nextSectionIndex = state.currentSectionIndex + 1;
    return nextSectionIndex < state.test!.sections!.length && 
           state.testSession?.completedSections.includes(state.currentSectionIndex);
  };

  const canGoToPreviousSection = () => {
    return state.currentSectionIndex > 0 && 
           state.testSession?.completedSections.includes(state.currentSectionIndex - 1);
  };

  const isCurrentSectionCompleted = () => {
    return state.testSession?.completedSections.includes(state.currentSectionIndex) || false;
  };

  const getCurrentSectionQuestions = () => {
    const currentSection = state.test!.sections![state.currentSectionIndex];
    if (!currentSection) return { answered: 0, total: 0 };
    
    const answered = currentSection.questions.filter(q => 
      state.answers[q.questionId] !== undefined
    ).length;
    
    return { answered, total: currentSection.questions.length };
  };

  const { answered, total } = getCurrentSectionQuestions();
  const isLastSection = state.currentSectionIndex === (state.test!.sections!.length - 1);

  return (
    <div className="border-top bg-light p-3">
      {isCurrentSectionCompleted() && (
        <Alert color="success" className="mb-3">
          <div className="d-flex align-items-center">
            <Send size={16} className="me-2" />
            This section has been submitted successfully
          </div>
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center">
        <div>
          <ButtonGroup>
            <Button
              color="outline-secondary"
              onClick={() => actions.navigateToSection(state.currentSectionIndex - 1)}
              disabled={!canGoToPreviousSection()}
            >
              <ArrowLeft size={14} className="me-1" />
              Previous Section
            </Button>
            <Button
              color="outline-secondary"
              onClick={() => actions.navigateToSection(state.currentSectionIndex + 1)}
              disabled={!canGoToNextSection()}
            >
              Next Section
              <ArrowRight size={14} className="ms-1" />
              {!canGoToNextSection() && <Lock size={12} className="ms-1" />}
            </Button>
          </ButtonGroup>
        </div>

        <div className="text-center">
          <div className="text-muted small">
            {answered}/{total} questions answered
          </div>
          {answered < total && (
            <div className="text-warning small">
              {total - answered} questions remaining
            </div>
          )}
        </div>

        <div>
          {!isCurrentSectionCompleted() ? (
            <Button
              color="success"
              onClick={onSubmitSection}
              disabled={state.submitting}
            >
              <Send size={14} className="me-1" />
              Submit {isLastSection ? 'Final' : 'Current'} Section
            </Button>
          ) : isLastSection ? (
            <Button
              color="primary"
              onClick={() => actions.submitTest()}
              disabled={state.submitting}
            >
              <Send size={14} className="me-1" />
              Complete Test
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};