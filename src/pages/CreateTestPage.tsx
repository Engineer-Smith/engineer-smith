// src/pages/CreateTestPage.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import RequireAdmin from "../components/RequireAdmin";
import CreateTestWizard from "../components/tests/CreateTestWizard";

const CreateTestPage: React.FC = () => {
  const { user } = useAuth();

  // Show loading while user is being fetched
  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  return (
    <RequireAdmin>
      <CreateTestWizard />
    </RequireAdmin>
  );
};

export default CreateTestPage;