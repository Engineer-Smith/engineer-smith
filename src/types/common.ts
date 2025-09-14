// src/types/common.ts - Fixed critical backend alignment issues
// This file contains types that are used across multiple domains

// =====================
// ENUMS AND LITERALS - MATCH BACKEND EXACTLY
// =====================

export type Role = "admin" | "instructor" | "student";

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

export type TestType = 
  | "frontend_basics" 
  | "react_developer" 
  | "fullstack_js" 
  | "mobile_development" 
  | "python_developer" 
  | "custom";

export type QuestionStatus = 'not_viewed' | 'viewed' | 'answered' | 'skipped';

export type QuestionType = 
  | "multipleChoice" 
  | "trueFalse" 
  | "codeChallenge" 
  | "fillInTheBlank" 
  | "codeDebugging";

export type QuestionCategory = "logic" | "ui" | "syntax";

// Comprehensive tags enum exactly as defined in backend
export type Tags = 
  | 'html' | 'css' | 'javascript' | 'dom' | 'events' 
  | 'async-programming' | 'promises' | 'async-await'
  | 'es6' | 'closures' | 'scope' | 'hoisting' 
  | 'flexbox' | 'grid' | 'responsive-design'
  | 'react' | 'react-native' | 'components' | 'hooks' 
  | 'state-management' | 'props' | 'context-api'
  | 'redux' | 'react-router' | 'jsx' | 'virtual-dom' 
  | 'native-components' | 'navigation'
  | 'flutter' | 'widgets' | 'state-management-flutter' 
  | 'dart' | 'navigation-flutter' | 'ui-components'
  | 'express' | 'nodejs' | 'rest-api' | 'middleware' 
  | 'routing' | 'authentication' | 'authorization'
  | 'jwt' | 'express-middleware' 
  | 'sql' | 'queries' | 'joins' | 'indexes' 
  | 'transactions' | 'database-design' | 'normalization' 
  | 'python' | 'functions' | 'classes' | 'modules'
  | 'list-comprehensions' | 'decorators' | 'generators' 
  | 'python-data-structures' 
  | 'variables' | 'arrays' | 'objects' | 'loops' 
  | 'conditionals' | 'algorithms' | 'data-structures'
  | 'error-handling' | 'testing' | 'typescript' 
  | 'mobile-development';

// =====================
// CORE DOMAIN ENTITIES - MATCH BACKEND MODELS
// =====================

export interface Organization {
  _id: string;
  name: string;
  isSuperOrg: boolean;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  loginId: string;
  email?: string;
  firstName: string; // NEW: Required field from User model
  lastName: string; // NEW: Required field from User model
  organizationId: string;
  organization?: Organization;
  role: Role;
  isSSO: boolean;
  ssoId?: string;
  ssoToken?: string;
  createdAt: string;
  updatedAt: string;
  
  // Virtual fields from User model
  fullName?: string; // Computed: firstName + lastName
  displayName?: string; // Computed: lastName, firstName
}

// =====================
// CRITICAL FIX: BACKEND VALIDATION RULES
// =====================

// BACKEND VALIDATION RULES from questionValidation.js:
// - UI questions MUST use fillInTheBlank type (NOT codeChallenge/codeDebugging)  
// - Logic questions should use codeChallenge/codeDebugging (NOT fillInTheBlank)
// - Syntax questions can use fillInTheBlank

// Valid language-category combinations (matches backend VALID_COMBINATIONS exactly)
export const VALID_COMBINATIONS: Record<Language, QuestionCategory[]> = {
  'html': ['ui', 'syntax'],
  'css': ['ui', 'syntax'],  
  'react': ['ui', 'syntax'],        // ❌ REMOVED 'logic' - backend doesn't support it
  'flutter': ['ui', 'syntax'],      // ❌ REMOVED 'logic' - backend doesn't support it
  'reactNative': ['ui', 'syntax'],  // ❌ REMOVED 'logic' - backend doesn't support it
  'javascript': ['logic', 'syntax'],
  'typescript': ['logic', 'syntax'], 
  'python': ['logic', 'syntax'],
  'sql': ['logic', 'syntax'],
  'dart': ['logic', 'syntax'],
  'express': ['logic', 'syntax'],
  'json': ['syntax']
};

