import React from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import { ArrowLeft, Edit3, Code } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

const QuickActionsCard: React.FC = () => {
  const { state, goToStep } = useQuestionCreation();
  const { selectedQuestionType, saving } = state;

  return (
    <Card className="mb-4">
      <CardBody>
        <h6 className="mb-3">Quick Actions</h6>
        <div className="d-grid gap-2">
          <Button
            color="outline-primary"
            size="sm"
            onClick={() => goToStep(1)}
            disabled={saving}
          >
            <ArrowLeft size={14} className="me-1" />
            Edit Basics
          </Button>
          <Button
            color="outline-primary"
            size="sm"
            onClick={() => goToStep(2)}
            disabled={saving}
          >
            <Edit3 size={14} className="me-1" />
            Edit Content
          </Button>
          {(selectedQuestionType === 'codeChallenge' || selectedQuestionType === 'codeDebugging') && (
            <Button
              color="outline-primary"
              size="sm"
              onClick={() => goToStep(3)}
              disabled={saving}
            >
              <Code size={14} className="me-1" />
              Edit Test Cases
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default QuickActionsCard;