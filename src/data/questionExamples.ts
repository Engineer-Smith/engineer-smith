// src/data/questionExamples.ts
import type { Language, QuestionType } from '../types';

export interface QuestionExample {
  title: string;
  description: string;
  sampleCode?: string;
}

export const QUESTION_EXAMPLES: Record<Language, Record<QuestionType, QuestionExample>> = {
  javascript: {
    multipleChoice: {
      title: "Array Methods",
      description: "Which method adds an element to the end of an array?",
      sampleCode: "const arr = [1, 2, 3];\narr._____(4); // Result: [1, 2, 3, 4]"
    },
    trueFalse: {
      title: "JavaScript Type System",
      description: "JavaScript is a statically typed language. True or False?"
    },
    codeChallenge: {
      title: "Find Longest Word",
      description: "Write a function that finds the longest word in an array of strings"
    },
    fillInTheBlank: {
      title: "Complete the Function",
      description: "Complete the function definition",
      sampleCode: "const add = (a, b) => {\n  return ___ + ___;\n}"
    },
    codeDebugging: {
      title: "Fix Infinite Loop",
      description: "Fix the infinite loop in this recursive function",
      sampleCode: "function countdown(n) {\n  console.log(n);\n  countdown(n - 1); // Bug: no base case\n}"
    }
  },
  
  typescript: {
    multipleChoice: {
      title: "Type Annotations",
      description: "Which syntax correctly defines a typed function parameter?"
    },
    trueFalse: {
      title: "TypeScript Compilation",
      description: "TypeScript code can run directly in the browser without compilation. True or False?"
    },
    codeChallenge: {
      title: "Generic Function",
      description: "Implement a generic function that works with different data types"
    },
    fillInTheBlank: {
      title: "Interface Definition",
      description: "Complete the interface definition",
      sampleCode: "interface User {\n  name: ___;\n  age: ___;\n  isActive: ___;\n}"
    },
    codeDebugging: {
      title: "Type Error Fix",
      description: "Fix the type errors in this TypeScript code",
      sampleCode: "function greet(name: string): number {\n  return 'Hello ' + name; // Type error\n}"
    }
  },
  
  react: {
    multipleChoice: {
      title: "React Hooks",
      description: "Which hook is used for side effects in React components?"
    },
    trueFalse: {
      title: "Component Lifecycle",
      description: "React functional components have lifecycle methods like componentDidMount. True or False?"
    },
    codeChallenge: {
      title: "Todo List Component",
      description: "Create a component that manages a todo list with add, delete, and toggle functionality"
    },
    fillInTheBlank: {
      title: "useState Hook",
      description: "Complete the useState hook implementation",
      sampleCode: "const [count, ___] = ___(0);\nconst increment = () => ___(count + 1);"
    },
    codeDebugging: {
      title: "Component Re-rendering Issue",
      description: "Identify why this component is not re-rendering when state changes",
      sampleCode: "function Counter() {\n  let count = 0;\n  return <button onClick={() => count++}>{count}</button>;\n}"
    }
  },
  
  python: {
    multipleChoice: {
      title: "Function Definition",
      description: "Which keyword is used to define a function in Python?"
    },
    trueFalse: {
      title: "Code Blocks",
      description: "Python uses indentation to define code blocks. True or False?"
    },
    codeChallenge: {
      title: "Palindrome Checker",
      description: "Implement a function to check if a string is a palindrome"
    },
    fillInTheBlank: {
      title: "List Comprehension",
      description: "Complete the list comprehension",
      sampleCode: "squares = [___ for x in ___(___, ___)]"
    },
    codeDebugging: {
      title: "Sorting Algorithm Bug",
      description: "Fix the logical error in this sorting algorithm",
      sampleCode: "def bubble_sort(arr):\n    for i in range(len(arr)):\n        for j in range(0, len(arr)):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr"
    }
  },
  
  html: {
    multipleChoice: {
      title: "Semantic Elements",
      description: "Which HTML5 element represents the main content of a document?"
    },
    trueFalse: {
      title: "HTML Structure",
      description: "Every HTML document must contain a DOCTYPE declaration. True or False?"
    },
    codeChallenge: {
      title: "Accessible Form",
      description: "Create a semantic, accessible contact form with proper labels and structure"
    },
    fillInTheBlank: {
      title: "Form Elements",
      description: "Complete the form structure",
      sampleCode: '<form ___="POST" ___="/submit">\n  <___ for="email">Email:</___>\n  <___ type="email" ___="email" required>\n</form>'
    },
    codeDebugging: {
      title: "HTML Validation Errors",
      description: "Fix the HTML validation errors in this markup",
      sampleCode: '<div>\n  <p>Welcome to our site\n  <img src="logo.png">\n  <h1>About Us</h2>\n</div>'
    }
  },
  
  css: {
    multipleChoice: {
      title: "Text Alignment",
      description: "Which CSS property controls horizontal text alignment?"
    },
    trueFalse: {
      title: "Z-Index Property",
      description: "The z-index property only works on positioned elements. True or False?"
    },
    codeChallenge: {
      title: "Responsive Grid Layout",
      description: "Create a responsive grid layout that adapts to different screen sizes"
    },
    fillInTheBlank: {
      title: "Flexbox Layout",
      description: "Complete the flexbox properties",
      sampleCode: ".container {\n  display: ___;\n  justify-content: ___;\n  align-items: ___;\n}"
    },
    codeDebugging: {
      title: "Layout Issues",
      description: "Resolve the layout issues in this flexbox code",
      sampleCode: ".flex-container {\n  display: flex;\n  height: 100%;\n}\n.flex-item {\n  width: 33.33%;\n  height: 200px;\n  overflow: visible;\n}"
    }
  },
  
  sql: {
    multipleChoice: {
      title: "JOIN Operations",
      description: "Which JOIN type returns all records from both tables?"
    },
    trueFalse: {
      title: "Primary Keys",
      description: "A table can have multiple primary keys. True or False?"
    },
    codeChallenge: {
      title: "Complex Query",
      description: "Write a query to find the top 3 customers by total order value"
    },
    fillInTheBlank: {
      title: "SELECT Statement",
      description: "Complete the SQL query",
      sampleCode: "___ name, email ___ users ___ age > 18 ___ BY name;"
    },
    codeDebugging: {
      title: "Query Optimization",
      description: "Fix the performance issues in this SQL query",
      sampleCode: "SELECT * FROM orders o, customers c, products p\nWHERE o.customer_id = c.id\nAND o.product_id = p.id\nAND YEAR(o.order_date) = 2024;"
    }
  },
  
  dart: {
    multipleChoice: {
      title: "Variable Declaration",
      description: "Which keyword creates a compile-time constant in Dart?"
    },
    trueFalse: {
      title: "Null Safety",
      description: "Dart has built-in null safety by default. True or False?"
    },
    codeChallenge: {
      title: "Stream Processing",
      description: "Implement a function that processes a stream of integers and filters even numbers"
    },
    fillInTheBlank: {
      title: "Class Constructor",
      description: "Complete the class definition",
      sampleCode: "class Person {\n  ___ String name;\n  ___ int age;\n  \n  Person.___(this.___, this.___);\n}"
    },
    codeDebugging: {
      title: "Async Function Error",
      description: "Fix the async/await implementation",
      sampleCode: "getData() {\n  return http.get('api/data');\n}\n\nvoid main() {\n  var data = getData();\n  print(data.body);\n}"
    }
  },
  
  flutter: {
    multipleChoice: {
      title: "Widget Types",
      description: "Which widget is used for scrollable content in Flutter?"
    },
    trueFalse: {
      title: "State Management",
      description: "StatelessWidget can have mutable state. True or False?"
    },
    codeChallenge: {
      title: "Custom Widget",
      description: "Create a reusable custom button widget with customizable colors and text"
    },
    fillInTheBlank: {
      title: "Widget Build Method",
      description: "Complete the widget structure",
      sampleCode: "class MyWidget extends ___ {\n  @override\n  Widget ___(BuildContext context) {\n    return ___(child: Text('Hello'));\n  }\n}"
    },
    codeDebugging: {
      title: "Layout Overflow",
      description: "Fix the RenderFlex overflow error in this layout",
      sampleCode: "Row(\n  children: [\n    Container(width: 200, child: Text('Long text')),\n    Container(width: 200, child: Text('More text')),\n    Container(width: 200, child: Text('Even more')),\n  ],\n)"
    }
  },
  
  reactNative: {
    multipleChoice: {
      title: "Navigation",
      description: "Which component is used for touchable areas in React Native?"
    },
    trueFalse: {
      title: "Platform Differences",
      description: "React Native components render identically on iOS and Android. True or False?"
    },
    codeChallenge: {
      title: "Platform-Specific Logic",
      description: "Implement a component that shows different content based on the platform (iOS/Android)"
    },
    fillInTheBlank: {
      title: "StyleSheet Definition",
      description: "Complete the StyleSheet",
      sampleCode: "const styles = StyleSheet.___(___);\n\nconst container = {\n  flex: ___,\n  backgroundColor: '___',\n};"
    },
    codeDebugging: {
      title: "AsyncStorage Issue",
      description: "Fix the AsyncStorage implementation",
      sampleCode: "const saveData = (data) => {\n  AsyncStorage.setItem('user', data);\n};\n\nconst loadData = () => {\n  const user = AsyncStorage.getItem('user');\n  return JSON.parse(user);\n};"
    }
  },
  
  express: {
    multipleChoice: {
      title: "Middleware",
      description: "What is the correct order of middleware execution in Express?"
    },
    trueFalse: {
      title: "Route Handling",
      description: "Express routes are case-sensitive by default. True or False?"
    },
    codeChallenge: {
      title: "Authentication Middleware",
      description: "Create middleware that validates JWT tokens and handles authentication"
    },
    fillInTheBlank: {
      title: "Route Definition",
      description: "Complete the Express route",
      sampleCode: "app.___(___('/users/:id'), (req, res) => {\n  const id = req.___.___.;\n  res.___(200).json({ user: id });\n});"
    },
    codeDebugging: {
      title: "Middleware Chain Error",
      description: "Fix the middleware chain that's blocking request processing",
      sampleCode: "app.use((req, res, next) => {\n  console.log('Request received');\n  if (req.method === 'POST') {\n    res.status(405).send('Not allowed');\n  }\n});"
    }
  },
  
  json: {
    multipleChoice: {
      title: "Data Types",
      description: "Which of these is NOT a valid JSON data type?"
    },
    trueFalse: {
      title: "Syntax Rules",
      description: "JSON allows single quotes for string values. True or False?"
    },
    codeChallenge: {
      title: "Schema Validation",
      description: "Create a JSON schema that validates user profile data with required and optional fields"
    },
    fillInTheBlank: {
      title: "Object Structure",
      description: "Complete the JSON object",
      sampleCode: '{\n  ___: "John Doe",\n  "age": ___,\n  "active": ___,\n  "skills": [___, ___]\n}'
    },
    codeDebugging: {
      title: "JSON Syntax Error",
      description: "Fix the JSON syntax errors",
      sampleCode: "{\n  name: 'John',\n  age: 30,\n  hobbies: ['reading', 'coding',],\n  address: {\n    street: \"123 Main St\",\n    city: 'Boston'\n  }\n}"
    }
  }
};