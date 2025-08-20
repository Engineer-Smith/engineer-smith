import React, { useState, useEffect } from 'react';
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
  Progress,
  Alert
} from 'reactstrap';

interface LandingPageProps {
  onNavigate?: (path: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate = () => {} }) => {
  const [typewriterText, setTypewriterText] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState(0);

  const languages = ['JavaScript', 'Python', 'React', 'TypeScript', 'SQL', 'CSS'];
  const codeExamples = [
    'const result = fibonacci(10);',
    'def calculate_score(answers):',
    'function TestComponent() {',
    'interface User { id: string; }',
    'SELECT * FROM users WHERE active = 1;',
    '.container { display: flex; }'
  ];

  // Inline styles for animations and custom styling
  const styles = {
    heroSection: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      color: 'white'
    },
    typewriter: {
      fontFamily: '"Courier New", monospace',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '1rem',
      borderRadius: '8px',
      borderLeft: '4px solid #ffc107',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center'
    },
    featureCard: {
      transition: 'all 0.3s ease',
      border: 'none',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      height: '100%'
    },
    techBadge: {
      margin: '0.25rem',
      fontSize: '0.9rem',
      transition: 'transform 0.2s ease',
      cursor: 'pointer'
    },
    statsSection: {
      background: 'linear-gradient(45deg, #f8f9fa, #e9ecef)',
      padding: '4rem 0'
    },
    floating: {
      animation: 'floating 3s ease-in-out infinite'
    },
    sectionPadding: {
      padding: '5rem 0'
    },
    ctaSection: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }
  };

  // Typewriter effect
  useEffect(() => {
    const text = codeExamples[currentLanguage];
    let i = 0;
    setTypewriterText('');
    
    const timer = setInterval(() => {
      if (i < text.length) {
        setTypewriterText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setCurrentLanguage((prev) => (prev + 1) % languages.length);
        }, 2000);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [currentLanguage]);

  const features = [
    {
      icon: '🌍',
      title: 'Global Certification Platform',
      description: 'Access comprehensive coding assessments covering 10+ programming languages. Perfect for individual skill validation and career development.'
    },
    {
      icon: '🏢',
      title: 'Custom Organizations',
      description: 'Create dedicated spaces for your team, school, or company with custom content, user management, and tailored assessments.'
    },
    {
      icon: '👥',
      title: 'Flexible Role System',
      description: 'Individual access or team-based roles: Admins manage organizations, Instructors create content, Students take assessments.'
    },
    {
      icon: '📚',
      title: 'Dual Content System',
      description: 'Access global certification content plus create organization-specific assessments for customized learning paths.'
    },
    {
      icon: '📊',
      title: 'Comprehensive Analytics',
      description: 'Individual progress tracking for personal use, plus organizational analytics for team performance and learning insights.'
    },
    {
      icon: '🔐',
      title: 'Secure & Accessible',
      description: 'Username/email login, SSO support, offline capabilities, and enterprise security features for any environment.'
    }
  ];

  const supportedTechnologies = [
    { name: 'JavaScript', color: 'warning', icon: '🟨' },
    { name: 'Python', color: 'primary', icon: '🐍' },
    { name: 'React', color: 'info', icon: '⚛️' },
    { name: 'TypeScript', color: 'primary', icon: '🔷' },
    { name: 'HTML/CSS', color: 'danger', icon: '🎨' },
    { name: 'SQL', color: 'secondary', icon: '🗃️' },
    { name: 'Express', color: 'success', icon: '🚀' },
    { name: 'Flutter', color: 'info', icon: '📱' },
    { name: 'React Native', color: 'dark', icon: '📲' },
    { name: 'JSON', color: 'warning', icon: '📋' }
  ];

  const stats = [
    { number: '3', label: 'User Roles', icon: '👥' },
    { number: '2', label: 'Question Bank Types', icon: '📚' },
    { number: '10+', label: 'Programming Languages', icon: '💻' },
    { number: '∞', label: 'Organizations', icon: '🏢' }
  ];

  return (
    <div className="landing-page">
      {/* CSS Animations */}
      <style>{`
        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .code-cursor::after {
          content: '|';
          animation: blink 1s infinite;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        .tech-badge:hover {
          transform: scale(1.05);
        }
      `}</style>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Comprehensive Coding Assessment Platform
                <span className="d-block text-warning">For Individuals & Organizations</span>
              </h1>
              <p className="lead mb-4">
                Complete coding certification solution supporting individual learners 
                and organizational needs. Take global assessments or create custom 
                content with role-based access control and detailed analytics.
              </p>
              <div className="d-flex gap-3 mb-4 flex-wrap">
                <Button 
                  size="lg" 
                  color="warning" 
                  className="px-4"
                  onClick={() => onNavigate('/register')}
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light" 
                  className="px-4"
                  onClick={() => onNavigate('/login')}
                >
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Sign In
                </Button>
              </div>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <small>Perfect for individual learners and organizations</small>
                <Badge color="success">✓ Global Assessments</Badge>
                <Badge color="info">✓ Custom Organizations</Badge>
              </div>
            </Col>
            <Col lg={6}>
              <div style={styles.floating}>
                <Card className="bg-dark text-light">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Badge color="primary">{languages[currentLanguage]}</Badge>
                      <small className="text-muted">Live Coding Test</small>
                    </div>
                    <div style={styles.typewriter}>
                      <span className="code-cursor">{typewriterText}</span>
                    </div>
                    <div className="mt-3">
                      <small className="text-success">✓ Real-time evaluation</small>
                      <div className="mt-2">
                        <Progress value={75} color="success" className="mb-1" />
                        <small>Test Progress: 75% Complete</small>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <Container>
          <Row>
            {stats.map((stat, index) => (
              <Col md={3} key={index} className="text-center mb-4">
                <div className="display-4 mb-2">{stat.icon}</div>
                <h2 className="display-5 fw-bold text-primary">{stat.number}</h2>
                <p className="lead">{stat.label}</p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.sectionPadding}>
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              <h2 className="display-5 fw-bold">Perfect for Individual Learners & Organizations</h2>
              <p className="lead text-muted">
                Start as an individual taking global assessments, or create custom 
                organizations with team management and tailored content.
              </p>
            </Col>
          </Row>
          <Row>
            {features.map((feature, index) => (
              <Col lg={4} md={6} key={index} className="mb-4">
                <Card className="feature-card h-100" style={styles.featureCard}>
                  <CardBody className="text-center">
                    <div className="display-4 mb-3">{feature.icon}</div>
                    <CardTitle tag="h5">{feature.title}</CardTitle>
                    <CardText>{feature.description}</CardText>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Supported Technologies */}
      <section id="languages" className="bg-light" style={styles.sectionPadding}>
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              <h2 className="display-5 fw-bold">Comprehensive Language Support</h2>
              <p className="lead text-muted">
                Test coding skills across popular programming languages 
                and frameworks with automated evaluation.
              </p>
            </Col>
          </Row>
          <Row>
            <Col className="text-center">
              {supportedTechnologies.map((tech, index) => (
                <Badge
                  key={index}
                  color={tech.color}
                  className="tech-badge me-2 mb-2 p-2"
                  style={{ ...styles.techBadge, fontSize: '1rem' }}
                >
                  {tech.icon} {tech.name}
                </Badge>
              ))}
            </Col>
          </Row>
          <Row className="mt-5">
            <Col md={6} className="text-center mb-4">
              <h5>👤 Individual Learners</h5>
              <p>Take comprehensive coding assessments, track your progress, and validate skills across 10+ programming languages.</p>
            </Col>
            <Col md={6} className="text-center mb-4">
              <h5>🏢 Organizations & Teams</h5>
              <p>Create custom organizations with team management, tailored assessments, and detailed analytics for groups.</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="text-center mb-4">
              <h5>🌍 Global Content</h5>
              <p>Access platform-wide certification assessments available to all users for standardized skill validation.</p>
            </Col>
            <Col md={4} className="text-center mb-4">
              <h5>🎯 Custom Content</h5>
              <p>Organizations can create specialized assessments tailored to their curriculum or training programs.</p>
            </Col>
            <Col md={4} className="text-center mb-4">
              <h5>📈 Progress Tracking</h5>
              <p>Individual progress for personal use, plus organizational analytics for team performance insights.</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Analytics Section */}
      <section id="analytics" style={styles.sectionPadding}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h2 className="display-5 fw-bold mb-4">Analytics for Every Use Case</h2>
              <p className="lead mb-4">
                Personal progress tracking for individual learners, plus comprehensive 
                organizational analytics for teams and institutions.
              </p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  <strong>Personal Progress:</strong> Individual skill tracking and improvement
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  <strong>Global Benchmarks:</strong> Compare against platform-wide performance
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  <strong>Team Analytics:</strong> Organizational performance insights
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  <strong>Custom Reports:</strong> Tailored analytics for specific needs
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  <strong>Learning Insights:</strong> Identify strengths and areas for improvement
                </li>
              </ul>
              <Button 
                color="primary" 
                size="lg"
                onClick={() => onNavigate('/register')}
              >
                <i className="fas fa-chart-bar me-2"></i>
                Explore Platform
              </Button>
            </Col>
            <Col lg={6}>
              <Card>
                <CardBody>
                  <h5 className="mb-4">
                    <i className="fas fa-analytics me-2"></i>
                    Flexible Access Levels
                  </h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <small><strong>Individual:</strong> Personal Progress</small>
                      <small className="fw-bold">100%</small>
                    </div>
                    <Progress value={100} color="success" className="mb-2" />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <small><strong>Team Lead:</strong> Group Analytics</small>
                      <small className="fw-bold">75%</small>
                    </div>
                    <Progress value={75} color="info" className="mb-2" />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <small><strong>Organization:</strong> Full Analytics</small>
                      <small className="fw-bold">100%</small>
                    </div>
                    <Progress value={100} color="primary" className="mb-2" />
                  </div>
                  <Alert color="info" className="mb-0">
                    <i className="fas fa-chart-line me-2"></i>
                    <small>Appropriate analytics access based on your role and needs</small>
                  </Alert>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section style={{ ...styles.ctaSection, ...styles.sectionPadding }}>
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-5 fw-bold mb-4">Start Your Coding Journey</h2>
              <p className="lead mb-4">
                Begin with individual assessments or create an organization for your team. 
                Flexible platform that grows with your needs.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button 
                  size="lg" 
                  color="warning" 
                  className="px-4"
                  onClick={() => onNavigate('/register')}
                >
                  <i className="fas fa-user-plus me-2"></i>
                  Start Learning
                </Button>
                <Button 
                  size="lg" 
                  color="primary" 
                  className="px-4"
                  onClick={() => onNavigate('/register')}
                >
                  <i className="fas fa-building me-2"></i>
                  Create Organization
                </Button>
              </div>
              <p className="mt-3 mb-0">
                <small>
                  <i className="fas fa-globe me-2"></i>
                  Individual access • Team organizations • Global assessments
                </small>
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-light py-5">
        <Container>
          <Row>
            <Col md={4} className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div 
                  className="me-2 p-2 rounded" 
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    minWidth: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ color: 'white', fontSize: '1.2rem' }}>💻</span>
                </div>
                <h5 className="mb-0">EngineerSmith</h5>
              </div>
              <p className="text-muted">
                A comprehensive coding certification and assessment platform 
                built for educational institutions and organizations.
              </p>
            </Col>
            <Col md={2} className="mb-4">
              <h6>Platform</h6>
              <ul className="list-unstyled">
                <li><a href="#features" className="text-muted text-decoration-none">Features</a></li>
                <li><a href="#languages" className="text-muted text-decoration-none">Languages</a></li>
                <li><a href="#analytics" className="text-muted text-decoration-none">Analytics</a></li>
                <li><button 
                  className="btn btn-link text-muted text-decoration-none p-0"
                  onClick={() => onNavigate('/documentation')}
                >
                  Documentation
                </button></li>
              </ul>
            </Col>
            <Col md={2} className="mb-4">
              <h6>Resources</h6>
              <ul className="list-unstyled">
                <li><button 
                  className="btn btn-link text-muted text-decoration-none p-0"
                  onClick={() => onNavigate('/help')}
                >
                  Help Center
                </button></li>
                <li><button 
                  className="btn btn-link text-muted text-decoration-none p-0"
                  onClick={() => onNavigate('/guides')}
                >
                  Setup Guides
                </button></li>
                <li><button 
                  className="btn btn-link text-muted text-decoration-none p-0"
                  onClick={() => onNavigate('/api')}
                >
                  API Reference
                </button></li>
              </ul>
            </Col>
            <Col md={2} className="mb-4">
              <h6>Support</h6>
              <ul className="list-unstyled">
                <li><button 
                  className="btn btn-link text-muted text-decoration-none p-0"
                  onClick={() => onNavigate('/contact')}
                >
                  Contact
                </button></li>
                <li><button 
                  className="btn btn-link text-muted text-decoration-none p-0"
                  onClick={() => onNavigate('/issues')}
                >
                  Report Issues
                </button></li>
                <li><button 
                  className="btn btn-link text-muted text-decoration-none p-0"
                  onClick={() => onNavigate('/contribute')}
                >
                  Contribute
                </button></li>
              </ul>
            </Col>
            <Col md={2} className="mb-4">
              <h6>Legal</h6>
              <ul className="list-unstyled">
                <li><button 
                  className="btn btn-link text-muted text-decoration-none p-0"
                  onClick={() => onNavigate('/privacy')}
                >
                  Privacy
                </button></li>
                <li><button 
                  className="btn btn-link text-muted text-decoration-none p-0"
                  onClick={() => onNavigate('/terms')}
                >
                  Terms
                </button></li>
                <li><button 
                  className="btn btn-link text-muted text-decoration-none p-0"
                  onClick={() => onNavigate('/license')}
                >
                  License
                </button></li>
              </ul>
            </Col>
          </Row>
          <hr className="my-4" />
          <Row>
            <Col className="text-center">
              <p className="mb-0 text-muted">
                © 2024 EngineerSmith. Open source coding assessment platform.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;