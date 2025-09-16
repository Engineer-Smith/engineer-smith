// src/context/SocketContext.tsx - FIXED to prevent double event registration
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import socketService from '../services/SocketService';
import { useAuth } from './AuthContext';
import { useNetworkStatus } from '../hooks/testSession/useNetworkStatus';
import type { SessionErrorEvent } from '../types';

// Existing timer event interfaces...
interface TimerSyncEvent {
  sessionId: string;
  timeRemaining: number;
  serverTime: number;
  sectionIndex: number;
  type: string;
}

interface SectionExpiredEvent {
  sessionId: string;
  newSectionIndex: number;
  message: string;
  timestamp: string;
}

interface TestCompletedEvent {
  sessionId: string;
  message: string;
  result: any;
  timestamp: string;
}

// NEW: Notification event interfaces
interface NotificationReceivedEvent {
  _id?: string;
  recipientId?: string;
  senderId?: string;
  organizationId?: string;
  recipientRole?: string; // NEW: For socket-based role targeting
  type: string;
  title: string;
  message: string;
  relatedModel?: string;
  relatedId?: string;
  actionUrl?: string;
  actionText?: string;
  createdAt?: string;
  sender?: any;
  data?: any;
}

interface NotificationBadgeUpdateEvent {
  unreadCount: number;
}

interface NotificationsUnreadCountEvent {
  count: number;
}

interface NotificationsRecentEvent {
  notifications: any[];
}

interface AttemptRequestEvent {
  success: boolean;
  requestId?: string;
  decision?: string;
  message?: string;
}

interface OverrideGrantedEvent {
  success: boolean;
  override?: any;
  message?: string;
}

interface ConnectionStatus {
  isConnected: boolean;
  isOnline: boolean;
  sessionId?: string;
  lastConnectedAt?: Date;
  reconnectAttempts?: number;
}

interface TimerState {
  timeRemaining: number;
  serverTime?: number;
  sectionIndex?: number;
  type?: string;
  isActive: boolean;
  isPaused: boolean;
  lastSyncTime?: number;
  lastSyncValue?: number;
  countdownStartTime?: number;
  currentSection?: {
    index: number;
    name?: string;
  };
}

// ENHANCED: Extended event handler interface
interface SocketContextType {
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  networkStatus: ReturnType<typeof useNetworkStatus>;
  
  currentSessionId: string | null;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: (sessionId: string) => Promise<void>;
  
  timerState: TimerState;
  
  // ENHANCED: Support both timer and notification events
  registerEventHandlers: (handlers: {
    // Timer events
    onTimerSync?: (data: TimerSyncEvent) => void;
    onSectionExpired?: (data: SectionExpiredEvent) => void;
    onTestCompleted?: (data: TestCompletedEvent) => void;
    onSessionError?: (data: SessionErrorEvent) => void;
    
    // Notification events
    onNotificationReceived?: (data: NotificationReceivedEvent) => void;
    onNotificationBadgeUpdate?: (data: NotificationBadgeUpdateEvent) => void;
    onNotificationsUnreadCount?: (data: NotificationsUnreadCountEvent) => void;
    onNotificationsRecent?: (data: NotificationsRecentEvent) => void;
    onAttemptRequestSubmitted?: (data: AttemptRequestEvent) => void;
    onAttemptRequestReviewed?: (data: AttemptRequestEvent) => void;
    onOverrideGranted?: (data: OverrideGrantedEvent) => void;
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
  
  const [timerState, setTimerState] = useState<TimerState>({
    timeRemaining: 0,
    isActive: false,
    isPaused: false,
  });

  // FIXED: Track registration state to prevent duplicates
  const eventHandlerRefs = useRef<{
    onTimerSync?: (data: TimerSyncEvent) => void;
    onSectionExpired?: (data: SectionExpiredEvent) => void;
    onTestCompleted?: (data: TestCompletedEvent) => void;
    onSessionError?: (data: SessionErrorEvent) => void;
    onNotificationReceived?: (data: NotificationReceivedEvent) => void;
    onNotificationBadgeUpdate?: (data: NotificationBadgeUpdateEvent) => void;
    onNotificationsUnreadCount?: (data: NotificationsUnreadCountEvent) => void;
    onNotificationsRecent?: (data: NotificationsRecentEvent) => void;
    onAttemptRequestSubmitted?: (data: AttemptRequestEvent) => void;
    onAttemptRequestReviewed?: (data: AttemptRequestEvent) => void;
    onOverrideGranted?: (data: OverrideGrantedEvent) => void;
  }>({});

  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  const countdownIntervalRef = useRef<number | null>(null);
  
  // FIXED: Track if base socket handlers are registered
  const baseHandlersRegistered = useRef<boolean>(false);

  // Timer countdown functions (unchanged)
  const startCountdown = useCallback((initialTime: number, syncTime: number) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    const startTime = Date.now();
    
    countdownIntervalRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newTimeRemaining = Math.max(0, initialTime - elapsed);
      
      setTimerState(prev => {
        if (!prev.isActive || prev.isPaused) {
          return prev;
        }

        const isStillActive = newTimeRemaining > 0 && networkStatus.isOnline && connectionStatus.isConnected;
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          isActive: isStillActive,
        };
      });

      if (newTimeRemaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 1000);

    setTimerState(prev => ({
      ...prev,
      lastSyncTime: syncTime,
      lastSyncValue: initialTime,
      countdownStartTime: startTime,
    }));
  }, [networkStatus.isOnline, connectionStatus.isConnected]);

