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

const ForOrganizationsPage: React.FC = () => {
  const platformFeatures = [
    {
      title: 'Multi-User Management',
      icon: '👥',
      description: 'Organize users with role-based permissions designed for educational and training environments.',
      features: [
        'Admin, Instructor, and Student role types',
        'Bulk user registration and management',
        'Customizable permissions per role',
        'User activity and assessment progress tracking'
      ]
    },
    {
      title: 'Assessment Organization',
      icon: '📋',
      description: 'Centralized tools for managing and administering coding assessments across your organization.',
      features: [
        'Assign assessments to user groups',
        'Track completion rates and progress',
        'Generate performance reports and analytics',
        'Export data for external analysis'
      ]
    },
    {
      title: 'Security & Integration',
      icon: '🔐',
      description: 'Enterprise-grade security features and integration capabilities for institutional use.',
      features: [
        'Single Sign-On (SSO) support',
        'User authentication integration',
        'Secure data handling and storage',
        'API access for custom integrations'
      ]
    },
    {
      title: 'Certification Features',
      icon: '🏆',
      description: 'Tools for managing skill validation and certification processes.',
      features: [
        'Certificate generation for completed assessments',
        'Skill verification and validation',
        'Progress tracking and reporting',
        'Custom certification criteria'
      ]
    }
  ];

  const userRoles = [
    {
      role: 'Administrator',
      responsibilities: [
        'Manage organizational settings',
        'Add and remove users',
        'Access all reports and analytics',
        'Configure integrations and security'
      ]
    },
    {
      role: 'Instructor',
      responsibilities: [
        'Assign assessments to students',
        'Monitor student progress',
        'Generate class reports',
        'Provide feedback and guidance'
      ]
    },
    {
      role: 'Student',
      responsibilities: [
        'Take assigned assessments',
        'View personal progress',
        'Access certificates',
        'Review feedback and recommendations'
      ]
    }
  ];

  const organizationTypes = [
    {
      type: 'Educational Institutions',
      description: 'Universities, colleges, and schools using coding assessments for coursework evaluation',
      benefits: [
        'Standardized assessment across multiple sections',
        'Consistent grading and evaluation',
        'Progress tracking for student cohorts',
        'Data-driven curriculum insights'
      ]
    },
    {
      type: 'Corporate Training',
      description: 'Companies implementing technical skills assessment for employee development',
      benefits: [
        'Skills validation for training programs',
        'Progress tracking for development initiatives',
        'Integration with existing HR systems',
        'Evidence-based skill certification'
      ]
    },
    {
      type: 'Professional Programs',
      description: 'Bootcamps and certification programs requiring standardized skill evaluation',
      benefits: [
        'Consistent graduate skill validation',
        'Industry-standard assessment practices',
        'Credential management and verification',
        'Program effectiveness measurement'
      ]
    }
  ];

  return (
    <div className="organizations-page" style={{ paddingTop: '80px' }}>
      <style>{`
        .hero-bg {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3730a3 100%);
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
        .role-section {
          background: rgba(99, 102, 241, 0.05);
          border-left: 4px solid #6366f1;
          padding: 1.5rem;
          border-radius: 0 8px 8px 0;
          margin-bottom: 1rem;
        }
        .benefit-list {
          background: rgba(34, 197, 94, 0.05);
          border-left: 3px solid #22c55e;
          padding: 1rem;
          border-radius: 0 8px 8px 0;
          margin-top: 1rem;
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-bg d-flex align-items-center text-white">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <Badge color="warning" className="px-3 py-2 mb-3 fs-6">
                Enterprise Testing Platform
              </Badge>
              <h1 className="display-4 fw-bold mb-4">
                Coding Assessment for Organizations
              </h1>
              <p className="lead mb-4 fs-4">
                Comprehensive skill testing platform with user management, 
                assessment administration, and certification tools designed 
                for educational institutions and training programs.
              </p>
              
              <div className="d-flex flex-wrap gap-2 mb-4">
                <Badge color="light" className="px-3 py-2 text-dark">Role-Based Access</Badge>
                <Badge color="light" className="px-3 py-2 text-dark">Assessment Management</Badge>
                <Badge color="light" className="px-3 py-2 text-dark">Progress Tracking</Badge>
              </div>

              <div className="d-flex gap-3 mb-4 flex-wrap">
                <Button 
                  size="lg" 
                  color="warning"
                  className="px-4 py-3"
                >
                  Request Demo
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                  className="px-4 py-3"
                >
                  Contact Sales
                </Button>
              </div>
            </Col>
            
            <Col lg={6}>
              <Card className="bg-white text-dark">
                <CardBody>
                  <h5 className="text-primary mb-3">Platform Capabilities</h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>User Role Types</span>
                      <Badge color="primary">3</Badge>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Assessment Categories</span>
                      <Badge color="success">4</Badge>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Question Types</span>
                      <Badge color="info">5</Badge>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Programming Languages</span>
                      <Badge color="warning">12</Badge>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h6 className="mb-2">Available Now:</h6>
                    <div className="d-flex flex-wrap gap-1">
                      <Badge color="secondary" className="small">Fill-in-the-Blank</Badge>
                      <Badge color="secondary" className="small">Multiple Choice</Badge>
                      <Badge color="secondary" className="small">True/False</Badge>
                      <Badge color="secondary" className="small">Code Challenges</Badge>
                      <Badge color="secondary" className="small">Debugging</Badge>
                    </div>
                  </div>
                  
                  <Button size="sm" color="primary" className="w-100">
                    Learn More
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Platform Features */}
      <section className="py-5">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-6 fw-bold mb-3">
                Built for Organizational Assessment
              </h2>
              <p className="lead text-muted">
                Comprehensive tools designed to manage coding assessments 
                across educational institutions and training programs.
              </p>
            </Col>
          </Row>

          <Row>
            {platformFeatures.map((feature, index) => (
              <Col lg={6} key={index} className="mb-4">
                <Card className="feature-card">
                  <CardBody>
                    <div className="d-flex align-items-center mb-3">
                      <span className="fs-1 me-3">{feature.icon}</span>
                      <CardTitle tag="h4" className="mb-0">{feature.title}</CardTitle>
                    </div>
                    
                    <CardText className="mb-3">{feature.description}</CardText>
                    
                    <ul className="mb-0">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="mb-1">
                          <i className="fas fa-check text-primary me-2"></i>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* User Roles */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-6 fw-bold mb-3">
                Three User Role Types
              </h2>
              <p className="lead text-muted">
                Structured access control with clear responsibilities 
                for different types of users in your organization.
              </p>
            </Col>
          </Row>

          <Row>
            {userRoles.map((role, index) => (
              <Col lg={4} key={index} className="mb-4">
                <div className="role-section">
                  <h5 className="text-primary mb-3">{role.role}</h5>
                  <ul className="mb-0">
                    {role.responsibilities.map((responsibility, idx) => (
                      <li key={idx} className="mb-2">{responsibility}</li>
                    ))}
                  </ul>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Organization Types */}
      <section className="py-5">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-6 fw-bold mb-3">
                Designed for Different Organization Types
              </h2>
              <p className="lead text-muted">
                Flexible platform that adapts to various educational 
                and training environments.
              </p>
            </Col>
          </Row>

          <Row>
            {organizationTypes.map((org, index) => (
              <Col lg={4} key={index} className="mb-4">
                <Card className="feature-card">
                  <CardBody>
                    <h5 className="text-primary mb-3">{org.type}</h5>
                    <p className="text-muted mb-3">{org.description}</p>
                    
                    <div className="benefit-list">
                      <h6 className="text-success mb-2">Key Benefits:</h6>
                      <ul className="small mb-0">
                        {org.benefits.map((benefit, idx) => (
                          <li key={idx} className="mb-1">{benefit}</li>
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

      {/* Implementation Info */}
      <section className="py-5 bg-light">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto">
              <Alert color="info">
                <h5 className="alert-heading">
                  <i className="fas fa-rocket me-2"></i>
                  Getting Started
                </h5>
                <p className="mb-0">
                  Organizations can get started with user setup, role configuration, 
                  and assessment assignment. We provide guidance for platform setup 
                  and user onboarding to ensure successful implementation.
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
              <h3 className="fw-bold mb-3">Ready to Implement Organizational Testing?</h3>
              <p className="lead mb-4">
                Get started with a comprehensive coding assessment platform 
                designed for educational institutions and training programs.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button 
                  size="lg" 
                  color="warning"
                >
                  Schedule Demo
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                >
                  Get Information
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                >
                  Contact Us
                </Button>
              </div>
              <p className="mt-3 mb-0">
                <small>
                  <i className="fas fa-shield-alt me-2"></i>
                  Secure platform • Role-based access • Assessment management
                </small>
              </p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default ForOrganizationsPage;