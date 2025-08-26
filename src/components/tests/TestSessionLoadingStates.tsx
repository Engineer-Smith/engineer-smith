// src/components/tests/TestSessionLoadingStates.tsx
import React from 'react';
import { Container, Row, Col, Alert, Spinner, Button } from 'reactstrap';
import { ArrowLeft, AlertTriangle, AlertCircle } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  onBack: () => void;
}

interface PausedStateProps {
  reason?: string;
}

interface NotFoundStateProps {
  onBack: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading your test session..." 
}) => (
  <Container className="py-5">
    <Row className="justify-content-center">
      <Col md={6} className="text-center">
        <Spinner color="primary" className="mb-3" />
        <p className="text-muted">{message}</p>
      </Col>
    </Row>
  </Container>
);

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onBack }) => (
  <Container className="py-5">
    <Row className="justify-content-center">
      <Col md={8}>
        <Alert color="danger">
          <AlertTriangle size={20} className="me-2" />
          <strong>Error:</strong> {error}
        </Alert>
        <div className="d-flex gap-2">
          {onRetry && (
            <Button color="primary" onClick={onRetry}>
              Retry
            </Button>
          )}
          <Button color="secondary" onClick={onBack}>
            <ArrowLeft size={16} className="me-1" />
            Back to Dashboard
          </Button>
        </div>
      </Col>
    </Row>
  </Container>
);

export const PausedState: React.FC<PausedStateProps> = ({ 
  reason = "Your test is paused due to connection issues." 
}) => (
  <div className="d-flex align-items-center justify-content-center h-100">
    <div className="text-center">
      <AlertCircle size={48} className="text-warning mb-3" />
      <h5 className="text-muted">Test Paused</h5>
      <p className="text-muted">
        {reason}
        <br />
        It will resume automatically when connection is restored.
      </p>
    </div>
  </div>
);

export const NotFoundState: React.FC<NotFoundStateProps> = ({ onBack }) => (
  <Container className="py-5">
    <Row className="justify-content-center">
      <Col md={6} className="text-center">
        <AlertTriangle size={48} className="text-muted mb-3" />
        <h5>Session not found</h5>
        <p className="text-muted">The test session could not be found or has expired.</p>
        <Button color="secondary" onClick={onBack}>
          <ArrowLeft size={16} className="me-1" />
          Back to Dashboard
        </Button>
      </Col>
    </Row>
  </Container>
);