// components/QuestionBank/QuestionBankHeader.tsx
import React from 'react';
import { Container, Row, Col, Badge } from 'reactstrap';
import { BookOpen, Globe } from 'lucide-react';
import type { User } from '../../types';

interface QuestionBankHeaderProps {
  user: User;
}

const QuestionBankHeader: React.FC<QuestionBankHeaderProps> = ({ user }) => (
  <div className="bg-white shadow-sm border-bottom">
    <Container>
      <div className="py-3">
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center">
              <BookOpen className="me-3 text-success icon-lg" />
              <div>
                <h1 className="h4 mb-0">Question Bank</h1>
                <p className="text-muted mb-0 small">
                  {user?.organization?.isSuperOrg 
                    ? "Manage global and organization-specific questions"
                    : `Manage questions for ${user?.organization?.name}`
                  }
                </p>
              </div>
            </div>
          </Col>
          <Col xs="auto">
            {user?.organization?.isSuperOrg && (
              <Badge color="primary" className="d-flex align-items-center">
                <Globe className="me-1 icon-xs" />
                Super Admin Access
              </Badge>
            )}
          </Col>
        </Row>
      </div>
    </Container>
  </div>
);

export default QuestionBankHeader;