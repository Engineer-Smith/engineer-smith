// components/Dashboard/RecentActivity.tsx
import React from 'react';
import { Card, CardBody, CardHeader, Table, Badge, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import type { TestSession } from '../../types';

interface RecentActivityProps {
  sessions: TestSession[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ sessions }) => {
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

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

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
          <i className="fas fa-history me-2 text-primary"></i>
          Recent Test Activity
        </h5>
      </CardHeader>
      <CardBody>
        {sessions.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-clipboard-list text-muted mb-3" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted">No test activity yet</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 5).map((session) => (
                  <tr key={session._id}>
                    <td>
                      <div>
                        <small className="d-block fw-medium">{session.testSnapshot?.title || 'Test'}</small>
                        <small className="text-muted">
                          Attempt #{session.attemptNumber} • {new Date(session.startedAt).toLocaleDateString()}
                        </small>
                      </div>
                    </td>
                    <td>
                      <Badge color={getStatusColor(session.status)} size="sm">
                        {session.status}
                      </Badge>
                      {session.status === 'completed' && (
                        <div className="mt-1">
                          <small className="text-muted">
                            {formatDuration(getTimeSpent(session))}
                          </small>
                        </div>
                      )}
                    </td>
                    <td>
                      {session.status === 'completed' && session.finalScore ? (
                        <div>
                          <small className={session.finalScore.passed ? "text-success fw-bold" : "text-danger fw-bold"}>
                            {session.finalScore.percentage.toFixed(1)}%
                          </small>
                          <div>
                            <Badge color={session.finalScore.passed ? 'success' : 'danger'} size="sm">
                              {session.finalScore.passed ? 'Pass' : 'Fail'}
                            </Badge>
                          </div>
                        </div>
                      ) : session.status === 'inProgress' ? (
                        <small className="text-warning">In progress</small>
                      ) : (
                        <small className="text-muted">—</small>
                      )}
                    </td>
                    <td>
                      {session.status === 'inProgress' ? (
                        <Button
                          color="warning"
                          size="sm"
                          onClick={() => navigate(`/test-session/${session._id}`)}
                        >
                          <i className="fas fa-play me-1"></i>
                          Resume
                        </Button>
                      ) : session.status === 'completed' ? (
                        <Button
                          color="outline-primary"
                          size="sm"
                          onClick={() => {
                            // FIXED: Navigate to results page, let it handle finding the result
                            navigate('/results', { 
                              state: { highlightSession: session._id } 
                            });
                          }}
                        >
                          <i className="fas fa-chart-bar me-1"></i>
                          View
                        </Button>
                      ) : (
                        <small className="text-muted">—</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
        
        {sessions.length > 5 && (
          <div className="text-center mt-3">
            <Button
              color="outline-secondary"
              size="sm"
              onClick={() => navigate('/results')}
            >
              View All Results ({sessions.length})
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};