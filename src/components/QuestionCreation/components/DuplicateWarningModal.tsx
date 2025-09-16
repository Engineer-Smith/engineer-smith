// src/components/QuestionCreation/components/DuplicateWarningModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Badge,
  Alert,
  Progress,
  Row,
  Col
} from 'reactstrap';
import {
  AlertTriangle,
  Eye,
  Globe,
  Building,
  CheckCircle,
  X,
  ArrowLeft,
  Check
} from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';
import type { DuplicateQuestion } from '../../../context/QuestionCreationContext';

const DuplicateWarningModal: React.FC = () => {
  const {
    state,
    dismissDuplicateWarning,
    cancelCreation
  } = useQuestionCreation();

  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateQuestion | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { duplicatesFound, showDuplicateWarning } = state;

  const handleClose = () => {
    dismissDuplicateWarning();
    setSelectedDuplicate(null);
    setShowDetails(false);
  };

  const handleContinueAnyway = () => {
    handleClose();
  };

  const handleCancelCreation = () => {
    cancelCreation();
  };

  const handleViewDetails = (duplicate: DuplicateQuestion) => {
    setSelectedDuplicate(duplicate);
    setShowDetails(true);
  };

  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 90) return 'danger';
    if (similarity >= 70) return 'warning';
    return 'info';
  };

  const getSimilarityLabel = (similarity: number): string => {
    if (similarity >= 90) return 'Exact';
    if (similarity >= 70) return 'High';
    if (similarity >= 50) return 'Medium';
    return 'Low';
  };

  // Render question as student would see it
  const renderQuestionPreview = (duplicate: DuplicateQuestion) => {
    return (
      <div className="question-preview bg-light p-4 rounded mx-auto" style={{ maxWidth: '800px' }}>
        <div className="mb-4">
          <h5 className="mb-3 text-dark">{duplicate.title}</h5>
          <p className="text-dark mb-4 fs-6">{duplicate.description}</p>
        </div>

        {duplicate.type === 'multipleChoice' && duplicate.options && (
          <div className="options-list">
            {duplicate.options.map((option: string, index: number) => (
              <div 
                key={index} 
                className={`d-flex align-items-center p-3 mb-3 rounded border ${
                  duplicate.correctAnswer === index 
                    ? 'bg-success border-success text-white' 
                    : 'bg-white border-secondary'
                }`}
                style={{ fontSize: '0.95rem' }}
              >
                <div className={`option-indicator me-3 fw-bold ${
                  duplicate.correctAnswer === index ? 'text-white' : 'text-primary'
                }`} style={{ minWidth: '24px' }}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-grow-1">{option}</span>
                {duplicate.correctAnswer === index && (
                  <Check size={18} className="text-white ms-2" />
                )}
              </div>
            ))}
          </div>
        )}

        {duplicate.type === 'trueFalse' && typeof duplicate.correctAnswer === 'number' && (
          <div className="options-list">
            <div className={`d-flex align-items-center p-3 mb-3 rounded border ${
              duplicate.correctAnswer === 0 
                ? 'bg-success border-success text-white' 
                : 'bg-white border-secondary'
            }`} style={{ fontSize: '0.95rem' }}>
              <div className={`option-indicator me-3 fw-bold ${
                duplicate.correctAnswer === 0 ? 'text-white' : 'text-primary'
              }`} style={{ minWidth: '24px' }}>A</div>
              <span className="flex-grow-1">True</span>
              {duplicate.correctAnswer === 0 && (
                <Check size={18} className="text-white ms-2" />
              )}
            </div>
            <div className={`d-flex align-items-center p-3 mb-3 rounded border ${
              duplicate.correctAnswer === 1 
                ? 'bg-success border-success text-white' 
                : 'bg-white border-secondary'
            }`} style={{ fontSize: '0.95rem' }}>
              <div className={`option-indicator me-3 fw-bold ${
                duplicate.correctAnswer === 1 ? 'text-white' : 'text-primary'
              }`} style={{ minWidth: '24px' }}>B</div>
              <span className="flex-grow-1">False</span>
              {duplicate.correctAnswer === 1 && (
                <Check size={18} className="text-white ms-2" />
              )}
            </div>
          </div>
        )}

        {duplicate.type === 'fillInTheBlank' && (
          <div className="code-preview bg-dark text-light p-4 rounded">
            <pre className="mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
              <code>{duplicate.codeTemplate || 'Code template not available'}</code>
            </pre>
          </div>
        )}

        {(duplicate.type === 'codeChallenge' || duplicate.type === 'codeDebugging') && (
          <div className="code-info bg-primary bg-opacity-10 border border-primary border-opacity-25 p-3 rounded">
            <div className="text-primary fw-semibold mb-2">
              {duplicate.type === 'codeChallenge' ? 'Code Challenge' : 'Code Debugging'} Question
            </div>
            {duplicate.codeConfig?.entryFunction && (
              <div className="small text-dark">
                <strong>Function:</strong> <code className="bg-light px-2 py-1 rounded">{duplicate.codeConfig.entryFunction}</code>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const exactMatches = duplicatesFound.filter(d => d.exactMatch);

  return (
    <Modal 
      isOpen={showDuplicateWarning} 
      toggle={handleClose}
      size="xl"
      backdrop="static"
      keyboard={false}
    >
      <ModalHeader toggle={handleClose} className="border-bottom bg-light">
        <div className="d-flex align-items-center">
          <AlertTriangle size={20} className="text-warning me-2" />
          <span>Potential Duplicate Questions Found</span>
          <Badge color="dark" className="ms-3">
            {duplicatesFound.length} Similar Question{duplicatesFound.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </ModalHeader>

      <ModalBody className="p-0">
        {!showDetails ? (
          <div>
            {exactMatches.length > 0 && (
              <Alert color="danger" className="m-4 mb-3">
                <AlertTriangle size={16} className="me-2" />
                <strong>Exact matches found!</strong> These questions appear identical to yours.
              </Alert>
            )}

            <div className="p-4 pt-3">
              <p className="text-muted mb-4">
                We found {duplicatesFound.length} existing question{duplicatesFound.length > 1 ? 's' : ''} similar to yours. 
                Review them below to avoid creating duplicates.
              </p>

              <Row>
                {duplicatesFound.map((duplicate) => (
                  <Col md={6} key={duplicate._id} className="mb-4">
                    <Card className={`h-100 ${duplicate.exactMatch ? 'border-danger' : 'border-warning'}`}>
                      <CardBody className="p-0">
                        {/* Header */}
                        <div className="p-3 border-bottom bg-light">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                {duplicate.exactMatch && (
                                  <Badge color="danger" className="small">Exact Match</Badge>
                                )}
                                <Badge color={getSimilarityColor(duplicate.similarity)} className="small">
                                  {duplicate.similarity}% {getSimilarityLabel(duplicate.similarity)}
                                </Badge>
                                <Badge color={duplicate.source === 'Global' ? 'info' : 'dark'} className="small">
                                  {duplicate.source === 'Global' ? (
                                    <>
                                      <Globe size={10} className="me-1" />
                                      Global
                                    </>
                                  ) : (
                                    <>
                                      <Building size={10} className="me-1" />
                                      Org
                                    </>
                                  )}
                                </Badge>
                              </div>
                              <div className="d-flex gap-1 flex-wrap">
                                <Badge color="primary" className="small text-white">{duplicate.type}</Badge>
                                <Badge color="info" className="small text-white">{duplicate.language}</Badge>
                                <Badge color="secondary" className="small text-white">{duplicate.difficulty}</Badge>
                              </div>
                            </div>
                          </div>
                          <Progress 
                            value={duplicate.similarity} 
                            color={getSimilarityColor(duplicate.similarity)}
                            className="small mb-2"
                            style={{ height: '4px' }}
                          />
                        </div>

                        {/* Question Preview */}
                        <div className="p-3">
                          <div className="question-preview-mini">
                            <h6 className="mb-2 text-truncate text-dark">{duplicate.title}</h6>
                            <p className="text-dark small mb-3" style={{ 
                              overflow: 'hidden', 
                              display: '-webkit-box', 
                              WebkitLineClamp: 2, 
                              WebkitBoxOrient: 'vertical',
                              lineHeight: '1.4em',
                              maxHeight: '2.8em'
                            }}>
                              {duplicate.description}
                            </p>

                            {/* Mini answer preview */}
                            {duplicate.type === 'multipleChoice' && duplicate.options && Array.isArray(duplicate.options) && (
                              <div className="mini-options">
                                {duplicate.options.slice(0, 2).map((option: string, idx: number) => (
                                  <div 
                                    key={idx}
                                    className={`small p-2 mb-1 rounded border ${
                                      duplicate.correctAnswer === idx 
                                        ? 'bg-success text-white border-success' 
                                        : 'bg-white text-dark border-light'
                                    }`}
                                  >
                                    <span className="fw-bold me-2">{String.fromCharCode(65 + idx)}.</span>
                                    {option.length > 25 ? option.substring(0, 25) + '...' : option}
                                    {duplicate.correctAnswer === idx && <Check size={12} className="ms-1" />}
                                  </div>
                                ))}
                                {duplicate.options.length > 2 && (
                                  <div className="small text-muted mt-1">
                                    +{duplicate.options.length - 2} more option{duplicate.options.length > 3 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            )}

                            {duplicate.type === 'trueFalse' && typeof duplicate.correctAnswer === 'number' && (
                              <div className="mini-options">
                                <div className={`small p-2 mb-1 rounded border ${
                                  duplicate.correctAnswer === 0 
                                    ? 'bg-success text-white border-success' 
                                    : 'bg-white text-dark border-light'
                                }`}>
                                  <span className="fw-bold me-2">A.</span> True {duplicate.correctAnswer === 0 && <Check size={12} className="ms-1" />}
                                </div>
                                <div className={`small p-2 rounded border ${
                                  duplicate.correctAnswer === 1 
                                    ? 'bg-success text-white border-success' 
                                    : 'bg-white text-dark border-light'
                                }`}>
                                  <span className="fw-bold me-2">B.</span> False {duplicate.correctAnswer === 1 && <Check size={12} className="ms-1" />}
                                </div>
                              </div>
                            )}

                            {/* Fallback for other question types or missing data */}
                            {(duplicate.type === 'fillInTheBlank' || duplicate.type === 'codeChallenge' || duplicate.type === 'codeDebugging' || 
                              (duplicate.type === 'multipleChoice' && !duplicate.options)) && (
                              <div className="mini-options">
                                <div className="small p-2 bg-primary bg-opacity-10 text-primary rounded border border-primary border-opacity-25">
                                  <strong>
                                    {duplicate.type === 'fillInTheBlank' ? 'Fill in the Blank' : 
                                     duplicate.type === 'codeChallenge' ? 'Code Challenge' : 
                                     duplicate.type === 'codeDebugging' ? 'Code Debugging' :
                                     'Multiple Choice'}
                                  </strong> question
                                  {duplicate.codeConfig?.entryFunction && (
                                    <div className="mt-1">
                                      Function: <code className="small">{duplicate.codeConfig.entryFunction}</code>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="p-3 pt-0">
                          <Button
                            size="sm"
                            color="primary"
                            onClick={() => handleViewDetails(duplicate)}
                            className="w-100"
                          >
                            <Eye size={14} className="me-1" />
                            View Full Question
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        ) : (
          selectedDuplicate && (
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Button
                  size="sm"
                  color="outline-secondary"
                  onClick={() => setShowDetails(false)}
                >
                  <ArrowLeft size={14} className="me-1" />
                  Back to List
                </Button>
                <div className="d-flex gap-2 flex-wrap">
                  {selectedDuplicate.exactMatch && (
                    <Badge color="danger">Exact Match</Badge>
                  )}
                  <Badge color={getSimilarityColor(selectedDuplicate.similarity)}>
                    {selectedDuplicate.similarity}% {getSimilarityLabel(selectedDuplicate.similarity)}
                  </Badge>
                  <Badge color={selectedDuplicate.source === 'Global' ? 'info' : 'dark'}>
                    {selectedDuplicate.source === 'Global' ? (
                      <>
                        <Globe size={12} className="me-1" />
                        Global Question
                      </>
                    ) : (
                      <>
                        <Building size={12} className="me-1" />
                        Your Organization
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              {renderQuestionPreview(selectedDuplicate)}

              <div className="mt-4">
                <Alert color={selectedDuplicate.exactMatch ? 'danger' : 'warning'}>
                  {selectedDuplicate.exactMatch ? (
                    <>
                      <strong>Exact Match:</strong> This question appears identical to yours. 
                      Consider using the existing question instead.
                    </>
                  ) : (
                    <>
                      <strong>Similar Content:</strong> This question has similar content. 
                      Review carefully before proceeding.
                    </>
                  )}
                </Alert>
              </div>
            </div>
          )
        )}
      </ModalBody>

      <ModalFooter className="border-top bg-light">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="small text-muted">
            {exactMatches.length > 0 ? (
              <span className="text-danger">
                <AlertTriangle size={14} className="me-1" />
                Exact matches found - review recommended
              </span>
            ) : (
              <span>
                Similar questions found - review for overlap
              </span>
            )}
          </div>
          <div className="d-flex gap-2">
            <Button 
              color="secondary" 
              outline 
              onClick={handleCancelCreation}
            >
              <X size={14} className="me-1" />
              Cancel Creation
            </Button>
            <Button 
              color={exactMatches.length > 0 ? "danger" : "warning"}
              onClick={handleContinueAnyway}
            >
              <CheckCircle size={14} className="me-1" />
              Continue Anyway
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default DuplicateWarningModal;