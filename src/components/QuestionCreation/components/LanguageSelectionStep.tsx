// src/components/QuestionCreation/components/LanguageSelectionStep.tsx
import React from 'react';
import { Row, Col, Card, CardBody, Badge } from 'reactstrap';
import { 
  Code, 
  Monitor, 
  Smartphone, 
  Database, 
  Server,
  FileText
} from 'lucide-react';
import { getValidCategories } from '../../../types';
import type { Language } from '../../../types';

interface LanguageOption {
  value: Language;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  description: string;
  categoryCount: number;
}

interface LanguageSelectionStepProps {
  onLanguageSelect: (language: Language) => void;
}

const LanguageSelectionStep: React.FC<LanguageSelectionStepProps> = ({
  onLanguageSelect
}) => {

  const languageOptions: LanguageOption[] = [
    {
      value: 'javascript',
      label: 'JavaScript',
      icon: Code,
      color: 'warning',
      description: 'Modern JavaScript ES6+ features and concepts',
      categoryCount: getValidCategories('javascript').length
    },
    {
      value: 'typescript',
      label: 'TypeScript',
      icon: Code,
      color: 'info',
      description: 'Type-safe JavaScript with advanced type system',
      categoryCount: getValidCategories('typescript').length
    },
    {
      value: 'react',
      label: 'React',
      icon: Monitor,
      color: 'primary',
      description: 'React components, hooks, and state management',
      categoryCount: getValidCategories('react').length
    },
    {
      value: 'html',
      label: 'HTML',
      icon: FileText,
      color: 'danger',
      description: 'HTML structure, semantics, and accessibility',
      categoryCount: getValidCategories('html').length
    },
    {
      value: 'css',
      label: 'CSS',
      icon: Monitor,
      color: 'info',
      description: 'CSS styling, layouts, and responsive design',
      categoryCount: getValidCategories('css').length
    },
    {
      value: 'python',
      label: 'Python',
      icon: Code,
      color: 'success',
      description: 'Python programming and data structures',
      categoryCount: getValidCategories('python').length
    },
    {
      value: 'sql',
      label: 'SQL',
      icon: Database,
      color: 'secondary',
      description: 'Database queries and data manipulation',
      categoryCount: getValidCategories('sql').length
    },
    {
      value: 'reactNative',
      label: 'React Native',
      icon: Smartphone,
      color: 'primary',
      description: 'Cross-platform mobile app development',
      categoryCount: getValidCategories('reactNative').length
    },
    {
      value: 'flutter',
      label: 'Flutter',
      icon: Smartphone,
      color: 'info',
      description: 'Flutter widgets and Dart programming',
      categoryCount: getValidCategories('flutter').length
    },
    {
      value: 'dart',
      label: 'Dart',
      icon: Code,
      color: 'info',
      description: 'Dart language fundamentals',
      categoryCount: getValidCategories('dart').length
    },
    {
      value: 'express',
      label: 'Express.js',
      icon: Server,
      color: 'dark',
      description: 'Node.js web framework and API development',
      categoryCount: getValidCategories('express').length
    },
    {
      value: 'json',
      label: 'JSON',
      icon: FileText,
      color: 'warning',
      description: 'JSON data format and structure',
      categoryCount: getValidCategories('json').length
    }
  ];

  const handleLanguageClick = (language: Language) => {
    onLanguageSelect(language);
  };

  return (
    <Row>
      {languageOptions.map((lang) => (
        <Col md={6} lg={4} key={lang.value} className="mb-3">
          <Card 
            className="language-card h-100 cursor-pointer hover-lift"
            onClick={() => handleLanguageClick(lang.value)}
            style={{ 
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <CardBody className="text-center">
              <lang.icon size={32} className={`text-${lang.color} mb-2`} />
              <h6 className="mb-1">{lang.label}</h6>
              <small className="text-muted d-block mb-2">
                {lang.description}
              </small>
              <Badge color={lang.color} className="small">
                {lang.categoryCount} categories available
              </Badge>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default LanguageSelectionStep;