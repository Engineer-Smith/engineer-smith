// src/components/tests/TestSessionWarnings.tsx
import React, { useEffect, useState } from 'react';
import { useTestSession } from '../../context/TestSessionContext';

interface TestSessionWarningsProps {
  onShowTimeWarning: () => void;
  onShowSectionWarning: () => void;
}

export const TestSessionWarnings: React.FC<TestSessionWarningsProps> = ({
  onShowTimeWarning,
  onShowSectionWarning
}) => {
  const { timerState } = useTestSession();
  const [hasShownTimeWarning, setHasShownTimeWarning] = useState(false);
  const [hasShownSectionWarning, setHasShownSectionWarning] = useState(false);

  // Show time warning at 5 minutes
  useEffect(() => {
    if (timerState.timeRemaining === 300 && !hasShownTimeWarning) {
      setHasShownTimeWarning(true);
      onShowTimeWarning();
    }
  }, [timerState.timeRemaining, hasShownTimeWarning, onShowTimeWarning]);

  // Show section warning at 2 minutes
  useEffect(() => {
    if (timerState.sectionTimeRemaining === 120 && !hasShownSectionWarning) {
      setHasShownSectionWarning(true);
      onShowSectionWarning();
    }
  }, [timerState.sectionTimeRemaining, hasShownSectionWarning, onShowSectionWarning]);

  // Reset warnings when time resets (shouldn't happen but just in case)
  useEffect(() => {
    if (timerState.timeRemaining > 300) {
      setHasShownTimeWarning(false);
    }
    if ((timerState.sectionTimeRemaining || 0) > 120) {
      setHasShownSectionWarning(false);
    }
  }, [timerState.timeRemaining, timerState.sectionTimeRemaining]);

  return null; // This component doesn't render anything, just manages warnings
};