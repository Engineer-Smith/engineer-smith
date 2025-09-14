// src/components/questions/components/ValidationFeedback.tsx - Display validation errors/warnings

import React from 'react';
import { Alert, Badge } from 'reactstrap';
import { AlertTriangle, XCircle, Info, CheckCircle } from 'lucide-react';
import type { ValidationResult } from '../../../services/questionValidationService';

interface ValidationFeedbackProps {
  validation: ValidationResult;
  className?: string;
  showWarnings?: boolean;
  showBusinessRules?: boolean;
}

const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validation,
  className = '',
  showWarnings = true,
  showBusinessRules = true
}) => {
  const { errors, warnings, businessRuleViolations, isValid } = validation;
  
  if (isValid && errors.length === 0 && warnings.length === 0) {
    return (
      <Alert color="success" className={className}>
        <div className="d-flex align-items-center">
          <CheckCircle size={16} className="me-2" />
          <strong>Question validation passed!</strong>
        </div>
      </Alert>
    );
  }

  return (
    <div className={className}>
      {/* ✅ Errors */}
      {errors.length > 0 && (
        <Alert color="danger" className="mb-3">
          <div className="d-flex">
            <XCircle size={16} className="me-2 mt-1 flex-shrink-0" />
            <div className="flex-grow-1">
              <strong>
                {errors.length} Error{errors.length > 1 ? 's' : ''} Found
              </strong>
              <ul className="mb-0 mt-2">
                {errors.map((error, index) => (
                  <li key={index}>
                    <strong>{error.field}:</strong> {error.message}
                    {error.code && (
                      <Badge color="danger" size="sm" className="ms-2">
                        {error.code}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Alert>
      )}

      {/* ✅ Warnings */}
      {showWarnings && warnings.length > 0 && (
        <Alert color="warning" className="mb-3">
          <div className="d-flex">
            <AlertTriangle size={16} className="me-2 mt-1 flex-shrink-0" />
            <div className="flex-grow-1">
              <strong>
                {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
              </strong>
              <ul className="mb-0 mt-2">
                {warnings.map((warning, index) => (
                  <li key={index}>
                    <strong>{warning.field}:</strong> {warning.message}
                    {warning.code && (
                      <Badge color="warning" size="sm" className="ms-2">
                        {warning.code}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Alert>
      )}

      {/* ✅ Business Rule Violations (separate display for clarity) */}
      {showBusinessRules && businessRuleViolations.length > 0 && (
        <Alert color="info" className="mb-3">
          <div className="d-flex">
            <Info size={16} className="me-2 mt-1 flex-shrink-0" />
            <div className="flex-grow-1">
              <strong>Business Rule Information</strong>
              <ul className="mb-0 mt-2">
                {businessRuleViolations.map((violation, index) => (
                  <li key={index}>
                    <span className="text-muted">{violation.field}:</span> {violation.message}
                    {violation.suggestion && (
                      <div className="text-muted small mt-1">
                        <strong>Suggestion:</strong> {violation.suggestion}
                      </div>
                    )}
                    <Badge 
                      color={violation.severity === 'error' ? 'danger' : 'warning'} 
                      size="sm" 
                      className="ms-2"
                    >
                      {violation.code}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default ValidationFeedback;