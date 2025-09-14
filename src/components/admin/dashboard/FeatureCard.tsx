// src/components/admin/dashboard/FeatureCard.tsx
import React from 'react';
import { Card, CardBody, CardTitle, CardText } from 'reactstrap';
import { ChevronRight } from 'lucide-react';
import type { DashboardFeatureCardProps } from '../../../types';

const FeatureCard: React.FC<DashboardFeatureCardProps> = ({ 
  feature, 
  onClick,
  className,
  ...props 
}) => (
  <Card 
    className={`h-100 border-0 shadow-sm transition-hover ${className || ''}`}
    style={{ cursor: 'pointer' }}
    onClick={() => onClick(feature.path)}
    {...props}
  >
    <CardBody className="d-flex flex-column">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className={`p-3 rounded bg-${feature.color} bg-opacity-10`}>
          <feature.icon className={`text-${feature.color} icon-lg`} />
        </div>
        <ChevronRight className="text-muted icon-md" />
      </div>
      
      <div className="flex-grow-1">
        <CardTitle tag="h5" className="mb-2">
          {feature.title}
        </CardTitle>
        <CardText className="text-muted mb-3">
          {feature.description}
        </CardText>
      </div>
      
      <div className="mt-auto">
        <small className="text-muted fw-medium">{feature.stats}</small>
      </div>
    </CardBody>
  </Card>
);

export default FeatureCard;