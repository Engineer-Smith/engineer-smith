import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  FormGroup,
  Label,
  Input,
  Alert,
  Badge,
  Collapse,
} from 'reactstrap';
import type { InputProps } from 'reactstrap';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Zap
} from 'lucide-react';
import QuestionFormComponent from '../QuestionFormComponent';
import type { Question, Language, TestStatus } from '../../types';
import type { CreateTestData } from '../../types/createTest';
import type { ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';


interface QuestionCreatorProps {
  newQuestions: Question[];
  setNewQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  testData: CreateTestData;
  setTestData: React.Dispatch<React.SetStateAction<CreateTestData>>;
  selectedSectionIndex: number;
  setSelectedSectionIndex: React.Dispatch<React.SetStateAction<number>>;
}

// Helper to create a new question template
const createNewQuestion = (languageHint?: Language): Question => {
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const validLanguage = languageHint || 'javascript';
  
  return {
    id: tempId,
    title: '',
    description: '',
    type: 'multipleChoice',
    language: validLanguage,
    organizationId: undefined,
    isGlobal: false,
    options: ['', '', '', ''],
    correctAnswer: 0,
    testCases: [],
    difficulty: 'medium',
    status: 'draft' as TestStatus,
    createdBy: '', // Will be set by backend
    tags: [],
    usageStats: {
      timesUsed: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      successRate: 0,
      averageTime: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const QuestionCreator: React.FC<QuestionCreatorProps> = ({
  newQuestions,
  setNewQuestions,
  testData,
  setTestData,
  selectedSectionIndex,
  setSelectedSectionIndex,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addNewQuestion = () => {
    if (!isAuthenticated || !user || !['admin', 'instructor'].includes(user.role)) {
      setErrorMessage('Unauthorized: Only admins or instructors can create questions');
      return;
    }

    const languageHint = testData.languages.length > 0 ? testData.languages[0] : undefined;
    const newQuestion = createNewQuestion(languageHint);
    setNewQuestions(prev => [...prev, newQuestion]);
    setExpandedQuestionId(newQuestion.id);
  };

  const removeNewQuestion = (questionId: string) => {
    setNewQuestions(prev => prev.filter(q => q.id !== questionId));
    if (expandedQuestionId === questionId) {
      setExpandedQuestionId(null);
    }
  };

  const updateNewQuestion = (updatedQuestion: Question) => {
    setNewQuestions(prev => prev.map(q => (q.id === updatedQuestion.id ? updatedQuestion : q)));
  };

  const assignQuestionToTest = (questionId: string) => {
    if (!isAuthenticated || !user || !['admin', 'instructor'].includes(user.role)) {
      setErrorMessage('Unauthorized: Only admins or instructors can assign questions');
      return;
    }

    const question = newQuestions.find(q => q.id === questionId);
    if (!question) {
      setErrorMessage('Question not found');
      return;
    }

    if (testData.settings.useSections) {
      if (!testData.sections[selectedSectionIndex]) {
        setErrorMessage('Please select a valid section first');
        return;
      }

      const newSections = [...testData.sections];
      const section = newSections[selectedSectionIndex];
      const isAlreadyAssigned = section.questions.some(q => q.questionId === questionId);
      
      if (!isAlreadyAssigned) {
        section.questions.push({
          questionId,
          points: 10, // Default points
        });
        
        setTestData({
          ...testData,
          sections: newSections
        });
      }
    } else {
      const isAlreadyAssigned = testData.questions.some(q => q.questionId === questionId);
      if (!isAlreadyAssigned) {
        setTestData(prev => ({
          ...prev,
          questions: [...(prev.questions || []), { questionId, points: 10 }],
        }));
      }
    }
    
    setErrorMessage(null);
  };

  const isQuestionValid = (question: Question): boolean => {
    if (!question.title.trim() || !question.description.trim()) {
      return false;
    }

    switch (question.type) {
      case 'multipleChoice':
        return (
          question.options !== undefined &&
          question.options.length >= 3 &&
          question.options.slice(1).every(opt => opt.trim()) &&
          typeof question.correctAnswer === 'number' &&
          question.correctAnswer >= 1 &&
          question.correctAnswer < question.options.length
        );
      case 'trueFalse':
        return typeof question.correctAnswer === 'boolean';
      case 'codeChallenge':
      case 'codeDebugging':
        return (
          !!question.language &&
          question.testCases !== undefined &&
          question.testCases.length > 0 &&
          question.testCases.every(tc => tc.input && tc.output)
        );
      default:
        return false;
    }
  };

  const getValidationMessage = (question: Question): string => {
    if (!question.title.trim()) return 'Title is required';
    if (!question.description.trim()) return 'Description is required';

    switch (question.type) {
      case 'multipleChoice':
        if (question.options === undefined || question.options.length < 3) return 'At least 2 answer options required';
        if (question.options.slice(1).some(opt => !opt.trim())) return 'All answer options must be filled';
        if (typeof question.correctAnswer !== 'number') return 'Select correct answer';
        if (question.correctAnswer < 1 || question.correctAnswer >= question.options.length) return 'Invalid correct answer selection';
        break;
      case 'trueFalse':
        if (typeof question.correctAnswer !== 'boolean') return 'Select True or False';
        break;
      case 'codeChallenge':
      case 'codeDebugging':
        if (!question.language) return 'Programming language required';
        if (!question.testCases || question.testCases.length === 0) return 'At least one test case required';
        if (question.testCases.some(tc => !tc.input || !tc.output)) return 'All test cases must have input and output';
        break;
    }

    return '';
  };

  const handleSectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSectionIndex(parseInt(e.target.value));
  };

  return (
    <div>
      {isAuthenticated && user && ['admin', 'instructor'].includes(user.role) ? (
        <>
          <div className="p-3 border-bottom bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 d-flex align-items-center">
                <Plus size={20} className="me-2" />
                Create New Questions
              </h6>
              <Button color="success" size="sm" onClick={addNewQuestion}>
                <Plus size={16} className="me-1" />
                Add Question
              </Button>
            </div>

            {testData.settings.useSections && (
              <FormGroup className="mt-3 mb-0">
                <Label htmlFor="sectionSelectCreate" className="fw-bold">
                  Assign to Section
                </Label>
                <Input
                  type="select"
                  id="sectionSelectCreate"
                  value={selectedSectionIndex}
                  onChange={handleSectionChange as any}
                  disabled={testData.sections.length === 0}
                >
                  {testData.sections.length > 0 ? (
                    testData.sections.map((section, index) => (
                      <option key={index} value={index}>
                        {section.name} ({section.questions.length} questions)
                      </option>
                    ))
                  ) : (
                    <option value={-1} disabled>No sections available</option>
                  )}
                </Input>
              </FormGroup>
            )}

            {errorMessage && (
              <Alert color="danger" className="mt-3 mb-0">
                <AlertCircle size={16} className="me-2" />
                {errorMessage}
              </Alert>
            )}
          </div>

          <div style={{ height: 'calc(100vh - 400px)', overflowY: 'auto' }}>
            {newQuestions.length === 0 ? (
              <div className="text-center p-4">
                <div className="mb-3">
                  <FileText size={48} className="text-muted" />
                </div>
                <p className="text-muted mb-3">No new questions created yet.</p>
                <Button color="success" onClick={addNewQuestion}>
                  <Plus size={16} className="me-1" />
                  Create Your First Question
                </Button>
              </div>
            ) : (
              <div className="p-3">
                {newQuestions.map((question, index) => {
                  const isValid = isQuestionValid(question);
                  const validationMessage = getValidationMessage(question);
                  const isExpanded = expandedQuestionId === question.id;

                  return (
                    <Card key={question.id} className="mb-3 border">
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 d-flex align-items-center">
                              <Badge color="info" className="me-2">
                                Q{index + 1}
                              </Badge>
                              {question.title || 'Untitled Question'}
                            </h6>
                            
                            <div className="d-flex gap-2 mb-2">
                              <Badge color={isValid ? 'success' : 'warning'}>
                                {isValid ? (
                                  <>
                                    <CheckCircle size={12} className="me-1" />
                                    Valid
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle size={12} className="me-1" />
                                    Incomplete
                                  </>
                                )}
                              </Badge>
                              <Badge color="secondary">
                                {question.type.replace(/([A-Z])/g, ' $1').trim()}
                              </Badge>
                              {question.language && (
                                <Badge color="primary">{question.language}</Badge>
                              )}
                              {question.difficulty && (
                                <Badge color={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'danger'}>
                                  {question.difficulty}
                                </Badge>
                              )}
                            </div>
                            
                            {!isValid && validationMessage && (
                              <Alert color="warning" className="mb-2 py-2 px-3 small">
                                <AlertCircle size={14} className="me-1" />
                                {validationMessage}
                              </Alert>
                            )}
                          </div>
                          
                          <div className="d-flex gap-2">
                            <Button
                              color="outline-info"
                              size="sm"
                              onClick={() => {
                                const newExpanded = isExpanded ? null : question.id;
                                setExpandedQuestionId(newExpanded);
                              }}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp size={14} className="me-1" />
                                  Collapse
                                </>
                              ) : (
                                <>
                                  <Edit3 size={14} className="me-1" />
                                  Edit
                                </>
                              )}
                            </Button>
                            
                            {isValid && (
                              <Button
                                color="primary"
                                size="sm"
                                onClick={() => assignQuestionToTest(question.id)}
                              >
                                <Zap size={14} className="me-1" />
                                Assign
                              </Button>
                            )}
                            
                            <Button
                              color="outline-danger"
                              size="sm"
                              onClick={() => removeNewQuestion(question.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>

                        <Collapse isOpen={isExpanded}>
                          <div className="border-top pt-3">
                            <QuestionFormComponent
                              question={question}
                              onSubmitSuccess={(updatedQuestion) => {
                                updateNewQuestion(updatedQuestion);
                                setExpandedQuestionId(null);
                              }}
                              submitLabel="Save & Close"
                              showSubmitButton={true}
                              compact={true}
                              onCancel={() => setExpandedQuestionId(null)}
                            />
                          </div>
                        </Collapse>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <Alert color="danger">
          <AlertCircle size={16} className="me-2" />
          Unauthorized: Only admins or instructors can create questions.
        </Alert>
      )}
    </div>
  );
};

export default QuestionCreator;