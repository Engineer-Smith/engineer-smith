import React from 'react';
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
  Alert
} from 'reactstrap';

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  const questionTypes = [
    {
      type: 'Code Challenge',
      icon: '💻',
      description: 'Complete programming problems with test case validation and real-time code execution.',
      features: [
        'Multiple test cases with automatic validation',
        'Real-time code execution in secure sandbox',
        'Syntax highlighting and error detection',
        'Support for 12+ programming languages',
        'Automatic scoring based on test results',
        'Performance analysis and optimization hints'
      ],
      example: `function isPalindrome(str) {
  // Write your solution here
  return false;
}

// Test cases will validate:
// isPalindrome("racecar") → true
// isPalindrome("hello") → false
// Additional test cases verify edge cases`,
      difficulty: 'Medium to Hard',
      timeEstimate: '10-30 minutes',
      languages: ['JavaScript', 'Python', 'TypeScript', 'Dart', 'Express.js']
    },
    {
      type: 'Fill-in-the-Blank',
      icon: '📝',
      description: 'Complete code snippets by filling in missing parts with intelligent validation.',
      features: [
        'Context-aware blank placement',
        'Multiple correct answer support',
        'Immediate feedback on answers',
        'Progressive difficulty levels',
        'Syntax-aware grading system',
        'Hint system for guidance'
      ],
      example: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left <= ______) {
    let mid = Math.floor((left + ______) / 2);
    
    if (arr[mid] === ______) {
      return mid;
    } else if (arr[mid] < target) {
      left = ______ + 1;
    } else {
      right = mid - ______;
    }
  }
  return -1;
}`,
      difficulty: 'Easy to Medium',
      timeEstimate: '3-10 minutes',
      languages: ['All supported languages', 'HTML/CSS', 'React', 'Flutter']
    },
    {
      type: 'Code Debugging',
      icon: '🐛',
      description: 'Identify and fix errors in existing code with comprehensive error analysis.',
      features: [
        'Real-world debugging scenarios',
        'Multiple error types (syntax, logic, performance)',
        'Step-by-step validation process',
        'Detailed explanations of fixes required',
        'Best practices reinforcement',
        'Common mistake pattern recognition'
      ],
      example: `function calculateTotal(items) {
  let total = 0;
  
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  
  return total;
}

