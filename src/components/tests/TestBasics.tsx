import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  Badge,
  Alert,
  ButtonGroup
} from 'reactstrap';
import {
  ArrowRight,
  Target,
  FileText,
  Code,
  Smartphone,
  Globe,
  Server,
  CheckCircle,
  X,
  Building,
  Info,
  Eye
} from 'lucide-react';

// Import types
import type { WizardStepProps } from '../../types';
import type { Language, Tags, TestType, TestStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

// Interface for language options
interface LanguageOption {
  value: Language;
  name: string;
  color: string;
  category: string;
}

// Interface for tag options
interface TagOption {
  value: Tags;
  name: string;
  category: string;
  color: string;
}

// Interface for grouped options
interface GroupedOptions<T> {
  [category: string]: T[];
}

// Test Template interface - matches the structure but uses React component references
interface TestTemplate {
  id: TestType;
  name: string;
  description: string;
  languages: Language[];
  tags: Tags[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  estimatedQuestions: string;
  difficulty: string;
}

const TestBasics: React.FC<WizardStepProps> = ({
  testData,
  setTestData,
  onNext,
  onCancel,
  setError
}) => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<TestType | null>(null);
  const [showCustomSelection, setShowCustomSelection] = useState<boolean>(false);

  // Determine test scope based on user's organization
  const isGlobalTest = user?.organization?.isSuperOrg ?? false;
  const testScopeText = user?.organization?.isSuperOrg 
    ? 'Global Test (Available to all organizations)'
    : `Organization Test (Available to ${user?.organization?.name || 'your organization'} only)`;

  const TEST_TEMPLATES: TestTemplate[] = [
    {
      id: 'frontend_basics',
      name: 'Frontend Fundamentals',
      description: 'HTML, CSS, and JavaScript basics for web development',
      languages: ['html', 'css', 'javascript'],
      tags: ['html', 'css', 'javascript', 'dom', 'responsive-design', 'flexbox'],
      icon: Globe,
      color: 'primary',
      estimatedQuestions: '15-25',
      difficulty: 'Beginner to Intermediate'
    },
    {
      id: 'react_developer',
      name: 'React Developer',
      description: 'React components, hooks, state management, and modern JavaScript',
      languages: ['javascript', 'react', 'typescript'],
      tags: ['react', 'components', 'hooks', 'state-management', 'jsx', 'es6'],
      icon: Code,
      color: 'info',
      estimatedQuestions: '20-30',
      difficulty: 'Intermediate to Advanced'
    },
    {
      id: 'fullstack_js',
      name: 'Full Stack JavaScript',
      description: 'Frontend React and backend Express.js development',
      languages: ['javascript', 'react', 'express', 'typescript'],
      tags: ['react', 'express', 'nodejs', 'rest-api', 'components', 'routing'],
      icon: Server,
      color: 'success',
      estimatedQuestions: '25-40',
      difficulty: 'Intermediate to Advanced'
    },
    {
      id: 'mobile_development',
      name: 'Mobile Development',
      description: 'React Native and Flutter mobile app development',
      languages: ['reactNative', 'flutter', 'dart', 'javascript'],
      tags: ['react-native', 'flutter', 'mobile-development', 'native-components'],
      icon: Smartphone,
      color: 'warning',
      estimatedQuestions: '20-35',
      difficulty: 'Intermediate to Advanced'
    },
    {
      id: 'python_developer',
      name: 'Python Developer',
      description: 'Python programming, data structures, and backend development',
      languages: ['python'],
      tags: ['python', 'functions', 'classes', 'data-structures', 'algorithms'],
      icon: Target,
      color: 'danger',
      estimatedQuestions: '18-28',
      difficulty: 'Beginner to Advanced'
    },
    {
      id: 'custom',
      name: 'Custom Test',
      description: 'Choose your own combination of languages and topics',
      languages: [],
      tags: [],
      icon: FileText,
      color: 'secondary',
      estimatedQuestions: 'Variable',
      difficulty: 'Customizable'
    }
  ];

  const AVAILABLE_LANGUAGES: LanguageOption[] = [
    { value: 'html', name: 'HTML', color: 'danger', category: 'Frontend' },
    { value: 'css', name: 'CSS', color: 'info', category: 'Frontend' },
    { value: 'javascript', name: 'JavaScript', color: 'warning', category: 'Frontend' },
    { value: 'typescript', name: 'TypeScript', color: 'dark', category: 'Frontend' },
    { value: 'react', name: 'React', color: 'primary', category: 'Frontend' },
    { value: 'reactNative', name: 'React Native', color: 'primary', category: 'Mobile' },
    { value: 'flutter', name: 'Flutter', color: 'info', category: 'Mobile' },
    { value: 'dart', name: 'Dart', color: 'info', category: 'Mobile' },
    { value: 'express', name: 'Express.js', color: 'success', category: 'Backend' },
    { value: 'python', name: 'Python', color: 'success', category: 'Backend' },
    { value: 'sql', name: 'SQL', color: 'warning', category: 'Database' },
    { value: 'json', name: 'JSON', color: 'light', category: 'Data' }
  ];

  const AVAILABLE_TAGS: TagOption[] = [
    // Frontend Core
    { value: 'html', name: 'HTML', category: 'Frontend Core', color: 'danger' },
    { value: 'css', name: 'CSS', category: 'Frontend Core', color: 'info' },
    { value: 'javascript', name: 'JavaScript', category: 'Frontend Core', color: 'warning' },
    { value: 'dom', name: 'DOM Manipulation', category: 'Frontend Core', color: 'warning' },
    { value: 'events', name: 'Event Handling', category: 'Frontend Core', color: 'warning' },
    
    // CSS Advanced
    { value: 'flexbox', name: 'Flexbox', category: 'CSS Advanced', color: 'info' },
    { value: 'grid', name: 'CSS Grid', category: 'CSS Advanced', color: 'info' },
    { value: 'responsive-design', name: 'Responsive Design', category: 'CSS Advanced', color: 'info' },
    
    // JavaScript Advanced
    { value: 'async-programming', name: 'Async Programming', category: 'JavaScript Advanced', color: 'warning' },
    { value: 'promises', name: 'Promises', category: 'JavaScript Advanced', color: 'warning' },
    { value: 'async-await', name: 'Async/Await', category: 'JavaScript Advanced', color: 'warning' },
    { value: 'es6', name: 'ES6+', category: 'JavaScript Advanced', color: 'warning' },
    { value: 'closures', name: 'Closures', category: 'JavaScript Advanced', color: 'warning' },
    
    // React
    { value: 'react', name: 'React', category: 'React', color: 'primary' },
    { value: 'components', name: 'Components', category: 'React', color: 'primary' },
    { value: 'hooks', name: 'Hooks', category: 'React', color: 'primary' },
    { value: 'state-management', name: 'State Management', category: 'React', color: 'primary' },
    { value: 'props', name: 'Props', category: 'React', color: 'primary' },
    { value: 'jsx', name: 'JSX', category: 'React', color: 'primary' },
    { value: 'context-api', name: 'Context API', category: 'React', color: 'primary' },
    { value: 'react-router', name: 'React Router', category: 'React', color: 'primary' },
    
    // Mobile
    { value: 'react-native', name: 'React Native', category: 'Mobile', color: 'primary' },
    { value: 'flutter', name: 'Flutter', category: 'Mobile', color: 'info' },
    { value: 'mobile-development', name: 'Mobile Development', category: 'Mobile', color: 'warning' },
    { value: 'native-components', name: 'Native Components', category: 'Mobile', color: 'primary' },
    { value: 'navigation', name: 'Navigation', category: 'Mobile', color: 'info' },
    
    // Backend
    { value: 'express', name: 'Express.js', category: 'Backend', color: 'success' },
    { value: 'nodejs', name: 'Node.js', category: 'Backend', color: 'success' },
    { value: 'rest-api', name: 'REST API', category: 'Backend', color: 'success' },
    { value: 'middleware', name: 'Middleware', category: 'Backend', color: 'success' },
    { value: 'routing', name: 'Routing', category: 'Backend', color: 'success' },
    { value: 'authentication', name: 'Authentication', category: 'Backend', color: 'success' },
    
    // Python
    { value: 'python', name: 'Python', category: 'Python', color: 'success' },
    { value: 'functions', name: 'Functions', category: 'Python', color: 'success' },
    { value: 'classes', name: 'Classes', category: 'Python', color: 'success' },
    { value: 'modules', name: 'Modules', category: 'Python', color: 'success' },
    
    // General Programming
    { value: 'algorithms', name: 'Algorithms', category: 'General Programming', color: 'secondary' },
    { value: 'data-structures', name: 'Data Structures', category: 'General Programming', color: 'secondary' },
    { value: 'testing', name: 'Testing', category: 'General Programming', color: 'secondary' },
    { value: 'error-handling', name: 'Error Handling', category: 'General Programming', color: 'secondary' }
  ];

  // Auto-detect template based on current selections
  useEffect(() => {
    const matchingTemplate = TEST_TEMPLATES.find(template => 
      template.languages.length === testData.languages?.length &&
      template.languages.every(lang => testData.languages?.includes(lang)) &&
      template.tags.length === testData.tags?.length &&
      template.tags.every(tag => testData.tags?.includes(tag))
    );
    
    if (matchingTemplate && !showCustomSelection) {
      setSelectedTemplate(matchingTemplate.id);
    }
  }, [testData.languages, testData.tags, showCustomSelection]);

  const handleTemplateSelect = (template: TestTemplate): void => {
    setSelectedTemplate(template.id);
    setShowCustomSelection(template.id === 'custom');
    
    if (template.id !== 'custom') {
      setTestData({
        ...testData,
        testType: template.id,
        languages: template.languages,
        tags: template.tags
      });
    } else {
      setTestData({
        ...testData,
        testType: 'custom',
        languages: [],
        tags: []
      });
    }
  };

  const handleLanguageToggle = (language: Language): void => {
    const newLanguages = testData.languages?.includes(language)
      ? testData.languages.filter(l => l !== language)
      : [...(testData.languages || []), language];
    
    setTestData({
      ...testData,
      languages: newLanguages
    });
  };

  const handleTagToggle = (tag: Tags): void => {
    const newTags = testData.tags?.includes(tag)
      ? testData.tags.filter(t => t !== tag)
      : [...(testData.tags || []), tag];
    
    setTestData({
      ...testData,
      tags: newTags
    });
  };

  const validateStep = (): boolean => {
    if (!testData.title?.trim()) {
      setError?.('Test title is required');
      return false;
    }
    
    if (!testData.description?.trim()) {
      setError?.('Test description is required');
      return false;
    }
    
    if (!testData.languages?.length) {
      setError?.('Please select at least one programming language');
      return false;
    }
    
    // Don't require tags - they're optional for better UX
    setError?.(null);
    return true;
  };

  const handleNext = (): void => {
    if (validateStep()) {
      onNext?.();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTestData({ ...testData, title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTestData({ ...testData, description: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTestData({ ...testData, status: e.target.value as TestStatus });
  };

  const resetToTemplate = (): void => {
    setShowCustomSelection(false);
    const template = TEST_TEMPLATES.find(t => t.id === selectedTemplate);
    if (template) {
      setTestData({
        ...testData,
        languages: template.languages,
        tags: template.tags
      });
    }
  };

  // Group languages and tags by category
  const groupedLanguages: GroupedOptions<LanguageOption> = AVAILABLE_LANGUAGES.reduce((acc, lang) => {
    if (!acc[lang.category]) acc[lang.category] = [];
    acc[lang.category].push(lang);
    return acc;
  }, {} as GroupedOptions<LanguageOption>);

  const groupedTags: GroupedOptions<TagOption> = AVAILABLE_TAGS.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {} as GroupedOptions<TagOption>);

  return (
    <div>
      {/* Basic Information */}
      <Card className="border-0 shadow-sm mb-4">
        <CardBody>
          <h6 className="d-flex align-items-center mb-3">
            <FileText size={20} className="me-2" />
            Basic Information
          </h6>
          
          <Row>
            <Col md={12}>
              <FormGroup>
                <Label htmlFor="testTitle" className="fw-bold">
                  Test Title <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  id="testTitle"
                  value={testData.title || ''}
                  onChange={handleTitleChange}
                  placeholder="e.g., Frontend Developer Assessment"
                />
              </FormGroup>
            </Col>
          </Row>
          
          <Row>
            <Col md={8}>
              <FormGroup>
                <Label htmlFor="testDescription" className="fw-bold">
                  Description <span className="text-danger">*</span>
                </Label>
                <Input
                  type="textarea"
                  id="testDescription"
                  rows={3}
                  value={testData.description || ''}
                  onChange={handleDescriptionChange}
                  placeholder="Describe what this test covers and what skills it evaluates..."
                />
              </FormGroup>
            </Col>
            <Col md={4}>
              <FormGroup>
                <Label htmlFor="testStatus" className="fw-bold">
                  Initial Status
                </Label>
                <Input
                  type="select"
                  id="testStatus"
                  value={testData.status || 'draft'}
                  onChange={handleStatusChange}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </Input>
                <small className="text-muted">
                  {testData.status === 'draft' 
                    ? 'Test will be saved but not visible to students' 
                    : 'Test will be immediately available to students'
                  }
                </small>
              </FormGroup>
            </Col>
          </Row>

          {/* Auto Test Scope Display */}
          <Alert color={isGlobalTest ? "info" : "light"} className="mb-0">
            <div className="d-flex align-items-center">
              {isGlobalTest ? (
                <Globe size={20} className="me-2 text-info" />
              ) : (
                <Building size={20} className="me-2 text-muted" />
              )}
              <div>
                <strong>Test Scope: {testScopeText}</strong>
                <div className="small text-muted mt-1">
                  {isGlobalTest ? (
                    <>
                      As a member of {user?.organization?.name}, your tests are automatically made available to all organizations and students globally.
                    </>
                  ) : (
                    <>
                      This test will only be available to members of {user?.organization?.name}.
                    </>
                  )}
                </div>
              </div>
            </div>
          </Alert>
        </CardBody>
      </Card>

      {/* Test Templates */}
      <Card className="border-0 shadow-sm mb-4">
        <CardBody>
          <h6 className="d-flex align-items-center mb-3">
            <Target size={20} className="me-2" />
            Choose a Template
          </h6>
          <p className="text-muted mb-3">
            Select a pre-configured template or create a custom test. Templates automatically configure languages and topics.
          </p>
          
          <Row>
            {TEST_TEMPLATES.map((template) => {
              const IconComponent = template.icon;
              const isSelected = selectedTemplate === template.id;
              
              return (
                <Col md={6} lg={4} key={template.id} className="mb-3">
                  <Card
                    className={`h-100 border-2 cursor-pointer ${
                      isSelected ? `border-${template.color} bg-${template.color} bg-opacity-10` : 'border-light'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <CardBody className="text-center p-3">
                      <div className="mb-2">
                        <IconComponent 
                          size={32} 
                          className={isSelected ? `text-${template.color}` : 'text-muted'} 
                        />
                      </div>
                      <h6 className="mb-2">{template.name}</h6>
                      <p className="text-muted small mb-2">{template.description}</p>
                      
                      {/* Template Stats */}
                      <div className="mb-2">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Questions:</span>
                          <span>{template.estimatedQuestions}</span>
                        </div>
                        <div className="d-flex justify-content-between small text-muted">
                          <span>Level:</span>
                          <span>{template.difficulty}</span>
                        </div>
                      </div>
                      
                      {template.languages.length > 0 && (
                        <div className="mb-2">
                          {template.languages.slice(0, 3).map(lang => {
                            const langInfo = AVAILABLE_LANGUAGES.find(l => l.value === lang);
                            return langInfo ? (
                              <Badge key={lang} color={langInfo.color} size="sm" className="me-1 mb-1">
                                {langInfo.name}
                              </Badge>
                            ) : null;
                          })}
                          {template.languages.length > 3 && (
                            <Badge color="light" size="sm">
                              +{template.languages.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="mt-2">
                          <Badge color={template.color}>
                            <CheckCircle size={12} className="me-1" />
                            Selected
                          </Badge>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {selectedTemplate && selectedTemplate !== 'custom' && (
            <Alert color="info" className="mt-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>Template Applied:</strong> {TEST_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                  <div className="mt-1 small">
                    Languages and topics have been automatically selected. You can customize them below.
                  </div>
                </div>
                <Button
                  color="outline-primary"
                  size="sm"
                  onClick={() => setShowCustomSelection(true)}
                >
                  Customize
                </Button>
              </div>
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* Custom Selection or Template Customization */}
      {(showCustomSelection || selectedTemplate === 'custom' || (selectedTemplate && testData.languages?.length > 0)) && (
        <Card className="border-0 shadow-sm mb-4">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="d-flex align-items-center mb-0">
                <Code size={20} className="me-2" />
                Programming Languages
              </h6>
              {showCustomSelection && selectedTemplate !== 'custom' && (
                <Button
                  color="outline-secondary"
                  size="sm"
                  onClick={resetToTemplate}
                >
                  <X size={14} className="me-1" />
                  Reset to Template
                </Button>
              )}
            </div>
            
            <p className="text-muted mb-3">Select the programming languages for your test:</p>
            
            {Object.entries(groupedLanguages).map(([category, languages]) => (
              <div key={category} className="mb-3">
                <Label className="fw-bold">{category}</Label>
                <div>
                  {languages.map((lang) => (
                    <div key={lang.value} className="form-check form-check-inline mb-2">
                      <Input
                        type="checkbox"
                        id={`lang-${lang.value}`}
                        checked={testData.languages?.includes(lang.value) || false}
                        onChange={() => handleLanguageToggle(lang.value)}
                      />
                      <Label htmlFor={`lang-${lang.value}`} className="form-check-label ms-1">
                        <Badge color={lang.color}>
                          {lang.name}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {testData.languages?.length > 0 && (
              <div>
                <strong>Selected Languages ({testData.languages.length}):</strong>
                <div className="mt-1">
                  {testData.languages.map(lang => {
                    const langInfo = AVAILABLE_LANGUAGES.find(l => l.value === lang);
                    return langInfo ? (
                      <Badge key={lang} color={langInfo.color} className="me-2 mb-1">
                        {langInfo.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Topics/Tags Selection */}
      {(showCustomSelection || selectedTemplate === 'custom' || (selectedTemplate && testData.tags?.length > 0)) && (
        <Card className="border-0 shadow-sm mb-4">
          <CardBody>
            <h6 className="d-flex align-items-center mb-3">
              <Target size={20} className="me-2" />
              Topics & Skills
            </h6>
            
            <p className="text-muted mb-3">
              Select the specific topics and skills to assess. These help categorize questions and provide better filtering.
            </p>
            
            {Object.entries(groupedTags).map(([category, tags]) => (
              <div key={category} className="mb-3">
                <Label className="fw-bold">{category}</Label>
                <div>
                  {tags.map((tag) => (
                    <div key={tag.value} className="form-check form-check-inline mb-2">
                      <Input
                        type="checkbox"
                        id={`tag-${tag.value}`}
                        checked={testData.tags?.includes(tag.value) || false}
                        onChange={() => handleTagToggle(tag.value)}
                      />
                      <Label htmlFor={`tag-${tag.value}`} className="form-check-label ms-1">
                        <Badge color={tag.color} size="sm">
                          {tag.name}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {testData.tags?.length > 0 && (
              <div className="mt-3">
                <strong>Selected Topics ({testData.tags.length}):</strong>
                <div className="mt-1">
                  {testData.tags.slice(0, 10).map(tag => {
                    const tagInfo = AVAILABLE_TAGS.find(t => t.value === tag);
                    return tagInfo ? (
                      <Badge key={tag} color={tagInfo.color} className="me-2 mb-1">
                        {tagInfo.name}
                      </Badge>
                    ) : null;
                  })}
                  {testData.tags.length > 10 && (
                    <Badge color="info" className="mb-1">
                      +{testData.tags.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Summary Card */}
      {(testData.languages?.length > 0 || testData.tags?.length > 0) && (
        <Card className="border-0 bg-light mb-4">
          <CardBody>
            <h6 className="d-flex align-items-center mb-3">
              <Eye size={20} className="me-2" />
              Test Configuration Summary
            </h6>
            
            <Row>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Template:</strong> {TEST_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Custom'}
                </div>
                <div className="mb-2">
                  <strong>Languages:</strong> {testData.languages?.length || 0} selected
                </div>
                <div className="mb-2">
                  <strong>Topics:</strong> {testData.tags?.length || 0} selected
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-2">
                  <strong>Scope:</strong> 
                  <Badge color={isGlobalTest ? "info" : "secondary"} className="ms-2">
                    {isGlobalTest ? "Global" : "Organization"}
                  </Badge>
                </div>
                <div className="mb-2">
                  <strong>Status:</strong> 
                  <Badge color={testData.status === 'active' ? "success" : "warning"} className="ms-2">
                    {testData.status || 'draft'}
                  </Badge>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      )}

      {/* Navigation */}
      <div className="d-flex justify-content-between mt-4">
        <Button color="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleNext}
          className="d-flex align-items-center"
        >
          Next: Test Structure
          <ArrowRight size={16} className="ms-1" />
        </Button>
      </div>
    </div>
  );
};

export default TestBasics;