// src/components/QuestionCreation/components/SolutionCodeModal.tsx
import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  Alert
} from 'reactstrap';
import { Lock, Play, HelpCircle, AlertTriangle } from 'lucide-react';

interface SolutionCodeModalProps {
  isOpen: boolean;
  onToggle: () => void;
  solutionCode: string;
  onSolutionCodeChange: (code: string) => void;
  onSaveAndRunTests: () => void;
  expectedResult?: any;
}

const SolutionCodeModal: React.FC<SolutionCodeModalProps> = ({
  isOpen,
  onToggle,
  solutionCode,
  onSolutionCodeChange,
  onSaveAndRunTests,
  expectedResult
}) => {
  const handleSaveAndRun = () => {
    onToggle();
    if (solutionCode.trim()) {
      onSaveAndRunTests();
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onToggle} size="lg">
      <ModalHeader toggle={onToggle}>
        <Lock size={20} className="me-2" />
        Solution Code for Test Validation
      </ModalHeader>
      <ModalBody>
        <Alert color="info" className="mb-3">
          <HelpCircle size={16} className="me-2" />
          <strong>Complete the function implementation</strong> below so we can test your test cases. 
          The template is pre-filled based on your test cases. Just add your logic inside the function.
          This code is only used for validation and won't be saved with the question.
        </Alert>
        
        <FormGroup>
          <Label className="fw-bold">
            Complete the function implementation
            <span className="text-danger">*</span>
          </Label>
          <Input
            type="textarea"
            rows={12}
            value={solutionCode}
            onChange={(e) => onSolutionCodeChange(e.target.value)}
            className="font-monospace"
            style={{ fontSize: '14px', lineHeight: '1.4' }}
          />
          <small className="text-muted mt-1">
            Complete the function so it returns the expected outputs for your test cases. 
            {expectedResult && (
              <>For example, if your test expects {JSON.stringify(expectedResult)}, 
              make sure your function returns that value.</>
            )}
          </small>
        </FormGroup>

        {!solutionCode.trim() && (
          <Alert color="warning">
            <AlertTriangle size={16} className="me-2" />
            Please complete the function implementation to validate your test cases.
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button 
          color="secondary" 
          onClick={onToggle}
        >
          Cancel
        </Button>
        <Button 
          color="primary" 
          onClick={handleSaveAndRun}
          disabled={!solutionCode.trim()}
        >
          <Play size={14} className="me-1" />
          Save & Run Tests
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SolutionCodeModal;