// src/components/auth/AuthFeatures.tsx
import React from 'react';
import { Row, Col } from 'reactstrap';

const AuthFeatures: React.FC = () => {
  return (
    <div className="mt-4 pt-4 border-top">
      <Row className="text-center">
        <Col md={4}>
          <div className="mb-3">
            <i className="fas fa-globe text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
            <h6 className="fw-semibold">Global Assessments</h6>
            <small className="text-muted">Access 10+ programming languages</small>
          </div>
        </Col>
        <Col md={4}>
          <div className="mb-3">
            <i className="fas fa-users text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
            <h6 className="fw-semibold">Team Organizations</h6>
            <small className="text-muted">Custom content and analytics</small>
          </div>
        </Col>
        <Col md={4}>
          <div className="mb-3">
            <i className="fas fa-shield-alt text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
            <h6 className="fw-semibold">Secure Platform</h6>
            <small className="text-muted">Enterprise-grade security</small>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AuthFeatures;