  const stopCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Timer state management (unchanged)
  useEffect(() => {
    setTimerState(prev => {
      const shouldBePaused = !networkStatus.isOnline || !connectionStatus.isConnected;
      const shouldBeActive = prev.timeRemaining > 0 && !shouldBePaused;

      if (shouldBePaused && !prev.isPaused && countdownIntervalRef.current) {
        stopCountdown();
      }
      
      if (!shouldBePaused && prev.isPaused && prev.timeRemaining > 0) {
        startCountdown(prev.timeRemaining, Date.now());
      }

      return {
        ...prev,
        isPaused: shouldBePaused,
        isActive: shouldBeActive,
      };
    });
  }, [networkStatus.isOnline, connectionStatus.isConnected, startCountdown, stopCountdown]);

  // Network status updates (unchanged)
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

  // FIXED: Socket connection management - prevent double registration
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
      
      // FIXED: Reset registration flag
      baseHandlersRegistered.current = false;
      
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

        // FIXED: Only register base handlers once per connection
        if (!baseHandlersRegistered.current) {
          
          const cleanupFunctions: (() => void)[] = [];

          // =====================
          // SESSION & TIMER EVENTS (existing)
          // =====================

          cleanupFunctions.push(
            socketService.onSessionJoined((data) => {
              toast.success(data.message || 'Successfully joined session');
            })
          );

          cleanupFunctions.push(
            socketService.onTimerSync((data: TimerSyncEvent) => {
              
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

              if (data.timeRemaining > 0 && networkStatus.isOnline && connectionStatus.isConnected) {
                startCountdown(data.timeRemaining, syncTime);
              } else {
                stopCountdown();
              }

              if (eventHandlerRefs.current.onTimerSync) {
                eventHandlerRefs.current.onTimerSync(data);
              }
            })
          );

          cleanupFunctions.push(
            socketService.onSectionExpired((data: SectionExpiredEvent) => {
              
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

          cleanupFunctions.push(
            socketService.onTestCompleted((data: TestCompletedEvent) => {
              
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

          // =====================
          // NOTIFICATION EVENTS - FIXED: Single registration
          // =====================

          if (socketService.onNotificationReceived) {
            cleanupFunctions.push(
              socketService.onNotificationReceived((data: NotificationReceivedEvent) => {
                
                // FIXED: Only forward to registered handlers, don't process here
                if (eventHandlerRefs.current.onNotificationReceived) {
                  eventHandlerRefs.current.onNotificationReceived(data);
                }
              })
            );
          }

          if (socketService.onNotificationBadgeUpdate) {
            cleanupFunctions.push(
              socketService.onNotificationBadgeUpdate((data: NotificationBadgeUpdateEvent) => {
                
                if (eventHandlerRefs.current.onNotificationBadgeUpdate) {
                  eventHandlerRefs.current.onNotificationBadgeUpdate(data);
                }
              })
            );
          }

          if (socketService.onNotificationsUnreadCount) {
            cleanupFunctions.push(
              socketService.onNotificationsUnreadCount((data: NotificationsUnreadCountEvent) => {
                
                if (eventHandlerRefs.current.onNotificationsUnreadCount) {
                  eventHandlerRefs.current.onNotificationsUnreadCount(data);
                }
              })
            );
          }

          if (socketService.onNotificationsRecent) {
            cleanupFunctions.push(
              socketService.onNotificationsRecent((data: NotificationsRecentEvent) => {
                
                if (eventHandlerRefs.current.onNotificationsRecent) {
                  eventHandlerRefs.current.onNotificationsRecent(data);
                }
              })
            );
          }

          if (socketService.onAttemptRequestSubmitted) {
            cleanupFunctions.push(
              socketService.onAttemptRequestSubmitted((data: AttemptRequestEvent) => {
                
                if (eventHandlerRefs.current.onAttemptRequestSubmitted) {
                  eventHandlerRefs.current.onAttemptRequestSubmitted(data);
                }
              })
            );
          }

          if (socketService.onAttemptRequestReviewed) {
            cleanupFunctions.push(
              socketService.onAttemptRequestReviewed((data: AttemptRequestEvent) => {
                
                if (eventHandlerRefs.current.onAttemptRequestReviewed) {
                  eventHandlerRefs.current.onAttemptRequestReviewed(data);
                }
              })
            );
          }

          if (socketService.onOverrideGranted) {
            cleanupFunctions.push(
              socketService.onOverrideGranted((data: OverrideGrantedEvent) => {
                
                if (eventHandlerRefs.current.onOverrideGranted) {
                  eventHandlerRefs.current.onOverrideGranted(data);
                }
              })
            );
          }

          cleanupFunctionsRef.current = cleanupFunctions;
          baseHandlersRegistered.current = true;
        }

      } catch (error) {
        console.error('SocketProvider: Failed to connect socket:', error);
        setConnectionStatus(prev => ({ 
          ...prev, 
          isConnected: false,
          reconnectAttempts: (prev.reconnectAttempts || 0) + 1,
        }));
        baseHandlersRegistered.current = false;
      }
    };

    connectSocket();

    const connectionInterval = setInterval(() => {
      const isConnected = socketService.isConnected();
      setConnectionStatus(prev => ({ ...prev, isConnected }));

      if (!isConnected && networkStatus.isOnline && isAuthenticated) {
        baseHandlersRegistered.current = false; // Reset on reconnection
        connectSocket();
      }
    }, 5000);

    return () => {
      clearInterval(connectionInterval);
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
      baseHandlersRegistered.current = false;
      stopCountdown();
      socketService.disconnect();
    };
  }, [isAuthenticated, user, networkStatus.isOnline, startCountdown, stopCountdown]);

  // Session management (unchanged)
  useEffect(() => {
    setConnectionStatus(prev => ({
      ...prev,
      sessionId: currentSessionId || undefined,
    }));
  }, [currentSessionId]);

  useEffect(() => {
    return () => {
      stopCountdown();
    };
  }, [stopCountdown]);

  const joinSession = useCallback(async (sessionId: string) => {
    try {
      await socketService.joinTestSession(sessionId);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error('SocketProvider: Failed to join session', sessionId, error);
      throw error;
    }
  }, []);

  const leaveSession = useCallback(async (sessionId: string) => {
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

  // ENHANCED: Event handler registration for ALL events
  const registerEventHandlers = useCallback((handlers: {
    onTimerSync?: (data: TimerSyncEvent) => void;
    onSectionExpired?: (data: SectionExpiredEvent) => void;
    onTestCompleted?: (data: TestCompletedEvent) => void;
    onSessionError?: (data: SessionErrorEvent) => void;
    onNotificationReceived?: (data: NotificationReceivedEvent) => void;
    onNotificationBadgeUpdate?: (data: NotificationBadgeUpdateEvent) => void;
    onNotificationsUnreadCount?: (data: NotificationsUnreadCountEvent) => void;
    onNotificationsRecent?: (data: NotificationsRecentEvent) => void;
    onAttemptRequestSubmitted?: (data: AttemptRequestEvent) => void;
    onAttemptRequestReviewed?: (data: AttemptRequestEvent) => void;
    onOverrideGranted?: (data: OverrideGrantedEvent) => void;
  }) => {
    
    // FIXED: Replace handlers instead of merging to prevent accumulation
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