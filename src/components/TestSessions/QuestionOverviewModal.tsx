// components/TestSessions/QuestionOverviewModal.tsx - ALIGNED with actual NavigationContext
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from 'reactstrap';
import type { NavigationContext } from '../../types/session';

// Simplified types aligned with actual backend structure
type SectionQuestion = {
  globalIndex: number;
  localIndex?: number;
  status?: string;
  hasAnswer?: boolean;
  flagged?: boolean;
  timeSpent?: number;
  points?: number;
};

type SectionOverview = {
  sectionName: string | null;
  sectionIndex: number;
  isCompleted: boolean;
  questions: SectionQuestion[];
};

interface QuestionOverviewModalProps {
  isOpen: boolean;
  toggle: () => void;
  // ALIGNED: Use actual NavigationContext type
  navigation: NavigationContext | null;
  // REMOVED: progress prop since we derive everything from navigation
  navigateToQuestion?: (index: number) => Promise<void>;

  /** If provided, only render questions for the current section */
  sectionOnly?: number | 'current';

  /** Optional primary CTA (e.g., "Submit Section") */
  primaryActionLabel?: string;
  onPrimaryAction?: () => Promise<void> | void;
  primaryActionLoading?: boolean;

  /** Optional lazy loader for grouped overview */
  fetchOverview?: () => Promise<{ questionOverview: SectionOverview[] } | any>;
}

