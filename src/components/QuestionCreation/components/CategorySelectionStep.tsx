// src/components/QuestionCreation/components/CategorySelectionStep.tsx
import React from 'react';
import { Row, Col, Card, CardBody, Badge, Button } from 'reactstrap';
import { CheckCircle, ArrowLeft, Target, Monitor, Code } from 'lucide-react';
import type { QuestionCategory, Language } from '../../../types';

interface CategoryOption {
  value: QuestionCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  examples: string[];
}

interface CategorySelectionStepProps {
  selectedLanguage: Language;
  languageLabel: string;
  availableCategories: QuestionCategory[];
  onCategorySelect: (category: QuestionCategory) => void;
  onResetToLanguage: () => void;
}

const CategorySelectionStep: React.FC<CategorySelectionStepProps> = ({
  selectedLanguage,
  languageLabel,
  availableCategories,
  onCategorySelect,
  onResetToLanguage
}) => {

  const categoryOptions: CategoryOption[] = [
    {
      value: 'logic',
      label: 'Logic & Algorithms',
      description: 'Problem-solving, algorithms, and computational thinking',
      icon: Target,
      color: 'success',
      examples: ['Array manipulation', 'Sorting algorithms', 'Data processing']
    },
    {
      value: 'ui',
      label: 'User Interface',
      description: 'Visual components, layouts, and user interactions',
      icon: Monitor,
      color: 'primary',
      examples: ['Component structure', 'Layout design', 'Styling patterns']
    },
    {
      value: 'syntax',
      label: 'Syntax & Features',
      description: 'Language syntax, keywords, and built-in features',
      icon: Code,
      color: 'info',
      examples: ['Language features', 'Syntax rules', 'Built-in methods']
    }
  ];

  const getAvailableCategories = (): CategoryOption[] => {
    return categoryOptions.filter(option => 
      availableCategories.includes(option.value)
    );
  };

  const handleCategoryClick = (category: QuestionCategory) => {
    onCategorySelect(category);
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <Badge color="primary" className="me-2 px-3 py-2">
            <CheckCircle size={14} className="me-1" />
            {languageLabel}
          </Badge>
        </div>
        <Button 
          size="sm" 
          color="link" 
          className="text-muted"
          onClick={() => {
            onResetToLanguage();
          }}
        >
          <ArrowLeft size={14} className="me-1" />
          Change Language
        </Button>
      </div>
      
      <Row>
        {getAvailableCategories().map((category) => (
          <Col md={4} key={category.value} className="mb-3">
            <Card 
              className="category-card h-100 cursor-pointer hover-lift"
              onClick={() => handleCategoryClick(category.value)}
              style={{ 
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              <CardBody>
                <div className="d-flex align-items-center mb-3">
                  <category.icon size={24} className={`text-${category.color} me-2`} />
                  <h6 className="mb-0">{category.label}</h6>
                </div>
                <p className="text-muted small mb-3">
                  {category.description}
                </p>
                <div className="mb-2">
                  <strong className="small">Examples:</strong>
                  <ul className="small text-muted mb-0 mt-1">
                    {category.examples.map((example, idx) => (
                      <li key={idx}>{example}</li>
                    ))}
                  </ul>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default CategorySelectionStep;