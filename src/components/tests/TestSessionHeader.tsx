// src/components/tests/TestSessionHeader.tsx
import React from 'react';
import { Container, Row, Col, Badge, Button } from 'reactstrap';
import { Clock, Save, Send } from 'lucide-react';
import { useTestSession } from '../../context/TestSessionContext';

interface TestSessionHeaderProps {
  onSave: () => void;
  onSubmit: () => void;
}

export const TestSessionHeader: React.FC<TestSessionHeaderProps> = ({ onSave, onSubmit }) => {
  const { state, timerState } = useTestSession();

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!state.test || !state.testSession) return null;

  return (
    <div className="bg-white border-bottom shadow-sm">
      <Container fluid>
        <div className="py-2">
          <Row className="align-items-center">
            <Col md={3}>
              <div className="d-flex align-items-center">
                <h6 className="mb-0">{state.test.title}</h6>
                <Badge color="primary" className="ms-2">
                  Attempt #{state.testSession.attemptNumber}
                </Badge>
              </div>
            </Col>

            <Col md={6} className="text-center">
              <div className="d-flex align-items-center justify-content-center gap-3">
                <div className="d-flex align-items-center">
                  <Clock size={16} className="me-1 text-danger" />
                  <span className={`fw-bold ${timerState.timeRemaining < 300 ? 'text-danger' : 'text-dark'}`}>
                    {formatTime(timerState.timeRemaining)}
                  </span>
                  {!state.isOnline && (
                    <Badge color="warning" className="ms-2">PAUSED</Badge>
                  )}
                </div>

                {timerState.sectionTimeRemaining !== undefined && (
                  <div className="d-flex align-items-center">
                    <Clock size={14} className="me-1 text-warning" />
                    <span className={`small ${timerState.sectionTimeRemaining < 120 ? 'text-danger' : 'text-warning'}`}>
                      Section: {formatTime(timerState.sectionTimeRemaining)}
                    </span>
                  </div>
                )}

                <div className="d-flex align-items-center">
                  <Save size={14} className="me-1" />
                  <span className={`small ${
                    state.autoSaveStatus === 'saved' ? 'text-success' :
                    state.autoSaveStatus === 'saving' ? 'text-warning' : 'text-danger'
                  }`}>
                    {state.autoSaveStatus === 'saved' ? 'Saved' :
                     state.autoSaveStatus === 'saving' ? 'Saving...' : 'Error'}
                  </span>
                </div>
              </div>
            </Col>

            <Col md={3} className="text-end">
              <div className="d-flex gap-2 justify-content-end">
                <Button
                  color="outline-secondary"
                  size="sm"
                  onClick={onSave}
                  disabled={!state.isOnline || state.autoSaveStatus === 'saving'}
                >
                  <Save size={14} className="me-1" />
                  Save
                </Button>
                <Button
                  color="success"
                  size="sm"
                  onClick={onSubmit}
                  disabled={!state.isOnline}
                >
                  <Send size={14} className="me-1" />
                  Submit
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};