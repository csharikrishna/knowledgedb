/**
 * Vector and Enhanced Search Routes
 * Provides semantic search, vector similarity, and AI-powered retrieval
 */

const router = require('express').Router();
const enhancedSearchCtrl = require('../controllers/enhancedSearchController');
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const { validate } = require('../middleware/validator');

const injectUser = (req, res, next) => {
  if (!req.params.userId && req.user) req.params.userId = req.user.userId;
  next();
};

// ========= VECTOR SEARCH - JWT Routes =========
/**
 * POST /:dbName/vector/search
 * Semantic search using vector embeddings
 */
router.post('/:dbName/vector/search', jwtMiddleware, injectUser, enhancedSearchCtrl.vectorSearch);

/**
 * POST /:dbName/hybrid/enhanced
 * Enhanced hybrid search: keyword + graph + vector with custom weights
 */
router.post('/:dbName/hybrid/enhanced', jwtMiddleware, injectUser, enhancedSearchCtrl.enhancedHybridSearch);

/**
 * POST /:dbName/:collection/similar
 * Find semantically similar documents
 */
router.post('/:dbName/:collection/similar', jwtMiddleware, injectUser, enhancedSearchCtrl.findSimilarDocuments);

/**
 * POST /:dbName/:collection/index/build
 * Build/rebuild vector indexes for a collection
 */
router.post('/:dbName/:collection/index/build', jwtMiddleware, injectUser, enhancedSearchCtrl.buildVectorIndex);

/**
 * GET /:dbName/:collection/index/stats
 * Get index statistics for a collection
 */
router.get('/:dbName/:collection/index/stats', jwtMiddleware, injectUser, enhancedSearchCtrl.getIndexStats);

/**
 * GET /:dbName/:collection/embeddings/export
 * Export embeddings in JSON or CSV format
 */
router.get('/:dbName/:collection/embeddings/export', jwtMiddleware, injectUser, enhancedSearchCtrl.exportEmbeddings);

/**
 * POST /:dbName/retrieve-for-llm
 * Retrieve context optimized for LLM consumption (RAG pipeline)
 */
router.post('/:dbName/retrieve-for-llm', jwtMiddleware, injectUser, enhancedSearchCtrl.retrieveForLLM);

// ========= VECTOR SEARCH - API Key Routes =========
/**
 * POST /:userId/:dbName/vector/search
 * API key-based semantic search
 */
router.post('/:userId/:dbName/vector/search', 
  apiKeyMiddleware('read'), 
  validate('search'), 
  enhancedSearchCtrl.vectorSearch
);

/**
 * POST /:userId/:dbName/hybrid/enhanced
 * API key-based enhanced hybrid search
 */
router.post('/:userId/:dbName/hybrid/enhanced', 
  apiKeyMiddleware('read'), 
  validate('search'), 
  enhancedSearchCtrl.enhancedHybridSearch
);

/**
 * POST /:userId/:dbName/:collection/similar
 * API key-based similar document search
 */
router.post('/:userId/:dbName/:collection/similar', 
  apiKeyMiddleware('read'), 
  enhancedSearchCtrl.findSimilarDocuments
);

/**
 * POST /:userId/:dbName/:collection/index/build
 * API key-based index building
 */
router.post('/:userId/:dbName/:collection/index/build', 
  apiKeyMiddleware('write'), 
  enhancedSearchCtrl.buildVectorIndex
);

/**
 * GET /:userId/:dbName/:collection/index/stats
 * API key-based index statistics
 */
router.get('/:userId/:dbName/:collection/index/stats', 
  apiKeyMiddleware('read'), 
  enhancedSearchCtrl.getIndexStats
);

/**
 * GET /:userId/:dbName/:collection/embeddings/export
 * API key-based embeddings export
 */
router.get('/:userId/:dbName/:collection/embeddings/export', 
  apiKeyMiddleware('read'), 
  enhancedSearchCtrl.exportEmbeddings
);

/**
 * POST /:userId/:dbName/retrieve-for-llm
 * API key-based LLM context retrieval
 */
router.post('/:userId/:dbName/retrieve-for-llm', 
  apiKeyMiddleware('read'), 
  validate('search'), 
  enhancedSearchCtrl.retrieveForLLM
);

module.exports = router;
