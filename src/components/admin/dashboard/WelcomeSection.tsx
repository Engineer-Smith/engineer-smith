// src/components/admin/dashboard/WelcomeSection.tsx
import React from 'react';
import { Row, Col } from 'reactstrap';
import type { User } from '../../../types';

interface WelcomeSectionProps {
  user: User;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user }) => (
  <Row className="mb-4">
    <Col>
      <h2 className="h3 mb-2">
        Welcome back, {user.loginId || 'Admin'}!
      </h2>
      <p className="text-muted mb-0">
        {user.organization?.isSuperOrg
          ? "Manage the entire EngineerSmith platform, including all organizations and independent students."
          : `Manage your ${user.organization?.name} organization and access global platform features.`
        }
      </p>
    </Col>
  </Row>
);

export default WelcomeSection;