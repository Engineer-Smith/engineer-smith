// src/hooks/useTestSessionHooks.ts - UPDATED WITH FIXED TIMER
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import type { TestSession, Test } from '../types';

// Hook for API operations - integrates with your existing apiService
export const useTestSessionAPI = () => {
  const { user, isAuthenticated } = useAuth();

  const initializeSession = useCallback(async (sessionId: string) => {
    if (!isAuthenticated || !user || user.role !== 'student') {
      throw new Error('Only students can access test sessions');
    }

    console.log('API: Initializing session:', sessionId);

    // Use your existing API service
    const sessionResponse = await apiService.getTestSession(sessionId);
    if (sessionResponse.error) {
      throw new Error(sessionResponse.message || 'Failed to fetch test session');
    }

    const testResponse = await apiService.getTestWithQuestions(sessionResponse.data!.testId);
    if (testResponse.error) {
      throw new Error(testResponse.message || 'Failed to fetch test data');
    }

    return {
      testSession: sessionResponse.data!,
      test: testResponse.data!
    };
  }, [isAuthenticated, user]);

  const saveProgress = useCallback(async (sessionId: string, progressData: {
    answers: Record<string, any>;
    flaggedQuestions: number[];
    currentQuestionIndex: number;
    timeSpent: number;
    questions: any[]; // Pass the original questions array from the session
  }) => {
    console.log('API: Saving progress for session:', sessionId, progressData);

    try {
      // Map answers by questionId to the session questions array
      const updatedQuestions = progressData.questions.map((question, index) => {
        const questionId = question.questionId || question._id;
        return {
          ...question, // Keep original questionId, sectionIndex, etc.
          answer: progressData.answers[questionId], // Look up answer by questionId
          timeSpent: question.timeSpent || 0 // Keep existing timeSpent or default to 0
        };
      });

      // Use submitTestSession for progress saves (without final status)
      const response = await apiService.submitTestSession(sessionId, {
        questions: updatedQuestions,
        // Don't set status for progress saves - backend will keep it as 'inProgress'
        timeSpent: progressData.timeSpent
      });

      if (response.error) {
        throw new Error(response.message || 'Failed to save progress');
      }

      return response.data;
    } catch (error: any) {
      console.error('API Error in saveProgress:', error);
      throw new Error(error.message || 'Failed to save progress');
    }
  }, []);

  const submitSection = useCallback(async (sessionId: string, sectionData: {
    sectionIndex: number;
    answers: Record<string, any>;
    questions: any[];
    timeSpent: number;
  }) => {
    console.log('API: Submitting section:', sessionId, sectionData);

    // Filter questions for this section only
    const sectionQuestions = sectionData.questions
      .filter(q => q.sectionIndex === sectionData.sectionIndex)
      .map(question => {
        const questionId = question.questionId || question._id;
        return {
          questionId,
          answer: sectionData.answers[questionId],
          timeSpent: question.timeSpent || 0,
          sectionIndex: sectionData.sectionIndex
        };
      });

    try {
      const response = await fetch(`/api/test-sessions/${sessionId}/submit-section`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionIndex: sectionData.sectionIndex,
          questions: sectionQuestions
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit section');
      }

      return { data, error: false };
    } catch (error: any) {
      console.error('API Error in submitSection:', error);
      return { error: true, message: error.message };
    }
  }, []);

  const submitSession = useCallback(async (sessionId: string, submissionData: {
    answers: Record<string, any>;
    timeSpent: number;
    status: 'completed' | 'expired';
    questions: any[]; // Pass the original questions array
  }) => {
    console.log('API: Submitting session:', sessionId, submissionData);

    // Map answers by questionId to the session questions array
    const finalQuestions = submissionData.questions.map((question, index) => {
      const questionId = question.questionId || question._id;
      return {
        ...question,
        answer: submissionData.answers[questionId], // Look up answer by questionId
        timeSpent: question.timeSpent || 0
      };
    });

    const response = await apiService.submitTestSession(sessionId, {
      questions: finalQuestions,
      status: submissionData.status,
      timeSpent: submissionData.timeSpent
    });

    if (response.error) {
      throw new Error(response.message || 'Failed to submit test');
    }

    return response.data;
  }, []);

  const abandonSession = useCallback(async (sessionId: string) => {
    console.log('API: Abandoning session:', sessionId);

    const response = await apiService.abandonTestSession(sessionId);
    if (response.error) {
      throw new Error(response.message || 'Failed to abandon session');
    }
    return response.data;
  }, []);

  const syncTime = useCallback(async (sessionId: string) => {
    console.log('API: Syncing time for session:', sessionId);

    // Add validation
    if (!sessionId || sessionId === 'undefined' || typeof sessionId !== 'string' || sessionId.length !== 24) {
      throw new Error(`Invalid session ID provided to syncTime: ${sessionId}`);
    }

    const response = await apiService.syncTime(sessionId);
    if (response.error) {
      throw new Error(response.message || 'Failed to sync time');
    }
    return response.data;
  }, []);

  return {
    initializeSession,
    saveProgress,
    submitSection,
    submitSession,
    abandonSession,
    syncTime
  };
};

