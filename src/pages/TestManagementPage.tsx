// src/pages/TestManagementPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Table,
  Badge,
  Spinner,
  Alert,
  Input,
  FormGroup,
  Label,
  Tooltip,
} from "reactstrap";
import { testAPI } from "../services/testAPI";
import type { TestListItem } from "../types";

type TestStatus = "draft" | "published" | "archived";

const TestManagementPage: React.FC = () => {
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState({
    status: "",
    skill: "",
    search: "",
    useSections: "", // New filter for section-based tests
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append("status", filter.status);
      if (filter.skill) params.append("skill", filter.skill);
      if (filter.search) params.append("search", filter.search);
      if (filter.useSections) params.append("useSections", filter.useSections);

      const response = await testAPI.getAllTests(params.toString());
      setTests(response.tests);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (testId: string, newStatus: TestStatus) => {
    try {
      if (newStatus === "published") {
        await testAPI.publishTest(testId);
      } else {
        await testAPI.updateTest(testId, { status: newStatus });
      }
      fetchTests();
    } catch (err: any) {
      setError(err.message || "Failed to update test status");
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;

    try {
      await testAPI.deleteTest(testId);
      fetchTests();
    } catch (err: any) {
      setError(err.message || "Failed to delete test");
    }
  };

  const handleDuplicateTest = async (testId: string) => {
    try {
      await testAPI.duplicateTest(testId);
      fetchTests();
    } catch (err: any) {
      setError(err.message || "Failed to duplicate test");
    }
  };

  const toggleTooltip = (testId: string) => {
    setTooltipOpen(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const getStatusBadge = (status: TestStatus) => {
    const colors: Record<TestStatus, string> = {
      draft: "secondary",
      published: "success",
      archived: "warning",
    };
    return <Badge color={colors[status]}>{status}</Badge>;
  };

  const getTestTypeDisplay = (testType: string) => {
    const types: Record<string, string> = {
      single_skill: "Single Skill",
      frontend: "Frontend",
      react_focused: "React Focused",
      full_stack: "Full Stack",
      mobile: "Mobile",
      comprehensive: "Comprehensive",
      custom: "Custom",
    };
    return types[testType] || testType;
  };

  // Enhanced function to get question count (handles sections)
  const getQuestionCount = (test: any) => {
    if (test.settings?.useSections && test.sections) {
      return test.sections.reduce((total: number, section: any) => {
        if (section.questionPool?.enabled) {
          return total + (section.questionPool.totalQuestions || 0);
        }
        return total + (section.questions?.length || 0);
      }, 0);
    }
    return test.questions?.length ?? 0;
  };

  // Enhanced function to get total time (handles sections)
  const getTotalTime = (test: any) => {
    if (test.settings?.useSections && test.sections) {
      return test.sections.reduce((total: number, section: any) => {
        return total + (section.timeLimit || 0);
      }, 0);
    }
    return test.settings?.timeLimit || 0;
  };

  // Get section count for display
  const getSectionCount = (test: any) => {
    return test.settings?.useSections ? (test.sections?.length || 0) : 0;
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner color="primary" />
        <p className="mt-2">Loading tests...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h2 mb-3 font-weight-bold">Test Management</h1>
          <p className="text-muted">Create, edit, and manage tests for your platform.</p>
        </Col>
        <Col xs="auto">
          <Button color="primary" onClick={() => navigate("/admin/tests/create")}>
            Create New Test
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert color="danger" toggle={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Enhanced Filters */}
      <Card className="mb-4">
        <CardBody>
          <Row>
            <Col md="3">
              <FormGroup>
                <Label>Filter by Status</Label>
                <Input
                  type="select"
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md="3">
              <FormGroup>
                <Label>Filter by Skill</Label>
                <Input
                  type="text"
                  placeholder="Enter skill name..."
                  value={filter.skill}
                  onChange={(e) => setFilter({ ...filter, skill: e.target.value })}
                />
              </FormGroup>
            </Col>
            <Col md="3">
              <FormGroup>
                <Label>Test Structure</Label>
                <Input
                  type="select"
                  value={filter.useSections}
                  onChange={(e) => setFilter({ ...filter, useSections: e.target.value })}
                >
                  <option value="">All Tests</option>
                  <option value="true">Section-Based</option>
                  <option value="false">Single Section</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md="3">
              <FormGroup>
                <Label>Search Tests</Label>
                <Input
                  type="text"
                  placeholder="Search by title..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
              </FormGroup>
            </Col>
          </Row>
          <Button
            color="outline-secondary"
            onClick={() => setFilter({ status: "", skill: "", search: "", useSections: "" })}
          >
            Clear Filters
          </Button>
        </CardBody>
      </Card>

      {/* Enhanced Tests Table */}
      <Card>
        <CardBody>
          {tests.length === 0 ? (
            <div className="text-center py-4">
              <p>
                No tests found.{" "}
                <Button color="link" onClick={() => navigate("/admin/tests/create")}>
                  Create your first test
                </Button>
              </p>
            </div>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Skills</th>
                  <th>Structure</th>
                  <th>Questions</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Stats</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => {
                  const questionCount = getQuestionCount(test);
                  const totalTime = getTotalTime(test);
                  const sectionCount = getSectionCount(test);
                  const useSections = test.settings?.useSections;

                  return (
                    <tr key={test._id}>
                      <td>
                        <div>
                          <strong>{test.title}</strong>
                          {test.description && (
                            <div className="text-muted small">
                              {test.description.substring(0, 60)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{getTestTypeDisplay(test.testType)}</td>
                      <td>
                        {test.skills.map((skill, index) => (
                          <Badge key={index} color="info" className="me-1 mb-1">
                            {skill}
                          </Badge>
                        ))}
                      </td>
                      <td>
                        {useSections ? (
                          <div>
                            <Badge color="success" className="me-1">
                              📚 {sectionCount} sections
                            </Badge>
                            <div className="small text-muted">
                              Timed sections
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Badge color="secondary">
                              📝 Single section
                            </Badge>
                            <div className="small text-muted">
                              Traditional test
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark" id={`questions-${test._id}`}>
                          {questionCount} questions
                        </span>
                        {useSections && (
                          <Tooltip
                            placement="top"
                            isOpen={tooltipOpen[test._id]}
                            target={`questions-${test._id}`}
                            toggle={() => toggleTooltip(test._id)}
                          >
                            Questions distributed across {sectionCount} sections
                          </Tooltip>
                        )}
                      </td>
                      <td>
                        <div className="small">
                          <div><strong>{totalTime} min</strong></div>
                          {useSections && (
                            <div className="text-muted">
                              ({Math.round(totalTime / sectionCount)} min/section avg)
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{getStatusBadge(test.status)}</td>
                      <td>
                        <small>
                          <div>Attempts: {test.stats?.totalAttempts ?? 0}</div>
                          <div>
                            Avg Score: {test.stats?.averageScore?.toFixed(1) ?? 0}%
                          </div>
                          <div>
                            Pass Rate: {test.stats?.passRate?.toFixed(1) ?? 0}%
                          </div>
                        </small>
                      </td>
                      <td>
                        <small>
                          {new Date(test.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-muted">
                            {test.createdBy?.profile?.firstName}{" "}
                            {test.createdBy?.profile?.lastName}
                          </span>
                        </small>
                      </td>
                      <td>
                        <div className="btn-group-vertical btn-group-sm">
                          <Button
                            size="sm"
                            color="outline-primary"
                            onClick={() => navigate(`/admin/tests/${test._id}`)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            color="outline-secondary"
                            onClick={() => navigate(`/admin/tests/${test._id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="outline-info"
                            onClick={() => handleDuplicateTest(test._id)}
                          >
                            Duplicate
                          </Button>
                          {test.status === "draft" && (
                            <Button
                              size="sm"
                              color="outline-success"
                              onClick={() => handleStatusChange(test._id, "published")}
                            >
                              Publish
                            </Button>
                          )}
                          {test.status === "published" && (
                            <Button
                              size="sm"
                              color="outline-warning"
                              onClick={() => handleStatusChange(test._id, "archived")}
                            >
                              Archive
                            </Button>
                          )}
                          <Button
                            size="sm"
                            color="outline-danger"
                            onClick={() => handleDeleteTest(test._id)}
                            disabled={(test.stats?.totalAttempts ?? 0) > 0}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Enhanced Quick Stats */}
      <Row className="mt-4">
        <Col md="2">
          <Card>
            <CardBody className="text-center">
              <h4>{tests.length}</h4>
              <small className="text-muted">Total Tests</small>
            </CardBody>
          </Card>
        </Col>
        <Col md="2">
          <Card>
            <CardBody className="text-center">
              <h4>{tests.filter((t) => t.status === "published").length}</h4>
              <small className="text-muted">Published</small>
            </CardBody>
          </Card>
        </Col>
        <Col md="2">
          <Card>
            <CardBody className="text-center">
              <h4>{tests.filter((t) => t.status === "draft").length}</h4>
              <small className="text-muted">Drafts</small>
            </CardBody>
          </Card>
        </Col>
        <Col md="2">
          <Card>
            <CardBody className="text-center">
              <h4>{tests.filter((t) => t.settings?.useSections).length}</h4>
              <small className="text-muted">Section-Based</small>
            </CardBody>
          </Card>
        </Col>
        <Col md="2">
          <Card>
            <CardBody className="text-center">
              <h4>{tests.reduce((sum, t) => sum + getQuestionCount(t), 0)}</h4>
              <small className="text-muted">Total Questions</small>
            </CardBody>
          </Card>
        </Col>
        <Col md="2">
          <Card>
            <CardBody className="text-center">
              <h4>{tests.reduce((sum, t) => sum + (t.stats?.totalAttempts ?? 0), 0)}</h4>
              <small className="text-muted">Total Attempts</small>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TestManagementPage;