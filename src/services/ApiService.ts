// =====================================================
// src/services/ApiService.ts - UPDATED for server-driven architecture
// =====================================================

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  User,
  Question,
  Test,
  TestSession,
  Result,
  ResultAnalytics,
  UserAnalytics,
  SectionAnalytics,
  QuestionTestResult,
  // NEW: Server-driven types
  ServerActionResponse,
  SubmitAnswerRequest,
  StartSessionResponse,
  CurrentQuestionResponse,
  CheckExistingSessionResponse,
  RejoinSessionResponse,
  StartSessionConflictResponse
} from '../types/';

interface Params {
  [key: string]: string | number | boolean | undefined;
}

// =====================================================
// REMOVED: ApiResponse wrapper - Server returns data directly
// =====================================================

// =====================================================
// API SERVICE CLASS - UPDATED FOR SERVER-DRIVEN ARCHITECTURE
// =====================================================

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7000',
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.config.url?.includes('/auth/me')) {
          console.log('ApiService: Skipping token refresh for /auth/me');
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          try {
            console.log('ApiService: Attempting token refresh...');
            const refreshResponse = await axios.post(
              `${this.client.defaults.baseURL}/auth/refresh-token`,
              {},
              { withCredentials: true }
            );

            if (refreshResponse.status === 200) {
              console.log('ApiService: Token refresh successful');
              if (refreshResponse.data.csrfToken) {
                document.cookie = `csrfToken=${refreshResponse.data.csrfToken}; path=/; SameSite=Strict; ${import.meta.env.VITE_NODE_ENV === 'production' ? 'Secure' : ''}`;
              }
              await new Promise((resolve) => setTimeout(resolve, 100));
              error.config.headers['X-CSRF-Token'] = refreshResponse.data.csrfToken || this.getCsrfToken();
              return this.client.request(error.config);
            }
          } catch (refreshError) {
            console.error('ApiService: Token refresh failed:', refreshError);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getCsrfToken(): string | null {
    const match = document.cookie.match(/csrfToken=([^;]+)/);
    return match ? match[1] : null;
  }

  private getCsrfHeaders(): { 'X-CSRF-Token'?: string } {
    const csrfToken = this.getCsrfToken();
    return csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
  }

  // =====================================================
  // AUTHENTICATION APIs - SIMPLIFIED (no ApiResponse wrapper)
  // =====================================================

  async register(data: {
    username: string;
    firstName: string;
    lastName: string;
    email?: string;
    password?: string;
    inviteCode?: string;
    role?: string;
  }): Promise<{ success: boolean; user: User; csrfToken: string }> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(data: { loginCredential: string; password: string }): Promise<{ success: boolean; user: User; csrfToken: string }> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post('/auth/logout', {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async refreshToken(): Promise<{ success: boolean; csrfToken: string }> {
    const response = await this.client.post('/auth/refresh-token');
    return response.data;
  }

  async validateInviteCode(data: { inviteCode: string }): Promise<{ success: boolean; organization: { _id: string; name: string } }> {
  const response = await this.client.post('/auth/validate-invite', data);
  return response.data;
}

  getSSOLoginUrl(): string {
    return `${this.client.defaults.baseURL}/auth/login/sso`;
  }

  async checkAuthStatus(): Promise<{ success: boolean; authenticated: boolean; user?: User }> {
    const response = await this.client.get('/auth/status');
    return response.data;
  }

  // =====================================================
  // USER MANAGEMENT - SIMPLIFIED (no ApiResponse wrapper)
  // =====================================================

  async getUser(userId: string): Promise<User> {
    const response = await this.client.get(`/api/users/${userId}`);
    return response.data;
  }

  async getAllUsers(params: Params = {}): Promise<User[]> {
    const response = await this.client.get('/api/users', { params });
    return response.data || [];
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const response = await this.client.patch(`/api/users/${userId}`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/api/users/${userId}`, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // =====================================================
  // QUESTION MANAGEMENT - SIMPLIFIED
  // =====================================================

  async createQuestion(data: Partial<Question>, params: Params = {}): Promise<Question> {
    console.log('ApiService: createQuestion data:', JSON.stringify(data, null, 2));
    const response = await this.client.post('/api/questions', data, {
      params,
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async checkDuplicates(params: {
    title?: string;
    description?: string;
    type: string;
    language: string;
    category?: string;
    entryFunction?: string;
    codeTemplate?: string;
  }): Promise<{
    found: boolean;
    count: number;
    duplicates: Array<{
      _id: string;
      title: string;
      description: string;
      type: string;
      language: string;
      category?: string;
      difficulty: string;
      organizationId?: string;
      isGlobal: boolean;
      createdBy: string;
      createdAt: string;
      similarity: number;
      exactMatch: boolean;
      source: 'Global' | 'Your Organization';
      matchReason: string;
    }>;
    searchParams: {
      type: string;
      language: string;
      category?: string;
    };
  }> {
    const response = await this.client.get('/api/questions/check-duplicates', { params });
    return response.data;
  }

  async testQuestion(data: {
    questionData: {
      type: string;
      language: string;
      category: string;
      testCases?: Array<{
        name?: string;
        args: any[];
        expected: any;
        hidden?: boolean;
      }>;
      codeConfig?: {
        runtime: string;
        entryFunction: string;
        timeoutMs?: number;
      };
    };
    testCode: string;
  }): Promise<QuestionTestResult> {
    const response = await this.client.post('/api/questions/test', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getQuestion(questionId: string): Promise<Question> {
    const response = await this.client.get(`/api/questions/${questionId}`);
    return response.data;
  }

  async getAllQuestions(params: Params = {}, includeTotalCount: boolean = false): Promise<Question[] | {
    questions: Question[];
    totalCount: number;
    totalPages: number;
  }> {
    const queryParams = {
      ...params,
      ...(includeTotalCount && { includeTotalCount: 'true' })
    };
    const response = await this.client.get('/api/questions', { params: queryParams });
    return response.data || [];
  }

  async getPaginatedQuestions(params: Params = {}): Promise<{
    questions: Question[];
    totalCount: number;
    totalPages: number;
  }> {
    return await this.getAllQuestions(params, true) as {
      questions: Question[];
      totalCount: number;
      totalPages: number;
    };
  }

  async updateQuestion(questionId: string, data: Partial<Question>): Promise<Question> {
    const response = await this.client.patch(`/api/questions/${questionId}`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async deleteQuestion(questionId: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/api/questions/${questionId}`, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getQuestionStats(): Promise<{
    byLanguage: Array<{
      language: string;
      count: number;
      difficultyBreakdown: {
        easy: number;
        medium: number;
        hard: number;
      };
      typeBreakdown: {
        multipleChoice: number;
        trueFalse: number;
        codeChallenge: number;
        fillInTheBlank: number;
        codeDebugging: number;
      };
      categoryBreakdown: {
        logic: number;
        ui: number;
        syntax: number;
      };
    }>;
    totals: {
      totalQuestions: number;
      difficultyBreakdown: {
        easy: number;
        medium: number;
        hard: number;
      };
      typeBreakdown: {
        multipleChoice: number;
        trueFalse: number;
        codeChallenge: number;
        fillInTheBlank: number;
        codeDebugging: number;
      };
      categoryBreakdown: {
        logic: number;
        ui: number;
        syntax: number;
      };
    };
  }> {
    const response = await this.client.get('/api/questions/stats');
    return response.data;
  }

  // =====================================================
  // TEST MANAGEMENT - SIMPLIFIED  
  // =====================================================

  async createTest(data: Partial<Test>, params: Params = {}): Promise<Test> {
    const response = await this.client.post('/api/tests', data, {
      params,
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getTest(testId: string): Promise<Test> {
    const response = await this.client.get(`/api/tests/${testId}`);
    return response.data;
  }

  async getAllTests(params: Params = {}): Promise<Test[]> {
    const response = await this.client.get('/api/tests', { params });
    return response.data || [];
  }

  async updateTest(testId: string, data: Partial<Test>): Promise<Test> {
    const response = await this.client.patch(`/api/tests/${testId}`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async deleteTest(testId: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/api/tests/${testId}`, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getTestWithQuestions(testId: string): Promise<Test> {
    const response = await this.client.get(`/api/tests/${testId}/with-questions`);
    return response.data;
  }

  // =====================================================
  // TEST SESSION MANAGEMENT - SERVER-DRIVEN ARCHITECTURE
  // =====================================================

  // Check if user has an existing active session
  async checkExistingSession(): Promise<CheckExistingSessionResponse> {
    const response = await this.client.get('/api/test-sessions/check-existing');
    return response.data;
  }

  // Rejoin an existing session
  async rejoinTestSession(sessionId: string): Promise<RejoinSessionResponse> {
    const response = await this.client.post(`/api/test-sessions/${sessionId}/rejoin`, {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // Start session with conflict handling
  async startTestSession(data: { testId: string; forceNew?: boolean }): Promise<StartSessionResponse> {
    try {
      const response = await this.client.post('/api/test-sessions', data, {
        headers: this.getCsrfHeaders(),
      });
      return response.data;
    } catch (error: any) {
      // Handle 409 conflict specifically
      if (error.response?.status === 409) {
        const conflictData = error.response.data as StartSessionConflictResponse;
        throw {
          type: 'EXISTING_SESSION_CONFLICT',
          data: conflictData
        };
      }
      throw error;
    }
  }

  // Get current question (for manual refresh)
  async getCurrentQuestion(sessionId: string): Promise<CurrentQuestionResponse> {
    const response = await this.client.get(`/api/test-sessions/${sessionId}/current-question`);
    return response.data;
  }

  // =====================================================
  // NEW: SERVER-DRIVEN SUBMISSION (replaces all navigation methods)
  // =====================================================

  // Submit answer - SERVER DETERMINES NEXT ACTION
  async submitAnswer(sessionId: string, data: SubmitAnswerRequest): Promise<ServerActionResponse> {
    const response = await this.client.post(`/api/test-sessions/${sessionId}/submit-answer`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // =====================================================
  // REMOVED: Legacy navigation methods
  // =====================================================
  // - navigateToQuestion() -> Server controls navigation
  // - completeSection() -> Server handles section transitions  
  // - saveQuestionAnswer() -> Merged into submitAnswer()

  // =====================================================
  // REMAINING SESSION METHODS - SIMPLIFIED
  // =====================================================

  async getSessionOverview(sessionId: string): Promise<any> {
    const response = await this.client.get(`/api/test-sessions/${sessionId}/overview`);
    return response.data;
  }

  async submitTestSession(sessionId: string, data: {
    forceSubmit?: boolean;
  } = {}): Promise<any> {
    const response = await this.client.post(`/api/test-sessions/${sessionId}/submit`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getTestSession(sessionId: string): Promise<TestSession> {
    const response = await this.client.get(`/api/test-sessions/${sessionId}`);
    return response.data;
  }

  async getAllTestSessions(params: Params = {}): Promise<TestSession[]> {
    const response = await this.client.get('/api/test-sessions', { params });
    return response.data || [];
  }

  async abandonTestSession(sessionId: string): Promise<{ success: boolean; message: string; sessionId: string }> {
    const response = await this.client.post(`/api/test-sessions/${sessionId}/abandon`, {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getTimeSync(sessionId: string): Promise<any> {
    const response = await this.client.get(`/api/test-sessions/${sessionId}/time-sync`);
    return response.data;
  }

  // Analytics endpoints (for instructors/admins)
  async getSessionAnalytics(sessionId: string): Promise<any> {
    const response = await this.client.get(`/api/test-sessions/${sessionId}/analytics`);
    return response.data;
  }

  async getClassAnalytics(params: Params = {}): Promise<any> {
    const response = await this.client.get('/api/test-sessions/analytics/class', { params });
    return response.data;
  }

  // =====================================================
  // RESULTS - SIMPLIFIED
  // =====================================================

  async getResult(resultId: string): Promise<Result> {
    const response = await this.client.get(`/api/results/${resultId}`);
    return response.data;
  }

  async getAllResults(params: Params = {}): Promise<Result[]> {
    const response = await this.client.get('/api/results', { params });
    return response.data || [];
  }

  async getResultAnalytics(params: Params = {}): Promise<ResultAnalytics[]> {
    const response = await this.client.get('/api/results/analytics/results', { params });
    return response.data || [];
  }

  async getUserAnalytics(params: Params = {}): Promise<UserAnalytics[]> {
    const response = await this.client.get('/api/results/analytics/users', { params });
    return response.data || [];
  }

  async getSectionAnalytics(params: Params = {}): Promise<SectionAnalytics[]> {
    const response = await this.client.get('/api/results/analytics/sections', { params });
    return response.data || [];
  }

  async getQuestionAnalytics(params: Params = {}): Promise<Array<{
    questionId: string;
    questionTitle: string;
    questionType: string;
    language: string;
    category?: string;
    difficulty: string;
    totalAttempts: number;
    correctAttempts: number;
    successRate: number;
    averageTime: number;
    averagePoints: number;
  }>> {
    const response = await this.client.get('/api/results/analytics/questions', { params });
    return response.data || [];
  }

  // =====================================================
  // TAGS API METHODS - SIMPLIFIED
  // =====================================================

  async getTags(languages?: string[]): Promise<{
    tagsByLanguage: Record<string, string[]>;
    tagMetadata: Record<string, { label: string; description: string; color?: string }>;
    allTags: string[];
  } | {
    applicableTags: string[];
    tagMetadata: Record<string, { label: string; description: string; color?: string }>;
  }> {
    const params = languages ? { languages: languages.join(',') } : {};
    const response = await this.client.get('/api/tags', { params });
    return response.data.data;
  }

  async getTagsForLanguage(language: string): Promise<{
    language: string;
    tags: string[];
    metadata: Record<string, { label: string; description: string; color?: string }>;
  }> {
    const response = await this.client.get(`/api/tags/languages/${language}`);
    return {
      language: response.data.language,
      tags: response.data.tags,
      metadata: response.data.metadata
    };
  }

  async validateTags(tags: string[]): Promise<{
    allValid: boolean;
    validTags: string[];
    invalidTags: string[];
    validCount: number;
    invalidCount: number;
    totalCount: number;
  }> {
    const response = await this.client.post('/api/tags/validate', { tags }, {
      headers: this.getCsrfHeaders(),
    });
    return response.data.validation;
  }

  async getTagMetadata(tags?: string[]): Promise<Record<string, {
    label: string;
    description: string;
    color?: string
  }>> {
    const params = tags ? { tags: tags.join(',') } : {};
    const response = await this.client.get('/api/tags/metadata', { params });
    return response.data.metadata;
  }
}

export default new ApiService();