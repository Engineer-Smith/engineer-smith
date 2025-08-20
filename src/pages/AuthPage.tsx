import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Nav,
  NavItem,
  NavLink,
  Progress,
  InputGroup,
  InputGroupText
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  mode: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  
  // Use the mode prop directly
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(mode);
  const [formData, setFormData] = useState({
    // Login fields
    loginCredential: '',
    password: '',
    
    // Registration fields
    username: '',
    email: '',
    confirmPassword: '',
    inviteCode: '',
    role: 'student' as 'student' | 'instructor' | 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [inviteValidation, setInviteValidation] = useState<{
    valid: boolean;
    organizationName?: string;
    loading: boolean;
  }>({ valid: false, loading: false });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

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

  // Single useEffect for auth redirect only
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle tab changes with direct navigation
  const handleTabChange = (tab: 'login' | 'register') => {
    if (tab === activeTab) return; // Prevent unnecessary updates
    
    setActiveTab(tab);
    setFormErrors({});
    clearError();
    setInviteValidation({ valid: false, loading: false });
    
    // Clear form data
    setFormData({
      loginCredential: '',
      password: '',
      username: '',
      email: '',
      confirmPassword: '',
      inviteCode: '',
      role: 'student'
    });

    // Navigate to correct path
    const newPath = tab === 'register' ? '/register' : '/login';
    navigate(newPath, { replace: true });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific errors
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear auth errors when user starts typing
    if (authError) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (activeTab === 'login') {
      // Login validation
      if (!formData.loginCredential.trim()) {
        errors.loginCredential = 'Username or email is required';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
      }
    } else {
      // Registration validation
      if (!formData.username.trim()) {
        errors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
        errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
      }

      // Email validation (optional)
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }

      // Password validation
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      // Invite code validation (if provided)
      if (formData.inviteCode && !inviteValidation.valid) {
        errors.inviteCode = 'Please validate the invite code';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleValidateInvite = async () => {
    if (!formData.inviteCode.trim()) {
      setFormErrors(prev => ({ ...prev, inviteCode: 'Please enter an invite code' }));
      return;
    }

    setInviteValidation({ valid: false, loading: true });
    
    try {
      const result = await validateInviteCode(formData.inviteCode);
      setInviteValidation({ 
        valid: result.valid, 
        organizationName: result.organizationName,
        loading: false 
      });
      
      if (!result.valid) {
        setFormErrors(prev => ({ ...prev, inviteCode: 'Invalid invite code' }));
      } else {
        setFormErrors(prev => ({ ...prev, inviteCode: '' }));
      }
    } catch (error) {
      setInviteValidation({ valid: false, loading: false });
      setFormErrors(prev => ({ ...prev, inviteCode: 'Failed to validate invite code' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (activeTab === 'login') {
        await login(formData.loginCredential, formData.password);
      } else {
        await register(
          formData.username,
          formData.email || undefined,
          formData.password,
          formData.inviteCode || undefined,
          formData.role
        );
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleSSO = () => {
    window.location.href = '/auth/login/sso';
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 12.5;
    if (/[^a-zA-Z0-9]/.test(password)) score += 12.5;

    if (score < 25) return { score, label: 'Weak', color: 'danger' };
    if (score < 50) return { score, label: 'Fair', color: 'warning' };
    if (score < 75) return { score, label: 'Good', color: 'info' };
    return { score, label: 'Strong', color: 'success' };
  };

  const passwordStrength = activeTab === 'register' ? getPasswordStrength(formData.password) : null;

  // Show loading spinner while auth is checking
  if (loading && !formData.loginCredential && !formData.username) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', paddingTop: '80px' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} xl={6}>
            <Card className="shadow-lg border-0">
              <CardBody className="p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div 
                    className="mx-auto mb-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      width: '80px',
                      height: '80px'
                    }}
                  >
                    <span style={{ color: 'white', fontSize: '2rem' }}>💻</span>
                  </div>
                  <h2 className="fw-bold text-primary">EngineerSmith</h2>
                  <p className="text-muted">Comprehensive Coding Assessment Platform</p>
                </div>

                {/* Tab Navigation */}
                <Nav tabs className="mb-4 justify-content-center">
                  <NavItem>
                    <NavLink 
                      active={activeTab === 'login'} 
                      onClick={() => handleTabChange('login')}
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
                      onClick={() => handleTabChange('register')}
                      style={{ cursor: 'pointer' }}
                      className={activeTab === 'register' ? 'border-primary text-primary fw-bold' : ''}
                    >
                      <i className="fas fa-user-plus me-2"></i>
                      Create Account
                    </NavLink>
                  </NavItem>
                </Nav>

                {/* Global Error Alert */}
                {authError && (
                  <Alert color="danger" className="mb-4">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {authError}
                    <Button 
                      color="link" 
                      size="sm" 
                      className="p-0 ms-2 text-danger"
                      onClick={clearError}
                    >
                      ✕
                    </Button>
                  </Alert>
                )}

                {/* Main Form */}
                <Form onSubmit={handleSubmit}>
                  {activeTab === 'login' ? (
                    // LOGIN FORM
                    <>
                      {/* Login Credential Field */}
                      <FormGroup className="mb-3">
                        <Label for="loginCredential" className="fw-semibold">
                          Username or Email
                        </Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fas fa-user"></i>
                          </InputGroupText>
                          <Input
                            type="text"
                            name="loginCredential"
                            id="loginCredential"
                            placeholder="Enter your username or email"
                            value={formData.loginCredential}
                            onChange={handleInputChange}
                            invalid={!!formErrors.loginCredential}
                            disabled={loading}
                            autoComplete="username"
                          />
                        </InputGroup>
                        {formErrors.loginCredential && (
                          <small className="text-danger">
                            <i className="fas fa-exclamation-circle me-1"></i>
                            {formErrors.loginCredential}
                          </small>
                        )}
                      </FormGroup>

                      {/* Password Field */}
                      <FormGroup className="mb-3">
                        <Label for="password" className="fw-semibold">Password</Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fas fa-lock"></i>
                          </InputGroupText>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            id="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange}
                            invalid={!!formErrors.password}
                            disabled={loading}
                            autoComplete="current-password"
                          />
                          <Button
                            type="button"
                            color="link"
                            onClick={() => setShowPassword(!showPassword)}
                            className="border"
                            style={{ borderLeft: 'none' }}
                          >
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </Button>
                        </InputGroup>
                        {formErrors.password && (
                          <small className="text-danger">
                            <i className="fas fa-exclamation-circle me-1"></i>
                            {formErrors.password}
                          </small>
                        )}
                      </FormGroup>
                    </>
                  ) : (
                    // REGISTRATION FORM
                    <>
                      {/* Username Field */}
                      <FormGroup className="mb-3">
                        <Label for="username" className="fw-semibold">
                          Username <span className="text-danger">*</span>
                        </Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fas fa-user"></i>
                          </InputGroupText>
                          <Input
                            type="text"
                            name="username"
                            id="username"
                            placeholder="Choose a unique username"
                            value={formData.username}
                            onChange={handleInputChange}
                            invalid={!!formErrors.username}
                            disabled={loading}
                            autoComplete="username"
                          />
                        </InputGroup>
                        {formErrors.username && (
                          <small className="text-danger">
                            <i className="fas fa-exclamation-circle me-1"></i>
                            {formErrors.username}
                          </small>
                        )}
                        <small className="text-muted">
                          Letters, numbers, underscores, and hyphens only
                        </small>
                      </FormGroup>

                      {/* Email Field (Optional) */}
                      <FormGroup className="mb-3">
                        <Label for="email" className="fw-semibold">
                          Email Address 
                          <small className="text-muted fw-normal">(Optional)</small>
                        </Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fas fa-envelope"></i>
                          </InputGroupText>
                          <Input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleInputChange}
                            invalid={!!formErrors.email}
                            disabled={loading}
                            autoComplete="email"
                          />
                        </InputGroup>
                        {formErrors.email && (
                          <small className="text-danger">
                            <i className="fas fa-exclamation-circle me-1"></i>
                            {formErrors.email}
                          </small>
                        )}
                        <small className="text-muted">
                          Optional - some environments may not have email access
                        </small>
                      </FormGroup>

                      {/* Password Field */}
                      <FormGroup className="mb-3">
                        <Label for="password" className="fw-semibold">
                          Password <span className="text-danger">*</span>
                        </Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fas fa-lock"></i>
                          </InputGroupText>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            id="password"
                            placeholder="Create a secure password"
                            value={formData.password}
                            onChange={handleInputChange}
                            invalid={!!formErrors.password}
                            disabled={loading}
                            autoComplete="new-password"
                          />
                          <Button
                            type="button"
                            color="link"
                            onClick={() => setShowPassword(!showPassword)}
                            className="border"
                            style={{ borderLeft: 'none' }}
                          >
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </Button>
                        </InputGroup>
                        {formErrors.password && (
                          <small className="text-danger">
                            <i className="fas fa-exclamation-circle me-1"></i>
                            {formErrors.password}
                          </small>
                        )}
                        
                        {/* Password Strength Indicator */}
                        {formData.password && passwordStrength && (
                          <div className="mt-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">Password Strength:</small>
                              <small className={`text-${passwordStrength.color} fw-semibold`}>
                                {passwordStrength.label}
                              </small>
                            </div>
                            <Progress 
                              value={passwordStrength.score} 
                              color={passwordStrength.color}
                              style={{ height: '4px' }}
                            />
                          </div>
                        )}
                      </FormGroup>

                      {/* Confirm Password */}
                      <FormGroup className="mb-3">
                        <Label for="confirmPassword" className="fw-semibold">
                          Confirm Password <span className="text-danger">*</span>
                        </Label>
                        <InputGroup>
                          <InputGroupText>
                            <i className="fas fa-lock"></i>
                          </InputGroupText>
                          <Input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            invalid={!!formErrors.confirmPassword}
                            disabled={loading}
                            autoComplete="new-password"
                          />
                        </InputGroup>
                        {formErrors.confirmPassword && (
                          <small className="text-danger">
                            <i className="fas fa-exclamation-circle me-1"></i>
                            {formErrors.confirmPassword}
                          </small>
                        )}
                      </FormGroup>

                      {/* Invite Code (Optional) */}
                      <FormGroup className="mb-3">
                        <Label for="inviteCode" className="fw-semibold">
                          Organization Invite Code 
                          <small className="text-muted fw-normal">(Optional)</small>
                        </Label>
                        <InputGroup>
                          <Input
                            type="text"
                            name="inviteCode"
                            id="inviteCode"
                            placeholder="Enter invite code to join an organization"
                            value={formData.inviteCode}
                            onChange={handleInputChange}
                            invalid={!!formErrors.inviteCode}
                            disabled={loading || inviteValidation.loading}
                          />
                          <Button
                            type="button"
                            color="outline-primary"
                            onClick={handleValidateInvite}
                            disabled={!formData.inviteCode.trim() || loading || inviteValidation.loading}
                          >
                            {inviteValidation.loading ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              'Validate'
                            )}
                          </Button>
                        </InputGroup>
                        
                        {formErrors.inviteCode && (
                          <small className="text-danger">
                            <i className="fas fa-exclamation-circle me-1"></i>
                            {formErrors.inviteCode}
                          </small>
                        )}
                        
                        {inviteValidation.valid && inviteValidation.organizationName && (
                          <small className="text-success">
                            <i className="fas fa-check-circle me-1"></i>
                            Valid! Joining: <strong>{inviteValidation.organizationName}</strong>
                          </small>
                        )}
                        
                        <small className="text-muted d-block mt-1">
                          Leave empty to access global assessments only
                        </small>
                      </FormGroup>

                      {/* Role Selection (when invite code is valid) */}
                      {inviteValidation.valid && (
                        <FormGroup className="mb-4">
                          <Label for="role" className="fw-semibold">Role</Label>
                          <Input
                            type="select"
                            name="role"
                            id="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            disabled={loading}
                          >
                            <option value="student">Student - Take assessments and view results</option>
                            <option value="instructor">Instructor - Create content and view analytics</option>
                            <option value="admin">Admin - Full organizational management</option>
                          </Input>
                        </FormGroup>
                      )}
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="d-grid gap-2 mb-4">
                    <Button 
                      type="submit" 
                      color="primary" 
                      size="lg"
                      disabled={loading}
                      className="fw-semibold"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {activeTab === 'login' ? 'Signing In...' : 'Creating Account...'}
                        </>
                      ) : (
                        <>
                          <i className={`fas ${activeTab === 'login' ? 'fa-sign-in-alt' : 'fa-user-plus'} me-2`}></i>
                          {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

                {/* SSO Option */}
                <div className="text-center mb-4">
                  <div className="position-relative">
                    <hr />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
                      or
                    </span>
                  </div>
                </div>

                <div className="d-grid gap-2 mb-4">
                  <Button 
                    color="outline-primary" 
                    onClick={handleSSO}
                    disabled={loading}
                  >
                    <i className="fab fa-google me-2"></i>
                    Continue with SSO
                  </Button>
                </div>

                {/* Footer Links */}
                <div className="text-center">
                  <small className="text-muted">
                    {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <Button 
                      color="link" 
                      size="sm" 
                      className="p-0"
                      onClick={() => handleTabChange(activeTab === 'login' ? 'register' : 'login')}
                    >
                      {activeTab === 'login' ? 'Create one here' : 'Sign in here'}
                    </Button>
                  </small>
                </div>

                {/* Feature Highlights */}
                <div className="mt-4 pt-4 border-top">
                  <Row className="text-center">
                    <Col md={4}>
                      <div className="mb-3">
                        <i className="fas fa-globe text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                        <h6 className="fw-semibold">Global Assessments</h6>
                        <small className="text-muted">Access 10+ programming languages</small>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="mb-3">
                        <i className="fas fa-users text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                        <h6 className="fw-semibold">Team Organizations</h6>
                        <small className="text-muted">Custom content and analytics</small>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="mb-3">
                        <i className="fas fa-shield-alt text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                        <h6 className="fw-semibold">Secure Platform</h6>
                        <small className="text-muted">Enterprise-grade security</small>
                      </div>
                    </Col>
                  </Row>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthPage;