import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  Badge
} from 'reactstrap';

interface LanguageInfo {
  name: string;
  status: string;
  statusColor: 'success' | 'warning' | 'info' | 'danger';
  description: string;
  categories: string[];
  questionTypes: string[];
  runtime?: string;
  executionCapabilities: string[];
  codeExample: string;
  testingFeatures: string[];
}

const LanguagesPage: React.FC = () => {
  const languageData: Record<string, LanguageInfo> = {
    javascript: {
      name: 'JavaScript',
      status: 'Production',
      statusColor: 'success',
      description: 'Full-featured JavaScript execution with Node.js runtime. Supports ES6+, async programming, and comprehensive testing frameworks.',
      categories: ['logic', 'syntax'],
      questionTypes: ['Code Challenge', 'Code Debugging', 'Fill-in-Blank', 'Multiple Choice', 'True/False'],
      runtime: 'node',
      executionCapabilities: [
        'ES6+ syntax support',
        'Async/await execution',
        'Function testing with test cases',
        'Performance benchmarking',
        'Memory usage tracking',
        'Error handling validation'
      ],
      codeExample: `// JavaScript Logic Challenge
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Test cases validate implementation
// Input: fibonacci(5) → Expected: 5
// Input: fibonacci(10) → Expected: 55`,
      testingFeatures: [
        'Automated test case execution',
        'Runtime error detection',
        'Performance analysis',
        'Memory leak detection'
      ]
    },
    typescript: {
      name: 'TypeScript',
      status: 'Production',
      statusColor: 'success',
      description: 'TypeScript with static type checking, compilation validation, and modern language features. Full Node.js runtime support.',
      categories: ['logic', 'syntax'],
      questionTypes: ['Code Challenge', 'Code Debugging', 'Fill-in-Blank', 'Multiple Choice', 'True/False'],
      runtime: 'node',
      executionCapabilities: [
        'Static type checking validation',
        'Interface compliance testing',
        'Generic type verification',
        'Compilation error detection',
        'Advanced typing patterns',
        'Decorator support'
      ],
      codeExample: `// TypeScript Logic Challenge
interface Calculator {
  add(a: number, b: number): number;
}

class BasicCalculator implements Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

// Test: calculator.add(5, 3) → Expected: 8`,
      testingFeatures: [
        'Type checking validation',
        'Compilation verification',
        'Interface compliance testing',
        'Runtime behavior validation'
      ]
    },
    python: {
      name: 'Python',
      status: 'Production',
      statusColor: 'success',
      description: 'Comprehensive Python 3.x support with extensive standard library access. Perfect for algorithms, data structures, and logic challenges.',
      categories: ['logic', 'syntax'],
      questionTypes: ['Code Challenge', 'Code Debugging', 'Fill-in-Blank', 'Multiple Choice', 'True/False'],
      runtime: 'python',
      executionCapabilities: [
        'Python 3.x execution',
        'Standard library access',
        'Object-oriented programming',
        'List comprehensions',
        'Exception handling',
        'File I/O operations'
      ],
      codeExample: `# Python Logic Challenge
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

# Test: binary_search([1,3,5,7,9], 5) → Expected: 2`,
      testingFeatures: [
        'Automated test execution',
        'Exception handling validation',
        'Performance profiling',
        'Memory usage analysis'
      ]
    },
    sql: {
      name: 'SQL',
      status: 'Production',
      statusColor: 'success',
      description: 'Complete SQL query execution and validation. Supports complex queries, joins, aggregations, and database design concepts.',
      categories: ['logic', 'syntax'],
      questionTypes: ['Code Challenge', 'Fill-in-Blank', 'Multiple Choice', 'True/False'],
      runtime: 'sql',
      executionCapabilities: [
        'Query execution validation',
        'Result set verification',
        'JOIN operations',
        'Aggregate functions',
        'Subquery support',
        'Window functions'
      ],
      codeExample: `-- SQL Logic Challenge
SELECT 
  u.name,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC;`,
      testingFeatures: [
        'Query result validation',
        'Performance analysis',
        'Syntax error detection',
        'Data integrity checking'
      ]
    },
    dart: {
      name: 'Dart',
      status: 'Production',
      statusColor: 'success',
      description: 'Modern Dart language support for algorithmic thinking and programming fundamentals. Strong typing with excellent async support.',
      categories: ['logic', 'syntax'],
      questionTypes: ['Code Challenge', 'Code Debugging', 'Fill-in-Blank', 'Multiple Choice', 'True/False'],
      runtime: 'dart',
      executionCapabilities: [
        'Strong type system',
        'Async programming patterns',
        'Collection operations',
        'Object-oriented features',
        'Functional programming',
        'Error handling'
      ],
      codeExample: `// Dart Logic Challenge
class Calculator {
  double add(double a, double b) => a + b;
  
  Future<double> asyncCalculation(double x) async {
    await Future.delayed(Duration(seconds: 1));
    return x * 2;
  }
}

// Test: Calculator().add(5.0, 3.0) → Expected: 8.0`,
      testingFeatures: [
        'Async code testing',
        'Type safety validation',
        'Performance benchmarking',
        'Memory management analysis'
      ]
    },
    express: {
      name: 'Express.js',
      status: 'Production',
      statusColor: 'success',
      description: 'Express.js web framework assessment with routing, middleware, and API development patterns. Full Node.js runtime support.',
      categories: ['logic', 'syntax'],
      questionTypes: ['Code Challenge', 'Code Debugging', 'Fill-in-Blank', 'Multiple Choice', 'True/False'],
      runtime: 'node',
      executionCapabilities: [
        'Route handling validation',
        'Middleware function testing',
        'HTTP request/response patterns',
        'Authentication middleware',
        'Error handling patterns',
        'API endpoint validation'
      ],
      codeExample: `// Express.js Logic Challenge
const express = require('express');
const app = express();

app.use(express.json());

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.get('/api/users', authenticate, (req, res) => {
  res.json({ users: [] });
});`,
      testingFeatures: [
        'Route testing',
        'Middleware validation',
        'HTTP response verification',
        'Error handling testing'
      ]
    },
    html: {
      name: 'HTML',
      status: 'Production',
      statusColor: 'success',
      description: 'Semantic HTML markup and structure validation. Focus on accessibility, forms, and modern HTML5 features.',
      categories: ['ui', 'syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'Semantic element validation',
        'Form structure assessment',
        'Accessibility compliance',
        'HTML5 feature usage',
        'Document structure validation',
        'Meta tag optimization'
      ],
      codeExample: `<!-- HTML Fill-in-Blank Example -->
<___blank1___ class="hero-section">
  <div class="container">
    <h1>Welcome to Our Platform</h1>
    <___blank2___ action="/contact" method="post">
      <___blank3___ for="email">Email:</label>
      <input type="email" id="email" required>
      <button type="submit">Subscribe</button>
    </form>
  </div>
</section>

<!-- Answers: section, form, label -->`,
      testingFeatures: [
        'Semantic structure validation',
        'Accessibility compliance checking',
        'Form validation testing',
        'HTML5 feature verification'
      ]
    },
    css: {
      name: 'CSS',
      status: 'Production',
      statusColor: 'success',
      description: 'Modern CSS styling and layout assessment. Covers Flexbox, Grid, responsive design, and advanced CSS features.',
      categories: ['ui', 'syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'Layout system validation',
        'Responsive design patterns',
        'CSS Grid and Flexbox',
        'Animation and transitions',
        'Custom properties usage',
        'Cross-browser compatibility'
      ],
      codeExample: `/* CSS Fill-in-Blank Example */
.container {
  display: ___blank1___;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.card {
  ___blank2___: transform 0.3s ease;
  ___blank3___: translateY(-4px);
}

.card:hover {
  transform: var(--hover-transform);
}

/* Answers: grid, transition, --hover-transform */`,
      testingFeatures: [
        'Layout behavior validation',
        'Responsive design testing',
        'Animation verification',
        'Property value validation'
      ]
    },
    react: {
      name: 'React/JSX',
      status: 'Production',
      statusColor: 'success',
      description: 'React component development with hooks, state management, and modern patterns. Focus on component architecture and lifecycle.',
      categories: ['ui', 'syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'Component structure validation',
        'Hook usage patterns',
        'Props and state management',
        'Event handling patterns',
        'Conditional rendering',
        'Component lifecycle understanding'
      ],
      codeExample: `// React Fill-in-Blank Example
import React, { ___blank1___, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = ___blank2___(null);
  const [loading, setLoading] = useState(true);
  
  ___blank3___(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// Answers: useState, useState, useEffect`,
      testingFeatures: [
        'Component structure validation',
        'Hook dependency verification',
        'Props validation',
        'State management patterns'
      ]
    },
    reactNative: {
      name: 'React Native',
      status: 'Production',
      statusColor: 'success',
      description: 'React Native mobile development patterns with native components and mobile-specific UI paradigms.',
      categories: ['ui', 'syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'Native component usage',
        'Mobile UI patterns',
        'Platform-specific code',
        'Navigation patterns',
        'TouchableOpacity handling',
        'StyleSheet optimization'
      ],
      codeExample: `// React Native Fill-in-Blank
import React from 'react';
import { View, Text, ___blank1___ } from 'rn-library';

function CounterScreen() {
  const [count, setCount] = useState(0);
  
  return (
    <View style={styles.container}>
      <Text>Count: {count}</Text>
      <___blank2___ onPress={() => setCount(count + 1)}>
        <Text>Increment</Text>
      </TouchableOpacity>
    </View>
  );
}

// Answers: TouchableOpacity, TouchableOpacity`,
      testingFeatures: [
        'Component rendering validation',
        'Touch interaction patterns',
        'Platform behavior verification',
        'Style application testing'
      ]
    },
    flutter: {
      name: 'Flutter/Dart',
      status: 'Production',
      statusColor: 'success',
      description: 'Flutter widget composition and mobile UI development. Focus on Material Design and cross-platform patterns.',
      categories: ['ui', 'syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'Widget composition patterns',
        'State management approaches',
        'Material Design components',
        'Custom widget creation',
        'Animation and transitions',
        'Platform integration'
      ],
      codeExample: `// Flutter Fill-in-Blank Example
class CounterWidget extends ___blank1___ {
  @override
  _CounterWidgetState createState() => _CounterWidgetState();
}

class _CounterWidgetState extends ___blank2___<CounterWidget> {
  int _counter = 0;
  
  @override
  Widget build(BuildContext context) {
    return ___blank3___(
      body: Text('Count: $_counter'),
      floatingActionButton: FloatingActionButton(
        onPressed: () => setState(() => _counter++),
      ),
    );
  }
}

// Answers: StatefulWidget, State, Scaffold`,
      testingFeatures: [
        'Widget structure validation',
        'State management verification',
        'Material Design compliance',
        'UI behavior testing'
      ]
    },
    json: {
      name: 'JSON',
      status: 'Production',
      statusColor: 'success',
      description: 'JSON data structure validation, syntax verification, and schema compliance testing.',
      categories: ['syntax'],
      questionTypes: ['Fill-in-Blank', 'Multiple Choice', 'True/False'],
      executionCapabilities: [
        'JSON syntax validation',
        'Data structure verification',
        'Schema compliance',
        'Nested object handling',
        'Array structure validation',
        'Data type verification'
      ],
      codeExample: `// JSON Fill-in-Blank Example
{
  "user": {
    "id": "123",
    "profile": {
      "name": "John Doe",
      "preferences": ___blank1___,
      "orders": [
        {
          "id": "order_001",
          "total": ___blank2___
        }
      ]
    }
  }
}

// Answers: {}, 999.99`,
      testingFeatures: [
        'Syntax validation',
        'Schema compliance testing',
        'Data type verification',
        'Structure validation'
      ]
    }
  };

  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');

  const logicLanguages = Object.entries(languageData).filter(([_, lang]) => 
    lang.categories.includes('logic')
  );
  
  const uiLanguages = Object.entries(languageData).filter(([_, lang]) => 
    lang.categories.includes('ui')
  );

  const syntaxOnlyLanguages = Object.entries(languageData).filter(([_, lang]) => 
    lang.categories.length === 1 && lang.categories.includes('syntax')
  );

  const handleNavigation = (path: string) => {
    // Since we can't use useNavigate, we'll just show an alert
    // In your real app, you can implement proper navigation
    alert(`Would navigate to: ${path}`);
  };

  return (
    <div className="languages-page" style={{ paddingTop: '80px' }}>
      <style>{`
        .hero-bg {
          background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%);
          min-height: 60vh;
        }
        .language-card {
          transition: all 0.3s ease;
          border: none;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }
        .language-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .language-card.active {
          border: 2px solid #6366f1;
          transform: translateY(-2px);
        }
        .code-example {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 1rem;
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.85rem;
          color: #e5e7eb;
          max-height: 400px;
          overflow-y: auto;
        }
        .category-section {
          border-left: 4px solid;
          padding-left: 1rem;
          margin-bottom: 2rem;
        }
        .logic-category { border-color: #059669; }
        .ui-category { border-color: #3b82f6; }
        .syntax-category { border-color: #8b5cf6; }
      `}</style>

      {/* Hero Section */}
      <section className="hero-bg d-flex align-items-center text-white">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h1 className="display-4 fw-bold mb-4">
                Multi-Language Assessment Platform
              </h1>
              <p className="lead mb-4 fs-4">
                Comprehensive programming language support with real code execution, 
                intelligent testing, and automated grading across 12 languages and 3 assessment categories.
              </p>
              <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
                <Badge color="success" className="px-3 py-2">
                  {Object.keys(languageData).length} Production Languages
                </Badge>
                <Badge color="info" className="px-3 py-2">
                  5 Question Types
                </Badge>
                <Badge color="warning" className="px-3 py-2">
                  4 Runtime Engines
                </Badge>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Language Categories Overview */}
      <section className="py-5">
        <Container>
          <Row className="mb-5">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-6 fw-bold mb-3">
                Assessment Categories
              </h2>
              <p className="lead text-muted">
                Our platform supports three distinct assessment categories, each designed for specific learning objectives.
              </p>
            </Col>
          </Row>

          {/* Logic Category */}
          <div className="category-section logic-category">
            <Row className="mb-4">
              <Col>
                <div className="d-flex align-items-center mb-3">
                  <Badge color="success" className="me-3 px-3 py-2">LOGIC</Badge>
                  <h4 className="mb-0">Code Execution & Algorithms</h4>
                </div>
                <p className="lead mb-3">
                  Full code execution with automated testing, performance analysis, and real-time validation.
                  Perfect for algorithm challenges, debugging exercises, and programming logic assessment.
                </p>
                <p className="text-muted mb-4">
                  <strong>Question Types:</strong> Code Challenge, Code Debugging, Fill-in-Blank, Multiple Choice, True/False
                </p>
                <Row>
                  {logicLanguages.map(([key, lang]) => (
                    <Col lg={3} md={4} sm={6} key={key} className="mb-3">
                      <Card className="language-card h-100">
                        <CardBody className="py-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 fw-bold">{lang.name}</h6>
                            {lang.runtime && (
                              <Badge color="outline-success" className="small">
                                {lang.runtime}
                              </Badge>
                            )}
                          </div>
                          <p className="small text-muted mb-0">
                            {lang.description.split('.')[0]}
                          </p>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </div>

          {/* UI Category */}
          <div className="category-section ui-category">
            <Row className="mb-4">
              <Col>
                <div className="d-flex align-items-center mb-3">
                  <Badge color="primary" className="me-3 px-3 py-2">UI</Badge>
                  <h4 className="mb-0">User Interface & Frameworks</h4>
                </div>
                <p className="lead mb-3">
                  Component structure, UI patterns, and framework-specific concepts.
                  Focus on practical application of modern web and mobile development patterns.
                </p>
                <p className="text-muted mb-4">
                  <strong>Question Types:</strong> Fill-in-Blank, Multiple Choice, True/False
                </p>
                <Row>
                  {uiLanguages.map(([key, lang]) => (
                    <Col lg={3} md={4} sm={6} key={key} className="mb-3">
                      <Card className="language-card h-100">
                        <CardBody className="py-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 fw-bold">{lang.name}</h6>
                            <Badge color="outline-primary" className="small">
                              UI
                            </Badge>
                          </div>
                          <p className="small text-muted mb-0">
                            {lang.description.split('.')[0]}
                          </p>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </div>

          {/* Syntax Category */}
          <div className="category-section syntax-category">
            <Row className="mb-4">
              <Col>
                <div className="d-flex align-items-center mb-3">
                  <Badge color="secondary" className="me-3 px-3 py-2">SYNTAX</Badge>
                  <h4 className="mb-0">Language Syntax & Fundamentals</h4>
                </div>
                <p className="lead mb-3">
                  Core language syntax, data structures, and fundamental programming concepts.
                  Available across all supported languages for comprehensive assessment.
                </p>
                <p className="text-muted mb-4">
                  <strong>Question Types:</strong> Fill-in-Blank, Multiple Choice, True/False
                </p>
                <Row>
                  {syntaxOnlyLanguages.map(([key, lang]) => (
                    <Col lg={3} md={4} sm={6} key={key} className="mb-3">
                      <Card className="language-card h-100">
                        <CardBody className="py-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0 fw-bold">{lang.name}</h6>
                            <Badge color="outline-secondary" className="small">
                              Syntax
                            </Badge>
                          </div>
                          <p className="small text-muted mb-0">
                            {lang.description.split('.')[0]}
                          </p>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* Language Details */}
      <section className="py-5 bg-light">
        <Container>
          <Row>
            <Col lg={3} className="mb-4">
              <h5 className="mb-3">Explore Languages:</h5>
              {Object.entries(languageData).map(([key, lang]) => (
                <Card 
                  key={key} 
                  className={`language-card mb-2 ${selectedLanguage === key ? 'active' : ''}`}
                  onClick={() => setSelectedLanguage(key)}
                >
                  <CardBody className="py-2 px-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold">{lang.name}</span>
                      <div>
                        {lang.runtime && (
                          <Badge color="outline-success" size="sm" className="me-1">
                            {lang.runtime}
                          </Badge>
                        )}
                        <Badge color={lang.statusColor} size="sm">
                          {lang.status}
                        </Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </Col>
            
            <Col lg={9}>
              {selectedLanguage && languageData[selectedLanguage] && (
                <div>
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <h3 className="fw-bold mb-0 me-3">
                        {languageData[selectedLanguage].name}
                      </h3>
                      <div>
                        {languageData[selectedLanguage].runtime && (
                          <Badge color="success" className="me-2 px-3 py-2">
                            Runtime: {languageData[selectedLanguage].runtime}
                          </Badge>
                        )}
                        <Badge 
                          color={languageData[selectedLanguage].statusColor}
                          className="px-3 py-2"
                        >
                          {languageData[selectedLanguage].status}
                        </Badge>
                      </div>
                    </div>
                    <p className="lead">{languageData[selectedLanguage].description}</p>
                  </div>

                  <Row className="mb-4">
                    <Col md={6}>
                      <Card>
                        <CardBody>
                          <h5 className="mb-3">Assessment Categories</h5>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {languageData[selectedLanguage].categories.map((category, idx) => (
                              <Badge 
                                key={idx} 
                                color={
                                  category === 'logic' ? 'success' : 
                                  category === 'ui' ? 'primary' : 'secondary'
                                }
                                className="px-3 py-2"
                              >
                                {category.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                          <h6 className="mb-2">Question Types:</h6>
                          <ul className="mb-0">
                            {languageData[selectedLanguage].questionTypes.map((type, idx) => (
                              <li key={idx} className="mb-1">{type}</li>
                            ))}
                          </ul>
                        </CardBody>
                      </Card>
                    </Col>
                    
                    <Col md={6}>
                      <Card>
                        <CardBody>
                          <h5 className="mb-3">Execution Capabilities</h5>
                          <ul className="mb-0">
                            {languageData[selectedLanguage].executionCapabilities.map((capability, idx) => (
                              <li key={idx} className="mb-1">{capability}</li>
                            ))}
                          </ul>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  <Card className="mb-4">
                    <CardBody>
                      <h5 className="mb-3">Example Assessment</h5>
                      <div className="code-example">
                        <pre className="mb-0">
                          <code>{languageData[selectedLanguage].codeExample}</code>
                        </pre>
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <h5 className="mb-3">Testing & Validation Features</h5>
                      <Row>
                        {languageData[selectedLanguage].testingFeatures.map((feature, idx) => (
                          <Col md={6} key={idx} className="mb-2">
                            <div className="d-flex align-items-center">
                              <Badge color="outline-primary" className="me-2">✓</Badge>
                              <span>{feature}</span>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </CardBody>
                  </Card>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Runtime Support */}
      <section className="py-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h3 className="fw-bold mb-4">Execution Runtime Support</h3>
              <p className="lead mb-4">
                Our platform provides secure, sandboxed execution environments for real code testing and validation.
              </p>
              <Row>
                <Col md={3} className="mb-3">
                  <Card className="text-center">
                    <CardBody>
                      <h5 className="text-success mb-2">Node.js</h5>
                      <p className="small mb-0">JavaScript, TypeScript, Express.js</p>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3} className="mb-3">
                  <Card className="text-center">
                    <CardBody>
                      <h5 className="text-success mb-2">Python</h5>
                      <p className="small mb-0">Python 3.x with standard library</p>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3} className="mb-3">
                  <Card className="text-center">
                    <CardBody>
                      <h5 className="text-success mb-2">SQL</h5>
                      <p className="small mb-0">Database query execution</p>
                    </CardBody>
                  </Card>
                </Col>
                <Col md={3} className="mb-3">
                  <Card className="text-center">
                    <CardBody>
                      <h5 className="text-success mb-2">Dart</h5>
                      <p className="small mb-0">Modern Dart runtime</p>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h3 className="fw-bold mb-3">Experience Our Assessment Platform</h3>
              <p className="lead mb-4">
                Test drive our comprehensive multi-language assessment platform with real code execution, 
                automated grading, and intelligent testing across all supported languages and question types.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button 
                  size="lg" 
                  color="warning"
                  onClick={() => handleNavigation('/demo')}
                >
                  Try Live Demo
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                  onClick={() => handleNavigation('/register')}
                >
                  Start Creating Assessments
                </Button>
                <Button 
                  size="lg" 
                  outline 
                  color="light"
                  onClick={() => handleNavigation('/features')}
                >
                  Explore All Features
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default LanguagesPage;