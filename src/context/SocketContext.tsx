// src/context/SocketContext.tsx - ENHANCED with client-side timer countdown
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import socketService from '../services/SocketService';
import { useAuth } from './AuthContext';
import { useNetworkStatus } from '../hooks/testSession/useNetworkStatus';
import type { SessionErrorEvent } from '../types';

// FIXED: Backend timer:sync event structure (from timerService.js sendTimerSync)
interface TimerSyncEvent {
  sessionId: string;
  timeRemaining: number;  // Backend: timerData.timeRemaining
  serverTime: number;     // Backend: Date.now()
  sectionIndex: number;   // Backend: timerData.sectionIndex || 0
  type: string;          // Backend: timerData.type || 'regular'
}

// Backend section:expired event structure (from testSessionController.js sendSectionExpired)
interface SectionExpiredEvent {
  sessionId: string;
  newSectionIndex: number;  // Backend: data.newSectionIndex
  message: string;          // Backend: data.message || 'Section time expired'
  timestamp: string;        // Backend: new Date().toISOString()
}

// Backend test:completed event structure (from testSessionController.js sendTestCompleted)
interface TestCompletedEvent {
  sessionId: string;
  message: string;    // Backend: data.message || 'Test completed'
  result: any;        // Backend: data.result
  timestamp: string;  // Backend: new Date().toISOString()
}

interface ConnectionStatus {
  isConnected: boolean;
  isOnline: boolean;
  sessionId?: string;
  lastConnectedAt?: Date;
  reconnectAttempts?: number;
}

// ENHANCED: Timer state with client-side countdown tracking
interface TimerState {
  timeRemaining: number;
  serverTime?: number;      // From backend timer:sync
  sectionIndex?: number;    // From backend (flat number)
  type?: string;           // From backend ('regular', etc.)
  isActive: boolean;       // Calculated: timeRemaining > 0 && isOnline
  isPaused: boolean;       // Calculated: !isOnline || !isConnected
  // NEW: Client-side countdown management
  lastSyncTime?: number;    // When we last synced with server (Date.now())
  lastSyncValue?: number;   // Server time remaining value at last sync
  countdownStartTime?: number; // When client countdown started
  currentSection?: {       // Generated from sectionIndex
    index: number;
    name?: string;
  };
}

interface SocketContextType {
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  networkStatus: ReturnType<typeof useNetworkStatus>;
  
  currentSessionId: string | null;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: (sessionId: string) => Promise<void>;
  
  timerState: TimerState;
  
  registerEventHandlers: (handlers: {
    onTimerSync?: (data: TimerSyncEvent) => void;
    onSectionExpired?: (data: SectionExpiredEvent) => void;
    onTestCompleted?: (data: TestCompletedEvent) => void;
    onSessionError?: (data: SessionErrorEvent) => void;
  }) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const networkStatus = useNetworkStatus();

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isOnline: networkStatus.isOnline,
    reconnectAttempts: 0,
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // ENHANCED: Timer state with countdown tracking
  const [timerState, setTimerState] = useState<TimerState>({
    timeRemaining: 0,
    isActive: false,
    isPaused: false,
  });

  const eventHandlerRefs = useRef<{
    onTimerSync?: (data: TimerSyncEvent) => void;
    onSectionExpired?: (data: SectionExpiredEvent) => void;
    onTestCompleted?: (data: TestCompletedEvent) => void;
    onSessionError?: (data: SessionErrorEvent) => void;
  }>({});

  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  
  // NEW: Client-side countdown interval
  const countdownIntervalRef = useRef<number | null>(null);