const QuestionOverviewModal: React.FC<QuestionOverviewModalProps> = ({
  isOpen,
  toggle,
  navigation,
  navigateToQuestion,
  sectionOnly,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionLoading = false,
  fetchOverview,
}) => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<SectionOverview[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const showSectionOnly = sectionOnly !== undefined && sectionOnly !== null;

  // Load grouped overview for sectioned tests when NOT in sectionOnly mode
  useEffect(() => {
    let cancelled = false;

    const maybeLoad = async () => {
      if (!isOpen) return;
      if (!navigation) return;
      if (showSectionOnly || !fetchOverview) {
        setOverview(null);
        setLoading(false);
        setLoadError(null);
        return;
      }
      
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetchOverview();
        if (cancelled) return;
        const data = (res?.questionOverview || res) as SectionOverview[] | undefined;
        if (Array.isArray(data)) {
          setOverview(data);
        } else {
          setOverview(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setLoadError(e?.message || 'Failed to load overview');
          setOverview(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    maybeLoad();
    return () => {
      cancelled = true;
    };
  }, [isOpen, navigation, showSectionOnly, fetchOverview]);

  // ALIGNED: Use actual NavigationContext properties for section questions
  const sectionIndices: number[] | null = useMemo(() => {
    if (!showSectionOnly || !navigation?.currentSection) return null;
    
    const section = navigation.currentSection;
    const questionsInSection = section.questionsInSection || 0;
    const currentIndex = navigation.currentIndex || 0;
    
    // Calculate section start index based on current position
    const questionInSection = section.questionInSection || 1;
    const sectionStartIndex = currentIndex - (questionInSection - 1);
    
    return Array.from({ length: questionsInSection }, (_, i) => sectionStartIndex + i);
  }, [showSectionOnly, navigation?.currentSection, navigation?.currentIndex]);

  // ALIGNED: Use actual NavigationContext arrays
  const scopedFromIndices = useCallback(
    (indices: number[]) => {
      const answeredQuestions = navigation?.answeredQuestions || [];
      const skippedQuestions = navigation?.skippedQuestions || [];
      
      const answered = indices.filter((i) => answeredQuestions.includes(i)).length;
      const skipped = indices.filter((i) => skippedQuestions.includes(i)).length;
      const total = indices.length;
      const completed = answered;
      const remaining = Math.max(0, total - completed);
      
      return { answered, skipped, flagged: 0, total, completed, remaining };
    },
    [navigation?.answeredQuestions, navigation?.skippedQuestions]
  );

  // ALIGNED: Section header using actual NavigationContext
  const sectionHeader = useMemo(() => {
    if (!showSectionOnly || !navigation?.currentSection) return null;
    
    const section = navigation.currentSection;
    const current = section.questionInSection || 1;
    const total = section.questionsInSection || 0;
    
    return `${section.name} • ${current} / ${total}`;
  }, [showSectionOnly, navigation?.currentSection]);

  // Flat fallback indices (entire test)
  const flatIndices: number[] = useMemo(() => {
    const n = navigation?.totalQuestions || 0;
    return Array.from({ length: n }, (_, i) => i);
  }, [navigation?.totalQuestions]);

  // ALIGNED: Question pill using actual NavigationContext
  const QuestionPill: React.FC<{ index: number }> = ({ index }) => {
    const answeredQuestions = navigation?.answeredQuestions || [];
    const skippedQuestions = navigation?.skippedQuestions || [];
    
    let color = 'outline-secondary';
    if (answeredQuestions.includes(index)) {
      color = 'success';
    } else if (skippedQuestions.includes(index)) {
      color = 'warning';
    }

    const isCurrent = navigation?.currentIndex === index;

    return (
      <Button
        key={index}
        color={color.startsWith('outline-') ? color.substring(8) : color}
        outline={color.startsWith('outline-') || !isCurrent}
        onClick={async () => {
          if (navigateToQuestion) {
            await navigateToQuestion(index);
            toggle();
          }
        }}
        disabled={!navigateToQuestion}
        aria-label={`Navigate to question ${index + 1}`}
        className="me-2 mb-2"
        size="sm"
      >
        {index + 1}
      </Button>
    );
  };

  // Loading state if navigation is missing
  if (!navigation) {
    return (
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Question Overview</ModalHeader>
        <ModalBody>
          <div className="text-center">
            <Spinner color="primary" size="sm" />
            <p className="mb-0">Loading question overview...</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  // SECTION-ONLY VIEW (current section pills + CTA)
  if (showSectionOnly && sectionIndices) {
    const scoped = scopedFromIndices(sectionIndices);

    return (
      <Modal isOpen={isOpen} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>
          {sectionHeader ? `Review Section: ${sectionHeader}` : 'Review Section'}
        </ModalHeader>
        <ModalBody>
          <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
            <span>
              <strong>{scoped.completed}</strong> answered
            </span>
            <span>
              <strong>{scoped.remaining}</strong> remaining
            </span>
            {scoped.skipped > 0 && (
              <span>
                <strong>{scoped.skipped}</strong> skipped
              </span>
            )}
          </div>

          <div className="d-flex flex-wrap">
            {sectionIndices.map((idx) => (
              <QuestionPill key={idx} index={idx} />
            ))}
          </div>

          {scoped.remaining > 0 && (
            <p className="text-warning mt-3 mb-0">
              You have {scoped.remaining} unanswered question{scoped.remaining === 1 ? '' : 's'} in this section.
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          {primaryActionLabel && onPrimaryAction && (
            <Button color="success" onClick={onPrimaryAction} disabled={primaryActionLoading}>
              {primaryActionLoading ? <Spinner size="sm" className="me-2" /> : null}
              {primaryActionLabel}
            </Button>
          )}
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  // FULL OVERVIEW
  const renderGrouped = Array.isArray(overview) && overview.length > 0;

  // Derive global scoped counts across all questions rendered in grouped mode
  const groupedScoped = useMemo(() => {
    if (!renderGrouped) return null;
    const all = overview!.flatMap((s) => s.questions.map((q) => q.globalIndex));
    return scopedFromIndices(all);
  }, [renderGrouped, overview, scopedFromIndices]);

  // ALIGNED: Use actual NavigationContext progress
  const globalProgress = useMemo(() => {
    return {
      answered: navigation?.progress?.answered || 0,
      total: navigation?.progress?.total || 0,
      skipped: navigation?.progress?.skipped || 0,
      percentage: navigation?.progress?.percentage || 0
    };
  }, [navigation?.progress]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Question Overview</ModalHeader>
      <ModalBody>
        {/* Loading state for grouped fetch */}
        {loading && (
          <div className="text-center mb-3">
            <Spinner color="primary" size="sm" />
            <p className="mb-0">Loading sections…</p>
          </div>
        )}
        {loadError && (
          <p className="text-danger">
            {loadError} — showing flat overview instead.
          </p>
        )}

        {renderGrouped ? (
          <>
            {/* Global counters across all sections */}
            {groupedScoped && (
              <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <span>
                  <strong>{groupedScoped.completed}</strong> answered
                </span>
                <span>
                  <strong>{groupedScoped.remaining}</strong> remaining
                </span>
                {groupedScoped.skipped > 0 && (
                  <span>
                    <strong>{groupedScoped.skipped}</strong> skipped
                  </span>
                )}
              </div>
            )}

            {/* Sections */}
            {overview!.map((section) => {
              const indices = section.questions.map((q) => q.globalIndex);
              const sScoped = scopedFromIndices(indices);
              return (
                <div key={section.sectionIndex} className="mb-4">
                  <h6 className="mb-2">
                    {section.sectionName ?? `Section ${section.sectionIndex + 1}`}{' '}
                    {section.isCompleted ? (
                      <span className="text-success">(completed)</span>
                    ) : (
                      <span className="text-muted">
                        ({sScoped.completed}/{sScoped.total} answered)
                      </span>
                    )}
                  </h6>
                  <div className="d-flex flex-wrap">
                    {section.questions.map((q) => (
                      <QuestionPill key={q.globalIndex} index={q.globalIndex} />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          // Flat fallback using actual NavigationContext
          <>
            <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
              <span>
                <strong>{globalProgress.answered}</strong> answered
              </span>
              <span>
                <strong>{globalProgress.total - globalProgress.answered}</strong> remaining
              </span>
              {globalProgress.skipped > 0 && (
                <span>
                  <strong>{globalProgress.skipped}</strong> skipped
                </span>
              )}
              <span className="text-muted">
                {globalProgress.percentage}% complete
              </span>
            </div>
            
            <div className="d-flex flex-wrap">
              {flatIndices.map((i) => (
                <QuestionPill key={i} index={i} />
              ))}
            </div>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default QuestionOverviewModal;