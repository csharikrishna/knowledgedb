# Vector Embeddings & Advanced Indexing Documentation

## Overview

KnowledgeDB now includes sophisticated vector embedding and indexing capabilities for semantic search, AI-powered retrieval, and machine learning integration.

## Key Features

### 1. **Vector Embeddings**
- TF-IDF based semantic embeddings (256-dimensional vectors)
- Locality Sensitive Hashing (LSH) for fast approximate nearest neighbor search
- Automatic vocabulary building from document corpus
- Per-document keyword extraction and frequency analysis

### 2. **Advanced Indexing**
- **Vector Index**: Semantic similarity search on embeddings
- **Field Index**: Fast filtering on document fields
- **Hybrid Index**: Combination of keyword, graph, and vector search
- Automatic index updates on document insertion

### 3. **Search Capabilities**
- Vector similarity search
- Enhanced hybrid search with configurable weights
- LLM-optimized context retrieval (RAG pipeline)
- Batch search across collections
- Recommendations based on document similarity

## API Endpoints

### Vector Search

#### POST `/db/{dbName}/vector/search`
Semantic search using vector embeddings.

**Request:**
```json
{
  "query": "machine learning algorithms",
  "collections": ["articles", "papers"],
  "limit": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "docId": "doc-123",
      "collection": "articles",
      "similarity": 0.8234,
      "keywords": ["machine", "learning", "algorithms"]
    }
  ],
  "total": 5,
  "searchType": "vector-semantic"
}
```

### Enhanced Hybrid Search

#### POST `/db/{dbName}/hybrid/enhanced`
Combines keyword, graph, and vector search with configurable weights.

**Request:**
```json
{
  "query": "data processing",
  "weightKeyword": 0.3,
  "weightGraph": 0.3,
  "weightVector": 0.4,
  "limit": 20
}
```

**Response:**
```json
{
  "results": [
    {
      "document": { ... },
      "collection": "docs",
      "scores": {
        "keyword": 85,
        "graph": 72,
        "vector": 89,
        "hybrid": 81
      }
    }
  ],
  "breakdown": {
    "keyword": 30,
    "graph": 30,
    "vector": 40
  }
}
```

### Find Similar Documents

#### POST `/db/{dbName}/{collection}/similar`
Find semantically similar documents.

**Request:**
```json
{
  "docId": "doc-123",
  "limit": 5
}
```

**Response:**
```json
{
  "baseDocId": "doc-123",
  "similarDocuments": [
    {
      "docId": "doc-456",
      "similarity": 0.87,
      "keywords": ["algorithm", "neural", "network"],
      "document": { ... }
    }
  ],
  "count": 3
}
```

### Build Vector Index

#### POST `/db/{dbName}/{collection}/index/build`
Manually build or rebuild vector indexes for a collection.

**Request:**
```json
{}
```

**Response:**
```json
{
  "message": "Vector index built successfully",
  "collection": "articles",
  "vectorIndexSize": 1250,
  "fieldIndexSize": 35,
  "timestamp": "2026-02-28T..."
}
```

### Index Statistics

#### GET `/db/{dbName}/{collection}/index/stats`
Get detailed index statistics.

**Response:**
```json
{
  "collection": "articles",
  "indexes": {
    "vector": {
      "size": 1250,
      "dimensions": 384,
      "stats": {
        "count": 1250,
        "avgMagnitude": 0.94,
        "maxMagnitude": 1.0,
        "minMagnitude": 0.23,
        "vectorSpace": 384,
        "vocabularySize": 8932,
        "avgTokensPerDoc": 145
      },
      "createdAt": "2026-02-28T..."
    },
    "field": {
      "size": 1250,
      "indexedFields": ["title", "author", "category", "date"],
      "createdAt": "2026-02-28T..."
    }
  }
}
```

### Export Embeddings

#### GET `/db/{dbName}/{collection}/embeddings/export?format=json`
Export embeddings for ML/analysis.

**Formats:**
- `json`: Full embeddings with vectors
- `csv`: Lightweight format with docId and keywords

**Response (JSON):**
```json
{
  "collection": "articles",
  "documentCount": 1250,
  "vectorDimension": 384,
  "embeddings": [
    {
      "docId": "doc-123",
      "keywords": ["ai", "neural", "network"],
      "vector": [0.23, -0.45, 0.67, ...]
    }
  ]
}
```

### LLM Context Retrieval (RAG)

#### POST `/db/{dbName}/retrieve-for-llm`
Retrieve optimal context for LLM consumption in RAG pipelines.

**Request:**
```json
{
  "query": "What are the latest advances in NLP?",
  "contextLimit": 10,
  "collections": ["papers", "articles"]
}
```

**Response:**
```json
{
  "query": "What are the latest advances in NLP?",
  "contextChunks": [
    {
      "text": "{ ... full document JSON ... }",
      "source": "papers/doc-123",
      "relevance": 0.92,
      "type": "vector",
      "keywords": ["NLP", "transformer", "BERT"],
      "rank": 1
    }
  ],
  "llmPromptContext": "[Context 1] (vector, relevance: 92%)\n{ ... document ... }\n\n---\n\n[Context 2] ...",
  "chunkCount": 8,
  "averageRelevance": 85,
  "usage": "Use llmPromptContext as system context for your LLM"
}
```

## How Vector Embeddings Work

