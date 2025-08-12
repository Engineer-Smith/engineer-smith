export interface User {
  id: string;
  email: string;
  role: "student" | "admin" | "instructor";
  profile: {
    firstName: string;
    lastName: string;
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
}
