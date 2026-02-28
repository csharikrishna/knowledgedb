/**
 * Vector Embedding Engine
 * Generates semantic embeddings for documents to enable vector-based search
 * Uses TF-IDF + semantic hashing for efficient similarity search
 */

const crypto = require('crypto');

class VectorEngine {
  constructor() {
    this.vocabulary = new Map(); // term -> term-id
    this.termWeights = new Map(); // term -> IDF weight
    this.dimensions = 384; // embedding dimension (can be tuned)
    this.hashFunctions = this.initHashFunctions();
  }

  /**
   * Initialize multiple hash functions for LSH (Locality Sensitive Hashing)
   */
  initHashFunctions() {
    const functions = [];
    for (let i = 0; i < 20; i++) {
      functions.push((x) => {
        const hash = crypto.createHash('sha256');
        hash.update(x + '_' + i);
        return parseInt(hash.digest('hex').substring(0, 8), 16) % 1000000;
      });
    }
    return functions;
  }

  /**
   * Preprocess text for embedding
   */
  preprocessText(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.isStopword(word));
  }

  /**
   * Check if word is a stopword
   */
  isStopword(word) {
    const stopwords = new Set([
      'the', 'and', 'or', 'not', 'a', 'an', 'is', 'are', 'was', 'were',
      'be', 'been', 'to', 'for', 'of', 'in', 'on', 'at', 'by', 'from',
      'as', 'it', 'with', 'that', 'this', 'these', 'those', 'what', 'which',
      'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'no',
      'such', 'if', 'else', 'can', 'could', 'would', 'should', 'may', 'might'
    ]);
    return stopwords.has(word);
  }

  /**
   * Generate TF-IDF vector from text
   */
  generateEmbedding(text, documentCount = 1) {
    const tokens = this.preprocessText(text);
    if (tokens.length === 0) {
      return {
        vector: new Array(this.dimensions).fill(0),
        tokens,
        magnitude: 0,
        hash: 0
      };
    }

    // Initialize vocabulary if needed
    tokens.forEach(term => {
      if (!this.vocabulary.has(term)) {
        this.vocabulary.set(term, this.vocabulary.size);
      }
    });

    // Calculate TF (term frequency)
    const tf = new Map();
    for (const term of tokens) {
      tf.set(term, (tf.get(term) || 0) + 1);
    }

    // Normalize TF
    const maxTf = Math.max(...tf.values());
    tf.forEach((val, key) => {
      tf.set(key, val / maxTf);
    });

    // Calculate IDF (inverse document frequency) weights
    tokens.forEach(term => {
      if (!this.termWeights.has(term)) {
        this.termWeights.set(term, 1);
      }
    });

    // Create vector using hash-based projection
    const vector = new Array(this.dimensions).fill(0);
    let magnitude = 0;

    for (const term of tokens) {
      const tf_val = tf.get(term);
      const idf_val = this.termWeights.get(term) || 1;
      const weight = tf_val * Math.log(1 + idf_val);
      
      // Project term into vector space using multiple hash functions
      const termVector = this.hashTermToVector(term, weight);
      for (let i = 0; i < this.dimensions; i++) {
        vector[i] += termVector[i];
      }
      magnitude += weight * weight;
    }

    magnitude = Math.sqrt(magnitude);

    // Normalize vector
    if (magnitude > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        vector[i] /= magnitude;
      }
    }

    return {
      vector,
      tokens,
      magnitude,
      hash: this.computeLSH(vector),
      termFrequency: Object.fromEntries(tf),
      keywords: tokens.slice(0, 10) // Top keywords
    };
  }

  /**
   * Hash term to vector space
   */
  hashTermToVector(term, weight) {
    const vector = new Array(this.dimensions).fill(0);
    const hash = crypto.createHash('sha256').update(term).digest('hex');
    
    for (let i = 0; i < this.dimensions; i++) {
      const charIndex = (i * 2) % hash.length;
      const charPair = hash.substring(charIndex, charIndex + 2);
      const value = parseInt(charPair, 16) / 255;
      vector[i] = (value - 0.5) * 2 * weight; // Centered value weighted by frequency
    }
    
    return vector;
  }

  /**
   * Compute Locality Sensitive Hash for fast approximate nearest neighbor search
   */
  computeLSH(vector) {
    const hashes = this.hashFunctions.map(hashFunc => {
      let hashValue = 0;
      for (let i = 0; i < this.dimensions; i++) {
        hashValue += hashFunc(vector[i].toString()) * (i + 1);
      }
      return hashValue % 100000;
    });
    return hashes.join('_');
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (mag1 * mag2);
  }

  /**
   * Find most similar vectors using LSH (Locality Sensitive Hashing)
   * Much faster than exhaustive search for large datasets
   */
  findSimilarVectors(queryVector, vectorIndex, topK = 10) {
    const queryHash = this.computeLSH(queryVector);
    const candidates = [];

    // First: Get candidates from same hash bucket (very fast)
    const hashBuckets = this.groupVectorsByHash(vectorIndex);
    const queryPrefix = queryHash.split('_')[0];
    
    for (const [hash, vectors] of hashBuckets) {
      if (hash.startsWith(queryPrefix.substring(0, 5))) {
        candidates.push(...vectors);
      }
    }

    // If too few candidates, expand search
    if (candidates.length < topK * 2) {
      candidates.push(...vectorIndex);
    }

    // Calculate similarities
    const similarities = candidates
      .map((item, idx) => ({
        ...item,
        similarity: this.cosineSimilarity(queryVector, item.embedding.vector)
      }))
      .filter(item => item.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    return similarities;
  }

  /**
   * Group vectors by LSH hash (for faster lookup)
   */
  groupVectorsByHash(vectorIndex) {
    const buckets = new Map();
    for (const item of vectorIndex) {
      const hash = item.embedding.hash;
      if (!buckets.has(hash)) {
        buckets.set(hash, []);
      }
      buckets.get(hash).push(item);
    }
    return buckets;
  }

  /**
   * Batch embed multiple documents
   */
  batchEmbed(documents, textFields = ['text', 'content', 'body', 'description']) {
    return documents.map(doc => {
      // Extract text from multiple possible fields
      let text = '';
      for (const field of textFields) {
        if (doc[field]) {
          text += ' ' + doc[field];
        }
      }
      
      return {
        docId: doc._id || doc.id,
        collection: doc._collection,
        embedding: this.generateEmbedding(text || JSON.stringify(doc))
      };
    });
  }

  /**
   * Update IDF weights based on corpus statistics
   */
  updateIDFWeights(allDocuments) {
    const documentFrequency = new Map();
    const totalDocs = allDocuments.length;

    // Count document frequency
    allDocuments.forEach(doc => {
      const tokens = new Set(this.preprocessText(doc));
      tokens.forEach(term => {
        documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
      });
    });

    // Update IDF weights
    documentFrequency.forEach((df, term) => {
      const idf = Math.log(totalDocs / (1 + df));
      this.termWeights.set(term, idf);
    });
  }

  /**
   * Get embedding statistics for analysis
   */
  getEmbeddingStats(embeddings) {
    if (embeddings.length === 0) {
      return {
        count: 0,
        avgMagnitude: 0,
        vectorSpace: this.dimensions,
        vocabularySize: this.vocabulary.size
      };
    }

    const magnitudes = embeddings.map(e => e.magnitude);
    const avgMagnitude = magnitudes.reduce((a, b) => a + b) / magnitudes.length;

    return {
      count: embeddings.length,
      avgMagnitude,
      maxMagnitude: Math.max(...magnitudes),
      minMagnitude: Math.min(...magnitudes),
      vectorSpace: this.dimensions,
      vocabularySize: this.vocabulary.size,
      avgTokensPerDoc: embeddings.reduce((sum, e) => sum + e.tokens.length, 0) / embeddings.length
    };
  }
}

module.exports = VectorEngine;
