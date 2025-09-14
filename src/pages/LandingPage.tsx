import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Badge,
  Progress
} from 'reactstrap';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDemo, setCurrentDemo] = useState(0);

  const demoScenarios = [
    {
      type: 'Code Challenge',
      language: 'JavaScript',
      question: 'Implement a function to find the longest palindrome',
      code: `function longestPalindrome(s) {
  // Your implementation here
  return "";
}`,
      difficulty: 'Medium',
      points: 15
    },
    {
      type: 'Fill-in-the-Blank',
      language: 'Python',
      question: 'Complete the binary search implementation',
      code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + ______) // 2
        # ... rest of implementation`,
      difficulty: 'Easy',
      points: 8
    },
    {
      type: 'Code Debugging',
      language: 'React',
      question: 'Fix the infinite re-render loop',
      code: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }); // Missing dependency array`,
      difficulty: 'Hard',
      points: 20
    }
  ];

  const useCases = [
    {
      icon: '👨‍🎓',
      title: 'Individual Learners',
      description: 'Take comprehensive coding assessments, track progress, and validate your skills across multiple programming languages.',
      features: ['Self-paced learning', 'Progress tracking', 'Skill validation', 'Career development'],
      cta: 'Explore Individual Learning',
      path: '/for-individuals'
    },
    {
      icon: '🏫',
      title: 'Educational Organizations', 
      description: 'Complete institutional management with custom content creation, role-based access, and detailed analytics.',
      features: ['Student management', 'Custom assessments', 'Instructor tools', 'Analytics dashboard'],
      cta: 'Learn About Organizations',
      path: '/for-organizations'
    },
    {
      icon: '🎯',
      title: 'Assessment Platform',
      description: 'Advanced testing infrastructure with multiple question types, auto-grading, and real-time code execution.',
      features: ['Code challenges', 'Auto-grading', 'Multiple formats', 'Secure execution'],
      cta: 'Explore Features',
      path: '/features'
    }
  ];

  const quickStats = [
    { number: '12', label: 'Programming Languages' },
    { number: '5', label: 'Question Types' },
    { number: '3', label: 'User Roles' },
    { number: '∞', label: 'Organizations' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoScenarios.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing-page">
      <style>{`
        .hero-bg {
          background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%);
          min-height: 90vh;
        }
        .code-demo {
          background: #1a1a1a;
          border-radius: 12px;
          border: 1px solid #333;
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.9rem;
        }
        .text-cyan {
          color: #67e8f9 !important;
        }
        .use-case-card {
          transition: all 0.3s ease;
          border: none;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .use-case-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .stats-section {
          background: linear-gradient(45deg, #f8f9fa, #e9ecef);
        }
        .feature-highlight {
          background: rgba(99, 102, 241, 0.05);
          border-left: 3px solid #6366f1;
          padding: 1rem;
          border-radius: 0 8px 8px 0;
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-bg d-flex align-items-center text-white position-relative overflow-hidden">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className="mb-3">
                <Badge color="warning" className="px-3 py-2 mb-3 fs-6">
                  Professional Assessment Platform
                </Badge>
              </div>
              <h1 className="display-3 fw-bold mb-4">
                EngineerSmith
                <span className="d-block text-cyan fs-2">
                  Code Assessment & Testing Platform
                </span>
              </h1>
              <p className="lead mb-4 fs-4">
                Comprehensive educational testing platform with advanced code execution, 
                intelligent grading, and organizational management.
              </p>
              
              <div className="d-flex flex-wrap gap-2 mb-4">
                <Badge color="success" className="px-3 py-2">Auto-Grading Engine</Badge>
                <Badge color="info" className="px-3 py-2">Multi-Language Support</Badge>
                <Badge color="warning" className="px-3 py-2">Real-time Testing</Badge>
              </div>

              <div className="d-flex gap-3 mb-4 flex-wrap">
                <Button 
                  size="lg" 
                  color="warning"
                  className="px-4 py-3"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                  className="px-4 py-3"
                  onClick={() => navigate('/demo')}
                >
                  View Demo
                </Button>
              </div>

              <p className="mb-0 opacity-75">
                Individual learners • Educational institutions • Enterprise teams
              </p>
            </Col>

            <Col lg={6}>
              <Card className="code-demo text-light">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Badge color="primary">{demoScenarios[currentDemo].language}</Badge>
                      <Badge color="secondary">{demoScenarios[currentDemo].type}</Badge>
                      <Badge 
                        color={
                          demoScenarios[currentDemo].difficulty === 'Easy' ? 'success' : 
                          demoScenarios[currentDemo].difficulty === 'Medium' ? 'warning' : 'danger'
                        }
                      >
                        {demoScenarios[currentDemo].difficulty}
                      </Badge>
                    </div>
                    <span className="text-warning">{demoScenarios[currentDemo].points} pts</span>
                  </div>
                  
                  <h6 className="text-cyan mb-3">
                    {demoScenarios[currentDemo].question}
                  </h6>
                  
                  <pre className="text-light mb-3" style={{fontSize: '0.85rem'}}>
                    <code>{demoScenarios[currentDemo].code}</code>
                  </pre>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-success">
                      <i className="fas fa-check-circle me-1"></i>
                      Auto-graded with test cases
                    </small>
                    <Button size="sm" color="success">
                      <i className="fas fa-play me-1"></i>
                      Run Tests
                    </Button>
                  </div>
                  
                  <div className="mt-3">
                    <Progress value={(currentDemo + 1) * 33} color="info" className="mb-1" />
                    <small className="text-muted">Question {currentDemo + 1} of 3 in demo</small>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Quick Stats */}
      <section className="stats-section py-4">
        <Container>
          <Row>
            {quickStats.map((stat, index) => (
              <Col md={3} key={index} className="text-center mb-3">
                <h2 className="display-6 fw-bold text-primary mb-1">{stat.number}</h2>
                <p className="mb-0 text-muted">{stat.label}</p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Use Cases */}
      <section className="py-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              <h2 className="display-5 fw-bold mb-3">
                Built for Every Learning Environment
              </h2>
              <p className="lead text-muted">
                Whether you're an individual learner, educational institution, or exploring our platform capabilities,
                we have solutions tailored to your needs.
              </p>
            </Col>
          </Row>
          
          <Row>
            {useCases.map((useCase, index) => (
              <Col lg={4} key={index} className="mb-4">
                <Card className="use-case-card h-100">
                  <CardBody className="text-center p-4">
                    <div className="display-4 mb-3">{useCase.icon}</div>
                    <CardTitle tag="h4" className="mb-3">{useCase.title}</CardTitle>
                    <CardText className="mb-4">{useCase.description}</CardText>
                    
                    <div className="feature-highlight mb-4">
                      <ul className="list-unstyled mb-0 small">
                        {useCase.features.map((feature, idx) => (
                          <li key={idx} className="mb-1">
                            <i className="fas fa-check text-success me-2"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      color="primary" 
                      outline 
                      className="px-4"
                      onClick={() => navigate(useCase.path)}
                    >
                      {useCase.cta}
                    </Button>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Language Support Preview */}
      <section className="py-5 bg-light">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h3 className="fw-bold mb-3">Multi-Language Assessment Engine</h3>
              <p className="lead text-muted mb-4">
                Comprehensive support for modern programming languages with secure code execution and intelligent validation.
              </p>
              
              <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
                <Badge color="success" className="px-3 py-2">JavaScript</Badge>
                <Badge color="success" className="px-3 py-2">Python</Badge>
                <Badge color="success" className="px-3 py-2">React/JSX</Badge>
                <Badge color="success" className="px-3 py-2">TypeScript</Badge>
                <Badge color="success" className="px-3 py-2">Flutter</Badge>
                <Badge color="success" className="px-3 py-2">SQL</Badge>
                <Badge color="success" className="px-3 py-2">HTML/CSS</Badge>
                <Badge color="info" className="px-3 py-2">+ More</Badge>
              </div>

              <Button 
                color="primary" 
                outline 
                size="lg"
                onClick={() => navigate('/languages')}
              >
                View All Languages & Features
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="hero-bg d-flex align-items-center text-white py-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-5 fw-bold mb-4">
                Ready to Start?
              </h2>
              <p className="lead mb-4">
                Join thousands of learners and educators using our comprehensive assessment platform.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button 
                  size="lg" 
                  color="warning"
                  className="px-5 py-3"
                  onClick={() => navigate('/register')}
                >
                  <i className="fas fa-rocket me-2"></i>
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                  className="px-5 py-3"
                  onClick={() => navigate('/login')}
                >
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Sign In
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;