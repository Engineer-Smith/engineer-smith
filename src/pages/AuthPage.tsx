// File structure:
// src/pages/AuthPage.tsx - Main page component
// src/components/auth/AuthHeader.tsx
// src/components/auth/AuthTabs.tsx  
// src/components/auth/AuthForm.tsx
// src/components/auth/LoginForm.tsx
// src/components/auth/RegisterForm.tsx
// src/components/auth/AuthFooter.tsx
// src/components/auth/AuthFeatures.tsx

// src/pages/AuthPage.tsx - Simplified main page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody } from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import AuthHeader from '../components/auth/AuthHeader';
import AuthTabs from '../components/auth/AuthTabs';
import AuthForm from '../components/auth/AuthForm';
import AuthFooter from '../components/auth/AuthFooter';
import AuthFeatures from '../components/auth/AuthFeatures';

interface AuthPageProps {
  mode: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(mode);
  
  const { 
    login, 
    register, 
    validateInviteCode,
    loading, 
    error: authError, 
    clearError,
    isAuthenticated 
  } = useAuth();

  // Update tab when mode prop changes
  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  const handleTabChange = (tab: 'login' | 'register') => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    clearError();
    
    const newPath = tab === 'register' ? '/register' : '/login';
    navigate(newPath, { replace: true });
  };

  // Show loading spinner during initial auth check
  if (loading && !authError) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
      paddingTop: '80px' 
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} xl={6}>
            <Card className="shadow-lg border-0">
              <CardBody className="p-5">
                <AuthHeader />
                
                <AuthTabs 
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
                
                <AuthForm 
                  mode={activeTab}
                  authError={authError}
                  isAuthenticated={isAuthenticated}
                  loading={loading}
                  onLogin={login}
                  onRegister={register}
                  onValidateInviteCode={validateInviteCode}
                  onClearError={clearError}
                />
                
                <AuthFooter 
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  loading={loading}
                />
                
                <AuthFeatures />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthPage;