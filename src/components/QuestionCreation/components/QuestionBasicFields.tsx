// src/components/QuestionCreation/components/QuestionBasicFields.tsx - SIMPLIFIED UI

import React, { useState } from 'react';
import { 
  FormGroup, Label, Input, Button, Badge, Collapse, Card, CardBody, Row, Col, Spinner, Alert
} from 'reactstrap';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { CreateQuestionData, Language, Tags } from '../../../types';
import { useTags } from '../../../hooks/useTags';

interface QuestionBasicFieldsProps {
  questionData: Partial<CreateQuestionData>;
  selectedLanguage: Language;
  onInputChange: (field: keyof CreateQuestionData, value: any) => void;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    hasErrors: boolean;
    hasWarnings: boolean;
    requiredFields: string[];
    optionalFields: string[];
  };
  isFieldRequired?: (field: string) => boolean;
  getValidationWarnings?: () => string[];
}

const QuestionBasicFields: React.FC<QuestionBasicFieldsProps> = ({
  questionData,
  selectedLanguage,
  onInputChange,
  validation,
  isFieldRequired = () => false,
  getValidationWarnings = () => []
}) => {
  const [showTagSelector, setShowTagSelector] = useState(false);
  
  const { 
    tags, 
    tagMetadata, 
    loading: tagsLoading, 
    error: tagsError,
    refetch: refetchTags
  } = useTags({ 
    languages: [selectedLanguage], 
    autoFetch: true 
  });

  const isTitleRequired = isFieldRequired('title');
  const isDescriptionRequired = isFieldRequired('description');
  const isDifficultyRequired = isFieldRequired('difficulty');
  const isTagsRequired = isFieldRequired('tags');
  const contextWarnings = getValidationWarnings();

  const getFieldErrors = (fieldName: string): string[] => {
    if (!validation?.errors) return [];
    return validation.errors.filter(error => 
      error.toLowerCase().includes(fieldName.toLowerCase())
    );
  };

  const titleErrors = getFieldErrors('title');
  const descriptionErrors = getFieldErrors('description');
  const difficultyErrors = getFieldErrors('difficulty');
  const tagsErrors = getFieldErrors('tag');

  const hasFieldIssues = (fieldName: string): boolean => {
    return getFieldErrors(fieldName).length > 0;
  };

  const getLanguageDisplayName = (language: Language): string => {
    const languageNames: Record<Language, string> = {
      javascript: 'JavaScript', typescript: 'TypeScript', react: 'React',
      html: 'HTML', css: 'CSS', python: 'Python', sql: 'SQL',
      reactNative: 'React Native', flutter: 'Flutter', dart: 'Dart',
      express: 'Express.js', json: 'JSON'
    };
    return languageNames[language] || language;
  };

  const formatTagLabel = (tag: string): string => {
    return tag.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getTagDisplayInfo = (tag: string) => {
    const metadata = tagMetadata[tag];
    return {
      label: metadata?.label || formatTagLabel(tag),
      description: metadata?.description || `${tag} related concepts`
    };
  };

  const handleTagToggle = (tag: Tags) => {
    const currentTags = questionData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    onInputChange('tags', newTags);
  };

  const clearAllTags = () => onInputChange('tags', []);

  return (
    <>
      {/* Show validation errors only if there are actual errors */}
      {validation && validation.hasErrors && (
        <Alert color="danger" className="mb-4">
          <AlertTriangle size={16} className="me-2" />
          <strong>Please fix the following issues:</strong>
          <ul className="mb-0 mt-2">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Title Field */}
      <FormGroup>
        <Label for="question-title">
          Question Title {isTitleRequired && <span className="text-danger">*</span>}
        </Label>
        <Input
          id="question-title"
          type="text"
          placeholder="Brief summary (e.g., 'Create a React Component', 'Write a SQL Query')"
          value={questionData.title || ''}
          onChange={(e) => onInputChange('title', e.target.value)}
          className={hasFieldIssues('title') ? 'is-invalid' : ''}
        />
        {titleErrors.length > 0 && (
          <div className="invalid-feedback d-block">
            {titleErrors.join(', ')}
          </div>
        )}
        <div className="form-text">
          A short title that summarizes what the question asks students to do
        </div>
      </FormGroup>

      {/* Main Question Content */}
      <FormGroup>
        <Label for="question-description">
          <strong>Question Content</strong> {isDescriptionRequired && <span className="text-danger">*</span>}
        </Label>
        <Input
          id="question-description"
          type="textarea"
          rows={5}
          placeholder="Write the actual question here. Be specific about what you want students to create, solve, or explain. Include any requirements, constraints, or examples that will help students understand the task."
          value={questionData.description || ''}
          onChange={(e) => onInputChange('description', e.target.value)}
          className={hasFieldIssues('description') ? 'is-invalid' : ''}
        />
        {descriptionErrors.length > 0 && (
          <div className="invalid-feedback d-block">
            {descriptionErrors.join(', ')}
          </div>
        )}
        <div className="form-text">
          This is the main question that students will see and respond to
        </div>
      </FormGroup>

      {/* Difficulty */}
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label for="difficulty">
              Difficulty Level {isDifficultyRequired && <span className="text-danger">*</span>}
            </Label>
            <Input
              id="difficulty"
              type="select"
              value={questionData.difficulty || 'medium'}
              onChange={(e) => onInputChange('difficulty', e.target.value)}
              className={hasFieldIssues('difficulty') ? 'is-invalid' : ''}
            >
              <option value="easy">Easy - Basic concepts</option>
              <option value="medium">Medium - Intermediate skills</option>
              <option value="hard">Hard - Advanced knowledge</option>
            </Input>
            {difficultyErrors.length > 0 && (
              <div className="invalid-feedback d-block">
                {difficultyErrors.join(', ')}
              </div>
            )}
          </FormGroup>
        </Col>
      </Row>

      {/* Tags Section */}
      <FormGroup>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Label>
            Tags & Topics {isTagsRequired ? <span className="text-danger">*</span> : <span className="text-muted">(optional)</span>}
          </Label>
          <Button
            size="sm"
            color="primary"
            outline
            onClick={() => setShowTagSelector(!showTagSelector)}
            disabled={tagsLoading}
          >
            {tagsLoading && <Spinner size="sm" className="me-1" />}
            {showTagSelector ? 'Hide Tags' : 'Select Tags'}
          </Button>
        </div>
        
        {/* Show tag errors if any */}
        {tagsErrors.length > 0 && (
          <Alert color="danger" className="mb-2">
            {tagsErrors.join(', ')}
          </Alert>
        )}
        
        {/* Selected Tags */}
        {questionData.tags && questionData.tags.length > 0 ? (
          <div className="mb-2">
            {questionData.tags.map((tag, index) => {
              const tagInfo = getTagDisplayInfo(tag);
              return (
                <Badge
                  key={index}
                  color="primary"
                  className="me-1 mb-1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTagToggle(tag)}
                  title={`${tagInfo.label} - Click to remove`}
                >
                  {tagInfo.label} ×
                </Badge>
              );
            })}
            <Button size="sm" color="link" className="p-0 ms-2" onClick={clearAllTags}>
              Clear all
            </Button>
          </div>
        ) : (
          <div className="mb-2 text-muted small">
            No tags selected
            {isTagsRequired && <span className="text-warning ms-2">(at least one required)</span>}
          </div>
        )}

        {/* Tag Selector */}
        <Collapse isOpen={showTagSelector}>
          <Card className="mt-2">
            <CardBody>
              {tagsLoading && (
                <div className="text-center py-3">
                  <Spinner />
                  <p className="mt-2 mb-0 text-muted">Loading tags...</p>
                </div>
              )}

              {tagsError && (
                <Alert color="warning">
                  <strong>Unable to load tags:</strong> {tagsError}
                  <Button 
                    size="sm" 
                    color="warning" 
                    outline 
                    className="ms-2"
                    onClick={refetchTags}
                  >
                    Retry
                  </Button>
                </Alert>
              )}

              {!tagsLoading && !tagsError && (
                <div>
                  {tags.length === 0 ? (
                    <div className="text-center text-muted py-3">
                      <p>No tags available for {getLanguageDisplayName(selectedLanguage)}</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 text-muted small">
                        Select relevant topics for {getLanguageDisplayName(selectedLanguage)}
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {tags.map((tag) => {
                          const tagInfo = getTagDisplayInfo(tag);
                          const isSelected = questionData.tags?.includes(tag as Tags);
                          
                          return (
                            <Badge
                              key={tag}
                              color={isSelected ? 'primary' : 'secondary'}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleTagToggle(tag as Tags)}
                              title={tagInfo.description}
                            >
                              {tagInfo.label}
                              {isSelected && <CheckCircle size={12} className="ms-1" />}
                            </Badge>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </Collapse>

        <div className="form-text">
          Help categorize and organize questions by selecting relevant topics
        </div>
      </FormGroup>
    </>
  );
};

export default QuestionBasicFields;