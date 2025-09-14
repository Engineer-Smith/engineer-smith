// src/components/QuestionCreation/components/SaveActionCard.tsx - CENTRALIZED SAVE
import React from 'react';
import { Card, CardBody, Button, Spinner } from 'reactstrap';
import { Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

interface SaveActionCardProps {
  finalValidation: string[];
  canSave: boolean;
  isCompleted: boolean;
  isSaving: boolean;
}

const SaveActionCard: React.FC<SaveActionCardProps> = ({
  finalValidation,
  canSave,
  isCompleted,
  isSaving
}) => {
  const { 
    // ✅ Use centralized save from hook
    saveQuestionWithCallback,
    state 
  } = useQuestionCreation();

  const { creationSuccess, error } = state;

  // ✅ SIMPLIFIED: Use hook's centralized save method
  const handleSave = async () => {
    try {
      await saveQuestionWithCallback();
      // Success will be handled automatically by the hook
    } catch (error) {
      console.error('Failed to save question:', error);
      // Error is already handled by the context
    }
  };

  // Don't show card if already completed
  if (isCompleted) {
    return (
      <Card className="mb-3 border-success">
        <CardBody className="text-center">
          <CheckCircle size={24} className="text-success mb-2" />
          <h6 className="text-success mb-1">Question Saved!</h6>
          <p className="text-muted small mb-0">
            Your question has been successfully created.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="mb-3">
      <CardBody>
        <h6 className="card-title">Save Question</h6>
        
        {/* Save Status */}
        {finalValidation.length > 0 && (
          <div className="alert alert-warning py-2 px-3 mb-3">
            <div className="d-flex align-items-center">
              <AlertTriangle size={16} className="me-2 text-warning" />
              <small>
                <strong>{finalValidation.length} issue{finalValidation.length > 1 ? 's' : ''} remaining</strong>
              </small>
            </div>
          </div>
        )}

        {canSave && finalValidation.length === 0 && (
          <div className="alert alert-success py-2 px-3 mb-3">
            <div className="d-flex align-items-center">
              <CheckCircle size={16} className="me-2 text-success" />
              <small>
                <strong>Ready to save!</strong>
              </small>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="d-grid">
          <Button
            color="success"
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className="d-flex align-items-center justify-content-center"
          >
            {isSaving ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="me-2" />
                Save Question
              </>
            )}
          </Button>
        </div>

        {/* Validation Summary */}
        {finalValidation.length > 0 && (
          <div className="mt-3">
            <small className="text-muted">
              <strong>Remaining items:</strong>
            </small>
            <ul className="list-unstyled mt-1">
              {finalValidation.slice(0, 3).map((error, index) => (
                <li key={index} className="small text-muted">
                  • {error}
                </li>
              ))}
              {finalValidation.length > 3 && (
                <li className="small text-muted">
                  • ... and {finalValidation.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger py-2 px-3 mt-3 mb-0">
            <small className="text-danger">
              <strong>Error:</strong> {error}
            </small>
          </div>
        )}

        {/* Success Display */}
        {creationSuccess && (
          <div className="alert alert-success py-2 px-3 mt-3 mb-0">
            <small className="text-success">
              <strong>Success:</strong> {creationSuccess}
            </small>
          </div>
        )}

        {/* Save Info */}
        <div className="mt-3 pt-2 border-top">
          <small className="text-muted">
            Questions are automatically saved as <strong>drafts</strong> and can be edited later.
          </small>
        </div>
      </CardBody>
    </Card>
  );
};

export default SaveActionCard;