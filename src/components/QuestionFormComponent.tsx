// src/components/QuestionFormComponent.tsx
import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Collapse,
  Row,
  Col,
  Progress,
  Badge,
} from "reactstrap";
import type { Question, Language } from "../types";

interface QuestionFormComponentProps {
  question: Question;
  onQuestionChange: (updatedQuestion: Question) => void;
  onSubmit?: (question: Question) => void | Promise<void>;
  submitLabel?: string;
  showSubmitButton?: boolean;
  showComplexityIndicator?: boolean;
  availableSkills?: Question["skill"][];
  compact?: boolean;
  validationErrors?: string[];
  onCancel?: () => void;
}

// Programming languages for content.language
const PROGRAMMING_LANGUAGES: Array<{ value: Language; label: string }> = [
  { value: "javascript", label: "JavaScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "jsx", label: "React/JSX" },
  { value: "dart", label: "Dart (Flutter)" },
  { value: "typescript", label: "TypeScript" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
];

const DEFAULT_SKILLS: Question["skill"][] = [
  "javascript",
  "react",
  "html",
  "css",
  "python",
  "flutter",
  "react-native",
  "backend",
];

// Helper to update nested object properties
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

const QuestionFormComponent: React.FC<QuestionFormComponentProps> = ({
  question,
  onQuestionChange,
  onSubmit,
  submitLabel = "Save Question",
  showSubmitButton = true,
  showComplexityIndicator = true,
  availableSkills = DEFAULT_SKILLS,
  compact = false,
  validationErrors = [],
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateQuestion = (field: string, value: unknown) => {
    const updatedQuestion = setByPath(question, field, value);
    onQuestionChange(updatedQuestion);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("testCase.")) {
      const [_, index, field] = name.split(".");
      const testCases = [...(question.content.testCases || [])];
      testCases[parseInt(index)] = {
        ...testCases[parseInt(index)],
        [field]: field === "points" ? parseInt(value) || 1 : value,
      };
      updateQuestion("content.testCases", testCases);
    } else if (name === "tags") {
      updateQuestion("tags", value.split(",").map((tag) => tag.trim()).filter(Boolean));
    } else if (name === "content.hints") {
      updateQuestion("content.hints", value.split("\n").filter((h) => h.trim()));
    } else {
      updateQuestion(name, value);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name.startsWith("testCase.")) {
      const [_, index, field] = name.split(".");
      const testCases = [...(question.content.testCases || [])];
      testCases[parseInt(index)] = {
        ...testCases[parseInt(index)],
        [field]: checked,
      };
      updateQuestion("content.testCases", testCases);
    } else {
      updateQuestion(name, checked);
    }
  };

  const handleTypeChange = (newType: Question["type"]) => {
    const updatedQuestion = { ...question, type: newType };

    // Reset content based on question type
    switch (newType) {
      case "multiple_choice":
        updatedQuestion.content = {
          ...question.content,
          options: ["", "", "", ""],
          correctAnswer: 0,
          shuffleOptions: true,
          correctBoolean: undefined,
          language: undefined,
          starterCode: undefined,
          brokenCode: undefined,
          bugHint: undefined,
          testCases: [],
          evaluationMode: "flexible",
          mustUse: undefined,
          cannotUse: undefined,
          maxLinesChanged: undefined,
          similarityThreshold: undefined,
          bonusPoints: undefined,
        };
        break;
      case "true_false":
        updatedQuestion.content = {
          ...question.content,
          correctBoolean: undefined,
          options: [],
          correctAnswer: undefined,
          language: undefined,
          starterCode: undefined,
          brokenCode: undefined,
          bugHint: undefined,
          testCases: [],
          evaluationMode: "flexible",
          mustUse: undefined,
          cannotUse: undefined,
          maxLinesChanged: undefined,
          similarityThreshold: undefined,
          bonusPoints: undefined,
        };
        break;
      case "code_challenge":
        updatedQuestion.content = {
          ...question.content,
          language: "javascript",
          starterCode: "",
          testCases: [],
          evaluationMode: "flexible",
          mustUse: [],
          cannotUse: [],
          correctBoolean: undefined,
          options: [],
          correctAnswer: undefined,
          brokenCode: undefined,
          bugHint: undefined,
          maxLinesChanged: undefined,
          similarityThreshold: undefined,
          bonusPoints: undefined,
        };
        break;
      case "debug_fix":
        updatedQuestion.content = {
          ...question.content,
          language: "javascript",
          brokenCode: "",
          bugHint: "",
          testCases: [],
          evaluationMode: "flexible",
          maxLinesChanged: 3,
          similarityThreshold: 0.8,
          correctBoolean: undefined,
          options: [],
          correctAnswer: undefined,
          starterCode: undefined,
          mustUse: [],
          cannotUse: [],
          bonusPoints: undefined,
        };
        break;
    }

    onQuestionChange(updatedQuestion);
  };

  const addOption = () => {
    const newOptions = [...(question.content.options || []), ""];
    updateQuestion("content.options", newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = (question.content.options || []).filter((_, i) => i !== index);
    const newCorrectAnswer =
      question.content.correctAnswer !== undefined && question.content.correctAnswer >= index
        ? Math.max(0, question.content.correctAnswer - 1)
        : question.content.correctAnswer;

    updateQuestion("content.options", newOptions);
    if (newOptions.length > 0) {
      updateQuestion("content.correctAnswer", newCorrectAnswer);
    }
  };

  const addTestCase = () => {
    const newTestCases = [
      ...(question.content.testCases || []),
      {
        description: "",
        functionCall: "",
        expected: "",
        points: 1,
        hidden: false,
        shouldFail: false,
        brokenResult: "",
      },
    ];
    updateQuestion("content.testCases", newTestCases);
  };

  const removeTestCase = (index: number) => {
    const newTestCases = (question.content.testCases || []).filter((_, i) => i !== index);
    updateQuestion("content.testCases", newTestCases);
  };

  const handleEvaluationMode = (mode: Question["content"]["evaluationMode"]) => {
    updateQuestion("content.evaluationMode", mode);
  };

  const calculateComplexity = () => {
    const { type, content } = question;
    let complexity = 15; // Default: Very Simple
    if (type === "true_false" || type === "multiple_choice") {
      complexity = content.codeSnippet ? 25 : 15;
    } else if (type === "debug_fix") {
      complexity = content.evaluationMode === "minimal_fix" ? 65 : 45;
    } else if (type === "code_challenge") {
      complexity = content.evaluationMode === "flexible" ? 40 : 80;
    }
    return {
      value: complexity,
      label:
        complexity <= 25 ? "Very Simple" :
        complexity <= 50 ? "Simple" :
        complexity <= 75 ? "Medium" : "Complex",
      color:
        complexity <= 25 ? "success" :
        complexity <= 50 ? "warning" :
        complexity <= 75 ? "warning" : "danger",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(question);
    } finally {
      setIsSubmitting(false);
    }
  };

  const complexity = calculateComplexity();
  const allErrors = [...validationErrors];

  return (
    <div className="position-relative">
      {showComplexityIndicator && !compact && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 10,
          }}
        >
          <h4 className="mb-2" style={{ fontSize: "13px", color: "#374151" }}>
            Complexity
          </h4>
          <Progress value={complexity.value} color={complexity.color} style={{ width: "100px", height: "4px" }} />
          <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
            {complexity.label}
          </div>
        </div>
      )}

      {allErrors.length > 0 && (
        <Alert color="danger" className="mb-3">
          {allErrors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Row className={compact ? "mb-2" : "mb-3"}>
          <Col md={compact ? "12" : "6"}>
            <FormGroup>
              <Label for="title">Question Title *</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={question.title}
                onChange={handleInputChange}
                placeholder="e.g., JavaScript Variable Hoisting"
                bsSize={compact ? "sm" : undefined}
              />
            </FormGroup>
          </Col>
          {!compact && (
            <Col md="6">
              <FormGroup>
                <Label for="type">Question Type *</Label>
                <Input
                  type="select"
                  id="type"
                  name="type"
                  value={question.type}
                  onChange={(e) => handleTypeChange(e.target.value as Question["type"])}
                >
                  <option value="">Select type</option>
                  <option value="true_false">True/False</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="code_challenge">Code Challenge</option>
                  <option value="debug_fix">Debug & Fix</option>
                </Input>
              </FormGroup>
            </Col>
          )}
        </Row>

        {compact && (
          <Row className="mb-2">
            <Col md="6">
              <FormGroup>
                <Label for="type">Type *</Label>
                <Input
                  type="select"
                  id="type"
                  name="type"
                  value={question.type}
                  onChange={(e) => handleTypeChange(e.target.value as Question["type"])}
                  bsSize="sm"
                >
                  <option value="">Select type</option>
                  <option value="true_false">True/False</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="code_challenge">Code Challenge</option>
                  <option value="debug_fix">Debug & Fix</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label for="skill">Skill *</Label>
                <Input
                  type="select"
                  id="skill"
                  name="skill"
                  value={question.skill}
                  onChange={handleInputChange}
                  bsSize="sm"
                >
                  <option value="">Select skill</option>
                  {availableSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill.charAt(0).toUpperCase() + skill.slice(1).replace("-", " ")}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
          </Row>
        )}

        {!compact && (
          <Row className="mb-3">
            <Col md="4">
              <FormGroup>
                <Label for="skill">Subject *</Label>
                <Input
                  type="select"
                  id="skill"
                  name="skill"
                  value={question.skill}
                  onChange={handleInputChange}
                >
                  <option value="">Select skill</option>
                  {availableSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill.charAt(0).toUpperCase() + skill.slice(1).replace("-", " ")}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <Label for="difficulty">Difficulty *</Label>
                <Input
                  type="select"
                  id="difficulty"
                  name="difficulty"
                  value={question.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="">Select difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <Label for="points">Points</Label>
                <Input
                  type="number"
                  id="points"
                  name="points"
                  value={question.points}
                  onChange={handleInputChange}
                  min={1}
                />
              </FormGroup>
            </Col>
          </Row>
        )}

        <FormGroup className={compact ? "mb-2" : "mb-3"}>
          <Label for="description">Question Text *</Label>
          <Input
            type="textarea"
            id="description"
            name="description"
            value={question.description}
            onChange={handleInputChange}
            placeholder="e.g., What will be the output of the following code?"
            rows={compact ? 2 : 4}
            bsSize={compact ? "sm" : undefined}
          />
        </FormGroup>

        {/* Code Snippet (for true/false and multiple choice) */}
        <Collapse isOpen={["true_false", "multiple_choice"].includes(question.type)}>
          <FormGroup className={compact ? "mb-2" : "mb-3"}>
            <Label for="content.codeSnippet">Code Snippet (Optional)</Label>
            <Input
              type="textarea"
              id="content.codeSnippet"
              name="content.codeSnippet"
              value={question.content.codeSnippet || ""}
              onChange={handleInputChange}
              placeholder="Enter code snippet"
              rows={compact ? 3 : 6}
              style={{ fontFamily: "monospace", fontSize: "13px" }}
              bsSize={compact ? "sm" : undefined}
            />
            {!compact && (
              <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                Include code that the question refers to
              </div>
            )}
          </FormGroup>
        </Collapse>

        {/* True/False Section */}
        <Collapse isOpen={question.type === "true_false"}>
          <Card className="mb-3 border-0 shadow-sm">
            <CardBody>
              <CardTitle tag="h3" className={compact ? "h6 mb-2" : "h5 mb-3"}>
                True or False *
              </CardTitle>
              <FormGroup>
                <Button
                  type="button"
                  color={question.content.correctBoolean === true ? "success" : "outline-success"}
                  onClick={() => updateQuestion("content.correctBoolean", true)}
                  className="me-3"
                  size={compact ? "sm" : undefined}
                >
                  True
                </Button>
                <Button
                  type="button"
                  color={question.content.correctBoolean === false ? "danger" : "outline-danger"}
                  onClick={() => updateQuestion("content.correctBoolean", false)}
                  size={compact ? "sm" : undefined}
                >
                  False
                </Button>
              </FormGroup>
            </CardBody>
          </Card>
        </Collapse>

        {/* Multiple Choice Section */}
        <Collapse isOpen={question.type === "multiple_choice"}>
          <Card className="mb-3 border-0 shadow-sm">
            <CardBody>
              <CardTitle tag="h3" className={compact ? "h6 mb-2" : "h5 mb-3"}>
                Answer Options *
              </CardTitle>
              {(question.content.options || []).map((option, index) => (
                <FormGroup key={index} className="mb-2">
                  <div className="d-flex align-items-center mb-2">
                    <Input
                      type="radio"
                      name="correctAnswer"
                      value={index}
                      checked={question.content.correctAnswer === index}
                      onChange={() => updateQuestion("content.correctAnswer", index)}
                      className="me-2"
                    />
                    <Label className="mb-0 me-2">Option {String.fromCharCode(65 + index)}</Label>
                    {(question.content.options || []).length > 2 && (
                      <Button
                        type="button"
                        color="outline-danger"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                  <Input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.content.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestion("content.options", newOptions);
                    }}
                    placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                    style={{ marginLeft: "28px" }}
                    bsSize={compact ? "sm" : undefined}
                  />
                </FormGroup>
              ))}
              <Button
                type="button"
                color="success"
                size="sm"
                onClick={addOption}
                className="mt-2 me-2"
              >
                + Add Option
              </Button>
              {!compact && (
                <FormGroup className="mt-3">
                  <Label check>
                    <Input
                      type="checkbox"
                      name="content.shuffleOptions"
                      checked={question.content.shuffleOptions ?? true}
                      onChange={handleCheckboxChange}
                    />
                    Shuffle answer options for each student
                  </Label>
                </FormGroup>
              )}
            </CardBody>
          </Card>
        </Collapse>

        {/* Debug & Fix Section */}
        <Collapse isOpen={question.type === "debug_fix"}>
          <Card className="mb-3 border-0 shadow-sm">
            <CardBody>
              <CardTitle tag="h3" className={compact ? "h6 mb-2" : "h5 mb-3"}>
                Debug & Fix Setup
              </CardTitle>
              <FormGroup>
                <Label for="content.brokenCode">Broken Code *</Label>
                <Input
                  type="textarea"
                  id="content.brokenCode"
                  name="content.brokenCode"
                  value={question.content.brokenCode || ""}
                  onChange={handleInputChange}
                  placeholder="Enter broken code"
                  rows={compact ? 3 : 6}
                  style={{ fontFamily: "monospace", fontSize: "13px" }}
                  bsSize={compact ? "sm" : undefined}
                />
                {!compact && (
                  <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                    Provide code with intentional bugs for students to fix
                  </div>
                )}
              </FormGroup>
              <FormGroup>
                <Label for="content.bugHint">Bug Hint (Optional)</Label>
                <Input
                  type="text"
                  id="content.bugHint"
                  name="content.bugHint"
                  value={question.content.bugHint || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., This function doesn't work with negative numbers..."
                  bsSize={compact ? "sm" : undefined}
                />
              </FormGroup>
              <FormGroup>
                <Label for="content.language">Language *</Label>
                <Input
                  type="select"
                  id="content.language"
                  name="content.language"
                  value={question.content.language || ""}
                  onChange={handleInputChange}
                  bsSize={compact ? "sm" : undefined}
                >
                  <option value="">Select language</option>
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              {!compact && (
                <>
                  <FormGroup>
                    <Label>How should the fixed code be graded?</Label>
                    <div className="d-grid gap-2">
                      <Button
                        type="button"
                        color={question.content.evaluationMode === "flexible" ? "primary" : "outline-primary"}
                        onClick={() => handleEvaluationMode("flexible")}
                        className="mb-2"
                        size="sm"
                      >
                        Check Output Only
                      </Button>
                      <Button
                        type="button"
                        color={question.content.evaluationMode === "minimal_fix" ? "primary" : "outline-primary"}
                        onClick={() => handleEvaluationMode("minimal_fix")}
                        size="sm"
                      >
                        Minimal Fix Required
                      </Button>
                    </div>
                  </FormGroup>
                  <Collapse isOpen={question.content.evaluationMode === "minimal_fix"}>
                    <Card className="mt-3 bg-light border-0">
                      <CardBody>
                        <CardTitle tag="h4" className="h6 mb-3">
                          Minimal Fix Settings
                        </CardTitle>
                        <Row>
                          <Col md="6">
                            <FormGroup>
                              <Label for="content.maxLinesChanged">Max Lines Changed</Label>
                              <Input
                                type="number"
                                id="content.maxLinesChanged"
                                name="content.maxLinesChanged"
                                value={question.content.maxLinesChanged ?? ""}
                                onChange={handleInputChange}
                                placeholder="e.g., 3"
                                min={1}
                                bsSize="sm"
                              />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label for="content.similarityThreshold">Similarity Threshold</Label>
                              <Input
                                type="select"
                                id="content.similarityThreshold"
                                name="content.similarityThreshold"
                                value={question.content.similarityThreshold ?? ""}
                                onChange={handleInputChange}
                                bsSize="sm"
                              >
                                <option value="">Select threshold</option>
                                <option value="0.7">70% - Allow some changes</option>
                                <option value="0.8">80% - Minimal changes only</option>
                                <option value="0.9">90% - Very minimal changes</option>
                              </Input>
                            </FormGroup>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Collapse>
                </>
              )}
            </CardBody>
          </Card>
        </Collapse>

        {/* Code Challenge Section */}
        <Collapse isOpen={question.type === "code_challenge"}>
          <Card className="mb-3 border-0 shadow-sm">
            <CardBody>
              <CardTitle tag="h3" className={compact ? "h6 mb-2" : "h5 mb-3"}>
                Code Challenge Setup
              </CardTitle>
              <FormGroup>
                <Label for="content.starterCode">Starter Code (Optional)</Label>
                <Input
                  type="textarea"
                  id="content.starterCode"
                  name="content.starterCode"
                  value={question.content.starterCode || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., function filterArray(arr, callback) { ... }"
                  rows={compact ? 3 : 6}
                  style={{ fontFamily: "monospace", fontSize: "13px" }}
                  bsSize={compact ? "sm" : undefined}
                />
              </FormGroup>
              <FormGroup>
                <Label for="content.language">Language *</Label>
                <Input
                  type="select"
                  id="content.language"
                  name="content.language"
                  value={question.content.language || ""}
                  onChange={handleInputChange}
                  bsSize={compact ? "sm" : undefined}
                >
                  <option value="">Select language</option>
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              {!compact && (
                <>
                  <FormGroup>
                    <Label>How should this be graded?</Label>
                    <div className="d-grid gap-2">
                      <Button
                        type="button"
                        color={question.content.evaluationMode === "flexible" ? "primary" : "outline-primary"}
                        onClick={() => handleEvaluationMode("flexible")}
                        className="mb-2"
                        size="sm"
                      >
                        Flexible (Recommended)
                      </Button>
                      <Button
                        type="button"
                        color={question.content.evaluationMode === "strict" ? "primary" : "outline-primary"}
                        onClick={() => handleEvaluationMode("strict")}
                        size="sm"
                      >
                        Strict Requirements
                      </Button>
                    </div>
                  </FormGroup>
                  <Collapse isOpen={question.content.evaluationMode === "strict"}>
                    <Card className="mt-3 bg-light border-0">
                      <CardBody>
                        <CardTitle tag="h4" className="h6 mb-3">
                          Implementation Requirements
                        </CardTitle>
                        <Row>
                          <Col md="6">
                            <FormGroup>
                              <Label for="content.mustUse">Must Use</Label>
                              <Input
                                type="text"
                                id="content.mustUse"
                                name="content.mustUse"
                                value={question.content.mustUse?.join(", ") || ""}
                                onChange={(e) =>
                                  updateQuestion(
                                    "content.mustUse",
                                    e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                                  )
                                }
                                placeholder="e.g., for, callback"
                                bsSize="sm"
                              />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label for="content.cannotUse">Cannot Use</Label>
                              <Input
                                type="text"
                                id="content.cannotUse"
                                name="content.cannotUse"
                                value={question.content.cannotUse?.join(", ") || ""}
                                onChange={(e) =>
                                  updateQuestion(
                                    "content.cannotUse",
                                    e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                                  )
                                }
                                placeholder="e.g., map, filter"
                                bsSize="sm"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Collapse>
                </>
              )}
            </CardBody>
          </Card>
        </Collapse>

        {/* Test Cases (for coding questions) */}
        <Collapse isOpen={["code_challenge", "debug_fix"].includes(question.type)}>
          <Card className="mb-3 border-0 shadow-sm">
            <CardBody>
              <CardTitle tag="h3" className={compact ? "h6 mb-2" : "h5 mb-3"}>
                Test Cases
              </CardTitle>
              {!compact && (
                <div className="text-muted mb-3">
                  Add test cases to validate the student's code.
                </div>
              )}
              {(question.content.testCases || []).map((testCase, index) => (
                <Card key={index} className="mb-3 bg-light border-0">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className={compact ? "h6 mb-0" : "h6 mb-0"}>
                        Test Case {index + 1}
                      </div>
                      <Button
                        type="button"
                        color="danger"
                        size="sm"
                        onClick={() => removeTestCase(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    <Row>
                      <Col md={compact ? "12" : "6"}>
                        <FormGroup>
                          <Label for={`testCase.${index}.description`}>Description</Label>
                          <Input
                            type="text"
                            id={`testCase.${index}.description`}
                            name={`testCase.${index}.description`}
                            value={testCase.description || ""}
                            onChange={handleInputChange}
                            placeholder="e.g., Filter numbers greater than 2"
                            bsSize={compact ? "sm" : undefined}
                          />
                        </FormGroup>
                      </Col>
                      {!compact && (
                        <Col md="6">
                          <FormGroup>
                            <Label for={`testCase.${index}.points`}>Points</Label>
                            <Input
                              type="number"
                              id={`testCase.${index}.points`}
                              name={`testCase.${index}.points`}
                              value={testCase.points}
                              onChange={handleInputChange}
                              placeholder="e.g., 2"
                              min={1}
                            />
                          </FormGroup>
                        </Col>
                      )}
                    </Row>
                    <Row>
                      <Col md={compact ? "12" : "6"}>
                        <FormGroup>
                          <Label for={`testCase.${index}.functionCall`}>Function Call</Label>
                          <Input
                            type="text"
                            id={`testCase.${index}.functionCall`}
                            name={`testCase.${index}.functionCall`}
                            value={testCase.functionCall || ""}
                            onChange={handleInputChange}
                            placeholder="e.g., filterArray([1,2,3], x => x > 2)"
                            style={{ fontFamily: "monospace", fontSize: "13px" }}
                            bsSize={compact ? "sm" : undefined}
                          />
                        </FormGroup>
                      </Col>
                      <Col md={compact ? "12" : "6"}>
                        <FormGroup>
                          <Label for={`testCase.${index}.expected`}>Expected Result</Label>
                          <Input
                            type="text"
                            id={`testCase.${index}.expected`}
                            name={`testCase.${index}.expected`}
                            value={testCase.expected || ""}
                            onChange={handleInputChange}
                            placeholder="e.g., [3]"
                            style={{ fontFamily: "monospace", fontSize: "13px" }}
                            bsSize={compact ? "sm" : undefined}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    {question.type === "debug_fix" && !compact && (
                      <FormGroup>
                        <Label for={`testCase.${index}.brokenResult`}>Broken Code Result (Optional)</Label>
                        <Input
                          type="text"
                          id={`testCase.${index}.brokenResult`}
                          name={`testCase.${index}.brokenResult`}
                          value={testCase.brokenResult || ""}
                          onChange={handleInputChange}
                          placeholder="e.g., 0 (incorrect)"
                          style={{ fontFamily: "monospace", fontSize: "13px" }}
                        />
                        <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                          What the buggy code outputs
                        </div>
                      </FormGroup>
                    )}
                    {!compact && (
                      <>
                        <FormGroup check>
                          <Label check>
                            <Input
                              type="checkbox"
                              name={`testCase.${index}.hidden`}
                              checked={testCase.hidden}
                              onChange={handleCheckboxChange}
                            />
                            Hidden from student
                          </Label>
                        </FormGroup>
                        <FormGroup check>
                          <Label check>
                            <Input
                              type="checkbox"
                              name={`testCase.${index}.shouldFail`}
                              checked={testCase.shouldFail}
                              onChange={handleCheckboxChange}
                            />
                            Should fail in broken code
                          </Label>
                        </FormGroup>
                      </>
                    )}
                  </CardBody>
                </Card>
              ))}
              <Button
                type="button"
                color="success"
                size="sm"
                onClick={addTestCase}
              >
                + Add Test Case
              </Button>
            </CardBody>
          </Card>
        </Collapse>

        {/* Additional Settings */}
        {!compact && (
          <Card className="mb-3 border-0 shadow-sm">
            <CardBody>
              <CardTitle tag="h3" className="h5 mb-3 font-weight-bold">
                Additional Settings
              </CardTitle>
              <Row>
                <Col md="4">
                  <FormGroup>
                    <Label for="category">Category</Label>
                    <Input
                      type="text"
                      id="category"
                      name="category"
                      value={question.category}
                      onChange={handleInputChange}
                      placeholder="e.g., variables, routing"
                    />
                  </FormGroup>
                </Col>
                <Col md="4">
                  <FormGroup>
                    <Label for="timeEstimate">Time Estimate (seconds)</Label>
                    <Input
                      type="number"
                      id="timeEstimate"
                      name="timeEstimate"
                      value={question.timeEstimate}
                      onChange={handleInputChange}
                      placeholder="e.g., 60"
                      min={15}
                    />
                  </FormGroup>
                </Col>
                <Col md="4">
                  <FormGroup>
                    <Label for="weight">Weight</Label>
                    <Input
                      type="number"
                      id="weight"
                      name="weight"
                      value={question.weight}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0.1"
                      max="3.0"
                    />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <Label for="content.explanation">Explanation (Optional)</Label>
                <Input
                  type="textarea"
                  id="content.explanation"
                  name="content.explanation"
                  value={question.content.explanation || ""}
                  onChange={handleInputChange}
                  placeholder="Explain why the answer is correct..."
                  rows={4}
                />
                <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                  This explanation will be shown to students after they answer
                </div>
              </FormGroup>
              <FormGroup>
                <Label for="content.hints">Hints (Optional, one per line)</Label>
                <Input
                  type="textarea"
                  id="content.hints"
                  name="content.hints"
                  value={question.content.hints?.join("\n") || ""}
                  onChange={handleInputChange}
                  placeholder="Enter hints, one per line"
                  rows={4}
                />
                <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                  Progressive hints for students
                </div>
              </FormGroup>
              <FormGroup>
                <Label for="tags">Tags (comma-separated)</Label>
                <Input
                  type="text"
                  id="tags"
                  name="tags"
                  value={question.tags.join(", ")}
                  onChange={handleInputChange}
                  placeholder="e.g., routing, express"
                />
              </FormGroup>
            </CardBody>
          </Card>
        )}

        {compact && (
          <>
            <FormGroup className="mb-2">
              <Label for="content.explanation">Explanation (Optional)</Label>
              <Input
                type="textarea"
                id="content.explanation"
                name="content.explanation"
                value={question.content.explanation || ""}
                onChange={handleInputChange}
                placeholder="Explain the correct answer"
                rows={2}
                bsSize="sm"
              />
            </FormGroup>
            <FormGroup className="mb-2">
              <Label for="tags">Tags</Label>
              <Input
                type="text"
                id="tags"
                name="tags"
                value={question.tags.join(", ")}
                onChange={handleInputChange}
                placeholder="e.g., routing, express"
                bsSize="sm"
              />
            </FormGroup>
          </>
        )}

        {/* Submit Button */}
        {showSubmitButton && (
          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <Button
              type="submit"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
            {onCancel && (
              <Button
                type="button"
                color="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </Form>
    </div>
  );
};

export default QuestionFormComponent;