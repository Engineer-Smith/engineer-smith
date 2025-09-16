// src/hooks/testSession/useTestSessionTimers.ts - FIXED to prioritize context state
import { useMemo, useEffect, useState, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';

export interface TimerDisplayState {
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  currentSection?: {
    index: number;
    name?: string;
  };
  formatTimeRemaining: () => string;
  isLowTime: boolean;
  isCriticalTime: boolean;
  isWarningTime: boolean;
  serverTime?: number;
  type?: string;
}

/**
 * FIXED: Timer hook that prioritizes context timeRemaining over socket timerState
 * This ensures that when we rejoin and immediately set timeRemaining from API response,
 * it takes precedence over potentially stale socket timer state
 */
export const useTestSessionTimers = (contextTimeRemaining?: number | null): TimerDisplayState => {
  const { timerState, networkStatus } = useSocket();
  
  // Client-side countdown state
  const [clientTimeRemaining, setClientTimeRemaining] = useState(0);
  const countdownRef = useRef<number | null>(null);
  const lastSyncRef = useRef<{ time: number; timestamp: number } | null>(null);

  // Initialize timer from context or socket
  useEffect(() => {
    let initialTime = 0;
    
    // Priority: Context (for initial load/rejoin) > Socket > 0
    if (contextTimeRemaining !== null && contextTimeRemaining !== undefined) {
      initialTime = contextTimeRemaining;
    } else if (timerState.timeRemaining > 0) {
      initialTime = timerState.timeRemaining;
    }
    
    if (initialTime > 0) {
      setClientTimeRemaining(initialTime);
      lastSyncRef.current = { time: initialTime, timestamp: Date.now() };
    }
  }, [contextTimeRemaining]); // Only run when context changes (initial load/rejoin)

  // Sync with socket timer updates (every 30 seconds from server)
  useEffect(() => {
    if (timerState.timeRemaining > 0) {
      setClientTimeRemaining(timerState.timeRemaining);
      lastSyncRef.current = { time: timerState.timeRemaining, timestamp: Date.now() };
    }
  }, [timerState.timeRemaining]); // Sync when socket updates

  // Client-side countdown (runs every second)
  useEffect(() => {
    if (!timerState.isActive || timerState.isPaused || !networkStatus.isOnline) {
      // Stop countdown when inactive/paused/offline
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }

    // Start/continue countdown
    if (!countdownRef.current && clientTimeRemaining > 0) {
      countdownRef.current = window.setInterval(() => {
        setClientTimeRemaining(prev => {
          const newTime = Math.max(0, prev - 1);
          if (newTime === 0) {
            // Timer reached 0, clear interval
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
          }
          return newTime;
        });
      }, 1000);
    }

    // Cleanup
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [timerState.isActive, timerState.isPaused, networkStatus.isOnline, clientTimeRemaining]);

  // Format time function
  const formatTimeRemaining = (): string => {
    const timeRemaining = clientTimeRemaining;
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Time warning calculations
  const isLowTime = useMemo(() => {
    return clientTimeRemaining <= 300 && clientTimeRemaining > 60; // 5 minutes
  }, [clientTimeRemaining]);

  const isCriticalTime = useMemo(() => {
    return clientTimeRemaining <= 60; // 1 minute
  }, [clientTimeRemaining]);

  const isWarningTime = useMemo(() => {
    return clientTimeRemaining <= 900 && clientTimeRemaining > 300; // 15 minutes
  }, [clientTimeRemaining]);

  const isActive = useMemo(() => {
    return timerState.isActive && networkStatus.isOnline && clientTimeRemaining > 0;
  }, [timerState.isActive, networkStatus.isOnline, clientTimeRemaining]);

  const isPaused = useMemo(() => {
    return timerState.isPaused || !networkStatus.isOnline;
  }, [timerState.isPaused, networkStatus.isOnline]);

  return {
    timeRemaining: clientTimeRemaining, // Use client countdown value
    isActive,
    isPaused,
    currentSection: timerState.currentSection,
    formatTimeRemaining,
    isLowTime,
    isCriticalTime,
    isWarningTime,
    serverTime: timerState.serverTime,
    type: timerState.type
  };
};