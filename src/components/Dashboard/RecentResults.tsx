// components/Dashboard/RecentResults.tsx
import React from 'react';
import { Card, CardBody, CardHeader, Table, Badge, Progress } from 'reactstrap';
import type { Result } from '../../types';

interface RecentResultsProps {
  results: Result[];
}

export const RecentResults: React.FC<RecentResultsProps> = ({ results }) => {
  return (
    <Card className="shadow-sm border-0 h-100">
      <CardHeader className="bg-white">
        <h5 className="mb-0">
          <i className="fas fa-chart-bar me-2 text-success"></i>
          Recent Results
        </h5>
      </CardHeader>
      <CardBody>
        {results.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-chart-bar text-muted mb-3" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted">No results yet</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Result</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 5).map((result) => (
                  <tr key={result._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div style={{ width: '60px' }}>
                          <Progress
                            value={(result.score.earnedPoints / result.score.totalPoints) * 100}
                            color={result.score.passed ? 'success' : 'danger'}
                            style={{ height: '8px' }}
                          />
                        </div>
                        <small className="ms-2">
                          {result.score.earnedPoints}/{result.score.totalPoints}
                        </small>
                      </div>
                    </td>
                    <td>
                      <Badge
                        color={result.score.passed ? 'success' : 'danger'}
                        size="sm"
                      >
                        {result.score.passed ? 'Pass' : 'Fail'}
                      </Badge>
                    </td>
                    <td>
                      <small>
                        {new Date(result.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};