// src/components/admin/dashboard/FeatureSection.tsx
import React from 'react';
import { Row, Col } from 'reactstrap';
import FeatureCard from './FeatureCard';
import type { DashboardFeature } from '../../../types';

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  features: DashboardFeature[];
  onNavigate: (path: string) => void;
  sectionKey: string;
  badge?: React.ReactNode;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ 
  title, 
  subtitle, 
  features, 
  onNavigate, 
  sectionKey,
  badge 
}) => {
  if (features.length === 0) return null;

  return (
    <>
      <Row className="mb-3">
        <Col>
          <h4 className="h5 text-muted mb-0 d-flex align-items-center">
            {title}
            {badge}
          </h4>
          <small className="text-muted">{subtitle}</small>
        </Col>
      </Row>
      <Row className="g-3 mb-4">
        {features.map((feature, index) => (
          <Col key={`${sectionKey}-${feature.title}-${index}`} md={6} lg={4}>
            <FeatureCard
              feature={feature}
              onClick={onNavigate}
            />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default FeatureSection;