// Issues to identify and fix:
// 1. Off-by-one error in loop condition
// 2. Missing null/undefined checks
// 3. Potential memory leak patterns`,
      difficulty: 'Medium to Hard',
      timeEstimate: '5-15 minutes',
      languages: ['JavaScript', 'Python', 'TypeScript', 'Express.js']
    },
    {
      type: 'Multiple Choice',
      icon: '☑️',
      description: 'Select correct answers from provided options with detailed explanations.',
      features: [
        'Single and multiple correct answers',
        'Code snippet analysis questions',
        'Concept understanding validation',
        'Immediate feedback with explanations',
        'Randomized option order',
        'Difficulty-based question pools'
      ],
      example: `Which of the following will output "Hello World"?

A) console.log("Hello" + " " + "World");
B) console.log("Hello", "World");
C) console.log(\`Hello World\`);
D) All of the above

Correct Answer: D
Explanation: All three methods produce the same output with slight differences in implementation.`,
      difficulty: 'Easy to Medium',
      timeEstimate: '1-3 minutes',
      languages: ['All supported languages']
    },
    {
      type: 'True/False',
      icon: '✅',
      description: 'Evaluate statements about programming concepts with comprehensive explanations.',
      features: [
        'Concept verification questions',
        'Quick knowledge assessment',
        'Detailed explanations for both answers',
        'Common misconception identification',
        'Foundation building exercises',
        'Progressive concept introduction'
      ],
      example: `True or False: JavaScript arrays can contain mixed data types.

Answer: True

Explanation: JavaScript arrays are dynamically typed and can contain strings, numbers, objects, functions, and other arrays in the same array structure, making them very flexible for different use cases.`,
      difficulty: 'Easy',
      timeEstimate: '30 seconds - 2 minutes',
      languages: ['All supported languages']
    }
  ];

  const platformCapabilities = [
    {
      title: 'Advanced Code Execution Engine',
      icon: '⚡',
      description: 'Secure, sandboxed environment for running and testing code across multiple languages.',
      benefits: [
        'Isolated execution prevents security risks',
        'Resource limits protect against infinite loops',
        'Real-time output capture and display',
        'Comprehensive error handling and debugging info',
        'Support for external libraries and frameworks',
        'Performance monitoring and optimization suggestions'
      ]
    },
    {
      title: 'Intelligent Auto-Grading System',
      icon: '🎯',
      description: 'Sophisticated grading algorithms that provide accurate assessment and meaningful feedback.',
      benefits: [
        'Test case validation with edge case coverage',
        'Partial credit for incomplete but correct solutions',
        'Code quality and style assessment',
        'Performance evaluation and benchmarking',
        'Immediate feedback generation with suggestions',
        'Learning analytics and progress tracking'
      ]
    },
    {
      title: 'Real-time Testing Platform',
      icon: '🚀',
      description: 'Live assessment environment with seamless user experience and robust session management.',
      benefits: [
        'Automatic session state management',
        'Auto-save functionality prevents data loss',
        'Visual progress indicators and time tracking',
        'Flexible time limits and attempt tracking',
        'Offline capability with sync when reconnected',
        'Mobile-responsive design for any device'
      ]
    },
    {
      title: 'Comprehensive Analytics Dashboard',
      icon: '📊',
      description: 'Detailed insights into performance, learning patterns, and improvement opportunities.',
      benefits: [
        'Individual progress tracking over time',
        'Question-level performance analytics',
        'Skill gap identification and recommendations',
        'Learning pattern analysis and insights',
        'Custom reporting for organizations',
        'Comparative analysis and benchmarking'
      ]
    }
  ];

  const workflowSteps = [
    {
      step: '1',
      title: 'Assessment Creation',
      description: 'Instructors create comprehensive assessments using our question bank and custom content tools.',
      details: [
        'Drag-and-drop question builder interface',
        'Pre-built question templates and examples',
        'Difficulty and time estimation tools',
        'Test case generator for code questions',
        'Preview and validation before publishing'
      ]
    },
    {
      step: '2',
      title: 'Student Access & Setup',
      description: 'Students receive secure access to assigned tests with clear instructions and requirements.',
      details: [
        'Unique session links with secure authentication',
        'Pre-test system compatibility checks',
        'Clear instructions and time limit information',
        'Practice mode for familiarization',
        'Technical support and help resources'
      ]
    },
    {
      step: '3',
      title: 'Live Assessment Experience',
      description: 'Real-time testing with immediate feedback and seamless user experience.',
      details: [
        'Syntax highlighting and code completion',
        'Real-time error detection and suggestions',
        'Test case validation with immediate results',
        'Progress saving and session recovery',
        'Question navigation and bookmarking'
      ]
    },
    {
      step: '4',
      title: 'Automated Grading & Analysis',
      description: 'Intelligent grading with detailed feedback and performance analysis.',
      details: [
        'Multiple validation methods for accuracy',
        'Partial credit calculation for complex problems',
        'Performance metrics and benchmarking',
        'Detailed feedback with improvement suggestions',
        'Academic integrity monitoring and reporting'
      ]
    },
    {
      step: '5',
      title: 'Results & Insights',
      description: 'Comprehensive reporting for students and instructors with actionable insights.',
      details: [
        'Detailed score breakdowns by topic and skill',
        'Progress tracking and improvement recommendations',
        'Class-wide analytics and performance comparisons',
        'Export capabilities for external systems',
        'Long-term learning analytics and trends'
      ]
    }
  ];

  return (
    <div className="features-page" style={{ paddingTop: '80px' }}>
      <style>{`
        .hero-bg {
          background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%);
          min-height: 60vh;
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
        .question-type-card {
          min-height: 500px;
        }
        .code-example {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 1rem;
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.85rem;
          color: #e5e7eb;
          margin: 1rem 0;
        }
        .workflow-step {
          border-left: 3px solid #6366f1;
          padding-left: 1.5rem;
          margin-bottom: 2rem;
          position: relative;
        }
        .step-number {
          background: #6366f1;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          position: absolute;
          left: -22px;
          top: 0;
        }
        .benefit-list {
          background: rgba(99, 102, 241, 0.05);
          border-left: 3px solid #6366f1;
          padding: 1rem;
          border-radius: 0 8px 8px 0;
          margin-top: 1rem;
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-bg d-flex align-items-center text-white">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h1 className="display-4 fw-bold mb-4">
                Comprehensive Assessment Features
              </h1>
              <p className="lead mb-4 fs-4">
                Advanced testing infrastructure with intelligent grading, real-time code execution, 
                and comprehensive analytics designed for educational excellence.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button 
                  size="lg" 
                  color="warning"
                  onClick={() => navigate('/register')}
                >
                  Start Using Features
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                  onClick={() => navigate('/demo')}
                >
                  Try Live Demo
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Question Types Section */}
      <section className="py-5">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-6 fw-bold mb-3">
                Five Comprehensive Question Types
              </h2>
              <p className="lead text-muted">
                Multiple assessment formats to evaluate different aspects of coding knowledge, 
                from basic syntax to complex problem-solving skills.
              </p>
            </Col>
          </Row>

          <Row>
            {questionTypes.map((qType, index) => (
              <Col lg={6} key={index} className="mb-4">
                <Card className="feature-card question-type-card">
                  <CardBody>
                    <div className="d-flex align-items-center mb-3">
                      <span className="fs-1 me-3">{qType.icon}</span>
                      <div>
                        <CardTitle tag="h4" className="mb-1">{qType.type}</CardTitle>
                        <div className="d-flex gap-2">
                          <Badge color="primary" className="small">{qType.difficulty}</Badge>
                          <Badge color="secondary" className="small">{qType.timeEstimate}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <CardText className="mb-3">{qType.description}</CardText>
                    
                    <div className="code-example">
                      <pre className="mb-0">
                        <code>{qType.example}</code>
                      </pre>
                    </div>
                    
                    <div className="benefit-list">
                      <h6 className="text-primary mb-2">Key Capabilities:</h6>
                      <ul className="small mb-2">
                        {qType.features.map((feature, idx) => (
                          <li key={idx} className="mb-1">{feature}</li>
                        ))}
                      </ul>
                      <div className="mt-2">
                        <strong className="small text-primary">Supported Languages: </strong>
                        <span className="small text-muted">{qType.languages.join(', ')}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Platform Capabilities Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-6 fw-bold mb-3">
                Enterprise-Grade Platform Capabilities
              </h2>
              <p className="lead text-muted">
                Robust infrastructure designed for educational institutions and organizations 
                requiring reliable, scalable assessment solutions.
              </p>
            </Col>
          </Row>

          <Row>
            {platformCapabilities.map((capability, index) => (
              <Col lg={6} key={index} className="mb-4">
                <Card className="feature-card">
                  <CardBody>
                    <div className="d-flex align-items-center mb-3">
                      <span className="fs-1 me-3">{capability.icon}</span>
                      <CardTitle tag="h4" className="mb-0">{capability.title}</CardTitle>
                    </div>
                    
                    <CardText className="mb-3">{capability.description}</CardText>
                    
                    <div className="benefit-list">
                      <ul className="mb-0">
                        {capability.benefits.map((benefit, idx) => (
                          <li key={idx} className="mb-1">
                            <i className="fas fa-check text-success me-2"></i>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          <Row className="mt-5">
            <Col lg={8} className="mx-auto">
              <Alert color="info">
                <h5 className="alert-heading">
                  <i className="fas fa-shield-alt me-2"></i>
                  Security & Performance
                </h5>
                <p className="mb-0">
                  All code execution happens in secure, isolated environments with resource limits 
                  and timeout protection. The platform is designed to handle thousands of concurrent 
                  users while maintaining fast response times and reliable performance.
                </p>
              </Alert>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testing Workflow Section */}
      <section className="py-5">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-6 fw-bold mb-3">
                Complete Assessment Workflow
              </h2>
              <p className="lead text-muted">
                End-to-end process from test creation to detailed analytics, 
                designed for seamless educational experiences.
              </p>
            </Col>
          </Row>

          <Row>
            <Col lg={8} className="mx-auto">
              {workflowSteps.map((workflow, index) => (
                <div key={index} className="workflow-step">
                  <div className="step-number">{workflow.step}</div>
                  <h4 className="fw-bold mb-2">{workflow.title}</h4>
                  <p className="mb-3">{workflow.description}</p>
                  <ul className="small text-muted">
                    {workflow.details.map((detail, idx) => (
                      <li key={idx} className="mb-1">{detail}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h3 className="fw-bold mb-3">Experience These Features</h3>
              <p className="lead mb-4">
                Ready to transform your coding education approach? 
                See how these features work together to create effective learning experiences.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button 
                  size="lg" 
                  color="warning"
                  onClick={() => navigate('/demo')}
                >
                  Try Interactive Demo
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                  onClick={() => navigate('/languages')}
                >
                  View Languages
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default FeaturesPage;