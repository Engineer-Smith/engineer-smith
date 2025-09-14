import React from 'react';
import { Card, CardBody, FormGroup, UncontrolledTooltip } from 'reactstrap';
import { Settings, HelpCircle } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

const VisibilitySettingsCard: React.FC = () => {
  const { state, updateQuestionData } = useQuestionCreation();
  const { isGlobalQuestion, canCreateGlobal, saving } = state;

  if (!canCreateGlobal) {
    return null;
  }

  return (
    <Card className="border-info">
      <CardBody>
        <h6 className="text-info mb-3">
          <Settings size={16} className="me-1" />
          Question Visibility
        </h6>
        <FormGroup>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="global-question"
              checked={isGlobalQuestion}
              onChange={(e) => updateQuestionData({ isGlobal: e.target.checked })}
              disabled={saving}
            />
            <label className="form-check-label" htmlFor="global-question">
              Make this a global question
              <HelpCircle size={14} className="ms-1" id="global-help" />
            </label>
            <UncontrolledTooltip target="global-help">
              Global questions can be used by all organizations. Organization questions are only visible to your organization.
            </UncontrolledTooltip>
          </div>
        </FormGroup>
        <div className="small text-muted">
          {isGlobalQuestion 
            ? 'This question will be available to all users across all organizations.'
            : 'This question will only be available to users in your organization.'
          }
        </div>
      </CardBody>
    </Card>
  );
};

export default VisibilitySettingsCard;