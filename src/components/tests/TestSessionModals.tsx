// src/components/tests/TestSessionModals.tsx
import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Spinner } from 'reactstrap';
import { Send, AlertTriangle, WifiOff } from 'lucide-react';
import { useTestSession } from '../../context/TestSessionContext';

interface TestSessionModalsProps {
  showSubmitModal: boolean;
  showTimeWarningModal: boolean;
  onCloseSubmitModal: () => void;
  onCloseTimeWarningModal: () => void;
  onConfirmSubmit: () => void;
  onShowSubmitFromWarning: () => void;
}

export const TestSessionModals: React.FC<TestSessionModalsProps> = ({
  showSubmitModal,
  showTimeWarningModal,
  onCloseSubmitModal,
  onCloseTimeWarningModal,
  onConfirmSubmit,
  onShowSubmitFromWarning
}) => {
  const { state, timerState } = useTestSession();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Submit Confirmation Modal */}
      <Modal isOpen={showSubmitModal} toggle={onCloseSubmitModal}>
        <ModalHeader toggle={onCloseSubmitModal}>
          Submit Test
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to submit your test?</p>
          <div className="bg-light p-3 rounded">
            <div className="d-flex justify-content-between mb-2">
              <span>Questions answered:</span>
              <span>{Object.keys(state.answers).length}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Flagged questions:</span>
              <span>{state.flaggedQuestions.size}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Time remaining:</span>
              <span className="fw-bold">{formatTime(timerState.timeRemaining)}</span>
            </div>
          </div>
          {!state.isOnline && (
            <Alert color="warning" className="mt-3 mb-0">
              <WifiOff size={16} className="me-2" />
              You're currently offline. Your submission will be processed when connection is restored.
            </Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={onCloseSubmitModal}>
            Cancel
          </Button>
          <Button
            color="success"
            onClick={onConfirmSubmit}
            disabled={state.submitting}
          >
            {state.submitting ? (
              <>
                <Spinner size="sm" className="me-1" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} className="me-1" />
                Submit Test
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Time Warning Modal */}
      <Modal
        isOpen={showTimeWarningModal}
        toggle={onCloseTimeWarningModal}
        centered
      >
        <ModalHeader toggle={onCloseTimeWarningModal}>
          <AlertTriangle size={24} className="me-2 text-warning" />
          Time Warning
        </ModalHeader>
        <ModalBody>
          <Alert color="warning">
            <strong>5 minutes remaining!</strong>
            <br />
            Make sure to submit your test before time runs out.
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button color="warning" onClick={onCloseTimeWarningModal}>
            Continue
          </Button>
          <Button color="success" onClick={onShowSubmitFromWarning}>
            Submit Now
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};