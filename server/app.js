require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { defaultLimiter } = require('./middleware/rateLimiter');
const { initDataFiles } = require('./utils/fileHandler');

// Initialize data directory and files
initDataFiles();

const app = express();

// ------- Middleware Stack -------
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(defaultLimiter);

// Response time header
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Log response time instead of setting header after response is sent
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${req.method}] ${req.path} - ${duration}ms`);
    }
  });
  next();
});

// ------- Routes -------
app.use('/auth', require('./routes/auth'));

// Mount more specific /db routes first (graph, search, memory, webhooks, etc.)
app.use('/db', require('./routes/graph'));
app.use('/db', require('./routes/search'));
app.use('/db', require('./routes/vectors')); // Vector search and enhanced hybrid search
app.use('/db', require('./routes/memory'));
app.use('/db', require('./routes/webhooks'));
app.use('/db', require('./routes/triggers'));
app.use('/db', require('./routes/analytics'));
app.use('/db', require('./routes/public'));
app.use('/db', require('./routes/crud'));
// Database routes last (has catch-all /:dbName)
app.use('/db', require('./routes/database'));
app.use('/admin', require('./routes/admin'));

// Public collection read endpoint (also mounted at root)
const publicRouter = require('./routes/public');
app.get('/public/:userId/:dbName/:collection', (req, res) => {
  const { readJSON, getPublicPath, getCollectionPath } = require('./utils/fileHandler');
  const { userId, dbName, collection } = req.params;
  const publicPath = getPublicPath(userId, dbName);
  const publicConfig = readJSON(publicPath) || {};

  if (!publicConfig[collection]) {
    return res.status(404).json({ error: 'This collection is not publicly accessible' });
  }

  const { fields } = publicConfig[collection];
  const collPath = getCollectionPath(userId, dbName, collection);
  const documents = readJSON(collPath) || [];

  const projected = documents.map(doc => {
    const result = {};
    for (const field of fields) {
      if (doc.hasOwnProperty(field)) result[field] = doc[field];
    }
    return result;
  });

  res.json({ documents: projected });
});

// Health check
const adminCtrl = require('./controllers/adminController');
app.get('/health', adminCtrl.health);

// ------- Welcome -------
app.get('/', (req, res) => {
  res.json({
    name: 'KnowledgeDB',
    version: '1.0.0',
    description: 'Self-hostable NoSQL Database-as-a-Service with Knowledge Graph, Hybrid Search, AI Agent Memory & Real-Time Events',
    docs: '/health',
    endpoints: {
      auth: '/auth/signup, /auth/login',
      databases: '/db/create, /db/list',
      crud: '/db/:userId/:dbName/:collection/insert|find|update|delete',
      graph: '/db/:userId/:dbName/graph/nodes|edges|traverse|path|link',
      search: '/db/:userId/:dbName/search',
      memory: '/db/:userId/:dbName/memory/remember|recall|forget',
      ask: '/db/:userId/:dbName/ask',
      admin: '/admin/login, /admin/stats'
    }
  });
});

// ------- Error Handler -------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

module.exports = app;
