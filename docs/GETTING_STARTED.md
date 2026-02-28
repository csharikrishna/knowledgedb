# 🚀 Getting Started with KnowledgeDB

Welcome to KnowledgeDB! This guide will walk you through setting up and using the complete platform, from installation to advanced features.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Authentication](#authentication)
6. [Core Features](#core-features)
7. [Admin Panel](#admin-panel)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git** (optional, for cloning)

Check your versions:
```bash
node --version  # Should be v16+
npm --version   # Should be 8+
```

---

## Installation

### Step 1: Navigate to Project Directory

```bash
cd c:\Users\cshar\Desktop\KDB\knowledgedb
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

**Key Dependencies Installed:**
- `express` - Web framework
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `uuid` - Unique ID generation
- `express-rate-limit` - Rate limiting for API endpoints

### Step 3: Install Frontend Dependencies

```bash
cd ../web-explorer
npm install
```

**Key Dependencies Installed:**
- `react` - UI framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `lucide-react` - Icons
- `recharts` - Charts for visualization

---

## Backend Setup

### Starting the Backend Server

1. **Navigate to server directory:**
   ```bash
   cd c:\Users\cshar\Desktop\KDB\knowledgedb\server
   ```

2. **Start the server:**
   ```bash
   node server.js
   ```

3. **Verify it's running:**
   You should see:
   ```
   Server running on http://localhost:5000
   ```

### Backend Architecture

The backend runs on **port 5000** and provides:

- **RESTful API** endpoints
- **JWT-based authentication** (7-day token expiry)
- **In-memory database** (file-based persistence)
- **Knowledge graph** extraction
- **Hybrid search** (vector + keyword)
- **Memory system** for context
- **GraphRAG** capabilities

### Available API Endpoints

#### Authentication (`/auth`)
```
POST   /auth/signup              - Create new account
POST   /auth/register            - Alias for signup
POST   /auth/login               - Login and get JWT token
GET    /auth/profile             - Get user profile (requires JWT)
POST   /auth/change-password     - Change password (requires JWT)
POST   /auth/forgot-password     - Request password reset
POST   /auth/reset-password      - Reset password with code
POST   /auth/api-keys            - Create API key
GET    /auth/api-keys            - List API keys
DELETE /auth/api-keys/:keyId     - Revoke API key
DELETE /auth/account             - Delete account
```

#### Database (`/db`)
```
POST   /db                       - Create database
GET    /db                       - List databases
DELETE /db/:dbName               - Delete database
POST   /db/:dbName/:collection   - Add document
GET    /db/:dbName/:collection   - Get documents
PUT    /db/:dbName/:collection/:id - Update document
DELETE /db/:dbName/:collection/:id - Delete document
```

#### Knowledge Graph (`/graph`)
```
POST   /graph/extract            - Extract graph from text
GET    /graph/:dbName            - Get knowledge graph
POST   /graph/:dbName/query      - Query graph
```

#### Hybrid Search (`/search`)
```
POST   /search/:dbName           - Hybrid search
```

#### Memory (`/memory`)
```
POST   /memory/store             - Store memory
GET    /memory/recall            - Recall memories
GET    /memory/list              - List all memories
DELETE /memory/:memoryId         - Delete memory
```

#### GraphRAG (`/graphrag`)
```
POST   /graphrag/ask             - Ask question with graph context
```

---

## Frontend Setup

### Starting the Web Explorer

1. **Navigate to frontend directory:**
   ```bash
   cd c:\Users\cshar\Desktop\KDB\knowledgedb\web-explorer
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   Open your browser to: **http://localhost:3000**

### Frontend Architecture

The web explorer runs on **port 3000** and includes:

- **7 Interactive Pages:**
  - Login/Signup with password recovery
  - Dashboard for database management
  - Graph Explorer for knowledge visualization
  - Search Interface for hybrid search
  - Memory Browser for context management
  - GraphRAG Tester for intelligent Q&A
  - Admin Panel for system management

- **React Router** for navigation
- **JWT Authentication** with localStorage
- **Axios HTTP Client** for API calls
- **Dark Theme** with professional styling
- **Responsive Design** for all screen sizes

---

## Authentication

### 1. Creating an Account

**Via UI:**
1. Open http://localhost:3000
2. Click "Create Account" on login page
3. Enter email and password (min 6 characters)
4. Click "Create Account"

**Via API:**
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

**Response:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

### 2. Logging In

**Via UI:**
1. Enter email and password
2. Click "Sign In"
3. You'll be redirected to the Dashboard

**Via API:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

### 3. Forgot Password Flow

**Step 1: Request Reset Code**

Via UI:
1. Click "Forgot password?" on login page
2. Enter your email
3. In development mode, you'll see the 6-digit code displayed

Via API:
```bash
curl -X POST http://localhost:5000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

Response:
```json
{
  "message": "Password reset code sent",
  "resetCode": "123456",  // Only in development
  "resetToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Step 2: Reset Password**

Via UI:
1. Enter the 6-digit code
2. Enter new password (twice for confirmation)
3. Click "Reset Password"

Via API:
```bash
curl -X POST http://localhost:5000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "resetCode": "123456",
    "newPassword": "newSecurePass123"
  }'
```

**Important Notes:**
- Reset codes expire after **15 minutes**
- Codes are **6 digits** (100000-999999)
- In production, codes would be sent via email
- After successful reset, you'll be redirected to login

### 4. Using Authentication

All authenticated requests need the JWT token:

**Header Format:**
```
Authorization: Bearer <your-jwt-token>
```

**Example:**
```bash
curl -X GET http://localhost:5000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Frontend Automatic Handling:**
The web explorer automatically stores the token in localStorage and includes it in all requests.

---

## Core Features

### 1. Database Management

**Creating a Database:**

Via UI (Dashboard):
1. Enter database name
2. Click "Create Database"

Via API:
```bash
curl -X POST http://localhost:5000/db \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"dbName": "my_knowledge_base"}'
```

**Adding Documents:**

```bash
curl -X POST http://localhost:5000/db/my_knowledge_base/articles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to AI",
    "content": "Artificial Intelligence is...",
    "tags": ["ai", "technology"]
  }'
```

### 2. Knowledge Graph Extraction

**Extract entities and relationships from text:**

Via UI (Graph Explorer):
1. Select a database
2. Enter text in the input area
3. Click "Extract Graph"
4. View nodes and edges in the visualization

Via API:
```bash
curl -X POST http://localhost:5000/graph/extract \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Apple Inc. was founded by Steve Jobs in California. The company produces iPhone.",
    "dbName": "my_knowledge_base"
  }'
```

**Response:**
```json
{
  "entities": [
    {"name": "Apple Inc.", "type": "ORGANIZATION"},
    {"name": "Steve Jobs", "type": "PERSON"},
    {"name": "California", "type": "LOCATION"},
    {"name": "iPhone", "type": "PRODUCT"}
  ],
  "relations": [
    {"from": "Apple Inc.", "to": "Steve Jobs", "type": "FOUNDED_BY"},
    {"from": "Apple Inc.", "to": "California", "type": "LOCATED_IN"},
    {"from": "Apple Inc.", "to": "iPhone", "type": "PRODUCES"}
  ]
}
```

### 3. Hybrid Search

Combines vector similarity and keyword matching:

Via UI (Search Interface):
1. Select database
2. Enter search query
3. Adjust weights (vector vs keyword)
4. View ranked results

Via API:
```bash
curl -X POST http://localhost:5000/search/my_knowledge_base \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning applications",
    "vectorWeight": 0.7,
    "keywordWeight": 0.3,
    "limit": 10
  }'
```

### 4. Memory System

Store and recall contextual information:

**Store Memory:**
```bash
curl -X POST http://localhost:5000/memory/store \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "User prefers technical explanations",
    "context": "conversation_preferences",
    "importance": 0.9
  }'
