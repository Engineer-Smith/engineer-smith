// src/services/SocketService.ts - CORRECTED to match exact backend implementation
import { io, Socket } from 'socket.io-client';

// CORRECTED: Event interfaces to match server exactly
interface SessionJoinedEvent {
  sessionId: string;
  timestamp?: string;
  message: string;
  // Backend may include additional data from handleSocketJoin result
  [key: string]: any;
}

// CORRECTED: Backend sendTimerSync() sends this exact structure
interface TimerSyncEvent {
  sessionId: string;
  timeRemaining: number; // timerData.timeRemaining
  serverTime: number;    // Date.now()
  sectionIndex: number;  // timerData.sectionIndex || 0
  type: string;         // timerData.type || 'regular'
}

// CORRECTED: Backend sendTimerWarning() sends this
interface TimerWarningEvent {
  sessionId: string;
  timeRemaining: number;
  message: string;
  type: 'warning';
}

// CORRECTED: Backend sendSectionExpired() sends this exact structure  
interface SectionExpiredEvent {
  sessionId: string;
  message: string; // data.message || 'Section time expired'
  newSectionIndex: number; // data.newSectionIndex
  timestamp: string; // new Date().toISOString()
}

// CORRECTED: Backend sendTestCompleted() sends this exact structure
interface TestCompletedEvent {
  sessionId: string;
  message: string; // data.message || 'Test completed'
  result: any; // data.result  
  timestamp: string; // new Date().toISOString()
}

// CORRECTED: Backend session error events
interface SessionErrorEvent {
  sessionId: string;
  message: string;
  error: string;
  timestamp?: string;
}

// CORRECTED: Backend sends session:rejoined for rejoin confirmation
interface SessionRejoinedEvent {
  sessionId: string;
  message: string; // 'Successfully rejoined session'  
  timestamp?: string;
  // Backend includes additional data from handleSocketRejoin result
  [key: string]: any;
}

// Backend session pause/resume notifications
interface SessionPausedEvent {
  sessionId: string;
  reason: string; // data.reason || 'disconnection'
  gracePeriodSeconds: number; // data.gracePeriodSeconds || 300
  message: string; // data.message || 'Session paused due to disconnection'
}

interface SessionResumedEvent {
  sessionId: string;
  message: string; // data.message || 'Session resumed'
  [key: string]: any; // Additional data
}

// Backend answer processing events (if using socket submission)
interface AnswerProcessedEvent {
  sessionId: string;
  success: boolean;
  action: string; // result.action
  [key: string]: any; // ...result.data
}

interface AnswerErrorEvent {
  message: string;
  error: string;
}

interface SocketServiceConfig {
  url: string;
  auth?: {
    token?: string;
  };
}

class SocketService {
  private socket: Socket | null = null;
  private currentSessionId: string | null = null;

