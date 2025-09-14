// src/components/auth/AuthFooter.tsx
import React from 'react';
import { Button } from 'reactstrap';

interface AuthFooterProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
  loading: boolean;
}

const AuthFooter: React.FC<AuthFooterProps> = ({ activeTab, onTabChange, loading }) => {
  return (
    <div className="text-center">
      <small className="text-muted">
        {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
        <Button 
          color="link" 
          size="sm" 
          className="p-0"
          onClick={() => onTabChange(activeTab === 'login' ? 'register' : 'login')}
          disabled={loading}
        >
          {activeTab === 'login' ? 'Create one here' : 'Sign in here'}
        </Button>
      </small>
    </div>
  );
};

export default AuthFooter;