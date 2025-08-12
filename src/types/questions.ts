export interface TestCase {
  description: string;
  functionCall: string;
  expected: string;
  points: number;
  hidden: boolean;
  shouldFail: boolean;
  brokenResult?: string;
}

export interface Question {
  title: string;
  description: string;
  type: string;
  skill: string;
  category: string;
  difficulty: string;
  tags: string[];
  points: number;
  timeEstimate: number;
  weight: number;
  status: string;
  createdBy: {
    profile: { firstName: string; lastName: string };
    _id: string;
    email: string;
  };
  createdByRole: string;
  content: {
    correctBoolean?: boolean;
    explanation?: string;
    hints?: string[];
    options?: string[];
    shuffleOptions?: boolean;
    evaluationMode?: string;
    mustUse?: string[];
    cannotUse?: string[];
    testCases?: TestCase[];
    timeLimit?: number;
    memoryLimit?: number;
    language?: string;
    codeSnippet?: string;
    brokenCode?: string;
    bugHint?: string;
    starterCode?: string;
    correctAnswer?: number;
    maxLinesChanged?: number;
    similarityThreshold?: number;
    bonusMethod?: string;
    bonusPoints?: number;
  };
  usageStats: {
    timesUsed: number;
    totalAttempts: number;
    correctAttempts: number;
    successRate: number;
    averageTime: number;
    optionStats: any[];
    testCaseStats?: Array<{ testCaseId: string; successRate: number; averageTime: number }>;
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
    reviewedBy?: { _id: string; profile: { firstName: string; lastName: string } };
    reviewedAt?: string;
    reviewNotes?: string;
    approved?: boolean;
  };
  lastModifiedBy?: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}