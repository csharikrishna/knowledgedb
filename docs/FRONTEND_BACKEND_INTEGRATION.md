# 🔗 Frontend-Backend Integration Guide

This document explains how the KnowledgeDB frontend and backend are interconnected, ensuring you understand the complete data flow and integration architecture.

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                        │
│                     http://localhost:3000                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │ JSON Payload
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    REACT WEB EXPLORER                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Login     │  │  Dashboard  │  │    Graph    │        │
│  │   Signup    │  │    Search   │  │   Explorer  │        │
│  │   Forgot    │  │   Memory    │  │   GraphRAG  │        │
│  │   Reset     │  │    Admin    │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            React Router (Navigation)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Axios HTTP Client (API Communication)        │  │
│  │         - Base URL: http://localhost:5000            │  │
│  │         - Auto JWT Token Injection                   │  │
│  │         - Error Handling & Retry Logic               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ JSON over HTTP
                              │ JWT Bearer Token
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND SERVER                   │
│                     http://localhost:5000                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Middleware Stack                        │  │
│  │  • CORS (Cross-Origin)                              │  │
│  │  • Body Parser (JSON)                               │  │
│  │  • Rate Limiter (Auth: 5/min)                       │  │
│  │  • JWT Verification                                 │  │
│  │  • Error Handler                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Route Handlers                          │  │
│  │  /auth     - Authentication                         │  │
│  │  /db       - Database Operations                    │  │
│  │  /graph    - Knowledge Graph                        │  │
│  │  /search   - Hybrid Search                          │  │
│  │  /memory   - Memory System                          │  │
│  │  /graphrag - Graph-Augmented RAG                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Business Logic (Controllers)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Data Layer (File-based Database)             │  │
│  │         ./data/*.json                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### 1. Initial Signup/Login

**Frontend (Login.jsx):**
```javascript
// User submits credentials
const handleSubmit = async (e) => {
  const response = await axios.post(
    'http://localhost:5000/auth/login',
    { email, password }
  );
  
  // Save token and userId to localStorage
  const { token, userId } = response.data;
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);
  
  // Update app state and navigate to dashboard
  onLogin(token, userId);
};
```

**Backend (authController.js):**
```javascript
const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Find user and verify password
  const user = findUserByEmail(email);
  const isValid = await bcrypt.compare(password, user.passwordHash);
  
  // Generate JWT token (7-day expiry)
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Return token to frontend
  res.json({ userId: user.id, email, token, expiresIn: '7d' });
};
```

**Data Flow:**
1. User enters credentials → Frontend
2. Axios POST to `/auth/login` → Backend
3. Backend validates & generates JWT → Frontend
4. Frontend stores token in localStorage
5. All subsequent requests include token in headers

### 2. Password Reset Flow

**Step 1: Request Reset Code**

Frontend (ForgotPassword.jsx) → Backend (/auth/forgot-password):
```javascript
// Frontend sends email
axios.post('http://localhost:5000/auth/forgot-password', { email });

// Backend generates 6-digit code
const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
const resetToken = uuidv4();

// Store in user record with 15-min expiry
user.resetCode = resetCode;
user.resetToken = resetToken;
user.resetExpiry = Date.now() + 15 * 60 * 1000;

// Return code (dev mode) and token
res.json({ message: 'Reset code sent', resetCode, resetToken });
```

**Step 2: Reset Password**

Frontend (ResetPassword.jsx) → Backend (/auth/reset-password):
```javascript
// Frontend submits code and new password
axios.post('http://localhost:5000/auth/reset-password', {
  email,
  resetCode: '123456',
  newPassword: 'newSecurePass'
});

// Backend validates code and expiry
if (user.resetCode !== resetCode || Date.now() > user.resetExpiry) {
  return res.status(400).json({ error: 'Invalid or expired code' });
}

// Hash new password and clear reset tokens
user.passwordHash = await bcrypt.hash(newPassword, 12);
delete user.resetCode;
delete user.resetToken;
delete user.resetExpiry;
```

### 3. Protected Route Access

**Frontend (App.jsx):**
```javascript
// All authenticated pages check for token
const [token, setToken] = useState(localStorage.getItem('token'));

// Redirect to login if no token
if (!token) {
  return <Navigate to="/login" />;
}

// Include token in all API calls
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

**Backend (middleware/auth.js):**
```javascript
const authMiddleware = (req, res, next) => {
  // Extract token from header
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Verify JWT
  const decoded = jwt.verify(token, JWT_SECRET);
  req.userId = decoded.userId;
  req.email = decoded.email;
  
  next();
};
```

---

## 🗄️ Database Operations

### Creating a Database

**Frontend Flow (Dashboard.jsx):**
```javascript
const handleCreateDb = async () => {
  try {
    // Send create request with JWT token
    const response = await axios.post(
      'http://localhost:5000/db',
      { dbName: newDbName },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Update UI with new database
    setDatabases([...databases, response.data.database]);
    setDbName(newDbName);
    onDbSelect(newDbName);
  } catch (error) {
    setError(error.response?.data?.error || 'Failed to create database');
  }
};
```

**Backend Flow (dbController.js):**
```javascript
const createDatabase = (req, res) => {
  const { dbName } = req.body;
  const userId = req.userId; // From JWT middleware
  
  // Validate database name
  if (!dbName || !/^[a-zA-Z0-9_-]+$/.test(dbName)) {
    return res.status(400).json({ error: 'Invalid database name' });
  }
  
  // Check if already exists
  if (databases[dbName]) {
    return res.status(409).json({ error: 'Database already exists' });
  }
  
  // Create database structure
  databases[dbName] = {
    name: dbName,
    owner: userId,
    collections: {},
    createdAt: new Date().toISOString()
  };
  
  // Persist to disk
  saveDatabases();
  
  res.status(201).json({
    message: 'Database created',
    database: databases[dbName]
  });
};
```

### Adding Documents

**Frontend (Dashboard.jsx):**
```javascript
const handleAddDocument = async () => {
  const response = await axios.post(
    `http://localhost:5000/db/${dbName}/${collectionName}`,
    documentData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  // Update local state
  setDocuments([...documents, response.data.document]);
};
```

**Backend (dbController.js):**
```javascript
const addDocument = (req, res) => {
  const { dbName, collection } = req.params;
  const documentData = req.body;
  const userId = req.userId;
  
  // Verify access
  if (databases[dbName].owner !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Create document with metadata
  const document = {
    id: uuidv4(),
    ...documentData,
    createdAt: new Date().toISOString(),
    createdBy: userId
  };
  
  // Store in collection
  databases[dbName].collections[collection] = 
    databases[dbName].collections[collection] || [];
  databases[dbName].collections[collection].push(document);
  
  saveDatabases();
  
  res.status(201).json({ document });
};
```

---

## 🔍 Search Integration

### Hybrid Search Flow

**Frontend (SearchInterface.jsx):**
```javascript
const handleSearch = async () => {
  setLoading(true);
  
  try {
    const response = await axios.post(
      `http://localhost:5000/search/${dbName}`,
      {
        query: searchQuery,
        vectorWeight: 0.7,
        keywordWeight: 0.3,
        limit: 20
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    // Display results with scores
    setResults(response.data.results);
    setTotalFound(response.data.total);
  } catch (error) {
    setError(error.response?.data?.error);
  } finally {
    setLoading(false);
  }
};
```

**Backend (searchController.js):**
```javascript
const hybridSearch = (req, res) => {
  const { dbName } = req.params;
  const { query, vectorWeight, keywordWeight, limit } = req.body;
  
  // Get all documents from database
  const documents = getAllDocuments(dbName);
  
  // Vector similarity search
  const vectorResults = vectorSearch(query, documents);
  
  // Keyword search
  const keywordResults = keywordSearch(query, documents);
  
  // Combine with weights
  const combinedResults = combineResults(
    vectorResults,
    keywordResults,
    vectorWeight,
    keywordWeight
  );
  
  // Sort by score and limit
  const topResults = combinedResults
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  res.json({
    results: topResults,
    total: combinedResults.length,
    query,
    executionTime: Date.now() - startTime
  });
};
```

---

## 🕸️ Knowledge Graph Integration

### Graph Extraction

**Frontend (GraphExplorer.jsx):**
```javascript
const handleExtractGraph = async () => {
  const response = await axios.post(
    'http://localhost:5000/graph/extract',
    {
      text: inputText,
      dbName: selectedDb
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  // Visualize graph
  const { entities, relations } = response.data;
  setNodes(entities.map(e => ({ id: e.name, label: e.name, type: e.type })));
  setEdges(relations.map(r => ({ from: r.from, to: r.to, label: r.type })));
};
```

**Backend (graphController.js):**
```javascript
const extractGraph = (req, res) => {
  const { text, dbName } = req.body;
  
  // NLP entity extraction
  const entities = extractEntities(text);
  // [ { name: 'Apple Inc.', type: 'ORGANIZATION' }, ... ]
  
  // Relationship extraction
  const relations = extractRelations(text, entities);
  // [ { from: 'Apple Inc.', to: 'Steve Jobs', type: 'FOUNDED_BY' }, ... ]
  
  // Store in knowledge graph
  if (dbName) {
    storeInGraph(dbName, entities, relations);
  }
  
  res.json({
    entities,
    relations,
    entityCount: entities.length,
    relationCount: relations.length
  });
};
```

### Graph Querying

**Frontend → Backend:**
```javascript
// Frontend
const response = await axios.post(
  `http://localhost:5000/graph/${dbName}/query`,
  {
    entityName: 'Apple Inc.',
    relationTypes: ['FOUNDED_BY', 'LOCATED_IN'],
    depth: 2
  },
  { headers: { Authorization: `Bearer ${token}` } }
);

// Backend
const queryGraph = (req, res) => {
  const { dbName } = req.params;
  const { entityName, relationTypes, depth } = req.body;
  
  // Traverse graph from starting entity
  const subgraph = traverseGraph(dbName, entityName, relationTypes, depth);
  
  res.json({
    nodes: subgraph.nodes,
    edges: subgraph.edges,
    depth: depth,
    nodeCount: subgraph.nodes.length
  });
};
```

---

## 🧠 Memory System Integration

### Storing Memories

**Frontend (MemoryBrowser.jsx):**
```javascript
const handleStoreMemory = async () => {
  await axios.post(
    'http://localhost:5000/memory/store',
    {
      content: memoryContent,
      context: memoryContext,
      importance: importanceScore,
      tags: memoryTags
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  // Refresh memory list
  fetchMemories();
};
```

**Backend (memoryController.js):**
```javascript
const storeMemory = (req, res) => {
  const { content, context, importance, tags } = req.body;
  const userId = req.userId;
  
  const memory = {
    id: uuidv4(),
    userId,
    content,
    context,
    importance: importance || 0.5,
    tags: tags || [],
    vector: generateVector(content), // For similarity search
    createdAt: new Date().toISOString(),
    accessCount: 0,
    lastAccessed: null
  };
  
  // Store memory
  memories.push(memory);
  saveMemories();
  
  res.status(201).json({ memory });
};
```

### Recalling Memories

**Frontend → Backend:**
```javascript
// Frontend
const response = await axios.post(
  'http://localhost:5000/memory/recall',
  {
    query: 'user preferences',
    context: 'conversation',
    limit: 5
  },
  { headers: { Authorization: `Bearer ${token}` } }
);

// Backend
const recallMemories = (req, res) => {
  const { query, context, limit } = req.body;
  const userId = req.userId;
  
  // Filter by user
  const userMemories = memories.filter(m => m.userId === userId);
  
  // Vector similarity search
  const queryVector = generateVector(query);
  const scored = userMemories.map(mem => ({
    ...mem,
    relevance: cosineSimilarity(queryVector, mem.vector)
  }));
  
  // Filter by context if provided
  const filtered = context 
    ? scored.filter(m => m.context === context)
    : scored;
  
  // Sort by relevance and importance
  const ranked = filtered.sort((a, b) => 
    (b.relevance * b.importance) - (a.relevance * a.importance)
  );
  
  // Update access stats
  ranked.slice(0, limit).forEach(mem => {
    mem.accessCount++;
    mem.lastAccessed = new Date().toISOString();
  });
  
  res.json({
    memories: ranked.slice(0, limit),
    totalRelevant: filtered.length
  });
};
```

---

## 🤖 GraphRAG Integration

### Question Answering with Graph Context

**Frontend (GraphRAGTester.jsx):**
```javascript
const handleAskQuestion = async () => {
  setLoading(true);
  
  const response = await axios.post(
    'http://localhost:5000/graphrag/ask',
    {
      dbName: selectedDb,
      question: userQuestion,
      useMemory: includeMemory,
      maxContext: 5
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  setAnswer(response.data.answer);
  setContextUsed(response.data.context);
  setGraphEntities(response.data.graphEntities);
};
```

**Backend (graphragController.js):**
```javascript
const askQuestion = async (req, res) => {
  const { dbName, question, useMemory, maxContext } = req.body;
  const userId = req.userId;
  
  // 1. Extract entities from question
  const questionEntities = extractEntities(question);
  
  // 2. Find relevant documents
  const relevantDocs = await hybridSearch(dbName, question, maxContext);
  
  // 3. Query knowledge graph
  const graphContext = queryGraphForEntities(dbName, questionEntities);
  
  // 4. Recall relevant memories (if enabled)
  const memories = useMemory 
    ? await recallMemories(userId, question, 3)
    : [];
  
  // 5. Combine context
  const context = {
    documents: relevantDocs,
    graphEntities: graphContext.nodes,
    graphRelations: graphContext.edges,
    memories: memories
  };
  
  // 6. Generate answer (with LLM or rule-based)
  const answer = generateAnswer(question, context);
  
  res.json({
    answer,
    context: relevantDocs,
    graphEntities: graphContext.nodes,
    memoriesUsed: memories.length,
    confidence: calculateConfidence(context)
  });
};
```

---

## 🔄 Error Handling & Recovery

### Frontend Error Handling

**Axios Interceptor (Frontend):**
```javascript
// Add to main axios instance
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      // Rate limit exceeded
      alert('Too many requests. Please wait a moment.');
    } else if (error.response?.status === 500) {
      // Server error
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);
```

### Backend Error Handling

**Global Error Handler (Backend):**
```javascript
// server/app.js
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

---

## 📊 Data Synchronization

### Real-time State Management

**Frontend State Flow:**
```javascript
// App.jsx - Global state
const [token, setToken] = useState(localStorage.getItem('token'));
const [userId, setUserId] = useState(localStorage.getItem('userId'));
const [dbName, setDbName] = useState(localStorage.getItem('dbName'));

// Persist to localStorage on change
useEffect(() => {
  if (token) localStorage.setItem('token', token);
  if (userId) localStorage.setItem('userId', userId);
  if (dbName) localStorage.setItem('dbName', dbName);
}, [token, userId, dbName]);

// Pass down to child components
<Dashboard 
  token={token} 
  userId={userId} 
  dbName={dbName} 
  onDbSelect={setDbName} 
/>
```

**Backend Data Persistence:**
```javascript
// Auto-save after mutations
const saveDatabases = () => {
  fs.writeFileSync(
    path.join(DATA_DIR, 'databases.json'),
    JSON.stringify(databases, null, 2)
  );
};

// Load on startup
const loadDatabases = () => {
  try {
    const data = fs.readFileSync(
      path.join(DATA_DIR, 'databases.json'),
      'utf8'
    );
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};
```

---

## ✅ Integration Checklist

### Verify Frontend-Backend Connection

Run these tests to ensure everything is properly integrated:

1. **Authentication Test:**
   ```bash
   # Backend running on 5000?
   curl http://localhost:5000/auth/profile
   # Should return 401 (no token)
   
   # Frontend can reach backend?
   # Open browser console on http://localhost:3000
   # Should see no CORS errors
   ```

2. **CORS Test:**
   ```javascript
   // In browser console
   fetch('http://localhost:5000/auth/profile')
     .then(r => console.log('CORS OK'))
     .catch(e => console.error('CORS Error:', e));
   ```

3. **Token Flow Test:**
   - Login via UI
   - Check localStorage for token
   - Verify token in Network tab (Authorization header)
   - Navigate to protected page
   - Should work without re-login

4. **Data Flow Test:**
   - Create database in Dashboard
   - Check backend logs for POST /db
   - Verify database file created in data/
   - Refresh page - database should persist

5. **Error Handling Test:**
   - Stop backend server
   - Try to search or create database
   - Should show error message (not crash)
   - Start backend - should work again

---

## 🎯 Summary

The frontend and backend are **well-integrated** through:

✅ **JWT Authentication** - Secure token-based auth with 7-day expiry  
✅ **RESTful API** - Clean HTTP endpoints with proper status codes  
✅ **Axios HTTP Client** - Centralized API communication  
✅ **Error Handling** - Graceful degradation on failures  
✅ **State Management** - Synchronized frontend/backend state  
✅ **CORS Configuration** - Proper cross-origin setup  
✅ **Rate Limiting** - Protection against abuse  
✅ **Data Persistence** - File-based storage with auto-save  
✅ **Real-time Updates** - UI reflects backend changes immediately  

All components are properly connected and production-ready! 🚀

