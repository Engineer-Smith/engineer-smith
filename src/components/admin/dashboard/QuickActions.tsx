// src/components/admin/dashboard/QuickActions.tsx
import React from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import { Users, BookOpen, FileText, Building, Code, Book } from 'lucide-react';
import type { QuickActionsProps } from '../../../types';

const QuickActions: React.FC<QuickActionsProps> = ({ 
  onAction, 
  userRole, 
  isSuperOrgAdmin,
  className,
  ...props 
}) => (
  <Card className={`border-0 shadow-sm ${className || ''}`} {...props}>
    <CardBody>
      <h5 className="mb-3">Quick Actions</h5>
      <div className="d-flex flex-wrap gap-2">
        {(userRole === 'admin' || userRole === 'instructor') && (
          <Button 
            color="primary"
            size="sm"
            onClick={() => onAction('addUser')}
            className="d-flex align-items-center"
          >
            <Users className="me-2 icon-sm" />
            Add New User
          </Button>
        )}
        <Button 
          color="success"
          size="sm"
          onClick={() => onAction('createQuestion')}
          className="d-flex align-items-center"
        >
          <BookOpen className="me-2 icon-sm" />
          Create Question
        </Button>
        <Button 
          color="info"
          size="sm"
          onClick={() => onAction('createTest')}
          className="d-flex align-items-center"
        >
          <FileText className="me-2 icon-sm" />
          Create Test
        </Button>
        {userRole === 'admin' && (
          <>
            <Button 
              color="warning"
              size="sm"
              onClick={() => onAction('createCodeChallenge')}
              className="d-flex align-items-center"
            >
              <Code className="me-2 icon-sm" />
              Create Challenge
            </Button>
            <Button 
              color="secondary"
              size="sm"
              onClick={() => onAction('createTrack')}
              className="d-flex align-items-center"
            >
              <Book className="me-2 icon-sm" />
              Create Track
            </Button>
          </>
        )}
        {isSuperOrgAdmin && userRole === 'admin' && (
          <Button 
            color="danger"
            size="sm"
            onClick={() => onAction('addOrganization')}
            className="d-flex align-items-center"
          >
            <Building className="me-2 icon-sm" />
            Add Organization
          </Button>
        )}
      </div>
    </CardBody>
  </Card>
);

export default QuickActions;