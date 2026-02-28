/**
 * Index Manager
 * Manages all types of indexes: vector indexes, field indexes, and full-text indexes
 * Provides fast lookup and retrieval operations
 */

const VectorEngine = require('./vectorEngine');
const { readJSON, writeJSON, getVectorIndexPath, getFieldIndexPath } = require('./fileHandler');

class IndexManager {
  constructor() {
    this.vectorEngine = new VectorEngine();
  }

  /**
   * Create or update vector index for a collection
   */
  createVectorIndex(userId, dbName, collection, documents) {
    const vectorIndex = documents
      .filter(doc => doc && typeof doc === 'object')
      .map(doc => this.vectorEngine.batchEmbed([doc])[0])
      .filter(item => item && item.embedding);

    const indexPath = getVectorIndexPath(userId, dbName, collection);
    writeJSON(indexPath, {
      collection,
      createdAt: new Date().toISOString(),
      documentCount: vectorIndex.length,
      vectors: vectorIndex,
      stats: this.vectorEngine.getEmbeddingStats(vectorIndex.map(v => v.embedding))
    });

    return vectorIndex;
  }

  /**
   * Create field indexes for faster filtering
   */
  createFieldIndex(userId, dbName, collection, documents) {
    const fieldIndex = {};

    documents.forEach(doc => {
      if (!doc || typeof doc !== 'object') return;

      Object.keys(doc).forEach(field => {
        if (field.startsWith('_')) return; // Skip metadata fields
        if (!fieldIndex[field]) {
          fieldIndex[field] = new Map();
        }

        const value = doc[field];
        const valueKey = JSON.stringify(value);
        
        if (!fieldIndex[field].has(valueKey)) {
          fieldIndex[field].set(valueKey, []);
        }
        fieldIndex[field].get(valueKey).push(doc._id);
      });
    });

    // Convert Maps to objects for JSON serialization
    const serialized = {};
    Object.keys(fieldIndex).forEach(field => {
      serialized[field] = {};
      fieldIndex[field].forEach((docIds, value) => {
        serialized[field][value] = docIds;
      });
    });

    const indexPath = getFieldIndexPath(userId, dbName, collection);
    writeJSON(indexPath, {
      collection,
      createdAt: new Date().toISOString(),
      documentCount: documents.length,
      fields: serialized,
      indexedFields: Object.keys(serialized)
    });

    return serialized;
  }

  /**
   * Vector similarity search on a collection
   */
  vectorSearch(userId, dbName, collection, queryText, topK = 10) {
    const vectorIndexPath = getVectorIndexPath(userId, dbName, collection);
    const indexData = readJSON(vectorIndexPath);

    if (!indexData || !indexData.vectors) {
      return { results: [], count: 0, error: 'Vector index not found' };
    }

    // Generate query embedding
    const queryEmbedding = this.vectorEngine.generateEmbedding(queryText);

    // Find similar vectors
    const results = this.vectorEngine.findSimilarVectors(
      queryEmbedding.vector,
      indexData.vectors,
      topK
    );

    return {
      results: results.map(r => ({
        docId: r.docId,
        similarity: Math.round(r.similarity * 10000) / 10000, // Round to 4 decimals
        keywords: r.embedding.keywords
      })),
      count: results.length,
      queryKeywords: queryEmbedding.keywords
    };
  }

  /**
   * Field value filter (using indexed fields)
   */
  fieldFilter(userId, dbName, collection, fieldName, value) {
    const fieldIndexPath = getFieldIndexPath(userId, dbName, collection);
    const indexData = readJSON(fieldIndexPath);

    if (!indexData || !indexData.fields[fieldName]) {
      return { docIds: [], count: 0 };
    }

    const valueKey = JSON.stringify(value);
    const docIds = indexData.fields[fieldName][valueKey] || [];

    return { docIds, count: docIds.length };
  }

