import { createContext, useState, useEffect, useCallback, useContext } from "react";
import type { ReactNode } from "react";
import axios from "../utils/axiosInstance";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  client: typeof axios;
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/auth/me");
      
      // Handle standardized response format
      if (response.data.success) {
        // New standardized format: { success: true, data: { user: {...} } }
        const userData = response.data.data?.user;
        setUser(userData);
      } else if (response.data.user) {
        // Fallback for direct user object: { user: {...} }
        setUser(response.data.user);
      } else {
        // Fallback for other formats
        setUser(response.data);
      }
    } catch (error: any) {
      console.error('Fetch user error:', error);
      setUser(null);
      // Don't redirect here as the axios interceptor handles 401s
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/auth/login", { email, password });
      
      // Handle standardized response format
      let userData = null;
      
      if (response.data.success) {
        // New standardized format: { success: true, data: { user: {...} } }
        userData = response.data.data?.user;
      } else if (response.data.user) {
        // Fallback for direct user object: { user: {...} }
        userData = response.data.user;
      } else {
        // Fallback for other formats
        userData = response.data;
      }
      
      if (userData) {
        setUser(userData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      // Handle both old and new error formats
      let errorMessage = 'Login failed';
      
      if (error.response?.data?.error) {
        // New standardized error format
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        // Alternative error format
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        // String error format
        errorMessage = error.response.data;
      }
      
      throw new Error(errorMessage);
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const response = await axios.post("/auth/register", payload);
      
      // Handle standardized response format
      let userData = null;
      
      if (response.data.success) {
        // New standardized format: { success: true, data: { user: {...} } }
        userData = response.data.data?.user;
      } else if (response.data.user) {
        // Fallback for direct user object: { user: {...} }
        userData = response.data.user;
      } else {
        // Fallback for other formats
        userData = response.data;
      }
      
      if (userData) {
        setUser(userData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      // Handle both old and new error formats
      let errorMessage = 'Registration failed';
      
      if (error.response?.data?.error) {
        // New standardized error format
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        // Alternative error format
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        // String error format
        errorMessage = error.response.data;
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
      setUser(null);
    } catch (error) {
      // Even if logout fails, clear local state
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        client: axios
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};