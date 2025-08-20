// components/QuestionBank/StatsCards.tsx
import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { BookOpen, Code, Plus } from 'lucide-react';

interface QuestionStats {
  totalQuestions: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  typeBreakdown: {
    multipleChoice: number;
    trueFalse: number;
    codeChallenge: number;
    codeDebugging: number;
  };
}

interface StatsCardsProps {
  totalStats: QuestionStats | null;
  skillCategoriesCount: number;
  loading: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ totalStats, skillCategoriesCount, loading }) => (
  <Row className="mb-4">
    <Col md={4}>
      <Card className="border-0 shadow-sm bg-success bg-opacity-10">
        <CardBody>
          <div className="d-flex align-items-center">
            <BookOpen className="text-success me-3 icon-lg" />
            <div>
              <h3 className="mb-0 fw-bold">
                {loading ? '...' : (totalStats?.totalQuestions || 0)}
              </h3>
              <p className="text-muted mb-0 small">Total Questions</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
    <Col md={4}>
      <Card className="border-0 shadow-sm bg-primary bg-opacity-10">
        <CardBody>
          <div className="d-flex align-items-center">
            <Code className="text-primary me-3 icon-lg" />
            <div>
              <h3 className="mb-0 fw-bold">{skillCategoriesCount}</h3>
              <p className="text-muted mb-0 small">Skill Categories</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
    <Col md={4}>
      <Card className="border-0 shadow-sm bg-info bg-opacity-10">
        <CardBody>
          <div className="d-flex align-items-center">
            <Plus className="text-info me-3 icon-lg" />
            <div>
              <h3 className="mb-0 fw-bold">
                {loading ? 'Loading...' : 
                 totalStats?.difficultyBreakdown ? 
                   `${totalStats.difficultyBreakdown.easy}/${totalStats.difficultyBreakdown.medium}/${totalStats.difficultyBreakdown.hard}` 
                   : 'Ready'
                }
              </h3>
              <p className="text-muted mb-0 small">
                {totalStats?.difficultyBreakdown ? 'Easy/Medium/Hard' : 'Add New Questions'}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  </Row>
);

export default StatsCards;