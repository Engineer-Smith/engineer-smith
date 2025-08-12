// src/components/tests/TestSettings.tsx
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
  Row,
  Col,
  Badge,
  Alert,
  Table,
  FormText,
} from "reactstrap";
import { useAuth } from "../../context/AuthContext";
import type { Test, User } from "../../types";

interface TestSettingsProps {
  test: Test;
  userData?: User; // Added for createdBy lookup
  onTestUpdate: (test: Test) => void;
}

const TestSettings: React.FC<TestSettingsProps> = ({ test, userData, onTestUpdate }) => {
  const { client } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    title: test.title || "",
    description: test.description || "",
    timeLimit: test.settings.timeLimit || 60,
    attemptsAllowed: test.settings.attemptsAllowed || 1,
    passingScore: test.settings.passingScore || 70,
    shuffleQuestions: test.settings.shuffleQuestions || false,
    shuffleOptions: test.settings.shuffleOptions || false,
    showResults: test.settings.showResults || true,
    showCorrectAnswers: test.settings.showCorrectAnswers || false,
    availableFrom:
      test.settings.availableFrom && !isNaN(new Date(test.settings.availableFrom).getTime())
        ? new Date(test.settings.availableFrom).toISOString().slice(0, 16)
        : "",
    availableUntil:
      test.settings.availableUntil && !isNaN(new Date(test.settings.availableUntil).getTime())
        ? new Date(test.settings.availableUntil).toISOString().slice(0, 16)
        : "",
    instructions: test.settings.instructions || "",
  });

  const canEdit = test.status === "draft" || (test.stats?.totalAttempts || 0) === 0;

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate form
      if (!formData.title.trim()) {
        setError("Test title is required");
        return;
      }

      if (formData.timeLimit <= 0) {
        setError("Time limit must be greater than 0");
        return;
      }

      if (formData.passingScore < 0 || formData.passingScore > 100) {
        setError("Passing score must be between 0 and 100");
        return;
      }

      if (formData.attemptsAllowed <= 0) {
        setError("Number of attempts must be greater than 0");
        return;
      }

      const updateData: Partial<Test> = {
        title: formData.title,
        description: formData.description,
        settings: {
          ...test.settings,
          timeLimit: formData.timeLimit,
          attemptsAllowed: formData.attemptsAllowed,
          passingScore: formData.passingScore,
          shuffleQuestions: formData.shuffleQuestions,
          shuffleOptions: formData.shuffleOptions,
          showResults: formData.showResults,
          showCorrectAnswers: formData.showCorrectAnswers,
          availableFrom: formData.availableFrom || undefined,
          availableUntil: formData.availableUntil || undefined,
          instructions: formData.instructions,
        },
      };

      const response = await client.put(`/tests/${test._id}`, updateData);
      onTestUpdate(response.data.test as Test);
      setEditMode(false);
      setSuccess("Test settings updated successfully");
    } catch (err: any) {
      console.error("Failed to update test settings:", err);
      setError(err.response?.data?.error || "Failed to update test settings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      title: test.title || "",
      description: test.description || "",
      timeLimit: test.settings.timeLimit || 60,
      attemptsAllowed: test.settings.attemptsAllowed || 1,
      passingScore: test.settings.passingScore || 70,
      shuffleQuestions: test.settings.shuffleQuestions || false,
      shuffleOptions: test.settings.shuffleOptions || false,
      showResults: test.settings.showResults || true,
      showCorrectAnswers: test.settings.showCorrectAnswers || false,
      availableFrom:
        test.settings.availableFrom && !isNaN(new Date(test.settings.availableFrom).getTime())
          ? new Date(test.settings.availableFrom).toISOString().slice(0, 16)
          : "",
      availableUntil:
        test.settings.availableUntil && !isNaN(new Date(test.settings.availableUntil).getTime())
          ? new Date(test.settings.availableUntil).toISOString().slice(0, 16)
          : "",
      instructions: test.settings.instructions || "",
    });
    setEditMode(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <Card className="mb-4">
      <CardBody>
        <CardTitle tag="h5" className="d-flex align-items-center justify-content-between">
          <span>⚙️ Test Settings</span>
          <div>
            {canEdit && !editMode && (
              <Button
                color="outline-primary"
                size="sm"
                onClick={() => setEditMode(true)}
              >
                Edit Settings
              </Button>
            )}
            {editMode && (
              <div>
                <Button
                  color="success"
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                  className="me-2"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  color="secondary"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardTitle>

        {error && (
          <Alert color="danger" toggle={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="success" toggle={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {!canEdit && (
          <Alert color="warning" className="mb-3">
            <small>
              <strong>Read Only:</strong> This test cannot be edited because it has been taken by
              students or is in published/archived status.
            </small>
          </Alert>
        )}

        <Form>
          {/* Basic Information */}
          <div className="mb-4">
            <h6 className="border-bottom pb-2">Basic Information</h6>

            <FormGroup>
              <Label for="title">Test Title</Label>
              <Input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                disabled={!editMode || loading}
                placeholder="Enter test title..."
              />
            </FormGroup>

            <FormGroup>
              <Label for="description">Description</Label>
              <Input
                type="textarea"
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                disabled={!editMode || loading}
                placeholder="Enter test description..."
              />
            </FormGroup>

            <FormGroup>
              <Label for="instructions">Student Instructions</Label>
              <Input
                type="textarea"
                id="instructions"
                rows={4}
                value={formData.instructions}
                onChange={(e) => handleInputChange("instructions", e.target.value)}
                disabled={!editMode || loading}
                placeholder="Instructions that students will see before starting the test..."
              />
              <FormText>
                These instructions will be shown to students before they begin the test.
              </FormText>
            </FormGroup>
          </div>

          {/* Timing and Scoring */}
          <div className="mb-4">
            <h6 className="border-bottom pb-2">Timing and Scoring</h6>

            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="timeLimit">
                    Time Limit (minutes)
                    {test.settings.useSections && (
                      <Badge color="info" className="ms-2" size="sm">
                        Section-based timing active
                      </Badge>
                    )}
                  </Label>
                  <Input
                    type="number"
                    id="timeLimit"
                    min="1"
                    value={formData.timeLimit}
                    onChange={(e) => handleInputChange("timeLimit", parseInt(e.target.value) || 0)}
                    disabled={!editMode || loading || test.settings.useSections}
                  />
                  {test.settings.useSections && (
                    <FormText color="muted">
                      This test uses section-based timing. Total time is calculated from individual
                      sections.
                    </FormText>
                  )}
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <Label for="passingScore">Passing Score (%)</Label>
                  <Input
                    type="number"
                    id="passingScore"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) => handleInputChange("passingScore", parseInt(e.target.value) || 0)}
                    disabled={!editMode || loading}
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label for="attemptsAllowed">Number of Attempts Allowed</Label>
              <Input
                type="number"
                id="attemptsAllowed"
                min="1"
                max="10"
                value={formData.attemptsAllowed}
                onChange={(e) =>
                  handleInputChange("attemptsAllowed", parseInt(e.target.value) || 1)
                }
                disabled={!editMode || loading}
              />
              <FormText>How many times a student can take this test (1-10)</FormText>
            </FormGroup>
          </div>

          {/* Question Behavior */}
          <div className="mb-4">
            <h6 className="border-bottom pb-2">Question Behavior</h6>

            <Row>
              <Col md="6">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="shuffleQuestions"
                    checked={formData.shuffleQuestions}
                    onChange={(e) => handleInputChange("shuffleQuestions", e.target.checked)}
                    disabled={!editMode || loading}
                  />
                  <Label check for="shuffleQuestions">
                    Shuffle Questions
                  </Label>
                  <FormText>Randomize the order of questions for each student</FormText>
                </FormGroup>

                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="shuffleOptions"
                    checked={formData.shuffleOptions}
                    onChange={(e) => handleInputChange("shuffleOptions", e.target.checked)}
                    disabled={!editMode || loading}
                  />
                  <Label check for="shuffleOptions">
                    Shuffle Answer Options
                  </Label>
                  <FormText>
                    Randomize the order of answer choices (for multiple choice questions)
                  </FormText>
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="showResults"
                    checked={formData.showResults}
                    onChange={(e) => handleInputChange("showResults", e.target.checked)}
                    disabled={!editMode || loading}
                  />
                  <Label check for="showResults">
                    Show Results After Completion
                  </Label>
                  <FormText>Students see their score immediately after finishing</FormText>
                </FormGroup>

                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="showCorrectAnswers"
                    checked={formData.showCorrectAnswers}
                    onChange={(e) => handleInputChange("showCorrectAnswers", e.target.checked)}
                    disabled={!editMode || loading}
                  />
                  <Label check for="showCorrectAnswers">
                    Show Correct Answers
                  </Label>
                  <FormText>Students can see correct answers after submission</FormText>
                </FormGroup>
              </Col>
            </Row>
          </div>

          {/* Availability Schedule */}
          <div className="mb-4">
            <h6 className="border-bottom pb-2">Availability Schedule</h6>

            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="availableFrom">Available From</Label>
                  <Input
                    type="datetime-local"
                    id="availableFrom"
                    value={formData.availableFrom}
                    onChange={(e) => handleInputChange("availableFrom", e.target.value)}
                    disabled={!editMode || loading}
                  />
                  <FormText>When students can start taking this test (optional)</FormText>
                </FormGroup>
              </Col>

              <Col md="6">
                <FormGroup>
                  <Label for="availableUntil">Available Until</Label>
                  <Input
                    type="datetime-local"
                    id="availableUntil"
                    value={formData.availableUntil}
                    onChange={(e) => handleInputChange("availableUntil", e.target.value)}
                    disabled={!editMode || loading}
                  />
                  <FormText>When the test becomes unavailable (optional)</FormText>
                </FormGroup>
              </Col>
            </Row>
          </div>

          {/* Test Metadata (Read-only) */}
          <div className="mb-4">
            <h6 className="border-bottom pb-2">Test Information</h6>

            <Table borderless size="sm">
              <tbody>
                <tr>
                  <td width="40%"><strong>Test Type:</strong></td>
                  <td>
                    <Badge color="primary">{test.testType?.replace("_", " ") || "custom"}</Badge>
                  </td>
                </tr>
                <tr>
                  <td><strong>Skills Covered:</strong></td>
                  <td>
                    {test.skills && test.skills.length > 0 ? (
                      test.skills.map((skill, index) => (
                        <Badge key={index} color="info" className="me-1" size="sm">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted">No skills specified</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td><strong>Created:</strong></td>
                  <td>{new Date(test.createdAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>Last Modified:</strong></td>
                  <td>{new Date(test.updatedAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>Created By:</strong></td>
                  <td>
                    {userData ? (
                      <>
                        {userData.profile?.firstName || ""} {userData.profile?.lastName || ""}
                        <Badge color="secondary" size="sm" className="ms-2">
                          {userData.role || "unknown"}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-muted">Unknown user</span>
                    )}
                  </td>
                </tr>
                {test.category && (
                  <tr>
                    <td><strong>Category:</strong></td>
                    <td>
                      <Badge color="outline-primary">{test.category}</Badge>
                    </td>
                  </tr>
                )}
                {test.tags && test.tags.length > 0 && (
                  <tr>
                    <td><strong>Tags:</strong></td>
                    <td>
                      {test.tags.map((tag, index) => (
                        <Badge key={index} color="light" className="me-1" size="sm">
                          #{tag}
                        </Badge>
                      ))}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Advanced Settings (Read-only display) */}
          <div className="mb-4">
            <h6 className="border-bottom pb-2">Advanced Configuration</h6>

            <Table borderless size="sm">
              <tbody>
                <tr>
                  <td width="40%"><strong>Structure Type:</strong></td>
                  <td>
                    <Badge color={test.settings.useSections ? "info" : "secondary"}>
                      {test.settings.useSections ? "Section-Based" : "Simple Test"}
                    </Badge>
                  </td>
                </tr>
                {test.settings.useSections && (
                  <tr>
                    <td><strong>Sections:</strong></td>
                    <td>{test.sections?.length || 0} configured</td>
                  </tr>
                )}
                <tr>
                  <td><strong>Question Pool:</strong></td>
                  <td>
                    <Badge color={test.settings.useQuestionPool ? "success" : "secondary"}>
                      {test.settings.useQuestionPool ? "Enabled" : "Disabled"}
                    </Badge>
                  </td>
                </tr>
                {test.questionPool?.enabled && (
                  <tr>
                    <td><strong>Pool Questions:</strong></td>
                    <td>
                      {test.questionPool.availableQuestions?.length || 0} available,
                      {test.questionPool.totalQuestions || 0} selected per attempt
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Current Test Status */}
          <div className="mb-4">
            <h6 className="border-bottom pb-2">Current Status</h6>

            <div className="d-flex align-items-center justify-content-between p-3 border rounded">
              <div>
                <Badge
                  color={
                    test.status === "published"
                      ? "success"
                      : test.status === "draft"
                      ? "warning"
                      : "secondary"
                  }
                  pill
                  className="me-2"
                >
                  {test.status.toUpperCase()}
                </Badge>
                <span>
                  {test.status === "published" && "Available to students"}
                  {test.status === "draft" && "Not yet published"}
                  {test.status === "archived" && "No longer available"}
                </span>
              </div>

              {test.stats && test.stats.totalAttempts > 0 && (
                <div className="text-end">
                  <small className="text-muted">
                    {test.stats.totalAttempts} total attempts
                    <br />
                    {test.stats.completedAttempts} completed
                  </small>
                </div>
              )}
            </div>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default TestSettings;