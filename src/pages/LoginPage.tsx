import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const { login, loading, error } = useAuth() as any; // TODO: Add strict typing for useAuth
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate()

  const handleLogin = async (email: string, password: string) => {
    try {
      setFormError(null);
      await login(email, password);
      // Optionally redirect after login
      navigate("/");
    } catch (err: any) {
      setFormError(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center min-vh-100">
      <AuthForm
        title="Login"
        onSubmit={handleLogin}
        loading={loading}
        error={formError || error}
        submitLabel="Sign In"
      />
    </div>
  );
};

export default LoginPage;