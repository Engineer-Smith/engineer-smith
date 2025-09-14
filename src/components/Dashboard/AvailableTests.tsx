// components/Dashboard/AvailableTests.tsx
import React from 'react';
import { Row, Col, Card, CardBody, CardTitle, CardHeader, Button, Badge } from 'reactstrap';
import type { Test, TestType, Language } from '../../types';

interface AvailableTestsProps {
  tests: Test[];
  onStartTest: (testId: string) => void;
  loading: boolean;
}

export const AvailableTests: React.FC<AvailableTestsProps> = ({ 
  tests, 
  onStartTest, 
  loading 
}) => {
  const getTestTypeColor = (testType: TestType): string => {
    const colors: Record<TestType, string> = {
      frontend_basics: 'primary',
      react_developer: 'info',
      fullstack_js: 'success',
      mobile_development: 'warning',
      python_developer: 'secondary',
      custom: 'dark'
    };
    return colors[testType];
  };

  const formatLanguages = (languages: Language[]): string => {
    return languages.length > 0 ? languages.join(', ') : 'General';
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-clipboard-list me-2 text-primary"></i>
            Available Tests
          </h5>
          <Badge color="info">{tests.length} tests</Badge>
        </div>
      </CardHeader>
      <CardBody>
        {tests.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-clipboard text-muted mb-3" style={{ fontSize: '3rem' }}></i>
            <p className="text-muted">No tests available at the moment</p>
            <p className="small text-muted">Check back later for new assessments</p>
          </div>
        ) : (
          <Row>
            {tests.slice(0, 6).map((test) => (
              <Col md={6} lg={4} key={test._id} className="mb-3">
                <Card className="h-100 border">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge color={getTestTypeColor(test.testType)} className="mb-2">
                        {test.testType.replace('_', ' ')}
                      </Badge>
                      <small className="text-muted">
                        {test.settings.timeLimit}min
                      </small>
                    </div>
                    <CardTitle tag="h6" className="mb-2">
                      {test.title}
                    </CardTitle>
                    <p className="text-muted small mb-3" style={{ height: '40px', overflow: 'hidden' }}>
                      {test.description}
                    </p>
                    <div className="mb-3">
                      <small className="text-muted d-block">
                        <strong>Languages:</strong> {formatLanguages(test.languages)}
                      </small>
                      <small className="text-muted d-block">
                        <strong>Attempts:</strong> {test.settings.attemptsAllowed}
                      </small>
                    </div>
                    <Button
                      color="primary"
                      size="sm"
                      block
                      onClick={() => onStartTest(test._id)}
                      disabled={loading}
                    >
                      <i className="fas fa-play me-2"></i>
                      Start Test
                    </Button>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </CardBody>
    </Card>
  );
};