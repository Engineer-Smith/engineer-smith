import React from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Row,
  Col,
  Badge,
  Progress,
  Table,
  Alert,
} from "reactstrap";
import type { Test, CompletionEstimate } from "../../types";
import { calcTotals } from "../../types";

interface TestOverviewProps {
  test: Test;
}

const TestOverview: React.FC<TestOverviewProps> = ({ test }) => {
  const getCompletionEstimate = (): CompletionEstimate => {
    const { questionsCount, totalTime } = calcTotals(test, []);

    if (test.settings.useSections && test.sections) {
      return {
        totalTime,
        estimatedQuestions: questionsCount,
        timePerQuestion: questionsCount > 0 ? totalTime / questionsCount : 0,
        breakdown: test.sections.map((section) => ({
          name: section.name,
          timeLimit: section.timeLimit,
          estimatedQuestions: section.questionPool?.enabled
            ? section.questionPool.totalQuestions || 0
            : section.questions?.length || 0,
        })),
      };
    } else {
      return {
        totalTime,
        estimatedQuestions: questionsCount,
        timePerQuestion: questionsCount > 0 ? totalTime / questionsCount : 0,
      };
    }
  };

  const estimate = getCompletionEstimate();
  const passRate = test.stats?.passRate || 0;
  const totalAttempts = test.stats?.totalAttempts || 0;

  return (
    <div>
      {/* Test Statistics */}
      <Card className="mb-4">
        <CardBody>
          <CardTitle tag="h5" className="d-flex align-items-center">
            📊 Test Statistics
          </CardTitle>

          <Row>
            <Col md="3">
              <div className="text-center">
                <h3 className="text-primary mb-0">{totalAttempts}</h3>
                <small className="text-muted">Total Attempts</small>
              </div>
            </Col>
            <Col md="3">
              <div className="text-center">
                <h3 className="text-success mb-0">{test.stats?.completedAttempts || 0}</h3>
                <small className="text-muted">Completed</small>
              </div>
            </Col>
            <Col md="3">
              <div className="text-center">
                <h3 className="text-info mb-0">
                  {(test.stats?.averageScore || 0).toFixed(1)}%
                </h3>
                <small className="text-muted">Average Score</small>
              </div>
            </Col>
            <Col md="3">
              <div className="text-center">
                <h3 className={`mb-0 ${passRate >= 70 ? "text-success" : "text-warning"}`}>
                  {passRate.toFixed(1)}%
                </h3>
                <small className="text-muted">Pass Rate</small>
              </div>
            </Col>
          </Row>

          {totalAttempts > 0 && (
            <>
              <hr />
              <div className="mb-2">
                <small className="text-muted">Pass Rate Progress</small>
                <Progress
                  value={passRate}
                  color={passRate >= 70 ? "success" : passRate >= 50 ? "warning" : "danger"}
                  className="mb-1"
                />
                <small className="text-muted">
                  {test.stats?.completedAttempts || 0} of {totalAttempts} attempts passed
                </small>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Test Structure Overview */}
      <Card className="mb-4">
        <CardBody>
          <CardTitle tag="h5" className="d-flex align-items-center">
            🏗️ Test Structure
          </CardTitle>

          <Row className="mb-3">
            <Col md="6">
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <td><strong>Structure Type:</strong></td>
                    <td>
                      <Badge color={test.settings.useSections ? "info" : "secondary"}>
                        {test.settings.useSections ? "Section-Based" : "Simple Test"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Total Time:</strong></td>
                    <td>{estimate.totalTime} minutes</td>
                  </tr>
                  <tr>
                    <td><strong>Question Count:</strong></td>
                    <td>
                      {estimate.estimatedQuestions} questions
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Passing Score:</strong></td>
                    <td>{test.settings.passingScore}%</td>
                  </tr>
                  <tr>
                    <td><strong>Attempts Allowed:</strong></td>
                    <td>{test.settings.attemptsAllowed}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>

            <Col md="6">
              <Table borderless size="sm">
                <tbody>
                  <tr>
                    <td><strong>Shuffle Questions:</strong></td>
                    <td>
                      <Badge color={test.settings.shuffleQuestions ? "success" : "secondary"}>
                        {test.settings.shuffleQuestions ? "Yes" : "No"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Shuffle Options:</strong></td>
                    <td>
                      <Badge color={test.settings.shuffleOptions ? "success" : "secondary"}>
                        {test.settings.shuffleOptions ? "Yes" : "No"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Show Results:</strong></td>
                    <td>
                      <Badge color={test.settings.showResults ? "success" : "secondary"}>
                        {test.settings.showResults ? "Yes" : "No"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Show Answers:</strong></td>
                    <td>
                      <Badge color={test.settings.showCorrectAnswers ? "warning" : "success"}>
                        {test.settings.showCorrectAnswers ? "Yes" : "No"}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Question Pool:</strong></td>
                    <td>
                      <Badge color={test.settings.useQuestionPool ? "info" : "secondary"}>
                        {test.settings.useQuestionPool ? "Enabled" : "Disabled"}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Availability */}
      {(test.settings.availableFrom || test.settings.availableUntil) && (
        <Card className="mb-4">
          <CardBody>
            <CardTitle tag="h5" className="d-flex align-items-center">
              📅 Availability
            </CardTitle>

            <Row>
              {test.settings.availableFrom && (
                <Col md="6">
                  <div>
                    <strong>Available From:</strong>
                    <br />
                    <small className="text-muted">
                      {test.settings.availableFrom
                        ? new Date(test.settings.availableFrom).toLocaleString()
                        : "N/A"}
                    </small>
                  </div>
                </Col>
              )}

              {test.settings.availableUntil && (
                <Col md="6">
                  <div>
                    <strong>Available Until:</strong>
                    <br />
                    <small className="text-muted">
                      {test.settings.availableUntil
                        ? new Date(test.settings.availableUntil).toLocaleString()
                        : "N/A"}
                    </small>
                  </div>
                </Col>
              )}
            </Row>

            <hr />
            <div>
              {(() => {
                const now = new Date();
                const availableFrom = test.settings.availableFrom
                  ? new Date(test.settings.availableFrom)
                  : null;
                const availableUntil = test.settings.availableUntil
                  ? new Date(test.settings.availableUntil)
                  : null;

                if (availableFrom && !isNaN(availableFrom.getTime()) && now < availableFrom) {
                  return (
                    <Alert color="warning" className="mb-0">
                      ⏰ Test will be available starting {availableFrom.toLocaleString()}
                    </Alert>
                  );
                } else if (
                  availableUntil &&
                  !isNaN(availableUntil.getTime()) &&
                  now > availableUntil
                ) {
                  return (
                    <Alert color="danger" className="mb-0">
                      ⏰ Test availability ended on {availableUntil.toLocaleString()}
                    </Alert>
                  );
                } else {
                  return (
                    <Alert color="success" className="mb-0">
                      ✅ Test is currently available for students
                    </Alert>
                  );
                }
              })()}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Instructions */}
      {test.settings.instructions && (
        <Card className="mb-4">
          <CardBody>
            <CardTitle tag="h5" className="d-flex align-items-center">
              📝 Test Instructions
            </CardTitle>
            <div
              className="border rounded p-3 bg-light"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {test.settings.instructions}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default TestOverview;