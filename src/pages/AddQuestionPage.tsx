// src/pages/AddQuestionPage.tsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Card, CardBody, CardTitle, Alert } from "reactstrap";
import QuestionFormComponent from "../components/QuestionFormComponent";
import type { Question } from "../types";

interface CreateQuestionResponse {
  message: string;
  question?: Question;
}

// Helper to create empty question template
const createEmptyQuestion = (userId: string, userRole: "admin" | "instructor"): Question => ({
  _id: "",
  title: "",
  description: "",
  type: "multiple_choice",
  skill: "javascript",
  category: "",
  difficulty: "intermediate",
  points: 2,
  timeEstimate: 60,
  weight: 1,
  tags: [],
  status: "draft",
  createdBy: userId,
  createdByRole: userRole,
  content: {
    explanation: "",
    correctBoolean: undefined,
    options: [],
    correctAnswer: undefined,
    language: undefined,
    codeSnippet: undefined,
    brokenCode: undefined,
    bugHint: undefined,
    starterCode: undefined,
    testCases: [],
    evaluationMode: "flexible",
    mustUse: [],
    cannotUse: [],
    maxLinesChanged: undefined,
    similarityThreshold: undefined,
    bonusPoints: undefined,
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
  createdAt: "",
  updatedAt: "",
  __v: 0,
});

const AddQuestionPage: React.FC = () => {
  const { client, user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question>(
    createEmptyQuestion(user?._id || "", user?.role === "admin" || user?.role === "instructor" ? user.role : "instructor"),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validation function
  const validateQuestion = (q: Question): string[] => {
    const errors: string[] = [];

    if (!q.title.trim()) errors.push("Title is required");
    if (!q.description.trim()) errors.push("Description is required");
    if (!q.type) errors.push("Question type is required");
    if (!q.skill) errors.push("Subject/skill is required");
    if (!q.difficulty) errors.push("Difficulty is required");

    // Type-specific validation
    switch (q.type) {
      case "multiple_choice":
        if (!q.content.options || q.content.options.length < 2) {
          errors.push("Multiple choice questions must have at least 2 options");
        }
        if (q.content.correctAnswer === undefined) {
          errors.push("Please select the correct answer for the multiple choice question");
        }
        if (q.content.options?.some((opt) => !opt.trim())) {
          errors.push("All answer options must be filled in");
        }
        break;

      case "true_false":
        if (q.content.correctBoolean === undefined) {
          errors.push("Please select True or False as the correct answer");
        }
        break;

      case "code_challenge":
      case "debug_fix":
        if (!q.content.language) {
          errors.push("Programming language is required for coding questions");
        }
        if (q.type === "debug_fix" && !q.content.brokenCode?.trim()) {
          errors.push("Broken code is required for debug & fix questions");
        }
        break;
    }

    return errors;
  };

  const handleQuestionChange = (updatedQuestion: Question) => {
    setQuestion(updatedQuestion);

    // Real-time validation
    const errors = validateQuestion(updatedQuestion);
    setValidationErrors(errors);

    // Clear success message when making changes
    if (success) setSuccess(null);
  };

  const handleSubmit = async (questionToSubmit: Question) => {
    setError(null);
    setSuccess(null);

    // Final validation
    const errors = validateQuestion(questionToSubmit);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setError("Please fix the validation errors above");
      return;
    }

    try {
      const questionData: Partial<Question> = {
        title: questionToSubmit.title,
        description: questionToSubmit.description,
        type: questionToSubmit.type,
        skill: questionToSubmit.skill,
        category: questionToSubmit.category,
        difficulty: questionToSubmit.difficulty,
        points: parseInt(questionToSubmit.points.toString()),
        timeEstimate: parseInt(questionToSubmit.timeEstimate.toString()),
        weight: parseFloat(questionToSubmit.weight.toString()),
        tags: questionToSubmit.tags,
        content: {
          codeSnippet: ["true_false", "multiple_choice"].includes(questionToSubmit.type)
            ? questionToSubmit.content.codeSnippet
            : undefined,
          explanation: questionToSubmit.content.explanation,
          hints: questionToSubmit.content.hints,
          correctBoolean: questionToSubmit.type === "true_false"
            ? questionToSubmit.content.correctBoolean
            : undefined,
          options: questionToSubmit.type === "multiple_choice"
            ? questionToSubmit.content.options
            : undefined,
          correctAnswer: questionToSubmit.type === "multiple_choice"
            ? questionToSubmit.content.correctAnswer
            : undefined,
          shuffleOptions: questionToSubmit.type === "multiple_choice"
            ? questionToSubmit.content.shuffleOptions
            : undefined,
          language: ["code_challenge", "debug_fix"].includes(questionToSubmit.type)
            ? questionToSubmit.content.language
            : undefined,
          starterCode: questionToSubmit.type === "code_challenge"
            ? questionToSubmit.content.starterCode
            : undefined,
          brokenCode: questionToSubmit.type === "debug_fix"
            ? questionToSubmit.content.brokenCode
            : undefined,
          bugHint: questionToSubmit.type === "debug_fix"
            ? questionToSubmit.content.bugHint
            : undefined,
          testCases: ["code_challenge", "debug_fix"].includes(questionToSubmit.type)
            ? questionToSubmit.content.testCases
            : undefined,
          evaluationMode: ["code_challenge", "debug_fix"].includes(questionToSubmit.type)
            ? questionToSubmit.content.evaluationMode
            : undefined,
          mustUse: questionToSubmit.content.evaluationMode === "strict"
            ? questionToSubmit.content.mustUse
            : undefined,
          cannotUse: questionToSubmit.content.evaluationMode === "strict"
            ? questionToSubmit.content.cannotUse
            : undefined,
          maxLinesChanged: questionToSubmit.content.evaluationMode === "minimal_fix"
            ? questionToSubmit.content.maxLinesChanged
            : undefined,
          similarityThreshold: questionToSubmit.content.evaluationMode === "minimal_fix"
            ? questionToSubmit.content.similarityThreshold
            : undefined,
          bonusPoints: questionToSubmit.content.evaluationMode === "minimal_fix"
            ? questionToSubmit.content.bonusPoints
            : undefined,
          timeLimit: questionToSubmit.content.timeLimit,
          memoryLimit: questionToSubmit.content.memoryLimit,
        },
      };

      const res = await client.post<CreateQuestionResponse>("/questions", questionData);
      setSuccess(res.data.message);
      setValidationErrors([]);

      // Navigate back after a short delay
      setTimeout(() => navigate("/admin/question-bank"), 2000);
    } catch (err: any) {
      console.error("Create question error:", err);
      const errorMessage = err.response?.data?.error || "Failed to create question. Please try again.";
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate("/admin/question-bank");
  };

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm">
        <CardBody>
          <CardTitle tag="h1" className="h2 mb-4 font-weight-bold">
            Create New Question
          </CardTitle>

          {error && (
            <Alert color="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {success && (
            <Alert color="success" className="mb-4">
              {success}
            </Alert>
          )}

          <QuestionFormComponent
            question={question}
            onQuestionChange={handleQuestionChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Question"
            showSubmitButton={true}
            showComplexityIndicator={true}
            availableSkills={["html", "css", "javascript", "react", "react-native", "flutter", "backend"]}
            compact={false}
            validationErrors={validationErrors}
          />
        </CardBody>
      </Card>
    </Container>
  );
};

export default AddQuestionPage;