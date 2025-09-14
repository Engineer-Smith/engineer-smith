// src/components/auth/AuthHeader.tsx
import React from 'react';

const AuthHeader: React.FC = () => {
  return (
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
  );
};

export default AuthHeader;