import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
  Progress,
  Spinner
} from 'reactstrap';
import {
  WifiOff,
  Wifi,
  Pause,
  Play,
  AlertTriangle,
  Clock,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface OfflineManagerProps {
  isTestActive: boolean;
  sessionId: string;
}

interface ConnectionState {
  isOnline: boolean;
  wasOffline: boolean;
  offlineStartTime: number | null;
  offlineDuration: number;
  reconnectAttempts: number;
  lastSuccessfulSync: number;
  maxOfflineTime: number;
}

const OfflineTestManager: React.FC<OfflineManagerProps> = ({
  isTestActive,
  sessionId
}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isOnline: navigator.onLine,
    wasOffline: false,
    offlineStartTime: null,
    offlineDuration: 0,
    reconnectAttempts: 0,
    lastSuccessfulSync: Date.now(),
    maxOfflineTime: 10 * 60 * 1000 // 10 minutes max offline time
  });

  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showReconnectedModal, setShowReconnectedModal] = useState(false);
  const [showMaxOfflineModal, setShowMaxOfflineModal] = useState(false);
  const [isTestPaused, setIsTestPaused] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  const reconnectTimeoutRef = useRef<number | null>(null);
  const offlineTimerRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const maxOfflineTimeoutRef = useRef<number | null>(null);

  // Enhanced connection detection with heartbeat
  const checkConnectionHealth = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/health', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Connection health check failed:', error);
      return false;
    }
  }, []);

  // Handle going offline
  const handleOffline = useCallback(() => {
    console.log('🔴 Connection lost - pausing test');
    
    const now = Date.now();
    setConnectionState(prev => ({
      ...prev,
      isOnline: false,
      wasOffline: true,
      offlineStartTime: now,
      reconnectAttempts: 0
    }));

    // Pause the test immediately
    if (isTestActive && !isTestPaused) {
      setIsTestPaused(true);
      
      // Dispatch custom event to notify parent component
      window.dispatchEvent(new CustomEvent('testPaused', { 
        detail: { reason: 'offline', timestamp: now } 
      }));
    }

    // Save current test state to localStorage
    const testState = {
      sessionId,
      timestamp: now,
      paused: true,
      reason: 'offline'
    };
    localStorage.setItem(`offline_test_${sessionId}`, JSON.stringify(testState));
    
    // Show offline modal
    setShowOfflineModal(true);

    // Start offline duration timer
    if (offlineTimerRef.current) clearInterval(offlineTimerRef.current);
    offlineTimerRef.current = window.setInterval(() => {
      setConnectionState(prev => {
        const newDuration = prev.offlineStartTime ? Date.now() - prev.offlineStartTime : 0;
        return { ...prev, offlineDuration: newDuration };
      });
    }, 1000);

    // Set maximum offline time timeout
    maxOfflineTimeoutRef.current = window.setTimeout(() => {
      setShowMaxOfflineModal(true);
    }, connectionState.maxOfflineTime);

    // Start reconnection attempts
    attemptReconnection();
  }, [isTestActive, isTestPaused, sessionId, connectionState.maxOfflineTime]);

  // Handle coming back online
  const handleOnline = useCallback(async () => {
    console.log('🟢 Connection restored - checking sync');

    // Verify connection is actually working
    const isHealthy = await checkConnectionHealth();
    if (!isHealthy) {
      console.warn('Connection restored but health check failed');
      return;
    }

    // Clear all timers
    if (offlineTimerRef.current) {
      clearInterval(offlineTimerRef.current);
      offlineTimerRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (maxOfflineTimeoutRef.current) {
      clearTimeout(maxOfflineTimeoutRef.current);
      maxOfflineTimeoutRef.current = null;
    }

    const offlineDuration = connectionState.offlineStartTime ? 
      Date.now() - connectionState.offlineStartTime : 0;

    setConnectionState(prev => ({
      ...prev,
      isOnline: true,
      offlineStartTime: null,
      reconnectAttempts: 0,
      offlineDuration: 0
    }));

    // Close offline modals
    setShowOfflineModal(false);
    setShowMaxOfflineModal(false);

    // Sync offline data if any
    if (offlineQueue.length > 0) {
      await syncOfflineData();
    }

    // Dispatch event to notify parent about reconnection
    window.dispatchEvent(new CustomEvent('testReconnected', { 
      detail: { 
        offlineDuration,
        queuedActions: offlineQueue.length,
        timestamp: Date.now()
      } 
    }));

    // Show reconnection modal
    setShowReconnectedModal(true);
  }, [checkConnectionHealth, offlineQueue, connectionState.offlineStartTime]);

  // Attempt to reconnect with exponential backoff
  const attemptReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

    reconnectTimeoutRef.current = window.setTimeout(async () => {
      setConnectionState(prev => ({
        ...prev,
        reconnectAttempts: prev.reconnectAttempts + 1
      }));

      const isHealthy = await checkConnectionHealth();
      if (isHealthy) {
        handleOnline();
      } else {
        // Exponential backoff: 2s, 4s, 8s, 16s, then 30s intervals
        const attempt = connectionState.reconnectAttempts;
        const delay = Math.min(2000 * Math.pow(2, Math.min(attempt, 4)), 30000);
        
        setTimeout(attemptReconnection, delay);
      }
    }, 2000);
  }, [connectionState.reconnectAttempts, checkConnectionHealth, handleOnline]);

  // Queue offline actions
  const queueOfflineAction = useCallback((action: any) => {
    setOfflineQueue(prev => [...prev, {
      ...action,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    }]);
  }, []);

  // Sync offline data when connection restored
  const syncOfflineData = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    setSyncingData(true);
    try {
      // Process offline queue (answers, progress, etc.)
      for (const item of offlineQueue) {
        await fetch('/api/test-sessions/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            ...item,
            timestamp: item.timestamp,
            wasOffline: true
          })
        });
      }

      // Clear queue after successful sync
      setOfflineQueue([]);
      setConnectionState(prev => ({
        ...prev,
        lastSuccessfulSync: Date.now()
      }));

      console.log('✅ Offline data synced successfully');
    } catch (error) {
      console.error('❌ Failed to sync offline data:', error);
      // Keep data in queue for next attempt
    } finally {
      setSyncingData(false);
    }
  }, [offlineQueue, sessionId]);

  // Resume test after reconnection
  const handleResumeTest = useCallback(() => {
    if (connectionState.isOnline && isTestPaused) {
      setIsTestPaused(false);
      setShowReconnectedModal(false);
      
      // Dispatch event to notify parent about test resumption
      window.dispatchEvent(new CustomEvent('testResumed', { 
        detail: { 
          offlineDuration: connectionState.offlineDuration,
          timestamp: Date.now()
        } 
      }));

      // Clean up offline test state
      localStorage.removeItem(`offline_test_${sessionId}`);
    }
  }, [connectionState.isOnline, connectionState.offlineDuration, isTestPaused, sessionId]);

  // Manual reconnection attempt
  const handleManualReconnect = useCallback(async () => {
    setConnectionState(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1
    }));

    const isHealthy = await checkConnectionHealth();
    if (isHealthy) {
      handleOnline();
    } else {
      // Continue automatic reconnection attempts
      attemptReconnection();
    }
  }, [checkConnectionHealth, handleOnline, attemptReconnection]);

  // Handle maximum offline time reached
  const handleMaxOfflineReached = useCallback(() => {
    // Force submit test or take other action
    window.dispatchEvent(new CustomEvent('testForceSubmit', { 
      detail: { 
        reason: 'maxOfflineTimeReached',
        offlineDuration: connectionState.offlineDuration,
        timestamp: Date.now()
      } 
    }));
  }, [connectionState.offlineDuration]);

  // Set up event listeners
  useEffect(() => {
    const handleOnlineEvent = () => handleOnline();
    const handleOfflineEvent = () => handleOffline();

    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('offline', handleOfflineEvent);

    // Start heartbeat monitoring when test is active
    if (isTestActive) {
      heartbeatRef.current = window.setInterval(async () => {
        if (navigator.onLine && connectionState.isOnline) {
          const isHealthy = await checkConnectionHealth();
          if (!isHealthy && connectionState.isOnline) {
            // Connection appears up but isn't working
            handleOffline();
          }
        }
      }, 30000); // Check every 30 seconds
    }

    return () => {
      window.removeEventListener('online', handleOnlineEvent);
      window.removeEventListener('offline', handleOfflineEvent);
      
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (offlineTimerRef.current) clearInterval(offlineTimerRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (maxOfflineTimeoutRef.current) clearTimeout(maxOfflineTimeoutRef.current);
    };
  }, [handleOnline, handleOffline, checkConnectionHealth, connectionState.isOnline, isTestActive]);

  // Expose queue function to parent via custom events
  useEffect(() => {
    const handleQueueAction = (event: CustomEvent) => {
      queueOfflineAction(event.detail);
    };

    window.addEventListener('queueOfflineAction', handleQueueAction as EventListener);
    
    return () => {
      window.removeEventListener('queueOfflineAction', handleQueueAction as EventListener);
    };
  }, [queueOfflineAction]);

  // Format offline duration
  const formatOfflineDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getReconnectDelay = () => {
    const attempt = connectionState.reconnectAttempts;
    return Math.min(2000 * Math.pow(2, Math.min(attempt, 4)), 30000) / 1000;
  };

  return (
    <>
      {/* Connection Status Indicator */}
      <div 
        className={`position-fixed top-0 end-0 m-3 p-2 rounded-pill d-flex align-items-center ${
          connectionState.isOnline ? 'bg-success' : 'bg-danger'
        } text-white`}
        style={{ zIndex: 1050, fontSize: '0.875rem' }}
      >
        {connectionState.isOnline ? (
          <>
            <Wifi size={16} className="me-1" />
            Connected
          </>
        ) : (
          <>
            <WifiOff size={16} className="me-1" />
            Offline
            {connectionState.reconnectAttempts > 0 && (
              <span className="ms-1">
                (#{connectionState.reconnectAttempts})
              </span>
            )}
          </>
        )}
      </div>

      {/* Test Paused Indicator */}
      {isTestPaused && (
        <div 
          className="position-fixed top-0 start-50 translate-middle-x mt-3 p-3 bg-warning text-dark rounded shadow"
          style={{ zIndex: 1049 }}
        >
          <div className="d-flex align-items-center">
            <Pause size={20} className="me-2" />
            <strong>Test Paused</strong>
            <span className="ms-2">- Connection lost</span>
          </div>
        </div>
      )}

      {/* Offline Modal */}
      <Modal 
        isOpen={showOfflineModal} 
        toggle={() => {}} 
        backdrop="static" 
        keyboard={false}
        centered
      >
        <ModalHeader>
          <WifiOff size={24} className="me-2 text-danger" />
          Connection Lost
        </ModalHeader>
        <ModalBody>
          <Alert color="warning" className="mb-3">
            <AlertTriangle size={16} className="me-2" />
            <strong>Your test has been automatically paused</strong>
          </Alert>
          
          <div className="mb-3">
            <p>Don't worry! Your progress has been saved locally and your test timer is paused.</p>
            <ul className="mb-0">
              <li>✅ All answers saved to device storage</li>
              <li>⏸️ Test timer paused automatically</li>
              <li>🔄 Attempting to reconnect...</li>
              <li>⏱️ Time offline will be added back to your test</li>
            </ul>
          </div>

          <div className="bg-light p-3 rounded mb-3">
            <div className="d-flex justify-content-between mb-2">
              <span>Offline Duration:</span>
              <span className="fw-bold">{formatOfflineDuration(connectionState.offlineDuration)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Reconnect Attempts:</span>
              <span>{connectionState.reconnectAttempts}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Queued Actions:</span>
              <span>{offlineQueue.length}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Next attempt in:</span>
              <span>{getReconnectDelay()}s</span>
            </div>
          </div>

          {/* Connection progress indicator */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Max offline time:</span>
              <span className="text-muted small">
                {formatOfflineDuration(connectionState.maxOfflineTime)}
              </span>
            </div>
            <Progress 
              value={(connectionState.offlineDuration / connectionState.maxOfflineTime) * 100}
              color={connectionState.offlineDuration > connectionState.maxOfflineTime * 0.8 ? 'danger' : 'warning'}
              style={{ height: '6px' }}
            />
          </div>

          <div className="text-center">
            <div className="mb-2">
              <Spinner size="sm" className="me-2" />
              <small className="text-muted">
                Attempting to reconnect... (attempt #{connectionState.reconnectAttempts + 1})
              </small>
            </div>
            <Button 
              color="outline-primary" 
              size="sm"
              onClick={handleManualReconnect}
            >
              <RefreshCw size={14} className="me-1" />
              Try Now
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Maximum Offline Time Modal */}
      <Modal 
        isOpen={showMaxOfflineModal} 
        toggle={() => {}} 
        backdrop="static" 
        keyboard={false}
        centered
      >
        <ModalHeader>
          <AlertTriangle size={24} className="me-2 text-danger" />
          Maximum Offline Time Reached
        </ModalHeader>
        <ModalBody>
          <Alert color="danger" className="mb-3">
            <AlertTriangle size={16} className="me-2" />
            <strong>You've been offline for too long</strong>
          </Alert>
          
          <div className="mb-3">
            <p>For test integrity, there's a maximum time you can be offline during a test.</p>
            <div className="bg-light p-3 rounded">
              <div className="d-flex justify-content-between">
                <span>Time offline:</span>
                <span className="fw-bold text-danger">
                  {formatOfflineDuration(connectionState.offlineDuration)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-muted">
            Your test will be automatically submitted with your current progress.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="danger" 
            onClick={handleMaxOfflineReached}
          >
            Submit Test Now
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reconnected Modal */}
      <Modal 
        isOpen={showReconnectedModal} 
        toggle={() => setShowReconnectedModal(false)}
        centered
      >
        <ModalHeader toggle={() => setShowReconnectedModal(false)}>
          <CheckCircle size={24} className="me-2 text-success" />
          Connection Restored
        </ModalHeader>
        <ModalBody>
          <Alert color="success" className="mb-3">
            <CheckCircle size={16} className="me-2" />
            <strong>Welcome back! Your connection has been restored.</strong>
          </Alert>

          <div className="mb-3">
            <p>Your test progress has been preserved:</p>
            <ul className="mb-0">
              <li>✅ All offline answers will be synced</li>
              <li>⏱️ Time spent offline: {formatOfflineDuration(connectionState.offlineDuration)}</li>
              <li>🎯 You can continue exactly where you left off</li>
            </ul>
          </div>

          {syncingData && (
            <div className="bg-light p-3 rounded mb-3">
              <div className="d-flex align-items-center">
                <Spinner size="sm" className="me-2" />
                <span>Syncing offline data...</span>
              </div>
              <Progress 
                animated 
                color="primary" 
                value={100} 
                className="mt-2" 
                style={{ height: '4px' }}
              />
            </div>
          )}

          {offlineQueue.length > 0 && (
            <div className="bg-light p-3 rounded mb-3">
              <div className="d-flex justify-content-between">
                <span>Actions to sync:</span>
                <span className="fw-bold">{offlineQueue.length}</span>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button 
            color="success" 
            onClick={handleResumeTest}
            disabled={syncingData}
          >
            <Play size={16} className="me-1" />
            Resume Test
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

// Hook for using offline management in test session
export const useOfflineTestManager = (sessionId: string) => {
  const [isTestPaused, setIsTestPaused] = useState(false);
  const [offlineTimeToAdd, setOfflineTimeToAdd] = useState(0);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  const queueOfflineAction = useCallback((action: any) => {
    // Dispatch event for the OfflineTestManager to handle
    window.dispatchEvent(new CustomEvent('queueOfflineAction', { detail: action }));
    
    // Also update local state for immediate UI feedback
    setOfflineQueue(prev => [...prev, {
      ...action,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    }]);
  }, []);

  // Listen for test lifecycle events from OfflineTestManager
  useEffect(() => {
    const handleTestPaused = (event: CustomEvent) => {
      setIsTestPaused(true);
      console.log('Test paused:', event.detail);
    };

    const handleTestResumed = (event: CustomEvent) => {
      setIsTestPaused(false);
      setOfflineTimeToAdd(event.detail.offlineDuration);
      console.log('Test resumed:', event.detail);
    };

    const handleTestReconnected = (event: CustomEvent) => {
      console.log('Test reconnected:', event.detail);
      // Clear offline queue since it will be synced
      setOfflineQueue([]);
    };

    const handleTestForceSubmit = (event: CustomEvent) => {
      console.log('Test force submit:', event.detail);
      // Handle forced submission due to max offline time
      window.dispatchEvent(new CustomEvent('forceSubmitTest', { detail: event.detail }));
    };

    window.addEventListener('testPaused', handleTestPaused as EventListener);
    window.addEventListener('testResumed', handleTestResumed as EventListener);
    window.addEventListener('testReconnected', handleTestReconnected as EventListener);
    window.addEventListener('testForceSubmit', handleTestForceSubmit as EventListener);

    return () => {
      window.removeEventListener('testPaused', handleTestPaused as EventListener);
      window.removeEventListener('testResumed', handleTestResumed as EventListener);
      window.removeEventListener('testReconnected', handleTestReconnected as EventListener);
      window.removeEventListener('testForceSubmit', handleTestForceSubmit as EventListener);
    };
  }, []);

  // Create the component with bound props
  const OfflineManagerComponent = useCallback((props: any) => (
    <OfflineTestManager
      {...props}
      sessionId={sessionId}
    />
  ), [sessionId]);

  return {
    OfflineTestManager: OfflineManagerComponent,
    isTestPaused,
    offlineTimeToAdd,
    queueOfflineAction,
    offlineQueue
  };
};

export default OfflineTestManager;