### 1. **Term Frequency-Inverse Document Frequency (TF-IDF)**
- Measures importance of terms within each document
- Automatically weights common vs. rare terms
- Updates IDF weights based on corpus statistics

### 2. **Vector Generation**
- Preprocessed text → tokens (removing stopwords)
- Each term is hashed to vector space
- Final vector = weighted sum of term vectors
- Normalized to unit length

### 3. **Locality Sensitive Hashing (LSH)**
- Creates hash signatures for vectors
- Groups similar vectors in same hash bucket
- Enables sub-linear time approximate nearest neighbor search
- Much faster than exhaustive similarity computation

### 4. **Similarity Calculation**
- Cosine similarity between query and document vectors
- Scores range: 0 (no similarity) to 1 (identical)
- Fast computation using normalized vectors

## Configuration & Tuning

### Vector Dimension
```javascript
// In vectorEngine.js
this.dimensions = 384; // Adjust based on performance needs
```
- Higher = more expressive but slower
- Lower = faster but less accurate
- Default 384 balances both concerns

### LSH Parameters
```javascript
// Number of hash functions
const functions = [];
for (let i = 0; i < 20; i++) { ... }
```
- More functions = better buckets but slower hashing
- Fewer = faster but more candidates in buckets

### Search Weights
```json
{
  "weightKeyword": 0.3,
  "weightGraph": 0.3,
  "weightVector": 0.4
}
```
- Adjust based on use case
- Keyword: Fast, exact matches
- Graph: Relationship-based relevance
- Vector: Semantic similarity

## Performance Characteristics

### Indexing
- **Build time**: O(n log n) where n = document count
- **Memory**: ~50KB per document for vectors
- **Incremental**: New documents indexed automatically

### Search
- **Vector search**: O(k) where k = LSH bucket size (typically << n)
- **Hybrid search**: O(k) + O(log n) for graph
- **Typical query time**: 10-50ms for 10K documents

### Storage
- **Vector index**: ~50KB per document
- **Field index**: ~5KB per document per indexed field
- **Total**: ~55-100KB per document depending on schema

## AI Integration Examples

### 1. **RAG Pipeline with LLM**
```python
# Retrieve context
response = requests.post('/db/mydb/retrieve-for-llm', {
  'query': user_question,
  'contextLimit': 10
})

# Use in LLM prompt
llm_context = response['llmPromptContext']
messages = [
  {'role': 'system', 'content': llm_context},
  {'role': 'user', 'content': user_question}
]
```

### 2. **Semantic Search with Filtering**
```javascript
// Find similar articles by an author
const results = await fetch('/db/mydb/articles/similar', {
  method: 'POST',
  body: JSON.stringify({
    docId: 'article-123',
    limit: 10
    // Use field filters in combined search
  })
});
```

### 3. **Content Recommendation**
```javascript
// Get recommendations for a user's viewed document
const recommendations = await fetch('/db/mydb/documents/similar', {
  method: 'POST',
  body: JSON.stringify({
    docId: viewer.lastViewedDoc,
    limit: 5
  })
});
```

### 4. **Batch Analysis**
```python
# Export embeddings for analysis/visualization
embeddings = requests.get('/db/mydb/articles/embeddings/export?format=json')

# Use with dimensionality reduction (t-SNE, UMAP)
# for clustering or visualization
```

## Best Practices

### 1. **Index Management**
- Build indexes after bulk inserts
- Update weights when corpus changes significantly
- Monitor index stats for optimization opportunities

### 2. **Search Strategy**
- Use vector search for semantic/fuzzy matching
- Use keyword search for exact matches
- Combine both for best results
- Adjust weights based on results quality

### 3. **LLM Integration**
- Always use retrieve-for-llm for RAG
- Limit context chunks to avoid token limits
- Validate context quality with relevance scores
- Test different search weights

### 4. **File Fields for Embedding**
Automatic text extraction from common field names:
- `text`, `content`, `body`, `description`
- Falls back to JSON stringification of entire document
- Customize in `vectorEngine.batchEmbed()`

## Troubleshooting

### Slow Vector Search
- Check index size with `/index/stats`
- LSH bucket sizes might be off (too many candidates)
- Consider reducing query limit or adding field filters

### Low Search Quality
- Verify relevant documents exist
- Check `avgMagnitude` in stats (should be ~0.9)
- Adjust search weights for your use case
- Expand `limit` to see more candidates

### Index Cache Issues
- Manually rebuild with `/index/build` if updates lag
- Clear old vector files from `_vectors/` directory
- Restart server if memory is corrupted

## Future Enhancements

1. **ML-based Transformers**: Integration with sentence-transformers
2. **Approximate neighbors**: More sophisticated ANN algorithms
3. **Clustering**: Automatic document clustering using vectors
4. **Dimensionality reduction**: t-SNE/UMAP export for visualization
5. **Cross-lingual**: Multilingual embedding support
6. **Incremental updates**: Streaming vector updates for real-time indexing

## API Key Permissions

Vector operations require appropriate API key scopes:
- `vector/search`: requires 'read'
- `index/build`: requires 'write'
- `embeddings/export`: requires 'read'
- `retrieve-for-llm`: requires 'read'

## Examples

See [VECTOR_EXAMPLES.md](./VECTOR_EXAMPLES.md) for complete code examples in JavaScript, Python, and cURL.
