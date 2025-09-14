// src/components/auth/RegisterForm.tsx
import React, { useState } from 'react';
import { Form, FormGroup, Label, Input, Button, InputGroup, InputGroupText, Progress } from 'reactstrap';

interface RegisterFormProps {
  loading: boolean;
  onSubmit: (username: string, firstName: string, lastName: string, email?: string, password?: string, inviteCode?: string, role?: string) => Promise<void>;
  onValidateInviteCode: (inviteCode: string) => Promise<{ valid: boolean; organizationName?: string }>;
  onClearError: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  loading, 
  onSubmit, 
  onValidateInviteCode, 
  onClearError 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',        // NEW: Required field
    lastName: '',         // NEW: Required field
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
    role: 'student' as 'student' | 'instructor' | 'admin'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [inviteValidation, setInviteValidation] = useState<{
    valid: boolean;
    organizationName?: string;
    loading: boolean;
  }>({ valid: false, loading: false });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific errors
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear auth errors when user starts typing
    onClearError();
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    // NEW: First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters';
    }

    // NEW: Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters';
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
      const result = await onValidateInviteCode(formData.inviteCode);
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
      await onSubmit(
        formData.username,
        formData.firstName,    // NEW: Pass firstName
        formData.lastName,     // NEW: Pass lastName
        formData.email || undefined,
        formData.password,
        formData.inviteCode || undefined,
        formData.role
      );
    } catch (error) {
      console.error('Registration error:', error);
    }
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

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <Form onSubmit={handleSubmit}>
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

      {/* NEW: First Name Field */}
      <FormGroup className="mb-3">
        <Label for="firstName" className="fw-semibold">
          First Name <span className="text-danger">*</span>
        </Label>
        <InputGroup>
          <InputGroupText>
            <i className="fas fa-user"></i>
          </InputGroupText>
          <Input
            type="text"
            name="firstName"
            id="firstName"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleInputChange}
            invalid={!!formErrors.firstName}
            disabled={loading}
            autoComplete="given-name"
          />
        </InputGroup>
        {formErrors.firstName && (
          <small className="text-danger">
            <i className="fas fa-exclamation-circle me-1"></i>
            {formErrors.firstName}
          </small>
        )}
      </FormGroup>

      {/* NEW: Last Name Field */}
      <FormGroup className="mb-3">
        <Label for="lastName" className="fw-semibold">
          Last Name <span className="text-danger">*</span>
        </Label>
        <InputGroup>
          <InputGroupText>
            <i className="fas fa-user"></i>
          </InputGroupText>
          <Input
            type="text"
            name="lastName"
            id="lastName"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleInputChange}
            invalid={!!formErrors.lastName}
            disabled={loading}
            autoComplete="family-name"
          />
        </InputGroup>
        {formErrors.lastName && (
          <small className="text-danger">
            <i className="fas fa-exclamation-circle me-1"></i>
            {formErrors.lastName}
          </small>
        )}
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
              Creating Account...
            </>
          ) : (
            <>
              <i className="fas fa-user-plus me-2"></i>
              Create Account
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default RegisterForm;