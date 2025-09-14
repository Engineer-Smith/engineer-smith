import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Spinner, Alert } from 'reactstrap';
import { Search, RefreshCw, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

const DuplicateCheckCard: React.FC = () => {
  const { state, checkForDuplicates, dispatch } = useQuestionCreation();
  const [duplicateCheckRun, setDuplicateCheckRun] = useState(false);
  const [isManualCheck, setIsManualCheck] = useState(false);
  
  const {
    questionData,
    duplicateChecking,
    duplicatesFound,
    showDuplicateWarning
  } = state;

  // Auto-run duplicate check when component mounts
  useEffect(() => {
    if (!duplicateCheckRun && questionData.title && questionData.description) {
      setDuplicateCheckRun(true);
      checkForDuplicates();
    }
  }, [questionData.title, questionData.description, duplicateCheckRun, checkForDuplicates]);

  const handleRunDuplicateCheck = async () => {
    setDuplicateCheckRun(true);
    setIsManualCheck(true);
    
    try {
      // Always show a minimum loading time for better UX
      const minLoadingTime = 1000; // 1 second minimum
      const startTime = Date.now();
      
      // Start the duplicate check
      await checkForDuplicates();
      
      // Calculate remaining time to show spinner
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      // Wait for remaining time if needed
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
    } finally {
      setIsManualCheck(false);
    }
  };

  // Show the duplicate warning modal
  const handleReviewDuplicates = () => {
    // First, add the missing action to your reducer or use an existing one
    // For now, let's try to manually set the showDuplicateWarning state
    dispatch({ 
      type: 'SET_DUPLICATES', 
      payload: { 
        duplicates: duplicatesFound, 
        checkHash: state.lastDuplicateCheck 
      } 
    });
  };

  // Alternative approach if the above doesn't work
  const handleShowDuplicateModal = () => {
    // Manually trigger the modal by updating the state
    dispatch({
      type: 'UPDATE_QUESTION_DATA', // Use existing action
      payload: {} // Empty payload to trigger re-render
    });
    
    // Then immediately set duplicates to show modal
    setTimeout(() => {
      dispatch({ 
        type: 'SET_DUPLICATES', 
        payload: { 
          duplicates: duplicatesFound, 
          checkHash: Date.now().toString() 
        } 
      });
    }, 0);
  };

  return (
    <Card className="mb-4 border-info">
      <CardBody>
        <h6 className="text-info mb-3">Duplicate Check</h6>
        
        {!duplicateCheckRun ? (
          <div className="text-center">
            <Search size={32} className="text-muted mb-2" />
            <p className="small mb-3">Check for similar questions to avoid duplicates</p>
            <Button
              color="info"
              size="sm"
              block
              onClick={handleRunDuplicateCheck}
              disabled={!questionData.title || !questionData.description || duplicateChecking}
            >
              {duplicateChecking ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Checking...
                </>
              ) : (
                <>
                  <Search size={14} className="me-1" />
                  Check for Duplicates
                </>
              )}
            </Button>
          </div>
        ) : duplicateChecking || isManualCheck ? (
          <div className="text-center">
            <Spinner size="sm" className="mb-2" />
            <div className="small text-muted">
              {isManualCheck ? 'Re-checking for duplicates...' : 'Searching for similar questions...'}
            </div>
          </div>
        ) : duplicatesFound.length > 0 ? (
          <div>
            <div className="d-flex align-items-center mb-2">
              <AlertTriangle size={16} className="text-warning me-2" />
              <span className="small fw-bold">{duplicatesFound.length} Similar Questions Found</span>
            </div>
            <div className="small text-muted mb-3">
              {duplicatesFound.filter(d => d.exactMatch).length > 0 && (
                <div className="text-danger mb-1">
                  <strong>{duplicatesFound.filter(d => d.exactMatch).length} exact match{duplicatesFound.filter(d => d.exactMatch).length > 1 ? 'es' : ''}</strong>
                </div>
              )}
              {duplicatesFound.filter(d => !d.exactMatch).length > 0 && (
                <div>
                  {duplicatesFound.filter(d => !d.exactMatch).length} similar questions
                </div>
              )}
            </div>
            <div className="d-grid gap-2">
              <Button 
                size="sm" 
                color="warning" 
                onClick={handleReviewDuplicates}
              >
                <Eye size={14} className="me-1" />
                Review Duplicates
              </Button>
              <Button
                size="sm"
                color="info"
                outline
                onClick={handleRunDuplicateCheck}
                disabled={duplicateChecking || isManualCheck}
              >
                {duplicateChecking || isManualCheck ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="me-1" />
                    Check Again
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <CheckCircle size={32} className="text-success mb-2" />
            <div className="small text-success mb-2">No duplicates found!</div>
            <Button
              size="sm"
              color="outline-info"
              onClick={handleRunDuplicateCheck}
              disabled={duplicateChecking || isManualCheck}
            >
              {duplicateChecking || isManualCheck ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw size={14} className="me-1" />
                  Check Again
                </>
              )}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default DuplicateCheckCard;