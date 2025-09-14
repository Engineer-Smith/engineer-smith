// components/Dashboard/ActiveSessionAlert.tsx - FIXED to work standalone
import React from 'react';
import { Alert, Button } from 'reactstrap';
import { useSocket } from '../../context/SocketContext';
import type { TestSession } from '../../types';

interface ActiveSessionAlertProps {
  activeSession: TestSession | null;
  onResumeSession: () => void;
}

export const ActiveSessionAlert: React.FC<ActiveSessionAlertProps> = ({ 
  activeSession, 
  onResumeSession 
}) => {
  if (!activeSession) return null;

  // FIXED: Get basic connection/network data from SocketContext (always available)
  const { networkStatus, connectionStatus } = useSocket();

  // Calculate time remaining for the session
  const calculateTimeRemaining = (): number => {
    if (!activeSession.startedAt || !activeSession.testSnapshot?.settings?.timeLimit) {
      return 0;
    }
    
    const startTime = new Date(activeSession.startedAt).getTime();
    const now = Date.now();
    const timeLimitMs = activeSession.testSnapshot.settings.timeLimit * 60 * 1000;
    const elapsedMs = now - startTime;
    const remainingMs = Math.max(0, timeLimitMs - elapsedMs);
    
    return Math.floor(remainingMs / 1000);
  };

  const formatTimeRemaining = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const timeRemaining = calculateTimeRemaining();
  
  // Determine alert color and status
  const getAlertColor = () => {
    if (!networkStatus.isOnline) return 'info';
    if (timeRemaining <= 300) return 'danger'; // Less than 5 minutes
    if (timeRemaining <= 900) return 'warning'; // Less than 15 minutes
    return 'primary';
  };

  const getStatusMessage = () => {
    if (!networkStatus.isOnline) {
      return 'You are offline - session may be paused';
    }
    if (!connectionStatus.isConnected) {
      return 'Connection lost - session may be paused';
    }
    if (timeRemaining <= 60) {
      return 'URGENT: Less than 1 minute remaining!';
    }
    if (timeRemaining <= 300) {
      return 'Warning: Less than 5 minutes remaining';
    }
    return 'Your test session is active';
  };

  const isExpired = timeRemaining <= 0;

  if (isExpired) {
    return (
      <Alert color="danger" className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="alert-heading mb-1">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Test session expired
            </h6>
            <p className="mb-2">
              <strong>{activeSession.testSnapshot?.title}</strong> - Attempt #{activeSession.attemptNumber}
            </p>
            <p className="mb-0 small text-muted">
              Your test session has expired and should be auto-submitted.
            </p>
          </div>
          <div>
            <Button color="secondary" disabled>
              <i className="fas fa-clock me-2"></i>
              Expired
            </Button>
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <Alert color={getAlertColor()} className="mb-4">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="alert-heading mb-1">
            <i className="fas fa-clock me-2"></i>
            {getStatusMessage()}
          </h6>
          <p className="mb-2">
            <strong>{activeSession.testSnapshot?.title}</strong> - Attempt #{activeSession.attemptNumber}
          </p>
          
          {/* Time remaining display */}
          <div className="mb-0 small">
            <span>Time remaining: </span>
            <strong className={timeRemaining <= 300 ? "text-danger" : "text-dark"}>
              {formatTimeRemaining(timeRemaining)}
            </strong>
          </div>

          {/* Connection status indicators */}
          {!networkStatus.isOnline && (
            <div className="mt-1 small">
              <span className="text-warning">
                <i className="fas fa-wifi me-1"></i>
                You are offline - timer may be paused
              </span>
            </div>
          )}

          {networkStatus.isOnline && !connectionStatus.isConnected && (
            <div className="mt-1 small">
              <span className="text-warning">
                <i className="fas fa-exclamation-triangle me-1"></i>
                Connection lost - attempting to reconnect
              </span>
            </div>
          )}

          {/* Status info */}
          {networkStatus.isOnline && connectionStatus.isConnected && (
            <div className="mt-1 small text-muted">
              Connected - resume to see live timer
            </div>
          )}
        </div>
        
        <div>
          <Button 
            color={getAlertColor() === 'danger' ? 'danger' : 'warning'} 
            onClick={onResumeSession}
            className={timeRemaining <= 300 ? 'btn-pulse' : ''}
          >
            <i className="fas fa-play me-2"></i>
            {timeRemaining <= 300 ? 'Resume NOW!' : 'Resume Test'}
          </Button>
        </div>
      </div>
    </Alert>
  );
};