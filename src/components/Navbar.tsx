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
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  Form,
  FormGroup,
  Label,
  Alert,
  Container,
  Row,
  Col
} from 'reactstrap';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    // Let the router handle where to go after logout via route guards
    setIsOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.loginId && loginData.password) {
      clearError();
      await login(loginData.loginId, loginData.password);
      // Let the router handle redirect via route guards
      // Only clear form if login was successful (no error)
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

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (user?.fullName) {
      return user.fullName;
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.loginId || 'User';
  };

  const hasUserName = () => {
    return user?.fullName || (user?.firstName && user?.lastName);
  };

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
            // Smart brand click - always go to dashboard (which redirects appropriately)
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
                {/* Single Dashboard Link - Goes to role-appropriate dashboard */}
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
                
                {/* Admin Management Dropdown - Only show for admins/instructors */}
                {hasAdminAccess && (
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret>
                      <i className="fas fa-tools me-2"></i>
                      Manage
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem onClick={() => handleNavClick('/admin/users')}>
                        <i className="fas fa-users me-2"></i>
                        Users
                      </DropdownItem>
                      <DropdownItem onClick={() => handleNavClick('/admin/question-bank')}>
                        <i className="fas fa-question-circle me-2"></i>
                        Questions
                      </DropdownItem>
                      <DropdownItem onClick={() => handleNavClick('/admin/tests')}>
                        <i className="fas fa-clipboard-list me-2"></i>
                        Tests
                      </DropdownItem>
                      <DropdownItem onClick={() => handleNavClick('/admin/test-sessions')}>
                        <i className="fas fa-desktop me-2"></i>
                        Test Sessions
                      </DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem onClick={() => handleNavClick('/admin/analytics')}>
                        <i className="fas fa-chart-bar me-2"></i>
                        Analytics
                      </DropdownItem>
                      
                      {/* Super Admin Only Items */}
                      {isSuperOrgAdmin && (
                        <>
                          <DropdownItem divider />
                          <DropdownItem header className="text-primary">
                            <i className="fas fa-crown me-2"></i>
                            Super Admin
                          </DropdownItem>
                          <DropdownItem onClick={() => handleNavClick('/admin/organizations')}>
                            <i className="fas fa-building me-2"></i>
                            Organizations
                          </DropdownItem>
                          <DropdownItem onClick={() => handleNavClick('/admin/global-content')}>
                            <i className="fas fa-globe me-2"></i>
                            Global Content
                          </DropdownItem>
                          <DropdownItem onClick={() => handleNavClick('/admin/system-health')}>
                            <i className="fas fa-heartbeat me-2"></i>
                            System Health
                          </DropdownItem>
                        </>
                      )}
                    </DropdownMenu>
                  </UncontrolledDropdown>
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

                {/* Platform Info Dropdown for authenticated users */}
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret className="text-muted">
                    <i className="fas fa-info-circle me-2"></i>
                    Platform
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => handleNavClick('/features')}>
                      <i className="fas fa-cogs me-2"></i>
                      Features
                    </DropdownItem>
                    <DropdownItem onClick={() => handleNavClick('/languages')}>
                      <i className="fas fa-code me-2"></i>
                      Languages
                    </DropdownItem>
                    <DropdownItem onClick={() => handleNavClick('/for-organizations')}>
                      <i className="fas fa-building me-2"></i>
                      Organizations
                    </DropdownItem>
                    <DropdownItem onClick={() => handleNavClick('/for-individuals')}>
                      <i className="fas fa-user me-2"></i>
                      Individuals
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={() => handleNavClick('/')}>
                      <i className="fas fa-home me-2"></i>
                      Landing Page
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
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
              /* User Menu Dropdown */
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret className="d-flex align-items-center">
                  <div className="me-2 text-end">
                    <div className="fw-medium" style={{ lineHeight: '1.1' }}>
                      {getUserDisplayName()}
                    </div>
                    {hasUserName() && (
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        @{user?.loginId}
                      </small>
                    )}
                  </div>
                  <div className="d-flex align-items-center">
                    <span 
                      className="badge text-uppercase me-1" 
                      style={{ 
                        fontSize: '0.7rem',
                        backgroundColor: user?.role === 'admin' ? '#dc3545' : 
                                        user?.role === 'instructor' ? '#fd7e14' : '#28a745',
                        color: 'white'
                      }}
                    >
                      {user?.role}
                    </span>
                    {user?.organization?.isSuperOrg && (
                      <span className="badge bg-primary" style={{ fontSize: '0.6rem' }}>
                        SUPER
                      </span>
                    )}
                  </div>
                </DropdownToggle>
                <DropdownMenu end>
                  <div className="dropdown-header">
                    <div className="fw-medium">{getUserDisplayName()}</div>
                    <small className="text-muted">@{user?.loginId}</small>
                    <div className="mt-1">
                      <small className="text-muted">
                        ID: {user?._id?.slice(0, 8)}...
                      </small>
                      <br />
                      <small className="text-muted">
                        Org: {user?.organization?.name}
                      </small>
                    </div>
                  </div>
                  <DropdownItem divider />
                  <DropdownItem onClick={() => handleNavClick('/profile')}>
                    <i className="fas fa-user me-2"></i>
                    Profile
                  </DropdownItem>
                  <DropdownItem onClick={() => handleNavClick('/settings')}>
                    <i className="fas fa-cog me-2"></i>
                    Settings
                  </DropdownItem>
                  
                  <DropdownItem divider />
                  <DropdownItem onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Sign Out
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            )}
          </Nav>
        </Collapse>

        {/* Inline Login Form - Only show when NOT authenticated */}
        {!isAuthenticated && showLoginInputs && (
          <div 
            className="w-100 mt-3"
            style={{
              transition: 'all 0.3s ease-in-out',
              opacity: showLoginInputs ? 1 : 0,
              transform: showLoginInputs ? 'translateY(0)' : 'translateY(-10px)'
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
                      onClick={clearError}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    disabled={authLoading}
                    bsSize="sm"
                    style={{ fontSize: '0.875rem' }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleLogin(e as any);
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
                    onClick={handleLogin}
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
                      onClick={() => handleNavClick('/login')}
                      className="p-1 text-muted"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Full Login
                    </Button>
                    <Button 
                      color="link" 
                      size="sm"
                      onClick={() => handleNavClick('/register')}
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