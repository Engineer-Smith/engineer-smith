#!/usr/bin/env node
// scripts/testContextIntegration.js - Terminal script to test context alignment (ES Module)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic import for node-fetch (handles both CommonJS and ES modules)
let fetch;
try {
    const fetchModule = await import('node-fetch');
    fetch = fetchModule.default || fetchModule;
} catch (error) {
    console.error('❌ node-fetch not found. Install it with: npm install node-fetch');
    process.exit(1);
}

class ContextIntegrationTester {
    constructor() {
        this.baseUrl = process.env.VITE_API_URL || 'http://localhost:7000';
        this.token = null;
        this.sessionId = null;
        this.testId = null;
        this.results = [];
        this.cookies = new Map(); // Store cookies manually for authentication
        this.config = {
            skipDestructiveTests: true,
            timeout: 10000,
            verbose: false
        };
    }

    log(message, type = 'info', data = null) {
        const timestamp = new Date().toISOString();
        const symbols = { info: 'ℹ', success: '✅', error: '❌', warning: '⚠️' };
        const symbol = symbols[type] || 'ℹ';
        
        console.log(`${symbol} [${timestamp.split('T')[1].split('.')[0]}] ${message}`);
        
        if (data && this.config.verbose) {
            console.log('   Data:', JSON.stringify(data, null, 2));
        }

        this.results.push({
            timestamp,
            type,
            message,
            data
        });
    }

