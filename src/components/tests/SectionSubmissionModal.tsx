// src/components/tests/SectionSubmissionModal.tsx
import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Progress, Badge } from 'reactstrap';
import { Send, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useTestSession } from '../../context/TestSessionContext';

interface SectionSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
  sectionName: string;
  sectionIndex: number;
}

export const SectionSubmissionModal: React.FC<SectionSubmissionModalProps> = ({
  isOpen,
  onClose,
  onConfirmSubmit,
  sectionName,
  sectionIndex
}) => {
  const { state, timerState } = useTestSession();

  if (!state.test || !state.testSession) return null;

  // Get questions for current section
  const sectionQuestions = state.test.sections?.[sectionIndex]?.questions || [];
  const answeredInSection = sectionQuestions.filter(q => 
    state.answers[q.questionId] !== undefined
  ).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isAllAnswered = answeredInSection === sectionQuestions.length;
  const completionPercentage = Math.round((answeredInSection / sectionQuestions.length) * 100);

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="md">
      <ModalHeader toggle={onClose}>
        Submit Section: {sectionName}
      </ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <Alert color={isAllAnswered ? "success" : "warning"}>
            {isAllAnswered ? (
              <div className="d-flex align-items-center">
                <CheckCircle size={16} className="me-2" />
                All questions in this section have been answered
              </div>
            ) : (
              <div>
                You have {sectionQuestions.length - answeredInSection} unanswered questions in this section.
                You can submit now and those questions will be marked as incomplete.
              </div>
            )}
          </Alert>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between mb-2">
            <span>Section Progress</span>
            <span>{answeredInSection}/{sectionQuestions.length} questions</span>
          </div>
          <Progress 
            value={completionPercentage} 
            color={completionPercentage === 100 ? "success" : completionPercentage > 50 ? "warning" : "danger"}
            className="mb-2"
          />
          <small className="text-muted">{completionPercentage}% complete</small>
        </div>

        <div className="row">
          <div className="col-6">
            <div className="border rounded p-2 text-center">
              <div className="text-muted small">Section Time Remaining</div>
              <div className={`fw-bold ${(timerState.sectionTimeRemaining || 0) < 120 ? 'text-danger' : 'text-primary'}`}>
                <Clock size={14} className="me-1" />
                {formatTime(timerState.sectionTimeRemaining || 0)}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="border rounded p-2 text-center">
              <div className="text-muted small">Total Time Remaining</div>
              <div className={`fw-bold ${timerState.timeRemaining < 300 ? 'text-danger' : 'text-primary'}`}>
                <Clock size={14} className="me-1" />
                {formatTime(timerState.timeRemaining)}
              </div>
            </div>
          </div>
        </div>

        <Alert color="info" className="mt-3 mb-0">
          <strong>Important:</strong> Once you submit this section, you cannot return to modify your answers.
          You will automatically move to the next section.
        </Alert>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Continue Working
        </Button>
        <Button color="success" onClick={onConfirmSubmit}>
          <Send size={16} className="me-1" />
          Submit Section
        </Button>
      </ModalFooter>
    </Modal>
  );
};