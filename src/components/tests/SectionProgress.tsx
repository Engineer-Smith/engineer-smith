// src/components/tests/SectionProgress.tsx
import React from 'react';
import { Card, CardBody, Progress, Badge, Button } from 'reactstrap';
import { CheckCircle, Circle, Lock, ArrowRight } from 'lucide-react';
import { useTestSession } from '../../context/TestSessionContext';

export const SectionProgress: React.FC = () => {
  const { state, actions } = useTestSession();

  // Early return with proper type checking
  if (!state.test?.settings.useSections || !state.test.sections || state.test.sections.length === 0) {
    return null;
  }

  const getCurrentSectionProgress = () => {
    const currentSection = state.test!.sections![state.currentSectionIndex];
    if (!currentSection) return { answered: 0, total: 0 };
    
    const answered = currentSection.questions.filter(q => 
      state.answers[q.questionId] !== undefined
    ).length;
    
    return { answered, total: currentSection.questions.length };
  };

  const { answered, total } = getCurrentSectionProgress();
  const progressPercentage = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <Card className="mb-3">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Section Progress</h6>
          <Badge color="primary">
            Section {state.currentSectionIndex + 1} of {state.test!.sections!.length}
          </Badge>
        </div>

        <div className="mb-3">
          {state.test!.sections!.map((section, index) => {
            const isCompleted = state.testSession?.completedSections.includes(index);
            const isCurrent = index === state.currentSectionIndex;
            const isLocked = index > state.currentSectionIndex && !isCompleted;

            return (
              <div key={index} className="d-flex align-items-center mb-2">
                <div className="me-2">
                  {isCompleted ? (
                    <CheckCircle size={16} className="text-success" />
                  ) : isCurrent ? (
                    <Circle size={16} className="text-primary" />
                  ) : (
                    <Lock size={16} className="text-muted" />
                  )}
                </div>
                <div className="flex-grow-1">
                  <div className={`fw-${isCurrent ? 'bold' : 'normal'}`}>
                    {section.name}
                  </div>
                  {isCompleted && (
                    <Badge color="success" size="sm">Completed</Badge>
                  )}
                  {isCurrent && (
                    <Badge color="primary" size="sm">Current</Badge>
                  )}
                  {isLocked && (
                    <Badge color="secondary" size="sm">Locked</Badge>
                  )}
                </div>
                <div className="text-muted small">
                  {section.timeLimit} min
                </div>
              </div>
            );
          })}
        </div>

        {/* Current section progress */}
        <div className="border-top pt-2">
          <div className="d-flex justify-content-between mb-2">
            <span className="small">Current Section</span>
            <span className="small">{answered}/{total} answered</span>
          </div>
          <Progress 
            value={progressPercentage}
            color={progressPercentage === 100 ? "success" : progressPercentage > 50 ? "warning" : "danger"}
          />
        </div>
      </CardBody>
    </Card>
  );
};