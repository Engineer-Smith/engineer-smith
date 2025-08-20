// src/pages/admin/CreateTestPage.tsx
import React from 'react';
import CreateTestWizard from '../components/tests/CreateTestWizard';

const CreateTestPage: React.FC = () => {
  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <CreateTestWizard />
    </div>
  );
};

export default CreateTestPage;