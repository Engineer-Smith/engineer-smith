import React from "react";
import { Container } from "reactstrap";
import { useAuth } from "../context/AuthContext";

const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container className="py-5 text-center">
      <h1 className="h2 mb-4 font-weight-bold">Welcome to EngineerSmith</h1>
      {user ? (
        <p className="lead text-muted">
          Hello, {user.profile?.firstName || user.email}!
        </p>
      ) : (
        <p className="lead text-muted">
          Please log in to access your dashboard.
        </p>
      )}
    </Container>
  );
};

export default LandingPage;