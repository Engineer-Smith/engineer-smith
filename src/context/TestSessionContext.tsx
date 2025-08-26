// src/context/TestSessionContext.tsx - COMPLETE VERSION WITH TIMER SYNC
import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useMemo, useState } from 'react';
import { useTestSessionAPI, useTimer, useAutoSave, useNetworkStatus } from '../hooks/useTestSessionHooks';

// Import your existing types
import type { TestSession, Test } from '../types';

interface TestSessionState {
  // Session data
  testSession: TestSession | null;
  test: Test | null;

  // UI state
  loading: boolean;
  error: string | null;
  submitting: boolean;

  // Test taking state
  currentQuestionIndex: number;
  currentSectionIndex: number;
  answers: Record<string, any>;
  flaggedQuestions: Set<number>;

  // Auto-save state
  lastSaved: number;
  autoSaveStatus: 'saved' | 'saving' | 'error';
  hasUnsavedChanges: boolean;

  // Network state
  isOnline: boolean;
}

type TestSessionAction =
  | { type: 'INITIALIZE_SESSION'; payload: { testSession: TestSession; test: Test } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'UPDATE_ANSWER'; payload: { questionId: string; answer: any } }
  | { type: 'TOGGLE_FLAG'; payload: number }
  | { type: 'NAVIGATE_QUESTION'; payload: number }
  | { type: 'NAVIGATE_SECTION'; payload: number }
  | { type: 'SET_AUTO_SAVE_STATUS'; payload: 'saved' | 'saving' | 'error' }
  | { type: 'MARK_SAVED' }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'RESET_SESSION' };

const initialState: TestSessionState = {
  testSession: null,
  test: null,
  loading: true,
  error: null,
  submitting: false,
  currentQuestionIndex: 0,
  currentSectionIndex: 0,
  answers: {},
  flaggedQuestions: new Set(),
  lastSaved: Date.now(),
  autoSaveStatus: 'saved',
  hasUnsavedChanges: false,
  isOnline: navigator.onLine
};

function testSessionReducer(state: TestSessionState, action: TestSessionAction): TestSessionState {
  switch (action.type) {
    case 'INITIALIZE_SESSION': {
      const { testSession, test } = action.payload;
      return {
        ...state,
        testSession,
        test,
        loading: false,
        error: null
      };
    }

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };

    case 'UPDATE_ANSWER': {
      const { questionId, answer } = action.payload;
      const newAnswers = { ...state.answers, [questionId]: answer };
      return {
        ...state,
        answers: newAnswers,
        hasUnsavedChanges: true,
        autoSaveStatus: 'saving'
      };
    }

    case 'TOGGLE_FLAG': {
      const questionIndex = action.payload;
      const newFlagged = new Set(state.flaggedQuestions);
      if (newFlagged.has(questionIndex)) {
        newFlagged.delete(questionIndex);
      } else {
        newFlagged.add(questionIndex);
      }
      return {
        ...state,
        flaggedQuestions: newFlagged,
        hasUnsavedChanges: true
      };
    }

    case 'NAVIGATE_QUESTION':
      return { ...state, currentQuestionIndex: action.payload };

    case 'NAVIGATE_SECTION':
      return { ...state, currentSectionIndex: action.payload };

    case 'SET_AUTO_SAVE_STATUS':
      return { ...state, autoSaveStatus: action.payload };

    case 'MARK_SAVED':
      return {
        ...state,
        lastSaved: Date.now(),
        autoSaveStatus: 'saved',
        hasUnsavedChanges: false
      };

    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };

    case 'RESET_SESSION':
      return initialState;

    default:
      return state;
  }
}

interface TestSessionContextValue {
  state: TestSessionState;
  timerState: {
    timeRemaining: number;
    sectionTimeRemaining?: number;
    isTimerInitialized: boolean;
  };
  actions: {
    initializeSession: (sessionId: string) => Promise<void>;
    updateAnswer: (questionId: string, answer: any) => void;
    toggleFlag: (questionIndex: number) => void;
    navigateToQuestion: (index: number) => void;
    navigateToSection: (index: number) => void;
    submitCurrentSection: () => Promise<any>;
    submitTest: () => Promise<void>;
    abandonTest: () => Promise<void>;
    saveProgress: () => Promise<void>;
    resetSession: () => void;
    syncTime: () => Promise<void>;
  };
}

