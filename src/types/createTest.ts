// types/createTest.ts - Types that exactly match backend model
import type { TestSection, TestStatus, Tags, Language, TestType, TestSettings } from './index';

// CreateTestData interface that maps exactly to backend Test model
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
  
  // Backend fields that will be set by backend or frontend
  organizationId?: string; // Will be set by backend
  isGlobal: boolean; // Default false
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
  // Remove frontend-only fields before sending to backend
  const { instructions, ...backendPayload } = testData;
  
  return {
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
    ...(backendPayload.settings.useSections ? { sections: backendPayload.sections } : { questions: backendPayload.questions }),
    isGlobal: backendPayload.isGlobal,
    status: backendPayload.status,
    // organizationId and createdBy will be set by backend
  };
};