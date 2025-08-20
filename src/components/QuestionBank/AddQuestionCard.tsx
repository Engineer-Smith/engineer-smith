// components/QuestionBank/AddQuestionCard.tsx
import React from 'react';
import { Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';
import { Plus } from 'lucide-react';

interface AddQuestionCardProps {
  onClick: () => void;
}

const AddQuestionCard: React.FC<AddQuestionCardProps> = ({ onClick }) => (
  <Card 
    className="h-100 border-0 shadow-sm transition-hover border-dashed"
    style={{ cursor: 'pointer', borderStyle: 'dashed !important' }}
    onClick={onClick}
  >
    <CardBody className="d-flex flex-column align-items-center justify-content-center text-center">
      <div className="p-3 rounded bg-success bg-opacity-10 mb-3">
        <Plus className="text-success icon-lg" />
      </div>
      
      <CardTitle tag="h5" className="mb-2">
        Add New Question
      </CardTitle>
      <CardText className="text-muted mb-3">
        Create a new question for the bank
      </CardText>
      
      <Button color="success" size="sm" className="mt-auto">
        <Plus className="me-2 icon-xs" />
        Create Question
      </Button>
    </CardBody>
  </Card>
);

export default AddQuestionCard;