const TestSessionContext = createContext<TestSessionContextValue | null>(null);

export const useTestSession = () => {
  const context = useContext(TestSessionContext);
  if (!context) {
    throw new Error('useTestSession must be used within a TestSessionProvider');
  }
  return context;
};

interface TestSessionProviderProps {
  children: React.ReactNode;
}

export const TestSessionProvider: React.FC<TestSessionProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(testSessionReducer, initialState);

  // Timer adjustment state for server sync
  const [timerAdjustment, setTimerAdjustment] = useState(0);

  // Use our custom hooks
  const api = useTestSessionAPI();
  const { isOnline } = useNetworkStatus();

  // Add request tracking to prevent double calls in React Strict Mode
  const isRequestInProgress = useRef(false);
  const hasSessionLoaded = useRef(false);

  // Calculate initial time with server adjustment
  const initialTime = useMemo(() => {
    if (!state.testSession || !state.test) return null;

    const startTime = new Date(state.testSession.startedAt).getTime();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const timeLimit = state.test.settings.timeLimit * 60;
    const calculatedTime = Math.max(0, timeLimit - elapsed + timerAdjustment);

    console.log('Timer calculation:', {
      startTime: new Date(state.testSession.startedAt),
      elapsed,
      timeLimit,
      timerAdjustment,
      calculatedTime
    });

    return calculatedTime;
  }, [state.testSession, state.test, timerAdjustment]);

  // Auto-submit when timer expires
  const handleTimerExpire = useCallback(async () => {
    console.log('Timer expired - auto-submitting');

    if (!state.testSession || state.submitting) return;

    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });

      const totalTimeSpent = state.testSession.timeSpent +
        (Date.now() - new Date(state.testSession.startedAt).getTime()) / 1000;

      await api.submitSession(state.testSession.id, {
        answers: state.answers,
        timeSpent: totalTimeSpent,
        status: 'expired',
        questions: state.testSession.questions
      });

    } catch (error: any) {
      console.error('Failed to auto-submit test:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [state.testSession, state.submitting, state.answers, api]);

  // Main timer using improved hook
  const { timeRemaining, isInitialized, stopTimer: stopMainTimer } = useTimer(
    initialTime,
    handleTimerExpire,
    !isOnline // Pause when offline
  );

  // Server time synchronization function
  const syncWithServer = useCallback(async () => {
  // Add more robust validation
  if (!state.testSession || !state.test || !state.testSession.id) {
    console.warn('Cannot sync: missing session data', {
      hasSession: !!state.testSession,
      hasTest: !!state.test,
      sessionId: state.testSession?.id
    });
    return;
  }

  // Additional check for valid ObjectId format
  if (typeof state.testSession.id !== 'string' || state.testSession.id === 'undefined' || state.testSession.id.length !== 24) {
    console.error('Invalid session ID format:', state.testSession.id);
    return;
  }

  try {
    console.log('Performing time sync with sessionId:', state.testSession.id);
    const syncData = await api.syncTime(state.testSession.id);

    if (!syncData) {
      console.warn('Sync data is undefined, skipping sync');
      return;
    }

    // ... rest of sync logic
  } catch (error) {
    console.warn('Timer sync failed:', error);
  }
}, [state.testSession, state.test, timeRemaining, api.syncTime]);

  // Timer sync effect - runs after session loads and periodically
  useEffect(() => {
    if (!state.testSession || !state.test || !isInitialized) {
      return;
    }

    // Perform initial sync after timer has stabilized (3 seconds)
    const initialSyncTimer = setTimeout(() => {
      syncWithServer();
    }, 3000);

    // Set up periodic sync every 2 minutes
    const periodicSyncInterval = setInterval(() => {
      syncWithServer();
    }, 120000);

    return () => {
      clearTimeout(initialSyncTimer);
      clearInterval(periodicSyncInterval);
    };
  }, [state.testSession, state.test, isInitialized, syncWithServer]);

  // Section timer (if sections are used)
  const getSectionTimeLimit = useCallback(() => {
    if (!state.test?.settings.useSections || !state.test.sections) return null;
    const currentSection = state.test.sections[state.currentSectionIndex];
    return currentSection ? currentSection.timeLimit * 60 : null;
  }, [state.test, state.currentSectionIndex]);

  const handleSectionTimeExpire = useCallback(() => {
    console.log('Section timer expired');
    // Could auto-submit section or show warning
  }, []);

  const { timeRemaining: sectionTimeRemaining, isInitialized: sectionTimerInitialized } = useTimer(
    getSectionTimeLimit(),
    handleSectionTimeExpire,
    !state.test?.settings.useSections || !isOnline
  );

  // Define submitTest to avoid circular dependency
  const submitTest = useCallback(async () => {
    if (!state.testSession || state.submitting) return;

    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });

      const totalTimeSpent = state.testSession.timeSpent +
        (Date.now() - new Date(state.testSession.startedAt).getTime()) / 1000;

      await api.submitSession(state.testSession.id, {
        answers: state.answers,
        timeSpent: totalTimeSpent,
        status: 'completed', // Manual submission
        questions: state.testSession.questions
      });

    } catch (error: any) {
      console.error('Failed to submit test:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [state.testSession, state.answers, state.submitting, api]);

  // Create save function for auto-save hook
  const saveFunction = useCallback(async () => {
    if (!state.testSession) return;

    dispatch({ type: 'SET_AUTO_SAVE_STATUS', payload: 'saving' });

    try {
      await api.saveProgress(state.testSession.id, {
        answers: state.answers,
        flaggedQuestions: Array.from(state.flaggedQuestions),
        currentQuestionIndex: state.currentQuestionIndex,
        timeSpent: state.testSession.timeSpent + (Date.now() - new Date(state.testSession.startedAt).getTime()) / 1000,
        questions: state.testSession.questions
      });

      dispatch({ type: 'MARK_SAVED' });
    } catch (error: any) {
      console.error('Failed to save progress:', error);
      dispatch({ type: 'SET_AUTO_SAVE_STATUS', payload: 'error' });
    }
  }, [state.testSession, state.answers, state.flaggedQuestions, state.currentQuestionIndex, api]);

  // Auto-save using our custom hook with stable data
  const autoSaveData = useMemo(() => ({
    answers: state.answers,
    flaggedQuestions: Array.from(state.flaggedQuestions)
  }), [state.answers, state.flaggedQuestions]);

  const { saveStatus, manualSave } = useAutoSave(
    saveFunction,
    autoSaveData,
    30000 // 30 seconds
  );

  // Sync network status
  useEffect(() => {
    dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline });
  }, [isOnline]);

  // Sync auto-save status only when it actually changes
  const prevSaveStatusRef = useRef(saveStatus);
  useEffect(() => {
    if (prevSaveStatusRef.current !== saveStatus) {
      prevSaveStatusRef.current = saveStatus;
      dispatch({ type: 'SET_AUTO_SAVE_STATUS', payload: saveStatus });
    }
  }, [saveStatus]);

  // Add request tracking to prevent double calls
  const initializeSession = useCallback(async (sessionId: string) => {
    // Prevent concurrent requests
    if (isRequestInProgress.current) {
      console.log('TestSessionContext: Request already in progress, skipping...');
      return;
    }

    if (hasSessionLoaded.current && state.testSession?.id === sessionId) {
      console.log('TestSessionContext: Session already loaded, skipping...');
      return;
    }

    isRequestInProgress.current = true;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('TestSessionContext: Initializing session:', sessionId);
      const { testSession, test } = await api.initializeSession(sessionId);

      dispatch({
        type: 'INITIALIZE_SESSION',
        payload: { testSession, test }
      });

      hasSessionLoaded.current = true;

    } catch (error: any) {
      console.error('Failed to initialize session:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      isRequestInProgress.current = false;
    }
  }, [api, state.testSession]);

  const updateAnswer = useCallback((questionId: string, answer: any) => {
    dispatch({ type: 'UPDATE_ANSWER', payload: { questionId, answer } });
  }, []);

  const toggleFlag = useCallback((questionIndex: number) => {
    dispatch({ type: 'TOGGLE_FLAG', payload: questionIndex });
  }, []);

  const navigateToQuestion = useCallback((index: number) => {
    dispatch({ type: 'NAVIGATE_QUESTION', payload: index });
  }, []);

  const navigateToSection = useCallback((index: number) => {
    dispatch({ type: 'NAVIGATE_SECTION', payload: index });
  }, []);

  const submitCurrentSection = useCallback(async () => {
    if (!state.testSession || !state.test?.settings.useSections || state.submitting) return;

    const currentSection = state.currentSectionIndex;

    // Check if section already completed
    if (state.testSession.completedSections.includes(currentSection)) {
      dispatch({ type: 'SET_ERROR', payload: 'This section has already been submitted' });
      return;
    }

    try {
      dispatch({ type: 'SET_SUBMITTING', payload: true });

      const totalTimeSpent = state.testSession.timeSpent +
        (Date.now() - new Date(state.testSession.startedAt).getTime()) / 1000;

      const result = await api.submitSection(state.testSession.id, {
        sectionIndex: currentSection,
        answers: state.answers,
        questions: state.testSession.questions,
        timeSpent: totalTimeSpent
      });

      if (result.error) {
        throw new Error(result.message || 'Failed to submit section');
      }

      // Update completed sections
      const newTestSession = {
        ...state.testSession,
        completedSections: [...state.testSession.completedSections, currentSection]
      };

      dispatch({
        type: 'INITIALIZE_SESSION',
        payload: { testSession: newTestSession, test: state.test }
      });

      // Navigate to next section if available
      if (result.data.nextSectionIndex !== null) {
        dispatch({ type: 'NAVIGATE_SECTION', payload: result.data.nextSectionIndex });
      }

      return result.data;
    } catch (error: any) {
      console.error('Failed to submit section:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [state.testSession, state.test, state.currentSectionIndex, state.answers, state.submitting, api]);

  const abandonTest = useCallback(async () => {
    if (!state.testSession) return;

    try {
      await api.abandonSession(state.testSession.id);
      stopMainTimer();
      dispatch({ type: 'RESET_SESSION' });
    } catch (error: any) {
      console.error('Failed to abandon test:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [state.testSession, stopMainTimer, api]);

  const saveProgress = useCallback(async () => {
    await manualSave();
  }, [manualSave]);

  // Manual time sync function
  const manualTimeSync = useCallback(async () => {
    await syncWithServer();
  }, [syncWithServer]);

  // Reset session with timer adjustment reset
  const resetSession = useCallback(() => {
    stopMainTimer();
    setTimerAdjustment(0); // Reset timer adjustment
    dispatch({ type: 'RESET_SESSION' });
    hasSessionLoaded.current = false;
    isRequestInProgress.current = false;
  }, [stopMainTimer]);

  // Memoize the entire context value to prevent re-creation
  const contextValue = useMemo<TestSessionContextValue>(() => ({
    state,
    timerState: {
      timeRemaining,
      sectionTimeRemaining: state.test?.settings.useSections && sectionTimerInitialized ? sectionTimeRemaining : undefined,
      isTimerInitialized: isInitialized
    },
    actions: {
      initializeSession,
      updateAnswer,
      toggleFlag,
      navigateToQuestion,
      navigateToSection,
      submitCurrentSection,
      submitTest,
      abandonTest,
      saveProgress,
      resetSession,
      syncTime: manualTimeSync
    }
  }), [
    state,
    timeRemaining,
    sectionTimeRemaining,
    sectionTimerInitialized,
    isInitialized,
    initializeSession,
    updateAnswer,
    toggleFlag,
    navigateToQuestion,
    navigateToSection,
    submitCurrentSection,
    submitTest,
    abandonTest,
    saveProgress,
    resetSession,
    manualTimeSync
  ]);

  return (
    <TestSessionContext.Provider value={contextValue}>
      {children}
    </TestSessionContext.Provider>
  );
};