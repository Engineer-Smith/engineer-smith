import React from 'react';
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
  Alert
} from 'reactstrap';

const ForIndividualsPage: React.FC = () => {
  const testingCategories = [
    {
      title: 'Technical Skill Assessment',
      icon: '⚡',
      description: 'Comprehensive evaluation of your programming fundamentals and problem-solving abilities.',
      skills: ['Syntax mastery', 'Logic and reasoning', 'Code comprehension', 'Best practices'],
      languages: ['JavaScript', 'Python', 'HTML/CSS'],
      testTypes: ['Fill-in-the-Blank', 'Multiple Choice', 'True/False', 'Code Analysis'],
      outcome: 'Validate core programming knowledge and identify areas for improvement'
    },
    {
      title: 'Advanced Problem Solving',
      icon: '🧩',
      description: 'Challenge yourself with complex algorithmic thinking and optimization problems.',
      skills: ['Algorithm design', 'Data structure application', 'Performance optimization', 'Debugging'],
      languages: ['JavaScript', 'Python', 'TypeScript', 'React', 'SQL'],
      testTypes: ['Code Challenges', 'Debugging Exercises', 'Architecture Questions'],
      outcome: 'Demonstrate professional-level problem-solving and technical reasoning skills'
    },
    {
      title: 'Interview Preparation',
      icon: '🎯',
      description: 'Practice with real interview-style questions and coding challenges.',
      skills: ['Live coding simulation', 'Time management', 'Communication', 'Technical explanation'],
      languages: ['All supported languages', 'Framework-specific questions', 'System design'],
      testTypes: ['Timed Assessments', 'Code Challenges', 'Technical Interviews'],
      outcome: 'Build confidence and readiness for technical interviews and job applications'
    }
  ];

  const testingBenefits = [
    {
      title: 'Comprehensive Skill Evaluation',
      icon: '📊',
      description: 'Get detailed insights into your technical abilities across multiple programming areas.',
      features: [
        'Detailed performance analytics and scoring',
        'Strengths and weakness identification',
        'Skill-level benchmarking against industry standards',
        'Progress tracking over time',
        'Personalized improvement recommendations'
      ]
    },
    {
      title: 'Flexible Testing Environment',
      icon: '🕒',
      description: 'Take assessments on your schedule with a user-friendly testing interface.',
      features: [
        'Access tests 24/7 from any device',
        'No installation required - browser-based testing',
        'Save and resume progress on longer assessments',
        'Multiple attempt options for skill validation',
        'Immediate feedback and detailed explanations'
      ]
    },
    {
      title: 'Career Readiness Validation',
      icon: '🏆',
      description: 'Prove your skills with industry-relevant assessments and certifications.',
      features: [
        'Employer-recognized skill verification',
        'Portfolio-worthy assessment results',
        'Interview preparation with real scenarios',
        'Certification badges for LinkedIn profiles',
        'Competitive benchmarking data'
      ]
    },
    {
      title: 'Continuous Improvement Tracking',
      icon: '📈',
      description: 'Monitor your progress and track skill development over time.',
      features: [
        'Historical performance comparison',
        'Skill progression visualization',
        'Goal setting and achievement tracking',
        'Weakness-focused practice recommendations',
        'Regular assessment updates and new content'
      ]
    }
  ];

  const assessmentAreas = [
    {
      category: 'Programming Fundamentals',
      description: 'Core concepts every developer should master',
      skills: [
        { name: 'Variables & Data Types', difficulty: 'Beginner', available: true },
        { name: 'Control Structures & Logic', difficulty: 'Beginner', available: true },
        { name: 'Functions & Scope', difficulty: 'Intermediate', available: true },
        { name: 'Object-Oriented Concepts', difficulty: 'Intermediate', available: true }
      ]
    },
    {
      category: 'Data Structures & Algorithms',
      description: 'Essential problem-solving and optimization skills',
      skills: [
        { name: 'Arrays & String Manipulation', difficulty: 'Beginner', available: true },
        { name: 'Sorting & Searching Algorithms', difficulty: 'Intermediate', available: true },
        { name: 'Trees & Graph Traversal', difficulty: 'Advanced', available: false },
        { name: 'Dynamic Programming', difficulty: 'Advanced', available: false }
      ]
    },
    {
      category: 'Web Development',
      description: 'Modern web technologies and frameworks',
      skills: [
        { name: 'HTML Structure & Semantics', difficulty: 'Beginner', available: true },
        { name: 'CSS Styling & Layout', difficulty: 'Beginner', available: true },
        { name: 'JavaScript DOM Manipulation', difficulty: 'Intermediate', available: true },
        { name: 'React Component Development', difficulty: 'Intermediate', available: true }
      ]
    },
    {
      category: 'Database & Backend',
      description: 'Server-side development and data management',
      skills: [
        { name: 'SQL Query Writing', difficulty: 'Beginner', available: true },
        { name: 'Database Relationships', difficulty: 'Intermediate', available: true },
        { name: 'API Design & Implementation', difficulty: 'Advanced', available: false },
        { name: 'System Architecture', difficulty: 'Advanced', available: false }
      ]
    }
  ];

  return (
    <div className="individuals-page" style={{ paddingTop: '80px' }}>
      <style>{`
        .hero-bg {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
          min-height: 70vh;
        }
        .feature-card {
          transition: all 0.3s ease;
          border: none;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          height: 100%;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .category-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-left: 4px solid #3b82f6;
        }
        .benefit-highlight {
          background: rgba(59, 130, 246, 0.05);
          border-left: 3px solid #3b82f6;
          padding: 1rem;
          border-radius: 0 8px 8px 0;
          margin: 1rem 0;
        }
        .skill-category {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-bg d-flex align-items-center text-white">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <Badge color="warning" className="px-3 py-2 mb-3 fs-6">
                Skill Assessment Platform
              </Badge>
              <h1 className="display-4 fw-bold mb-4">
                Test Your Coding Skills
              </h1>
              <p className="lead mb-4 fs-4">
                Comprehensive programming assessments to validate your technical abilities, 
                prepare for interviews, and track your skill development over time.
              </p>
              
              <div className="d-flex flex-wrap gap-2 mb-4">
                <Badge color="light" className="px-3 py-2 text-dark">Skill Validation</Badge>
                <Badge color="light" className="px-3 py-2 text-dark">Interview Prep</Badge>
                <Badge color="light" className="px-3 py-2 text-dark">Progress Tracking</Badge>
              </div>

              <div className="d-flex gap-3 mb-4 flex-wrap">
                <Button 
                  size="lg" 
                  color="warning"
                  className="px-4 py-3"
                >
                  Start Testing
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                  className="px-4 py-3"
                >
                  View Sample Questions
                </Button>
              </div>
            </Col>
            
            <Col lg={6}>
              <Card className="bg-white text-dark">
                <CardBody>
                  <h5 className="text-primary mb-3">
                    Assessment Overview
                  </h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Available Test Categories</span>
                      <Badge color="primary">4</Badge>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Supported Languages</span>
                      <Badge color="success">12</Badge>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Question Types</span>
                      <Badge color="info">5</Badge>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h6 className="mb-2">Currently Available:</h6>
                    <div className="d-flex flex-wrap gap-1 mb-2">
                      <Badge color="success" className="small">Fill-in-the-Blank</Badge>
                      <Badge color="success" className="small">Multiple Choice</Badge>
                      <Badge color="success" className="small">True/False</Badge>
                      <Badge color="success" className="small">Code Challenges</Badge>
                      <Badge color="success" className="small">Debugging</Badge>
                    </div>
                    <div className="d-flex flex-wrap gap-1">
                      <Badge color="secondary" className="small">Practice Coding</Badge>
                      <small className="text-muted ms-1">Coming Soon</small>
                    </div>
                  </div>
                  
                  <Button size="sm" color="primary" className="w-100">
                    Explore Assessments
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testing Categories */}
      <section className="py-5">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-6 fw-bold mb-3">
                Comprehensive Testing Categories
              </h2>
              <p className="lead text-muted">
                Evaluate your programming skills across different complexity levels 
                and prepare for real-world technical challenges.
              </p>
            </Col>
          </Row>

          <Row>
            {testingCategories.map((category, index) => (
              <Col lg={4} key={index} className="mb-4">
                <Card className="category-card h-100">
                  <CardBody>
                    <div className="d-flex align-items-center mb-3">
                      <span className="fs-1 me-3">{category.icon}</span>
                      <CardTitle tag="h4" className="mb-0">{category.title}</CardTitle>
                    </div>
                    
                    <CardText className="mb-3">{category.description}</CardText>
                    
                    <div className="mb-3">
                      <h6 className="text-primary">Assessment Focus:</h6>
                      <ul className="small">
                        {category.skills.map((skill, idx) => (
                          <li key={idx}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="text-primary">Languages Covered:</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {category.languages.map((lang, idx) => (
                          <Badge key={idx} color="secondary" className="small">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="text-primary">Test Types:</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {category.testTypes.map((type, idx) => (
                          <Badge key={idx} color="info" className="small">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="benefit-highlight">
                      <small className="text-primary">
                        <strong>Outcome:</strong> {category.outcome}
                      </small>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testing Benefits */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-6 fw-bold mb-3">
                Why Use Our Assessment Platform?
              </h2>
              <p className="lead text-muted">
                Designed for developers who want to validate their skills, 
                prepare for interviews, and track their technical growth.
              </p>
            </Col>
          </Row>

          <Row>
            {testingBenefits.map((benefit, index) => (
              <Col lg={6} key={index} className="mb-4">
                <Card className="feature-card">
                  <CardBody>
                    <div className="d-flex align-items-center mb-3">
                      <span className="fs-1 me-3">{benefit.icon}</span>
                      <CardTitle tag="h4" className="mb-0">{benefit.title}</CardTitle>
                    </div>
                    
                    <CardText className="mb-3">{benefit.description}</CardText>
                    
                    <div className="benefit-highlight">
                      <ul className="mb-0">
                        {benefit.features.map((feature, idx) => (
                          <li key={idx} className="mb-1">
                            <i className="fas fa-check text-primary me-2"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Assessment Areas */}
      <section className="py-5">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-6 fw-bold mb-3">
                Assessment Areas & Availability
              </h2>
              <p className="lead text-muted">
                Explore the technical skills you can test today, with more 
                advanced assessments and code challenges coming soon.
              </p>
            </Col>
          </Row>

          <Row>
            {assessmentAreas.map((area, index) => (
              <Col lg={6} key={index} className="mb-4">
                <div className="skill-category">
                  <h5 className="text-primary mb-2">{area.category}</h5>
                  <p className="text-muted small mb-3">{area.description}</p>
                  {area.skills.map((skill, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <span className={skill.available ? 'fw-semibold' : 'text-muted'}>
                          {skill.name}
                        </span>
                        <Badge 
                          color={skill.difficulty === 'Beginner' ? 'success' : skill.difficulty === 'Intermediate' ? 'warning' : 'danger'} 
                          className="ms-2 small"
                        >
                          {skill.difficulty}
                        </Badge>
                      </div>
                      {skill.available ? (
                        <Badge color="success" className="small">Available</Badge>
                      ) : (
                        <Badge color="secondary" className="small">Coming Soon</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Col>
            ))}
          </Row>

          <Row className="mt-4">
            <Col lg={8} className="mx-auto">
              <Alert color="info">
                <h5 className="alert-heading">
                  <i className="fas fa-code me-2"></i>
                  Practice Coding Environment Coming Soon
                </h5>
                <p className="mb-0">
                  We're developing an interactive practice environment for hands-on coding exercises 
                  and interview preparation. This will complement our certificate assessments with 
                  practical coding challenges to help you prepare for technical interviews.
                </p>
              </Alert>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h3 className="fw-bold mb-3">Ready to Test Your Skills?</h3>
              <p className="lead mb-4">
                Start with our available assessments today and prepare for the 
                upcoming practice coding features.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button 
                  size="lg" 
                  color="warning"
                >
                  Create Free Account
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                >
                  Try Sample Test
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                >
                  View All Languages
                </Button>
              </div>
              <p className="mt-3 mb-0">
                <small>
                  <i className="fas fa-check me-2"></i>
                  Free to start • No installation required • Immediate results
                </small>
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ForIndividualsPage;