```

**Recall Memories:**
```bash
curl -X POST http://localhost:5000/memory/recall \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "user preferences",
    "limit": 5
  }'
```

### 5. GraphRAG (Graph-Augmented Retrieval)

Ask questions with knowledge graph context:

Via UI (GraphRAG Tester):
1. Select database
2. Enter your question
3. Click "Ask Question"
4. View answer with graph context

Via API:
```bash
curl -X POST http://localhost:5000/graphrag/ask \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "dbName": "my_knowledge_base",
    "question": "What products does Apple make?",
    "useMemory": true
  }'
```

---

## Admin Panel

The Admin Panel provides system-wide management:

### Features:

1. **User Management**
   - View all users
   - User activity statistics
   - Account management

2. **Database Statistics**
   - Total databases
   - Document counts
   - Storage usage

3. **System Monitoring**
   - API request rates
   - Error logs
   - Performance metrics

4. **API Key Management**
   - Create service API keys
   - View active keys
   - Revoke keys

### Access:
Navigate to **http://localhost:3000/admin** when logged in.

---

## Production Deployment

### Backend Deployment

1. **Environment Configuration:**

Create `.env` file:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-key-here-min-32-chars
DATA_DIR=./data
LOG_LEVEL=info
```

2. **Security Enhancements:**

