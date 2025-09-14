// src/components/admin/dashboard/StatCard.tsx
import React from 'react';
import { Card, CardBody } from 'reactstrap';
import type { DashboardStatCardProps } from '../../../types';

const StatCard: React.FC<DashboardStatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'primary',
  className,
  ...props 
}) => (
  <Card className={`h-100 border-0 shadow-sm ${className || ''}`} {...props}>
    <CardBody>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="text-muted mb-1 small">{title}</p>
          <h3 className="mb-0 fw-bold">{value}</h3>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div className={`p-2 rounded bg-${color} bg-opacity-10`}>
          <Icon className={`text-${color} icon-lg`} />
        </div>
      </div>
    </CardBody>
  </Card>
);

export default StatCard;