// BACKEND BUSINESS RULES for question types and categories
export const QUESTION_TYPE_CATEGORY_RULES = {
  // UI questions MUST use fillInTheBlank (backend validation)
  ui: {
    allowedTypes: ['fillInTheBlank'] as QuestionType[],
    restrictedTypes: ['codeChallenge', 'codeDebugging'] as QuestionType[]
  },
  // Logic questions should use codeChallenge/codeDebugging
  logic: {
    allowedTypes: ['codeChallenge', 'codeDebugging'] as QuestionType[],
    restrictedTypes: ['fillInTheBlank'] as QuestionType[] // Backend warns against this
  },
  // Syntax questions can use fillInTheBlank
  syntax: {
    allowedTypes: ['fillInTheBlank'] as QuestionType[],
    restrictedTypes: [] as QuestionType[]
  }
};

// =====================
// TYPE GUARDS - MATCH BACKEND VALIDATION
// =====================

export const isValidRole = (value: any): value is Role => {
  return ['admin', 'instructor', 'student'].includes(value);
};

export const isValidLanguage = (value: any): value is Language => {
  return [
    'javascript', 'css', 'html', 'sql', 'dart', 'react', 
    'reactNative', 'flutter', 'express', 'python', 'typescript', 'json'
  ].includes(value);
};

export const isValidQuestionType = (value: any): value is QuestionType => {
  return ['multipleChoice', 'trueFalse', 'codeChallenge', 'fillInTheBlank', 'codeDebugging'].includes(value);
};

export const isValidQuestionCategory = (value: any): value is QuestionCategory => {
  return ['logic', 'ui', 'syntax'].includes(value);
};

export const isValidDifficulty = (value: any): value is Difficulty => {
  return ['easy', 'medium', 'hard'].includes(value);
};

export const isValidTestStatus = (value: any): value is TestStatus => {
  return ['draft', 'active', 'archived'].includes(value);
};

export const isValidSessionStatus = (value: any): value is SessionStatus => {
  return ['inProgress', 'completed', 'expired', 'abandoned'].includes(value);
};

export const isValidTestType = (value: any): value is TestType => {
  return ['frontend_basics', 'react_developer', 'fullstack_js', 'mobile_development', 'python_developer', 'custom'].includes(value);
};

export const isValidQuestionStatus = (value: any): value is QuestionStatus => {
  return ['not_viewed', 'viewed', 'answered', 'skipped', 'flagged', 'submitted'].includes(value);
};

// =====================
// VALIDATION UTILITIES - MATCH BACKEND LOGIC
// =====================

export const getValidCategories = (language: Language): QuestionCategory[] => {
  return VALID_COMBINATIONS[language] || [];
};

export const isValidLanguageCategoryCombo = (language: Language, category: QuestionCategory): boolean => {
  return getValidCategories(language).includes(category);
};

// CRITICAL: Backend business rule validation
export const isValidQuestionTypeForCategory = (type: QuestionType, category: QuestionCategory): boolean => {
  // Backend logic from questionValidation.js:
  
  // UI questions must use fillInTheBlank (for code questions)
  if (category === 'ui' && type !== 'fillInTheBlank') {
    // Backend checks: if it's a code question type, it must be fillInTheBlank
    if (['codeChallenge', 'codeDebugging'].includes(type)) {
      return false; // Backend throws error
    }
  }
  
  // Logic questions cannot use fillInTheBlank  
  if (category === 'logic' && type === 'fillInTheBlank') {
    return false; // Backend throws error
  }
  
  // codeDebugging can ONLY be logic category
  if (type === 'codeDebugging' && category !== 'logic') {
    return false; // Backend throws error
  }
  
  // codeChallenge can ONLY be logic category (based on validation pattern)
  if (type === 'codeChallenge' && category !== 'logic') {
    return false; // Backend throws error
  }
  
  return true;
};

// Get allowed question types for a category
export const getAllowedQuestionTypes = (category: QuestionCategory): QuestionType[] => {
  const rules = QUESTION_TYPE_CATEGORY_RULES[category];
  if (!rules || rules.allowedTypes.length === 0) {
    // Return all types except restricted ones
    const allTypes: QuestionType[] = ['multipleChoice', 'trueFalse', 'codeChallenge', 'fillInTheBlank', 'codeDebugging'];
    return allTypes.filter(type => !rules?.restrictedTypes.includes(type));
  }
  return rules.allowedTypes;
};

