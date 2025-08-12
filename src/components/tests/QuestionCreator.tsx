import React from "react";
import {
  Card,
  CardBody,
  Button,
  FormGroup,
  Label,
  Input,
  Row,
  Col
} from "reactstrap";

import type { Question } from "../../types/questions";
import type { CreateTestData, SectionWithQuestions } from "../../types/tests";

interface QuestionCreatorProps {
  newQuestions: Question[];
  setNewQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  testData: CreateTestData;
  setTestData: React.Dispatch<React.SetStateAction<CreateTestData>>;
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  user?: unknown | null; // optional, passed by parent but not required here
}

// --- helpers ---
const makeNewQuestion = (defaultSkill: string | undefined): Question => {
  // Create a minimal Question that satisfies the interface.
  // Adjust defaults as needed for your flow.
  return {
    _id: `temp-${Date.now()}`, // temporary id until saved
    title: "",
    description: "",
    type: "multiple_choice",
    skill: defaultSkill || "",
    category: "",
    difficulty: "beginner",
    tags: [],
    points: 1,
    timeEstimate: 1,
    weight: 1,
    status: "draft",
    createdBy: {
      _id: "",
      email: "",
      profile: { firstName: "", lastName: "" }
    },
    createdByRole: "instructor",
    content: {
      options: ["", "", "", ""],
      correctAnswer: 0,
      shuffleOptions: true,
      hints: [],
      explanation: ""
    },
    usageStats: {
      timesUsed: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      successRate: 0,
      averageTime: 0,
      optionStats: [],
      testCaseStats: []
    },
    prerequisites: [],
    followUp: [],
    variants: [],
    mutuallyExclusive: [],
    version: 1,
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0
  };
};

// set by "path" e.g. "content.correctAnswer"
function setByPath<T extends object>(obj: T, path: string, value: unknown): T {
  const parts = path.split(".");
  const next = { ...obj } as any;
  let cur = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...(cur[k] ?? {}) };
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
  return next;
}

const QuestionCreator: React.FC<QuestionCreatorProps> = ({
  newQuestions,
  setNewQuestions,
  testData,
  setTestData, // not used here but kept for future wiring (e.g., auto-assign into sections)
  selectedSectionId,
  setSelectedSectionId,
}) => {
  const addNewQuestion = () => {
    const q = makeNewQuestion(testData.skills[0]);
    setNewQuestions((prev) => [...prev, q]);
  };

  const removeNewQuestion = (index: number) => {
    setNewQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateNewQuestion = (index: number, field: string, value: unknown) => {
    setNewQuestions((prev) => {
      const copy = [...prev];
      copy[index] = setByPath(prev[index], field, value);
      return copy;
    });
  };

  return (
    <div>
      <div className="p-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Create New Questions</h6>
          <Button color="success" size="sm" onClick={addNewQuestion}>
            ➕ Add Question
          </Button>
        </div>

        {testData.settings.useSections && (
          <FormGroup className="mt-3">
            <Label htmlFor="sectionSelectCreate">Assign to Section</Label>
            <Input
              type="select"
              id="sectionSelectCreate"
              value={selectedSectionId || ""}
              onChange={(e) => setSelectedSectionId(e.target.value || null)}
            >
              <option value="">Select a section</option>
              {testData.sections.map((section: SectionWithQuestions) => (
                <option
                  key={section.tempId || section._id}
                  value={section.tempId || section._id}
                >
                  {section.name} ({section.sectionType})
                </option>
              ))}
            </Input>
          </FormGroup>
        )}
      </div>

      <div style={{ height: "calc(100vh - 350px)", overflowY: "auto" }}>
        {newQuestions.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted">No new questions created yet.</p>
            <Button color="success" onClick={addNewQuestion}>
              Create Your First Question
            </Button>
          </div>
        ) : (
          <div className="p-3">
            {newQuestions.map((question, index) => (
              <Card key={question._id || index} className="mb-3">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Question {index + 1}</h6>
                    <Button
                      color="outline-danger"
                      size="sm"
                      onClick={() => removeNewQuestion(index)}
                    >
                      Remove
                    </Button>
                  </div>

                  <Row>
                    <Col md="8">
                      <Input
                        type="text"
                        value={question.title}
                        onChange={(e) =>
                          updateNewQuestion(index, "title", e.target.value)
                        }
                        placeholder="Question title"
                        className="mb-3"
                      />
                    </Col>
                    <Col md="4">
                      <Input
                        type="select"
                        value={question.type}
                        onChange={(e) =>
                          updateNewQuestion(index, "type", e.target.value)
                        }
                        className="mb-3"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="code_challenge">Code Challenge</option>
                        <option value="debug_fix">Debug Fix</option>
                      </Input>
                    </Col>
                  </Row>

                  <Input
                    type="textarea"
                    value={question.description}
                    onChange={(e) =>
                      updateNewQuestion(index, "description", e.target.value)
                    }
                    placeholder="Question text"
                    rows={2}
                    className="mb-3"
                  />

                  {question.type === "multiple_choice" && (
                    <div>
                      {(question.content?.options || []).map(
                        (option: string, optionIndex: number) => (
                          <div
                            key={optionIndex}
                            className="d-flex align-items-center mb-2"
                          >
                            <Input
                              type="radio"
                              name={`question-${index}-correct`}
                              checked={
                                question.content?.correctAnswer === optionIndex
                              }
                              onChange={() =>
                                updateNewQuestion(
                                  index,
                                  "content.correctAnswer",
                                  optionIndex
                                )
                              }
                              className="me-2 mt-0"
                            />
                            <Input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const opts = [...(question.content?.options || [])];
                                opts[optionIndex] = e.target.value;
                                updateNewQuestion(
                                  index,
                                  "content.options",
                                  opts
                                );
                              }}
                              placeholder={`Option ${String.fromCharCode(
                                65 + optionIndex
                              )}`}
                            />
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {question.type === "true_false" && (
                    <div className="d-flex gap-2">
                      <Button
                        color={
                          question.content?.correctBoolean === true
                            ? "success"
                            : "outline-success"
                        }
                        size="sm"
                        onClick={() =>
                          updateNewQuestion(
                            index,
                            "content.correctBoolean",
                            true
                          )
                        }
                      >
                        True
                      </Button>
                      <Button
                        color={
                          question.content?.correctBoolean === false
                            ? "danger"
                            : "outline-danger"
                        }
                        size="sm"
                        onClick={() =>
                          updateNewQuestion(
                            index,
                            "content.correctBoolean",
                            false
                          )
                        }
                      >
                        False
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCreator;