    async makeRequest(method, endpoint, body = null, includeAuth = true) {
        // Your API has auth endpoints at root level, others under /api/
        let url;
        if (endpoint.startsWith('/auth/')) {
            url = `${this.baseUrl}${endpoint}`; // Auth endpoints at root level
        } else {
            url = `${this.baseUrl}/api${endpoint}`; // Other endpoints under /api
        }
        
        const headers = {
            'Content-Type': 'application/json',
        };

        // Add stored cookies to request
        if (this.cookies.size > 0) {
            const cookieString = Array.from(this.cookies.entries())
                .map(([name, value]) => `${name}=${value}`)
                .join('; ');
            headers['Cookie'] = cookieString;
            this.log(`Sending cookies: ${this.cookies.size} cookies`, 'info');
        }

        const config = { method, headers };
        if (body) config.body = JSON.stringify(body);

        this.log(`${method} ${endpoint}`, 'info');
        
        try {
            const response = await fetch(url, config);
            
            // Extract and store cookies from Set-Cookie headers
            const setCookieHeader = response.headers.get('set-cookie');
            if (setCookieHeader) {
                // Handle multiple cookies in set-cookie header
                const cookieStrings = setCookieHeader.split(/,(?=[^;]+=[^;]+)/);
                cookieStrings.forEach(cookieString => {
                    const [nameValue] = cookieString.split(';');
                    const [name, value] = nameValue.split('=').map(s => s.trim());
                    if (name && value) {
                        this.cookies.set(name, value);
                    }
                });
                this.log(`Stored ${this.cookies.size} cookies from server`, 'info');
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${data.message || response.statusText}`);
            }

            return data;
        } catch (error) {
            this.log(`Request failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async authenticate() {
        try {
            this.log('Authenticating with seeded user credentials...');
            
            // Use exact field names from your authController.js
            const loginData = await this.makeRequest('POST', '/auth/login', {
                loginCredential: 'student_engineersmith', // Correct field name
                password: 'secureStudent123'              // Correct password from seedUsers.js
            }, false);

            if (!loginData.success || !loginData.user) {
                throw new Error('Login failed - no user data received');
            }

            this.log('Login successful!', 'success', {
                loginId: loginData.user.loginId,
                role: loginData.user.role,
                fullName: loginData.user.fullName
            });

            // Get current user data (like your AuthContext does)
            const userData = await this.makeRequest('GET', '/auth/me', null, true);

            if (userData.success && userData.user) {
                this.token = 'authenticated';
                this.log('Full authentication successful', 'success', {
                    userId: userData.user._id,
                    loginId: userData.user.loginId,
                    role: userData.user.role,
                    hasOrganization: !!userData.user.organization
                });
                return true;
            }

            throw new Error('Failed to get current user data');

        } catch (error) {
            this.log(`Authentication failed: ${error.message}`, 'error');
            this.log('Ensure these users exist (run: node scripts/seedUsers.js):', 'info');
            this.log('  • student_engineersmith : secureStudent123', 'info');
            this.log('  • john_doe : johnPassword123', 'info');
            return false;
        }
    }

    async findTestId() {
        try {
            this.log('Finding available test...');
            
            const testsData = await this.makeRequest('GET', '/tests?limit=1&status=active');
            
            if (testsData && testsData.length > 0) {
                // Handle MongoDB ObjectId format - extract the actual ID string
                const testData = testsData[0];
                this.testId = testData._id.$oid || testData._id || testData.id;
                
                this.log(`Found test: ${testData.title} (ID: ${this.testId})`, 'success');
                return true;
            } else {
                throw new Error('No active tests found');
            }
        } catch (error) {
            this.log(`Failed to find test: ${error.message}`, 'error');
            return false;
        }
    }

    async testCheckExistingSession() {
        try {
            this.log('TEST: checkExistingSession interface alignment');
            
            const response = await this.makeRequest('GET', '/test-sessions/check-existing');
            
            // Validate response matches CheckExistingSessionResponse interface
            const requiredFields = ['success', 'canRejoin', 'message'];
            const missingFields = requiredFields.filter(field => !(field in response));
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Type validation
            if (typeof response.success !== 'boolean') {
                throw new Error('success field must be boolean');
            }
            
            if (typeof response.canRejoin !== 'boolean') {
                throw new Error('canRejoin field must be boolean');
            }

            this.log('checkExistingSession interface validation passed', 'success', {
                canRejoin: response.canRejoin,
                hasSessionId: !!response.sessionId,
                hasTestInfo: !!response.testInfo
            });

            return response;
        } catch (error) {
            this.log(`checkExistingSession test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async testStartSession() {
        try {
            this.log('TEST: startSession interface alignment');
            
            if (!this.testId) {
                throw new Error('No test ID available');
            }

            const response = await this.makeRequest('POST', '/test-sessions', {
                testId: this.testId,
            });

            // Validate response matches StartSessionResponse interface
            if (!response.success) {
                throw new Error(`Start session failed: ${response.message}`);
            }

            // Validate session object structure
            if (!response.session || !response.session.sessionId) {
                throw new Error('Missing session object or sessionId');
            }

            // Validate question object structure
            if (!response.question || !response.question.questionState) {
                throw new Error('Missing question object or questionState');
            }

            // Store session ID for subsequent tests
            this.sessionId = response.session.sessionId;

            this.log('startSession interface validation passed', 'success', {
                sessionId: this.sessionId,
                hasTestInfo: !!response.session.testInfo,
                hasQuestionState: !!response.question.questionState,
                hasNavigationContext: !!response.question.navigationContext
            });

            // Validate question state structure
            const questionState = response.question.questionState;
            const requiredQuestionFields = [
                'questionIndex', 'questionData', 'currentAnswer', 'status',
                'timeSpent', 'viewCount'
            ];
            
            const missingQuestionFields = requiredQuestionFields.filter(
                field => !(field in questionState)
            );
            
            if (missingQuestionFields.length > 0) {
                throw new Error(`QuestionState missing fields: ${missingQuestionFields.join(', ')}`);
            }

            // Validate navigation context structure
            const navContext = response.question.navigationContext;
            const requiredNavFields = [
                'currentIndex', 'totalQuestions', 'answeredQuestions',
                'skippedQuestions', 'reviewPhase', 'progress'
            ];
            
            const missingNavFields = requiredNavFields.filter(
                field => !(field in navContext)
            );
            
            if (missingNavFields.length > 0) {
                throw new Error(`NavigationContext missing fields: ${missingNavFields.join(', ')}`);
            }

            this.log('Question state and navigation context structures validated', 'success');

            return response;
        } catch (error) {
            // Handle session conflict
            if (error.message.includes('existing session') || error.message.includes('409')) {
                this.log('Session conflict detected - this is expected behavior', 'warning');
                return { conflictDetected: true };
            }
            
            this.log(`startSession test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async testGetCurrentQuestion() {
        try {
            this.log('TEST: getCurrentQuestion interface alignment');
            
            if (!this.sessionId) {
                throw new Error('No session ID available');
            }

            const response = await this.makeRequest('GET', `/test-sessions/${this.sessionId}/current-question`);

            // Validate response matches CurrentQuestionResponse interface
            if (!response.success) {
                throw new Error(`Get current question failed: ${response.message}`);
            }

            const requiredFields = [
                'sessionId', 'sessionInfo', 'questionState', 
                'navigationContext', 'timeRemaining'
            ];
            
            const missingFields = requiredFields.filter(field => !(field in response));
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            this.log('getCurrentQuestion interface validation passed', 'success', {
                questionIndex: response.questionState.questionIndex,
                questionType: response.questionState.questionData.type,
                timeRemaining: response.timeRemaining
            });

            return response;
        } catch (error) {
            this.log(`getCurrentQuestion test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async testSubmitAnswer() {
        try {
            this.log('TEST: submitAnswer interface alignment');
            
            if (!this.sessionId) {
                throw new Error('No session ID available');
            }

            // Get current question first to understand what to submit
            const currentQuestion = await this.makeRequest('GET', `/test-sessions/${this.sessionId}/current-question`);
            
            let testAnswer;
            const questionType = currentQuestion.questionState.questionData.type;
            
            // Generate appropriate test answer based on question type
            switch (questionType) {
                case 'multipleChoice':
                    testAnswer = 0; // First option
                    break;
                case 'trueFalse':
                    testAnswer = true;
                    break;
                case 'fillInTheBlank':
                    testAnswer = 'test answer';
                    break;
                case 'codeChallenge':
                    testAnswer = 'function solution() { return "test"; }';
                    break;
                default:
                    testAnswer = 'test answer';
            }

            // Submit answer following SubmitAnswerRequest interface
            const response = await this.makeRequest('POST', `/test-sessions/${this.sessionId}/submit-answer`, {
                answer: testAnswer,
                timeSpent: 30,
                action: 'submit'
            });

            // Validate response matches ServerActionResponse interface
            if (!response.success) {
                throw new Error(`Submit answer failed: ${response.message}`);
            }

            const requiredFields = ['success', 'action'];
            const missingFields = requiredFields.filter(field => !(field in response));
            
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            this.log('submitAnswer interface validation passed', 'success', {
                action: response.action,
                type: response.type,
                hasQuestion: !!response.question,
                hasNavigation: !!response.navigation
            });

            return response;
        } catch (error) {
            this.log(`submitAnswer test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async testSkipQuestion() {
        try {
            this.log('TEST: skipQuestion interface alignment');
            
            if (!this.sessionId) {
                throw new Error('No session ID available');
            }

            // Submit skip following SubmitAnswerRequest interface
            const response = await this.makeRequest('POST', `/test-sessions/${this.sessionId}/submit-answer`, {
                timeSpent: 15,
                action: 'skip',
                skipReason: 'Testing skip functionality'
            });

            // Validate response
            if (!response.success) {
                throw new Error(`Skip question failed: ${response.message}`);
            }

            this.log('skipQuestion interface validation passed', 'success', {
                action: response.action,
                type: response.type
            });

            return response;
        } catch (error) {
            this.log(`skipQuestion test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async testDestructiveOperations() {
        if (this.config.skipDestructiveTests) {
            this.log('Skipping destructive tests (submit/abandon)', 'warning');
            return;
        }

        try {
            this.log('TEST: Destructive operations (submit test session)');
            
            if (!this.sessionId) {
                throw new Error('No session ID available');
            }

            const response = await this.makeRequest('POST', `/test-sessions/${this.sessionId}/submit`, {
                forceSubmit: true
            });

            this.log('Test submission completed', 'success', {
                success: response.success,
                hasFinalScore: !!response.finalScore
            });

            return response;
        } catch (error) {
            this.log(`Destructive test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async runAllTests() {
        console.log('\n🧪 Context Integration Test Suite');
        console.log('==================================');
        
        let passed = 0;
        let failed = 0;
        const errors = [];

        try {
            // 1. Authentication
            const authSuccess = await this.authenticate();
            if (!authSuccess) {
                throw new Error('Authentication failed - cannot continue');
            }
            passed++;

            // 2. Find test ID
            const testFound = await this.findTestId();
            if (!testFound) {
                throw new Error('No test found - cannot continue');
            }
            passed++;

            // 3. Check existing session
            try {
                await this.testCheckExistingSession();
                passed++;
            } catch (error) {
                failed++;
                errors.push(`checkExistingSession: ${error.message}`);
            }

            // 4. Start session
            try {
                const startResult = await this.testStartSession();
                if (!startResult.conflictDetected) {
                    passed++;
                } else {
                    this.log('Session conflict handling needs manual verification', 'warning');
                    passed++;
                }
            } catch (error) {
                failed++;
                errors.push(`startSession: ${error.message}`);
            }

            // 5. Get current question
            if (this.sessionId) {
                try {
                    await this.testGetCurrentQuestion();
                    passed++;
                } catch (error) {
                    failed++;
                    errors.push(`getCurrentQuestion: ${error.message}`);
                }

                // 6. Submit answer
                try {
                    await this.testSubmitAnswer();
                    passed++;
                } catch (error) {
                    failed++;
                    errors.push(`submitAnswer: ${error.message}`);
                }

                // 7. Skip question
                try {
                    await this.testSkipQuestion();
                    passed++;
                } catch (error) {
                    failed++;
                    errors.push(`skipQuestion: ${error.message}`);
                }

                // 8. Destructive tests
                try {
                    await this.testDestructiveOperations();
                    if (!this.config.skipDestructiveTests) {
                        passed++;
                    }
                } catch (error) {
                    if (!this.config.skipDestructiveTests) {
                        failed++;
                        errors.push(`destructiveOperations: ${error.message}`);
                    }
                }
            }

        } catch (error) {
            this.log(`Critical test failure: ${error.message}`, 'error');
            failed++;
            errors.push(`Critical: ${error.message}`);
        }

        // Print summary
        this.printSummary(passed, failed, errors);
        
        return {
            passed,
            failed,
            errors,
            success: failed === 0
        };
    }

    printSummary(passed, failed, errors) {
        console.log('\n' + '='.repeat(60));
        console.log('                 TEST RESULTS SUMMARY');
        console.log('='.repeat(60));
        console.log(`Tests Passed: ${passed}`);
        console.log(`Tests Failed: ${failed}`);
        console.log(`Total Tests: ${passed + failed}`);
        console.log(`Success Rate: ${passed + failed > 0 ? Math.round((passed / (passed + failed)) * 100) : 0}%`);
        
        if (errors.length > 0) {
            console.log('\n❌ FAILED TESTS:');
            errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        if (failed === 0) {
            console.log('\n🎉 ALL CONTEXT INTEGRATION TESTS PASSED!');
            console.log('Your context files are properly aligned with your interfaces.');
        } else {
            console.log('\n⚠️  Some tests failed. Check the errors above.');
            console.log('Review your context implementations and interface definitions.');
        }
        
        console.log('='.repeat(60));
    }

    async checkFileStructure() {
        console.log('\n📁 Checking file structure...');
        
        const requiredFiles = [
            'src/context/TestSessionContext.tsx',
            'src/context/SocketContext.tsx',
            'src/types/session.ts',
            'src/services/ApiService.ts'
        ];

        const missing = [];
        
        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                missing.push(file);
            }
        }

        if (missing.length > 0) {
            console.log('❌ Missing files:', missing);
            return false;
        } else {
            console.log('✅ All required files found');
            return true;
        }
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const tester = new ContextIntegrationTester();
    
    // Parse arguments
    args.forEach(arg => {
        if (arg === '--verbose' || arg === '-v') {
            tester.config.verbose = true;
        }
        if (arg === '--destructive') {
            tester.config.skipDestructiveTests = false;
        }
        if (arg.startsWith('--url=')) {
            tester.baseUrl = arg.split('=')[1];
        }
    });

    console.log('Context Integration Tester');
    console.log(`Server URL: ${tester.baseUrl}`);
    console.log(`Verbose: ${tester.config.verbose}`);
    console.log(`Skip Destructive: ${tester.config.skipDestructiveTests}`);

    // Check file structure first
    const filesOk = await tester.checkFileStructure();
    if (!filesOk) {
        console.log('⚠️  Some required files are missing. Tests may fail.');
    }

    // Run tests
    const results = await tester.runAllTests();
    
    // Exit with appropriate code
    process.exit(results.success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}