export const getAllValidTags = (): Tags[] => {
  return [
    'html', 'css', 'javascript', 'dom', 'events', 'async-programming', 'promises', 'async-await',
    'es6', 'closures', 'scope', 'hoisting', 'flexbox', 'grid', 'responsive-design',
    'react', 'react-native', 'components', 'hooks', 'state-management', 'props', 'context-api',
    'redux', 'react-router', 'jsx', 'virtual-dom', 'native-components', 'navigation',
    'flutter', 'widgets', 'state-management-flutter', 'dart', 'navigation-flutter', 'ui-components',
    'express', 'nodejs', 'rest-api', 'middleware', 'routing', 'authentication', 'authorization',
    'jwt', 'express-middleware', 'sql', 'queries', 'joins', 'indexes', 'transactions',
    'database-design', 'normalization', 'python', 'functions', 'classes', 'modules',
    'list-comprehensions', 'decorators', 'generators', 'python-data-structures',
    'variables', 'arrays', 'objects', 'loops', 'conditionals', 'algorithms', 'data-structures',
    'error-handling', 'testing', 'typescript', 'mobile-development'
  ];
};

export const getTagsByCategory = () => {
  return {
    fundamentals: ['variables', 'arrays', 'objects', 'loops', 'conditionals', 'functions'],
    frontend: ['html', 'css', 'javascript', 'dom', 'events', 'responsive-design', 'flexbox', 'grid'],
    react: ['react', 'components', 'hooks', 'state-management', 'props', 'context-api', 'redux', 'jsx'],
    backend: ['express', 'nodejs', 'rest-api', 'middleware', 'routing', 'authentication', 'authorization'],
    database: ['sql', 'queries', 'joins', 'indexes', 'transactions', 'database-design', 'normalization'],
    mobile: ['react-native', 'flutter', 'dart', 'mobile-development', 'native-components'],
    advanced: ['async-programming', 'promises', 'async-await', 'closures', 'scope', 'hoisting', 'algorithms']
  };
};

// =====================
// TIME AND DATE UTILITIES
// =====================

export interface TimeSpan {
  seconds: number;
  minutes: number;
  hours: number;
  days?: number;
}

export const formatTimeSpan = (seconds: number): TimeSpan => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return {
    seconds: remainingSeconds,
    minutes,
    hours,
    ...(hours >= 24 && { days: Math.floor(hours / 24) })
  };
};

export const formatDuration = (seconds: number): string => {
  const { hours, minutes, seconds: secs } = formatTimeSpan(seconds);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const formatTimeRemaining = (seconds: number): string => {
  const { hours, minutes, seconds: secs } = formatTimeSpan(seconds);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

// =====================
// COMMON INTERFACES
// =====================

export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface UserAudited {
  createdBy: string;
  updatedBy?: string;
}

export interface OrganizationScoped {
  organizationId?: string;
  isGlobal?: boolean;
}

// =====================
// ERROR TYPES
// =====================

export interface BaseError {
  message: string;
  code?: string;
  field?: string;
}

export interface ValidationError extends BaseError {
  type: 'validation';
  field: string;
  value?: any;
}

export interface AuthenticationError extends BaseError {
  type: 'authentication';
  code: 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED' | 'ACCESS_DENIED';
}

export interface BusinessLogicError extends BaseError {
  type: 'business_logic';
  code: string;
  context?: Record<string, any>;
}

export type AppError = ValidationError | AuthenticationError | BusinessLogicError;

// =====================
// PAGINATION
// =====================

export interface PaginationParams {
  limit?: number;
  skip?: number;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

// =====================
// UI HELPERS
// =====================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UIPreferences {
  theme: ThemeMode;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorBlindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  lastUpdated?: string;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

export interface ConsoleLog {
  type: 'log' | 'warn' | 'info' | 'error';
  message: string;
  timestamp: number;
}

// =====================
// CONSTANTS
// =====================

export const DEFAULT_PAGINATION = {
  limit: 10,
  skip: 0,
  page: 1
} as const;

export const MAX_PAGINATION_LIMIT = 100;

export const ROLE_HIERARCHY: Record<Role, number> = {
  student: 1,
  instructor: 2,
  admin: 3
} as const;

export const hasHigherRole = (userRole: Role, requiredRole: Role): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};