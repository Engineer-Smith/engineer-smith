// components/Dashboard/RecentSessions.tsx - FIXED to work standalone
import React from 'react';
import { Card, CardBody, CardHeader, Table, Badge, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import type { TestSession } from '../../types';

interface RecentSessionsProps {
  sessions: TestSession[];
}

// Check if session has basic required data
const hasBasicSessionData = (session: any): boolean => {
  return session && 
    session.testSnapshot && 
    session.testSnapshot.title &&
    session.startedAt;
};

// Calculate time remaining for display purposes only
const calculateDisplayTimeRemaining = (session: TestSession): number => {
  if (session.status !== 'inProgress' || !session.startedAt || !session.testSnapshot?.settings?.timeLimit) {
    return 0;
  }

  const startTime = new Date(session.startedAt).getTime();
  const now = Date.now();
  const timeLimitMs = session.testSnapshot.settings.timeLimit * 60 * 1000;
  const elapsedMs = now - startTime;
  const remainingMs = Math.max(0, timeLimitMs - elapsedMs);
  
  return Math.floor(remainingMs / 1000);
};

export const RecentSessions: React.FC<RecentSessionsProps> = ({ sessions }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      completed: 'success',
      inProgress: 'warning',
      abandoned: 'danger',
      expired: 'secondary'
    };
    return colors[status] || 'secondary';
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

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate time spent for completed sessions
  const getTimeSpent = (session: TestSession): number => {
    if (session.status === 'completed' && session.startedAt && session.completedAt) {
      return Math.floor((new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()) / 1000);
    }
    return 0;
  };

  return (
    <Card className="shadow-sm border-0 h-100">
      <CardHeader className="bg-white">
        <h5 className="mb-0">
          <i className="fas fa-clock me-2 text-warning"></i>
          Recent Sessions
        </h5>
      </CardHeader>
      <CardBody>
        {sessions.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-history text-muted mb-3" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted">No recent sessions</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 5).map((session) => {
                  const hasData = hasBasicSessionData(session);
                  
                  // Calculate time remaining for in-progress sessions
                  let timeRemaining = 0;
                  if (session.status === 'inProgress' && hasData) {
                    timeRemaining = calculateDisplayTimeRemaining(session);
                  }
                  
                  const isExpired = session.status === 'inProgress' && hasData && timeRemaining <= 0;

                  return (
                    <tr key={session._id}>
                      <td>
                        <div>
                          <small className="d-block">{session.testSnapshot?.title || 'Test'}</small>
                          <small className="text-muted">Attempt #{session.attemptNumber}</small>
                        </div>
                      </td>
                      <td>
                        <Badge color={getStatusColor(isExpired ? 'expired' : session.status)} size="sm">
                          {isExpired ? 'expired' : session.status}
                        </Badge>
                        
                        {/* Show time remaining for in-progress sessions */}
                        {session.status === 'inProgress' && hasData && !isExpired && timeRemaining > 0 && (
                          <div className="mt-1">
                            <small className="text-warning">
                              {formatTimeRemaining(timeRemaining)} left
                            </small>
                          </div>
                        )}
                        
                        {/* Show loading for incomplete data */}
                        {session.status === 'inProgress' && !hasData && (
                          <div className="mt-1">
                            <small className="text-muted">Loading...</small>
                          </div>
                        )}
                        
                        {/* Show expired state */}
                        {isExpired && (
                          <div className="mt-1">
                            <small className="text-danger">Time expired</small>
                          </div>
                        )}
                        
                        {/* Show final score for completed sessions */}
                        {session.status === 'completed' && session.finalScore && (
                          <div className="mt-1">
                            <small className={session.finalScore.passed ? "text-success" : "text-danger"}>
                              {session.finalScore.percentage.toFixed(1)}%
                              {session.finalScore.passed ? ' (Passed)' : ' (Failed)'}
                            </small>
                          </div>
                        )}
                      </td>
                      <td>
                        {session.status === 'inProgress' && !isExpired ? (
                          <Button
                            color="warning"
                            size="sm"
                            onClick={() => navigate(`/test-session/${session._id}`)}
                          >
                            <i className="fas fa-play me-1"></i>
                            Resume
                          </Button>
                        ) : isExpired ? (
                          <Button
                            color="secondary"
                            size="sm"
                            disabled
                          >
                            <i className="fas fa-clock me-1"></i>
                            Expired
                          </Button>
                        ) : session.status === 'completed' ? (
                          <div className="text-center">
                            <small className="text-muted d-block">
                              {formatDuration(getTimeSpent(session))}
                            </small>
                            <Button
                              color="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/results/${session._id}`)}
                            >
                              <i className="fas fa-chart-bar me-1"></i>
                              View
                            </Button>
                          </div>
                        ) : (
                          <small className="text-muted">
                            {session.status === 'abandoned' ? 'Abandoned' : 'N/A'}
                          </small>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
        
        {/* Show all sessions link if there are more */}
        {sessions.length > 5 && (
          <div className="text-center mt-3">
            <Button
              color="outline-secondary"
              size="sm"
              onClick={() => navigate('/sessions')}
            >
              View All Sessions ({sessions.length})
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};