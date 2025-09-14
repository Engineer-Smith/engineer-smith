// src/components/auth/AuthForm.tsx
import React from 'react';
import { Alert, Button } from 'reactstrap';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthFormProps {
  mode: 'login' | 'register';
  authError: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  onLogin: (loginCredential: string, password: string) => Promise<void>;
  onRegister: (username: string, firstName: string, lastName: string, email?: string, password?: string, inviteCode?: string, role?: string) => Promise<void>;
  onValidateInviteCode: (inviteCode: string) => Promise<{ valid: boolean; organizationName?: string }>;
  onClearError: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  authError,
  isAuthenticated,
  loading,
  onLogin,
  onRegister,
  onValidateInviteCode,
  onClearError
}) => {
  return (
    <>
      {/* Global Error Alert */}
      {authError && (
        <Alert color="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {authError}
          <Button 
            color="link" 
            size="sm" 
            className="p-0 ms-2 text-danger"
            onClick={onClearError}
          >
            ✕
          </Button>
        </Alert>
      )}

      {/* Success message for debugging - can be removed */}
      {isAuthenticated && (
        <Alert color="success" className="mb-4">
          <i className="fas fa-check-circle me-2"></i>
          Authentication successful! Route guards will redirect you...
        </Alert>
      )}

      {/* Render appropriate form based on mode */}
      {mode === 'login' ? (
        <LoginForm 
          loading={loading}
          onSubmit={onLogin}
          onClearError={onClearError}
        />
      ) : (
        <RegisterForm 
          loading={loading}
          onSubmit={onRegister}
          onValidateInviteCode={onValidateInviteCode}
          onClearError={onClearError}
        />
      )}


    </>
  );
};

export default AuthForm;