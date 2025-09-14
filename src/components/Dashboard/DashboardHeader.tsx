
// components/Dashboard/DashboardHeader.tsx
import React from 'react';
import { Button, Badge } from 'reactstrap';

interface DashboardHeaderProps {
  user: any;
  onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 className="h3 mb-1">
          Welcome back, <span className="text-primary">{user?.fullName || `${user?.firstName} ${user?.lastName}` || user?.loginId}</span>!
        </h1>
        {(user?.fullName || (user?.firstName && user?.lastName)) && (
          <p className="text-muted small mb-1">@{user?.loginId}</p>
        )}
        <p className="text-muted mb-0">
          Ready to take some assessments today?
        </p>
      </div>
      <div className="d-flex align-items-center gap-3">
        <Badge color="primary" className="px-3 py-2 fs-6">
          <i className="fas fa-user-graduate me-2"></i>
          Student
        </Badge>
        <Button color="outline-secondary" onClick={onLogout}>
          <i className="fas fa-sign-out-alt me-2"></i>
          Logout
        </Button>
      </div>
    </div>
  );
};