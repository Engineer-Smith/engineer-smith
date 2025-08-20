// src/types/index.ts - Types that exactly match backend models

// =====================
// Type Aliases (from backend enums)
// =====================
export type Role = "admin" | "instructor" | "student";
export type QuestionType = "multipleChoice" | "trueFalse" | "codeChallenge" | "codeDebugging";
export type Language =
  | "javascript"
  | "css"
  | "html"
  | "sql"
  | "dart"
  | "react"
  | "reactNative"
  | "flutter"
  | "express"
  | "python"
  | "typescript"
  | "json";
export type Difficulty = "easy" | "medium" | "hard";
export type TestStatus = "draft" | "active" | "archived";
export type SessionStatus = "inProgress" | "completed" | "expired" | "abandoned";
export type TestType = "frontend_basics" | "react_developer" | "fullstack_js" | "mobile_development" | "python_developer" | "custom";

// Tags enum exactly as defined in backend Test.js
export type Tags =
  | 'html'
  | 'css'
  | 'javascript'
  | 'dom'
  | 'events'
  | 'async-programming'
  | 'promises'
  | 'async-await'
  | 'es6'
  | 'closures'
  | 'scope'
  | 'hoisting'
  | 'flexbox'
  | 'grid'
  | 'responsive-design'
  | 'react'
  | 'react-native'
  | 'components'
  | 'hooks'
  | 'state-management'
  | 'props'
  | 'context-api'
  | 'redux'
  | 'react-router'
  | 'jsx'
  | 'virtual-dom'
  | 'native-components'
  | 'navigation'
  | 'flutter'
  | 'widgets'
  | 'state-management-flutter'
  | 'dart'
  | 'navigation-flutter'
  | 'ui-components'
  | 'express'
  | 'nodejs'
  | 'rest-api'
  | 'middleware'
  | 'routing'
  | 'authentication'
  | 'authorization'
  | 'jwt'
  | 'express-middleware'
  | 'sql'
  | 'queries'
  | 'joins'
  | 'indexes'
  | 'transactions'
  | 'database-design'
  | 'normalization'
  | 'python'
  | 'functions'
  | 'classes'
  | 'modules'
  | 'list-comprehensions'
  | 'decorators'
  | 'generators'
  | 'python-data-structures'
  | 'variables'
  | 'arrays'
  | 'objects'
  | 'loops'
  | 'conditionals'
  | 'algorithms'
  | 'data-structures'
  | 'error-handling'
  | 'testing'
  | 'mobile-development';

// =====================
// Core Interfaces (matching backend models exactly)
// =====================

