// src/components/QuestionCreation/steps/QuestionContentStep.tsx
import React, { useEffect } from 'react';
import { Form, Alert, Progress } from 'reactstrap';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';
import type { CreateQuestionData } from '../../../types';

// Import question type editor components
import QuestionBasicFields from '../components/QuestionBasicFields';
import MultipleChoiceEditor from '../components/MultipleChoiceEditor';
import TrueFalseEditor from '../components/TrueFalseEditor';
import FillInBlankEditor from '../components/FillInBlankEditor';
import CodeChallengeEditor from '../components/CodeChallengeEditor';
import CodeDebuggingEditor from '../components/CodeDebuggingEditor';

const QuestionContentStep: React.FC = () => {
  const { 
    state, 
    updateQuestionData,
    validation,
    isFieldRequired,
    getStepValidationErrors,
    createDefaultCodeConfig,
    getAvailableRuntimes,
    validateCodeConfig,
    getFunctionSignatures,
    getPerformanceRecommendations,
    getSecurityRecommendations
  } = useQuestionCreation();

  const {
    questionData,
    selectedLanguage,
    selectedCategory,
    selectedQuestionType
  } = state;

  // Auto-create default code configuration for code-based questions
  useEffect(() => {
    if ((selectedQuestionType === 'codeChallenge' || selectedQuestionType === 'codeDebugging') && selectedCategory === 'logic') {
      if (!questionData.codeConfig) {
        const defaultConfig = createDefaultCodeConfig ? createDefaultCodeConfig() : null;
        if (defaultConfig) {
          updateQuestionData({ codeConfig: defaultConfig });
        }
      }
    }
  }, [selectedQuestionType, selectedCategory, questionData.codeConfig, createDefaultCodeConfig, updateQuestionData]);

  const handleInputChange = (field: keyof CreateQuestionData, value: any) => {
    updateQuestionData({ [field]: value });
  };

  // Only show validation errors that come from step validation attempts (not continuous validation)
  const stepValidationErrors = getStepValidationErrors ? getStepValidationErrors(2) : [];
  const shouldShowValidationErrors = stepValidationErrors.length > 0;

  // Create a modified validation object that only shows errors when step validation has been attempted
  const stepAwareValidation = shouldShowValidationErrors ? validation : {
    ...validation,
    isValid: true,
    errors: [],
    hasErrors: false
  };

  // Render the appropriate editor component based on question type
  const renderTypeSpecificContent = () => {
    const commonValidationProps = {
      validation: stepAwareValidation, // Use step-aware validation
      isFieldRequired: isFieldRequired || (() => false),
      getValidationWarnings: () => [] // Don't show warnings until validation attempt
    };

    switch (selectedQuestionType) {
      case 'multipleChoice':
        return (
          <MultipleChoiceEditor 
            questionData={questionData} 
            onInputChange={handleInputChange}
            {...commonValidationProps}
          />
        );
        
      case 'trueFalse':
        return (
          <TrueFalseEditor 
            questionData={questionData} 
            onInputChange={handleInputChange}
            {...commonValidationProps}
          />
        );
        
      case 'fillInTheBlank':
        return (
          <FillInBlankEditor 
            questionData={questionData} 
            onInputChange={handleInputChange}
            {...commonValidationProps}
          />
        );
        
      case 'codeChallenge':
        return (
          <CodeChallengeEditor
            questionData={questionData}
            onInputChange={handleInputChange}
            {...commonValidationProps}
            availableRuntimes={getAvailableRuntimes ? getAvailableRuntimes() : []}
            functionSignatures={getFunctionSignatures ? getFunctionSignatures() : []}
            performanceRecommendations={getPerformanceRecommendations ? getPerformanceRecommendations() : []}
            selectedLanguage={selectedLanguage!}
            selectedCategory={selectedCategory!}
          />
        );
        
      case 'codeDebugging':
        return (
          <CodeDebuggingEditor
            questionData={questionData}
            onInputChange={handleInputChange}
            {...commonValidationProps}
            availableRuntimes={getAvailableRuntimes ? getAvailableRuntimes() : []}
            functionSignatures={getFunctionSignatures ? getFunctionSignatures() : []}
            securityRecommendations={getSecurityRecommendations ? getSecurityRecommendations() : []}
            selectedLanguage={selectedLanguage!}
            selectedCategory={selectedCategory!}
          />
        );
        
      default:
        return null;
    }
  };

  // Helper function to get nested field values for progress calculation
  const getNestedFieldValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Calculate completion progress based on required fields
  const getProgressPercentage = (): number => {
    if (!validation || !validation.requiredFields) return 0;
    
    const requiredFields = validation.requiredFields;
    const totalFields = requiredFields.length;
    
    if (totalFields === 0) return 100;
    
    let completedFields = 0;
    
    requiredFields.forEach(field => {
      const fieldValue = getNestedFieldValue(questionData, field);
      
      // Check if field is completed based on its type
      if (Array.isArray(fieldValue)) {
        if (fieldValue.length > 0) completedFields++;
      } else if (typeof fieldValue === 'string') {
        if (fieldValue.trim()) completedFields++;
      } else if (typeof fieldValue === 'number') {
        if (fieldValue >= 0) completedFields++;
      } else if (typeof fieldValue === 'boolean') {
        completedFields++;
      } else if (fieldValue !== null && fieldValue !== undefined) {
        completedFields++;
      }
    });
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const isContentComplete = (): boolean => {
    return validation ? validation.isValid : false;
  };

  // Get code configuration validation for code-based questions
  const codeConfigValidation = selectedQuestionType && ['codeChallenge', 'codeDebugging'].includes(selectedQuestionType) && validateCodeConfig
    ? validateCodeConfig() 
    : null;

  return (
    <div className="question-content-step">
      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-muted">Content Completion</small>
          <small className="text-muted">{getProgressPercentage()}%</small>
        </div>
        <Progress 
          value={getProgressPercentage()} 
          color={getProgressPercentage() === 100 ? "success" : "primary"} 
        />
        
        {/* Required Fields Info */}
        {validation && validation.requiredFields && validation.requiredFields.length > 0 && (
          <small className="text-muted mt-1 d-block">
            <Info size={12} className="me-1" />
            Required: {validation.requiredFields.join(', ')}
          </small>
        )}
      </div>

      {/* Step Validation Errors - Only show when validation has been attempted */}
      {shouldShowValidationErrors && stepValidationErrors.length > 0 && (
        <Alert color="danger" className="mb-4">
          <AlertTriangle size={16} className="me-2" />
          <strong>Please fix the following issues to continue:</strong>
          <ul className="mb-0 mt-2">
            {stepValidationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Code Configuration Errors - Only show when validation attempted */}
      {shouldShowValidationErrors && codeConfigValidation && !codeConfigValidation.isValid && (
        <Alert color="danger" className="mb-4">
          <AlertTriangle size={16} className="me-2" />
          <strong>Code Configuration Issues:</strong>
          <ul className="mb-0 mt-2">
            {codeConfigValidation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Form>
        {/* Basic Fields Component */}
        <QuestionBasicFields 
          questionData={questionData}
          selectedLanguage={selectedLanguage!}
          onInputChange={handleInputChange}
          validation={stepAwareValidation} // Use step-aware validation
          isFieldRequired={isFieldRequired || (() => false)}
          getValidationWarnings={() => []} // Don't show warnings until validation attempt
        />

        {/* Type-Specific Content Components */}
        {renderTypeSpecificContent()}
      </Form>

      {/* Completion Status - Only show if content is actually complete */}
      {isContentComplete() && stepValidationErrors.length === 0 && (
        <Alert color="success" className="mt-4 mb-0">
          <CheckCircle size={16} className="me-2" />
          Question content is complete and ready for the next step!
        </Alert>
      )}

      {/* Next Step Preview for Code Questions */}
      {selectedQuestionType === 'codeChallenge' && selectedCategory === 'logic' && isContentComplete() && (
        <Alert color="info" className="mt-4 mb-0">
          <Info size={16} className="me-2" />
          Next: Add test cases to validate solutions for this logic question.
        </Alert>
      )}

      {/* Next Step Preview for Debugging Questions */}
      {selectedQuestionType === 'codeDebugging' && selectedCategory === 'logic' && isContentComplete() && (
        <Alert color="info" className="mt-4 mb-0">
          <Info size={16} className="me-2" />
          Next: Add test cases to verify that fixes work correctly for this debugging question.
        </Alert>
      )}
    </div>
  );
};

export default QuestionContentStep