// pages/QuestionBankPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Alert, Spinner, Button } from 'reactstrap';
import { CheckCircle } from 'lucide-react';

// Components
import QuestionBankHeader from '../components/QuestionBank/QuestionBankHeader';
import StatsCards from '../components/QuestionBank/StatsCard';
import SkillCard from '../components/QuestionBank/SkillCard';
import AddQuestionCard from '../components/QuestionBank/AddQuestionCard';
import QuickActions from '../components/QuestionBank/QuickActions';

// Hooks and config
import { useQuestionStats } from '../hooks/questions/useQuestionStats';
import { skills } from '../config/skills';

// Styles
import '../styles/questionBank.css';

const QuestionBankPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    stats, 
    subCategoryBreakdowns, 
    totalStats, 
    loading, 
    error, 
    refetch, 
    maxCount 
  } = useQuestionStats();

  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle success messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      
      // Clear the location state to prevent message from showing again on refresh
      window.history.replaceState({}, document.title);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Navigation handlers
  const handleCreateQuestion = () => navigate('/admin/question-bank/add');
  const handleImportQuestions = () => navigate('/admin/question-bank/import');
  const handleViewAnalytics = () => navigate('/admin/analytics');
  const handleSkillClick = (skillName: string) => navigate(`/admin/question-bank/${skillName}`);

  // Loading state
  if (!user || loading) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner color="primary" className="mb-3" />
            <p className="text-muted">Loading question bank...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert color="danger" className="text-center">
              <strong>Error:</strong> {error}
              <div className="mt-3">
                <Button color="primary" onClick={refetch}>
                  Retry
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className="question-bank-container">
      <QuestionBankHeader user={user} />

      <Container className="py-4">
        {/* Success Message */}
        {successMessage && (
          <Alert 
            color="success" 
            className="mb-4 d-flex align-items-center"
            dismissible
            onDismiss={() => setSuccessMessage(null)}
          >
            <CheckCircle className="me-2 icon-sm" />
            {successMessage}
          </Alert>
        )}

        <StatsCards 
          totalStats={totalStats}
          skillCategoriesCount={skills.length}
          loading={loading}
        />

        <Row className="g-3">
          <Col md={6} lg={4}>
            <AddQuestionCard onClick={handleCreateQuestion} />
          </Col>

          {skills.map((skill) => (
            <Col key={skill.skill} md={6} lg={4}>
              <SkillCard 
                skill={skill}
                count={stats[skill.skill] || 0}
                loading={loading}
                onClick={() => handleSkillClick(skill.skill)}
                subCategoryBreakdown={subCategoryBreakdowns[skill.skill]}
                maxCount={maxCount}
              />
            </Col>
          ))}
        </Row>

        <QuickActions 
          onCreateQuestion={handleCreateQuestion}
          onImportQuestions={handleImportQuestions}
          onViewAnalytics={handleViewAnalytics}
        />
      </Container>
    </div>
  );
};

export default QuestionBankPage;