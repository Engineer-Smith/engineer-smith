// src/components/tests/TestBasics.tsx
import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  Badge,
  Alert,
} from "reactstrap";
import type { CreateTestData, TestTemplate, Question } from "../../types";

interface TestBasicsProps {
  testData: CreateTestData;
  setTestData: React.Dispatch<React.SetStateAction<CreateTestData>>;
  onNext: () => void;
  onCancel: () => void;
  setError: (error: string | null) => void;
}

const TEST_TYPES: Array<{
  value: CreateTestData["testType"];
  name: string;
  description: string;
  skills: Question["skill"][];
  icon: string;
}> = [
  {
    value: "single_skill",
    name: "Single Skill",
    description: "Focus on one specific technology or skill",
    skills: [],
    icon: "🎯",
  },
  {
    value: "frontend",
    name: "Frontend Fundamentals",
    description: "HTML, CSS, and JavaScript basics",
    skills: ["html", "css", "javascript"],
    icon: "🎨",
  },
  {
    value: "react_focused",
    name: "React Developer",
    description: "React components, hooks, and JavaScript",
    skills: ["javascript", "react"],
    icon: "⚛️",
  },
  {
    value: "full_stack",
    name: "Full Stack Developer",
    description: "Frontend, backend, and database skills",
    skills: ["html", "css", "javascript", "react", "backend"],
    icon: "🔧",
  },
  {
    value: "mobile",
    name: "Mobile Development",
    description: "React Native or Flutter development",
    skills: ["react-native", "flutter"],
    icon: "📱",
  },
  {
    value: "comprehensive",
    name: "Comprehensive Assessment",
    description: "Wide range of development skills",
    skills: ["html", "css", "javascript", "react", "backend", "python"],
    icon: "🚀",
  },
  {
    value: "custom",
    name: "Custom Test",
    description: "Choose your own combination of skills",
    skills: [],
    icon: "⚙️",
  },
];

const AVAILABLE_SKILLS: Array<{
  value: Question["skill"];
  name: string;
  color: string;
}> = [
  { value: "html", name: "HTML", color: "danger" },
  { value: "css", name: "CSS", color: "info" },
  { value: "javascript", name: "JavaScript", color: "warning" },
  { value: "react", name: "React", color: "primary" },
  { value: "flutter", name: "Flutter", color: "info" },
  { value: "react-native", name: "React Native", color: "primary" },
  { value: "backend", name: "Backend/Express", color: "success" },
  { value: "python", name: "Python", color: "warning" },
];

