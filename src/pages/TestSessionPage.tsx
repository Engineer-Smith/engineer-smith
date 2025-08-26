import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTestSession } from '../context/TestSessionContext';
import { TestSessionHeader } from '../components/tests/TestSessionHeader';
import { TestSessionModals } from '../components/tests/TestSessionModals';
import { TestSessionWarnings } from '../components/tests/TestSessionWarnings';
import { LoadingState, ErrorState, NotFoundState, PausedState } from '../components/tests/TestSessionLoadingStates';
import { SectionNavigation } from '../components/tests/SectionNavigation';
import { SectionProgress } from '../components/tests/SectionProgress';
import { SectionSubmissionModal } from '../components/tests/SectionSubmissionModal';
import SessionTestTakingInterface from '../components/tests/SessionTestTakingInterface';

const TestSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { state, timerState, actions } = useTestSession();

  // FIXED: Add tracking to prevent infinite initialization calls
  const isInitializing = useRef(false);
  const hasInitialized = useRef(false);

  // Modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeWarningModal, setShowTimeWarningModal] = useState(false);
  const [showSectionSubmitModal, setShowSectionSubmitModal] = useState(false);

  // FIXED: Initialize session on mount with proper tracking
  useEffect(() => {
    if (sessionId && !hasInitialized.current && !isInitializing.current) {
      isInitializing.current = true;
      console.log('TestSessionPage: Initializing session:', sessionId);
      
      actions.initializeSession(sessionId)
        .then(() => {
          hasInitialized.current = true;
        })
        .catch((error) => {
          console.error('TestSessionPage: Failed to initialize session:', error);
        })
        .finally(() => {
          isInitializing.current = false;
        });
    }
  }, [sessionId]); // FIXED: Only depend on sessionId, not actions

  // Auto-submit when timer expires - but only after timer is properly initialized
  useEffect(() => {
    console.log('Auto-submit check:', {
      timerExpired: timerState.timeRemaining === 0,
      hasTest: !!state.test,
      hasSession: !!state.testSession,
      isSubmitting: state.submitting,
      isLoading: state.loading,
      isTimerInitialized: timerState.isTimerInitialized,
      timeRemaining: timerState.timeRemaining
    });

    // Don't auto-submit if timer hasn't been properly initialized or test isn't loaded
    if (timerState.timeRemaining === 0 && 
        state.test && 
        state.testSession && 
        !state.submitting &&
        !state.loading &&
        timerState.isTimerInitialized) {
      console.log('Timer reached 0, auto-submitting test');
      handleAutoSubmit();
    }
  }, [timerState.timeRemaining, timerState.isTimerInitialized, state.test, state.testSession, state.submitting, state.loading]);

  const handleAutoSubmit = async () => {
    try {
      await actions.submitTest();
      navigate('/dashboard', { 
        state: { message: 'Test submitted automatically due to time expiry' }
      });
    } catch (error) {
      console.error('Auto-submit failed:', error);
    }
  };

  const handleManualSubmit = async () => {
    try {
      await actions.submitTest();
      setShowSubmitModal(false);
      navigate('/dashboard', { 
        state: { message: 'Test submitted successfully' }
      });
    } catch (error) {
      console.error('Manual submit failed:', error);
      setShowSubmitModal(false);
    }
  };

  const handleSectionSubmit = async () => {
    try {
      const result = await actions.submitCurrentSection();
      setShowSectionSubmitModal(false);
      
      // Check if this was the last section
      if (result.allSectionsCompleted) {
        // Navigate to final submission or results
        navigate('/dashboard', { 
          state: { message: 'All sections completed! Test submitted successfully.' }
        });
      }
    } catch (error) {
      console.error('Section submission failed:', error);
      setShowSectionSubmitModal(false);
    }
  };

  const handleSave = async () => {
    await actions.saveProgress();
  };

  const handleRetry = () => {
    if (sessionId) {
      // Reset tracking and reinitialize
      hasInitialized.current = false;
      isInitializing.current = false;
      actions.initializeSession(sessionId);
    }
  };

  // Helper to determine if we should show section UI
  const isUsingSection = () => {
    return state.test?.settings.useSections && 
           state.test?.sections && 
           state.test.sections.length > 0;
  };

  // Get current section name for modal
  const getCurrentSectionName = () => {
    if (!isUsingSection()) return 'Current Section';
    return state.test!.sections![state.currentSectionIndex]?.name || 'Current Section';
  };

  // Check if all sections are completed (for final test submission)
  const areAllSectionsCompleted = () => {
    if (!isUsingSection()) return false;
    return state.testSession?.completedSections.length === state.test!.sections!.length;
  };

  // Loading state
  if (state.loading) {
    return <LoadingState />;
  }

  // Error state
  if (state.error) {
    return (
      <ErrorState 
        error={state.error}
        onRetry={handleRetry}
        onBack={() => navigate('/dashboard')}
      />
    );
  }

  // Session not found
  if (!state.testSession || !state.test) {
    return <NotFoundState onBack={() => navigate('/dashboard')} />;
  }

  return (
    <div style={{ 
    height: 'calc(100vh - 110px)', // Subtract navbar height from viewport
    display: 'flex', 
    flexDirection: 'column',
    marginTop: '30px'
  }}>
      {/* Warning manager - invisible but handles timing */}
      <TestSessionWarnings
        onShowTimeWarning={() => setShowTimeWarningModal(true)}
        onShowSectionWarning={() => {
          // Could show section time warning here
        }}
      />

      {/* Header with timer and controls */}
      <TestSessionHeader
        onSave={handleSave}
        onSubmit={() => {
          // For sectioned tests that are complete, submit entire test
          // For non-sectioned tests or incomplete sectioned tests, show normal submit modal
          if (isUsingSection() && !areAllSectionsCompleted()) {
            // This shouldn't normally happen as header should be conditional
            setShowSectionSubmitModal(true);
          } else {
            setShowSubmitModal(true);
          }
        }}
      />

      {/* Main content area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Section Progress Sidebar (only for sectioned tests) */}
        {isUsingSection() && (
          <div style={{ 
            width: '300px', 
            borderRight: '1px solid #dee2e6',
            backgroundColor: '#f8f9fa',
            overflowY: 'auto',
            padding: '1rem'
          }}>
            <SectionProgress />
          </div>
        )}

        {/* Main Test Interface */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!state.isOnline ? (
            <PausedState reason="Your test is paused due to connection issues." />
          ) : (
            <>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <SessionTestTakingInterface
                  mode="taking"
                  test={state.test}
                  testSession={state.testSession}
                  currentQuestionIndex={state.currentQuestionIndex}
                  currentSectionIndex={state.currentSectionIndex} // ADDED: Pass current section index
                  answers={state.answers}
                  flaggedQuestions={state.flaggedQuestions}
                  onAnswerChange={actions.updateAnswer}
                  onQuestionNavigation={actions.navigateToQuestion}
                  onFlagToggle={actions.toggleFlag}
                  timeRemaining={timerState.timeRemaining}
                  sectionTimeRemaining={timerState.sectionTimeRemaining}
                />
              </div>

              {/* Section Navigation (only for sectioned tests) */}
              {isUsingSection() && (
                <SectionNavigation
                  onSubmitSection={() => setShowSectionSubmitModal(true)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <TestSessionModals
        showSubmitModal={showSubmitModal}
        showTimeWarningModal={showTimeWarningModal}
        onCloseSubmitModal={() => setShowSubmitModal(false)}
        onCloseTimeWarningModal={() => setShowTimeWarningModal(false)}
        onConfirmSubmit={handleManualSubmit}
        onShowSubmitFromWarning={() => {
          setShowTimeWarningModal(false);
          setShowSubmitModal(true);
        }}
      />

      {/* Section Submission Modal */}
      <SectionSubmissionModal
        isOpen={showSectionSubmitModal}
        onClose={() => setShowSectionSubmitModal(false)}
        onConfirmSubmit={handleSectionSubmit}
        sectionName={getCurrentSectionName()}
        sectionIndex={state.currentSectionIndex}
      />
    </div>
  );
};

export default TestSessionPage;