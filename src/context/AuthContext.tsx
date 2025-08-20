import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/ApiService';
import type { ApiResponse, User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (loginCredential: string, password: string) => Promise<void>;
  ssoLogin: () => void;
  register: (
    username: string,
    email?: string,
    password?: string,
    inviteCode?: string,
    role?: string
  ) => Promise<void>;
  validateInviteCode: (inviteCode: string) => Promise<{ valid: boolean; organizationName?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async () => {},
  ssoLogin: () => {},
  register: async () => {},
  validateInviteCode: async () => ({ valid: false }),
  logout: async () => {},
  clearError: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  const setError = (message: string) => {
    setState((prev) => ({
      ...prev,
      loading: false,
      error: message,
    }));
  };

  const setAuthenticated = (user: User) => {
    setState({
      user,
      isAuthenticated: true,
      loading: false,
      error: null,
    });
  };

  const setUnauthenticated = () => {
    setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  };

  useEffect(() => {
    let mounted = true;
    
    const checkAuthStatus = async () => {
      try {
        console.log('AuthContext: Checking auth status...');
        setState((prev) => ({ ...prev, loading: true }));
        
        const response: ApiResponse<{ success: boolean; user: User }> = await apiService.getCurrentUser();

        if (!mounted) return;

        if (!response.error && response.data?.success && response.data?.user) {
          console.log('AuthContext: User authenticated:', response.data.user.loginId);
          setAuthenticated(response.data.user);
        } else {
          console.log('AuthContext: No valid session');
          setUnauthenticated();
        }
      } catch (error) {
        if (!mounted) return;
        
        console.log('AuthContext: Auth check failed (expected if not logged in)');
        setUnauthenticated();
      }
    };

    checkAuthStatus();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (loginCredential: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ApiResponse<{ success: boolean; user: User; csrfToken: string }> = await apiService.login({ 
        loginCredential, 
        password 
      });

      if (response.error || !response.data?.success || !response.data?.user) {
        setError(response.message || 'Login failed');
        return;
      }

      setAuthenticated(response.data.user);
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  }, []);

  const ssoLogin = useCallback(() => {
    const ssoUrl = apiService.getSSOLoginUrl();
    window.location.href = ssoUrl;
  }, []);

  const register = useCallback(
    async (
      username: string,
      email?: string,
      password?: string,
      inviteCode?: string,
      role?: string
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response: ApiResponse<{ success: boolean; user: User; csrfToken: string }> = await apiService.register({
          username,
          email,
          password,
          inviteCode,
          role,
        });

        if (response.error || !response.data?.success || !response.data?.user) {
          setError(response.message || 'Registration failed');
          return;
        }

        setAuthenticated(response.data.user);
      } catch (error) {
        console.error('Registration error:', error);
        setError('Registration failed. Please try again.');
      }
    },
    []
  );

  const validateInviteCode = useCallback(async (inviteCode: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response: ApiResponse<{ success: boolean; organization: { id: string; name: string } }> =
        await apiService.validateInviteCode({ inviteCode });

      setState((prev) => ({ ...prev, loading: false }));

      if (response.error || !response.data?.success || !response.data?.organization) {
        setError(response.message || 'Invalid invite code');
        return { valid: false };
      }

      return { 
        valid: true, 
        organizationName: response.data.organization.name 
      };
    } catch (error) {
      console.error('Invite code validation error:', error);
      setError('Failed to validate invite code');
      return { valid: false };
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await apiService.logout();
      document.cookie = 'csrfToken=; Max-Age=0; path=/;';
    } catch (error) {
      console.error('Logout error:', error);
    }

    setUnauthenticated();
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    ssoLogin,
    register,
    validateInviteCode,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;