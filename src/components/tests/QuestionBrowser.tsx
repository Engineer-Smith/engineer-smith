import React from "react";
import {
  Row,
  Col,
  InputGroup,
  Input,
  Button,
  ListGroup,
  ListGroupItem,
  Badge,
  Spinner,
  FormGroup,
  Label,
} from "reactstrap";

import type { CreateTestData } from "../../types/tests";
import type { Question } from "../../types/questions";

interface QuestionBrowserProps {
  loading: boolean;
  questions: Question[]; // kept for future use if needed
  filteredQuestions: Question[];
  testData: CreateTestData;
  selectedSectionId: string | null;

  // Controlled filters (using React setters like your page does)
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filterType: string;
  setFilterType: React.Dispatch<React.SetStateAction<string>>;
  filterDifficulty: string;
  setFilterDifficulty: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSectionId: React.Dispatch<React.SetStateAction<string | null>>;

  // Optional actions (parent can add later)
  onToggleQuestion?: (questionId: string) => void;
  onAssignAll?: () => void;
  onClear?: () => void;
}

const QuestionBrowser: React.FC<QuestionBrowserProps> = ({
  loading,
  questions,
  filteredQuestions,
  testData,
  selectedSectionId,

  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterDifficulty,
  setFilterDifficulty,
  setSelectedSectionId,

  onToggleQuestion,
  onAssignAll,
  onClear,
}) => {
  const noop = () => {};
  const handleToggle = onToggleQuestion ?? noop;
  const handleAssignAll = onAssignAll ?? noop;
  const handleClear = onClear ?? noop;

  const selectedCount = testData.settings.useSections
    ? testData.sections.find((s) => (s.tempId || s._id) === selectedSectionId)?.questions.length || 0
    : testData.questions.length;

  return (
    <div>
      <div className="p-3 border-bottom">
        {testData.settings.useSections && (
          <FormGroup>
            <Label htmlFor="sectionSelect">Assign to Section</Label>
            <Input
              type="select"
              id="sectionSelect"
              value={selectedSectionId || ""}
              onChange={(e) => setSelectedSectionId(e.target.value || null)}
            >
              <option value="">Select a section</option>
              {testData.sections.map((section) => (
                <option key={section.tempId || section._id} value={section.tempId || section._id}>
                  {section.name} ({section.sectionType})
                </option>
              ))}
            </Input>
          </FormGroup>
        )}

        <Row>
          <Col md="6">
            <InputGroup>
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md="3">
            <Input
              type="select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="code_challenge">Code Challenge</option>
              <option value="debug_fix">Debug Fix</option>
            </Input>
          </Col>
          <Col md="3">
            <Input
              type="select"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Input>
          </Col>
        </Row>

        <div className="mt-2 d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {filteredQuestions.length} questions • {selectedCount} selected
          </small>
          <div>
            <Button size="sm" color="outline-primary" className="me-2" onClick={handleAssignAll}>
              Select All
            </Button>
            <Button size="sm" color="outline-secondary" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div style={{ height: "calc(100vh - 350px)", overflowY: "auto" }}>
        {loading ? (
          <div className="text-center p-4">
            <Spinner />
            <p>Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted">
              {testData.skills.length === 0
                ? "Select skills first to see available questions"
                : "No questions found for selected skills and filters"}
            </p>
          </div>
        ) : (
          <ListGroup flush>
            {filteredQuestions.map((question) => {
              const isSelected = testData.settings.useSections
                ? testData.sections.some(
                    (s) =>
                      (s.tempId || s._id) === selectedSectionId &&
                      s.questions.some((q) => q.questionId === question._id)
                  )
                : testData.questions.some((q) => q.questionId === question._id);

              return (
                <ListGroupItem
                  key={question._id}
                  className={`border-0 border-bottom ${isSelected ? "bg-light" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle(question._id)}
                >
                  <div className="d-flex align-items-start">
                    <Input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(question._id)}
                      className="me-3 mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-grow-1">
                      <div className="fw-bold">{question.title}</div>
                      <div className="small text-muted mb-2">
                        {question.description?.slice(0, 100) || ""}...
                      </div>
                      <div className="d-flex gap-1">
                        <Badge color="info">{question.type.replace("_", " ")}</Badge>
                        <Badge color="secondary">{question.skill}</Badge>
                        <Badge
                          color={
                            question.difficulty === "beginner"
                              ? "success"
                              : question.difficulty === "intermediate"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {question.difficulty}
                        </Badge>
                        <Badge color="light" className="text-dark">
                          {question.points} pts
                        </Badge>
                      </div>
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

export default QuestionBrowser;
