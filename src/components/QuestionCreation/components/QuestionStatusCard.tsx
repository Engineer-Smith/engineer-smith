import React from 'react';
import { Card, CardBody, FormGroup, Label, Alert, Badge } from 'reactstrap';
import { FileText, AlertTriangle } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

interface QuestionStatusCardProps {
  finalValidation: string[];
}

const QuestionStatusCard: React.FC<QuestionStatusCardProps> = ({ finalValidation }) => {
  const { state, updateQuestionData } = useQuestionCreation();
  const { questionData, saving } = state;
  
  const hasValidationErrors = finalValidation.length > 0;

  return (
    <Card className="mb-4 border-primary">
      <CardBody>
        <h6 className="text-primary mb-3">
          <FileText size={16} className="me-1" />
          Question Status
        </h6>
        <FormGroup>
          <Label>Save as:</Label>
          <div className="mt-2">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="questionStatus"
                id="status-draft"
                value="draft"
                checked={(questionData.status || 'draft') === 'draft'}
                onChange={(e) => updateQuestionData({ status: e.target.value as 'draft' | 'active' })}
                disabled={saving}
              />
              <label className="form-check-label" htmlFor="status-draft">
                <span className="fw-bold">Draft</span>
                <div className="small text-muted">
                  Save for later editing. Question won't appear in tests until activated.
                </div>
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="questionStatus"
                id="status-active"
                value="active"
                checked={(questionData.status || 'draft') === 'active'}
                onChange={(e) => updateQuestionData({ status: e.target.value as 'draft' | 'active' })}
                disabled={saving || hasValidationErrors}
              />
              <label className="form-check-label" htmlFor="status-active">
                <span className="fw-bold">Active</span>
                <div className="small text-muted">
                  Make immediately available for use in tests.
                </div>
              </label>
            </div>
          </div>
          
          {hasValidationErrors && (
            <Alert color="warning" className="small mt-2 mb-0">
              <AlertTriangle size={14} className="me-1" />
              Fix validation errors to enable "Active" status
            </Alert>
          )}
          
          <div className="mt-3 p-2 bg-light rounded small">
            <strong>Current status:</strong> 
            <Badge 
              color={(questionData.status || 'draft') === 'active' ? 'success' : 'secondary'} 
              className="ms-1"
            >
              {(questionData.status || 'draft').charAt(0).toUpperCase() + (questionData.status || 'draft').slice(1)}
            </Badge>
            <div className="text-muted mt-1">
              {(questionData.status || 'draft') === 'active' 
                ? 'Question will be immediately available for instructors to add to tests.'
                : 'Question will be saved as a draft. You can activate it later from the question bank.'
              }
            </div>
          </div>
        </FormGroup>
      </CardBody>
    </Card>
  );
};

export default QuestionStatusCard;