  async connect(config: SocketServiceConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(config.url, {
        withCredentials: true,
        auth: config.auth || { token: this.getAuthToken() }
      });

      this.socket.on('connect', () => {
        console.log('SocketService: Connected successfully');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('SocketService: Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('SocketService: Disconnected:', reason);
      });
    });
  }

  async disconnect(): Promise<void> {
    if (this.currentSessionId) {
      await this.leaveTestSession(this.currentSessionId);
    }
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.currentSessionId = null;
  }

  // CORRECTED: Session management using exact backend event names
  async joinTestSession(sessionId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    console.log('SocketService: Joining test session:', sessionId);
    this.currentSessionId = sessionId;
    
    // ✅ Backend expects 'session:join'
    this.socket.emit('session:join', { sessionId });
  }

  async rejoinTestSession(sessionId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    console.log('SocketService: Rejoining test session:', sessionId);
    this.currentSessionId = sessionId;
    
    // ✅ Backend expects 'session:rejoin'
    this.socket.emit('session:rejoin', { sessionId });
  }

  async leaveTestSession(sessionId: string): Promise<void> {
    if (!this.socket?.connected) return;

    console.log('SocketService: Leaving test session:', sessionId);
    
    // Backend doesn't have explicit leave handler, but emit anyway for completeness
    this.socket.emit('session:leave', { sessionId });
    
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
  }

  // Submit answer via socket (optional - your app uses REST)
  async submitAnswer(sessionId: string, answerData: any): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    console.log('SocketService: Submitting answer via socket:', sessionId);
    
    // ✅ Backend expects 'answer:submit'
    this.socket.emit('answer:submit', {
      sessionId,
      ...answerData
    });
  }

  // Manual timer sync request  
  async requestTimerSync(sessionId: string): Promise<void> {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }

    console.log('SocketService: Requesting timer sync:', sessionId);
    
    // ✅ Backend expects 'timer:request_sync'
    this.socket.emit('timer:request_sync', { sessionId });
  }

  // =====================
  // CORRECTED: Event listeners matching exact backend emissions
  // =====================

  // ✅ Backend emits 'session:joined'
  onSessionJoined(callback: (data: SessionJoinedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('session:joined', callback);
    return () => this.socket?.off('session:joined', callback);
  }

  // ✅ Backend emits 'session:rejoined'  
  onSessionRejoined(callback: (data: SessionRejoinedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('session:rejoined', callback);
    return () => this.socket?.off('session:rejoined', callback);
  }

  // ✅ Backend emits 'timer:sync' via sendTimerSync()
  onTimerSync(callback: (data: TimerSyncEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('timer:sync', callback);
    return () => this.socket?.off('timer:sync', callback);
  }

  // ✅ Backend emits 'timer:warning' via sendTimerWarning()
  onTimerWarning(callback: (data: TimerWarningEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('timer:warning', callback);
    return () => this.socket?.off('timer:warning', callback);
  }

  // ✅ Backend emits 'section:expired' via sendSectionExpired()
  onSectionExpired(callback: (data: SectionExpiredEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('section:expired', callback);
    return () => this.socket?.off('section:expired', callback);
  }

  // ✅ Backend emits 'test:completed' via sendTestCompleted()
  onTestCompleted(callback: (data: TestCompletedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('test:completed', callback);
    return () => this.socket?.off('test:completed', callback);
  }

  // ✅ Backend emits 'session:error'
  onSessionError(callback: (data: SessionErrorEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('session:error', callback);
    return () => this.socket?.off('session:error', callback);
  }

  // ✅ Backend emits 'session:paused' via sendSessionPaused()
  onSessionPaused(callback: (data: SessionPausedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('session:paused', callback);
    return () => this.socket?.off('session:paused', callback);
  }

  // ✅ Backend emits 'session:resumed' via sendSessionResumed()
  onSessionResumed(callback: (data: SessionResumedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('session:resumed', callback);
    return () => this.socket?.off('session:resumed', callback);
  }

  // =====================
  // SOCKET-BASED ANSWER SUBMISSION EVENTS (if you use them)
  // =====================

  // ✅ Backend emits 'answer:processed' after socket answer submission
  onAnswerProcessed(callback: (data: AnswerProcessedEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('answer:processed', callback);
    return () => this.socket?.off('answer:processed', callback);
  }

  // ✅ Backend emits 'answer:error' on socket answer submission failure
  onAnswerError(callback: (data: AnswerErrorEvent) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('answer:error', callback);
    return () => this.socket?.off('answer:error', callback);
  }

  // ✅ Backend emits 'question:next' for socket-based navigation
  onQuestionNext(callback: (data: any) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('question:next', callback);
    return () => this.socket?.off('question:next', callback);
  }

  // ✅ Backend emits 'section:transition' for socket-based navigation  
  onSectionTransition(callback: (data: any) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('section:transition', callback);
    return () => this.socket?.off('section:transition', callback);
  }

  // ✅ Backend emits 'test:ready_for_completion' for socket-based flow
  onTestReadyForCompletion(callback: (data: any) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on('test:ready_for_completion', callback);
    return () => this.socket?.off('test:ready_for_completion', callback);
  }

  // =====================
  // LEGACY COMPATIBILITY
  // =====================

  // Keep old method for backward compatibility
  onTimerUpdate(callback: (data: any) => void): () => void {
    console.warn('SocketService: onTimerUpdate is deprecated, use onTimerSync instead');
    return this.onTimerSync(callback);
  }

  // =====================
  // UTILITY METHODS  
  // =====================

  // Generic event listener
  on(eventName: string, callback: (...args: any[]) => void): () => void {
    if (!this.socket) throw new Error('Socket not connected');
    
    this.socket.on(eventName, callback);
    return () => this.socket?.off(eventName, callback);
  }

  off(eventName: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(eventName, callback);
    } else {
      this.socket.removeAllListeners(eventName);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  private getAuthToken(): string | null {
    const cookieMatch = document.cookie.match(/accessToken=([^;]+)/);
    if (cookieMatch) {
      return cookieMatch[1];
    }
    return localStorage.getItem('accessToken') || null;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;