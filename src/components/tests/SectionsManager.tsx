// src/components/tests/SectionsManager.tsx
import React from "react";
import { Button, Progress, ListGroup, ListGroupItem, Badge } from "reactstrap";
import type {
  CreateTestData,
  SectionType,
  SectionWithQuestions,
  Question
} from "../../types";

interface SectionsManagerProps {
  testData: CreateTestData;
  setTestData: React.Dispatch<React.SetStateAction<CreateTestData>>;
  sectionTypes: SectionType[];
  questions: Question[];
  setSectionModal: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      mode: "add" | "edit";
      section?: SectionWithQuestions;
      index?: number;
    }>
  >;
  setValidationResult: React.Dispatch<
    React.SetStateAction<
      { valid: boolean; errors?: string[]; warnings?: string[] } | null
    >
  >;
}

const SectionsManager: React.FC<SectionsManagerProps> = ({
  testData,
  setTestData,
  sectionTypes,
  questions,
  setSectionModal,
  setValidationResult,
}) => {
  const totalTime =
    testData.sections?.reduce((sum, s) => sum + (s.timeLimit || 0), 0) || 0;

  const handleValidate = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!testData.sections || testData.sections.length === 0) {
      warnings.push("No sections have been added yet.");
    }

    testData.sections.forEach((s, i) => {
      if (!s.name?.trim()) errors.push(`Section #${i + 1} is missing a name.`);
      if (!s.timeLimit || s.timeLimit <= 0)
        errors.push(`Section "${s.name || `#${i + 1}`}" must have a positive time limit.`);
      const hasQs =
        s.questionPool?.enabled
          ? (s.questionPool.totalQuestions || 0) > 0
          : s.questions.length > 0;
      if (!hasQs)
        warnings.push(
          `Section "${s.name || `#${i + 1}`}" has no questions yet.`
        );
    });

    setValidationResult({
      valid: errors.length === 0,
      errors: errors.length ? errors : undefined,
      warnings: warnings.length ? warnings : undefined,
    });
  };

  const handleAdd = () => {
    setSectionModal({
      open: true,
      mode: "add",
    });
  };

  const handleEdit = (index: number) => {
    setSectionModal({
      open: true,
      mode: "edit",
      section: testData.sections[index],
      index,
    });
  };

  const handleRemove = (index: number) => {
    setTestData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  return (
    <div>
      <div className="p-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Test Sections</h6>
          <div>
            {testData.sections.length > 0 && (
              <Button color="info" size="sm" className="me-2" onClick={handleValidate}>
                ✅ Validate
              </Button>
            )}
            <Button color="success" size="sm" onClick={handleAdd}>
              ➕ Add Section
            </Button>
          </div>
        </div>
        {testData.sections.length > 0 && (
          <div className="mt-2">
            <Progress multi style={{ height: 8 }}>
              {testData.sections.map((section, index) => (
                <Progress
                  key={index}
                  bar
                  color={
                    (["primary", "success", "info", "warning", "secondary"][
                      index % 5
                    ] as any)
                  }
                  value={
                    totalTime > 0 ? (section.timeLimit / totalTime) * 100 : 0
                  }
                />
              ))}
            </Progress>
            <small className="text-muted">Time distribution across sections</small>
          </div>
        )}
      </div>

      <div style={{ height: "calc(100vh - 350px)", overflowY: "auto" }}>
        {testData.sections.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted">No sections created yet.</p>
            <Button color="success" onClick={handleAdd}>
              Create Your First Section
            </Button>
          </div>
        ) : (
          <ListGroup flush>
            {testData.sections.map((section: SectionWithQuestions, index: number) => {
              const info = sectionTypes.find((st) => st.value === section.sectionType);

              // Estimate points: use actual question points if present in catalog; otherwise fallback to section-stored points or default 1
              const estimatedPoints = section.questionPool?.enabled
                ? (section.questionPool.totalQuestions || 0) * 2
                : section.questions.reduce((sum, q) => {
                    const found = questions.find((qq) => qq._id === q.questionId);
                    const pts = found?.points ?? q.points ?? 1;
                    return sum + pts;
                  }, 0);

              const totalQs = section.questionPool?.enabled
                ? section.questionPool.totalQuestions
                : section.questions.length;

              return (
                <ListGroupItem
                  key={section._id || section.tempId || index}
                  className="border-0 border-bottom"
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center mb-2">
                        <span className="me-2">{info?.icon || "📚"}</span>
                        <h6 className="mb-0">{section.name}</h6>
                        <Badge color="outline-secondary" className="ms-2">
                          {section.timeLimit} min
                        </Badge>
                      </div>
                      <div className="small text-muted mb-2">
                        {section.description || info?.description}
                      </div>
                      <div className="d-flex gap-1 mb-2">
                        <Badge color="info">{info?.name || section.sectionType}</Badge>
                        <Badge color="secondary">{totalQs} questions</Badge>
                        <Badge color="light" className="text-dark">
                          {estimatedPoints} pts
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Button
                        color="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        color="outline-danger"
                        size="sm"
                        onClick={() => handleRemove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </ListGroupItem>
              );
            })}
          </ListGroup>
        )}
      </div>
    </div>
  );
};

export default SectionsManager;
