import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Spinner,
  Badge,
} from "reactstrap";
import type { CreateTestData, TestTemplate } from "../../types/tests";
import { calcTotals } from "../../types/testBuilder"; // if calcTotals will be moved, update import
import type { Question } from "../../types/testBuilder";

interface TestConfigPanelProps {
  templates: TestTemplate[];
  testData: CreateTestData;
  setTestData: React.Dispatch<React.SetStateAction<CreateTestData>>;
  sectionTypes: any[];
  onTemplateSelect: () => void;
  validationResult: { valid: boolean; errors?: string[]; warnings?: string[] } | null;
  onCreateTest: () => void;
  loading: boolean;
  allQuestions: Question[]; // ✅ add
}

const TestConfigPanel: React.FC<TestConfigPanelProps> = ({
  templates,
  testData,
  setTestData,
  sectionTypes,
  onTemplateSelect,
  validationResult,
  onCreateTest,
  loading,
  allQuestions, // ✅ add
}) => {
  const totals = calcTotals(testData, allQuestions); // ✅ pass 2 args

  return (
    <Card className="h-100">
      <CardHeader>
        <h3 className="mb-0">Test Configuration</h3>
      </CardHeader>
      <CardBody style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
        {/* Quick Templates */}
        <div className="mb-4">
          <h5>Quick Start Templates</h5>
          <Row>
            {templates.slice(0, 3).map((template, index) => (
              <Col md="4" key={index} className="mb-2">
                <Card
                  className="border cursor-pointer h-100"
                  onClick={() => onTemplateSelect()}
                  style={{ cursor: "pointer" }}
                >
                  <CardBody className="p-2 text-center">
                    <small className="fw-bold">{template.name}</small>
                    <div>
                      {template.skills.map((skill) => (
                        <Badge key={skill} color="info" className="me-1 mt-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    {template.useSections && (
                      <Badge color="success" className="mt-1">
                        📚 Sections
                      </Badge>
                    )}
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Test Basic Info */}
        <Form>
          <FormGroup>
            <Label for="title">Test Title *</Label>
            <Input
              type="text"
              id="title"
              value={testData.title}
              onChange={(e) =>
                setTestData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter test title"
            />
          </FormGroup>
          <FormGroup>
            <Label for="description">Description *</Label>
            <Input
              type="textarea"
              id="description"
              rows={3}
              value={testData.description}
              onChange={(e) =>
                setTestData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Describe what this test covers"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="instructions">Instructions</Label>
            <Input
              type="textarea"
              id="instructions"
              rows={3}
              value={testData.instructions}
              onChange={(e) =>
                setTestData((prev) => ({ ...prev, instructions: e.target.value }))
              }
              placeholder="Instructions for test takers"
            />
          </FormGroup>
        </Form>

        {validationResult && (
          <Alert
            color={validationResult.valid ? "success" : "warning"}
            className="mt-3"
          >
            <strong>Section Validation:</strong>
            {validationResult.valid ? (
              <div>✅ All sections are properly configured</div>
            ) : (
              <div>
                {validationResult.errors?.map((er, i) => (
                  <div key={i}>❌ {er}</div>
                ))}
                {validationResult.warnings?.map((wr, i) => (
                  <div key={i}>⚠️ {wr}</div>
                ))}
              </div>
            )}
          </Alert>
        )}

        {/* Test Summary */}
        <div className="mt-4 p-3 bg-light rounded">
          <h6>Test Summary</h6>
          <div className="small">
            <div>
              Questions: <strong>{totals.questionsCount}</strong>
            </div>
            <div>
              Total Points: <strong>{totals.totalPoints}</strong>
            </div>
            <div>
              Total Time: <strong>{totals.totalTime} minutes</strong>
            </div>
            <div>
              Skills:{" "}
              {testData.skills.map((skill) => (
                <Badge key={skill} color="info" className="me-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <Button
            color="success"
            onClick={onCreateTest}
            disabled={
              loading ||
              !testData.title ||
              !testData.description ||
              totals.questionsCount === 0
            }
            className="flex-grow-1"
          >
            {loading ? <Spinner size="sm" className="me-2" /> : null}
            Create Test
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default TestConfigPanel;