const TestBasics: React.FC<TestBasicsProps> = ({
  testData,
  setTestData,
  onNext,
  onCancel,
  setError,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TestTemplate | null>(null);
  const [showCustomSkills, setShowCustomSkills] = useState(false);

  useEffect(() => {
    // Auto-select skills based on test type
    if (testData.testType && testData.testType !== "custom") {
      const typeInfo = TEST_TYPES.find(t => t.value === testData.testType);
      const autoSkills: Question["skill"][] = typeInfo ? typeInfo.skills : [];
      
      if (autoSkills.length > 0) {
        setTestData(prev => ({
          ...prev,
          skills: autoSkills,
        }));
      }
    }
    
    setShowCustomSkills(testData.testType === "custom" || testData.testType === "single_skill");
  }, [testData.testType, setTestData]);

  const handleTestTypeSelect = (testType: CreateTestData["testType"]) => {
    setTestData(prev => ({
      ...prev,
      testType,
      skills: [],
    }));
    setSelectedTemplate(null);
  };

  const handleSkillToggle = (skillValue: Question["skill"]) => {
    setTestData(prev => ({
      ...prev,
      skills: prev.skills.includes(skillValue)
        ? prev.skills.filter(s => s !== skillValue)
        : [...prev.skills, skillValue],
    }));
  };

  const handleNext = () => {
    setError(null);
    
    if (!testData.title.trim()) {
      setError("Test title is required");
      return;
    }
    
    if (!testData.description.trim()) {
      setError("Test description is required");
      return;
    }
    
    if (!testData.testType) {
      setError("Please select a test type");
      return;
    }
    
    if (testData.skills.length === 0) {
      setError("Please select at least one skill");
      return;
    }
    
    onNext();
  };

  return (
    <div>
      {/* Basic Information */}
      <div className="mb-4">
        <h5>Basic Information</h5>
        <Row>
          <Col md="6">
            <FormGroup>
              <Label for="testTitle">Test Title *</Label>
              <Input
                type="text"
                id="testTitle"
                value={testData.title}
                onChange={(e) => setTestData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Frontend Developer Assessment"
              />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label for="testCategory">Category</Label>
              <Input
                type="text"
                id="testCategory"
                value={testData.category || ""}
                onChange={(e) => setTestData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Technical Assessment"
              />
            </FormGroup>
          </Col>
        </Row>
        
        <FormGroup>
          <Label for="testDescription">Description *</Label>
          <Input
            type="textarea"
            id="testDescription"
            rows={3}
            value={testData.description}
            onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this test covers and what skills it evaluates..."
          />
        </FormGroup>
        
        <FormGroup>
          <Label for="testInstructions">Instructions for Test Takers</Label>
          <Input
            type="textarea"
            id="testInstructions"
            rows={3}
            value={testData.instructions || ""}
            onChange={(e) => setTestData(prev => ({ ...prev, instructions: e.target.value }))}
            placeholder="Any special instructions, tips, or requirements for students taking this test..."
          />
        </FormGroup>
      </div>

      {/* Test Type Selection */}
      <div className="mb-4">
        <h5>Test Type</h5>
        <p className="text-muted mb-3">Choose the type of test that best fits your assessment needs.</p>
        
        <Row>
          {TEST_TYPES.map((type) => (
            <Col md="6" lg="4" key={type.value} className="mb-3">
              <Card
                className={`h-100 cursor-pointer ${
                  testData.testType === type.value ? "border-primary bg-light" : "border-light"
                }`}
                onClick={() => handleTestTypeSelect(type.value)}
                style={{ cursor: "pointer", transition: "all 0.2s ease" }}
              >
                <CardBody className="text-center p-3">
                  <div style={{ fontSize: "2rem" }} className="mb-2">
                    {type.icon}
                  </div>
                  <h6 className="mb-2">{type.name}</h6>
                  <p className="text-muted small mb-2">{type.description}</p>
                  {type.skills.length > 0 && (
                    <Badge color="secondary" className="small">
                      {type.skills.length} skill{type.skills.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  {testData.testType === type.value && (
                    <div className="mt-2">
                      <Badge color="primary">Selected</Badge>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Skills Selection */}
      {testData.testType && (
        <div className="mb-4">
          <h5>Skills to Assess</h5>
          
          {!showCustomSkills && testData.skills.length > 0 && (
            <Alert color="info" className="mb-3">
              <strong>
                Auto-selected skills for {TEST_TYPES.find(t => t.value === testData.testType)?.name}:
              </strong>
              <div className="mt-2">
                {testData.skills.map(skill => {
                  const skillInfo = AVAILABLE_SKILLS.find(s => s.value === skill);
                  return skillInfo ? (
                    <Badge key={skill} color={skillInfo.color} className="me-2 mb-1">
                      {skillInfo.name}
                    </Badge>
                  ) : null;
                })}
              </div>
              <div className="mt-2">
                <Button
                  color="outline-primary"
                  size="sm"
                  onClick={() => setShowCustomSkills(true)}
                >
                  Customize Skills
                </Button>
              </div>
            </Alert>
          )}
          
          {showCustomSkills && (
            <div>
              <p className="text-muted mb-3">
                Select the skills you want to include in this test:
              </p>
              <div className="skill-selection">
                {AVAILABLE_SKILLS.map((skill) => (
                  <div key={skill.value} className="form-check form-check-inline mb-2">
                    <Input
                      type="checkbox"
                      id={`skill-${skill.value}`}
                      checked={testData.skills.includes(skill.value)}
                      onChange={() => handleSkillToggle(skill.value)}
                      className="form-check-input"
                    />
                    <Label for={`skill-${skill.value}`} className="form-check-label">
                      <Badge color={skill.color} className="ms-1">
                        {skill.name}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
              
              {testData.skills.length > 0 && (
                <div className="mt-3">
                  <strong>Selected skills:</strong>
                  <div className="mt-1">
                    {testData.skills.map(skill => {
                      const skillInfo = AVAILABLE_SKILLS.find(s => s.value === skill);
                      return skillInfo ? (
                        <Badge key={skill} color={skillInfo.color} className="me-2 mb-1">
                          {skillInfo.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="d-flex justify-content-between pt-3 border-top">
        <Button color="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleNext}>
          Next: Test Structure
        </Button>
      </div>
    </div>
  );
};

export default TestBasics;