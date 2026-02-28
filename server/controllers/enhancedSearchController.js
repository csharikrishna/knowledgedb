/**
 * Enhanced Search Controller
 * Integrates vector embeddings with keyword and graph search
 * Provides semantic search capabilities for AI-powered retrieval
 */

const BM25Engine = require('../utils/bm25Engine');
const VectorEngine = require('../utils/vectorEngine');
const IndexManager = require('../utils/indexManager');
const { fuseScores } = require('../utils/hybridSearch');
const { graphScore, bfsTraverse } = require('../utils/graphEngine');
const { readJSON, getCollectionPath, getGraphPath, listFiles, getDbDir } = require('../utils/fileHandler');

const bm25 = new BM25Engine();
const vectorEngine = new VectorEngine();
const indexManager = new IndexManager();

/**
 * Vector-based semantic search
 */
exports.vectorSearch = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { query, collections = null, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const dbDir = getDbDir(userId, dbName);
    const allFiles = listFiles(dbDir).filter(f => f.endsWith('.json'));
    const collectionNames = collections || allFiles.map(f => f.replace('.json', ''));

    // Perform vector search on each collection
    const allResults = [];
    collectionNames.forEach(coll => {
      const searchResults = indexManager.vectorSearch(userId, dbName, coll, query, limit);
      if (searchResults.results) {
        allResults.push({
          collection: coll,
          results: searchResults.results.slice(0, limit),
          queryKeywords: searchResults.queryKeywords
        });
      }
    });

    // Merge and rank results across collections
    const mergedResults = [];
    for (const collResult of allResults) {
      for (const result of collResult.results) {
        mergedResults.push({
          ...result,
          collection: collResult.collection,
          similarity: result.similarity,
          type: 'vector'
        });
      }
    }

    // Sort by similarity and return top K
    const finalResults = mergedResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    res.json({
      results: finalResults,
      total: finalResults.length,
      searchType: 'vector-semantic'
    });
  } catch (err) {
    res.status(500).json({ error: 'Vector search failed', details: err.message });
  }
};

/**
 * Enhanced hybrid search: keyword + graph + vector
 */
exports.enhancedHybridSearch = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { query, collections = null, weightVector = 0.4, weightKeyword = 0.3, weightGraph = 0.3, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const dbDir = getDbDir(userId, dbName);
    const allFiles = listFiles(dbDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
    const collectionNames = collections || allFiles.map(f => f.replace('.json', ''));

    // Gather documents
    const allDocs = [];
    for (const coll of collectionNames) {
      const docs = readJSON(getCollectionPath(userId, dbName, coll)) || [];
      docs.forEach(doc => allDocs.push({ ...doc, _collection: coll }));
    }

    if (allDocs.length === 0) {
      return res.json({ results: [], total: 0, breakdown: {} });
    }

    const graph = readJSON(getGraphPath(userId, dbName)) || { nodes: [], edges: [] };

    // 1. Keyword search (BM25)
    const kwResults = bm25.score(query, allDocs, limit * 2);
    const keyword_scores = new Map(kwResults.map(r => [r.doc._id, r.score]));

    // 2. Graph search
    const grResults = graphScore(query, graph, allDocs, limit * 2);
    const graph_scores = new Map(grResults.map(r => [r.doc._id, r.score]));

    // 3. Vector search
    const vectorScores = new Map();
    collectionNames.forEach(coll => {
      const vectorResults = indexManager.vectorSearch(userId, dbName, coll, query, limit * 2);
      vectorResults.results.forEach(r => {
        vectorScores.set(r.docId, r.similarity);
      });
    });

    // Combine scores with weighted fusion
    const docIds = new Set([
      ...keyword_scores.keys(),
      ...graph_scores.keys(),
      ...vectorScores.keys()
    ]);

    const combinedResults = Array.from(docIds).map(docId => {
      const doc = allDocs.find(d => d._id === docId);
      if (!doc) return null;

      const kwScore = keyword_scores.get(docId) || 0;
      const grScore = graph_scores.get(docId) || 0;
      const vecScore = vectorScores.get(docId) || 0;

      // Normalize scores to 0-1 range
      const normalizedKw = Math.min(1, kwScore / 10);
      const normalizedGr = Math.min(1, grScore / 10);
      const normalizedVec = Math.min(1, vecScore);

      // Weighted combination
      const hybridScore = (
        normalizedKw * weightKeyword +
        normalizedGr * weightGraph +
        normalizedVec * weightVector
      );

      return {
        document: doc,
        collection: doc._collection,
        scores: {
          keyword: Math.round(normalizedKw * 100),
          graph: Math.round(normalizedGr * 100),
          vector: Math.round(normalizedVec * 100),
          hybrid: Math.round(hybridScore * 100)
        },
        hybridScore
      };
    })
      .filter(r => r !== null)
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, limit);

    // Clean results
    combinedResults.forEach(r => {
      if (r.document) delete r.document._collection;
    });

    res.json({
      results: combinedResults,
      total: combinedResults.length,
      breakdown: {
        keyword: weightKeyword * 100,
        graph: weightGraph * 100,
        vector: weightVector * 100
      },
      searchType: 'enhanced-hybrid'
    });
  } catch (err) {
    res.status(500).json({ error: 'Enhanced search failed', details: err.message });
  }
};

