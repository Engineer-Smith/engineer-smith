// components/QuestionBank/SkillCard.tsx
import React from 'react';
import { Card, CardBody, CardTitle, CardText, Badge, Progress } from 'reactstrap';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Skill {
  name: string;
  skill: string;
  description: string;
  icon: LucideIcon;
  color: string;
  subCategories?: string[];
}

interface SkillCardProps {
  skill: Skill;
  count: number;
  loading: boolean;
  onClick: () => void;
  // Add breakdown for sub-categories
  subCategoryBreakdown?: { [key: string]: number };
  maxCount?: number; // For progress bar
}

const SkillCard: React.FC<SkillCardProps> = ({ 
  skill, 
  count, 
  loading, 
  onClick, 
  subCategoryBreakdown,
  maxCount = 100 
}) => {
  const progressPercentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <Card 
      className="h-100 border-0 shadow-sm transition-hover"
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <CardBody className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className={`p-3 rounded bg-${skill.color} bg-opacity-10`}>
            <skill.icon className={`text-${skill.color} icon-lg`} />
          </div>
          <div className="d-flex align-items-center">
            {!loading && (
              <Badge color={skill.color} className="me-2">
                {count} questions
              </Badge>
            )}
            <ChevronRight className="text-muted icon-sm" />
          </div>
        </div>
        
        <div className="flex-grow-1">
          <CardTitle tag="h5" className="mb-2">
            {skill.name}
          </CardTitle>
          <CardText className="text-muted mb-3">
            {skill.description}
          </CardText>

          {/* Progress bar to show relative size */}
          <div className="mb-3">
            <Progress 
              value={progressPercentage} 
              color={skill.color}
              className="mb-1"
              style={{ height: '6px' }}
            />
            <small className="text-muted">
              {progressPercentage.toFixed(0)}% of largest category
            </small>
          </div>

          {/* Show sub-category breakdown if available */}
          {skill.subCategories && subCategoryBreakdown && (
            <div className="mb-3">
              <small className="text-muted d-block mb-1">Breakdown:</small>
              {skill.subCategories.map(subCat => (
                <div key={subCat} className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-capitalize">{subCat}:</small>
                  <Badge size="sm" color="secondary" className="ms-1 text-white">
                    {subCategoryBreakdown[subCat] || 0}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-auto">
          <small className="text-muted fw-medium">
            {loading ? 'Loading...' : `${count} questions available`}
          </small>
        </div>
      </CardBody>
    </Card>
  );
};

export default SkillCard;