```javascript
// Add to server/app.js
const helmet = require('helmet');
app.use(helmet());

// Enable CORS for your domain
const cors = require('cors');
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

3. **Start with PM2:**
```bash
npm install -g pm2
pm2 start server.js --name knowledgedb-api
pm2 save
pm2 startup
```

### Frontend Deployment

1. **Build production bundle:**
```bash
cd web-explorer
npm run build
```

2. **Serve with nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /path/to/web-explorer/build;
    index index.html;
    
    location / {
        try_files $uri /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Update API URL:**

In `web-explorer/src/config.js`:
```javascript
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://yourdomain.com/api'
  : 'http://localhost:5000';
```

### Production Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Set up email service for password reset codes
- [ ] Configure rate limiting (currently 5 req/min for auth)
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up CDN for frontend assets
- [ ] Enable compression (gzip/brotli)
- [ ] Configure firewall rules

---

## Troubleshooting

### Common Issues

#### 1. Backend Not Starting

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process-id> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

#### 2. Frontend Can't Connect to Backend

**Problem:** Network errors or CORS issues

**Solution:**
- Verify backend is running on port 5000
- Check browser console for errors
- Ensure no proxy/firewall blocking requests
- Verify axios baseURL in frontend code

#### 3. JWT Token Invalid

**Problem:** "Invalid or expired token"

**Solution:**
- Check token expiry (7 days by default)
- Clear localStorage: `localStorage.clear()`
- Log in again to get new token
- Verify JWT_SECRET matches between requests

#### 4. Password Reset Code Not Working

**Problem:** "Invalid or expired reset code"

**Solution:**
- Codes expire after 15 minutes
- Request new code
- Ensure email matches exactly
- Check code was entered correctly (6 digits)

#### 5. Database Errors

**Problem:** Cannot read/write to database

**Solution:**
- Check file permissions in `data/` directory
- Ensure adequate disk space
- Verify JSON files are not corrupted
- Restart backend server

### Debug Mode

Enable detailed logging:

**Backend:**
```javascript
// server/app.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**Frontend:**
```javascript
// Add to axios instance
axios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});
```

### Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review console logs (backend and frontend)
3. Verify all dependencies are installed
4. Ensure both servers are running
5. Check API endpoint documentation
6. Review error messages carefully

---

## Next Steps

Now that you're set up:

1. **Explore the Dashboard** - Create your first database
2. **Try Graph Extraction** - Input some text and see entities
3. **Test Search** - Add documents and search them
4. **Use Memory** - Store contextual information
5. **Ask Questions** - Try GraphRAG with your data
6. **Check Admin Panel** - Monitor system usage

### Additional Resources

- **API Documentation:** See `docs/API_DOCUMENTATION.md`
- **Architecture Guide:** See `docs/ARCHITECTURE.md`
- **Contributing:** See `CONTRIBUTING.md`

---

## Summary

You now have a fully functional KnowledgeDB platform with:

✅ **Complete authentication system** (signup, login, password reset)  
✅ **Database management** with CRUD operations  
✅ **Knowledge graph extraction** from text  
✅ **Hybrid search** combining vector and keyword matching  
✅ **Memory system** for contextual storage  
✅ **GraphRAG** for intelligent Q&A  
✅ **Professional web interface** with dark theme  
✅ **Production-ready architecture**

All endpoints are working and ready for users! 🎉

---

**Last Updated:** 2024
**Version:** 1.0.0
**License:** MIT
