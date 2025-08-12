// src/types/index.ts

// Note: ObjectId fields (_id, testId, questionId, etc.) are serialized as strings.
// Date fields (createdAt, updatedAt, etc.) are serialized as ISO strings.
// References (createdBy, reviewedBy, etc.) are serialized as string IDs unless populated.

// --- Language Type ---
export type Language = "javascript" | "html" | "css" | "jsx" | "dart" | "typescript" | "json" | "sql";

// --- User ---
export interface User {
  _id: string;
  email: string;
  role: "student" | "admin" | "instructor";
  profile: {
    firstName?: string;
    lastName?: string;
    organization?: string;
  };
  testHistory?: Array<{
    testId: string;
    score: number;
    passed: boolean;
    completedAt: string;
    timeSpent: number;
    attempts: number;
  }>;
  lastLogin?: string;
  ssoProvider?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  ssoId?: string;
}

// --- Question ---
export interface TestCase {
  description?: string;
  functionCall?: string;
  expected?: string;
  points: number;
  hidden: boolean;
  shouldFail: boolean;
  brokenResult?: string;
}

export interface Question {
  _id: string;
  title: string;
  description: string;
  type: "multiple_choice" | "true_false" | "code_challenge" | "debug_fix";
  skill: "javascript" | "react" | "html" | "css" | "python" | "flutter" | "react-native" | "backend";
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  points: number;
  timeEstimate: number;
  weight: number;
  status: "active" | "pending_review" | "rejected" | "retired" | "draft";
  createdBy: string;
  createdByRole: "admin" | "instructor";
  content: {
    correctBoolean?: boolean;
    explanation?: string;
    hints?: string[];
    options?: string[];
    shuffleOptions?: boolean;
    evaluationMode?: "flexible" | "strict" | "minimal_fix";
    mustUse?: string[];
    cannotUse?: string[];
    testCases?: TestCase[];
    timeLimit?: number;
    memoryLimit?: number;
    language?: Language;
    codeSnippet?: string;
    brokenCode?: string;
    bugHint?: string;
    starterCode?: string;
    correctAnswer?: number;
    maxLinesChanged?: number;
    similarityThreshold?: number;
    bonusPoints?: number;
  };
  usageStats: {
    timesUsed: number;
    totalAttempts: number;
    correctAttempts: number;
    successRate: number;
    averageTime: number;
    optionStats: number[];
    testCaseStats?: Array<{
      testCaseId: string;
      successRate: number;
      averageTime: number;
    }>;
  };
  prerequisites: string[];
  followUp: string[];
  variantGroup?: string;
  variants: string[];
  mutuallyExclusive: string[];
  version: number;
  lastModified: string;
  suggestion?: {
    submittedAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    approved?: boolean;
  };
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// --- Test ---
export interface TestSettings {
  timeLimit: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  passingScore: number;
  availableFrom?: string;
  availableUntil?: string;
  instructions?: string;
  useSections: boolean;
  useQuestionPool: boolean;
}

export interface TestSection {
  name: string;
  description?: string;
  timeLimit: number;
  order: number;
  instructions?: string;
  sectionType:
    | "mixed"
    | "multiple_choice"
    | "true_false"
    | "coding"
    | "debugging"
    | "theory"
    | "practical"
    | "custom";
  allowedQuestionTypes: {
    multiple_choice: boolean;
    true_false: boolean;
    code_challenge: boolean;
    debug_fix: boolean;
  };
  sectionSettings: {
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showProgressBar?: boolean;
    allowSkipping?: boolean;
    showRemainingTime?: boolean;
    autoSubmitOnTimeUp?: boolean;
    codeEditor?: {
      enabled: boolean;
      language: string;
      showLineNumbers: boolean;
      allowReset: boolean;
    };
  };
  questions: Array<{
    questionId: string;
    points: number;
    order?: number;
    sectionOverrides?: {
      timeLimit?: number;
      points?: number;
      required?: boolean;
    };
  }>;
  questionPool: {
    enabled: boolean;
    totalQuestions?: number;
    selectionStrategy?:
      | "random"
      | "balanced"
      | "progressive"
      | "weighted"
      | "adaptive";
    availableQuestions?: Array<{
      questionId: string;
      points: number;
      weight: number;
      metadata?: {
        estimatedTime: number;
        difficultyScore: number;
        prerequisites: string[];
        tags: string[];
      };
    }>;
    distribution?: {
      byType?: Record<
        string,
        { count: number; minCount?: number; maxCount?: number }
      >;
      byDifficulty?: Record<string, { count: number; position?: string }>;
      bySkill?: Record<string, number>;
      byEstimatedTime?: {
        quick?: { count: number; maxTime: number };
        medium?: { count: number; minTime: number; maxTime: number };
        long?: { count: number; minTime: number };
      };
    };
    constraints?: {
      ensureVariety: boolean;
      avoidSimilarQuestions: boolean;
      maxTotalTime?: number;
      avgTimePerQuestion?: number;
      maxConsecutiveDifficult?: number;
      respectPrerequisites: boolean;
    };
  };
}

export interface TestQuestionPool {
  enabled: boolean;
  totalQuestions?: number;
  availableQuestions?: Array<{
    questionId: string | Question;
    points: number;
    weight?: number;
  }>;
  distribution?: {
    byType?: Record<string, { count: number; minCount?: number; maxCount?: number }>;
    byDifficulty?: Record<string, { count: number; position?: string }>;
    bySkill?: Record<string, number>;
  };
}

export interface TestStats {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  averageTime: number;
  passRate: number;
  sectionStats?: Array<{
    sectionId: string;
    averageTime: number;
    averageScore: number;
    completionRate: number;
  }>;
  poolStats?: {
    questionsUsed: string[];
    questionFrequency: Array<{
      questionId: string;
      timesUsed: number;
      averageScore: number;
    }>;
  };
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  settings: TestSettings;
  sections?: TestSection[];
  questions?: Array<{
    questionId: string | Question;
    points: number;
    order?: number;
  }>;
  questionPool?: TestQuestionPool;
  autoGenerate?: {
    enabled: boolean;
    rules?: {
      totalQuestions: number;
      skillDistribution: Array<{
        skill: string;
        count: number;
        minCount: number;
        maxCount: number;
      }>;
      difficultyDistribution: {
        beginner: number;
        intermediate: number;
        advanced: number;
      };
      typeDistribution: {
        multiple_choice: number;
        true_false: number;
        code_challenge: number;
        debug_fix: number;
      };
      allowedSkills: string[];
      preferredCombinations: Array<{
        name: string;
        skills: string[];
        weights: number[];
      }>;
    };
  };
  skills: Question['skill'][];
  testType:
    | "single_skill"
    | "frontend"
    | "react_focused"
    | "full_stack"
    | "mobile"
    | "comprehensive"
    | "custom";
  createdBy: string;
  status: "draft" | "published" | "archived";
  category?: string;
  tags?: string[];
  stats?: TestStats;
  createdAt: string;
  updatedAt: string;
  totalPoints?: number;
  totalTime?: number;
}

// --- Test Session ---
export interface TestSessionQuestion {
  questionId: string;
  order?: number;
  points: number;
  answer?: string | number | boolean;
  isCorrect?: boolean;
  pointsAwarded?: number;
  timeSpent?: number;
  hintsUsed?: string[];
  codeSubmissions?: Array<{
    code: string;
    submittedAt: string;
    testResults: Array<{
      testCaseId: string;
      passed: boolean;
      expected: string;
      actual: string;
      error?: string;
    }>;
  }>;
}

export interface TestSessionScore {
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  passed: boolean;
}

export interface TestSessionMetadata {
  userAgent?: string;
  ipAddress?: string;
  screenResolution?: string;
  timezone?: string;
}

export interface TestSession {
  _id: string;
  testId: string;
  userId: string;
  attemptNumber: number;
  status: "in_progress" | "completed" | "expired" | "abandoned";
  startedAt: string;
  completedAt?: string;
  timeSpent?: number;
  questions: TestSessionQuestion[];
  score: TestSessionScore;
  metadata?: TestSessionMetadata;
  createdAt: string;
  updatedAt: string;
}

// --- UI-Specific Types ---
export interface SectionType {
  value: string;
  name: string;
  description: string;
  icon: string;
  suggestedTime: number;
}

export interface SectionWithQuestions extends TestSection {
  _id?: string;
  tempId?: string;
}

export interface CreateTestData {
  title: string;
  description: string;
  instructions?: string;
  skills: Question['skill'][];
  testType: string;
  settings: {
    timeLimit: number;
    attemptsAllowed: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResults: boolean;
    showCorrectAnswers: boolean;
    passingScore: number;
    availableFrom?: string;
    availableUntil?: string;
    useSections?: boolean;
    useQuestionPool?: boolean;
  };
  questions: Array<{
    questionId: string;
    points: number;
  }>;
  sections: SectionWithQuestions[];
  questionPool?: {
    enabled: boolean;
    totalQuestions?: number;
    availableQuestions?: Array<{
      questionId: string;
      points: number;
      weight: number;
    }>;
    distribution?: {
      byType?: Record<string, { count: number; minCount?: number; maxCount?: number }>;
      byDifficulty?: Record<string, { count: number; position?: string }>;
      bySkill?: Record<string, number>;
    };
  };
  autoGenerate?: {
    enabled: boolean;
    rules?: {
      totalQuestions: number;
      skillDistribution: Array<{
        skill: string;
        count: number;
        minCount: number;
        maxCount: number;
      }>;
      difficultyDistribution: {
        beginner: number;
        intermediate: number;
        advanced: number;
      };
      typeDistribution: {
        multiple_choice: number;
        true_false: number;
        code_challenge: number;
        debug_fix: number;
      };
      allowedSkills: string[];
      preferredCombinations: Array<{
        name: string;
        skills: string[];
        weights: number[];
      }>;
    };
  };
  category?: string;
  tags: string[];
}

export interface TestListItem {
  _id: string;
  title: string;
  description?: string;
  testType: string;
  skills: Question['skill'][];
  questions: { questionId: string; points: number }[];
  status: "draft" | "published" | "archived";
  settings?: {
    timeLimit?: number;
    attemptsAllowed?: number;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showResults?: boolean;
    showCorrectAnswers?: boolean;
    passingScore?: number;
    availableFrom?: string;
    availableUntil?: string;
    useSections?: boolean;
    useQuestionPool?: boolean;
  };
  sections?: Array<{
    name: string;
    timeLimit: number;
    questions: Array<{
      questionId: string;
      points: number;
    }>;
    questionPool?: {
      enabled: boolean;
      totalQuestions?: number;
    };
  }>;
  stats?: {
    totalAttempts: number;
    averageScore?: number;
    passRate?: number;
  };
  createdAt: string;
  createdBy?: {
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

export interface TestTemplate {
  _id: string;
  name: string;
  description?: string;
  skills: Question['skill'][];
  useSections: boolean;
  settings?: {
    timeLimit: number;
    attemptsAllowed: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResults: boolean;
    showCorrectAnswers: boolean;
    passingScore: number;
    availableFrom?: string;
    availableUntil?: string;
  };
  category?: string;
  tags?: string[];
}

export interface TestResponse {
  test: Test;
  userAttempts?: TestSession[];
  canTakeTest?: boolean;
  validation?: {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  };
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface QuestionFormComponentProps {
  question: Question;
  onQuestionChange: (updatedQuestion: Question) => void;
  onSubmit?: (question: Question) => void | Promise<void>;
  submitLabel?: string;
  showSubmitButton?: boolean;
  showComplexityIndicator?: boolean;
  availableSkills?: Question['skill'][];
  compact?: boolean;
  validationErrors?: string[];
  onCancel?: () => void;
}

export interface CompletionEstimate {
  totalTime: number;
  estimatedQuestions: number;
  timePerQuestion?: number;
  breakdown?: Array<{
    name: string;
    timeLimit: number;
    estimatedQuestions: number;
  }>;
}

export interface TestSettingsProps {
  test: Test;
  userData?: User;
  onTestUpdate: (test: Test) => void;
}

export interface TestDetailsResponse {
  test: Test;
  userData?: User;
  questionsData?: Question[];
}

export type ActiveTab = "browse" | "create" | "sections" | "overview" | "analytics" | "questions" | "settings";

// --- Helper Functions ---
export const calcTotals = (data: CreateTestData | Test, allQuestions: Question[]) => {
  const fromSection = data.settings.useSections;

  const questionsCount = fromSection
    ? data.sections?.reduce((sum, s) => {
        if (s.questionPool?.enabled) {
          return sum + (s.questionPool.totalQuestions || 0);
        }
        return sum + (s.questions?.length || 0);
      }, 0) || 0
    : data.questions?.length || 0;

  const totalPoints = fromSection
    ? data.sections?.reduce((sum, s) => {
        if (s.questionPool?.enabled) {
          return sum + ((s.questionPool.totalQuestions || 0) * 2);
        }
        const sectionPoints = s.questions.reduce((acc, q) => {
          const found = allQuestions.find((qq) => qq._id === q.questionId);
          return acc + (found?.points ?? q.points ?? 1);
        }, 0);
        return sum + sectionPoints;
      }, 0) || 0
    : data.questions?.reduce((sum, q) => {
        const found = allQuestions.find((qq) => qq._id === q.questionId);
        return sum + (found?.points ?? q.points ?? 1);
      }, 0) || 0;

  const totalTime = fromSection
    ? data.sections?.reduce((sum, s) => sum + (s.timeLimit || 0), 0) || 0
    : data.settings.timeLimit;

  return { questionsCount, totalPoints, totalTime };
};