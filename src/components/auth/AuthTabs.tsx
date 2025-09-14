// src/components/auth/AuthTabs.tsx
import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';

interface AuthTabsProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Nav tabs className="mb-4 justify-content-center">
      <NavItem>
        <NavLink 
          active={activeTab === 'login'} 
          onClick={() => onTabChange('login')}
          style={{ cursor: 'pointer' }}
          className={activeTab === 'login' ? 'border-primary text-primary fw-bold' : ''}
        >
          <i className="fas fa-sign-in-alt me-2"></i>
          Sign In
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink 
          active={activeTab === 'register'} 
          onClick={() => onTabChange('register')}
          style={{ cursor: 'pointer' }}
          className={activeTab === 'register' ? 'border-primary text-primary fw-bold' : ''}
        >
          <i className="fas fa-user-plus me-2"></i>
          Create Account
        </NavLink>
      </NavItem>
    </Nav>
  );
};

export default AuthTabs;