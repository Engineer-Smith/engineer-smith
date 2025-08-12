// src/pages/TestDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner } from 'reactstrap';
import { useAuth } from '../context/AuthContext';

// Import components
import TestDetailsHeader from '../components/tests/TestDetailsHeader';
import TestOverview from '../components/tests/TestOverview';
import TestSections from '../components/tests/TestSections';
import TestQuestions from '../components/tests/TestQuestions';
import TestAnalytics from '../components/tests/TestAnalytics';
import TestSettings from '../components/tests/TestSettings';

// Import types
import type { Test } from '../types';

const TestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { client } = useAuth();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    if (!id) {
      setError('Test ID is required');
      setLoading(false);
      return;
    }

    fetchTestDetails();
  }, [id, client]);

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await client.get(`/tests/${id}`);
      setTest(response.data.test);
    } catch (err: any) {
      console.error('Failed to fetch test details:', err);
      setError(err.response?.data?.error || 'Failed to load test details');
      
      // If test not found, redirect to test management
      if (err.response?.status === 404) {
        setTimeout(() => navigate('/admin/tests'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestUpdate = (updatedTest: Test) => {
    setTest(updatedTest);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner color="primary" />
        <p className="mt-2">Loading test details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert color="danger">
          <h4 className="alert-heading">Error Loading Test</h4>
          <p>{error}</p>
          {error.includes('not found') && (
            <p className="mb-0">
              <small>Redirecting to test management...</small>
            </p>
          )}
        </Alert>
      </Container>
    );
  }

  if (!test) {
    return (
      <Container className="py-4">
        <Alert color="warning">
          Test not found or could not be loaded.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          {/* Header with title, status, and action buttons */}
          <TestDetailsHeader 
            test={test} 
            onTestUpdate={handleTestUpdate}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          
          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'overview' && (
              <Row>
                <Col lg="8">
                  <TestOverview test={test} />
                  {test.settings.useSections ? (
                    <TestSections test={test} onTestUpdate={handleTestUpdate} />
                  ) : (
                    <TestQuestions test={test} onTestUpdate={handleTestUpdate} />
                  )}
                </Col>
                <Col lg="4">
                  <TestSettings test={test} onTestUpdate={handleTestUpdate} />
                </Col>
              </Row>
            )}
            
            {activeTab === 'analytics' && (
              <TestAnalytics test={test} />
            )}
            
            {activeTab === 'questions' && (
              <TestQuestions test={test} onTestUpdate={handleTestUpdate} />
            )}
            
            {activeTab === 'settings' && (
              <Row>
                <Col lg="8">
                  <TestSettings test={test} onTestUpdate={handleTestUpdate} />
                </Col>
              </Row>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TestDetailsPage;