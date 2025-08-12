// src/components/tests/TestSections.tsx
import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Table,
  Badge,
  Button,
  Collapse,
  Row,
  Col,
  Progress,
  Alert,
  UncontrolledTooltip,
} from "reactstrap";
import type { Test, TestSection, Question } from "../../types";

interface TestSectionsProps {
  test: Test;
  questionsData?: Question[];
  onTestUpdate: (test: Test) => void;
}

const TestSections: React.FC<TestSectionsProps> = ({ test, questionsData = [], onTestUpdate }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  if (!test.settings.useSections || !test.sections || test.sections.length === 0) {
    return (
      <Alert color="info">
        <h6>No Sections Configured</h6>
        <p className="mb-0">This test is not using a section-based structure.</p>
      </Alert>
    );
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getSectionTypeInfo = (sectionType: TestSection["sectionType"]) => {
    const types: Record<TestSection["sectionType"], { name: string; icon: string; color: string }> = {
      mixed: { name: "Mixed Questions", icon: "🔀", color: "primary" },
      multiple_choice: { name: "Multiple Choice", icon: "📝", color: "info" },
      true_false: { name: "True/False", icon: "✅", color: "success" },
      coding: { name: "Coding Challenges", icon: "💻", color: "warning" },
      debugging: { name: "Code Debugging", icon: "🐛", color: "danger" },
      theory: { name: "Theory Questions", icon: "📚", color: "secondary" },
      practical: { name: "Practical Coding", icon: "⚡", color: "dark" },
      custom: { name: "Custom Section", icon: "⚙️", color: "light" },
    };
    return types[sectionType] || types.mixed;
  };

  const getTotalQuestions = (section: TestSection) => {
    if (section.questionPool?.enabled) {
      return section.questionPool.totalQuestions || 0;
    }
    return section.questions?.length || 0;
  };

  const getTotalTime = (): number => {
    return test.sections?.reduce((sum, section) => sum + section.timeLimit, 0) || 0;
  };

  const getSectionStats = (sectionIndex: number) => {
    const sectionId = `section_${sectionIndex}`;
    return test.stats?.sectionStats?.find((s) => s.sectionId === sectionId);
  };

  const renderDistribution = (distribution: TestSection["questionPool"]["distribution"]) => {
    if (!distribution) return null;

    const badges: React.JSX.Element[] = [];

    // Handle byType
    if (distribution.byType) {
      Object.entries(distribution.byType).forEach(([type, { count }]) => {
        badges.push(
          <Badge key={`type-${type}`} color="light" className="me-1">
            {type.replace("_", " ")}: {count}
          </Badge>,
        );
      });
    }

    // Handle byDifficulty
    if (distribution.byDifficulty) {
      Object.entries(distribution.byDifficulty).forEach(([difficulty, { count }]) => {
        badges.push(
          <Badge key={`difficulty-${difficulty}`} color="light" className="me-1">
            {difficulty}: {count}
          </Badge>,
        );
      });
    }

    // Handle bySkill
    if (distribution.bySkill) {
      Object.entries(distribution.bySkill).forEach(([skill, count]) => {
        badges.push(
          <Badge key={`skill-${skill}`} color="light" className="me-1">
            {skill}: {count}
          </Badge>,
        );
      });
    }

    // Handle byEstimatedTime
    if (distribution.byEstimatedTime) {
      const { quick, medium, long } = distribution.byEstimatedTime;
      if (quick) {
        badges.push(
          <Badge key="time-quick" color="light" className="me-1">
            Quick (≤{quick.maxTime}s): {quick.count}
          </Badge>,
        );
      }
      if (medium) {
        badges.push(
          <Badge key="time-medium" color="light" className="me-1">
            Medium ({medium.minTime}-{medium.maxTime}s): {medium.count}
          </Badge>,
        );
      }
      if (long) {
        badges.push(
          <Badge key="time-long" color="light" className="me-1">
            Long (≥{long.minTime}s): {long.count}
          </Badge>,
        );
      }
    }

    return badges.length > 0 ? badges : <Badge color="light">No distribution specified</Badge>;
  };

  return (
    <Card className="mb-4">
      <CardBody>
        <CardTitle tag="h5" className="d-flex align-items-center justify-content-between">
          <span>🏗️ Test Sections</span>
          <Badge color="info" pill>
            {test.sections.length} sections • {getTotalTime()} minutes total
          </Badge>
        </CardTitle>

        <div className="mb-3">
          <Row>
            <Col md="8">
              <Progress multi>
                {test.sections.map((section, index) => {
                  const percentage = getTotalTime() > 0 ? (section.timeLimit / getTotalTime()) * 100 : 0;
                  const typeInfo = getSectionTypeInfo(section.sectionType);
                  return (
                    <Progress
                      key={index}
                      bar
                      color={typeInfo.color}
                      value={percentage}
                    />
                  );
                })}
              </Progress>
              <small className="text-muted">Time distribution across sections</small>
            </Col>
          </Row>
        </div>

        <Table responsive>
          <thead>
            <tr>
              <th>Section</th>
              <th>Type</th>
              <th>Time</th>
              <th>Questions</th>
              <th>Performance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {test.sections.map((section, index) => {
              const sectionId = `section_${index}`;
              const isExpanded = expandedSections.has(sectionId);
              const typeInfo = getSectionTypeInfo(section.sectionType);
              const questionCount = getTotalQuestions(section);
              const stats = getSectionStats(index);

              return (
                <React.Fragment key={index}>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <Button
                          color="link"
                          size="sm"
                          className="p-0 me-2"
                          onClick={() => toggleSection(sectionId)}
                        >
                          {isExpanded ? "📖" : "📕"}
                        </Button>
                        <div>
                          <strong>{section.name}</strong>
                          {section.description && (
                            <>
                              <br />
                              <small className="text-muted">{section.description}</small>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge color={typeInfo.color} className="d-flex align-items-center">
                        <span className="me-1">{typeInfo.icon}</span>
                        {typeInfo.name}
                      </Badge>
                    </td>
                    <td>
                      <strong>{section.timeLimit}</strong>
                      <small className="text-muted d-block">minutes</small>
                    </td>
                    <td>
                      <strong>{questionCount}</strong>
                      <small className="text-muted d-block">
                        {section.questionPool?.enabled ? "from pool" : "assigned"}
                      </small>
                    </td>
                    <td>
                      {stats ? (
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <small className="me-2">Avg Score:</small>
                            <Badge
                              color={stats.averageScore >= 70 ? "success" : "warning"}
                              pill
                            >
                              {stats.averageScore.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="d-flex align-items-center">
                            <small className="me-2">Completion:</small>
                            <Badge color="info" pill>
                              {stats.completionRate.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <small className="text-muted">No data yet</small>
                      )}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        color="outline-primary"
                        onClick={() => toggleSection(sectionId)}
                        id={`section-details-${index}`}
                      >
                        {isExpanded ? "Hide" : "View"} Details
                      </Button>
                      <UncontrolledTooltip target={`section-details-${index}`}>
                        {isExpanded ? "Hide" : "Show"} section configuration and questions
                      </UncontrolledTooltip>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={6} className="p-0">
                      <Collapse isOpen={isExpanded}>
                        <div className="p-3 bg-light border-top">
                          <Row>
                            <Col md="6">
                              <h6>Section Configuration</h6>
                              <Table size="sm" borderless>
                                <tbody>
                                  <tr>
                                    <td><strong>Order:</strong></td>
                                    <td>{section.order}</td>
                                  </tr>
                                  <tr>
                                    <td><strong>Time per Question:</strong></td>
                                    <td>
                                      {questionCount > 0
                                        ? (section.timeLimit / questionCount).toFixed(1)
                                        : 0}{" "}
                                      minutes
                                    </td>
                                  </tr>
                                  {section.questionPool?.enabled && (
                                    <>
                                      <tr>
                                        <td><strong>Pool Size:</strong></td>
                                        <td>
                                          {section.questionPool.availableQuestions?.length || 0} available,
                                          {section.questionPool.totalQuestions || 0} selected
                                        </td>
                                      </tr>
                                      {section.questionPool.distribution && (
                                        <tr>
                                          <td><strong>Distribution:</strong></td>
                                          <td>{renderDistribution(section.questionPool.distribution)}</td>
                                        </tr>
                                      )}
                                    </>
                                  )}
                                </tbody>
                              </Table>
                            </Col>

                            <Col md="6">
                              <h6>Allowed Question Types</h6>
                              <div className="mb-3">
                                {section.allowedQuestionTypes ? (
                                  Object.entries(section.allowedQuestionTypes).map(([type, allowed]) => (
                                    <Badge
                                      key={type}
                                      color={allowed ? "success" : "secondary"}
                                      className="me-2 mb-1"
                                    >
                                      {type.replace("_", " ")}: {allowed ? "✓" : "✗"}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge color="info">All types allowed</Badge>
                                )}
                              </div>

                              {section.instructions && (
                                <>
                                  <h6>Section Instructions</h6>
                                  <div className="border rounded p-2 bg-white small">
                                    {section.instructions}
                                  </div>
                                </>
                              )}
                            </Col>
                          </Row>

                          {!section.questionPool?.enabled && section.questions && section.questions.length > 0 && (
                            <div className="mt-3">
                              <h6>Assigned Questions ({section.questions.length})</h6>
                              <div className="border rounded p-2 bg-white">
                                {section.questions.slice(0, 5).map((question, qIndex) => {
                                  const questionData = questionsData.find((q) => q._id === question.questionId);
                                  return (
                                    <div
                                      key={qIndex}
                                      className="d-flex justify-content-between align-items-center py-1"
                                    >
                                      <span className="small">
                                        {qIndex + 1}. {questionData?.title || question.questionId}
                                      </span>
                                      <div>
                                        <Badge color="light" size="sm">
                                          {questionData?.type || "unknown"}
                                        </Badge>
                                        <Badge color="primary" size="sm" className="ms-1">
                                          {question.points} pts
                                        </Badge>
                                      </div>
                                    </div>
                                  );
                                })}
                                {section.questions.length > 5 && (
                                  <small className="text-muted">
                                    ... and {section.questions.length - 5} more questions
                                  </small>
                                )}
                              </div>
                            </div>
                          )}

                          {section.questionPool?.enabled && (
                            <div className="mt-3">
                              <Alert color="info" className="mb-0">
                                <small>
                                  <strong>Question Pool Active:</strong> Questions will be randomly selected
                                  from the pool when students take the test.
                                </small>
                              </Alert>
                            </div>
                          )}
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>

        <div className="mt-3 p-3 bg-light rounded">
          <Row>
            <Col md="3">
              <div className="text-center">
                <h6 className="text-primary mb-1">
                  {test.sections.reduce((sum, s) => sum + getTotalQuestions(s), 0)}
                </h6>
                <small className="text-muted">Total Questions</small>
              </div>
            </Col>
            <Col md="3">
              <div className="text-center">
                <h6 className="text-info mb-1">{getTotalTime()}</h6>
                <small className="text-muted">Total Minutes</small>
              </div>
            </Col>
            <Col md="3">
              <div className="text-center">
                <h6 className="text-success mb-1">
                  {test.sections.filter((s) => s.questionPool?.enabled).length}
                </h6>
                <small className="text-muted">Pooled Sections</small>
              </div>
            </Col>
            <Col md="3">
              <div className="text-center">
                <h6 className="text-warning mb-1">
                  {test.sections.reduce((sum, s) => sum + getTotalQuestions(s), 0) > 0
                    ? (getTotalTime() / test.sections.reduce((sum, s) => sum + getTotalQuestions(s), 0)).toFixed(1)
                    : 0}
                </h6>
                <small className="text-muted">Avg Minutes/Question</small>
              </div>
            </Col>
          </Row>
        </div>
      </CardBody>
    </Card>
  );
};

export default TestSections;