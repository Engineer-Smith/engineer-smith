// src/components/navbar/QuickLoginForm.tsx
import React from 'react';
import {
  Button,
  Input,
  FormGroup,
  Label,
  Alert,
  Row,
  Col
} from 'reactstrap';

interface LoginData {
  loginId: string;
  password: string;
}

interface QuickLoginFormProps {
  loginData: LoginData;
  authLoading: boolean;
  authError: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogin: (e: React.FormEvent) => void;
  onNavigate: (path: string) => void;
  onClearError: () => void;
}

const QuickLoginForm: React.FC<QuickLoginFormProps> = ({
  loginData,
  authLoading,
  authError,
  onInputChange,
  onLogin,
  onNavigate,
  onClearError
}) => {
  return (
    <div 
      className="w-100 mt-3"
      style={{
        transition: 'all 0.3s ease-in-out',
        opacity: 1,
        transform: 'translateY(0)'
      }}
    >
      {/* Error Message Row */}
      {authError && (
        <Row className="mb-2">
          <Col>
            <Alert color="danger" className="mb-2 py-2" style={{ fontSize: '0.75rem' }}>
              <i className="fas fa-exclamation-triangle me-2"></i>
              {authError}
              <Button 
                color="link" 
                size="sm" 
                className="p-0 ms-2 text-danger"
                onClick={onClearError}
                style={{ fontSize: '0.75rem' }}
              >
                ✕
              </Button>
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="align-items-end">
        <Col md={3}>
          <FormGroup className="mb-2">
            <Label htmlFor="inline-login-id" size="sm" className="text-muted">
              Email or Username
            </Label>
            <Input
              type="text"
              name="loginId"
              id="inline-login-id"
              placeholder="Enter email or username"
              value={loginData.loginId}
              onChange={onInputChange}
              disabled={authLoading}
              bsSize="sm"
              style={{ fontSize: '0.875rem' }}
            />
          </FormGroup>
        </Col>
        <Col md={3}>
          <FormGroup className="mb-2">
            <Label htmlFor="inline-password" size="sm" className="text-muted">
              Password
            </Label>
            <Input
              type="password"
              name="password"
              id="inline-password"
              placeholder="Enter password"
              value={loginData.password}
              onChange={onInputChange}
              disabled={authLoading}
              bsSize="sm"
              style={{ fontSize: '0.875rem' }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onLogin(e as any);
                }
              }}
            />
          </FormGroup>
        </Col>
        <Col md={2}>
          <FormGroup className="mb-2">
            <Button 
              color="primary" 
              size="sm"
              disabled={authLoading || !loginData.loginId || !loginData.password}
              onClick={onLogin}
              className="w-100"
            >
              {authLoading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                'Sign In'
              )}
            </Button>
          </FormGroup>
        </Col>
        <Col md={4}>
          <FormGroup className="mb-2">
            <div className="d-flex gap-2">
              <Button 
                color="link" 
                size="sm"
                onClick={() => onNavigate('/login')}
                className="p-1 text-muted"
                style={{ fontSize: '0.75rem' }}
              >
                Full Login
              </Button>
              <Button 
                color="link" 
                size="sm"
                onClick={() => onNavigate('/register')}
                className="p-1 text-muted"
                style={{ fontSize: '0.75rem' }}
              >
                Create Account
              </Button>
            </div>
          </FormGroup>
        </Col>
      </Row>
    </div>
  );
};

export default QuickLoginForm