// FIXED: Timer hook that supports dynamic initial time
export const useTimer = (
  initialTime: number | null, // Allow null for delayed initialization
  onExpire: () => void,
  isPaused: boolean = false
) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(initialTime);
  const timerRef = useRef<number | null>(null);
  const hasInitialized = useRef(false);

  // Update time remaining when initial time changes from null to a number
  useEffect(() => {
    if (initialTime !== null && !hasInitialized.current) {
      setTimeRemaining(initialTime);
      hasInitialized.current = true;
      console.log('Timer initialized with:', initialTime);
    }
  }, [initialTime]);

  // Clean up timer function
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start timer function
  const startTimer = useCallback(() => {
    // Don't start if already running or time not initialized
    if (timerRef.current || timeRemaining === null) return;

    console.log('Starting timer with time remaining:', timeRemaining);

    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) return prev;

        const newTime = prev - 1;
        if (newTime <= 0) {
          // Stop timer before calling onExpire to prevent multiple calls
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          onExpire();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }, [onExpire, timeRemaining]);

  // Effect to handle pause/resume
  useEffect(() => {
    if (!isPaused && timeRemaining !== null && timeRemaining > 0) {
      startTimer();
    } else {
      stopTimer();
    }

    // Cleanup on unmount or when dependencies change
    return stopTimer;
  }, [isPaused, timeRemaining !== null && timeRemaining > 0, startTimer, stopTimer]);

  return {
    timeRemaining: timeRemaining ?? 0, // Return 0 if not initialized for display purposes
    isInitialized: timeRemaining !== null && hasInitialized.current,
    setTimeRemaining,
    stopTimer
  };
};

// Auto-save hook with debouncing
export const useAutoSave = (
  saveFunction: () => Promise<void>,
  data: any,
  delay: number = 30000 // 30 seconds default
) => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const lastSavedDataRef = useRef<string>('{}');

  const save = useCallback(async () => {
    if (saveStatus === 'saving') return;

    try {
      setSaveStatus('saving');
      await saveFunction();
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      lastSavedDataRef.current = JSON.stringify(data);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
    }
  }, [saveFunction, data, saveStatus]);

  // Check for changes in data and schedule save
  useEffect(() => {
    const currentDataString = JSON.stringify(data);
    const hasChanged = currentDataString !== lastSavedDataRef.current;

    if (hasChanged && lastSavedDataRef.current !== '{}') {
      setHasUnsavedChanges(true);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Schedule new save
      saveTimeoutRef.current = window.setTimeout(() => {
        save();
      }, delay);
    }
  }, [data, delay, save]);

  // Manual save function
  const manualSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await save();
  }, [save]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    hasUnsavedChanges,
    manualSave
  };
};

// Network status hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 Network: Back online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('🔴 Network: Gone offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};