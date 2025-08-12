import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button } from "reactstrap";

const skills = [
  { name: "HTML", skill: "html", description: "Questions about HTML structure and semantics." },
  { name: "CSS", skill: "css", description: "Questions about styling and layouts." },
  { name: "JavaScript", skill: "javascript", description: "Questions about JavaScript programming." },
  { name: "React", skill: "react", description: "Questions about React components and hooks." },
  { name: "Flutter", skill: "flutter", description: "Questions about Flutter app development." },
  { name: "React Native", skill: "react_native", description: "Questions about mobile app development with React Native." },
  { name: "Backend", skill: "backend", description: "Questions about Node.js, Express, and server-side logic." },
];

const QuestionBankPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-4">
      <h1 className="h2 mb-4 font-weight-bold">Question Bank</h1>
      <Row className="g-4">
        <Col md="4">
          <Card className="h-100 border-0 shadow-sm transition-hover" style={{ cursor: "pointer" }} onClick={() => navigate("/admin/question-bank/add")}>
            <CardBody>
              <CardTitle tag="h3" className="h5 mb-3 font-weight-bold">
                Add New Question
              </CardTitle>
              <CardText className="text-muted">Create a new question for the bank.</CardText>
              <Button color="primary" size="sm">
                Add Question
              </Button>
            </CardBody>
          </Card>
        </Col>
        {skills.map((skill) => (
          <Col key={skill.skill} md="4">
            <Card className="h-100 border-0 shadow-sm transition-hover" style={{ cursor: "pointer" }} onClick={() => navigate(`/admin/question-bank/${skill.skill}`)}>
              <CardBody>
                <CardTitle tag="h3" className="h5 mb-3 font-weight-bold">
                  {skill.name}
                </CardTitle>
                <CardText className="text-muted">{skill.description}</CardText>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default QuestionBankPage;