// --- Organization (matches backend Organization model) ---
export interface Organization {
  id: string;
  name: string;
  isSuperOrg: boolean;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

// --- User (matches backend User model) ---
export interface User {
  id: string;
  loginId: string; // This will be the username
  email?: string; // Optional email field
  organizationId: string;
  organization?: Organization;
  role: Role;
  isSSO: boolean;
  ssoId?: string;
  ssoToken?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Question (matches backend Question model exactly) ---
export interface Question {
  id: string;
  title: string;
  description: string;
  type: QuestionType;
  language?: Language;
  organizationId?: string;
  isGlobal: boolean;
  options?: string[];
  correctAnswer?: number | boolean;
  testCases?: { input: string; output: string; hidden: boolean }[];
  difficulty?: Difficulty;
  status: TestStatus;
  createdBy: string;
  tags?: Tags[];
  usageStats: {
    timesUsed: number;
    totalAttempts: number;
    correctAttempts: number;
    successRate: number;
    averageTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

// --- Test Settings (matches backend Test.js settings schema exactly) ---
export interface TestSettings {
  timeLimit: number; // Required in backend
  attemptsAllowed: number; // Required in backend
  shuffleQuestions: boolean; // Default false in backend
  useSections: boolean; // Default false in backend
}

// --- Test Section (matches backend Test.js sections schema exactly) ---
export interface TestSection {
  name: string; // Required in backend
  timeLimit: number; // Required in backend
  questions: { questionId: string; points: number }[]; // Array of question references
}

// --- Test (matches backend Test.js model exactly) ---
export interface Test {
  id: string;
  title: string; // Required
  description: string; // Required
  testType: TestType; // Enum, default 'custom'
  languages: Language[]; // Array of Language enum values, default []
  tags: Tags[]; // Array of Tags enum values, default []
  settings: TestSettings; // Required nested object
  sections?: TestSection[]; // Optional, used when settings.useSections = true
  questions?: { questionId: string; points: number }[]; // Optional, used when settings.useSections = false
  organizationId?: string; // ObjectId reference, null for global tests
  isGlobal: boolean; // Default false
  status: TestStatus; // Enum, default 'draft'
  createdBy: string; // ObjectId reference, required
  stats: {
    totalAttempts: number; // Default 0
    averageScore: number; // Default 0
    passRate: number; // Default 0
  };
  createdAt: string;
  updatedAt: string;
}

// --- Test Session Question (matches backend model) ---
export interface TestSessionQuestion {
  questionId: string;
  answer?: number | boolean | string;
  isCorrect?: boolean;
  pointsAwarded?: number;
  timeSpent: number;
  sectionIndex?: number;
  sectionName?: string;
  codeSubmissions?: { code: string; submittedAt: string; passed: boolean; error?: string }[];
}

// --- Test Session Score (matches backend model) ---
export interface TestSessionScore {
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
}

// --- Test Session (matches backend model) ---
export interface TestSession {
  id: string;
  testId: string;
  userId: string;
  organizationId: string;
  attemptNumber: number;
  status: SessionStatus;
  startedAt: string;
  completedAt?: string;
  timeSpent: number;
  questions: TestSessionQuestion[];
  score: TestSessionScore;
  completedSections: number[];
  createdAt: string;
  updatedAt: string;
}

// --- Result (Snapshot of TestSession) ---
export interface Result {
  id: string;
  sessionId: string;
  testId: string;
  userId: string;
  organizationId: string;
  attemptNumber: number;
  status: SessionStatus;
  completedAt?: string;
  timeSpent: number;
  questions: TestSessionQuestion[];
  score: TestSessionScore;
  createdAt: string;
  updatedAt: string;
}

// =====================
// Analytics (matches backend structure)
// =====================
export interface AnalyticsResult {
  testId: string;
  questionId?: string;
  totalResults: number;
  averageScore: number;
  passRate: number;
  averageTime: number;
  questionSuccessRate?: number;
  questionAverageTime?: number;
  questionOptionStats?: number[];
}

export interface UserAnalytics {
  userId: string;
  organizationId: string;
  totalTests: number;
  averageScore: number;
  passRate: number;
  averageTime: number;
  tests: { testId: string; attemptNumber: number; score: number; passed: boolean; timeSpent: number }[];
}

export interface SectionAnalytics {
  testId: string;
  sectionIndex: number;
  sectionName: string;
  totalQuestions: number;
  averageScore: number;
  successRate: number;
  averageTime: number;
}

// =====================
// API Response Wrapper (matches backend response format)
// =====================
export interface ApiResponse<T> {
  error?: boolean;
  status?: number;
  message?: string;
  data?: T;
}

// =====================
// Frontend-Only Types (for UI components, not sent to backend)
// =====================

// Type guards for runtime validation
export const isValidTestType = (value: any): value is TestType => {
  return ['frontend_basics', 'react_developer', 'fullstack_js', 'mobile_development', 'python_developer', 'custom'].includes(value);
};

export const isValidLanguage = (value: any): value is Language => {
  return ['javascript', 'css', 'html', 'sql', 'dart', 'react', 'reactNative', 'flutter', 'express', 'python', 'typescript', 'json'].includes(value);
};

export const isValidTestStatus = (value: any): value is TestStatus => {
  return ['draft', 'active', 'archived'].includes(value);
};

// UI-only types for components (these don't go to backend)
export type ValidationLevel = "error" | "warning" | "suggestion" | "info";

export interface ValidationItem {
  type: ValidationLevel;
  field: string;
  message: string;
}

export interface LanguageInfo {
  value: Language;
  name: string;
  color: string;
  category: string;
}

export interface TagInfo {
  value: Tags;
  name: string;
  category: string;
  color: string;
}