// src/components/tests/TestQuestions.tsx
import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Table,
  Badge,
  Button,
  Row,
  Col,
  Alert,
  Input,
  FormGroup,
  Label,
  Pagination,
  PaginationItem,
  PaginationLink,
  UncontrolledTooltip,
} from "reactstrap";
import type { Test, Question } from "../../types";

interface TestQuestionsProps {
  test: Test;
  onTestUpdate: (test: Test) => void;
}

const TestQuestions: React.FC<TestQuestionsProps> = ({ test, onTestUpdate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<Question["type"] | "">("");
  const [filterSkill, setFilterSkill] = useState<Question["skill"] | "">("");
  const [sortBy, setSortBy] = useState<"order" | "title" | "type" | "difficulty" | "points">("order");

  const questionsPerPage = 10;

  const getQuestionTypeColor = (type: Question["type"]) => {
    const colors: Record<Question["type"], string> = {
      multiple_choice: "primary",
      true_false: "success",
      code_challenge: "warning",
      debug_fix: "danger",
    };
    return colors[type] || "secondary";
  };

  const getQuestionTypeIcon = (type: Question["type"]) => {
    const icons: Record<Question["type"], string> = {
      multiple_choice: "📝",
      true_false: "✅",
      code_challenge: "💻",
      debug_fix: "🐛",
    };
    return icons[type] || "❓";
  };

  const getDifficultyColor = (difficulty: Question["difficulty"]) => {
    const colors: Record<Question["difficulty"], string> = {
      beginner: "success",
      intermediate: "warning",
      advanced: "danger",
    };
    return colors[difficulty] || "secondary";
  };

  // Handle both regular questions and question pool
  const getQuestions = () => {
    if (test.questionPool?.enabled && test.questionPool.availableQuestions) {
      return test.questionPool.availableQuestions.map((q) => ({
        ...q,
        question: typeof q.questionId === "string" ? undefined : q.questionId,
      }));
    }
    return (test.questions || []).map((q) => ({
      ...q,
      question: typeof q.questionId === "string" ? undefined : q.questionId,
    }));
  };

  interface QuestionItem {
    questionId: string | Question;
    points: number;
    order?: number;
    weight?: number;
    question?: Question;
  }

  const questions: QuestionItem[] = getQuestions();

  // Filter questions (only include items with populated Question)
  const filteredQuestions = questions.filter((q): q is QuestionItem & { question: Question } => {
    const question = q.question;
    if (!question) return false;

    const typeMatch = !filterType || question.type === filterType;
    const skillMatch = !filterSkill || question.skill === filterSkill;

    return typeMatch && skillMatch;
  });

  // Sort questions
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    const questionA = a.question;
    const questionB = b.question;

    switch (sortBy) {
      case "title":
        return (questionA.title || "").localeCompare(questionB.title || "");
      case "type":
        return (questionA.type || "").localeCompare(questionB.type || "");
      case "difficulty":
        const diffOrder: Record<Question["difficulty"], number> = {
          beginner: 1,
          intermediate: 2,
          advanced: 3,
        };
        return (diffOrder[questionA.difficulty] || 0) - (diffOrder[questionB.difficulty] || 0);
      case "points":
        return (b.points || 0) - (a.points || 0);
      default: // order
        return (a.order || 0) - (b.order || 0);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const paginatedQuestions = sortedQuestions.slice(startIndex, startIndex + questionsPerPage);

  const getTotalPoints = () => {
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  };

  const getTypeDistribution = () => {
    const distribution: Record<string, number> = {};
    questions.forEach((q) => {
      const question = q.question;
      if (question) {
        const type = question.type || "unknown";
        distribution[type] = (distribution[type] || 0) + 1;
      }
    });
    return distribution;
  };

  if (questions.length === 0 || filteredQuestions.length === 0) {
    return (
      <Card className="mb-4">
        <CardBody>
          <CardTitle tag="h5" className="d-flex align-items-center">
            ❓ Test Questions
          </CardTitle>
          <Alert color="info">
            <h6>No Questions Assigned</h6>
            <p className="mb-0">
              This test doesn't have any questions assigned yet.
              {test.questionPool?.enabled
                ? " The question pool is enabled but no questions are available."
                : " Add questions to this test to get started."}
            </p>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  const typeDistribution = getTypeDistribution();

  return (
    <Card className="mb-4">
      <CardBody>
        <CardTitle tag="h5" className="d-flex align-items-center justify-content-between">
          <span>❓ Test Questions</span>
          <div>
            <Badge color="info" pill className="me-2">
              {filteredQuestions.length} questions
            </Badge>
            <Badge color="success" pill>
              {getTotalPoints()} total points
            </Badge>
          </div>
        </CardTitle>

        {/* Question Pool Notice */}
        {test.questionPool?.enabled && (
          <Alert color="info" className="mb-3">
            <strong>Question Pool Active:</strong> This test uses a question pool.
            Students will receive {test.questionPool.totalQuestions || 0} randomly selected questions
            from the {test.questionPool.availableQuestions?.length || 0} available questions below.
          </Alert>
        )}

        {/* Question Type Distribution */}
        <div className="mb-3">
          <h6>Question Distribution</h6>
          <Row>
            {Object.entries(typeDistribution).map(([type, count]) => (
              <Col key={type} xs="auto" className="mb-2">
                <Badge
                  color={getQuestionTypeColor(type as Question["type"])}
                  className="d-flex align-items-center p-2"
                >
                  <span className="me-2">{getQuestionTypeIcon(type as Question["type"])}</span>
                  <div>
                    <div style={{ fontSize: "0.9rem" }}>{type.replace("_", " ")}</div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>{count} questions</div>
                  </div>
                </Badge>
              </Col>
            ))}
          </Row>
        </div>

        {/* Filters and Sorting */}
        <Row className="mb-3">
          <Col md="3">
            <FormGroup>
              <Label for="filterType" size="sm">
                Filter by Type
              </Label>
              <Input
                type="select"
                id="filterType"
                bsSize="sm" // Changed from size to bsSize
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as Question["type"] | "")}
              >
                <option value="">All Types</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
                <option value="code_challenge">Code Challenge</option>
                <option value="debug_fix">Debug Fix</option>
              </Input>
            </FormGroup>
          </Col>

          <Col md="3">
            <FormGroup>
              <Label for="filterSkill" size="sm">
                Filter by Skill
              </Label>
              <Input
                type="select"
                id="filterSkill"
                bsSize="sm" // Changed from size to bsSize
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value as Question["skill"] | "")}
              >
                <option value="">All Skills</option>
                {test.skills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>

          <Col md="3">
            <FormGroup>
              <Label for="sortBy" size="sm">
                Sort By
              </Label>
              <Input
                type="select"
                id="sortBy"
                bsSize="sm" // Changed from size to bsSize
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "order" | "title" | "type" | "difficulty" | "points")
                }
              >
                <option value="order">Order</option>
                <option value="title">Title</option>
                <option value="type">Type</option>
                <option value="difficulty">Difficulty</option>
                <option value="points">Points</option>
              </Input>
            </FormGroup>
          </Col>

          <Col md="3" className="d-flex align-items-end">
            <FormGroup className="w-100">
              <Button
                color="outline-secondary"
                size="sm"
                block
                onClick={() => {
                  setFilterType("");
                  setFilterSkill("");
                  setSortBy("order");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </FormGroup>
          </Col>
        </Row>

        {/* Questions Table */}
        <Table responsive hover>
          <thead>
            <tr>
              <th style={{ width: "5%" }}>#</th>
              <th style={{ width: "40%" }}>Question</th>
              <th style={{ width: "15%" }}>Type</th>
              <th style={{ width: "15%" }}>Skill</th>
              <th style={{ width: "10%" }}>Difficulty</th>
              <th style={{ width: "10%" }}>Points</th>
              <th style={{ width: "5%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedQuestions.map((questionItem, index) => {
              const question = questionItem.question;
              const globalIndex = startIndex + index + 1;

              return (
                <tr key={question._id || index}>
                  <td>
                    <Badge color="light">{globalIndex}</Badge>
                  </td>
                  <td>
                    <div>
                      <strong className="d-block mb-1">
                        {question.title || "Untitled Question"}
                      </strong>
                      {question.description && (
                        <small className="text-muted">
                          {question.description.length > 100
                            ? `${question.description.substring(0, 100)}...`
                            : question.description}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge color={getQuestionTypeColor(question.type)}>
                      {getQuestionTypeIcon(question.type)} {question.type.replace("_", " ")}
                    </Badge>
                  </td>
                  <td>
                    <Badge color="info" outline>
                      {question.skill}
                    </Badge>
                  </td>
                  <td>
                    <Badge color={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                  </td>
                  <td>
                    <strong className="text-primary">
                      {questionItem.points || question.points || 0}
                    </strong>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      color="outline-primary"
                      onClick={() => window.open(`/admin/questions/${question._id}`, "_blank")}
                      id={`view-question-${question._id}`}
                    >
                      👁️
                    </Button>
                    <UncontrolledTooltip target={`view-question-${question._id}`}>
                      View question details
                    </UncontrolledTooltip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <PaginationItem disabled={currentPage === 1}>
                <PaginationLink
                  previous
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page} active={page === currentPage}>
                  <PaginationLink onClick={() => setCurrentPage(page)}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem disabled={currentPage === totalPages}>
                <PaginationLink
                  next
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </PaginationItem>
            </Pagination>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-3 p-3 bg-light rounded">
          <Row>
            <Col md="6">
              <small className="text-muted">
                Showing {startIndex + 1}-
                {Math.min(startIndex + questionsPerPage, sortedQuestions.length)} of{" "}
                {sortedQuestions.length} questions
                {filteredQuestions.length !== questions.length &&
                  ` (filtered from ${questions.length} total)`}
              </small>
            </Col>
            <Col md="6" className="text-end">
              <small className="text-muted">
                Average time estimate:{" "}
                {filteredQuestions.length > 0
                  ? (
                      filteredQuestions.reduce((sum, q) => {
                        const question = q.question;
                        return sum + (question.timeEstimate || 2);
                      }, 0) / filteredQuestions.length
                    ).toFixed(1)
                  : 0}{" "}
                minutes per question
              </small>
            </Col>
          </Row>
        </div>
      </CardBody>
    </Card>
  );
};

export default TestQuestions;