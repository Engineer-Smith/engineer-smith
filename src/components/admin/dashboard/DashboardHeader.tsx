// src/components/admin/dashboard/DashboardHeader.tsx
import React from 'react';
import { Container, Row, Col, Badge } from 'reactstrap';
import { Globe } from 'lucide-react';
import type { User } from '../../../types';

interface DashboardHeaderProps {
  user: User;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => (
  <div className="bg-white shadow-sm border-bottom">
    <Container>
      <div className="py-3">
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center">
              <h1 className="h4 mb-0 me-3">EngineerSmith Admin</h1>
              {user.organization?.isSuperOrg && (
                <Badge color="primary" className="d-flex align-items-center">
                  <Globe className="me-1 icon-xs" />
                  Super Admin
                </Badge>
              )}
            </div>
          </Col>
          <Col xs="auto">
            <div className="d-flex align-items-center">
              <div 
                className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{ width: '32px', height: '32px' }}
              >
                <span className="text-white small fw-bold">
                  {user.loginId?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="d-none d-sm-block">
                <p className="mb-0 small fw-medium">
                  {user.loginId || 'Admin User'}
                </p>
                <small className="text-muted">{user.organization?.name}</small>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  </div>
);

export default DashboardHeader;