// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { Form, FormGroup, Label, Input, Button, InputGroup, InputGroupText } from 'reactstrap';

interface LoginFormProps {
  loading: boolean;
  onSubmit: (loginCredential: string, password: string) => Promise<void>;
  onClearError: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ loading, onSubmit, onClearError }) => {
  const [formData, setFormData] = useState({
    loginCredential: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.loginCredential.trim()) {
      errors.loginCredential = 'Username or email is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData.loginCredential, formData.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
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
              Signing In...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt me-2"></i>
              Sign In
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;