/**
 * Semantic similarity between documents
 */
exports.findSimilarDocuments = (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    const { docId, limit = 5 } = req.body;

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];

    const recommendations = indexManager.getRecommendations(
      userId,
      dbName,
      collection,
      documents,
      docId,
      limit
    );

    if (recommendations.error) {
      return res.status(404).json(recommendations);
    }

    // Enrich with actual documents
    const enriched = recommendations.recommendations.map(r => {
      const doc = documents.find(d => d._id === r.docId);
      return {
        docId: r.docId,
        similarity: r.similarity,
        keywords: r.keywords,
        document: doc ? { ...doc } : null
      };
    });

    res.json({
      baseDocId,
      similarDocuments: enriched,
      count: enriched.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Similarity search failed', details: err.message });
  }
};

/**
 * Build/rebuild vector indexes for faster search
 */
exports.buildVectorIndex = (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;

    const collPath = getCollectionPath(userId, dbName, collection);
    const documents = readJSON(collPath) || [];

    if (documents.length === 0) {
      return res.status(400).json({ error: 'No documents in collection' });
    }

    // Rebuild indexes
    const result = indexManager.rebuildIndexes(userId, dbName, collection, documents);

    res.json({
      message: 'Vector index built successfully',
      collection,
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: 'Index building failed', details: err.message });
  }
};

/**
 * Get index statistics
 */
exports.getIndexStats = (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;

    const stats = indexManager.getIndexStats(userId, dbName, collection);

    res.json({
      collection,
      indexes: stats
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats', details: err.message });
  }
};

/**
 * Export embeddings for ML/analysis
 */
exports.exportEmbeddings = (req, res) => {
  try {
    const { userId, dbName, collection } = req.params;
    const { format = 'json' } = req.query;

    const embeddings = indexManager.exportEmbeddings(userId, dbName, collection, format);

    if (!embeddings) {
      return res.status(404).json({ error: 'No embeddings found for collection' });
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${collection}_embeddings.csv"`);
      res.send(embeddings);
    } else {
      res.json(embeddings);
    }
  } catch (err) {
    res.status(500).json({ error: 'Export failed', details: err.message });
  }
};

/**
 * AI-powered RAG (Retrieval Augmented Generation)
 * Returns structured context chunks for LLM consumption
 */
exports.retrieveForLLM = (req, res) => {
  try {
    const { userId, dbName } = req.params;
    const { query, contextLimit = 10, collections = null } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const dbDir = getDbDir(userId, dbName);
    const allFiles = listFiles(dbDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
    const collectionNames = collections || allFiles.map(f => f.replace('.json', ''));

    // Gather documents
    const allDocs = [];
    for (const coll of collectionNames) {
      const docs = readJSON(getCollectionPath(userId, dbName, coll)) || [];
      docs.forEach(doc => allDocs.push({ ...doc, _collection: coll }));
    }

    // Perform enhanced hybrid search for context
    const contextChunks = [];

    // 1. Vector semantic search
    collectionNames.forEach(coll => {
      const vectorResults = indexManager.vectorSearch(userId, dbName, coll, query, contextLimit);
      vectorResults.results.forEach((result, idx) => {
        const doc = allDocs.find(d => d._id === result.docId && d._collection === coll);
        if (doc) {
          contextChunks.push({
            text: JSON.stringify(doc, null, 2),
            source: `${coll}/${result.docId}`,
            relevance: result.similarity,
            type: 'vector',
            keywords: result.keywords,
            rank: idx + 1
          });
        }
      });
    });

    // 2. Keyword search for additional context
    const kwResults = bm25.score(query, allDocs, contextLimit);
    kwResults.forEach((result, idx) => {
      if (!contextChunks.find(c => c.source.includes(result.doc._id))) {
        contextChunks.push({
          text: JSON.stringify(result.doc, null, 2),
          source: `${result.doc._collection}/${result.doc._id}`,
          relevance: result.score / 10,
          type: 'keyword',
          rank: idx + 1
        });
      }
    });

    // Sort by relevance and limit
    const finalContext = contextChunks
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, contextLimit);

    // Format for LLM prompt
    const llmContext = finalContext
      .map((chunk, i) => `[Context ${i + 1}] (${chunk.type}, relevance: ${Math.round(chunk.relevance * 100)}%)\n${chunk.text}`)
      .join('\n\n---\n\n');

    res.json({
      query,
      contextChunks: finalContext,
      llmPromptContext: llmContext,
      usage: 'Use llmPromptContext as system context for your LLM. contextChunks array provides structured data.',
      chunkCount: finalContext.length,
      averageRelevance: Math.round(
        finalContext.reduce((sum, c) => sum + c.relevance, 0) / finalContext.length * 100
      )
    });
  } catch (err) {
    res.status(500).json({ error: 'RAG retrieval failed', details: err.message });
  }
};
