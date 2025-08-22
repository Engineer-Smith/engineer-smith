// types/createTest.ts - Updated to remove isGlobal from frontend creation
import type { TestSection, TestStatus, Tags, Language, TestType, TestSettings } from './index';

// CreateTestData interface - isGlobal removed as it's determined by backend
export interface CreateTestData {
  // Basic fields that match Test.js model exactly
  title: string;
  description: string;
  testType: TestType;
  languages: Language[]; // Maps to backend 'languages' field
  tags: Tags[]; // Maps to backend 'tags' field
  
  // Settings that match the nested settings object in backend exactly
  settings: TestSettings;
  
  // Questions and sections - exactly as backend expects
  questions: TestQuestion[]; // Used when useSections = false
  sections: TestSection[]; // Used when useSections = true
  
  // Backend fields that will be set by backend
  organizationId?: string; // Will be set by backend based on user's org
  isGlobal?: boolean; // Will be set by backend based on user's org (superOrg = true, others = false)
  status: TestStatus; // draft, active, archived
  createdBy?: string; // Will be set by backend
  
  // Frontend-only fields for wizard (not sent to backend)
  instructions?: string; // For display only, not in backend model
}

// This matches the backend's questions array structure exactly
export interface TestQuestion {
  questionId: string; // ObjectId reference to Question
  points: number; // Required in backend
}

// Props for wizard step components
export interface WizardStepProps {
  testData: CreateTestData;
  setTestData: (data: CreateTestData) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  setError: (error: string | null) => void;
  setLoading?: (loading: boolean) => void;
}

// Template interface for the TestBasics component
export interface TestTemplate {
  id: TestType;
  name: string;
  description: string;
  languages: Language[];
  tags: Tags[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  estimatedQuestions: string; // e.g., "15-25"
  difficulty: string; // e.g., "Beginner to Intermediate"
}

// Utility function to convert CreateTestData to backend payload
export const createTestPayload = (testData: CreateTestData) => {
  // Remove frontend-only fields and backend-determined fields before sending
  const { instructions, isGlobal, organizationId, createdBy, ...backendPayload } = testData;
  
  console.log('createTestPayload: Input testData:', JSON.stringify(testData, null, 2));
  console.log('createTestPayload: publishStatus from testData:', testData.status);
  
  const payload = {
    title: backendPayload.title,
    description: backendPayload.description,
    testType: backendPayload.testType,
    languages: backendPayload.languages,
    tags: backendPayload.tags,
    settings: {
      timeLimit: backendPayload.settings.timeLimit,
      attemptsAllowed: backendPayload.settings.attemptsAllowed,
      shuffleQuestions: backendPayload.settings.shuffleQuestions,
      useSections: backendPayload.settings.useSections,
    },
    // Include sections OR questions based on useSections setting
    ...(backendPayload.settings.useSections ? 
      { sections: backendPayload.sections } : 
      { questions: backendPayload.questions }
    ),
    // ✅ FIXED: Include status in payload
    status: backendPayload.status || 'draft',
    // Note: isGlobal and organizationId are automatically determined by backend
    // based on the user's organization (superOrg = global, others = org-specific)
  };
  
  console.log('createTestPayload: Final payload:', JSON.stringify(payload, null, 2));
  console.log('createTestPayload: Status in payload:', payload.status);
  
  return payload;
};

// Helper function to get test scope display text based on user's org
export const getTestScopeText = (userOrganization?: { name: string; isSuperOrg: boolean }) => {
  if (!userOrganization) return 'Organization Test';
  
  return userOrganization.isSuperOrg 
    ? 'Global Test (Available to all organizations)'
    : `Organization Test (Available to ${userOrganization.name} only)`;
};

// Helper function to check if user can create global tests
export const canCreateGlobalTests = (userOrganization?: { isSuperOrg: boolean }) => {
  return userOrganization?.isSuperOrg || false;
};