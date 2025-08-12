import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardBody,
  CardTitle,
  CardText,
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
} from "reactstrap";

import type { Question } from "../types/questions";

const AddQuestionPage: React.FC = () => {
  const { client } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Question>({
    title: "",
    description: "",
    type: "",
    skill: "",
    category: "",
    difficulty: "",
    points: 2,
    timeEstimate: 60,
    weight: 1,
    tags: [],
    status: "",
    createdBy: { profile: { firstName: "", lastName: "" }, _id: "", email: "" },
    createdByRole: "",
    content: {
      explanation: "",
      correctBoolean: undefined,
      options: [],
      correctAnswer: undefined,
      language: "",
      codeSnippet: "",
      brokenCode: "",
      bugHint: "",
      starterCode: "",
      testCases: [],
      evaluationMode: "flexible",
      mustUse: [],
      cannotUse: [],
      maxLinesChanged: undefined,
      similarityThreshold: undefined,
      bonusMethod: "",
      bonusPoints: 0,
      hints: [],
      timeLimit: 5000,
      memoryLimit: 128,
    },
    usageStats: {
      timesUsed: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      successRate: 0,
      averageTime: 0,
      optionStats: [],
    },
    prerequisites: [],
    followUp: [],
    variants: [],
    mutuallyExclusive: [],
    version: 1,
    lastModified: "",
    _id: "",
    createdAt: "",
    updatedAt: "",
    __v: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("content.")) {
      const contentKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        content: { ...prev.content, [contentKey]: value },
      }));
    } else if (name.startsWith("testCase.")) {
      const [_, index, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          testCases: prev.content.testCases!.map((tc, i) =>
            i === parseInt(index) ? { ...tc, [field]: field === "points" ? parseInt(value) : value } : tc
          ),
        },
      }));
    } else if (name === "tags") {
      setFormData((prev) => ({ ...prev, tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) }));
    } else if (name === "content.hints") {
      setFormData((prev) => ({ ...prev, content: { ...prev.content, hints: value.split("\n").filter((h) => h.trim()) } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name.startsWith("testCase.")) {
      const [_, index, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          testCases: prev.content.testCases!.map((tc, i) =>
            i === parseInt(index) ? { ...tc, [field]: checked } : tc
          ),
        },
      }));
    } else if (name === "content.shuffleOptions") {
      setFormData((prev) => ({
        ...prev,
        content: { ...prev.content, shuffleOptions: checked },
      }));
    }
  };

  const addTestCase = () => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        testCases: [
          ...(prev.content.testCases || []),
          {
            description: "",
            functionCall: "",
            expected: "",
            points: 1,
            hidden: false,
            shouldFail: false,
            brokenResult: "",
          },
        ],
      },
    }));
  };

  const removeTestCase = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        testCases: (prev.content.testCases || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleEvaluationMode = (mode: string) => {
    setFormData((prev) => ({
      ...prev,
      content: { ...prev.content, evaluationMode: mode },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    console.log('fired')
    if (!formData.title || !formData.description || !formData.type || !formData.skill) {
      setError("Title, description, type, and skill are required.");
      return;
    }

    try {
      const questionData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        skill: formData.skill,
        category: formData.category,
        difficulty: formData.difficulty,
        points: parseInt(formData.points.toString()),
        timeEstimate: parseInt(formData.timeEstimate.toString()),
        weight: parseFloat(formData.weight.toString()),
        tags: formData.tags,
        content: {
          codeSnippet: ["true_false", "multiple_choice"].includes(formData.type) ? formData.content.codeSnippet : undefined,
          explanation: formData.content.explanation,
          hints: formData.content.hints,
          correctBoolean: formData.type === "true_false" ? formData.content.correctBoolean : undefined,
          options: formData.type === "multiple_choice" ? formData.content.options : undefined,
          correctAnswer: formData.type === "multiple_choice" ? formData.content.correctAnswer : undefined,
          shuffleOptions: formData.type === "multiple_choice" ? formData.content.shuffleOptions : undefined,
          language: ["code_challenge", "debug_fix"].includes(formData.type) ? formData.content.language : undefined,
          starterCode: formData.type === "code_challenge" ? formData.content.starterCode : undefined,
          brokenCode: formData.type === "debug_fix" ? formData.content.brokenCode : undefined,
          bugHint: formData.type === "debug_fix" ? formData.content.bugHint : undefined,
          testCases: ["code_challenge", "debug_fix"].includes(formData.type) ? formData.content.testCases : undefined,
          evaluationMode: ["code_challenge", "debug_fix"].includes(formData.type) ? formData.content.evaluationMode : undefined,
          mustUse: formData.content.evaluationMode === "strict" ? formData.content.mustUse : undefined,
          cannotUse: formData.content.evaluationMode === "strict" ? formData.content.cannotUse : undefined,
          maxLinesChanged: formData.content.evaluationMode === "minimal_fix" ? formData.content.maxLinesChanged : undefined,
          similarityThreshold: formData.content.evaluationMode === "minimal_fix" ? formData.content.similarityThreshold : undefined,
          bonusMethod: formData.content.evaluationMode === "bonus" ? formData.content.bonusMethod : undefined,
          bonusPoints: formData.content.evaluationMode === "bonus" ? formData.content.bonusPoints : undefined,
          timeLimit: formData.content.timeLimit,
          memoryLimit: formData.content.memoryLimit,
        },
      };

      const res = await client.post("/questions", questionData);
      setSuccess(res.data.message);
      setTimeout(() => navigate("/admin/question-bank"), 2000);
    } catch (err) {
      setError("Failed to create question. Please try again.");
      console.error("Create question error:", err);
    }
  };

  const calculateComplexity = () => {
    const { type, content } = formData;
    let complexity = 15; // Default: Very Simple
    if (type === "true_false" || type === "multiple_choice") {
      complexity = content.codeSnippet ? 25 : 15;
    } else if (type === "debug_fix") {
      complexity = content.evaluationMode === "minimal_fix" ? 65 : 45;
    } else if (type === "code_challenge") {
      complexity =
        content.evaluationMode === "flexible" ? 40 :
        content.evaluationMode === "bonus" ? 60 : 80;
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

  const complexity = calculateComplexity();

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm position-relative">
        <CardBody>
          <CardTitle tag="h1" className="h2 mb-4 font-weight-bold">
            Create New Question
          </CardTitle>
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
          {error && <Alert color="danger">{error}</Alert>}
          {success && <Alert color="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="title">Question Title</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., JavaScript Variable Hoisting"
              />
            </FormGroup>
            <Row>
              <Col md="4">
                <FormGroup>
                  <Label for="type">Question Type</Label>
                  <Input
                    type="select"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFormData((prev) => ({
                        ...prev,
                        content: { ...prev.content, evaluationMode: "flexible" },
                      }));
                    }}
                  >
                    <option value="">Select type</option>
                    <option value="true_false">True/False</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="code_challenge">Code Challenge</option>
                    <option value="debug_fix">Debug & Fix</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label for="skill">Subject</Label>
                  <Input
                    type="select"
                    id="skill"
                    name="skill"
                    value={formData.skill}
                    onChange={handleInputChange}
                  >
                    <option value="">Select skill</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="javascript">JavaScript</option>
                    <option value="react">React</option>
                    <option value="flutter">Flutter</option>
                    <option value="react_native">React Native</option>
                    <option value="backend">Backend</option>
                    <option value="python">Python</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label for="difficulty">Difficulty</Label>
                  <Input
                    type="select"
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                  >
                    <option value="">Select difficulty</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label for="description">Question Text</Label>
              <Input
                type="textarea"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., What will be the output of the following code?"
                rows={4}
              />
            </FormGroup>
            <Collapse isOpen={["true_false", "multiple_choice"].includes(formData.type)}>
              <FormGroup>
                <Label for="content.codeSnippet">Code Snippet (Optional)</Label>
                <Input
                  type="textarea"
                  id="content.codeSnippet"
                  name="content.codeSnippet"
                  value={formData.content.codeSnippet}
                  onChange={handleInputChange}
                  placeholder="Enter code snippet"
                  rows={6}
                  style={{ fontFamily: "monospace", fontSize: "13px" }}
                />
                <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                  Include code that the question refers to
                </div>
              </FormGroup>
            </Collapse>
            <Collapse isOpen={formData.type === "true_false"}>
              <Card className="mb-3 border-0 shadow-sm">
                <CardBody>
                  <CardTitle tag="h3" className="h5 mb-3 font-weight-bold">
                    True or False
                  </CardTitle>
                  <FormGroup>
                    <Button
                      color={formData.content.correctBoolean === true ? "primary" : "outline-primary"}
                      onClick={() => setFormData((prev) => ({ ...prev, content: { ...prev.content, correctBoolean: true } }))}
                      className="mr-2"
                    >
                      True
                    </Button>
                    <Button
                      color={formData.content.correctBoolean === false ? "primary" : "outline-primary"}
                      onClick={() => setFormData((prev) => ({ ...prev, content: { ...prev.content, correctBoolean: false } }))}
                    >
                      False
                    </Button>
                  </FormGroup>
                </CardBody>
              </Card>
            </Collapse>
            <Collapse isOpen={formData.type === "multiple_choice"}>
              <Card className="mb-3 border-0 shadow-sm">
                <CardBody>
                  <CardTitle tag="h3" className="h5 mb-3 font-weight-bold">
                    Answer Options
                  </CardTitle>
                  {formData.content.options!.map((option, index) => (
                    <FormGroup key={index} className="mb-2">
                      <div className="d-flex align-items-center mb-2">
                        <Input
                          type="radio"
                          name="correctAnswer"
                          value={index}
                          checked={formData.content.correctAnswer === index}
                          onChange={() => setFormData((prev) => ({ ...prev, content: { ...prev.content, correctAnswer: index } }))}
                          className="mr-2"
                        />
                        <Label className="mb-0">Option {String.fromCharCode(65 + index)}</Label>
                      </div>
                      <Input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.content.options!];
                          newOptions[index] = e.target.value;
                          setFormData((prev) => ({ ...prev, content: { ...prev.content, options: newOptions } }));
                        }}
                        placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                        style={{ marginLeft: "28px" }}
                      />
                    </FormGroup>
                  ))}
                  <Button
                    color="success"
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, content: { ...prev.content, options: [...prev.content.options!, ""] } }))}
                    className="mt-2"
                  >
                    + Add Another Option
                  </Button>
                  <FormGroup className="mt-3">
                    <Label check>
                      <Input
                        type="checkbox"
                        name="content.shuffleOptions"
                        checked={formData.content.shuffleOptions ?? true}
                        onChange={handleCheckboxChange}
                      />
                      Shuffle answer options for each student
                    </Label>
                  </FormGroup>
                </CardBody>
              </Card>
            </Collapse>
            <Collapse isOpen={formData.type === "debug_fix"}>
              <Card className="mb-3 border-0 shadow-sm">
                <CardBody>
                  <CardTitle tag="h3" className="h5 mb-3 font-weight-bold">
                    Debug & Fix Setup
                  </CardTitle>
                  <FormGroup>
                    <Label for="content.brokenCode">Broken Code</Label>
                    <Input
                      type="textarea"
                      id="content.brokenCode"
                      name="content.brokenCode"
                      value={formData.content.brokenCode}
                      onChange={handleInputChange}
                      placeholder="Enter broken code"
                      rows={6}
                      style={{ fontFamily: "monospace", fontSize: "13px" }}
                    />
                    <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                      Provide code with intentional bugs for students to fix
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label for="content.bugHint">What's wrong? (Optional hint)</Label>
                    <Input
                      type="text"
                      id="content.bugHint"
                      name="content.bugHint"
                      value={formData.content.bugHint}
                      onChange={handleInputChange}
                      placeholder="e.g., This function doesn't work with negative numbers..."
                    />
                    <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                      Give students a hint about what to look for
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label for="content.language">Language</Label>
                    <Input
                      type="select"
                      id="content.language"
                      name="content.language"
                      value={formData.content.language}
                      onChange={handleInputChange}
                    >
                      <option value="">Select language</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label>How should the fixed code be graded?</Label>
                    <div className="d-grid gap-2">
                      <Button
                        color={formData.content.evaluationMode === "flexible" ? "primary" : "outline-primary"}
                        onClick={() => handleEvaluationMode("flexible")}
                        className="mb-2"
                      >
                        Check Output Only
                      </Button>
                      <Button
                        color={formData.content.evaluationMode === "minimal_fix" ? "primary" : "outline-primary"}
                        onClick={() => handleEvaluationMode("minimal_fix")}
                      >
                        Minimal Fix Required
                      </Button>
                    </div>
                  </FormGroup>
                  <Collapse isOpen={formData.content.evaluationMode === "minimal_fix"}>
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
                                value={formData.content.maxLinesChanged ?? ""}
                                onChange={handleInputChange}
                                placeholder="e.g., 3"
                                min={1}
                              />
                              <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                                Maximum lines student can modify
                              </div>
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label for="content.similarityThreshold">Similarity Threshold</Label>
                              <Input
                                type="select"
                                id="content.similarityThreshold"
                                name="content.similarityThreshold"
                                value={formData.content.similarityThreshold ?? ""}
                                onChange={handleInputChange}
                              >
                                <option value="">Select threshold</option>
                                <option value="0.7">70% - Allow some changes</option>
                                <option value="0.8">80% - Minimal changes only</option>
                                <option value="0.9">90% - Very minimal changes</option>
                              </Input>
                              <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                                How similar to original code
                              </div>
                            </FormGroup>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Collapse>
                </CardBody>
              </Card>
            </Collapse>
            <Collapse isOpen={formData.type === "code_challenge"}>
              <Card className="mb-3 border-0 shadow-sm">
                <CardBody>
                  <CardTitle tag="h3" className="h5 mb-3 font-weight-bold">
                    Code Challenge Setup
                  </CardTitle>
                  <FormGroup>
                    <Label for="content.starterCode">Starter Code (Optional)</Label>
                    <Input
                      type="textarea"
                      id="content.starterCode"
                      name="content.starterCode"
                      value={formData.content.starterCode}
                      onChange={handleInputChange}
                      placeholder="e.g., function filterArray(arr, callback) { ... }"
                      rows={6}
                      style={{ fontFamily: "monospace", fontSize: "13px" }}
                    />
                    <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                      This code will be pre-filled in the student's editor
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label for="content.language">Language</Label>
                    <Input
                      type="select"
                      id="content.language"
                      name="content.language"
                      value={formData.content.language}
                      onChange={handleInputChange}
                    >
                      <option value="">Select language</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label>How should this be graded?</Label>
                    <div className="d-grid gap-2">
                      <Button
                        color={formData.content.evaluationMode === "flexible" ? "primary" : "outline-primary"}
                        onClick={() => handleEvaluationMode("flexible")}
                        className="mb-2"
                      >
                        Flexible (Recommended)
                      </Button>
                      <Button
                        color={formData.content.evaluationMode === "strict" ? "primary" : "outline-primary"}
                        onClick={() => handleEvaluationMode("strict")}
                        className="mb-2"
                      >
                        Strict Requirements
                      </Button>
                      <Button
                        color={formData.content.evaluationMode === "bonus" ? "primary" : "outline-primary"}
                        onClick={() => handleEvaluationMode("bonus")}
                      >
                        Bonus Points
                      </Button>
                    </div>
                  </FormGroup>
                  <Collapse isOpen={formData.content.evaluationMode === "strict"}>
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
                                value={formData.content.mustUse!.join(", ")}
                                onChange={(e) => setFormData((prev) => ({ ...prev, content: { ...prev.content, mustUse: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) } }))}
                                placeholder="e.g., for, callback"
                              />
                              <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                                Comma-separated list
                              </div>
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label for="content.cannotUse">Cannot Use</Label>
                              <Input
                                type="text"
                                id="content.cannotUse"
                                name="content.cannotUse"
                                value={formData.content.cannotUse!.join(", ")}
                                onChange={(e) => setFormData((prev) => ({ ...prev, content: { ...prev.content, cannotUse: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) } }))}
                                placeholder="e.g., map, filter"
                              />
                              <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                                Comma-separated list
                              </div>
                            </FormGroup>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Collapse>
                  <Collapse isOpen={formData.content.evaluationMode === "bonus"}>
                    <Card className="mt-3 bg-light border-0">
                      <CardBody>
                        <CardTitle tag="h4" className="h6 mb-3">
                          Bonus Requirements
                        </CardTitle>
                        <Row>
                          <Col md="6">
                            <FormGroup>
                              <Label for="content.bonusMethod">Preferred Method</Label>
                              <Input
                                type="text"
                                id="content.bonusMethod"
                                name="content.bonusMethod"
                                value={formData.content.bonusMethod}
                                onChange={handleInputChange}
                                placeholder="e.g., split, reverse, join"
                              />
                              <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                                Give bonus points for using these
                              </div>
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label for="content.bonusPoints">Bonus Points</Label>
                              <Input
                                type="number"
                                id="content.bonusPoints"
                                name="content.bonusPoints"
                                value={formData.content.bonusPoints ?? ""}
                                onChange={handleInputChange}
                                placeholder="e.g., 2"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Collapse>
                </CardBody>
              </Card>
            </Collapse>
            <Collapse isOpen={["code_challenge", "debug_fix"].includes(formData.type)}>
              <Card className="mb-3 border-0 shadow-sm">
                <CardBody>
                  <CardTitle tag="h3" className="h5 mb-3 font-weight-bold">
                    Test Cases
                  </CardTitle>
                  <CardText className="text-muted mb-3">
                    Add test cases to validate the student's code.
                  </CardText>
                  {formData.content.testCases!.map((testCase, index) => (
                    <Card key={index} className="mb-3 bg-light border-0">
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <CardTitle tag="h5" className="h6 mb-0">
                            Test Case {index + 1}
                          </CardTitle>
                          <Button color="danger" size="sm" onClick={() => removeTestCase(index)}>
                            Remove
                          </Button>
                        </div>
                        <Row>
                          <Col md="6">
                            <FormGroup>
                              <Label for={`testCase.${index}.description`}>Description</Label>
                              <Input
                                type="text"
                                id={`testCase.${index}.description`}
                                name={`testCase.${index}.description`}
                                value={testCase.description}
                                onChange={handleInputChange}
                                placeholder="e.g., Filter numbers greater than 2"
                              />
                            </FormGroup>
                          </Col>
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
                        </Row>
                        <Row>
                          <Col md="6">
                            <FormGroup>
                              <Label for={`testCase.${index}.functionCall`}>Function Call</Label>
                              <Input
                                type="text"
                                id={`testCase.${index}.functionCall`}
                                name={`testCase.${index}.functionCall`}
                                value={testCase.functionCall}
                                onChange={handleInputChange}
                                placeholder="e.g., filterArray([1,2,3], x => x > 2)"
                                style={{ fontFamily: "monospace", fontSize: "13px" }}
                              />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label for={`testCase.${index}.expected`}>Expected Result</Label>
                              <Input
                                type="text"
                                id={`testCase.${index}.expected`}
                                name={`testCase.${index}.expected`}
                                value={testCase.expected}
                                onChange={handleInputChange}
                                placeholder="e.g., [3]"
                                style={{ fontFamily: "monospace", fontSize: "13px" }}
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        {formData.type === "debug_fix" && (
                          <FormGroup>
                            <Label for={`testCase.${index}.brokenResult`}>Broken Code Result (Optional)</Label>
                            <Input
                              type="text"
                              id={`testCase.${index}.brokenResult`}
                              name={`testCase.${index}.brokenResult`}
                              value={testCase.brokenResult}
                              onChange={handleInputChange}
                              placeholder="e.g., 0 (incorrect)"
                              style={{ fontFamily: "monospace", fontSize: "13px" }}
                            />
                            <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                              What the buggy code outputs
                            </div>
                          </FormGroup>
                        )}
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
                      </CardBody>
                    </Card>
                  ))}
                  <Button color="success" size="sm" onClick={addTestCase}>
                    + Add Another Test Case
                  </Button>
                </CardBody>
              </Card>
            </Collapse>
            <Collapse isOpen={["true_false", "multiple_choice"].includes(formData.type)}>
              <Card className="mb-3 border-0 shadow-sm">
                <CardBody>
                  <CardTitle tag="h3" className="h5 mb-3 font-weight-bold">
                    Settings
                  </CardTitle>
                  <Row>
                    <Col md="4">
                      <FormGroup>
                        <Label for="points">Points</Label>
                        <Input
                          type="number"
                          id="points"
                          name="points"
                          value={formData.points}
                          onChange={handleInputChange}
                          placeholder="e.g., 2"
                          min={1}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <Label for="category">Category</Label>
                        <Input
                          type="text"
                          id="category"
                          name="category"
                          value={formData.category}
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
                          value={formData.timeEstimate}
                          onChange={handleInputChange}
                          placeholder="e.g., 60"
                          min={15}
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
                      value={formData.content.explanation}
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
                      value={formData.content.hints!.join("\n")}
                      onChange={handleInputChange}
                      placeholder="Enter hints, one per line"
                      rows={4}
                    />
                    <div className="text-muted mt-1" style={{ fontSize: "12px" }}>
                      Progressive hints for students
                    </div>
                  </FormGroup>
                </CardBody>
              </Card>
            </Collapse>
            <FormGroup>
              <Label for="tags">Tags (comma-separated)</Label>
              <Input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags.join(", ")}
                onChange={handleInputChange}
                placeholder="e.g., routing, express"
              />
            </FormGroup>
            <div className="d-flex justify-content-end gap-2">
              <Button type="submit" color="primary">
                Create Question
              </Button>
              <Button color="secondary" onClick={() => navigate("/admin/question-bank")}>
                Cancel
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AddQuestionPage;