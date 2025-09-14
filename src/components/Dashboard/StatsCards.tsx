// components/Dashboard/StatsCards.tsx
import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';

interface StatsCardsProps {
  stats: {
    totalTests: number;
    completedTests: number;
    passedTests: number;
    averageScore: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statItems = [
    {
      value: stats.totalTests,
      label: 'Available Tests',
      icon: 'fas fa-clipboard-list',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      value: stats.completedTests,
      label: 'Completed',
      icon: 'fas fa-check-circle',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      value: stats.passedTests,
      label: 'Passed',
      icon: 'fas fa-trophy',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      value: stats.averageScore,
      label: 'Avg Score',
      icon: 'fas fa-chart-line',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }
  ];

  return (
    <Row className="g-4 mb-5">
      {statItems.map((item, index) => (
        <Col md={3} key={index}>
          <Card className="h-100 shadow-sm border-0">
            <CardBody className="text-center">
              <div
                className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                style={{
                  background: item.gradient,
                  width: '60px',
                  height: '60px'
                }}
              >
                <i className={`${item.icon} text-white`} style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h4 className="mb-1">{item.value}</h4>
              <p className="text-muted small mb-0">{item.label}</p>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};