  /**
   * Combined search: vector + field filter
   */
  combinedSearch(userId, dbName, collection, documents, query, fieldFilters = {}, topK = 10) {
    // Start with vector search
    const vectorResults = this.vectorSearch(userId, dbName, collection, query, topK * 2);
    
    if (vectorResults.error) {
      return { results: [], error: vectorResults.error };
    }

    // Apply field filters
    let filtered = vectorResults.results;
    for (const [field, value] of Object.entries(fieldFilters)) {
      const fieldResults = this.fieldFilter(userId, dbName, collection, field, value);
      const allowedIds = new Set(fieldResults.docIds);
      filtered = filtered.filter(r => allowedIds.has(r.docId));
    }

    // Return top K after filtering
    return {
      results: filtered.slice(0, topK),
      count: filtered.length,
      appliedFilters: Object.keys(fieldFilters).length
    };
  }

  /**
   * Rebuild all indexes for a collection
   */
  rebuildIndexes(userId, dbName, collection, documents) {
    const vectorIndex = this.createVectorIndex(userId, dbName, collection, documents);
    const fieldIndex = this.createFieldIndex(userId, dbName, collection, documents);

    return {
      vectorIndexSize: vectorIndex.length,
      fieldIndexSize: Object.keys(fieldIndex).length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get index statistics
   */
  getIndexStats(userId, dbName, collection) {
    const vectorIndexPath = getVectorIndexPath(userId, dbName, collection);
    const fieldIndexPath = getFieldIndexPath(userId, dbName, collection);

    const vectorData = readJSON(vectorIndexPath);
    const fieldData = readJSON(fieldIndexPath);

    return {
      vector: vectorData ? {
        size: vectorData.documentCount,
        dimensions: 384,
        stats: vectorData.stats,
        createdAt: vectorData.createdAt
      } : null,
      field: fieldData ? {
        size: fieldData.documentCount,
        indexedFields: fieldData.indexedFields,
        createdAt: fieldData.createdAt
      } : null
    };
  }

  /**
   * Get recommendations based on similar documents
   */
  getRecommendations(userId, dbName, collection, documents, docId, topK = 5) {
    // Find the target document
    const targetDoc = documents.find(d => d._id === docId);
    if (!targetDoc) {
      return { recommendations: [], error: 'Document not found' };
    }

    // Extract text from document
    const textContent = [
      targetDoc.text,
      targetDoc.content,
      targetDoc.body,
      targetDoc.description,
      JSON.stringify(targetDoc)
    ].filter(t => t).join(' ');

    // Search for similar documents
    const results = this.vectorSearch(userId, dbName, collection, textContent, topK + 1);

    // Filter out the document itself
    const recommendations = results.results
      .filter(r => r.docId !== docId)
      .slice(0, topK);

    return {
      recommendations,
      count: recommendations.length,
      baseDocId: docId
    };
  }

  /**
   * Batch search across multiple collections
   */
  batchVectorSearch(userId, dbName, collections, queryText, topK = 10) {
    const results = {};

    collections.forEach(collection => {
      const searchResults = this.vectorSearch(userId, dbName, collection, queryText, topK);
      results[collection] = searchResults;
    });

    return results;
  }

  /**
   * Export embeddings for external use (ML, visualization, etc.)
   */
  exportEmbeddings(userId, dbName, collection, format = 'json') {
    const vectorIndexPath = getVectorIndexPath(userId, dbName, collection);
    const indexData = readJSON(vectorIndexPath);

    if (!indexData || !indexData.vectors) {
      return null;
    }

    if (format === 'csv') {
      // CSV format: docId, keywords, similarity scores
      const header = 'docId,keywords,vectorDimension\n';
      const rows = indexData.vectors.map(v => {
        return `${v.docId},"${v.embedding.keywords.join(', ')}",${v.embedding.vector.length}`;
      });
      return header + rows.join('\n');
    }

    // Default JSON format
    return {
      collection,
      documentCount: indexData.documentCount,
      vectorDimension: 384,
      embeddings: indexData.vectors.map(v => ({
        docId: v.docId,
        keywords: v.embedding.keywords,
        vector: v.embedding.vector
      }))
    };
  }
}

module.exports = IndexManager;
