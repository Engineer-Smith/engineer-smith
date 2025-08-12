import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, CardTitle, CardText } from "reactstrap";

const features = [
  {
    title: "User Management",
    description: "View, edit, and manage all users in the system.",
    path: "/admin/users",
  },
  {
    title: "Question Bank",
    description: "Review, approve, and edit submitted questions.",
    path: "/admin/question-bank",
  },
  {
    title: "Manage Tests",
    description: "Create, edit, and organize tests for users.",
    path: "/admin/tests",
  },
  {
    title: "Test Sessions",
    description: "Monitor active test sessions and results.",
    path: "/admin/test-sessions",
  },
  {
    title: "Analytics",
    description: "View performance metrics and usage analytics.",
    path: "/admin/analytics",
  },
  {
    title: "System Health",
    description: "Check server health and performance statistics.",
    path: "/admin/system-health",
  },
  {
    title: "Settings",
    description: "Manage application configuration and permissions.",
    path: "/admin/settings",
  },
];

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container className="py-4">
      <h1 className="h2 mb-4 font-weight-bold">
        Welcome, {user?.profile?.firstName || "Admin"}
      </h1>
      <Row className="g-4">
        {features.map((feature, idx) => (
          <Col key={idx} sm="6" lg="4">
            <Card
              className="h-100 border-0 shadow-sm transition-hover"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(feature.path)}
            >
              <CardBody>
                <CardTitle tag="h3" className="h5 mb-3 font-weight-bold">
                  {feature.title}
                </CardTitle>
                <CardText className="text-muted">{feature.description}</CardText>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AdminDashboardPage;