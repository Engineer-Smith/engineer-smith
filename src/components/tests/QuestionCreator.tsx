// src/components/tests/QuestionCreator.tsx
import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  FormGroup,
  Label,
  Input,
  Alert,
  Badge,
  Collapse,
} from "reactstrap";
import QuestionFormComponent from "../QuestionFormComponent";
import type {
  Question,
  CreateTestData,
  SectionWithQuestions,
  User,
  QuestionFormComponentProps,
} from "../../types";

// Define available skills to match Question.skill union type
const availableSkills: Question["skill"][] = [
  "javascript",
  "react",
  "html",
  "css",
  "python",
  "flutter",
  "react-native", // Fixed from react_native
  "backend",
];

interface QuestionCreatorProps {
  newQuestions: Question[];
  setNewQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  testData: CreateTestData;
  setTestData: React.Dispatch<React.SetStateAction<CreateTestData>>;
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  user?: User | null;
}

// Helper to create a new question template
const createNewQuestion = (skillHint?: Question['skill']): Question => {
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const validSkill = skillHint && availableSkills.includes(skillHint) ? skillHint : "javascript";
  return {
    _id: tempId,
    title: "",
    description: "",
    type: "multiple_choice",
    skill: validSkill,
    category: "",
    difficulty: "intermediate",
    tags: [],
    points: 2,
    timeEstimate: 120,
    weight: 1,
    status: "pending_review",
    createdBy: "",
    createdByRole: "instructor",
    content: {
      options: ["", "", "", ""],
      correctAnswer: 0,
      shuffleOptions: true,
      hints: [],
      explanation: "",
      correctBoolean: undefined,
      language: undefined,
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
      bonusPoints: 0,
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
      testCaseStats: undefined,
    },
    prerequisites: [],
    followUp: [],
    variants: [],
    mutuallyExclusive: [],
    version: 1,
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  };
};

const QuestionCreator: React.FC<QuestionCreatorProps> = ({
  newQuestions,
  setNewQuestions,
  testData,
  setTestData,
  selectedSectionId,
  setSelectedSectionId,
}) => {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addNewQuestion = () => {
    const skillHint = testData.skills.length > 0 ? testData.skills[0] : undefined;
    const newQuestion = createNewQuestion(skillHint);
    setNewQuestions(prev => [...prev, newQuestion]);
    setExpandedQuestionId(newQuestion._id);
  };

  const removeNewQuestion = (questionId: string) => {
    setNewQuestions(prev => prev.filter(q => q._id !== questionId));
    if (expandedQuestionId === questionId) {
      setExpandedQuestionId(null);
    }
  };

  const updateNewQuestion = (questionId: string, updatedQuestion: Question) => {
    setNewQuestions(prev => prev.map(q => (q._id === questionId ? updatedQuestion : q)));
  };

  const assignQuestionToTest = (questionId: string) => {
    const question = newQuestions.find(q => q._id === questionId);
    if (!question) return;

    if (testData.settings.useSections) {
      if (!selectedSectionId) {
        setErrorMessage("Please select a section first");
        return;
      }

      setTestData(prev => ({
        ...prev,
        sections: prev.sections.map(section => {
          const sectionId = section.tempId || section._id;
          if (sectionId && sectionId === selectedSectionId) {
            const isAlreadyAssigned = section.questions.some(q => q.questionId === questionId);
            if (!isAlreadyAssigned) {
              return {
                ...section,
                questions: [
                  ...section.questions,
                  {
                    questionId,
                    points: question.points,
                    order: section.questions.length + 1,
                  },
                ],
              };
            }
          }
          return section;
        }),
      }));
    } else {
      const isAlreadyAssigned = testData.questions.some(q => q.questionId === questionId);
      if (!isAlreadyAssigned) {
        setTestData(prev => ({
          ...prev,
          questions: [...prev.questions, { questionId, points: question.points }],
        }));
      }
    }
  };

  const isQuestionValid = (question: Question): boolean => {
    if (!question.title.trim() || !question.description.trim() || !question.skill) {
      return false;
    }

    switch (question.type) {
      case "multiple_choice":
        return (
          !!question.content.options &&
          question.content.options.length >= 2 &&
          question.content.correctAnswer !== undefined &&
          question.content.options.every(opt => opt.trim())
        );
      case "true_false":
        return question.content.correctBoolean !== undefined;
      case "code_challenge":
      case "debug_fix":
        return !!question.content.language && !!question.content.testCases && question.content.testCases.length > 0;
      default:
        return false;
    }
  };

  const getValidationMessage = (question: Question): string => {
    if (!question.title.trim()) return "Title is required";
    if (!question.description.trim()) return "Description is required";
    if (!question.skill) return "Skill is required";

    switch (question.type) {
      case "multiple_choice":
        if (!question.content.options) return "Options are required";
        if (question.content.options.length < 2) return "At least 2 options required";
        if (question.content.correctAnswer === undefined) return "Select correct answer";
        if (question.content.options.some(opt => !opt.trim())) return "All options must be filled";
        break;
      case "true_false":
        if (question.content.correctBoolean === undefined) return "Select True or False";
        break;
      case "code_challenge":
      case "debug_fix":
        if (!question.content.language) return "Programming language required";
        if (!question.content.testCases || question.content.testCases.length === 0)
          return "At least one test case required";
        break;
    }

    return "";
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

        {errorMessage && (
          <Alert color="danger" className="mt-3">
            {errorMessage}
          </Alert>
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
            {newQuestions.map((question, index) => {
              const isValid = isQuestionValid(question);
              const validationMessage = getValidationMessage(question);
              const isExpanded = expandedQuestionId === question._id;

              return (
                <Card key={question._id} className="mb-3">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">
                          Question {index + 1}
                          {question.title && (
                            <span className="text-muted ms-2">- {question.title}</span>
                          )}
                        </h6>
                        <div className="d-flex gap-2 mb-2">
                          <Badge color={isValid ? "success" : "warning"}>
                            {isValid ? "Valid" : "Incomplete"}
                          </Badge>
                          <Badge color="info">{question.type.replace("_", " ")}</Badge>
                          {question.skill && <Badge color="secondary">{question.skill}</Badge>}
                        </div>
                        {!isValid && validationMessage && (
                          <Alert color="warning" className="mb-2 py-1 px-2 small">
                            {validationMessage}
                          </Alert>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          color="outline-info"
                          size="sm"
                          onClick={() => setExpandedQuestionId(isExpanded ? null : question._id)}
                        >
                          {isExpanded ? "Collapse" : "Edit"}
                        </Button>
                        {isValid && (
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => assignQuestionToTest(question._id)}
                          >
                            Assign
                          </Button>
                        )}
                        <Button
                          color="outline-danger"
                          size="sm"
                          onClick={() => removeNewQuestion(question._id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    <Collapse isOpen={isExpanded}>
                      <div className="border-top pt-3">
                        <QuestionFormComponent
                          question={question}
                          onQuestionChange={(updatedQuestion) =>
                            updateNewQuestion(question._id, updatedQuestion)
                          }
                          showSubmitButton={false}
                          showComplexityIndicator={false}
                          compact={true}
                          availableSkills={
                            testData.skills.length > 0 ? testData.skills : availableSkills
                          }
                          validationErrors={validationMessage ? [validationMessage] : []}
                        />
                      </div>
                    </Collapse>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCreator;