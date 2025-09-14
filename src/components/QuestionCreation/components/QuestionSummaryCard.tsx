import React, { useState } from 'react';
import { Card, CardBody, Table, Badge, Button } from 'reactstrap';
import { Eye, Globe, Building } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

const QuestionSummaryCard: React.FC = () => {
  const { state } = useQuestionCreation();
  const [previewMode, setPreviewMode] = useState(false);

  const {
    selectedLanguage,
    selectedCategory,
    selectedQuestionType,
    questionData,
    testCases,
    isGlobalQuestion
  } = state;

  const getQuestionTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      multipleChoice: 'Multiple Choice',
      trueFalse: 'True/False',
      fillInTheBlank: 'Fill in the Blank',
      codeChallenge: 'Code Challenge',
      codeDebugging: 'Code Debugging'
    };
    return typeLabels[type] || type;
  };

  const getCategoryLabel = (category: string): string => {
    const categoryLabels: Record<string, string> = {
      logic: 'Logic & Algorithms',
      ui: 'User Interface',
      syntax: 'Syntax & Features'
    };
    return categoryLabels[category] || category;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'secondary';
    }
  };

  const getTotalPoints = (): number => {
    switch (selectedQuestionType) {
      case 'fillInTheBlank':
        // Only fill-in-the-blank questions have points per blank
        return questionData.blanks?.reduce((sum, blank) => sum + (blank.points || 1), 0) || 1;
      case 'codeChallenge':
      case 'codeDebugging':
        // Code challenges and debugging questions have a single point value
        // Since test cases no longer have individual points, return 1 point per test case
        // or use a fixed total (you might want to make this configurable)
        return testCases.length || 1;
      case 'multipleChoice':
      case 'trueFalse':
        // Simple question types are worth 1 point
        return 1;
      default:
        return 1;
    }
  };

  const renderQuestionPreview = () => {
    switch (selectedQuestionType) {
      case 'multipleChoice':
        return (
          <Card className="border-light mt-3">
            <CardBody>
              <h6 className="mb-3">Multiple Choice Question</h6>
              <p className="mb-3">{questionData.description}</p>
              {questionData.options?.map((option, index) => (
                <div key={index} className="mb-2">
                  <div className={`p-2 rounded ${questionData.correctAnswer === index ? 'bg-success bg-opacity-10 border border-success' : 'bg-light'}`}>
                    <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                    {questionData.correctAnswer === index && (
                      <Badge color="success" className="ms-2">Correct</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        );

      case 'trueFalse':
        return (
          <Card className="border-light mt-3">
            <CardBody>
              <h6 className="mb-3">True/False Question</h6>
              <p className="mb-3">{questionData.description}</p>
              <div className="d-flex gap-3">
                <div className={`p-2 rounded ${questionData.correctAnswer === true ? 'bg-success bg-opacity-10 border border-success' : 'bg-light'}`}>
                  <strong>True</strong>
                  {questionData.correctAnswer === true && (
                    <Badge color="success" className="ms-2">Correct</Badge>
                  )}
                </div>
                <div className={`p-2 rounded ${questionData.correctAnswer === false ? 'bg-success bg-opacity-10 border border-success' : 'bg-light'}`}>
                  <strong>False</strong>
                  {questionData.correctAnswer === false && (
                    <Badge color="success" className="ms-2">Correct</Badge>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        );

      case 'fillInTheBlank':
        return (
          <Card className="border-light mt-3">
            <CardBody>
              <h6 className="mb-3">Fill in the Blank Question</h6>
              <p className="mb-3">{questionData.description}</p>
              <div className="mb-3">
                <label className="small fw-bold">Code Template:</label>
                <pre className="bg-light p-3 rounded mt-1">
                  {questionData.codeTemplate}
                </pre>
              </div>
              {questionData.blanks && questionData.blanks.length > 0 && (
                <div>
                  <label className="small fw-bold">Blank Configurations:</label>
                  {questionData.blanks.map((blank, index) => (
                    <div key={index} className="mb-2 p-2 bg-light rounded">
                      <div><strong>Blank {index + 1}:</strong> {blank.correctAnswers.join(', ')}</div>
                      <div className="small text-muted">
                        {blank.caseSensitive ? 'Case sensitive' : 'Case insensitive'} • {blank.points} point{blank.points !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        );

      case 'codeChallenge':
        return (
          <Card className="border-light mt-3">
            <CardBody>
              <h6 className="mb-3">Code Challenge Question</h6>
              <p className="mb-3">{questionData.description}</p>
              <div className="mb-3">
                <div className="row">
                  {questionData.codeConfig?.entryFunction && (
                    <div className="col-md-6">
                      <label className="small fw-bold">Entry Function:</label>
                      <div><code>{questionData.codeConfig.entryFunction}</code></div>
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="small fw-bold">Runtime:</label>
                    <div>{questionData.codeConfig?.runtime || 'node'}</div>
                  </div>
                </div>
              </div>
              {testCases.length > 0 && (
                <div>
                  <label className="small fw-bold">Test Cases ({testCases.length}):</label>
                  <div className="small">
                    {testCases.filter(tc => !tc.hidden).length} visible, {testCases.filter(tc => tc.hidden).length} hidden
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        );

      case 'codeDebugging':
        return (
          <Card className="border-light mt-3">
            <CardBody>
              <h6 className="mb-3">Code Debugging Question</h6>
              <p className="mb-3">{questionData.description}</p>
              <div className="mb-3">
                <label className="small fw-bold">Buggy Code:</label>
                <pre className="bg-light p-3 rounded mt-1" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {questionData.buggyCode}
                </pre>
              </div>
              <div>
                <label className="small fw-bold">Solution Code:</label>
                <pre className="bg-light p-3 rounded mt-1" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {questionData.solutionCode}
                </pre>
              </div>
            </CardBody>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="mb-4">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0 text-primary">Question Summary</h5>
          <div className="d-flex gap-2">
            <Button
              size="sm"
              color="secondary"
              outline
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye size={14} className="me-1" />
              {previewMode ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </div>
        </div>

        <Table borderless className="mb-0">
          <tbody>
            <tr>
              <td className="ps-0 py-2" style={{ width: '150px' }}>
                <strong>Title:</strong>
              </td>
              <td className="py-2">{questionData.title}</td>
            </tr>
            <tr>
              <td className="ps-0 py-2">
                <strong>Description:</strong>
              </td>
              <td className="py-2">
                <div style={{ maxHeight: '100px', overflow: 'auto' }}>
                  {questionData.description}
                </div>
              </td>
            </tr>
            <tr>
              <td className="ps-0 py-2">
                <strong>Type:</strong>
              </td>
              <td className="py-2">
                <Badge color="primary" className="me-2">
                  {getQuestionTypeLabel(selectedQuestionType || '')}
                </Badge>
                <Badge color="info" className="me-2">
                  {selectedLanguage}
                </Badge>
                <Badge color="secondary">
                  {getCategoryLabel(selectedCategory || '')}
                </Badge>
              </td>
            </tr>
            <tr>
              <td className="ps-0 py-2">
                <strong>Status:</strong>
              </td>
              <td className="py-2">
                <Badge color={(questionData.status || 'draft') === 'active' ? 'success' : 'secondary'}>
                  {(questionData.status || 'draft').charAt(0).toUpperCase() + (questionData.status || 'draft').slice(1)}
                </Badge>
                <div className="small text-muted mt-1">
                  {(questionData.status || 'draft') === 'active'
                    ? 'Available for use in tests'
                    : 'Saved as draft - requires activation'
                  }
                </div>
              </td>
            </tr>
            <tr>
              <td className="ps-0 py-2">
                <strong>Difficulty:</strong>
              </td>
              <td className="py-2">
                <Badge color={getDifficultyColor(questionData.difficulty || 'medium')}>
                  {(questionData.difficulty || 'medium').charAt(0).toUpperCase() + (questionData.difficulty || 'medium').slice(1)}
                </Badge>
              </td>
            </tr>
            {questionData.tags && questionData.tags.length > 0 && (
              <tr>
                <td className="ps-0 py-2">
                  <strong>Tags:</strong>
                </td>
                <td className="py-2">
                  {questionData.tags.map((tag, index) => (
                    <Badge key={index} color="outline-secondary" className="me-1">
                      {tag}
                    </Badge>
                  ))}
                </td>
              </tr>
            )}
            <tr>
              <td className="ps-0 py-2">
                <strong>Total Points:</strong>
              </td>
              <td className="py-2">
                <Badge color="success">{getTotalPoints()}</Badge>
              </td>
            </tr>
            <tr>
              <td className="ps-0 py-2">
                <strong>Visibility:</strong>
              </td>
              <td className="py-2">
                <Badge color={isGlobalQuestion ? "info" : "secondary"}>
                  {isGlobalQuestion ? (
                    <>
                      <Globe size={12} className="me-1" />
                      Global Question
                    </>
                  ) : (
                    <>
                      <Building size={12} className="me-1" />
                      Organization Only
                    </>
                  )}
                </Badge>
              </td>
            </tr>
          </tbody>
        </Table>

        {/* Question Preview */}
        {previewMode && (
          <div className="mb-0">
            <h6 className="text-primary mb-3 mt-4">Question Preview</h6>
            {renderQuestionPreview()}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default QuestionSummaryCard;