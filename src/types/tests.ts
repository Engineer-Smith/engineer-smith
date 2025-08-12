// src/types/tests.ts


export interface TestSessionQuestion {
  questionId: string;
  order?: number;
  points: number;
  answer?: any; // boolean, number, string, etc.
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

export interface SectionType {
  value: string;
  name: string;
  description: string;
  icon: string;
  suggestedTime: number;
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
      byType?: Record<string, { count: number; minCount?: number; maxCount?: number }>;
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

export interface SectionWithQuestions extends TestSection {
  _id?: string;
  tempId?: string;
}

export interface CreateTestData {
  title: string;
  description: string;
  instructions?: string;
  skills: string[];
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
    distribution?: any;
  };

  autoGenerate?: {
    enabled: boolean;
    rules?: any;
  };
  category?: string;
  tags: string[];
}

/**
 * Represents the minimal test object returned in test listings.
 * Matches the fields used in TestManagementPage.
 */
export interface TestListItem {
  _id: string;
  title: string;
  description?: string;
  testType: string;
  skills: string[];
  questions: { questionId: string; points: number }[];
  status: "draft" | "published" | "archived";
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

// --------------------
// Template type for selecting test templates
// --------------------
export interface TestTemplate {
  _id: string;
  name: string;
  description?: string;
  skills: string[];
  useSections: boolean; // ✅ add this
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

export interface TestSession {
  _id: string;
  testId: string; // or TestListItem if populated
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