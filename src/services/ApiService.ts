// =====================================================
// src/services/ApiService.ts - UPDATED for server-driven architecture
// =====================================================

import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type {
  CheckExistingSessionResponse,
  CurrentQuestionResponse,
  Question,
  QuestionTestResult,
  RejoinSessionResponse,
  Result,
  ResultAnalytics,
  SectionAnalytics,
  // NEW: Server-driven types
  ServerActionResponse,
  StartSessionConflictResponse,
  StartSessionResponse,
  SubmitAnswerRequest,
  Test,
  TestSession,
  User,
  UserAnalytics,
  UserDetailsDashboard,
  UserManagementDashboard
} from '../types/';



import type { PopulatedSession } from '../pages/LiveSessionMonitor';
import type { PopulatedResult } from '../types/result';

import type { StudentDashboard } from '../types/student';

interface Params {
  [key: string]: string | number | boolean | undefined;
}

interface QuestionsResponse {
  questions: Question[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    totalCount?: number;
  };
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
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          try {
            const refreshResponse = await axios.post(
              `${this.client.defaults.baseURL}/auth/refresh-token`,
              {},
              { withCredentials: true }
            );

            if (refreshResponse.status === 200) {
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

  async getAllQuestions(
    params: Params = {},
    includeTotalCount: boolean = false
  ): Promise<QuestionsResponse> {
    const queryParams = {
      ...params,
      ...(includeTotalCount && { includeTotalCount: 'true' })
    };

    const response = await this.client.get('/api/questions', { params: queryParams });
    const data = response.data || {};

    // Always return consistent format
    if (includeTotalCount) {
      // Backend returns the structured format
      return {
        questions: data.questions || [],
        pagination: {
          skip: data.pagination?.skip || 0,
          limit: data.pagination?.limit || 10,
          total: data.pagination?.total || 0,
          totalCount: data.pagination?.totalCount || 0
        }
      };
    } else {
      // Backend returns array - wrap it in consistent format
      const questions = Array.isArray(data) ? data : (data.questions || []);
      return {
        questions,
        pagination: {
          skip: parseInt(params.skip as string) || 0,
          limit: parseInt(params.limit as string) || 10,
          total: questions.length,
          totalCount: questions.length
        }
      };
    }
  }

  async getPaginatedQuestions(params: Params = {}): Promise<{
    questions: Question[];
    totalCount: number;
    totalPages: number;
  }> {
    const response = await this.getAllQuestions(params, true);
    return {
      questions: response.questions,
      totalCount: response.pagination.totalCount || 0,
      totalPages: Math.ceil((response.pagination.totalCount || 0) / (response.pagination.limit || 10))
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

  async getPopulatedTestSessions(params: any): Promise<PopulatedSession[]> {
    // This should call an endpoint that returns populated data
    const response = await this.client.get('/api/test-sessions', { params });
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

  async getAllResults(params: Params = {}): Promise<PopulatedResult[]> {
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
    success: boolean;
    error?: boolean;
    message?: string;
    data: {
      tagsByLanguage: Record<string, string[]>;
      tagMetadata: Record<string, { label: string; description: string; color?: string }>;
      allTags: string[];
    } | {
      applicableTags: string[];
      tagMetadata: Record<string, { label: string; description: string; color?: string }>;
    };
  }> {
    const params = languages ? { languages: languages.join(',') } : {};
    const response = await this.client.get('/api/tags', { params });
    return response.data; // Return the full response
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


  // =====================================================
  // ADMIN DASHBOARD APIS - NEW SECTION
  // =====================================================

  async getUserDashboard(params: Params = {}): Promise<UserManagementDashboard> {
    const response = await this.client.get('/api/admin/users/dashboard', { params });
    return response.data;
  }

  async getUserDetailsDashboard(userId: string): Promise<UserDetailsDashboard> {
    const response = await this.client.get(`/api/admin/users/${userId}/dashboard`);
    return response.data;
  }

  // Additional admin user management methods
  async updateUserRole(userId: string, role: string): Promise<User> {
    const response = await this.client.patch(`/api/admin/users/${userId}/role`, { role }, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async transferUserOrganization(userId: string, organizationId: string): Promise<User> {
    const response = await this.client.patch(`/api/admin/users/${userId}/organization`, { organizationId }, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async resetUserPassword(userId: string): Promise<{ tempPassword: string }> {
    const response = await this.client.post(`/api/admin/users/${userId}/reset-password`, {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async bulkUpdateUsers(action: {
    type: 'delete' | 'changeRole' | 'transferOrganization' | 'export';
    userIds: string[];
    payload?: Record<string, any>;
  }): Promise<{ success: number; failed: number }> {
    const response = await this.client.post('/api/admin/users/bulk', action, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async exportUsers(options: {
    format: 'csv' | 'xlsx' | 'pdf';
    includePerformanceData: boolean;
    includeActivityLog: boolean;
    dateRange?: { start: string; end: string };
    userIds?: string[];
  }): Promise<{ downloadUrl: string }> {
    const response = await this.client.post('/api/admin/users/export', options, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
 * Submit an attempt request via HTTP
 */
  async submitAttemptRequest(data: {
    testId: string;
    requestedAttempts: number;
    reason: string;
  }): Promise<{
    success: boolean;
    message: string;
    requestId: string;
  }> {
    const response = await this.client.post('/api/attempt-requests', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Review an attempt request (instructor/admin only)
   */
  async reviewAttemptRequest(
    requestId: string,
    data: {
      decision: 'approved' | 'rejected';
      reviewNotes?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.client.patch(`/api/attempt-requests/${requestId}/review`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get pending attempt requests (for instructors/admins)
   */
  async getPendingAttemptRequests(): Promise<Array<{
    _id: string;
    userId: string;
    testId: string;
    organizationId: string;
    requestedAttempts: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    user?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      fullName: string;
    };
    test?: {
      _id: string;
      title: string;
      description: string;
    };
  }>> {
    const response = await this.client.get('/api/attempt-requests/pending');
    return response.data || [];
  }

  /**
   * Get user's own attempt requests
   */
  async getUserAttemptRequests(): Promise<Array<{
    _id: string;
    userId: string;
    testId: string;
    organizationId: string;
    requestedAttempts: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
    test?: {
      _id: string;
      title: string;
      description: string;
    };
    reviewer?: {
      _id: string;
      firstName: string;
      lastName: string;
      fullName: string;
    };
  }>> {
    const response = await this.client.get('/api/attempt-requests/my-requests');
    return response.data || [];
  }

  /**
   * Get specific attempt request details
   */
  async getAttemptRequest(requestId: string): Promise<{
    _id: string;
    userId: string;
    testId: string;
    organizationId: string;
    requestedAttempts: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
    user?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    test?: {
      _id: string;
      title: string;
      description: string;
    };
    reviewer?: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  }> {
    const response = await this.client.get(`/api/attempt-requests/${requestId}`);
    return response.data;
  }

  /**
  * Grant attempts directly (admin/instructor only)
  */
  async grantAttemptsDirectly(data: {
    userId: string;
    testId: string;
    extraAttempts: number;
    reason: string;
  }): Promise<{
    success: boolean;
    message: string;
    override?: {
      _id: string;
      userId: string;
      testId: string;
      organizationId: string;
      extraAttempts: number;
      reason: string;
      grantedBy: string;
      grantedAt: string;
      expiresAt?: string;
    };
  }> {
    // FIXED: Use the correct endpoint that matches your server.js mounting
    const response = await this.client.post('/api/student-overrides/grant-attempts', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get all overrides for organization
   */
  async getStudentOverrides(params?: {
    testId?: string;
    userId?: string;
  }): Promise<Array<{
    _id: string;
    userId: string;
    testId: string;
    organizationId: string;
    extraAttempts: number;
    reason: string;
    grantedBy: string;
    grantedAt: string;
    expiresAt?: string;
    user?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      fullName: string;
    };
    test?: {
      _id: string;
      title: string;
    };
    granter?: {
      _id: string;
      firstName: string;
      lastName: string;
      fullName: string;
    };
  }>> {
    const searchParams = new URLSearchParams();
    if (params?.testId) searchParams.append('testId', params.testId);
    if (params?.userId) searchParams.append('userId', params.userId);

    const query = searchParams.toString();
    const endpoint = `/api/student-overrides/overrides${query ? `?${query}` : ''}`;

    const response = await this.client.get(endpoint);
    return response.data || [];
  }

  /**
   * Update an existing override
   */
  async updateStudentOverride(
    overrideId: string,
    data: { extraAttempts: number; reason: string }
  ): Promise<{
    success: boolean;
    message: string;
    override?: any;
  }> {
    const response = await this.client.patch(`/api/student-overrides/overrides/${overrideId}`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Delete an override
   */
  async deleteStudentOverride(overrideId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.client.delete(`/api/student-overrides/overrides/${overrideId}`, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get attempt status for a specific student/test combination
   */
  async getAttemptStatus(testId: string, userId: string): Promise<{
    student: {
      id: string;
      name: string;
      email: string;
    };
    test: {
      id: string;
      title: string;
      baseAttempts: number;
    };
    attempts: {
      total: number;
      used: number;
      remaining: number;
    };
    override?: {
      extraAttempts: number;
      reason: string;
      grantedBy: string;
      grantedAt: string;
    };
  }> {
    const response = await this.client.get(`/api/student-overrides/status/${testId}/${userId}`);
    return response.data;
  }

  /**
   * Check if user can submit attempt request for a test
   */
  async canSubmitAttemptRequest(testId: string): Promise<{
    canSubmit: boolean;
    reason?: string;
    remainingAttempts?: number;
    hasPendingRequest?: boolean;
  }> {
    const response = await this.client.get(`/api/attempt-requests/can-submit/${testId}`);
    return response.data;
  }

  /**
   * Get test attempt summary for a user
   */
  async getTestAttemptSummary(testId: string): Promise<{
    test: {
      id: string;
      title: string;
      baseAttempts: number;
    };
    attempts: {
      total: number;
      used: number;
      remaining: number;
    };
    hasOverride: boolean;
    hasPendingRequest: boolean;
    canTakeTest: boolean;
  }> {
    const response = await this.client.get(`/api/tests/${testId}/attempt-summary`);
    return response.data;
  }

  // =====================================================
  // NOTIFICATION API METHODS (HTTP fallback for socket)
  // =====================================================

  /**
   * Get user's notifications
   */
  async getNotifications(params?: {
    limit?: number;
    page?: number;
  }): Promise<{
    notifications: Array<{
      _id: string;
      recipientId: string;
      senderId?: string;
      organizationId: string;
      type: string;
      title: string;
      message: string;
      relatedModel?: string;
      relatedId?: string;
      actionUrl?: string;
      actionText?: string;
      isRead: boolean;
      readAt?: string;
      createdAt: string;
      updatedAt: string;
      sender?: {
        _id: string;
        firstName: string;
        lastName: string;
      };
    }>;
    pagination: {
      current: number;
      total: number;
      hasNext: boolean;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.page) searchParams.append('page', params.page.toString());

    const query = searchParams.toString();
    const endpoint = `/api/notifications${query ? `?${query}` : ''}`;

    const response = await this.client.get(endpoint);
    return response.data;
  }

  /**
   * Mark notification as read via HTTP
   */
  async markNotificationAsRead(notificationId: string): Promise<{
    success: boolean;
  }> {
    const response = await this.client.patch(`/api/notifications/${notificationId}/read`, {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Mark all notifications as read via HTTP
   */
  async markAllNotificationsAsRead(): Promise<{
    success: boolean;
    markedCount: number;
  }> {
    const response = await this.client.patch('/api/notifications/mark-all-read', {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get unread notification count via HTTP
   */
  async getUnreadNotificationCount(): Promise<{
    count: number;
  }> {
    const response = await this.client.get('/api/notifications/unread-count');
    return response.data;
  }

  async getStudentDashboard(): Promise<StudentDashboard> {
    const response = await this.client.get('/api/student/dashboard');
    return response.data;
  }

  // Manual Scoring Methods
  async getPendingManualGrading(params = {}) {
    const response = await this.client.get('/api/manual-scoring/pending-review', { params });
    return response.data;
  }

  async updateQuestionScore(resultId: string, questionIndex: number, data: {
    pointsEarned: number;
    isCorrect: boolean;
    feedback?: string;
  }) {
    const response = await this.client.patch(
      `/api/manual-scoring/results/${resultId}/questions/${questionIndex}`,
      data
    );
    return response.data;
  }

  async bulkUpdateQuestionScores(resultId: string, data: {
    updates: Array<{
      questionIndex: number;
      pointsEarned: number;
      isCorrect: boolean;
      feedback?: string;
    }>;
    feedback?: string;
  }) {
    const response = await this.client.patch(`/api/manual-scoring/results/${resultId}/bulk-update`, data);
    return response.data;
  }

  async overrideTotalScore(resultId: string, data: {
    totalScore: number;
    percentage: number;
    passed: boolean;
    reason: string;
  }) {
    const response = await this.client.patch(`/api/manual-scoring/results/${resultId}/override-score`, data);
    return response.data;
  }
}

export default new ApiService();