// src/services/testAPI.ts
import axios from "../utils/axiosInstance";
import type {
  SectionType,
  TestSection,
  TestTemplate,
  CreateTestData,
  TestListItem,
  TestSession,
} from "../types/tests";

export const testAPI = {
  // Get all tests with optional query parameters
  getAllTests: async (
    queryParams = ""
  ): Promise<{ tests: TestListItem[]; pagination: any }> => {
    const url = `/tests${queryParams ? `?${queryParams}` : ""}`;
    const response = await axios.get(url);
    return response.data;
  },

  getTestById: async (testId: string): Promise<{ test: TestListItem }> => {
    const response = await axios.get(`/tests/${testId}`);
    return response.data;
  },

  createTest: async (
    testData: CreateTestData
  ): Promise<{
    success: boolean;
    message: string;
    test: TestListItem;
    validation?: any;
  }> => {
    const response = await axios.post("/tests", testData);
    return response.data;
  },

  updateTest: async (
    testId: string,
    testData: Partial<
      CreateTestData & { status: "draft" | "published" | "archived" }
    >
  ): Promise<{
    success: boolean;
    message: string;
    test: TestListItem;
    validation?: any;
  }> => {
    const response = await axios.put(`/tests/${testId}`, testData);
    return response.data;
  },

  deleteTest: async (
    testId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/tests/${testId}`);
    return response.data;
  },

  publishTest: async (
    testId: string
  ): Promise<{
    success: boolean;
    message: string;
    test: { id: string; title: string; status: string };
  }> => {
    const response = await axios.post(`/tests/${testId}/publish`);
    return response.data;
  },

  getTestTemplates: async (): Promise<{
    templates: TestTemplate[];
    customOption: any;
    sectionTypes: SectionType[];
  }> => {
    const response = await axios.get("/tests/templates");
    return response.data;
  },

  generateTestQuestions: async (criteria: {
    skills: string[];
    totalQuestions: number;
    distribution?: Record<string, number>;
    difficulty?: Record<string, number>;
    questionTypes?: Record<string, number>;
    sectionId?: string;
    sectionType?: string;
    selectionStrategy?: string;
  }): Promise<{
    success: boolean;
    questions: Array<{
      questionId: string;
      points: number;
      skill: string;
      difficulty: string;
      type: string;
      title: string;
      timeEstimate: number;
    }>;
    summary: any;
    errors?: string[];
  }> => {
    const response = await axios.post("/tests/generate-questions", criteria);
    return response.data;
  },

  getTestAnalytics: async (
    testId: string
  ): Promise<{ analytics: any }> => {
    const response = await axios.get(`/tests/${testId}/analytics`);
    return response.data;
  },

  getSectionAnalytics: async (
    testId: string
  ): Promise<{
    testId: string;
    testTitle: string;
    totalSessions: number;
    sectionAnalytics: Array<{
      sectionIndex: number;
      name: string;
      sectionType: string;
      timeLimit: number;
      questionCount: number;
      performance: {
        totalAttempts: number;
        successRate: number;
        averageTime: number;
        averageScore: number;
      };
      completionRate: number;
    }>;
  }> => {
    const response = await axios.get(`/tests/${testId}/analytics/sections`);
    return response.data;
  },

  getTestPreview: async (
    testId: string
  ): Promise<{
    preview: {
      testInfo: {
        title: string;
        useSections: boolean;
        totalTime: number;
        totalQuestions: number;
      };
      structure: Array<{
        name: string;
        sectionType: string;
        timeLimit: number;
        questionCount: number;
        questions: Array<{
          title: string;
          type: string;
          skill: string;
          difficulty: string;
          timeEstimate: number;
          points: number;
        }>;
      }>;
      validation: {
        valid: boolean;
        errors?: string[];
        warnings?: string[];
      };
    };
  }> => {
    const response = await axios.get(`/tests/${testId}/preview`);
    return response.data;
  },

  addSection: async (
    testId: string,
    sectionData: Partial<TestSection>
  ): Promise<{
    success: boolean;
    message: string;
    section: TestSection;
    validation: any;
  }> => {
    const response = await axios.post(`/tests/${testId}/sections`, sectionData);
    return response.data;
  },

  updateSection: async (
    testId: string,
    sectionIndex: number,
    sectionData: Partial<TestSection>
  ): Promise<{
    success: boolean;
    message: string;
    section: TestSection;
    validation: any;
  }> => {
    const response = await axios.put(
      `/tests/${testId}/sections/${sectionIndex}`,
      sectionData
    );
    return response.data;
  },

  removeSection: async (
    testId: string,
    sectionIndex: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(
      `/tests/${testId}/sections/${sectionIndex}`
    );
    return response.data;
  },

  validateSections: async (
    sections: TestSection[]
  ): Promise<{
    success: boolean;
    validation: {
      valid: boolean;
      errors?: string[];
      warnings?: string[];
    };
  }> => {
    const response = await axios.post("/tests/validate-sections", { sections });
    return response.data;
  },

  getSectionTypes: async (): Promise<{ sectionTypes: SectionType[] }> => {
    const response = await axios.get("/tests/section-types");
    return response.data;
  },

  getTestSessions: async (
    testId: string,
    queryParams = ""
  ): Promise<{ sessions: TestSession[]; pagination: any }> => {
    const url = `/tests/${testId}/sessions${
      queryParams ? `?${queryParams}` : ""
    }`;
    const response = await axios.get(url);
    return response.data;
  },

  duplicateTest: async (
    testId: string
  ): Promise<{
    success: boolean;
    message: string;
    test: {
      id: string;
      title: string;
      status: string;
      useSections: boolean;
      sectionCount: number;
    };
  }> => {
    const response = await axios.post(`/tests/${testId}/duplicate`);
    return response.data;
  },

  bulkOperation: async (
    action: string,
    testIds: string[]
  ): Promise<{ success: boolean; message: string; results: any }> => {
    const response = await axios.post("/tests/bulk", { action, testIds });
    return response.data;
  },

  completeSection: async (
    sessionId: string,
    sectionIndex: number
  ): Promise<{
    success: boolean;
    message: string;
    sectionIndex: number;
    isLastSection: boolean;
    totalSections: number;
    completedSections: number;
  }> => {
    const response = await axios.post(
      `/tests/sessions/${sessionId}/complete-section/${sectionIndex}`
    );
    return response.data;
  },

  getStudentHistory: async (): Promise<{
    history: Array<{
      sessionId: string;
      testId: string;
      testTitle: string;
      skills: string[];
      testType: string;
      useSections: boolean;
      sectionCount: number;
      attemptNumber: number;
      score: any;
      completedAt: string;
      timeSpent: number;
    }>;
  }> => {
    const response = await axios.get("/tests/student/history");
    return response.data;
  },

  getAvailableTests: async (): Promise<{
    tests: Array<
      TestListItem & {
        totalTime: number;
        totalQuestions: number;
        sectionCount: number;
        userStatus: {
          attempts: number;
          completedAttempts: number;
          canTake: boolean;
          bestScore: number | null;
          lastAttempt: string | null;
        };
      }
    >;
  }> => {
    const response = await axios.get("/tests/student/available");
    return response.data;
  },

  getInstructorSummary: async (): Promise<{
    summary: {
      totalTests: number;
      publishedTests: number;
      draftTests: number;
      sectionBasedTests: number;
      totalAttempts: number;
      averagePassRate: number;
      recentSessions: Array<{
        sessionId: string;
        testTitle: string;
        useSections: boolean;
        studentName: string;
        score: any;
        completedAt: string;
      }>;
    };
  }> => {
    const response = await axios.get("/tests/instructor/summary");
    return response.data;
  },
};

export const questionAPI = {
  getAllQuestions: async (
    queryParams = ""
  ): Promise<{ questions: any[]; pagination: any }> => {
    const url = `/questions${queryParams ? `?${queryParams}` : ""}`;
    const response = await axios.get(url);
    return response.data;
  },

  getQuestionById: async (
    questionId: string
  ): Promise<{ question: any }> => {
    const response = await axios.get(`/questions/${questionId}`);
    return response.data;
  },

  createQuestion: async (
    questionData: any
  ): Promise<{ success: boolean; message: string; question: any }> => {
    const response = await axios.post("/questions", questionData);
    return response.data;
  },
};
