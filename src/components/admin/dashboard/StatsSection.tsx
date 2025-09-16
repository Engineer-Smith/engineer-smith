// src/components/admin/dashboard/StatsSection.tsx
import React from 'react';
import { Row, Col } from 'reactstrap';
import { Users, BookOpen, FileText, Monitor } from 'lucide-react';
import StatCard from './StatCard';
import type { User, DashboardStats } from '../../../types';

interface StatsSectionProps {
  user: User;
  stats: DashboardStats;
  onNavigate: (path: string) => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({ user, stats, onNavigate }) => (
  <Row className="g-3 mb-4">
    <Col md={6} lg={3}>
      <StatCard
        title="Total Users"
        value={stats.totalUsers || 0}
        subtitle={user.organization?.isSuperOrg ? `${stats.independentStudents || 0} independent students` : undefined}
        icon={Users}
        color="primary"
        onClick={() => onNavigate('/admin/users')}
      />
    </Col>
    <Col md={6} lg={3}>
      <StatCard
        title="Question Bank"
        value={stats.totalQuestions || 0}
        subtitle={
          user.organization?.isSuperOrg
            ? `Global questions available`
            : `Available to your organization`
        }
        icon={BookOpen}
        color="success"
        onClick={() => onNavigate('/admin/question-bank')}
      />
    </Col>
    <Col md={6} lg={3}>
      <StatCard
        title="Active Tests"
        value={stats.activeTests || 0}
        subtitle={`${stats.totalTests || 0} total tests`}
        icon={FileText}
        color="info"
        onClick={() => onNavigate('/admin/tests')}
      />
    </Col>
    <Col md={6} lg={3}>
      <StatCard
        title="Active Sessions"
        value={stats.activeSessions || 0}
        subtitle="Users taking tests now"
        icon={Monitor}
        color="warning"
        onClick={() => onNavigate('/admin/sessions/active')}
      />
    </Col>
  </Row>
);

export default StatsSection;