// components/QuestionBank/QuickActions.tsx
import React from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import { Plus, BookOpen, Monitor } from 'lucide-react';

interface QuickActionsProps {
  onCreateQuestion: () => void;
  onImportQuestions: () => void;
  onViewAnalytics: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateQuestion,
  onImportQuestions,
  onViewAnalytics
}) => (
  <Card className="border-0 shadow-sm mt-4">
    <CardBody>
      <h5 className="mb-3">Quick Actions</h5>
      <div className="d-flex flex-wrap gap-2">
        <Button 
          color="success"
          size="sm"
          onClick={onCreateQuestion}
          className="d-flex align-items-center"
        >
          <Plus className="me-2 icon-sm" />
          Create Question
        </Button>
        <Button 
          color="primary"
          size="sm"
          onClick={onImportQuestions}
          className="d-flex align-items-center"
        >
          <BookOpen className="me-2 icon-sm" />
          Import Questions
        </Button>
        <Button 
          color="info"
          size="sm"
          onClick={onViewAnalytics}
          className="d-flex align-items-center"
        >
          <Monitor className="me-2 icon-sm" />
          View Analytics
        </Button>
      </div>
    </CardBody>
  </Card>
);

export default QuickActions;