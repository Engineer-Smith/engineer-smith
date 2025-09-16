// Fixed CreateTestPage.tsx with proper navigation
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTestWizard from '../components/tests/CreateTestWizard';

const CreateTestPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/admin/tests');
  };

  const handleComplete = () => {
    
    // Navigate back to test management with success message
    navigate('/admin/tests', {
      state: {
        message: 'Test created successfully!'
      }
    });
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <CreateTestWizard 
        onCancel={handleCancel}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default CreateTestPage;