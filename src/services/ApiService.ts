import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  User,
  Question,
  Test,
  TestSession,
  Result,
  AnalyticsResult,
  UserAnalytics,
  SectionAnalytics,
} from '../types/';

interface Params {
  [key: string]: string | number | boolean | undefined;
}

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
            console.log('ApiService: Pre-refresh cookies:', document.cookie);
            const refreshResponse = await axios.post(
              `${this.client.defaults.baseURL}/auth/refresh-token`,
              {},
              { withCredentials: true }
            );

            if (refreshResponse.status === 200) {
              console.log('ApiService: Token refresh successful, CSRF Token:', refreshResponse.data.csrfToken);
              if (refreshResponse.data.csrfToken) {
                document.cookie = `csrfToken=${refreshResponse.data.csrfToken}; path=/; SameSite=Strict; ${import.meta.env.VITE_NODE_ENV === 'production' ? 'Secure' : ''}`;
              }
              // Add delay to ensure cookies are set
              await new Promise((resolve) => setTimeout(resolve, 100));
              error.config.headers['X-CSRF-Token'] = refreshResponse.data.csrfToken || this.getCsrfToken();
              console.log('ApiService: Retrying request with headers:', error.config.headers);
              console.log('ApiService: Retry data:', JSON.stringify(error.config.data, null, 2));
              return this.client.request(error.config);
            }
          } catch (refreshError) {
            console.error('ApiService: Token refresh failed:', refreshError);
            return Promise.reject(refreshError);
          }
        }
        console.error('ApiService: Non-401 error or retry failed:', error.response?.status);
        return Promise.reject(error);
      }
    );
  }

  private getCsrfToken(): string | null {
    const match = document.cookie.match(/csrfToken=([^;]+)/);
    const token = match ? match[1] : null;
    console.log('ApiService: CSRF Token:', token);
    console.log('ApiService: Cookies:', document.cookie);
    return token;
  }

  private getCsrfHeaders(): { 'X-CSRF-Token'?: string } {
    const csrfToken = this.getCsrfToken();
    console.log('ApiService: CSRF Headers:', csrfToken ? { 'X-CSRF-Token': csrfToken } : {});
    return csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
  }

  private handleError(error: unknown): ApiResponse<never> {
    const message = (error as any).response?.data?.message || (error as Error).message || 'An error occurred';
    const status = (error as any).response?.status || 500;
    console.error('ApiService: Error:', { message, status, error });
    return { error: true, status, message };
  }

  async register(data: {
    username: string;
    email?: string;
    password?: string;
    inviteCode?: string;
    role?: string;
  }): Promise<ApiResponse<{ success: boolean; user: User; csrfToken: string }>> {
    try {
      console.log('ApiService: Registering user:', data);
      const response = await this.client.post('/auth/register', data);
      console.log('ApiService: Register response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async login(data: { loginCredential: string; password: string }): Promise<ApiResponse<{ success: boolean; user: User; csrfToken: string }>> {
    try {
      console.log('ApiService: Logging in:', data.loginCredential);
      const response = await this.client.post('/auth/login', data);
      console.log('ApiService: Login response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      console.log('ApiService: Logging out');
      const response = await this.client.post('/auth/logout', {}, {
        headers: this.getCsrfHeaders(),
      });
      console.log('ApiService: Logout response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<ApiResponse<{ success: boolean; user: User }>> {
    try {
      console.log('ApiService: Fetching current user');
      const response = await this.client.get('/auth/me');
      console.log('ApiService: getCurrentUser response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async refreshToken(): Promise<ApiResponse<{ success: boolean; csrfToken: string }>> {
    try {
      console.log('ApiService: Refreshing token');
      const response = await this.client.post('/auth/refresh-token');
      console.log('ApiService: refreshToken response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async validateInviteCode(data: { inviteCode: string }): Promise<ApiResponse<{ success: boolean; organization: { id: string; name: string } }>> {
    try {
      console.log('ApiService: Validating invite code:', data.inviteCode);
      const response = await this.client.post('/auth/validate-invite', data);
      console.log('ApiService: validateInviteCode response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  getSSOLoginUrl(): string {
    const url = `${this.client.defaults.baseURL}/auth/login/sso`;
    console.log('ApiService: SSO Login URL:', url);
    return url;
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    try {
      console.log('ApiService: Fetching user:', userId);
      const response = await this.client.get(`/api/users/${userId}`);
      console.log('ApiService: getUser response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllUsers(params: Params = {}): Promise<ApiResponse<User[]>> {
    try {
      console.log('ApiService: Fetching all users with params:', params);
      const response = await this.client.get('/api/users', { params });
      console.log('ApiService: getAllUsers response:', response.data);
      return { data: response.data || [] }; // Ensure array
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateUser(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      console.log('ApiService: Updating user:', userId, data);
      const response = await this.client.patch(`/api/users/${userId}`, data, {
        headers: this.getCsrfHeaders(),
      });
      console.log('ApiService: updateUser response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('ApiService: Deleting user:', userId);
      const response = await this.client.delete(`/api/users/${userId}`, {
        headers: this.getCsrfHeaders(),
      });
      console.log('ApiService: deleteUser response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createQuestion(data: Partial<Question>, params: Params = {}): Promise<ApiResponse<Question>> {
    try {
      console.log('ApiService: createQuestion data:', JSON.stringify(data, null, 2));
      console.log('ApiService: createQuestion headers:', this.getCsrfHeaders());
      console.log('ApiService: createQuestion cookies:', document.cookie);
      const response = await this.client.post('/api/questions', data, {
        params,
        headers: this.getCsrfHeaders(),
      });
      console.log('ApiService: createQuestion response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getQuestion(questionId: string): Promise<ApiResponse<Question>> {
    try {
      console.log('ApiService: Fetching question:', questionId);
      const response = await this.client.get(`/api/questions/${questionId}`);
      console.log('ApiService: getQuestion response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllQuestions(params: Params = {}, includeTotalCount: boolean = false): Promise<ApiResponse<Question[] | {
    questions: Question[];
    totalCount: number;
    totalPages: number;
  }>> {
    try {
      console.log('ApiService: Fetching all questions with params:', params, 'includeTotalCount:', includeTotalCount);

      const queryParams = {
        ...params,
        ...(includeTotalCount && { includeTotalCount: 'true' })
      };

      const response = await this.client.get('/api/questions', { params: queryParams });
      console.log('ApiService: getAllQuestions response:', response.data);

      // Ensure we return the right format
      if (includeTotalCount) {
        return { data: response.data };
      } else {
        return { data: response.data || [] }; // Ensure array for backward compatibility
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getPaginatedQuestions(params: Params = {}): Promise<ApiResponse<{
  questions: Question[];
  totalCount: number;
  totalPages: number;
}>> {
  try {
    console.log('ApiService: Fetching paginated questions with params:', params);
    return await this.getAllQuestions(params, true) as ApiResponse<{
      questions: Question[];
      totalCount: number;
      totalPages: number;
    }>;
  } catch (error) {
    return this.handleError(error);
  }
}

  async updateQuestion(questionId: string, data: Partial<Question>): Promise<ApiResponse<Question>> {
    try {
      console.log('ApiService: updateQuestion data:', JSON.stringify(data, null, 2));
      console.log('ApiService: updateQuestion headers:', this.getCsrfHeaders());
      console.log('ApiService: updateQuestion cookies:', document.cookie);
      const response = await this.client.patch(`/api/questions/${questionId}`, data, {
        headers: this.getCsrfHeaders(),
      });
      console.log('ApiService: updateQuestion response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteQuestion(questionId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('ApiService: Deleting question:', questionId);
      const response = await this.client.delete(`/api/questions/${questionId}`, {
        headers: this.getCsrfHeaders(),
      });
      console.log('ApiService: deleteQuestion response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createTest(data: Partial<Test>, params: Params = {}): Promise<ApiResponse<Test>> {
    try {
      console.log('ApiService: createTest data:', JSON.stringify(data, null, 2));
      const response = await this.client.post('/api/tests', data, {
        params,
        headers: this.getCsrfHeaders(),
      });
      console.log('ApiService: createTest response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTest(testId: string): Promise<ApiResponse<Test>> {
    try {
      console.log('ApiService: Fetching test:', testId);
      const response = await this.client.get(`/api/tests/${testId}`);
      console.log('ApiService: getTest response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllTests(params: Params = {}): Promise<ApiResponse<Test[]>> {
    try {
      console.log('ApiService: Fetching all tests with params:', params);
      const response = await this.client.get('/api/tests', { params });
      console.log('ApiService: getAllTests response:', response.data);
      return { data: response.data || [] }; // Ensure array
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateTest(testId: string, data: Partial<Test>): Promise<ApiResponse<Test>> {
    try {
      console.log('ApiService: updateTest data:', JSON.stringify(data, null, 2));
      const response = await this.client.patch(`/api/tests/${testId}`, data, {
        headers: this.getCsrfHeaders(),
      });
      console.log('ApiService: updateTest response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteTest(testId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('ApiService: Deleting test:', testId);
      const response = await this.client.delete(`/api/tests/${testId}`, {
        headers: this.getCsrfHeaders(),
      });
      console.log('ApiService: deleteTest response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async startTestSession(data: { testId: string }): Promise<ApiResponse<TestSession>> {
    try {
      console.log('ApiService: Starting test session:', data);
      const response = await this.client.post('/api/test-sessions', data, {
        headers: this.getCsrfHeaders(),
      });
      console.log('ApiService: startTestSession response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTestSession(sessionId: string): Promise<ApiResponse<TestSession>> {
    try {
      console.log('ApiService: Fetching test session:', sessionId);
      const response = await this.client.get(`/api/test-sessions/${sessionId}`);
      console.log('ApiService: getTestSession response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllTestSessions(params: Params = {}): Promise<ApiResponse<TestSession[]>> {
    try {
      console.log('ApiService: Fetching all test sessions with params:', params);
      const response = await this.client.get('/api/test-sessions', { params });
      console.log('ApiService: getAllTestSessions response:', response.data);
      return { data: response.data || [] }; // Ensure array
    } catch (error) {
      return this.handleError(error);
    }
  }

  async submitTestSession(sessionId: string, data: Partial<TestSession>): Promise<ApiResponse<TestSession>> {
    try {
      console.log('ApiService: Submitting test session:', sessionId, data);
      const response = await this.client.patch(`/api/test-sessions/${sessionId}`, data, {
        headers: this.getCsrfHeaders(),
      });
      console.log('ApiService: submitTestSession response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async abandonTestSession(sessionId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('ApiService: Abandoning test session:', sessionId);
      const response = await this.client.patch(`/api/test-sessions/${sessionId}/abandon`, {}, {
        headers: this.getCsrfHeaders(),
      });
      console.log('ApiService: abandonTestSession response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getResult(resultId: string): Promise<ApiResponse<Result>> {
    try {
      console.log('ApiService: Fetching result:', resultId);
      const response = await this.client.get(`/api/results/${resultId}`);
      console.log('ApiService: getResult response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllResults(params: Params = {}): Promise<ApiResponse<Result[]>> {
    try {
      console.log('ApiService: Fetching all results with params:', params);
      const response = await this.client.get('/api/results', { params });
      console.log('ApiService: getAllResults response:', response.data);
      return { data: response.data || [] }; // Ensure array
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getResultAnalytics(params: Params = {}): Promise<ApiResponse<AnalyticsResult[]>> {
    try {
      console.log('ApiService: Fetching result analytics with params:', params);
      const response = await this.client.get('/api/results/analytics', { params });
      console.log('ApiService: getResultAnalytics response:', response.data);
      return { data: response.data || [] }; // Ensure array
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserAnalytics(params: Params = {}): Promise<ApiResponse<UserAnalytics[]>> {
    try {
      console.log('ApiService: Fetching user analytics with params:', params);
      const response = await this.client.get('/api/results/user-analytics', { params });
      console.log('ApiService: getUserAnalytics response:', response.data);
      return { data: response.data || [] }; // Ensure array
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSectionAnalytics(params: Params = {}): Promise<ApiResponse<SectionAnalytics[]>> {
    try {
      console.log('ApiService: Fetching section analytics with params:', params);
      const response = await this.client.get('/api/results/section-analytics', { params });
      console.log('ApiService: getSectionAnalytics response:', response.data);
      return { data: response.data || [] }; // Ensure array
    } catch (error) {
      return this.handleError(error);
    }
  }

  async checkAuthStatus(): Promise<ApiResponse<{ success: boolean; authenticated: boolean; user?: User }>> {
    try {
      console.log('ApiService: Checking auth status');
      const response = await this.client.get('/auth/status');
      console.log('ApiService: checkAuthStatus response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getQuestionStats(): Promise<ApiResponse<{
    byLanguage: Array<{
      language: string;
      count: number;
      difficultyBreakdown: {
        easy: number;
        medium: number;
        hard: number;
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
        codeDebugging: number;
      };
    };
  }>> {
    try {
      console.log('ApiService: Fetching question stats');
      const response = await this.client.get('/api/questions/stats');
      console.log('ApiService: getQuestionStats response:', response.data);
      return { data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default new ApiService();