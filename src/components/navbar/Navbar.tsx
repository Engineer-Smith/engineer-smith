// src/components/navbar/AppNavbar.tsx
import React, { useState } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  Collapse,
  Button,
  Container
} from 'reactstrap';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import modular components
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';
import AdminManagementMenu from './AdminManagementMenu';
import PlatformInfoMenu from './PlatformInfoMenu';
import QuickLoginForm from './QuickLoginForm';

const AppNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginInputs, setShowLoginInputs] = useState(false);
  const [loginData, setLoginData] = useState({
    loginId: '',
    password: ''
  });

  // Auth context
  const {
    user,
    isAuthenticated,
    login,
    logout,
    loading: authLoading,
    error: authError,
    clearError
  } = useAuth();

  // Navigation
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const toggle = () => setIsOpen(!isOpen);
  const toggleLoginInputs = () => setShowLoginInputs(!showLoginInputs);

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setShowLoginInputs(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.loginId && loginData.password) {
      clearError();
      await login(loginData.loginId, loginData.password);
      if (!authError) {
        setLoginData({ loginId: '', password: '' });
        setShowLoginInputs(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const isActivePath = (path: string) => {
    return currentPath === path || currentPath.startsWith(path);
  };

  // Check if user has admin access
  const hasAdminAccess = user?.role === 'admin' || user?.role === 'instructor';
  const isSuperOrgAdmin = user?.organization?.isSuperOrg && user?.role === 'admin';

  // Show public navigation when not authenticated
  const showPublicNav = !isAuthenticated;

  return (
    <Navbar
      color="light"
      light
      expand="md"
      fixed="top"
      className="shadow-sm"
      style={{
        zIndex: 1040,
        transition: 'all 0.3s ease-in-out',
        paddingBottom: showLoginInputs ? '1rem' : '0.5rem'
      }}
    >
      <Container>
        <NavbarBrand
          href="/"
          className="d-flex align-items-center"
          onClick={(e) => {
            e.preventDefault();
            if (isAuthenticated) {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
          }}
        >
          <div
            className="me-2 p-2 rounded"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              minWidth: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ color: 'white', fontSize: '1.2rem' }}>💻</span>
          </div>
          <strong className="text-primary">EngineerSmith</strong>
        </NavbarBrand>

        <NavbarToggler onClick={toggle} />

        <Collapse isOpen={isOpen} navbar>
          <Nav className="me-auto" navbar>
            {/* Public Navigation - Show when NOT authenticated */}
            {showPublicNav && (
              <>
                <NavItem>
                  <NavLink
                    onClick={() => handleNavClick('/features')}
                    active={isActivePath('/features')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fas fa-cogs me-2"></i>
                    Features
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    onClick={() => handleNavClick('/languages')}
                    active={isActivePath('/languages')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fas fa-code me-2"></i>
                    Languages
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    onClick={() => handleNavClick('/for-organizations')}
                    active={isActivePath('/for-organizations')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fas fa-building me-2"></i>
                    Organizations
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    onClick={() => handleNavClick('/for-individuals')}
                    active={isActivePath('/for-individuals')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fas fa-user me-2"></i>
                    Individuals
                  </NavLink>
                </NavItem>
              </>
            )}

            {/* App Navigation - Show when authenticated */}
            {isAuthenticated && (
              <>
                {/* Single Dashboard Link */}
                <NavItem>
                  <NavLink
                    onClick={() => handleNavClick('/dashboard')}
                    active={isActivePath('/dashboard') || isActivePath('/admin') || isActivePath('/student-dashboard')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className={`fas ${hasAdminAccess ? 'fa-cogs' : 'fa-tachometer-alt'} me-2`}></i>
                    {hasAdminAccess ? 'Admin Dashboard' : 'Dashboard'}
                    {isSuperOrgAdmin && (
                      <span className="badge bg-primary ms-2" style={{ fontSize: '0.6rem' }}>
                        SUPER
                      </span>
                    )}
                  </NavLink>
                </NavItem>

                {/* Admin Management Dropdown */}
                {hasAdminAccess && (
                  <AdminManagementMenu
                    onNavigate={handleNavClick}
                    isSuperOrgAdmin={isSuperOrgAdmin ?? false}
                  />
                )}

                {/* Student Navigation */}
                {user?.role === 'student' && (
                  <>
                    <NavItem>
                      <NavLink
                        onClick={() => handleNavClick('/tests')}
                        active={isActivePath('/tests')}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="fas fa-clipboard-list me-2"></i>
                        Available Tests
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        onClick={() => handleNavClick('/results')}
                        active={isActivePath('/results')}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="fas fa-chart-line me-2"></i>
                        My Results
                      </NavLink>
                    </NavItem>
                  </>
                )}

                {/* Platform Info Dropdown */}
                <PlatformInfoMenu onNavigate={handleNavClick} />
              </>
            )}
          </Nav>

          {/* Right side navigation */}
          <Nav navbar>
            {!isAuthenticated ? (
              <>
                {/* Quick Sign In Button */}
                <NavItem className="me-2">
                  <Button
                    outline
                    color="primary"
                    size="sm"
                    onClick={toggleLoginInputs}
                    active={showLoginInputs}
                  >
                    <i className={`fas ${showLoginInputs ? 'fa-times' : 'fa-sign-in-alt'} me-2`}></i>
                    {showLoginInputs ? 'Close' : 'Sign In'}
                  </Button>
                </NavItem>

                {/* Register Button */}
                <NavItem>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => handleNavClick('/register')}
                  >
                    <i className="fas fa-user-plus me-2"></i>
                    Get Started
                  </Button>
                </NavItem>
              </>
            ) : (
              <>
                {/* Notification Bell */}
                <NotificationBell />

                {/* User Menu */}
                <UserMenu
                  user={user}
                  onNavigate={handleNavClick}
                  onLogout={handleLogout}
                />
              </>
            )}
          </Nav>
        </Collapse>

        {/* Quick Login Form */}
        {!isAuthenticated && showLoginInputs && (
          <QuickLoginForm
            loginData={loginData}
            authLoading={authLoading}
            authError={authError}
            onInputChange={handleInputChange}
            onLogin={handleLogin}
            onNavigate={handleNavClick}
            onClearError={clearError}
          />
        )}
      </Container>

      {/* CSS for smooth animations */}
      <style>{`
        .navbar {
          transition: padding-bottom 0.3s ease-in-out;
        }
        
        .form-control:focus {
          box-shadow: 0 0 0 0.15rem rgba(102, 126, 234, 0.25);
        }
        
        .btn-primary:hover {
          transform: translateY(-1px);
        }
        
        @media (max-width: 767.98px) {
          .navbar .row {
            flex-direction: column;
          }
          
          .navbar .row .col-md-3,
          .navbar .row .col-md-2,
          .navbar .row .col-md-4 {
            width: 100%;
            margin-bottom: 0.5rem;
          }
          
          .dropdown-toggle .text-end {
            text-align: left !important;
          }
        }
      `}</style>
    </Navbar>
  );
};

export default AppNavbar;