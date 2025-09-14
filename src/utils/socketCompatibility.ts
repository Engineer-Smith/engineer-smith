// src/utils/socketCompatibility.ts
// Compatibility layer between SocketService implementation and socket type interfaces

import type {
  SessionTimerUpdateEvent,
  SessionWarningEvent,
  SessionExpiredEvent,
  SessionErrorEvent,
  SessionJoinedEvent
} from '../types/socket';

// Internal SocketService event types (what your implementation actually sends)
export interface InternalNavigationEvent {
  sessionId: string;
  fromQuestionIndex: number;
  toQuestionIndex: number;
  action: string;
  timeSpentOnPrevious: number;
  currentSectionIndex?: number;
  currentQuestionInSection?: number;
  canNavigateForward: boolean;
  canNavigateBackward: boolean;
}

export interface InternalAnswerSavedEvent {
  sessionId: string;
  questionIndex: number;
  questionId: string;
  answer: any;
  timeSpent: number;
  source: 'manual_entry' | 'auto_save' | 'navigation_save';
  isCorrect?: boolean;
  pointsEarned?: number;
}

export interface InternalSectionCompletedEvent {
  sessionId: string;
  sectionIndex: number;
  sectionName: string;
  questionsAnswered: number;
  questionsSkipped: number;
  totalQuestions: number;
  timeSpent: number;
  nextSectionIndex?: number;
  allSectionsCompleted: boolean;
  isReadyForFinalSubmission: boolean;
}

// Legacy TimeWarningEvent (still used in some places)
export interface InternalTimeWarningEvent {
  sessionId: string;
  warningType: 'session' | 'section';
  timeRemainingSeconds: number;
  timeRemainingMinutes: number;
  warningThreshold: number;
  urgencyLevel: 'info' | 'warning' | 'critical';
  message: string;
  autoSubmitIn?: number;
}

export interface InternalSocketErrorEvent {
  code: string;
  message: string;
  sessionId?: string;
  userId?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
}

export interface InternalSessionJoinEvent {
  sessionId: string;
  testId: string;
  testTitle?: string;
  attemptNumber: number;
  totalQuestions: number;
  timeLimit: number;
  message?: string;
}

export interface InternalSessionLeaveEvent {
  sessionId: string;
  reason: 'manual' | 'expired' | 'completed' | 'abandoned' | 'connection_lost';
  timeSpent?: number;
  questionsAnswered?: number;
  message?: string;
}

export interface InternalHeartbeatEvent {
  sessionId: string;
  serverTime: string;
  sessionActive: boolean;
  timeRemaining: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

// Utility functions to convert between internal and public types
export const convertToPublicTimerUpdate = (internal: any): SessionTimerUpdateEvent => ({
  sessionId: internal.sessionId,
  timeRemaining: internal.timeRemaining,
  status: internal.status || 'active',
  timestamp: internal.timestamp || new Date().toISOString(),
  userId: internal.userId
});

export const convertToPublicWarning = (internal: InternalTimeWarningEvent): SessionWarningEvent => ({
  sessionId: internal.sessionId,
  message: internal.message,
  timeRemaining: internal.timeRemainingSeconds,
  timestamp: new Date().toISOString()
});

export const convertToPublicExpired = (internal: any): SessionExpiredEvent => ({
  sessionId: internal.sessionId,
  message: internal.message || 'Session has expired',
  result: internal.result || internal.finalScore || {
    totalPoints: 0,
    earnedPoints: 0,
    percentage: 0,
    passed: false
  },
  timestamp: internal.timestamp || new Date().toISOString()
});

export const convertToPublicError = (internal: InternalSocketErrorEvent): SessionErrorEvent => ({
  sessionId: internal.sessionId || '',
  message: internal.message,
  error: internal.code,
  timestamp: internal.timestamp,
  userId: internal.userId
});

export const convertToPublicJoined = (internal: InternalSessionJoinEvent): SessionJoinedEvent => ({
  sessionId: internal.sessionId,
  message: internal.message,
  timestamp: new Date().toISOString()
});

// Type guards for internal events
export const isInternalTimerUpdate = (event: any): event is SessionTimerUpdateEvent => {
  return event && typeof event.sessionId === 'string' && typeof event.timeRemaining === 'number';
};

export const isInternalWarning = (event: any): event is InternalTimeWarningEvent => {
  return event && typeof event.sessionId === 'string' && 
         typeof event.timeRemainingSeconds === 'number' && 
         typeof event.message === 'string';
};

export const isInternalExpired = (event: any): event is SessionExpiredEvent => {
  return event && typeof event.sessionId === 'string' && 
         (event.result || event.finalScore || event.message);
};

// Enhanced SocketService wrapper that provides type-safe event handling
export class TypedSocketServiceWrapper {
  private socketService: any;

  constructor(socketService: any) {
    this.socketService = socketService;
  }

  onSessionTimerUpdate(callback: (data: SessionTimerUpdateEvent) => void): () => void {
    const wrappedCallback = (data: any) => {
      if (isInternalTimerUpdate(data)) {
        callback(convertToPublicTimerUpdate(data));
      }
    };
    return this.socketService.onSessionTimerUpdate(wrappedCallback);
  }

  onSessionWarning(callback: (data: SessionWarningEvent) => void): () => void {
    const wrappedCallback = (data: any) => {
      if (isInternalWarning(data)) {
        callback(convertToPublicWarning(data));
      }
    };
    return this.socketService.onSessionWarning(wrappedCallback);
  }

  onSessionExpired(callback: (data: SessionExpiredEvent) => void): () => void {
    const wrappedCallback = (data: any) => {
      if (isInternalExpired(data)) {
        callback(convertToPublicExpired(data));
      }
    };
    return this.socketService.onSessionExpired(wrappedCallback);
  }

  // Pass through methods for other events
  onNavigationUpdate(callback: (data: InternalNavigationEvent) => void): () => void {
    return this.socketService.onNavigationUpdate(callback);
  }

  onAnswerSaved(callback: (data: InternalAnswerSavedEvent) => void): () => void {
    return this.socketService.onAnswerSaved(callback);
  }

  onSectionCompleted(callback: (data: InternalSectionCompletedEvent) => void): () => void {
    return this.socketService.onSectionCompleted(callback);
  }

  // Connection management methods
  connect() {
    return this.socketService.connect();
  }

  disconnect() {
    return this.socketService.disconnect();
  }

  joinSession(sessionId: string) {
    return this.socketService.joinSession(sessionId);
  }

  leaveSession(sessionId: string) {
    return this.socketService.leaveSession(sessionId);
  }

  getSocket() {
    return this.socketService.getSocket();
  }

  isConnected() {
    return this.socketService.isConnected();
  }
}