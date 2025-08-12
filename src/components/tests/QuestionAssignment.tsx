// src/components/tests/QuestionAssignment.tsx
import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Button,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Alert,
  Badge,
  Progress
} from 'reactstrap';
import { useAuth } from '../../context/AuthContext';
import type { Question, CreateTestData } from '../../types';

// Import the existing question components
import QuestionBrowser from './QuestionBrowser';
import QuestionCreator from './QuestionCreator';

interface QuestionAssignmentProps {
  testData: CreateTestData;
  setTestData: React.Dispatch<React.SetStateAction<CreateTestData>>;
  onNext: () => void;
  onPrevious: () => void;
  setError: (error: string | null) => void;
}

const QuestionAssignment: React.FC<QuestionAssignmentProps> = ({
  testData,
  setTestData,
  onNext,
  onPrevious,
  setError
}) => {
  const { client } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Question filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  
  // New questions created in this session
  const [newQuestions, setNewQuestions] = useState<Question[]>([]);

  // Load questions when skills change
  useEffect(() => {
    if (testData.skills.length > 0) {
      fetchQuestions();
    }
  }, [testData.skills]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      testData.skills.forEach(skill => params.append('skill', skill));
      params.append('status', 'active');
      params.append('limit', '200');
      
      const response = await client.get(`/questions?${params.toString()}`);
      
      // Handle both old and new response formats
      let questionList = [];
      if (response.data.success) {
        questionList = response.data.data?.questions || [];
      } else if (response.data.questions) {
        questionList = response.data.questions;
      } else if (Array.isArray(response.data)) {
        questionList = response.data;
      }
      
      setQuestions(questionList);
    } catch (error: any) {
      console.error('Failed to fetch questions:', error);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  // Filter questions based on search and filters
  useEffect(() => {
    let filtered = questions;
    
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType) {
      filtered = filtered.filter(q => q.type === filterType);
    }
    
    if (filterDifficulty) {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty);
    }
    
    setFilteredQuestions(filtered);
  }, [questions, searchTerm, filterType, filterDifficulty]);

  // Toggle question selection
  const handleToggleQuestion = (questionId: string) => {
    const question = questions.find(q => q._id === questionId);
    if (!question) return;

    if (testData.settings.useSections) {
      // Section-based assignment
      if (!selectedSectionId) {
        setError('Please select a section first');
        return;
      }

      setTestData(prev => ({
        ...prev,
        sections: prev.sections.map(section => {
          if ((section.tempId || section._id) === selectedSectionId) {
            const isSelected = section.questions.some(q => q.questionId === questionId);
            return {
              ...section,
              questions: isSelected
                ? section.questions.filter(q => q.questionId !== questionId)
                : [...section.questions, { questionId, points: question.points, order: section.questions.length + 1 }]
            };
          }
          return section;
        })
      }));
    } else {
      // Simple test assignment
      const isSelected = testData.questions.some(q => q.questionId === questionId);
      setTestData(prev => ({
        ...prev,
        questions: isSelected
          ? prev.questions.filter(q => q.questionId !== questionId)
          : [...prev.questions, { questionId, points: question.points }]
      }));
    }
  };

  // Select all filtered questions
  const handleSelectAll = () => {
    if (testData.settings.useSections && !selectedSectionId) {
      setError('Please select a section first');
      return;
    }

    filteredQuestions.forEach(question => {
      const questionId = question._id;
      
      if (testData.settings.useSections) {
        setTestData(prev => ({
          ...prev,
          sections: prev.sections.map(section => {
            if ((section.tempId || section._id) === selectedSectionId) {
              const isSelected = section.questions.some(q => q.questionId === questionId);
              if (!isSelected) {
                return {
                  ...section,
                  questions: [...section.questions, { questionId, points: question.points, order: section.questions.length + 1 }]
                };
              }
            }
            return section;
          })
        }));
      } else {
        setTestData(prev => {
          const isSelected = prev.questions.some(q => q.questionId === questionId);
          if (!isSelected) {
            return {
              ...prev,
              questions: [...prev.questions, { questionId, points: question.points }]
            };
          }
          return prev;
        });
      }
    });
  };

  // Clear all selections
  const handleClearAll = () => {
    if (testData.settings.useSections) {
      if (selectedSectionId) {
        setTestData(prev => ({
          ...prev,
          sections: prev.sections.map(section => {
            if ((section.tempId || section._id) === selectedSectionId) {
              return { ...section, questions: [] };
            }
            return section;
          })
        }));
      } else {
        // Clear all sections
        setTestData(prev => ({
          ...prev,
          sections: prev.sections.map(section => ({ ...section, questions: [] }))
        }));
      }
    } else {
      setTestData(prev => ({ ...prev, questions: [] }));
    }
  };

  const getTotalQuestions = () => {
    if (testData.settings.useSections) {
      return testData.sections.reduce((total, section) => {
        if (section.questionPool.enabled) {
          return total + (section.questionPool.totalQuestions || 0);
        }
        return total + section.questions.length;
      }, 0);
    }
    return testData.questions.length + newQuestions.length;
  };

  const getTotalPoints = () => {
    if (testData.settings.useSections) {
      return testData.sections.reduce((total, section) => {
        if (section.questionPool.enabled) {
          return total + (section.questionPool.totalQuestions || 0) * 2; // Estimate
        }
        return total + section.questions.reduce((sectionTotal, q) => {
          const question = questions.find(qq => qq._id === q.questionId);
          return sectionTotal + (question?.points || q.points || 1);
        }, 0);
      }, 0);
    } else {
      const existingPoints = testData.questions.reduce((total, q) => {
        const question = questions.find(qq => qq._id === q.questionId);
        return total + (question?.points || q.points || 1);
      }, 0);
      const newPoints = newQuestions.reduce((total, q) => total + (q.points || 1), 0);
      return existingPoints + newPoints;
    }
  };

  const getSelectedQuestionCount = () => {
    if (testData.settings.useSections) {
      if (selectedSectionId) {
        const section = testData.sections.find(s => (s.tempId || s._id) === selectedSectionId);
        return section?.questions.length || 0;
      }
      return getTotalQuestions();
    }
    return testData.questions.length;
  };

  const handleNext = () => {
    setError(null);
    
    const totalQuestions = getTotalQuestions();
    
    if (totalQuestions === 0) {
      setError('Please add at least one question to the test');
      return;
    }
    
    if (testData.settings.useSections) {
      // Check that each section has questions
      const emptySections = testData.sections.filter(section => 
        !section.questionPool.enabled && section.questions.length === 0
      );
      
      if (emptySections.length > 0) {
        setError(`Please add questions to all sections. ${emptySections.length} section(s) are empty.`);
        return;
      }
    }
    
    onNext();
  };

  return (
    <div>
      {/* Progress Summary */}
      <div className="mb-4">
        <Card className="bg-light">
          <CardBody>
            <Row>
              <Col md="3">
                <div className="text-center">
                  <h4 className="mb-1">{getTotalQuestions()}</h4>
                  <small className="text-muted">Total Questions</small>
                </div>
              </Col>
              <Col md="3">
                <div className="text-center">
                  <h4 className="mb-1">{getTotalPoints()}</h4>
                  <small className="text-muted">Total Points</small>
                </div>
              </Col>
              <Col md="3">
                <div className="text-center">
                  <h4 className="mb-1">{testData.sections.length}</h4>
                  <small className="text-muted">Sections</small>
                </div>
              </Col>
              <Col md="3">
                <div className="text-center">
                  <h4 className="mb-1">{newQuestions.length}</h4>
                  <small className="text-muted">New Questions</small>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>

      {/* Section Progress (for section-based tests) */}
      {testData.settings.useSections && (
        <div className="mb-4">
          <h6>Section Progress</h6>
          {testData.sections.map((section, index) => (
            <div key={section.tempId || section._id || index} className="mb-2">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small">{section.name}</span>
                <span className="small text-muted">
                  {section.questionPool.enabled 
                    ? `${section.questionPool.totalQuestions} questions (pool)`
                    : `${section.questions.length} questions`
                  }
                </span>
              </div>
              <Progress 
                value={section.questionPool.enabled 
                  ? (section.questionPool.totalQuestions! > 0 ? 100 : 0)
                  : (section.questions.length > 0 ? 100 : 0)
                } 
                color={section.questionPool.enabled 
                  ? (section.questionPool.totalQuestions! > 0 ? "success" : "secondary")
                  : (section.questions.length > 0 ? "success" : "secondary")
                }
                style={{ height: '4px' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <Nav tabs className="mb-3">
        <NavItem>
          <NavLink
            className={activeTab === 'browse' ? 'active' : ''}
            onClick={() => setActiveTab('browse')}
            style={{ cursor: 'pointer' }}
          >
            Browse Questions
            <Badge color="secondary" className="ms-2">
              {filteredQuestions.length}
            </Badge>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => setActiveTab('create')}
            style={{ cursor: 'pointer' }}
          >
            Create New
            <Badge color="success" className="ms-2">
              {newQuestions.length}
            </Badge>
          </NavLink>
        </NavItem>
      </Nav>

      {/* Tab Content */}
      <TabContent activeTab={activeTab}>
        <TabPane tabId="browse">
          <QuestionBrowser
            questions={questions}
            filteredQuestions={filteredQuestions}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterDifficulty={filterDifficulty}
            setFilterDifficulty={setFilterDifficulty}
            selectedSectionId={selectedSectionId}
            setSelectedSectionId={setSelectedSectionId}
            testData={testData}
            onToggleQuestion={handleToggleQuestion}
            onAssignAll={handleSelectAll}
            onClear={handleClearAll}
          />
        </TabPane>
        
        <TabPane tabId="create">
          <QuestionCreator
            newQuestions={newQuestions}
            setNewQuestions={setNewQuestions}
            selectedSectionId={selectedSectionId}
            setSelectedSectionId={setSelectedSectionId}
            testData={testData}
            setTestData={setTestData}
            user={null} // User not needed for this component
          />
        </TabPane>
      </TabContent>

      {/* Quick Actions */}
      <div className="mt-4">
        <Alert color="info">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Quick Actions:</strong>
              <span className="ms-2">
                Selected: {getSelectedQuestionCount()} questions
                {testData.settings.useSections && selectedSectionId && (
                  <span className="text-muted ms-1">
                    (in {testData.sections.find(s => (s.tempId || s._id) === selectedSectionId)?.name})
                  </span>
                )}
              </span>
            </div>
            <div>
              <Button color="outline-primary" size="sm" className="me-2" onClick={handleSelectAll}>
                Select All Visible
              </Button>
              <Button color="outline-secondary" size="sm" onClick={handleClearAll}>
                {testData.settings.useSections && selectedSectionId ? 'Clear Section' : 'Clear All'}
              </Button>
            </div>
          </div>
        </Alert>
      </div>

      {/* Navigation */}
      <div className="d-flex justify-content-between pt-3 border-top">
        <Button color="secondary" onClick={onPrevious}>
          {testData.settings.useSections ? 'Previous: Configure Sections' : 'Previous: Test Structure'}
        </Button>
        <Button color="primary" onClick={handleNext}>
          Next: Review & Publish
        </Button>
      </div>
    </div>
  );
};

export default QuestionAssignment;