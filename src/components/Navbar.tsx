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
    if (path.startsWith('#')) {
      // Handle hash links for landing page
      if (currentPath === '/') {
        const element = document.querySelector(path);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/${path}`);
      }
    } else {
      navigate(path);
    }
    setIsOpen(false);
    setShowLoginInputs(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.loginId && loginData.password) {
      clearError(); // Clear any previous errors
      await login(loginData.loginId, loginData.password);
      // Only clear form and close if login was successful
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
            navigate('/');
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
            {/* Landing Page Links - Only show when on homepage */}
            {currentPath === '/' && (
              <>
                <NavItem>
                  <NavLink 
                    href="#features"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick('#features');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    Features
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    href="#languages"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick('#languages');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    Languages
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink 
                    href="#analytics"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick('#analytics');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    Analytics
                  </NavLink>
                </NavItem>
              </>
            )}
            
            {/* App Navigation - Show when authenticated */}
            {isAuthenticated && (
              <>
                <NavItem>
                  <NavLink 
                    onClick={() => handleNavClick('/dashboard')}
                    active={isActivePath('/dashboard')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                  </NavLink>
                </NavItem>
                
                {/* Admin Navigation */}
                {hasAdminAccess && (
                  <>
                    <NavItem>
                      <NavLink 
                        onClick={() => handleNavClick('/admin')}
                        active={isActivePath('/admin')}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="fas fa-cogs me-2"></i>
                        Admin
                        {isSuperOrgAdmin && (
                          <span className="badge bg-primary ms-2" style={{ fontSize: '0.6rem' }}>
                            SUPER
                          </span>
                        )}
                      </NavLink>
                    </NavItem>
                    
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
                  </>
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
                  <span className="me-2">
                    {user?.loginId}
                  </span>
                  <span 
                    className="badge text-uppercase" 
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
                    <span className="badge bg-primary ms-1" style={{ fontSize: '0.6rem' }}>
                      SUPER
                    </span>
                  )}
                </DropdownToggle>
                <DropdownMenu end>
                  <div className="dropdown-header">
                    <small className="text-muted">
                      ID: {user?.id?.slice(0, 8)}...
                    </small>
                    <br />
                    <small className="text-muted">
                      Org: {user?.organization?.name}
                    </small>
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
                  
                  {/* Quick Admin Access */}
                  {hasAdminAccess && (
                    <>
                      <DropdownItem divider />
                      <DropdownItem onClick={() => handleNavClick('/admin')}>
                        <i className="fas fa-cogs me-2"></i>
                        Admin Dashboard
                      </DropdownItem>
                    </>
                  )}
                  
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

        {/* Inline Login Form - Appears directly in navbar */}
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
                  <Label for="inline-login-id" size="sm" className="text-muted">
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
                  <Label for="inline-password" size="sm" className="text-muted">
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
        }
      `}</style>
    </Navbar>
  );
};

export default AppNavbar;