  // NEW: Start client-side countdown
  const startCountdown = useCallback((initialTime: number, syncTime: number) => {
    // Clear any existing countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    console.log(`Starting client countdown from ${initialTime} seconds`);

    const startTime = Date.now();
    
    countdownIntervalRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newTimeRemaining = Math.max(0, initialTime - elapsed);
      
      setTimerState(prev => {
        // Only update if the timer is active and not paused
        if (!prev.isActive || prev.isPaused) {
          return prev;
        }

        // If timer reaches 0, mark as inactive
        const isStillActive = newTimeRemaining > 0 && networkStatus.isOnline && connectionStatus.isConnected;
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          isActive: isStillActive,
        };
      });

      // Stop countdown when it reaches 0
      if (newTimeRemaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 1000);

    // Update timer state with countdown metadata
    setTimerState(prev => ({
      ...prev,
      lastSyncTime: syncTime,
      lastSyncValue: initialTime,
      countdownStartTime: startTime,
    }));
  }, [networkStatus.isOnline, connectionStatus.isConnected]);

  // NEW: Stop client-side countdown
  const stopCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      console.log('Stopping client countdown');
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // NEW: Pause/resume countdown based on connection status
  useEffect(() => {
    setTimerState(prev => {
      const shouldBePaused = !networkStatus.isOnline || !connectionStatus.isConnected;
      const shouldBeActive = prev.timeRemaining > 0 && !shouldBePaused;

      // If pausing, stop the countdown
      if (shouldBePaused && !prev.isPaused && countdownIntervalRef.current) {
        console.log('Pausing countdown due to connection issues');
        stopCountdown();
      }
      
      // If resuming and we have time remaining, restart countdown
      if (!shouldBePaused && prev.isPaused && prev.timeRemaining > 0) {
        console.log('Resuming countdown after reconnection');
        startCountdown(prev.timeRemaining, Date.now());
      }

      return {
        ...prev,
        isPaused: shouldBePaused,
        isActive: shouldBeActive,
      };
    });
  }, [networkStatus.isOnline, connectionStatus.isConnected, startCountdown, stopCountdown]);

  // Update connection status when network changes
  useEffect(() => {
    setConnectionStatus(prev => {
      const newStatus = { ...prev, isOnline: networkStatus.isOnline };

      if (!networkStatus.isOnline && prev.isOnline) {
        toast.warning('You are offline. Your session will be paused.', {
          toastId: 'network-offline',
          autoClose: false,
        });
      } else if (networkStatus.isOnline && !prev.isOnline) {
        toast.success('You are back online. Reconnecting...', {
          toastId: 'network-online',
          autoClose: 3000,
        });
      }

      return newStatus;
    });
  }, [networkStatus.isOnline]);

  // Socket connection management
  useEffect(() => {
    if (!isAuthenticated || !user || !networkStatus.isOnline) {
      if (socketService.isConnected()) {
        socketService.disconnect();
      }
      setConnectionStatus(prev => ({ 
        ...prev, 
        isConnected: false,
        sessionId: undefined 
      }));
      setCurrentSessionId(null);
      
      // Clear timer and countdown
      stopCountdown();
      setTimerState({
        timeRemaining: 0,
        isActive: false,
        isPaused: false,
      });
      return;
    }

    const connectSocket = async () => {
      try {
        await socketService.connect({
          url: import.meta.env.VITE_API_URL || 'http://localhost:7000',
          auth: { token: document.cookie.match(/accessToken=([^;]+)/)?.[1] }
        });

        setConnectionStatus(prev => ({ 
          ...prev, 
          isConnected: true,
          lastConnectedAt: new Date(),
          reconnectAttempts: 0,
        }));

        const cleanupFunctions: (() => void)[] = [];

        // 1. Session joined
        cleanupFunctions.push(
          socketService.onSessionJoined((data) => {
            console.log('SocketProvider: Session joined:', data);
            toast.success(data.message || 'Successfully joined session');
          })
        );

        // 2. ENHANCED: Timer sync handler with countdown start
        cleanupFunctions.push(
          socketService.onTimerSync((data: TimerSyncEvent) => {
            console.log('SocketProvider: Timer sync received:', data);
            
            const syncTime = Date.now();
            
            setTimerState(prev => {
              const shouldBeActive = data.timeRemaining > 0 && networkStatus.isOnline && connectionStatus.isConnected;
              const shouldBePaused = !networkStatus.isOnline || !connectionStatus.isConnected;

              return {
                ...prev,
                timeRemaining: data.timeRemaining,
                serverTime: data.serverTime,
                sectionIndex: data.sectionIndex,
                type: data.type,
                isActive: shouldBeActive,
                isPaused: shouldBePaused,
                currentSection: data.sectionIndex !== undefined ? { 
                  index: data.sectionIndex,
                  name: `Section ${data.sectionIndex + 1}`
                } : prev.currentSection,
              };
            });

            // Start client countdown if timer is active
            if (data.timeRemaining > 0 && networkStatus.isOnline && connectionStatus.isConnected) {
              startCountdown(data.timeRemaining, syncTime);
            } else {
              stopCountdown();
            }

            // Call user handler
            if (eventHandlerRefs.current.onTimerSync) {
              eventHandlerRefs.current.onTimerSync(data);
            }
          })
        );

        // 3. Section expired handler
        cleanupFunctions.push(
          socketService.onSectionExpired((data: SectionExpiredEvent) => {
            console.log('SocketProvider: Section expired:', data);
            
            // Stop current countdown since section changed
            stopCountdown();
            
            setTimerState(prev => ({
              ...prev,
              sectionIndex: data.newSectionIndex,
              currentSection: {
                index: data.newSectionIndex,
                name: `Section ${data.newSectionIndex + 1}`
              }
            }));

            toast.info(data.message, {
              position: 'top-center',
              toastId: `section-expired-${data.newSectionIndex}`
            });

            if (eventHandlerRefs.current.onSectionExpired) {
              eventHandlerRefs.current.onSectionExpired(data);
            }
          })
        );

        // 4. Test completed handler
        cleanupFunctions.push(
          socketService.onTestCompleted((data: TestCompletedEvent) => {
            console.log('SocketProvider: Test completed:', data);
            
            // Stop countdown and clear session state
            stopCountdown();
            setCurrentSessionId(null);
            setTimerState({
              timeRemaining: 0,
              isActive: false,
              isPaused: false,
            });

            toast.success(data.message, {
              autoClose: false,
              position: 'top-center',
              toastId: 'test-completed'
            });

            if (eventHandlerRefs.current.onTestCompleted) {
              eventHandlerRefs.current.onTestCompleted(data);
            }
          })
        );

        // 5. Session error handler
        cleanupFunctions.push(
          socketService.onSessionError((data: SessionErrorEvent) => {
            console.error('SocketProvider: Session error:', data);
            
            toast.error(data.message, {
              autoClose: 5000,
              position: 'top-center',
              toastId: 'session-error'
            });

            if (eventHandlerRefs.current.onSessionError) {
              eventHandlerRefs.current.onSessionError(data);
            }
          })
        );

        cleanupFunctionsRef.current = cleanupFunctions;

      } catch (error) {
        console.error('SocketProvider: Failed to connect socket:', error);
        setConnectionStatus(prev => ({ 
          ...prev, 
          isConnected: false,
          reconnectAttempts: (prev.reconnectAttempts || 0) + 1,
        }));
      }
    };

    connectSocket();

    // Connection health check
    const connectionInterval = setInterval(() => {
      const isConnected = socketService.isConnected();
      setConnectionStatus(prev => ({ ...prev, isConnected }));

      if (!isConnected && networkStatus.isOnline && isAuthenticated) {
        console.log('SocketProvider: Connection lost, attempting to reconnect...');
        connectSocket();
      }
    }, 5000);

    return () => {
      clearInterval(connectionInterval);
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
      stopCountdown(); // Clear countdown on cleanup
      socketService.disconnect();
    };
  }, [isAuthenticated, user, networkStatus.isOnline, connectionStatus.isConnected, startCountdown, stopCountdown]);

  // Update connection status with session info
  useEffect(() => {
    setConnectionStatus(prev => ({
      ...prev,
      sessionId: currentSessionId || undefined,
    }));
  }, [currentSessionId]);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      stopCountdown();
    };
  }, [stopCountdown]);

  // Session management
  const joinSession = useCallback(async (sessionId: string) => {
    console.log('SocketProvider: Joining session', sessionId);
    try {
      await socketService.joinTestSession(sessionId);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('SocketProvider: Failed to join session', sessionId, error);
      throw error;
    }
  }, []);

  const leaveSession = useCallback(async (sessionId: string) => {
    console.log('SocketProvider: Leaving session', sessionId);
    try {
      await socketService.leaveTestSession(sessionId);
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        stopCountdown();
        setTimerState({
          timeRemaining: 0,
          isActive: false,
          isPaused: false,
        });
      }
    } catch (error) {
      console.error('SocketProvider: Failed to leave session', sessionId, error);
    }
  }, [currentSessionId, stopCountdown]);

  // Event handler registration
  const registerEventHandlers = useCallback((handlers: {
    onTimerSync?: (data: TimerSyncEvent) => void;
    onSectionExpired?: (data: SectionExpiredEvent) => void;
    onTestCompleted?: (data: TestCompletedEvent) => void;
    onSessionError?: (data: SessionErrorEvent) => void;
  }) => {
    eventHandlerRefs.current = handlers;
    return () => {
      eventHandlerRefs.current = {};
    };
  }, []);

  const value: SocketContextType = {
    connectionStatus,
    isConnected: connectionStatus.isConnected,
    networkStatus,
    currentSessionId,
    joinSession,
    leaveSession,
    timerState,
    registerEventHandlers,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Utility hooks (unchanged)
export const useSocketConnection = () => {
  const { connectionStatus, isConnected, networkStatus } = useSocket();
  
  const getConnectionMessage = () => {
    if (!networkStatus.isOnline) {
      return {
        type: 'warning' as const,
        message: 'You are offline. Your session is paused.',
        icon: 'wifi-off',
        gracePeriod: networkStatus.hasBeenOfflineTooLong ? 'expired' : 'active'
      };
    }

    if (!connectionStatus.isConnected) {
      return {
        type: 'danger' as const,
        message: 'Connection lost. Attempting to reconnect...',
        icon: 'wifi-off'
      };
    }

    return null;
  };

  return {
    connectionStatus,
    isConnected,
    networkStatus,
    isFullyConnected: networkStatus.isOnline && connectionStatus.isConnected,
    connectionMessage: getConnectionMessage(),
  };
};

export const useSocketSession = () => {
  const { currentSessionId, joinSession, leaveSession } = useSocket();
  
  return {
    currentSessionId,
    joinSession,
    leaveSession,
    hasActiveSession: !!currentSessionId,
  };
};